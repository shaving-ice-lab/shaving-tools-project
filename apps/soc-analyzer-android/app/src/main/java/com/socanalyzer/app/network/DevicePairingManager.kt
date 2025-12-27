package com.socanalyzer.app.network

import android.content.Context
import android.graphics.Bitmap
import android.os.Build
import android.util.Log
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.net.Inet4Address
import java.net.NetworkInterface
import java.security.SecureRandom
import java.util.*

@Serializable
data class PairingInfo(
    val deviceId: String,
    val deviceName: String,
    val deviceModel: String,
    val ipAddress: String,
    val wsPort: Int,
    val adbPort: Int,
    val pairingCode: String,
    val timestamp: Long,
    val appVersion: String = "1.0.0"
)

@Serializable
data class PairingRequest(
    val type: String = "pairing_request",
    val pairingCode: String,
    val pcName: String,
    val pcId: String
)

@Serializable
data class PairingResponse(
    val type: String = "pairing_response",
    val success: Boolean,
    val message: String,
    val deviceInfo: PairingInfo? = null
)

sealed class PairingState {
    object Idle : PairingState()
    object GeneratingCode : PairingState()
    data class WaitingForConnection(val pairingInfo: PairingInfo, val qrBitmap: Bitmap?) : PairingState()
    data class PairingInProgress(val pcName: String) : PairingState()
    data class Paired(val pcName: String, val pcId: String) : PairingState()
    data class Error(val message: String) : PairingState()
}

class DevicePairingManager(
    private val context: Context,
    private val wsPort: Int = 38300,
    private val adbPort: Int = 38300
) {
    companion object {
        private const val TAG = "DevicePairingManager"
        private const val PAIRING_CODE_LENGTH = 6
        private const val PAIRING_TIMEOUT_MS = 300000L
        private const val QR_CODE_SIZE = 512
        private const val PREFS_NAME = "pairing_prefs"
        private const val KEY_DEVICE_ID = "device_id"
        private const val KEY_PAIRED_DEVICES = "paired_devices"
    }

    private val json = Json { ignoreUnknownKeys = true; prettyPrint = false }
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private var pairingTimeoutJob: Job? = null

    private val _pairingState = MutableStateFlow<PairingState>(PairingState.Idle)
    val pairingState: StateFlow<PairingState> = _pairingState

    private var currentPairingCode: String? = null
    private val pairedDevices = mutableMapOf<String, String>()

    private val prefs by lazy {
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    init {
        loadPairedDevices()
    }

    fun generatePairingInfo(): PairingInfo {
        _pairingState.value = PairingState.GeneratingCode

        val pairingCode = generatePairingCode()
        currentPairingCode = pairingCode

        val pairingInfo = PairingInfo(
            deviceId = getOrCreateDeviceId(),
            deviceName = "${Build.MANUFACTURER} ${Build.MODEL}",
            deviceModel = Build.MODEL,
            ipAddress = getLocalIpAddress() ?: "unknown",
            wsPort = wsPort,
            adbPort = adbPort,
            pairingCode = pairingCode,
            timestamp = System.currentTimeMillis()
        )

        val qrBitmap = generateQRCode(json.encodeToString(pairingInfo))

        _pairingState.value = PairingState.WaitingForConnection(pairingInfo, qrBitmap)

        startPairingTimeout()

        return pairingInfo
    }

    private fun generatePairingCode(): String {
        val random = SecureRandom()
        val code = StringBuilder()
        repeat(PAIRING_CODE_LENGTH) {
            code.append(random.nextInt(10))
        }
        return code.toString()
    }

    private fun generateQRCode(content: String): Bitmap? {
        return try {
            val writer = QRCodeWriter()
            val bitMatrix = writer.encode(content, BarcodeFormat.QR_CODE, QR_CODE_SIZE, QR_CODE_SIZE)
            val width = bitMatrix.width
            val height = bitMatrix.height
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565)

            for (x in 0 until width) {
                for (y in 0 until height) {
                    bitmap.setPixel(x, y, if (bitMatrix[x, y]) 0xFF000000.toInt() else 0xFFFFFFFF.toInt())
                }
            }
            bitmap
        } catch (e: Exception) {
            Log.e(TAG, "Failed to generate QR code: ${e.message}")
            null
        }
    }

    fun handlePairingRequest(requestJson: String): PairingResponse {
        return try {
            val request = json.decodeFromString<PairingRequest>(requestJson)

            if (request.pairingCode != currentPairingCode) {
                return PairingResponse(
                    success = false,
                    message = "Invalid pairing code"
                )
            }

            _pairingState.value = PairingState.PairingInProgress(request.pcName)

            pairedDevices[request.pcId] = request.pcName
            savePairedDevices()

            cancelPairingTimeout()

            val currentState = _pairingState.value
            val pairingInfo = if (currentState is PairingState.WaitingForConnection) {
                currentState.pairingInfo
            } else {
                null
            }

            _pairingState.value = PairingState.Paired(request.pcName, request.pcId)
            currentPairingCode = null

            PairingResponse(
                success = true,
                message = "Pairing successful",
                deviceInfo = pairingInfo
            )
        } catch (e: Exception) {
            Log.e(TAG, "Failed to handle pairing request: ${e.message}")
            PairingResponse(
                success = false,
                message = "Invalid pairing request: ${e.message}"
            )
        }
    }

    fun cancelPairing() {
        cancelPairingTimeout()
        currentPairingCode = null
        _pairingState.value = PairingState.Idle
    }

    private fun startPairingTimeout() {
        pairingTimeoutJob?.cancel()
        pairingTimeoutJob = scope.launch {
            delay(PAIRING_TIMEOUT_MS)
            if (_pairingState.value is PairingState.WaitingForConnection) {
                _pairingState.value = PairingState.Error("Pairing timeout")
                currentPairingCode = null
            }
        }
    }

    private fun cancelPairingTimeout() {
        pairingTimeoutJob?.cancel()
        pairingTimeoutJob = null
    }

    fun isPaired(pcId: String): Boolean {
        return pairedDevices.containsKey(pcId)
    }

    fun getPairedDevices(): Map<String, String> {
        return pairedDevices.toMap()
    }

    fun removePairedDevice(pcId: String) {
        pairedDevices.remove(pcId)
        savePairedDevices()
    }

    fun clearAllPairedDevices() {
        pairedDevices.clear()
        savePairedDevices()
    }

    private fun getOrCreateDeviceId(): String {
        var deviceId = prefs.getString(KEY_DEVICE_ID, null)
        if (deviceId == null) {
            deviceId = UUID.randomUUID().toString()
            prefs.edit().putString(KEY_DEVICE_ID, deviceId).apply()
        }
        return deviceId
    }

    private fun loadPairedDevices() {
        try {
            val jsonStr = prefs.getString(KEY_PAIRED_DEVICES, null) ?: return
            val devices = json.decodeFromString<Map<String, String>>(jsonStr)
            pairedDevices.clear()
            pairedDevices.putAll(devices)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to load paired devices: ${e.message}")
        }
    }

    private fun savePairedDevices() {
        try {
            val jsonStr = json.encodeToString(pairedDevices.toMap())
            prefs.edit().putString(KEY_PAIRED_DEVICES, jsonStr).apply()
        } catch (e: Exception) {
            Log.e(TAG, "Failed to save paired devices: ${e.message}")
        }
    }

    private fun getLocalIpAddress(): String? {
        try {
            val interfaces = NetworkInterface.getNetworkInterfaces()
            while (interfaces.hasMoreElements()) {
                val networkInterface = interfaces.nextElement()
                if (networkInterface.isLoopback || !networkInterface.isUp) continue

                val addresses = networkInterface.inetAddresses
                while (addresses.hasMoreElements()) {
                    val address = addresses.nextElement()
                    if (address is Inet4Address && !address.isLoopbackAddress) {
                        return address.hostAddress
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get IP address: ${e.message}")
        }
        return null
    }

    fun destroy() {
        cancelPairingTimeout()
        scope.cancel()
    }
}

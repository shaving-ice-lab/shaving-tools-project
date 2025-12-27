package com.socanalyzer.app.network

import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.io.*
import java.net.InetSocketAddress
import java.net.Socket

sealed class AdbConnectionState {
    object Disconnected : AdbConnectionState()
    object Connecting : AdbConnectionState()
    object Connected : AdbConnectionState()
    data class Error(val message: String) : AdbConnectionState()
}

class AdbForwardClient(
    private val port: Int = 38300,
    private val onMessageReceived: (String) -> Unit,
    private val onConnectionStateChanged: (AdbConnectionState) -> Unit
) {
    companion object {
        private const val TAG = "AdbForwardClient"
        private const val LOCALHOST = "127.0.0.1"
        private const val CONNECTION_TIMEOUT_MS = 5000
        private const val READ_BUFFER_SIZE = 8192
        private const val RECONNECT_DELAY_MS = 3000L
    }

    private var socket: Socket? = null
    private var reader: BufferedReader? = null
    private var writer: PrintWriter? = null
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var connectionJob: Job? = null
    private var readJob: Job? = null

    private val _connectionState = MutableStateFlow<AdbConnectionState>(AdbConnectionState.Disconnected)
    val connectionState: StateFlow<AdbConnectionState> = _connectionState

    private var isManualDisconnect = false
    private var autoReconnect = true

    fun connect() {
        if (_connectionState.value == AdbConnectionState.Connected ||
            _connectionState.value == AdbConnectionState.Connecting) {
            return
        }

        isManualDisconnect = false
        doConnect()
    }

    private fun doConnect() {
        connectionJob?.cancel()
        connectionJob = scope.launch {
            try {
                _connectionState.value = AdbConnectionState.Connecting
                onConnectionStateChanged(AdbConnectionState.Connecting)

                socket = Socket().apply {
                    soTimeout = 0
                    connect(InetSocketAddress(LOCALHOST, port), CONNECTION_TIMEOUT_MS)
                }

                reader = BufferedReader(InputStreamReader(socket!!.getInputStream()))
                writer = PrintWriter(BufferedWriter(OutputStreamWriter(socket!!.getOutputStream())), true)

                Log.d(TAG, "ADB forward connection established on port $port")
                _connectionState.value = AdbConnectionState.Connected
                onConnectionStateChanged(AdbConnectionState.Connected)

                startReadLoop()

            } catch (e: Exception) {
                Log.e(TAG, "ADB connection failed: ${e.message}")
                _connectionState.value = AdbConnectionState.Error(e.message ?: "Connection failed")
                onConnectionStateChanged(AdbConnectionState.Error(e.message ?: "Connection failed"))
                
                if (!isManualDisconnect && autoReconnect) {
                    delay(RECONNECT_DELAY_MS)
                    doConnect()
                }
            }
        }
    }

    private fun startReadLoop() {
        readJob?.cancel()
        readJob = scope.launch {
            try {
                val buffer = CharArray(READ_BUFFER_SIZE)
                val messageBuilder = StringBuilder()

                while (isActive && socket?.isConnected == true) {
                    val bytesRead = withContext(Dispatchers.IO) {
                        reader?.read(buffer) ?: -1
                    }

                    if (bytesRead == -1) {
                        throw IOException("Connection closed by server")
                    }

                    messageBuilder.append(buffer, 0, bytesRead)

                    var newlineIndex: Int
                    while (messageBuilder.indexOf("\n").also { newlineIndex = it } != -1) {
                        val message = messageBuilder.substring(0, newlineIndex)
                        messageBuilder.delete(0, newlineIndex + 1)

                        if (message.isNotEmpty()) {
                            withContext(Dispatchers.Main) {
                                onMessageReceived(message)
                            }
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Read error: ${e.message}")
                handleDisconnection()
            }
        }
    }

    private fun handleDisconnection() {
        closeConnection()

        if (!isManualDisconnect && autoReconnect) {
            scope.launch {
                delay(RECONNECT_DELAY_MS)
                doConnect()
            }
        } else {
            _connectionState.value = AdbConnectionState.Disconnected
            onConnectionStateChanged(AdbConnectionState.Disconnected)
        }
    }

    private fun closeConnection() {
        try {
            readJob?.cancel()
            reader?.close()
            writer?.close()
            socket?.close()
        } catch (e: Exception) {
            Log.e(TAG, "Error closing connection: ${e.message}")
        } finally {
            reader = null
            writer = null
            socket = null
        }
    }

    fun send(message: String): Boolean {
        return try {
            if (_connectionState.value == AdbConnectionState.Connected && writer != null) {
                scope.launch(Dispatchers.IO) {
                    writer?.println(message)
                    writer?.flush()
                }
                true
            } else {
                false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Send error: ${e.message}")
            false
        }
    }

    fun sendBlocking(message: String): Boolean {
        return try {
            if (_connectionState.value == AdbConnectionState.Connected && writer != null) {
                writer?.println(message)
                writer?.flush()
                true
            } else {
                false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Send error: ${e.message}")
            false
        }
    }

    fun disconnect() {
        isManualDisconnect = true
        autoReconnect = false
        connectionJob?.cancel()
        readJob?.cancel()
        closeConnection()
        _connectionState.value = AdbConnectionState.Disconnected
        onConnectionStateChanged(AdbConnectionState.Disconnected)
    }

    fun setAutoReconnect(enabled: Boolean) {
        autoReconnect = enabled
    }

    fun isConnected(): Boolean = _connectionState.value == AdbConnectionState.Connected

    fun destroy() {
        disconnect()
        scope.cancel()
    }
}

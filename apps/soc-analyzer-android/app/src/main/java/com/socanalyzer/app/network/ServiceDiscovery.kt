package com.socanalyzer.app.network

import android.content.Context
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.net.SocketTimeoutException

data class DiscoveredService(
    val name: String,
    val host: String,
    val port: Int,
    val type: String,
    val attributes: Map<String, String> = emptyMap()
)

sealed class DiscoveryState {
    object Idle : DiscoveryState()
    object Discovering : DiscoveryState()
    data class Found(val services: List<DiscoveredService>) : DiscoveryState()
    data class Error(val message: String) : DiscoveryState()
}

class ServiceDiscovery(private val context: Context) {
    companion object {
        private const val TAG = "ServiceDiscovery"
        private const val NSD_SERVICE_TYPE = "_socanalyzer._tcp."
        private const val UDP_DISCOVERY_PORT = 38301
        private const val UDP_BROADCAST_MESSAGE = "SOC_ANALYZER_DISCOVER"
        private const val UDP_RESPONSE_PREFIX = "SOC_ANALYZER_SERVER:"
        private const val DISCOVERY_TIMEOUT_MS = 5000L
        private const val UDP_SOCKET_TIMEOUT_MS = 1000
    }

    private val nsdManager: NsdManager by lazy {
        context.getSystemService(Context.NSD_SERVICE) as NsdManager
    }

    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var discoveryListener: NsdManager.DiscoveryListener? = null
    private var isDiscovering = false

    private val _discoveryState = MutableStateFlow<DiscoveryState>(DiscoveryState.Idle)
    val discoveryState: StateFlow<DiscoveryState> = _discoveryState

    private val discoveredServices = mutableListOf<DiscoveredService>()

    fun startDiscovery() {
        if (isDiscovering) return

        _discoveryState.value = DiscoveryState.Discovering
        discoveredServices.clear()

        scope.launch {
            val jobs = listOf(
                async { discoverViaNsd() },
                async { discoverViaUdpBroadcast() }
            )

            delay(DISCOVERY_TIMEOUT_MS)
            jobs.forEach { it.cancel() }

            if (discoveredServices.isNotEmpty()) {
                _discoveryState.value = DiscoveryState.Found(discoveredServices.toList())
            } else {
                _discoveryState.value = DiscoveryState.Error("No services found")
            }

            stopNsdDiscovery()
        }
    }

    private suspend fun discoverViaNsd() {
        try {
            discoveryListener = object : NsdManager.DiscoveryListener {
                override fun onDiscoveryStarted(serviceType: String) {
                    Log.d(TAG, "NSD discovery started for $serviceType")
                    isDiscovering = true
                }

                override fun onServiceFound(serviceInfo: NsdServiceInfo) {
                    Log.d(TAG, "NSD service found: ${serviceInfo.serviceName}")
                    resolveService(serviceInfo)
                }

                override fun onServiceLost(serviceInfo: NsdServiceInfo) {
                    Log.d(TAG, "NSD service lost: ${serviceInfo.serviceName}")
                    discoveredServices.removeAll { it.name == serviceInfo.serviceName }
                }

                override fun onDiscoveryStopped(serviceType: String) {
                    Log.d(TAG, "NSD discovery stopped")
                    isDiscovering = false
                }

                override fun onStartDiscoveryFailed(serviceType: String, errorCode: Int) {
                    Log.e(TAG, "NSD discovery start failed: $errorCode")
                    isDiscovering = false
                }

                override fun onStopDiscoveryFailed(serviceType: String, errorCode: Int) {
                    Log.e(TAG, "NSD discovery stop failed: $errorCode")
                }
            }

            withContext(Dispatchers.Main) {
                nsdManager.discoverServices(NSD_SERVICE_TYPE, NsdManager.PROTOCOL_DNS_SD, discoveryListener)
            }

            delay(DISCOVERY_TIMEOUT_MS)
        } catch (e: Exception) {
            Log.e(TAG, "NSD discovery error: ${e.message}")
        }
    }

    private fun resolveService(serviceInfo: NsdServiceInfo) {
        nsdManager.resolveService(serviceInfo, object : NsdManager.ResolveListener {
            override fun onResolveFailed(serviceInfo: NsdServiceInfo, errorCode: Int) {
                Log.e(TAG, "NSD resolve failed: $errorCode")
            }

            override fun onServiceResolved(serviceInfo: NsdServiceInfo) {
                Log.d(TAG, "NSD service resolved: ${serviceInfo.host?.hostAddress}:${serviceInfo.port}")

                val service = DiscoveredService(
                    name = serviceInfo.serviceName,
                    host = serviceInfo.host?.hostAddress ?: "",
                    port = serviceInfo.port,
                    type = "nsd"
                )

                if (!discoveredServices.any { it.host == service.host && it.port == service.port }) {
                    discoveredServices.add(service)
                    _discoveryState.value = DiscoveryState.Found(discoveredServices.toList())
                }
            }
        })
    }

    private suspend fun discoverViaUdpBroadcast() = withContext(Dispatchers.IO) {
        var socket: DatagramSocket? = null
        try {
            socket = DatagramSocket().apply {
                broadcast = true
                soTimeout = UDP_SOCKET_TIMEOUT_MS
            }

            val broadcastAddresses = listOf(
                InetAddress.getByName("255.255.255.255"),
                InetAddress.getByName("192.168.1.255"),
                InetAddress.getByName("192.168.0.255"),
                InetAddress.getByName("10.0.0.255")
            )

            val message = UDP_BROADCAST_MESSAGE.toByteArray()

            broadcastAddresses.forEach { address ->
                try {
                    val packet = DatagramPacket(message, message.size, address, UDP_DISCOVERY_PORT)
                    socket.send(packet)
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to broadcast to $address: ${e.message}")
                }
            }

            val buffer = ByteArray(1024)
            val endTime = System.currentTimeMillis() + DISCOVERY_TIMEOUT_MS

            while (System.currentTimeMillis() < endTime) {
                try {
                    val responsePacket = DatagramPacket(buffer, buffer.size)
                    socket.receive(responsePacket)

                    val response = String(responsePacket.data, 0, responsePacket.length)
                    if (response.startsWith(UDP_RESPONSE_PREFIX)) {
                        val parts = response.removePrefix(UDP_RESPONSE_PREFIX).split(":")
                        if (parts.size >= 2) {
                            val service = DiscoveredService(
                                name = parts.getOrElse(2) { "PC Server" },
                                host = responsePacket.address.hostAddress ?: parts[0],
                                port = parts[1].toIntOrNull() ?: 38300,
                                type = "udp"
                            )

                            if (!discoveredServices.any { it.host == service.host && it.port == service.port }) {
                                discoveredServices.add(service)
                                _discoveryState.value = DiscoveryState.Found(discoveredServices.toList())
                            }
                        }
                    }
                } catch (e: SocketTimeoutException) {
                    continue
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "UDP discovery error: ${e.message}")
        } finally {
            socket?.close()
        }
    }

    private fun stopNsdDiscovery() {
        try {
            discoveryListener?.let {
                if (isDiscovering) {
                    nsdManager.stopServiceDiscovery(it)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping NSD discovery: ${e.message}")
        }
        isDiscovering = false
        discoveryListener = null
    }

    fun stopDiscovery() {
        stopNsdDiscovery()
        _discoveryState.value = DiscoveryState.Idle
    }

    fun getDiscoveredServices(): List<DiscoveredService> {
        return discoveredServices.toList()
    }

    fun destroy() {
        stopDiscovery()
        scope.cancel()
    }
}

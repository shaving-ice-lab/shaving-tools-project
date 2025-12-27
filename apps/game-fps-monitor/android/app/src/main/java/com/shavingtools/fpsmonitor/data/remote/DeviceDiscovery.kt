package com.shavingtools.fpsmonitor.data.remote

import android.content.Context
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.withContext
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.net.InetAddress
import java.net.SocketTimeoutException
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 设备发现服务 - 通过UDP广播和mDNS发现PC端
 */
@Singleton
class DeviceDiscovery @Inject constructor(
    private val context: Context
) {
    companion object {
        private const val TAG = "DeviceDiscovery"
        
        // UDP广播配置
        private const val UDP_BROADCAST_PORT = 9876
        private const val UDP_DISCOVERY_MESSAGE = "FPS_MONITOR_DISCOVER"
        private const val UDP_RESPONSE_PREFIX = "FPS_MONITOR_SERVER:"
        private const val UDP_TIMEOUT_MS = 3000
        
        // mDNS/NSD配置
        private const val NSD_SERVICE_TYPE = "_fpsmonitor._tcp."
        private const val NSD_SERVICE_NAME = "FpsMonitorDesktop"
    }
    
    data class DiscoveredDevice(
        val name: String,
        val host: String,
        val port: Int,
        val version: String = ""
    )
    
    private var nsdManager: NsdManager? = null
    private var discoveryListener: NsdManager.DiscoveryListener? = null
    
    /**
     * 通过UDP广播发现桌面端
     */
    suspend fun discoverViaUdp(): List<DiscoveredDevice> = withContext(Dispatchers.IO) {
        val devices = mutableListOf<DiscoveredDevice>()
        var socket: DatagramSocket? = null
        
        try {
            socket = DatagramSocket()
            socket.broadcast = true
            socket.soTimeout = UDP_TIMEOUT_MS
            
            // 发送广播
            val message = UDP_DISCOVERY_MESSAGE.toByteArray()
            val broadcastAddress = InetAddress.getByName("255.255.255.255")
            val packet = DatagramPacket(message, message.size, broadcastAddress, UDP_BROADCAST_PORT)
            socket.send(packet)
            
            Log.d(TAG, "UDP discovery broadcast sent")
            
            // 接收响应
            val buffer = ByteArray(1024)
            val responsePacket = DatagramPacket(buffer, buffer.size)
            
            val startTime = System.currentTimeMillis()
            while (System.currentTimeMillis() - startTime < UDP_TIMEOUT_MS) {
                try {
                    socket.receive(responsePacket)
                    val response = String(responsePacket.data, 0, responsePacket.length)
                    
                    if (response.startsWith(UDP_RESPONSE_PREFIX)) {
                        val serverInfo = response.removePrefix(UDP_RESPONSE_PREFIX)
                        val parts = serverInfo.split(":")
                        
                        if (parts.size >= 2) {
                            val device = DiscoveredDevice(
                                name = parts.getOrElse(2) { "Desktop" },
                                host = responsePacket.address.hostAddress ?: "",
                                port = parts[1].toIntOrNull() ?: 8080,
                                version = parts.getOrElse(3) { "" }
                            )
                            
                            if (!devices.any { it.host == device.host && it.port == device.port }) {
                                devices.add(device)
                                Log.d(TAG, "Discovered device: ${device.name} at ${device.host}:${device.port}")
                            }
                        }
                    }
                } catch (e: SocketTimeoutException) {
                    // 超时，继续等待
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "UDP discovery error", e)
        } finally {
            socket?.close()
        }
        
        devices
    }
    
    /**
     * 通过mDNS/NSD发现桌面端 (Flow方式)
     */
    fun discoverViaNsd(): Flow<DiscoveredDevice> = callbackFlow {
        nsdManager = context.getSystemService(Context.NSD_SERVICE) as NsdManager
        
        val resolveListener = object : NsdManager.ResolveListener {
            override fun onResolveFailed(serviceInfo: NsdServiceInfo?, errorCode: Int) {
                Log.e(TAG, "NSD resolve failed: $errorCode")
            }
            
            override fun onServiceResolved(serviceInfo: NsdServiceInfo?) {
                serviceInfo?.let { info ->
                    val device = DiscoveredDevice(
                        name = info.serviceName,
                        host = info.host?.hostAddress ?: "",
                        port = info.port,
                        version = info.attributes["version"]?.let { String(it) } ?: ""
                    )
                    trySend(device)
                    Log.d(TAG, "NSD resolved: ${device.name} at ${device.host}:${device.port}")
                }
            }
        }
        
        discoveryListener = object : NsdManager.DiscoveryListener {
            override fun onStartDiscoveryFailed(serviceType: String?, errorCode: Int) {
                Log.e(TAG, "NSD discovery start failed: $errorCode")
            }
            
            override fun onStopDiscoveryFailed(serviceType: String?, errorCode: Int) {
                Log.e(TAG, "NSD discovery stop failed: $errorCode")
            }
            
            override fun onDiscoveryStarted(serviceType: String?) {
                Log.d(TAG, "NSD discovery started")
            }
            
            override fun onDiscoveryStopped(serviceType: String?) {
                Log.d(TAG, "NSD discovery stopped")
            }
            
            override fun onServiceFound(serviceInfo: NsdServiceInfo?) {
                Log.d(TAG, "NSD service found: ${serviceInfo?.serviceName}")
                serviceInfo?.let {
                    if (it.serviceType.contains(NSD_SERVICE_TYPE)) {
                        nsdManager?.resolveService(it, resolveListener)
                    }
                }
            }
            
            override fun onServiceLost(serviceInfo: NsdServiceInfo?) {
                Log.d(TAG, "NSD service lost: ${serviceInfo?.serviceName}")
            }
        }
        
        nsdManager?.discoverServices(NSD_SERVICE_TYPE, NsdManager.PROTOCOL_DNS_SD, discoveryListener)
        
        awaitClose {
            stopNsdDiscovery()
        }
    }.flowOn(Dispatchers.IO)
    
    /**
     * 停止NSD发现
     */
    fun stopNsdDiscovery() {
        try {
            discoveryListener?.let { listener ->
                nsdManager?.stopServiceDiscovery(listener)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping NSD discovery", e)
        }
        discoveryListener = null
    }
    
    /**
     * 验证设备是否可达
     */
    suspend fun verifyDevice(host: String, port: Int): Boolean = withContext(Dispatchers.IO) {
        try {
            val socket = java.net.Socket()
            socket.connect(java.net.InetSocketAddress(host, port), 3000)
            socket.close()
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * 综合发现 - 同时使用UDP和NSD
     */
    suspend fun discoverAll(): List<DiscoveredDevice> = withContext(Dispatchers.IO) {
        val devices = mutableListOf<DiscoveredDevice>()
        
        // UDP发现
        devices.addAll(discoverViaUdp())
        
        // 去重
        devices.distinctBy { "${it.host}:${it.port}" }
    }
}

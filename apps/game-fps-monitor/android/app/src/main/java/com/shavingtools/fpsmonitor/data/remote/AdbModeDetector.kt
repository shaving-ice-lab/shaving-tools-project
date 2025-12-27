package com.shavingtools.fpsmonitor.data.remote

import android.content.Context
import android.os.Build
import android.provider.Settings
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.InetSocketAddress
import java.net.Socket
import javax.inject.Inject
import javax.inject.Singleton

/**
 * ADB模式检测器 - 检测设备是否通过ADB连接到PC
 */
@Singleton
class AdbModeDetector @Inject constructor(
    private val context: Context
) {
    
    data class AdbStatus(
        val isAdbEnabled: Boolean,         // ADB是否启用
        val isUsbDebugging: Boolean,       // USB调试是否开启
        val isWirelessAdb: Boolean,        // 无线ADB是否开启
        val adbPort: Int,                  // ADB端口
        val isConnectedToPC: Boolean,      // 是否连接到PC
        val connectionType: ConnectionType // 连接类型
    )
    
    enum class ConnectionType {
        NONE,           // 未连接
        USB,            // USB连接
        WIRELESS,       // 无线ADB
        USB_AND_WIRELESS // 同时USB和无线
    }
    
    companion object {
        private const val ADB_PORT = 5555
        private const val ADB_FORWARD_PORT_START = 27183
        private const val ADB_FORWARD_PORT_END = 27199
    }
    
    /**
     * 获取ADB状态
     */
    suspend fun getAdbStatus(): AdbStatus = withContext(Dispatchers.IO) {
        val isAdbEnabled = isAdbEnabled()
        val isUsbDebugging = isUsbDebuggingEnabled()
        val isWirelessAdb = isWirelessAdbEnabled()
        val adbPort = getAdbPort()
        val isConnected = checkAdbConnection()
        
        AdbStatus(
            isAdbEnabled = isAdbEnabled,
            isUsbDebugging = isUsbDebugging,
            isWirelessAdb = isWirelessAdb,
            adbPort = adbPort,
            isConnectedToPC = isConnected,
            connectionType = determineConnectionType(isUsbDebugging, isWirelessAdb, isConnected)
        )
    }
    
    /**
     * 检查ADB是否启用
     */
    fun isAdbEnabled(): Boolean {
        return try {
            Settings.Global.getInt(context.contentResolver, Settings.Global.ADB_ENABLED) == 1
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * 检查USB调试是否开启
     */
    fun isUsbDebuggingEnabled(): Boolean {
        return try {
            Settings.Global.getInt(context.contentResolver, Settings.Global.ADB_ENABLED) == 1
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * 检查无线ADB是否开启 (Android 11+)
     */
    fun isWirelessAdbEnabled(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.R) {
            return false
        }
        
        return try {
            // Android 11+ 无线调试
            val adbWifiEnabled = Settings.Global.getInt(
                context.contentResolver,
                "adb_wifi_enabled",
                0
            )
            adbWifiEnabled == 1
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * 获取ADB端口
     */
    fun getAdbPort(): Int {
        return try {
            val port = Settings.Global.getInt(context.contentResolver, "adb_port", -1)
            if (port > 0) port else ADB_PORT
        } catch (e: Exception) {
            ADB_PORT
        }
    }
    
    /**
     * 检查是否有ADB连接
     */
    suspend fun checkAdbConnection(): Boolean = withContext(Dispatchers.IO) {
        // 检查是否有ADB端口转发
        for (port in ADB_FORWARD_PORT_START..ADB_FORWARD_PORT_END) {
            if (isPortOpen("127.0.0.1", port)) {
                return@withContext true
            }
        }
        
        // 检查系统属性
        try {
            val process = Runtime.getRuntime().exec("getprop sys.usb.state")
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            val result = reader.readLine()
            reader.close()
            
            if (result?.contains("adb") == true) {
                return@withContext true
            }
        } catch (e: Exception) {
            // 忽略
        }
        
        false
    }
    
    /**
     * 检查端口是否开放
     */
    private fun isPortOpen(host: String, port: Int): Boolean {
        return try {
            val socket = Socket()
            socket.connect(InetSocketAddress(host, port), 100)
            socket.close()
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * 确定连接类型
     */
    private fun determineConnectionType(
        isUsbDebugging: Boolean,
        isWirelessAdb: Boolean,
        isConnected: Boolean
    ): ConnectionType {
        if (!isConnected) {
            return ConnectionType.NONE
        }
        
        return when {
            isUsbDebugging && isWirelessAdb -> ConnectionType.USB_AND_WIRELESS
            isWirelessAdb -> ConnectionType.WIRELESS
            isUsbDebugging -> ConnectionType.USB
            else -> ConnectionType.NONE
        }
    }
    
    /**
     * 获取ADB连接建议
     */
    fun getConnectionAdvice(): String {
        val status = try {
            kotlinx.coroutines.runBlocking { getAdbStatus() }
        } catch (e: Exception) {
            return "无法获取ADB状态"
        }
        
        return when {
            !status.isAdbEnabled -> "请先在开发者选项中启用USB调试"
            !status.isConnectedToPC -> "请使用USB数据线连接到电脑，或启用无线调试"
            status.connectionType == ConnectionType.USB -> "已通过USB连接"
            status.connectionType == ConnectionType.WIRELESS -> "已通过无线ADB连接"
            status.connectionType == ConnectionType.USB_AND_WIRELESS -> "已通过USB和无线ADB连接"
            else -> "请检查ADB连接"
        }
    }
}

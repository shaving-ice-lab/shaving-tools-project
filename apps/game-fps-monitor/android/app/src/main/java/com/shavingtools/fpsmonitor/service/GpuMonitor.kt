package com.shavingtools.fpsmonitor.service

import android.content.Context
import android.os.Build
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.BufferedReader
import java.io.File
import java.io.InputStreamReader
import javax.inject.Inject
import javax.inject.Singleton

/**
 * GPU监控器 - 采集GPU占用率和频率信息
 */
@Singleton
class GpuMonitor @Inject constructor(
    private val context: Context
) {
    
    data class GpuInfo(
        val usage: Float,           // GPU占用率 0-100
        val frequency: Long,        // 当前频率 MHz
        val maxFrequency: Long,     // 最大频率 MHz
        val minFrequency: Long,     // 最小频率 MHz
        val vendor: String,         // GPU厂商
        val model: String,          // GPU型号
        val temperature: Float      // GPU温度
    )
    
    companion object {
        // Adreno GPU 路径
        private val ADRENO_BUSY_PATHS = listOf(
            "/sys/class/kgsl/kgsl-3d0/gpu_busy_percentage",
            "/sys/class/kgsl/kgsl-3d0/devfreq/gpu_load"
        )
        private const val ADRENO_FREQ_PATH = "/sys/class/kgsl/kgsl-3d0/gpuclk"
        private const val ADRENO_MAX_FREQ_PATH = "/sys/class/kgsl/kgsl-3d0/max_gpuclk"
        private const val ADRENO_MIN_FREQ_PATH = "/sys/class/kgsl/kgsl-3d0/min_gpuclk"
        
        // Mali GPU 路径
        private val MALI_BUSY_PATHS = listOf(
            "/sys/class/misc/mali0/device/utilization",
            "/sys/devices/platform/mali.0/utilization"
        )
        private const val MALI_FREQ_PATH = "/sys/class/misc/mali0/device/clock"
        
        // PowerVR GPU 路径
        private const val POWERVR_FREQ_PATH = "/sys/kernel/gpu/gpu_clock"
    }
    
    private var gpuVendor: String = "Unknown"
    private var gpuModel: String = "Unknown"
    
    init {
        detectGpuInfo()
    }
    
    private fun detectGpuInfo() {
        // 尝试从dumpsys获取GPU信息
        try {
            val process = Runtime.getRuntime().exec("dumpsys gpu")
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            val output = reader.readText()
            reader.close()
            
            // 解析GPU型号
            if (output.contains("Adreno", ignoreCase = true)) {
                gpuVendor = "Qualcomm"
                val adrenoMatch = Regex("Adreno\\s*(\\d+)").find(output)
                gpuModel = adrenoMatch?.groupValues?.get(0) ?: "Adreno"
            } else if (output.contains("Mali", ignoreCase = true)) {
                gpuVendor = "ARM"
                val maliMatch = Regex("Mali-([A-Z0-9]+)").find(output)
                gpuModel = maliMatch?.groupValues?.get(0) ?: "Mali"
            } else if (output.contains("PowerVR", ignoreCase = true)) {
                gpuVendor = "Imagination"
                gpuModel = "PowerVR"
            }
        } catch (e: Exception) {
            // 从Build信息推断
            val hardware = Build.HARDWARE.lowercase()
            when {
                hardware.contains("qcom") || hardware.contains("snapdragon") -> {
                    gpuVendor = "Qualcomm"
                    gpuModel = "Adreno"
                }
                hardware.contains("exynos") || hardware.contains("mali") -> {
                    gpuVendor = "ARM"
                    gpuModel = "Mali"
                }
                hardware.contains("mt") || hardware.contains("mediatek") -> {
                    gpuVendor = "ARM"
                    gpuModel = "Mali"
                }
            }
        }
    }
    
    /**
     * 获取GPU信息
     */
    suspend fun getGpuInfo(): GpuInfo = withContext(Dispatchers.IO) {
        GpuInfo(
            usage = getGpuUsage(),
            frequency = getGpuFrequency(),
            maxFrequency = getGpuMaxFrequency(),
            minFrequency = getGpuMinFrequency(),
            vendor = gpuVendor,
            model = gpuModel,
            temperature = getGpuTemperature()
        )
    }
    
    /**
     * 获取GPU占用率
     */
    suspend fun getGpuUsage(): Float = withContext(Dispatchers.IO) {
        // 尝试Adreno路径
        for (path in ADRENO_BUSY_PATHS) {
            val value = readSysFile(path)
            if (value != null) {
                return@withContext value.replace("%", "").trim().toFloatOrNull() ?: 0f
            }
        }
        
        // 尝试Mali路径
        for (path in MALI_BUSY_PATHS) {
            val value = readSysFile(path)
            if (value != null) {
                return@withContext value.trim().toFloatOrNull() ?: 0f
            }
        }
        
        // 尝试通过dumpsys获取
        getGpuUsageFromDumpsys()
    }
    
    /**
     * 从dumpsys获取GPU占用率
     */
    private fun getGpuUsageFromDumpsys(): Float {
        return try {
            val process = Runtime.getRuntime().exec("dumpsys gfxinfo")
            val reader = BufferedReader(InputStreamReader(process.inputStream))
            val output = reader.readText()
            reader.close()
            
            // 解析GPU使用率（简单估算）
            val frameCount = Regex("Total frames rendered: (\\d+)").find(output)
                ?.groupValues?.get(1)?.toIntOrNull() ?: 0
            val jankyFrames = Regex("Janky frames: (\\d+)").find(output)
                ?.groupValues?.get(1)?.toIntOrNull() ?: 0
            
            if (frameCount > 0) {
                ((frameCount - jankyFrames).toFloat() / frameCount * 100).coerceIn(0f, 100f)
            } else {
                0f
            }
        } catch (e: Exception) {
            0f
        }
    }
    
    /**
     * 获取GPU当前频率
     */
    suspend fun getGpuFrequency(): Long = withContext(Dispatchers.IO) {
        // Adreno
        var value = readSysFile(ADRENO_FREQ_PATH)
        if (value != null) {
            return@withContext value.trim().toLongOrNull()?.div(1000000) ?: 0L
        }
        
        // Mali
        value = readSysFile(MALI_FREQ_PATH)
        if (value != null) {
            return@withContext value.trim().toLongOrNull()?.div(1000000) ?: 0L
        }
        
        // PowerVR
        value = readSysFile(POWERVR_FREQ_PATH)
        if (value != null) {
            return@withContext value.trim().toLongOrNull() ?: 0L
        }
        
        0L
    }
    
    /**
     * 获取GPU最大频率
     */
    suspend fun getGpuMaxFrequency(): Long = withContext(Dispatchers.IO) {
        val value = readSysFile(ADRENO_MAX_FREQ_PATH)
        value?.trim()?.toLongOrNull()?.div(1000000) ?: 0L
    }
    
    /**
     * 获取GPU最小频率
     */
    suspend fun getGpuMinFrequency(): Long = withContext(Dispatchers.IO) {
        val value = readSysFile(ADRENO_MIN_FREQ_PATH)
        value?.trim()?.toLongOrNull()?.div(1000000) ?: 0L
    }
    
    /**
     * 获取GPU温度
     */
    suspend fun getGpuTemperature(): Float = withContext(Dispatchers.IO) {
        // 尝试从thermal zone获取GPU温度
        val thermalDir = File("/sys/class/thermal/")
        if (thermalDir.exists()) {
            thermalDir.listFiles()?.forEach { zone ->
                val typeFile = File(zone, "type")
                val tempFile = File(zone, "temp")
                
                if (typeFile.exists() && tempFile.exists()) {
                    try {
                        val type = typeFile.readText().trim().lowercase()
                        if (type.contains("gpu") || type.contains("graphics")) {
                            val temp = tempFile.readText().trim().toFloatOrNull() ?: 0f
                            return@withContext if (temp > 1000) temp / 1000 else temp
                        }
                    } catch (e: Exception) {
                        // 忽略读取错误
                    }
                }
            }
        }
        0f
    }
    
    /**
     * 读取系统文件
     */
    private fun readSysFile(path: String): String? {
        return try {
            val file = File(path)
            if (file.exists() && file.canRead()) {
                file.readText()
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }
}

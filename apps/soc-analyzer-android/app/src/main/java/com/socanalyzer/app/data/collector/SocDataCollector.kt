package com.socanalyzer.app.data.collector

import android.content.Context
import android.os.BatteryManager
import android.os.Build
import com.socanalyzer.app.data.model.*
import dagger.hilt.android.qualifiers.ApplicationContext
import java.io.File
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SocDataCollector @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager

    fun getDeviceInfo(): DeviceInfo {
        return DeviceInfo(
            brand = Build.BRAND,
            model = Build.MODEL,
            android_version = Build.VERSION.RELEASE,
            soc = getCpuName()
        )
    }

    fun getSocInfo(): SocInfo {
        return SocInfo(
            cpu = getCpuInfo(),
            gpu = getGpuInfo(),
            memory = getMemoryInfo(),
            npu = getNpuInfo()
        )
    }

    fun getRealtimeData(): RealtimeMonitor {
        return RealtimeMonitor(
            timestamp = System.currentTimeMillis(),
            cpu = getCpuMonitor(),
            gpu = getGpuMonitor(),
            memory = getMemoryMonitor(),
            battery = getBatteryMonitor()
        )
    }

    private fun getCpuName(): String {
        return try {
            val cpuInfo = File("/proc/cpuinfo").readText()
            val hardware = cpuInfo.lines().find { it.startsWith("Hardware") }
            hardware?.substringAfter(":")?.trim() ?: Build.HARDWARE
        } catch (e: Exception) {
            Build.HARDWARE
        }
    }

    private fun getCpuInfo(): CpuInfo {
        val cores = getCpuCores()
        val process = detectProcess(getCpuName())
        
        return CpuInfo(
            name = getCpuName(),
            cores = cores,
            process = process
        )
    }

    private fun getCpuCores(): List<CpuCore> {
        val cores = mutableListOf<CpuCore>()
        val numCores = Runtime.getRuntime().availableProcessors()
        
        for (i in 0 until numCores) {
            val maxFreq = readCpuFreq("/sys/devices/system/cpu/cpu$i/cpufreq/cpuinfo_max_freq")
            val minFreq = readCpuFreq("/sys/devices/system/cpu/cpu$i/cpufreq/cpuinfo_min_freq")
            val currentFreq = readCpuFreq("/sys/devices/system/cpu/cpu$i/cpufreq/scaling_cur_freq")
            
            val type = when {
                maxFreq > 2800000 -> "prime"
                maxFreq > 2200000 -> "big"
                maxFreq > 1800000 -> "middle"
                else -> "little"
            }
            
            cores.add(CpuCore(
                type = type,
                arch = "ARM",
                max_freq = (maxFreq / 1000).toInt(),
                current_freq = (currentFreq / 1000).toInt(),
                min_freq = (minFreq / 1000).toInt()
            ))
        }
        
        return cores
    }

    private fun readCpuFreq(path: String): Long {
        return try {
            File(path).readText().trim().toLong()
        } catch (e: Exception) {
            0L
        }
    }

    private fun detectProcess(cpuName: String): String {
        return when {
            cpuName.contains("8 Gen 3", ignoreCase = true) -> "4nm TSMC"
            cpuName.contains("8 Gen 2", ignoreCase = true) -> "4nm TSMC"
            cpuName.contains("8 Gen 1", ignoreCase = true) -> "4nm Samsung"
            cpuName.contains("Dimensity 9300", ignoreCase = true) -> "4nm TSMC"
            cpuName.contains("Dimensity 9200", ignoreCase = true) -> "4nm TSMC"
            cpuName.contains("Tensor G3", ignoreCase = true) -> "4nm Samsung"
            cpuName.contains("Exynos 2400", ignoreCase = true) -> "4nm Samsung"
            cpuName.contains("Kirin 9000", ignoreCase = true) -> "7nm SMIC"
            else -> "Unknown"
        }
    }

    private fun getGpuInfo(): GpuInfo {
        val gpuName = detectGpuName()
        val maxFreq = readGpuMaxFreq()
        val currentFreq = readGpuCurrentFreq()
        
        return GpuInfo(
            name = gpuName,
            max_freq = maxFreq,
            current_freq = currentFreq
        )
    }

    private fun detectGpuName(): String {
        val adrenoPath = "/sys/class/kgsl/kgsl-3d0/gpu_model"
        val maliPath = "/sys/devices/platform/mali.0/type"
        
        return try {
            when {
                File(adrenoPath).exists() -> File(adrenoPath).readText().trim()
                File(maliPath).exists() -> File(maliPath).readText().trim()
                else -> "Unknown GPU"
            }
        } catch (e: Exception) {
            "Unknown GPU"
        }
    }

    private fun readGpuMaxFreq(): Int {
        val paths = listOf(
            "/sys/class/kgsl/kgsl-3d0/max_gpuclk",
            "/sys/class/kgsl/kgsl-3d0/devfreq/max_freq"
        )
        
        for (path in paths) {
            try {
                if (File(path).exists()) {
                    return (File(path).readText().trim().toLong() / 1000000).toInt()
                }
            } catch (e: Exception) {}
        }
        return 0
    }

    private fun readGpuCurrentFreq(): Int {
        val paths = listOf(
            "/sys/class/kgsl/kgsl-3d0/gpuclk",
            "/sys/class/kgsl/kgsl-3d0/devfreq/cur_freq"
        )
        
        for (path in paths) {
            try {
                if (File(path).exists()) {
                    return (File(path).readText().trim().toLong() / 1000000).toInt()
                }
            } catch (e: Exception) {}
        }
        return 0
    }

    private fun getMemoryInfo(): MemoryInfo {
        val runtime = Runtime.getRuntime()
        val totalMem = runtime.totalMemory()
        val memInfo = android.app.ActivityManager.MemoryInfo()
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
        activityManager.getMemoryInfo(memInfo)
        
        val totalGb = (memInfo.totalMem / (1024 * 1024 * 1024)).toInt()
        
        return MemoryInfo(
            type = "LPDDR5",
            size_gb = if (totalGb > 0) totalGb else 8,
            bandwidth = "Unknown"
        )
    }

    private fun getNpuInfo(): NpuInfo? {
        return null
    }

    private fun getCpuMonitor(): CpuMonitor {
        val frequencies = mutableListOf<Int>()
        val numCores = Runtime.getRuntime().availableProcessors()
        
        for (i in 0 until numCores) {
            val freq = readCpuFreq("/sys/devices/system/cpu/cpu$i/cpufreq/scaling_cur_freq")
            frequencies.add((freq / 1000).toInt())
        }
        
        return CpuMonitor(
            usage = getCpuUsage(),
            frequencies = frequencies,
            temperature = getCpuTemperature()
        )
    }

    private fun getCpuUsage(): Float {
        return try {
            val statFile = File("/proc/stat")
            val lines = statFile.readLines()
            val cpuLine = lines.first { it.startsWith("cpu ") }
            val values = cpuLine.split("\\s+".toRegex()).drop(1).map { it.toLong() }
            
            val idle = values[3]
            val total = values.sum()
            
            ((total - idle).toFloat() / total.toFloat()) * 100f
        } catch (e: Exception) {
            0f
        }
    }

    private fun getCpuTemperature(): Float {
        val thermalPaths = listOf(
            "/sys/class/thermal/thermal_zone0/temp",
            "/sys/devices/virtual/thermal/thermal_zone0/temp"
        )
        
        for (path in thermalPaths) {
            try {
                if (File(path).exists()) {
                    val temp = File(path).readText().trim().toFloat()
                    return if (temp > 1000) temp / 1000f else temp
                }
            } catch (e: Exception) {}
        }
        return 0f
    }

    private fun getGpuMonitor(): GpuMonitor {
        return GpuMonitor(
            usage = 0f,
            frequency = readGpuCurrentFreq(),
            temperature = getGpuTemperature()
        )
    }

    private fun getGpuTemperature(): Float {
        val paths = listOf(
            "/sys/class/thermal/thermal_zone1/temp",
            "/sys/class/kgsl/kgsl-3d0/temp"
        )
        
        for (path in paths) {
            try {
                if (File(path).exists()) {
                    val temp = File(path).readText().trim().toFloat()
                    return if (temp > 1000) temp / 1000f else temp
                }
            } catch (e: Exception) {}
        }
        return 0f
    }

    private fun getMemoryMonitor(): MemoryMonitor {
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
        val memInfo = android.app.ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memInfo)
        
        val usedMem = (memInfo.totalMem - memInfo.availMem) / (1024 * 1024)
        val availMem = memInfo.availMem / (1024 * 1024)
        
        return MemoryMonitor(
            used_mb = usedMem.toInt(),
            available_mb = availMem.toInt()
        )
    }

    private fun getBatteryMonitor(): BatteryMonitor {
        val current = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CURRENT_NOW)
        
        return BatteryMonitor(
            temperature = getBatteryTemperature(),
            current_ma = current / 1000,
            voltage_mv = getVoltage(),
            power_mw = kotlin.math.abs(current / 1000 * getVoltage() / 1000)
        )
    }

    private fun getBatteryTemperature(): Float {
        return try {
            val intent = context.registerReceiver(null, 
                android.content.IntentFilter(android.content.Intent.ACTION_BATTERY_CHANGED))
            val temp = intent?.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0) ?: 0
            temp / 10f
        } catch (e: Exception) {
            0f
        }
    }

    private fun getVoltage(): Int {
        return try {
            val intent = context.registerReceiver(null,
                android.content.IntentFilter(android.content.Intent.ACTION_BATTERY_CHANGED))
            intent?.getIntExtra(BatteryManager.EXTRA_VOLTAGE, 0) ?: 0
        } catch (e: Exception) {
            0
        }
    }
}

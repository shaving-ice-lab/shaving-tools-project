package com.shavingtools.battery.util

import android.app.ActivityManager
import android.content.Context
import android.os.Debug
import android.os.Process
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 性能优化器 - 监控和优化应用自身的资源消耗
 */
@Singleton
class PerformanceOptimizer @Inject constructor(
    private val context: Context
) {
    
    data class PerformanceMetrics(
        val memoryUsageMB: Float,
        val cpuUsagePercent: Float,
        val batteryImpactPercent: Float,
        val isOptimal: Boolean,
        val recommendations: List<String>
    )
    
    private var lastCpuTime: Long = 0
    private var lastAppCpuTime: Long = 0
    
    /**
     * 获取当前性能指标
     */
    suspend fun getPerformanceMetrics(): PerformanceMetrics = withContext(Dispatchers.IO) {
        val memoryUsage = getMemoryUsage()
        val cpuUsage = getCpuUsage()
        val batteryImpact = estimateBatteryImpact(memoryUsage, cpuUsage)
        
        val recommendations = mutableListOf<String>()
        
        if (memoryUsage > 80f) {
            recommendations.add("内存使用过高，建议清理历史数据")
        }
        if (cpuUsage > 5f) {
            recommendations.add("CPU占用偏高，建议降低采样频率")
        }
        if (batteryImpact > 3f) {
            recommendations.add("电池消耗偏高，建议优化后台任务")
        }
        
        PerformanceMetrics(
            memoryUsageMB = memoryUsage,
            cpuUsagePercent = cpuUsage,
            batteryImpactPercent = batteryImpact,
            isOptimal = memoryUsage < 80 && cpuUsage < 5 && batteryImpact < 3,
            recommendations = recommendations
        )
    }
    
    /**
     * 获取内存使用量 (MB)
     */
    fun getMemoryUsage(): Float {
        val runtime = Runtime.getRuntime()
        val usedMemory = runtime.totalMemory() - runtime.freeMemory()
        return usedMemory / (1024f * 1024f)
    }
    
    /**
     * 获取详细内存信息
     */
    fun getDetailedMemoryInfo(): MemoryInfo {
        val runtime = Runtime.getRuntime()
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val memoryInfo = ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memoryInfo)
        
        val heapUsed = runtime.totalMemory() - runtime.freeMemory()
        val heapMax = runtime.maxMemory()
        val nativeHeap = Debug.getNativeHeapAllocatedSize()
        
        return MemoryInfo(
            heapUsedMB = heapUsed / (1024f * 1024f),
            heapMaxMB = heapMax / (1024f * 1024f),
            nativeHeapMB = nativeHeap / (1024f * 1024f),
            systemAvailableMB = memoryInfo.availMem / (1024f * 1024f),
            isLowMemory = memoryInfo.lowMemory
        )
    }
    
    /**
     * 获取CPU使用率
     */
    fun getCpuUsage(): Float {
        return try {
            val pid = Process.myPid()
            val statFile = java.io.File("/proc/$pid/stat")
            
            if (!statFile.exists()) return 0f
            
            val stat = statFile.readText().split(" ")
            if (stat.size < 17) return 0f
            
            val utime = stat[13].toLongOrNull() ?: 0L
            val stime = stat[14].toLongOrNull() ?: 0L
            val appCpuTime = utime + stime
            
            val uptimeFile = java.io.File("/proc/uptime")
            val uptime = uptimeFile.readText().split(" ")[0].toFloatOrNull() ?: 0f
            val cpuTime = (uptime * 100).toLong() // 转换为ticks
            
            if (lastCpuTime == 0L) {
                lastCpuTime = cpuTime
                lastAppCpuTime = appCpuTime
                return 0f
            }
            
            val cpuDelta = cpuTime - lastCpuTime
            val appDelta = appCpuTime - lastAppCpuTime
            
            lastCpuTime = cpuTime
            lastAppCpuTime = appCpuTime
            
            if (cpuDelta > 0) {
                (appDelta.toFloat() / cpuDelta * 100).coerceIn(0f, 100f)
            } else {
                0f
            }
        } catch (e: Exception) {
            0f
        }
    }
    
    /**
     * 估算电池影响
     */
    private fun estimateBatteryImpact(memoryMB: Float, cpuPercent: Float): Float {
        // 简化估算: 基于CPU和内存使用量
        val cpuImpact = cpuPercent * 0.5f
        val memoryImpact = (memoryMB / 100f) * 0.3f
        return (cpuImpact + memoryImpact).coerceIn(0f, 10f)
    }
    
    /**
     * 执行内存优化
     */
    fun optimizeMemory() {
        System.gc()
        Runtime.getRuntime().gc()
    }
    
    /**
     * 检查是否需要优化
     */
    fun needsOptimization(): Boolean {
        val memoryInfo = getDetailedMemoryInfo()
        return memoryInfo.heapUsedMB > memoryInfo.heapMaxMB * 0.8f || memoryInfo.isLowMemory
    }
    
    data class MemoryInfo(
        val heapUsedMB: Float,
        val heapMaxMB: Float,
        val nativeHeapMB: Float,
        val systemAvailableMB: Float,
        val isLowMemory: Boolean
    ) {
        val heapUsagePercent: Float
            get() = if (heapMaxMB > 0) (heapUsedMB / heapMaxMB) * 100f else 0f
    }
}

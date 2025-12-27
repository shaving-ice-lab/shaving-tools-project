package com.socanalyzer.app.benchmark

import android.content.Context
import com.socanalyzer.app.data.collector.SocDataCollector
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.withContext
import kotlin.coroutines.coroutineContext

data class StressTestDataPoint(
    val timestamp: Long,
    val cpuUsage: Float,
    val cpuFrequencies: List<Int>,
    val cpuTemperature: Float,
    val gpuTemperature: Float,
    val batteryTemperature: Float,
    val powerConsumption: Float,
    val performanceScore: Int,
    val throttlingDetected: Boolean
)

data class StressTestResult(
    val durationMinutes: Int,
    val dataPoints: List<StressTestDataPoint>,
    val averagePerformance: Int,
    val minPerformance: Int,
    val maxPerformance: Int,
    val performanceDrop: Float,
    val maxTemperature: Float,
    val throttlingTime: Long,
    val stabilityScore: Int
)

class StressTest(private val context: Context) {
    
    private val dataCollector = SocDataCollector(context)
    
    fun runStressTest(
        durationMinutes: Int,
        onProgress: (Float) -> Unit,
        onDataPoint: (StressTestDataPoint) -> Unit
    ): Flow<StressTestDataPoint> = flow {
        val startTime = System.currentTimeMillis()
        val endTime = startTime + durationMinutes * 60 * 1000L
        val dataPoints = mutableListOf<StressTestDataPoint>()
        
        var baselinePerformance = 0
        var lastThrottleCheck = 0
        
        while (coroutineContext.isActive && System.currentTimeMillis() < endTime) {
            val currentTime = System.currentTimeMillis()
            val elapsed = currentTime - startTime
            val progress = elapsed.toFloat() / (durationMinutes * 60 * 1000L)
            
            onProgress(progress)
            
            val performanceScore = runQuickBenchmark()
            
            if (baselinePerformance == 0) {
                baselinePerformance = performanceScore
            }
            
            val realtimeData = dataCollector.getRealtimeData()
            
            val throttlingDetected = performanceScore < baselinePerformance * 0.85
            
            val dataPoint = StressTestDataPoint(
                timestamp = currentTime,
                cpuUsage = realtimeData.cpu.usage,
                cpuFrequencies = realtimeData.cpu.frequencies,
                cpuTemperature = realtimeData.cpu.temperature,
                gpuTemperature = realtimeData.gpu.temperature,
                batteryTemperature = realtimeData.battery.temperature,
                powerConsumption = realtimeData.battery.powerMw.toFloat(),
                performanceScore = performanceScore,
                throttlingDetected = throttlingDetected
            )
            
            dataPoints.add(dataPoint)
            onDataPoint(dataPoint)
            emit(dataPoint)
            
            delay(1000)
        }
    }
    
    private suspend fun runQuickBenchmark(): Int = withContext(Dispatchers.Default) {
        val iterations = 100000
        var result = 0L
        
        val startTime = System.nanoTime()
        
        repeat(iterations) { i ->
            result += (i * 31L) xor (i * 17L)
            result = (result shl 3) or (result ushr 61)
            result += kotlin.math.sin(i.toDouble()).toLong()
        }
        
        val endTime = System.nanoTime()
        val elapsedNs = endTime - startTime
        
        val opsPerSecond = iterations.toLong() * 1_000_000_000L / elapsedNs
        (opsPerSecond / 10000).toInt()
    }
    
    fun analyzeResults(dataPoints: List<StressTestDataPoint>, durationMinutes: Int): StressTestResult {
        if (dataPoints.isEmpty()) {
            return StressTestResult(
                durationMinutes = durationMinutes,
                dataPoints = emptyList(),
                averagePerformance = 0,
                minPerformance = 0,
                maxPerformance = 0,
                performanceDrop = 0f,
                maxTemperature = 0f,
                throttlingTime = 0L,
                stabilityScore = 0
            )
        }
        
        val scores = dataPoints.map { it.performanceScore }
        val avgPerformance = scores.average().toInt()
        val minPerformance = scores.minOrNull() ?: 0
        val maxPerformance = scores.maxOrNull() ?: 0
        
        val firstQuarterAvg = scores.take(scores.size / 4).average()
        val lastQuarterAvg = scores.takeLast(scores.size / 4).average()
        val performanceDrop = ((firstQuarterAvg - lastQuarterAvg) / firstQuarterAvg * 100).toFloat()
        
        val maxTemp = dataPoints.maxOfOrNull { 
            maxOf(it.cpuTemperature, it.gpuTemperature, it.batteryTemperature) 
        } ?: 0f
        
        val throttlingPoints = dataPoints.count { it.throttlingDetected }
        val throttlingTime = throttlingPoints * 1000L
        
        val varianceScore = 100 - (scores.standardDeviation() / avgPerformance * 100).toInt().coerceIn(0, 50)
        val tempScore = (100 - (maxTemp - 40) * 2).toInt().coerceIn(0, 100)
        val dropScore = (100 - performanceDrop * 2).toInt().coerceIn(0, 100)
        val stabilityScore = (varianceScore * 0.4 + tempScore * 0.3 + dropScore * 0.3).toInt()
        
        return StressTestResult(
            durationMinutes = durationMinutes,
            dataPoints = dataPoints,
            averagePerformance = avgPerformance,
            minPerformance = minPerformance,
            maxPerformance = maxPerformance,
            performanceDrop = performanceDrop,
            maxTemperature = maxTemp,
            throttlingTime = throttlingTime,
            stabilityScore = stabilityScore
        )
    }
    
    private fun List<Int>.standardDeviation(): Double {
        if (isEmpty()) return 0.0
        val mean = average()
        val variance = map { (it - mean) * (it - mean) }.average()
        return kotlin.math.sqrt(variance)
    }
}

package com.socanalyzer.app.benchmark

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.view.Choreographer
import com.socanalyzer.app.data.collector.SocDataCollector
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.withContext
import kotlin.coroutines.coroutineContext

data class FrameData(
    val timestamp: Long,
    val fps: Float,
    val frameTimeMs: Float,
    val isJank: Boolean
)

data class GamePerformanceResult(
    val packageName: String,
    val testDurationMs: Long,
    val frameData: List<FrameData>,
    val averageFps: Float,
    val onePercentLow: Float,
    val pointOnePercentLow: Float,
    val jankCount: Int,
    val jankRatio: Float,
    val maxFrameTime: Float,
    val minFrameTime: Float,
    val avgFrameTime: Float,
    val maxTemperature: Float,
    val avgTemperature: Float
)

class GamePerformanceMonitor(private val context: Context) {
    
    private val dataCollector = SocDataCollector(context)
    private val handler = Handler(Looper.getMainLooper())
    
    private var frameCount = 0
    private var lastFrameTimeNanos = 0L
    private var frameTimes = mutableListOf<Float>()
    private var isMonitoring = false
    
    private val frameCallback = object : Choreographer.FrameCallback {
        override fun doFrame(frameTimeNanos: Long) {
            if (!isMonitoring) return
            
            if (lastFrameTimeNanos != 0L) {
                val frameTimeMs = (frameTimeNanos - lastFrameTimeNanos) / 1_000_000f
                frameTimes.add(frameTimeMs)
                frameCount++
            }
            lastFrameTimeNanos = frameTimeNanos
            
            if (isMonitoring) {
                Choreographer.getInstance().postFrameCallback(this)
            }
        }
    }
    
    fun startMonitoring() {
        isMonitoring = true
        frameCount = 0
        lastFrameTimeNanos = 0L
        frameTimes.clear()
        handler.post {
            Choreographer.getInstance().postFrameCallback(frameCallback)
        }
    }
    
    fun stopMonitoring() {
        isMonitoring = false
    }
    
    fun monitorGamePerformance(
        packageName: String,
        durationSeconds: Int,
        onProgress: (Float) -> Unit,
        onFrameData: (FrameData) -> Unit
    ): Flow<FrameData> = flow {
        val startTime = System.currentTimeMillis()
        val endTime = startTime + durationSeconds * 1000L
        val allFrameData = mutableListOf<FrameData>()
        val temperatureReadings = mutableListOf<Float>()
        
        startMonitoring()
        
        var lastSecondFrameCount = 0
        var lastSecondTime = startTime
        
        while (coroutineContext.isActive && System.currentTimeMillis() < endTime) {
            val currentTime = System.currentTimeMillis()
            val elapsed = currentTime - startTime
            val progress = elapsed.toFloat() / (durationSeconds * 1000f)
            onProgress(progress)
            
            if (currentTime - lastSecondTime >= 1000) {
                val currentFrameCount = frameCount
                val framesThisSecond = currentFrameCount - lastSecondFrameCount
                val fps = framesThisSecond.toFloat()
                
                val recentFrameTimes = if (frameTimes.size > framesThisSecond) {
                    frameTimes.takeLast(framesThisSecond)
                } else {
                    frameTimes.toList()
                }
                
                val avgFrameTime = if (recentFrameTimes.isNotEmpty()) {
                    recentFrameTimes.average().toFloat()
                } else {
                    16.67f
                }
                
                val isJank = avgFrameTime > 33.33f
                
                val realtimeData = dataCollector.getRealtimeData()
                temperatureReadings.add(realtimeData.cpu.temperature)
                
                val frameData = FrameData(
                    timestamp = currentTime,
                    fps = fps,
                    frameTimeMs = avgFrameTime,
                    isJank = isJank
                )
                
                allFrameData.add(frameData)
                onFrameData(frameData)
                emit(frameData)
                
                lastSecondFrameCount = currentFrameCount
                lastSecondTime = currentTime
            }
            
            delay(100)
        }
        
        stopMonitoring()
    }
    
    fun analyzeResults(
        packageName: String,
        frameData: List<FrameData>,
        testDurationMs: Long
    ): GamePerformanceResult {
        if (frameData.isEmpty()) {
            return GamePerformanceResult(
                packageName = packageName,
                testDurationMs = testDurationMs,
                frameData = emptyList(),
                averageFps = 0f,
                onePercentLow = 0f,
                pointOnePercentLow = 0f,
                jankCount = 0,
                jankRatio = 0f,
                maxFrameTime = 0f,
                minFrameTime = 0f,
                avgFrameTime = 0f,
                maxTemperature = 0f,
                avgTemperature = 0f
            )
        }
        
        val fpsValues = frameData.map { it.fps }.sorted()
        val frameTimes = frameData.map { it.frameTimeMs }
        
        val avgFps = fpsValues.average().toFloat()
        
        val onePercentIndex = (fpsValues.size * 0.01).toInt().coerceAtLeast(1)
        val pointOnePercentIndex = (fpsValues.size * 0.001).toInt().coerceAtLeast(1)
        
        val onePercentLow = fpsValues.take(onePercentIndex).average().toFloat()
        val pointOnePercentLow = fpsValues.take(pointOnePercentIndex).average().toFloat()
        
        val jankCount = frameData.count { it.isJank }
        val jankRatio = jankCount.toFloat() / frameData.size
        
        val maxFrameTime = frameTimes.maxOrNull() ?: 0f
        val minFrameTime = frameTimes.minOrNull() ?: 0f
        val avgFrameTime = frameTimes.average().toFloat()
        
        return GamePerformanceResult(
            packageName = packageName,
            testDurationMs = testDurationMs,
            frameData = frameData,
            averageFps = avgFps,
            onePercentLow = onePercentLow,
            pointOnePercentLow = pointOnePercentLow,
            jankCount = jankCount,
            jankRatio = jankRatio,
            maxFrameTime = maxFrameTime,
            minFrameTime = minFrameTime,
            avgFrameTime = avgFrameTime,
            maxTemperature = 0f,
            avgTemperature = 0f
        )
    }
}

package com.shavingtools.fpsmonitor.domain.model

data class FrameData(
    val fps: Float,
    val frameTime: Float,
    val jank: Boolean = false,
    val timestamp: Long = System.currentTimeMillis()
)

data class PerformanceSnapshot(
    val fps: Float,
    val avgFps: Float,
    val minFps: Float,
    val maxFps: Float,
    val cpuUsage: Float,
    val gpuUsage: Float,
    val memoryUsage: Float,
    val temperature: Float,
    val power: Float,
    val jankCount: Int,
    val jankRate: Float,
    val timestamp: Long = System.currentTimeMillis()
)

data class TestSession(
    val id: String,
    val gameName: String,
    val startTime: Long,
    val endTime: Long? = null,
    val deviceModel: String = android.os.Build.MODEL
)

data class PerformancePacket(
    val type: String,
    val timestamp: Long,
    val deviceId: String,
    val data: Any
)

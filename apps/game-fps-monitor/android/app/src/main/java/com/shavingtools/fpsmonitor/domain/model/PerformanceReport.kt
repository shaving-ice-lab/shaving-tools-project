package com.shavingtools.fpsmonitor.domain.model

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class PerformanceReport(
    val sessionId: Long,
    val gameName: String,
    val deviceModel: String,
    val startTime: Long,
    val endTime: Long,
    val duration: Long,
    val stats: PerformanceStats,
    val fpsDistribution: FpsDistribution,
    val timestamps: List<Long>,
    val fpsValues: List<Float>
)

data class PerformanceStats(
    val avgFps: Float,
    val minFps: Float,
    val maxFps: Float,
    val fps1Low: Float,
    val fps01Low: Float,
    val jankCount: Int,
    val jankRate: Float,
    val avgCpuUsage: Float,
    val avgMemoryUsage: Float,
    val avgTemperature: Float,
    val maxTemperature: Float,
    val totalFrames: Int,
    val smoothnessScore: Int
) {
    fun getStabilityRating(): String {
        return when {
            jankRate < 1f && avgFps >= 55 -> "Excellent"
            jankRate < 3f && avgFps >= 45 -> "Good"
            jankRate < 5f && avgFps >= 30 -> "Fair"
            else -> "Poor"
        }
    }
}

data class FpsDistribution(
    val below15: Int,
    val range15to30: Int,
    val range30to45: Int,
    val range45to60: Int,
    val above60: Int
) {
    fun getTotalFrames(): Int = below15 + range15to30 + range30to45 + range45to60 + above60
    
    fun getPercentage(range: Int): Float {
        val total = getTotalFrames()
        if (total == 0) return 0f
        return (range.toFloat() / total) * 100
    }
}

class ReportGenerator {
    
    fun generateReport(
        session: TestSession,
        frameRecords: List<FrameData>,
        snapshots: List<PerformanceSnapshot>
    ): PerformanceReport {
        val fpsValues = frameRecords.map { it.fps }
        val sortedFps = fpsValues.sorted()
        
        val stats = PerformanceStats(
            avgFps = fpsValues.average().toFloat(),
            minFps = fpsValues.minOrNull() ?: 0f,
            maxFps = fpsValues.maxOrNull() ?: 0f,
            fps1Low = calculatePercentile(sortedFps, 1),
            fps01Low = calculatePercentile(sortedFps, 0.1f),
            jankCount = frameRecords.count { it.isJank },
            jankRate = if (frameRecords.isNotEmpty()) 
                (frameRecords.count { it.isJank }.toFloat() / frameRecords.size) * 100 
                else 0f,
            avgCpuUsage = snapshots.map { it.cpuUsage }.average().toFloat(),
            avgMemoryUsage = snapshots.map { it.memoryUsage }.average().toFloat(),
            avgTemperature = snapshots.map { it.temperature }.average().toFloat(),
            maxTemperature = snapshots.maxOfOrNull { it.temperature } ?: 0f,
            totalFrames = frameRecords.size,
            smoothnessScore = calculateSmoothnessScore(fpsValues)
        )
        
        val distribution = FpsDistribution(
            below15 = fpsValues.count { it < 15 },
            range15to30 = fpsValues.count { it in 15f..30f },
            range30to45 = fpsValues.count { it in 30f..45f },
            range45to60 = fpsValues.count { it in 45f..60f },
            above60 = fpsValues.count { it > 60 }
        )
        
        return PerformanceReport(
            sessionId = session.id,
            gameName = session.gameName,
            deviceModel = android.os.Build.MODEL,
            startTime = session.startTime,
            endTime = session.endTime ?: System.currentTimeMillis(),
            duration = session.duration,
            stats = stats,
            fpsDistribution = distribution,
            timestamps = frameRecords.map { it.timestamp },
            fpsValues = fpsValues
        )
    }
    
    private fun calculatePercentile(sortedValues: List<Float>, percentile: Float): Float {
        if (sortedValues.isEmpty()) return 0f
        val index = (sortedValues.size * percentile / 100).toInt().coerceIn(0, sortedValues.size - 1)
        return sortedValues[index]
    }
    
    private fun calculateSmoothnessScore(fpsValues: List<Float>): Int {
        if (fpsValues.isEmpty()) return 0
        
        val avgFps = fpsValues.average()
        val variance = fpsValues.map { (it - avgFps) * (it - avgFps) }.average()
        val stdDev = kotlin.math.sqrt(variance)
        
        val stabilityScore = (100 - stdDev * 2).coerceIn(0.0, 100.0)
        val fpsScore = (avgFps / 60 * 100).coerceIn(0.0, 100.0)
        
        return ((stabilityScore + fpsScore) / 2).toInt()
    }
    
    fun generateTextReport(report: PerformanceReport): String {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
        
        return buildString {
            appendLine("=" .repeat(50))
            appendLine("           FPS PERFORMANCE REPORT")
            appendLine("=".repeat(50))
            appendLine()
            appendLine("Game: ${report.gameName}")
            appendLine("Device: ${report.deviceModel}")
            appendLine("Date: ${dateFormat.format(Date(report.startTime))}")
            appendLine("Duration: ${formatDuration(report.duration)}")
            appendLine()
            appendLine("-".repeat(50))
            appendLine("                  FPS STATISTICS")
            appendLine("-".repeat(50))
            appendLine("Average FPS: ${String.format("%.1f", report.stats.avgFps)}")
            appendLine("Min FPS: ${String.format("%.1f", report.stats.minFps)}")
            appendLine("Max FPS: ${String.format("%.1f", report.stats.maxFps)}")
            appendLine("1% Low: ${String.format("%.1f", report.stats.fps1Low)}")
            appendLine("0.1% Low: ${String.format("%.1f", report.stats.fps01Low)}")
            appendLine()
            appendLine("-".repeat(50))
            appendLine("               STABILITY METRICS")
            appendLine("-".repeat(50))
            appendLine("Total Frames: ${report.stats.totalFrames}")
            appendLine("Jank Count: ${report.stats.jankCount}")
            appendLine("Jank Rate: ${String.format("%.2f", report.stats.jankRate)}%")
            appendLine("Smoothness Score: ${report.stats.smoothnessScore}/100")
            appendLine("Rating: ${report.stats.getStabilityRating()}")
            appendLine()
            appendLine("-".repeat(50))
            appendLine("            SYSTEM PERFORMANCE")
            appendLine("-".repeat(50))
            appendLine("Avg CPU: ${String.format("%.1f", report.stats.avgCpuUsage)}%")
            appendLine("Avg Memory: ${String.format("%.0f", report.stats.avgMemoryUsage)} MB")
            appendLine("Avg Temperature: ${String.format("%.1f", report.stats.avgTemperature)}°C")
            appendLine("Max Temperature: ${String.format("%.1f", report.stats.maxTemperature)}°C")
            appendLine()
            appendLine("-".repeat(50))
            appendLine("              FPS DISTRIBUTION")
            appendLine("-".repeat(50))
            appendLine("< 15 FPS: ${report.fpsDistribution.below15} (${String.format("%.1f", report.fpsDistribution.getPercentage(report.fpsDistribution.below15))}%)")
            appendLine("15-30 FPS: ${report.fpsDistribution.range15to30} (${String.format("%.1f", report.fpsDistribution.getPercentage(report.fpsDistribution.range15to30))}%)")
            appendLine("30-45 FPS: ${report.fpsDistribution.range30to45} (${String.format("%.1f", report.fpsDistribution.getPercentage(report.fpsDistribution.range30to45))}%)")
            appendLine("45-60 FPS: ${report.fpsDistribution.range45to60} (${String.format("%.1f", report.fpsDistribution.getPercentage(report.fpsDistribution.range45to60))}%)")
            appendLine("> 60 FPS: ${report.fpsDistribution.above60} (${String.format("%.1f", report.fpsDistribution.getPercentage(report.fpsDistribution.above60))}%)")
            appendLine()
            appendLine("=".repeat(50))
            appendLine("Generated by FPS Monitor")
            appendLine("=".repeat(50))
        }
    }
    
    private fun formatDuration(ms: Long): String {
        val seconds = ms / 1000
        val minutes = seconds / 60
        val hours = minutes / 60
        return String.format("%02d:%02d:%02d", hours, minutes % 60, seconds % 60)
    }
}

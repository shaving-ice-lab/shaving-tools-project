package com.socanalyzer.app.report

import android.content.Context
import android.os.Environment
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Serializable
data class GamePerformanceReport(
    val reportId: String,
    val timestamp: Long,
    val deviceInfo: DeviceInfo,
    val gameInfo: GameInfo,
    val testDuration: Long,
    val fpsMetrics: FpsMetrics,
    val thermalMetrics: ThermalMetrics,
    val frequencyMetrics: FrequencyMetrics,
    val stabilityScore: Int,
    val overallScore: Int,
    val recommendations: List<String>
)

@Serializable
data class DeviceInfo(
    val brand: String,
    val model: String,
    val socName: String,
    val androidVersion: String,
    val ramSize: Long
)

@Serializable
data class GameInfo(
    val packageName: String,
    val gameName: String,
    val version: String
)

@Serializable
data class FpsMetrics(
    val averageFps: Float,
    val maxFps: Float,
    val minFps: Float,
    val onePercentLow: Float,
    val zeroPointOnePercentLow: Float,
    val jankCount: Int,
    val bigJankCount: Int,
    val frameTimeAvg: Float,
    val frameTimeMax: Float,
    val fpsStability: Float
)

@Serializable
data class ThermalMetrics(
    val startTemperature: Float,
    val endTemperature: Float,
    val maxTemperature: Float,
    val avgTemperature: Float,
    val thermalThrottleCount: Int,
    val thermalThrottleTime: Long
)

@Serializable
data class FrequencyMetrics(
    val cpuAvgFrequency: Float,
    val cpuMaxFrequency: Float,
    val gpuAvgFrequency: Float,
    val gpuMaxFrequency: Float,
    val throttleEvents: Int
)

class GamePerformanceReportGenerator(private val context: Context) {

    private val json = Json { prettyPrint = true }

    fun generateReport(
        deviceInfo: DeviceInfo,
        gameInfo: GameInfo,
        testDuration: Long,
        fpsData: List<Float>,
        frameTimeData: List<Float>,
        temperatureData: List<Float>,
        cpuFrequencyData: List<Float>,
        gpuFrequencyData: List<Float>
    ): GamePerformanceReport {
        val fpsMetrics = calculateFpsMetrics(fpsData, frameTimeData)
        val thermalMetrics = calculateThermalMetrics(temperatureData)
        val frequencyMetrics = calculateFrequencyMetrics(cpuFrequencyData, gpuFrequencyData, temperatureData)
        
        val stabilityScore = calculateStabilityScore(fpsMetrics, thermalMetrics)
        val overallScore = calculateOverallScore(fpsMetrics, thermalMetrics, stabilityScore)
        val recommendations = generateRecommendations(fpsMetrics, thermalMetrics, frequencyMetrics)

        return GamePerformanceReport(
            reportId = generateReportId(),
            timestamp = System.currentTimeMillis(),
            deviceInfo = deviceInfo,
            gameInfo = gameInfo,
            testDuration = testDuration,
            fpsMetrics = fpsMetrics,
            thermalMetrics = thermalMetrics,
            frequencyMetrics = frequencyMetrics,
            stabilityScore = stabilityScore,
            overallScore = overallScore,
            recommendations = recommendations
        )
    }

    private fun calculateFpsMetrics(fpsData: List<Float>, frameTimeData: List<Float>): FpsMetrics {
        if (fpsData.isEmpty()) {
            return FpsMetrics(0f, 0f, 0f, 0f, 0f, 0, 0, 0f, 0f, 0f)
        }

        val sortedFps = fpsData.sorted()
        val onePercentIndex = (fpsData.size * 0.01).toInt().coerceAtLeast(1)
        val zeroPointOnePercentIndex = (fpsData.size * 0.001).toInt().coerceAtLeast(1)

        val avgFps = fpsData.average().toFloat()
        val onePercentLow = sortedFps.take(onePercentIndex).average().toFloat()
        val zeroPointOnePercentLow = sortedFps.take(zeroPointOnePercentIndex).average().toFloat()

        val jankThreshold = 1000f / 30f
        val bigJankThreshold = 1000f / 15f
        val jankCount = frameTimeData.count { it > jankThreshold }
        val bigJankCount = frameTimeData.count { it > bigJankThreshold }

        val fpsStability = if (avgFps > 0) (onePercentLow / avgFps) * 100 else 0f

        return FpsMetrics(
            averageFps = avgFps,
            maxFps = fpsData.maxOrNull() ?: 0f,
            minFps = fpsData.minOrNull() ?: 0f,
            onePercentLow = onePercentLow,
            zeroPointOnePercentLow = zeroPointOnePercentLow,
            jankCount = jankCount,
            bigJankCount = bigJankCount,
            frameTimeAvg = if (frameTimeData.isNotEmpty()) frameTimeData.average().toFloat() else 0f,
            frameTimeMax = frameTimeData.maxOrNull() ?: 0f,
            fpsStability = fpsStability
        )
    }

    private fun calculateThermalMetrics(temperatureData: List<Float>): ThermalMetrics {
        if (temperatureData.isEmpty()) {
            return ThermalMetrics(0f, 0f, 0f, 0f, 0, 0)
        }

        var thermalThrottleCount = 0
        var thermalThrottleTime = 0L
        var isThrottling = false

        temperatureData.forEachIndexed { index, temp ->
            if (temp > 45f && !isThrottling) {
                thermalThrottleCount++
                isThrottling = true
            } else if (temp <= 43f && isThrottling) {
                isThrottling = false
            }
            if (temp > 45f) {
                thermalThrottleTime += 100
            }
        }

        return ThermalMetrics(
            startTemperature = temperatureData.first(),
            endTemperature = temperatureData.last(),
            maxTemperature = temperatureData.maxOrNull() ?: 0f,
            avgTemperature = temperatureData.average().toFloat(),
            thermalThrottleCount = thermalThrottleCount,
            thermalThrottleTime = thermalThrottleTime
        )
    }

    private fun calculateFrequencyMetrics(
        cpuFrequencyData: List<Float>,
        gpuFrequencyData: List<Float>,
        temperatureData: List<Float>
    ): FrequencyMetrics {
        var throttleEvents = 0
        for (i in 1 until cpuFrequencyData.size) {
            if (cpuFrequencyData[i] < cpuFrequencyData[i - 1] * 0.9 && temperatureData.getOrNull(i) ?: 0f > 42f) {
                throttleEvents++
            }
        }

        return FrequencyMetrics(
            cpuAvgFrequency = if (cpuFrequencyData.isNotEmpty()) cpuFrequencyData.average().toFloat() else 0f,
            cpuMaxFrequency = cpuFrequencyData.maxOrNull() ?: 0f,
            gpuAvgFrequency = if (gpuFrequencyData.isNotEmpty()) gpuFrequencyData.average().toFloat() else 0f,
            gpuMaxFrequency = gpuFrequencyData.maxOrNull() ?: 0f,
            throttleEvents = throttleEvents
        )
    }

    private fun calculateStabilityScore(fpsMetrics: FpsMetrics, thermalMetrics: ThermalMetrics): Int {
        var score = 100

        if (fpsMetrics.fpsStability < 90) score -= 10
        if (fpsMetrics.fpsStability < 80) score -= 10
        if (fpsMetrics.fpsStability < 70) score -= 10

        score -= (fpsMetrics.jankCount / 10).coerceAtMost(20)
        score -= (fpsMetrics.bigJankCount * 2).coerceAtMost(20)

        if (thermalMetrics.thermalThrottleCount > 0) score -= 5
        if (thermalMetrics.thermalThrottleCount > 3) score -= 10

        if (thermalMetrics.maxTemperature > 50) score -= 10
        if (thermalMetrics.maxTemperature > 55) score -= 10

        return score.coerceIn(0, 100)
    }

    private fun calculateOverallScore(
        fpsMetrics: FpsMetrics,
        thermalMetrics: ThermalMetrics,
        stabilityScore: Int
    ): Int {
        val fpsScore = when {
            fpsMetrics.averageFps >= 60 -> 100
            fpsMetrics.averageFps >= 55 -> 90
            fpsMetrics.averageFps >= 50 -> 80
            fpsMetrics.averageFps >= 45 -> 70
            fpsMetrics.averageFps >= 40 -> 60
            fpsMetrics.averageFps >= 30 -> 50
            else -> 30
        }

        val thermalScore = when {
            thermalMetrics.avgTemperature <= 40 -> 100
            thermalMetrics.avgTemperature <= 42 -> 90
            thermalMetrics.avgTemperature <= 45 -> 80
            thermalMetrics.avgTemperature <= 48 -> 70
            thermalMetrics.avgTemperature <= 50 -> 60
            else -> 50
        }

        return (fpsScore * 0.4 + stabilityScore * 0.35 + thermalScore * 0.25).toInt()
    }

    private fun generateRecommendations(
        fpsMetrics: FpsMetrics,
        thermalMetrics: ThermalMetrics,
        frequencyMetrics: FrequencyMetrics
    ): List<String> {
        val recommendations = mutableListOf<String>()

        if (fpsMetrics.averageFps < 50) {
            recommendations.add("考虑降低游戏画质设置以提升帧率")
        }

        if (fpsMetrics.jankCount > 50) {
            recommendations.add("卡顿次数较多，建议关闭后台应用释放资源")
        }

        if (thermalMetrics.maxTemperature > 48) {
            recommendations.add("设备发热严重，建议使用散热配件或在凉爽环境下游戏")
        }

        if (thermalMetrics.thermalThrottleCount > 2) {
            recommendations.add("频繁触发温控降频，建议缩短游戏时长或降低画质")
        }

        if (frequencyMetrics.throttleEvents > 5) {
            recommendations.add("CPU频繁降频，性能表现受限，建议检查散热状况")
        }

        if (fpsMetrics.fpsStability < 80) {
            recommendations.add("帧率波动较大，建议开启游戏帧率锁定功能")
        }

        if (recommendations.isEmpty()) {
            recommendations.add("当前游戏性能表现良好，无需调整")
        }

        return recommendations
    }

    private fun generateReportId(): String {
        val dateFormat = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault())
        return "GPR_${dateFormat.format(Date())}"
    }

    fun saveReportToFile(report: GamePerformanceReport): File {
        val reportJson = json.encodeToString(report)
        val fileName = "${report.reportId}.json"
        val reportsDir = File(context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), "GameReports")
        if (!reportsDir.exists()) {
            reportsDir.mkdirs()
        }
        val reportFile = File(reportsDir, fileName)
        reportFile.writeText(reportJson)
        return reportFile
    }

    fun loadReportsFromFile(): List<GamePerformanceReport> {
        val reportsDir = File(context.getExternalFilesDir(Environment.DIRECTORY_DOCUMENTS), "GameReports")
        if (!reportsDir.exists()) return emptyList()

        return reportsDir.listFiles { file -> file.extension == "json" }
            ?.mapNotNull { file ->
                try {
                    Json.decodeFromString<GamePerformanceReport>(file.readText())
                } catch (e: Exception) {
                    null
                }
            } ?: emptyList()
    }
}

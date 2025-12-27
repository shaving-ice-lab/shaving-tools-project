package com.shavingtools.fpsmonitor.domain.usecase

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject

/**
 * 报告分享用例 - 生成并分享性能报告
 */
class ShareReportUseCase @Inject constructor(
    private val context: Context
) {
    
    data class ReportData(
        val sessionId: Long,
        val appName: String,
        val startTime: Long,
        val endTime: Long,
        val avgFps: Float,
        val minFps: Float,
        val maxFps: Float,
        val fps1Low: Float,
        val fps01Low: Float,
        val jankCount: Int,
        val avgCpuUsage: Float,
        val avgTemperature: Float,
        val fpsRecords: List<FpsRecord>
    )
    
    data class FpsRecord(
        val timestamp: Long,
        val fps: Float,
        val cpuUsage: Float,
        val temperature: Float
    )
    
    /**
     * 生成并分享JSON报告
     */
    suspend fun shareAsJson(reportData: ReportData): Boolean = withContext(Dispatchers.IO) {
        try {
            val jsonContent = generateJsonReport(reportData)
            val file = saveToFile(jsonContent, "report_${reportData.sessionId}.json")
            shareFile(file, "application/json")
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * 生成并分享CSV报告
     */
    suspend fun shareAsCsv(reportData: ReportData): Boolean = withContext(Dispatchers.IO) {
        try {
            val csvContent = generateCsvReport(reportData)
            val file = saveToFile(csvContent, "report_${reportData.sessionId}.csv")
            shareFile(file, "text/csv")
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * 生成并分享文本报告
     */
    suspend fun shareAsText(reportData: ReportData): Boolean = withContext(Dispatchers.IO) {
        try {
            val textContent = generateTextReport(reportData)
            shareText(textContent)
            true
        } catch (e: Exception) {
            false
        }
    }
    
    /**
     * 生成JSON报告
     */
    private fun generateJsonReport(data: ReportData): String {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
        
        val json = JSONObject().apply {
            put("report_version", "1.0")
            put("generated_at", dateFormat.format(Date()))
            put("session", JSONObject().apply {
                put("id", data.sessionId)
                put("app_name", data.appName)
                put("start_time", dateFormat.format(Date(data.startTime)))
                put("end_time", dateFormat.format(Date(data.endTime)))
                put("duration_seconds", (data.endTime - data.startTime) / 1000)
            })
            put("summary", JSONObject().apply {
                put("avg_fps", data.avgFps)
                put("min_fps", data.minFps)
                put("max_fps", data.maxFps)
                put("fps_1_low", data.fps1Low)
                put("fps_01_low", data.fps01Low)
                put("jank_count", data.jankCount)
                put("avg_cpu_usage", data.avgCpuUsage)
                put("avg_temperature", data.avgTemperature)
            })
            put("records", JSONArray().apply {
                data.fpsRecords.forEach { record ->
                    put(JSONObject().apply {
                        put("timestamp", record.timestamp)
                        put("fps", record.fps)
                        put("cpu_usage", record.cpuUsage)
                        put("temperature", record.temperature)
                    })
                }
            })
        }
        
        return json.toString(2)
    }
    
    /**
     * 生成CSV报告
     */
    private fun generateCsvReport(data: ReportData): String {
        val sb = StringBuilder()
        
        // 添加摘要信息
        sb.appendLine("# FPS Monitor Report")
        sb.appendLine("# App: ${data.appName}")
        sb.appendLine("# Session ID: ${data.sessionId}")
        sb.appendLine("# Avg FPS: ${data.avgFps}")
        sb.appendLine("# Min FPS: ${data.minFps}")
        sb.appendLine("# Max FPS: ${data.maxFps}")
        sb.appendLine("# 1% Low: ${data.fps1Low}")
        sb.appendLine("# 0.1% Low: ${data.fps01Low}")
        sb.appendLine("# Jank Count: ${data.jankCount}")
        sb.appendLine()
        
        // CSV头
        sb.appendLine("Timestamp,FPS,CPU Usage (%),Temperature (°C)")
        
        // 数据行
        data.fpsRecords.forEach { record ->
            sb.appendLine("${record.timestamp},${record.fps},${record.cpuUsage},${record.temperature}")
        }
        
        return sb.toString()
    }
    
    /**
     * 生成文本报告
     */
    private fun generateTextReport(data: ReportData): String {
        val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
        val duration = (data.endTime - data.startTime) / 1000
        
        return """
            |📊 FPS Monitor 性能报告
            |
            |📱 应用: ${data.appName}
            |🕐 测试时长: ${duration}秒
            |📅 测试时间: ${dateFormat.format(Date(data.startTime))}
            |
            |📈 帧率统计:
            |   平均帧率: ${String.format("%.1f", data.avgFps)} FPS
            |   最高帧率: ${String.format("%.1f", data.maxFps)} FPS
            |   最低帧率: ${String.format("%.1f", data.minFps)} FPS
            |   1% Low: ${String.format("%.1f", data.fps1Low)} FPS
            |   0.1% Low: ${String.format("%.1f", data.fps01Low)} FPS
            |
            |⚠️ 卡顿统计:
            |   卡顿次数: ${data.jankCount}
            |
            |🌡️ 性能指标:
            |   平均CPU占用: ${String.format("%.1f", data.avgCpuUsage)}%
            |   平均温度: ${String.format("%.1f", data.avgTemperature)}°C
            |
            |--- Generated by FPS Monitor ---
        """.trimMargin()
    }
    
    /**
     * 保存到文件
     */
    private fun saveToFile(content: String, fileName: String): File {
        val dir = File(context.cacheDir, "reports")
        if (!dir.exists()) {
            dir.mkdirs()
        }
        
        val file = File(dir, fileName)
        file.writeText(content)
        return file
    }
    
    /**
     * 分享文件
     */
    private fun shareFile(file: File, mimeType: String) {
        val uri: Uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )
        
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = mimeType
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        
        val chooser = Intent.createChooser(intent, "分享性能报告")
        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(chooser)
    }
    
    /**
     * 分享文本
     */
    private fun shareText(text: String) {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, text)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        
        val chooser = Intent.createChooser(intent, "分享性能报告")
        chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        context.startActivity(chooser)
    }
}

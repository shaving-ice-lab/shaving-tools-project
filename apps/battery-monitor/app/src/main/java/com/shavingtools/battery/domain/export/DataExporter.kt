package com.shavingtools.battery.domain.export

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.shavingtools.battery.domain.model.BatteryRecord
import com.shavingtools.battery.domain.model.TestReport
import com.shavingtools.battery.domain.model.TestSession
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DataExporter @Inject constructor() {

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
    private val fileNameFormat = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault())

    fun exportSessionToJson(session: TestSession, records: List<BatteryRecord>): String {
        val json = JSONObject().apply {
            put("session", sessionToJson(session))
            put("records", JSONArray().apply {
                records.forEach { put(recordToJson(it)) }
            })
        }
        return json.toString(2)
    }

    fun exportSessionToCsv(session: TestSession, records: List<BatteryRecord>): String {
        val sb = StringBuilder()

        // Session info header
        sb.appendLine("# 测试会话信息")
        sb.appendLine("场景,${session.scenarioName}")
        sb.appendLine("开始时间,${dateFormat.format(Date(session.startTime))}")
        session.endTime?.let { sb.appendLine("结束时间,${dateFormat.format(Date(it))}") }
        sb.appendLine("开始电量,${session.startLevel}%")
        session.endLevel?.let { sb.appendLine("结束电量,$it%") }
        sb.appendLine("续航时间,${session.durationText}")
        sb.appendLine("放电速率,${session.dischargeRateText}")
        session.averageTemperature?.let { sb.appendLine("平均温度,${String.format("%.1f°C", it)}") }
        session.maxTemperature?.let { sb.appendLine("最高温度,${String.format("%.1f°C", it)}") }
        sb.appendLine("设备型号,${session.deviceModel}")
        sb.appendLine("系统版本,Android ${session.androidVersion}")
        sb.appendLine()

        // Records header
        sb.appendLine("# 电池记录数据")
        sb.appendLine("时间戳,时间,电量(%),状态,温度(°C),电压(mV),电流(mA)")

        // Records data
        records.forEach { record ->
            sb.appendLine(
                "${record.timestamp}," +
                "${dateFormat.format(Date(record.timestamp))}," +
                "${record.level}," +
                "${record.status}," +
                "${record.temperature}," +
                "${record.voltage}," +
                "${record.current}"
            )
        }

        return sb.toString()
    }

    fun exportReportToJson(report: TestReport): String {
        val json = JSONObject().apply {
            put("reportId", report.id)
            put("generatedAt", dateFormat.format(Date(report.generatedAt)))
            put("deviceInfo", JSONObject().apply {
                put("model", report.deviceInfo.model)
                put("manufacturer", report.deviceInfo.manufacturer)
                put("androidVersion", report.deviceInfo.androidVersion)
                put("sdkVersion", report.deviceInfo.sdkVersion)
            })
            put("scenario", JSONObject().apply {
                put("id", report.scenario.id)
                put("name", report.scenario.name)
                put("description", report.scenario.description)
            })
            put("session", sessionToJson(report.session))
            put("analysis", JSONObject().apply {
                put("totalDurationMinutes", report.totalDurationMinutes)
                put("averageTemperature", report.averageTemperature)
                put("maxTemperature", report.maxTemperature)
                put("minTemperature", report.minTemperature)
                put("averageDischargeRate", report.averageDischargeRate)
                put("peakDischargeRate", report.peakDischargeRate)
            })
            put("records", JSONArray().apply {
                report.records.forEach { put(recordToJson(it)) }
            })
        }
        return json.toString(2)
    }

    fun saveToFile(context: Context, content: String, fileName: String): File {
        val exportDir = File(context.getExternalFilesDir(null), "exports")
        if (!exportDir.exists()) {
            exportDir.mkdirs()
        }

        val file = File(exportDir, fileName)
        file.writeText(content)
        return file
    }

    fun shareFile(context: Context, file: File, mimeType: String) {
        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )

        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = mimeType
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }

        context.startActivity(
            Intent.createChooser(shareIntent, "分享测试数据")
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        )
    }

    fun shareText(context: Context, text: String, subject: String) {
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_SUBJECT, subject)
            putExtra(Intent.EXTRA_TEXT, text)
        }

        context.startActivity(
            Intent.createChooser(shareIntent, "分享测试报告")
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        )
    }

    fun generateFileName(prefix: String, extension: String): String {
        return "${prefix}_${fileNameFormat.format(Date())}.$extension"
    }

    private fun sessionToJson(session: TestSession): JSONObject {
        return JSONObject().apply {
            put("id", session.id)
            put("scenarioId", session.scenarioId)
            put("scenarioName", session.scenarioName)
            put("startTime", session.startTime)
            put("startTimeFormatted", dateFormat.format(Date(session.startTime)))
            session.endTime?.let {
                put("endTime", it)
                put("endTimeFormatted", dateFormat.format(Date(it)))
            }
            put("startLevel", session.startLevel)
            session.endLevel?.let { put("endLevel", it) }
            session.totalDurationMinutes?.let { put("totalDurationMinutes", it) }
            session.averageDischargeRate?.let { put("averageDischargeRate", it) }
            session.averageTemperature?.let { put("averageTemperature", it) }
            session.maxTemperature?.let { put("maxTemperature", it) }
            put("deviceModel", session.deviceModel)
            put("androidVersion", session.androidVersion)
            put("isCompleted", session.isCompleted)
        }
    }

    private fun recordToJson(record: BatteryRecord): JSONObject {
        return JSONObject().apply {
            put("timestamp", record.timestamp)
            put("timeFormatted", dateFormat.format(Date(record.timestamp)))
            put("level", record.level)
            put("status", record.status)
            put("health", record.health)
            put("temperature", record.temperature)
            put("voltage", record.voltage)
            put("current", record.current)
            put("plugType", record.plugType)
            put("technology", record.technology)
        }
    }
}

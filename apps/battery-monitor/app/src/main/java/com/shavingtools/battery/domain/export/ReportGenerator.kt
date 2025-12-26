package com.shavingtools.battery.domain.export

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import android.os.Build
import com.shavingtools.battery.data.repository.BatteryRepository
import com.shavingtools.battery.domain.analyzer.BatteryAnalyzer
import com.shavingtools.battery.domain.model.DeviceInfo
import com.shavingtools.battery.domain.model.TestReport
import com.shavingtools.battery.domain.model.TestScenarios
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ReportGenerator @Inject constructor(
    private val repository: BatteryRepository,
    private val analyzer: BatteryAnalyzer
) {
    private val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())

    suspend fun generateReport(sessionId: String): Result<TestReport> {
        return try {
            val session = repository.getSessionById(sessionId)
                ?: return Result.failure(Exception("测试会话不存在"))

            val records = repository.getRecordsForSessionSync(sessionId)
            if (records.isEmpty()) {
                return Result.failure(Exception("没有测试记录数据"))
            }

            val scenario = TestScenarios.ALL.find { it.id == session.scenarioId }
                ?: TestScenarios.COMPREHENSIVE

            val deviceInfo = DeviceInfo(
                model = Build.MODEL,
                manufacturer = Build.MANUFACTURER,
                androidVersion = Build.VERSION.RELEASE,
                sdkVersion = Build.VERSION.SDK_INT
            )

            val report = TestReport(
                id = "${session.id}_report",
                deviceInfo = deviceInfo,
                scenario = scenario,
                session = session,
                records = records,
                totalDurationMinutes = analyzer.calculateBatteryLifeMinutes(records),
                averageTemperature = analyzer.calculateAverageTemperature(records),
                maxTemperature = analyzer.calculateMaxTemperature(records),
                minTemperature = analyzer.calculateMinTemperature(records),
                averageDischargeRate = analyzer.calculateDischargeRate(records),
                peakDischargeRate = analyzer.calculatePeakDischargeRate(records)
            )

            Result.success(report)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun exportToPdf(context: Context, report: TestReport): File {
        val pdfDocument = PdfDocument()
        val pageWidth = 595
        val pageHeight = 842
        val margin = 40f

        val pageInfo = PdfDocument.PageInfo.Builder(pageWidth, pageHeight, 1).create()
        val page = pdfDocument.startPage(pageInfo)
        val canvas = page.canvas

        val titlePaint = Paint().apply {
            color = Color.parseColor("#4CAF50")
            textSize = 24f
            isFakeBoldText = true
        }

        val headerPaint = Paint().apply {
            color = Color.parseColor("#333333")
            textSize = 16f
            isFakeBoldText = true
        }

        val textPaint = Paint().apply {
            color = Color.parseColor("#666666")
            textSize = 12f
        }

        val valuePaint = Paint().apply {
            color = Color.parseColor("#333333")
            textSize = 12f
        }

        var yPos = margin + 30f

        // Title
        canvas.drawText("电池续航测试报告", margin, yPos, titlePaint)
        yPos += 40f

        // Generated time
        canvas.drawText("生成时间: ${dateFormat.format(Date(report.generatedAt))}", margin, yPos, textPaint)
        yPos += 30f

        // Device Info Section
        canvas.drawText("设备信息", margin, yPos, headerPaint)
        yPos += 25f
        drawInfoRow(canvas, "设备型号", report.deviceInfo.model, margin, yPos, textPaint, valuePaint)
        yPos += 20f
        drawInfoRow(canvas, "制造商", report.deviceInfo.manufacturer, margin, yPos, textPaint, valuePaint)
        yPos += 20f
        drawInfoRow(canvas, "系统版本", "Android ${report.deviceInfo.androidVersion}", margin, yPos, textPaint, valuePaint)
        yPos += 35f

        // Test Info Section
        canvas.drawText("测试信息", margin, yPos, headerPaint)
        yPos += 25f
        drawInfoRow(canvas, "测试场景", report.scenario.name, margin, yPos, textPaint, valuePaint)
        yPos += 20f
        drawInfoRow(canvas, "场景描述", report.scenario.description, margin, yPos, textPaint, valuePaint)
        yPos += 20f
        drawInfoRow(canvas, "开始时间", dateFormat.format(Date(report.session.startTime)), margin, yPos, textPaint, valuePaint)
        yPos += 20f
        report.session.endTime?.let {
            drawInfoRow(canvas, "结束时间", dateFormat.format(Date(it)), margin, yPos, textPaint, valuePaint)
            yPos += 20f
        }
        drawInfoRow(canvas, "开始电量", "${report.session.startLevel}%", margin, yPos, textPaint, valuePaint)
        yPos += 20f
        report.session.endLevel?.let {
            drawInfoRow(canvas, "结束电量", "$it%", margin, yPos, textPaint, valuePaint)
            yPos += 20f
        }
        yPos += 15f

        // Analysis Section
        canvas.drawText("分析结果", margin, yPos, headerPaint)
        yPos += 25f
        drawInfoRow(canvas, "总续航时间", formatDuration(report.totalDurationMinutes), margin, yPos, textPaint, valuePaint)
        yPos += 20f
        drawInfoRow(canvas, "平均放电速率", String.format("%.1f%%/小时", report.averageDischargeRate), margin, yPos, textPaint, valuePaint)
        yPos += 20f
        drawInfoRow(canvas, "峰值放电速率", String.format("%.1f%%/小时", report.peakDischargeRate), margin, yPos, textPaint, valuePaint)
        yPos += 20f
        drawInfoRow(canvas, "平均温度", String.format("%.1f°C", report.averageTemperature), margin, yPos, textPaint, valuePaint)
        yPos += 20f
        drawInfoRow(canvas, "最高温度", String.format("%.1f°C", report.maxTemperature), margin, yPos, textPaint, valuePaint)
        yPos += 20f
        drawInfoRow(canvas, "最低温度", String.format("%.1f°C", report.minTemperature), margin, yPos, textPaint, valuePaint)
        yPos += 35f

        // Summary Section
        canvas.drawText("测试总结", margin, yPos, headerPaint)
        yPos += 25f

        val summary = buildSummary(report)
        summary.lines().forEach { line ->
            canvas.drawText(line, margin, yPos, textPaint)
            yPos += 18f
        }

        // Footer
        val footerPaint = Paint().apply {
            color = Color.parseColor("#999999")
            textSize = 10f
        }
        canvas.drawText(
            "由「电池续航分析工具」生成",
            margin,
            pageHeight - margin,
            footerPaint
        )

        pdfDocument.finishPage(page)

        // Save file
        val exportDir = File(context.getExternalFilesDir(null), "exports")
        if (!exportDir.exists()) {
            exportDir.mkdirs()
        }

        val fileName = "battery_report_${System.currentTimeMillis()}.pdf"
        val file = File(exportDir, fileName)

        FileOutputStream(file).use { output ->
            pdfDocument.writeTo(output)
        }
        pdfDocument.close()

        return file
    }

    private fun drawInfoRow(
        canvas: Canvas,
        label: String,
        value: String,
        x: Float,
        y: Float,
        labelPaint: Paint,
        valuePaint: Paint
    ) {
        canvas.drawText("$label:", x, y, labelPaint)
        canvas.drawText(value, x + 100f, y, valuePaint)
    }

    private fun formatDuration(minutes: Long): String {
        val hours = minutes / 60
        val mins = minutes % 60
        return if (hours > 0) "${hours}小时${mins}分钟" else "${mins}分钟"
    }

    private fun buildSummary(report: TestReport): String {
        val sb = StringBuilder()

        // Battery performance assessment
        val dischargeRate = report.averageDischargeRate
        val performance = when {
            dischargeRate < 5 -> "优秀"
            dischargeRate < 10 -> "良好"
            dischargeRate < 15 -> "一般"
            else -> "较差"
        }
        sb.appendLine("电池续航表现: $performance")

        // Temperature assessment
        val maxTemp = report.maxTemperature
        val tempStatus = when {
            maxTemp < 35 -> "正常"
            maxTemp < 40 -> "偏高"
            maxTemp < 45 -> "过热警告"
            else -> "严重过热"
        }
        sb.appendLine("温度状况: $tempStatus")

        // Estimated full discharge time
        if (dischargeRate > 0) {
            val estimatedHours = 100 / dischargeRate
            sb.appendLine("预计满电续航: ${String.format("%.1f", estimatedHours)}小时")
        }

        return sb.toString()
    }

    fun generateTextReport(report: TestReport): String {
        return buildString {
            appendLine("═══════════════════════════════════════")
            appendLine("        电池续航测试报告")
            appendLine("═══════════════════════════════════════")
            appendLine()
            appendLine("【设备信息】")
            appendLine("  设备型号: ${report.deviceInfo.model}")
            appendLine("  制造商: ${report.deviceInfo.manufacturer}")
            appendLine("  系统版本: Android ${report.deviceInfo.androidVersion}")
            appendLine()
            appendLine("【测试信息】")
            appendLine("  测试场景: ${report.scenario.name}")
            appendLine("  场景描述: ${report.scenario.description}")
            appendLine("  开始时间: ${dateFormat.format(Date(report.session.startTime))}")
            report.session.endTime?.let {
                appendLine("  结束时间: ${dateFormat.format(Date(it))}")
            }
            appendLine("  开始电量: ${report.session.startLevel}%")
            report.session.endLevel?.let {
                appendLine("  结束电量: $it%")
            }
            appendLine()
            appendLine("【分析结果】")
            appendLine("  总续航时间: ${formatDuration(report.totalDurationMinutes)}")
            appendLine("  平均放电速率: ${String.format("%.1f%%/小时", report.averageDischargeRate)}")
            appendLine("  峰值放电速率: ${String.format("%.1f%%/小时", report.peakDischargeRate)}")
            appendLine("  平均温度: ${String.format("%.1f°C", report.averageTemperature)}")
            appendLine("  最高温度: ${String.format("%.1f°C", report.maxTemperature)}")
            appendLine("  最低温度: ${String.format("%.1f°C", report.minTemperature)}")
            appendLine()
            appendLine("【测试总结】")
            appendLine(buildSummary(report))
            appendLine("═══════════════════════════════════════")
            appendLine("生成时间: ${dateFormat.format(Date(report.generatedAt))}")
            appendLine("由「电池续航分析工具」生成")
        }
    }
}

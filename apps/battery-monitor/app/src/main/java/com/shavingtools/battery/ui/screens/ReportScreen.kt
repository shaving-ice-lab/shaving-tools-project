package com.shavingtools.battery.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.PictureAsPdf
import androidx.compose.material.icons.filled.Share
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.shavingtools.battery.domain.model.TestReport
import com.shavingtools.battery.ui.components.BatteryLevelChart
import com.shavingtools.battery.ui.components.TemperatureChart
import com.shavingtools.battery.ui.viewmodel.ReportViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReportScreen(
    sessionId: String,
    onBack: () -> Unit,
    viewModel: ReportViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val report by viewModel.report.collectAsState()
    val isLoading by viewModel.isLoading.collectAsState()
    val error by viewModel.error.collectAsState()

    LaunchedEffect(sessionId) {
        viewModel.loadReport(sessionId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("测试报告") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "返回")
                    }
                }
            )
        }
    ) { padding ->
        when {
            isLoading -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    CircularProgressIndicator()
                    Spacer(modifier = Modifier.height(16.dp))
                    Text("正在生成报告...")
                }
            }
            error != null -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(padding),
                    verticalArrangement = Arrangement.Center,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = error ?: "未知错误",
                        color = MaterialTheme.colorScheme.error
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(onClick = onBack) {
                        Text("返回")
                    }
                }
            }
            report != null -> {
                ReportContent(
                    report = report!!,
                    onExportPdf = { viewModel.exportToPdf(context) },
                    onExportJson = { viewModel.exportToJson(context) },
                    onExportCsv = { viewModel.exportToCsv(context) },
                    onShare = { viewModel.shareReport(context) },
                    modifier = Modifier.padding(padding)
                )
            }
        }
    }
}

@Composable
fun ReportContent(
    report: TestReport,
    onExportPdf: () -> Unit,
    onExportJson: () -> Unit,
    onExportCsv: () -> Unit,
    onShare: () -> Unit,
    modifier: Modifier = Modifier
) {
    val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // Export Buttons
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(
                onClick = onExportPdf,
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.PictureAsPdf, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("PDF")
            }
            OutlinedButton(
                onClick = onExportJson,
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Description, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("JSON")
            }
            OutlinedButton(
                onClick = onShare,
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Share, contentDescription = null)
                Spacer(modifier = Modifier.width(4.dp))
                Text("分享")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Device Info Card
        ReportCard(title = "设备信息") {
            ReportRow("设备型号", report.deviceInfo.model)
            ReportRow("制造商", report.deviceInfo.manufacturer)
            ReportRow("系统版本", "Android ${report.deviceInfo.androidVersion}")
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Test Info Card
        ReportCard(title = "测试信息") {
            ReportRow("测试场景", report.scenario.name)
            ReportRow("开始时间", dateFormat.format(Date(report.session.startTime)))
            report.session.endTime?.let {
                ReportRow("结束时间", dateFormat.format(Date(it)))
            }
            ReportRow("开始电量", "${report.session.startLevel}%")
            report.session.endLevel?.let {
                ReportRow("结束电量", "$it%")
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Analysis Card
        ReportCard(title = "分析结果") {
            ReportRow("总续航时间", formatDuration(report.totalDurationMinutes))
            ReportRow("平均放电速率", String.format("%.1f%%/小时", report.averageDischargeRate))
            ReportRow("峰值放电速率", String.format("%.1f%%/小时", report.peakDischargeRate))
            ReportRow("平均温度", String.format("%.1f°C", report.averageTemperature))
            ReportRow("最高温度", String.format("%.1f°C", report.maxTemperature))
            ReportRow("最低温度", String.format("%.1f°C", report.minTemperature))
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Summary Card
        ReportCard(title = "测试总结") {
            val dischargeRate = report.averageDischargeRate
            val performance = when {
                dischargeRate < 5 -> "优秀 ⭐⭐⭐"
                dischargeRate < 10 -> "良好 ⭐⭐"
                dischargeRate < 15 -> "一般 ⭐"
                else -> "较差"
            }
            ReportRow("续航表现", performance)

            val maxTemp = report.maxTemperature
            val tempStatus = when {
                maxTemp < 35 -> "正常 ✓"
                maxTemp < 40 -> "偏高 ⚠"
                maxTemp < 45 -> "过热警告 ⚠⚠"
                else -> "严重过热 ⚠⚠⚠"
            }
            ReportRow("温度状况", tempStatus)

            if (dischargeRate > 0) {
                val estimatedHours = 100 / dischargeRate
                ReportRow("预计满电续航", String.format("%.1f小时", estimatedHours))
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Battery Chart
        if (report.records.isNotEmpty()) {
            Text(
                text = "电量变化曲线",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            BatteryLevelChart(records = report.records)

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "温度变化曲线",
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            TemperatureChart(records = report.records)
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Footer
        Text(
            text = "报告生成时间: ${dateFormat.format(Date(report.generatedAt))}",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
fun ReportCard(
    title: String,
    content: @Composable () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        )
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.height(12.dp))
            content()
        }
    }
}

@Composable
fun ReportRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

private fun formatDuration(minutes: Long): String {
    val hours = minutes / 60
    val mins = minutes % 60
    return if (hours > 0) "${hours}小时${mins}分钟" else "${mins}分钟"
}

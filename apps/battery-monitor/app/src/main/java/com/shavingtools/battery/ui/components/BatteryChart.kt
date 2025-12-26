package com.shavingtools.battery.ui.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.patrykandpatrick.vico.compose.axis.horizontal.rememberBottomAxis
import com.patrykandpatrick.vico.compose.axis.vertical.rememberStartAxis
import com.patrykandpatrick.vico.compose.chart.Chart
import com.patrykandpatrick.vico.compose.chart.line.lineChart
import com.patrykandpatrick.vico.compose.style.ProvideChartStyle
import com.patrykandpatrick.vico.core.entry.ChartEntryModelProducer
import com.patrykandpatrick.vico.core.entry.entryOf
import com.shavingtools.battery.domain.model.BatteryRecord
import com.shavingtools.battery.ui.theme.BatteryHigh
import com.shavingtools.battery.ui.theme.TempNormal
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun BatteryLevelChart(
    records: List<BatteryRecord>,
    modifier: Modifier = Modifier
) {
    if (records.isEmpty()) return

    val chartEntryModelProducer = remember(records) {
        val entries = records.mapIndexed { index, record ->
            entryOf(index.toFloat(), record.level.toFloat())
        }
        ChartEntryModelProducer(entries)
    }

    ProvideChartStyle {
        Chart(
            chart = lineChart(),
            chartModelProducer = chartEntryModelProducer,
            startAxis = rememberStartAxis(
                title = "电量 (%)"
            ),
            bottomAxis = rememberBottomAxis(
                title = "时间"
            ),
            modifier = modifier
                .fillMaxWidth()
                .height(200.dp)
        )
    }
}

@Composable
fun TemperatureChart(
    records: List<BatteryRecord>,
    modifier: Modifier = Modifier
) {
    if (records.isEmpty()) return

    val chartEntryModelProducer = remember(records) {
        val entries = records.mapIndexed { index, record ->
            entryOf(index.toFloat(), record.temperature)
        }
        ChartEntryModelProducer(entries)
    }

    ProvideChartStyle {
        Chart(
            chart = lineChart(),
            chartModelProducer = chartEntryModelProducer,
            startAxis = rememberStartAxis(
                title = "温度 (°C)"
            ),
            bottomAxis = rememberBottomAxis(
                title = "时间"
            ),
            modifier = modifier
                .fillMaxWidth()
                .height(200.dp)
        )
    }
}

fun formatTimestamp(timestamp: Long): String {
    val sdf = SimpleDateFormat("HH:mm", Locale.getDefault())
    return sdf.format(Date(timestamp))
}

package com.shavingtools.battery.ui.screens

import android.content.Context
import android.content.Intent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BatteryChargingFull
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Schedule
import androidx.compose.material.icons.filled.Thermostat
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.shavingtools.battery.domain.model.BatteryStatus
import com.shavingtools.battery.service.BatteryMonitorService
import com.shavingtools.battery.ui.components.BatteryGauge
import com.shavingtools.battery.ui.components.BatteryLevelChart
import com.shavingtools.battery.ui.components.InfoCard
import com.shavingtools.battery.ui.theme.getTemperatureColor
import com.shavingtools.battery.ui.viewmodel.DashboardViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val batteryInfo by viewModel.batteryInfo.collectAsState()
    val isMonitorRunning by viewModel.isMonitorRunning.collectAsState()
    val recentRecords by viewModel.recentRecords.collectAsState()
    val healthScore by viewModel.healthScore.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("电池监控") }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Battery Gauge
            BatteryGauge(
                level = batteryInfo?.level ?: 0,
                isCharging = batteryInfo?.status == BatteryStatus.CHARGING,
                statusText = batteryInfo?.status?.toDisplayString()
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Start/Stop Monitor Button
            Button(
                onClick = {
                    if (isMonitorRunning) {
                        context.stopService(Intent(context, BatteryMonitorService::class.java))
                    } else {
                        context.startForegroundService(
                            Intent(context, BatteryMonitorService::class.java)
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (isMonitorRunning) "停止监控" else "开始监控")
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Info Cards Row 1
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                InfoCard(
                    title = "温度",
                    value = batteryInfo?.let { String.format("%.1f°C", it.temperature) } ?: "--",
                    icon = Icons.Default.Thermostat,
                    valueColor = batteryInfo?.let { getTemperatureColor(it.temperature) }
                        ?: MaterialTheme.colorScheme.primary,
                    modifier = Modifier.weight(1f)
                )
                InfoCard(
                    title = "电压",
                    value = batteryInfo?.let { "${it.voltage}mV" } ?: "--",
                    icon = Icons.Default.Bolt,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Info Cards Row 2
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                InfoCard(
                    title = "电流",
                    value = batteryInfo?.let { "${it.current}mA" } ?: "--",
                    icon = Icons.Default.BatteryChargingFull,
                    modifier = Modifier.weight(1f)
                )
                InfoCard(
                    title = "预计续航",
                    value = viewModel.formatPredictedTime(),
                    icon = Icons.Default.Schedule,
                    modifier = Modifier.weight(1f)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Discharge Rate
            InfoCard(
                title = "放电速率",
                value = viewModel.formatDischargeRate(),
                icon = Icons.Default.Bolt,
                subtitle = healthScore?.let { "电池健康: ${it.notes}" },
                modifier = Modifier.fillMaxWidth()
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Battery Chart
            if (recentRecords.isNotEmpty()) {
                Text(
                    text = "电量变化曲线",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.align(Alignment.Start)
                )
                Spacer(modifier = Modifier.height(8.dp))
                BatteryLevelChart(records = recentRecords)
            }
        }
    }
}

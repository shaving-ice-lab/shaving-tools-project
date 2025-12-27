package com.socanalyzer.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.socanalyzer.app.ui.viewmodel.MonitorViewModel

@Composable
fun MonitorScreen(
    viewModel: MonitorViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            SocInfoCard(
                socName = uiState.socInfo?.cpu?.name ?: "Unknown SoC",
                process = uiState.socInfo?.cpu?.process ?: "Unknown"
            )
        }
        
        item {
            CpuMonitorCard(
                usage = uiState.realtimeData?.cpu?.usage ?: 0f,
                temperature = uiState.realtimeData?.cpu?.temperature ?: 0f,
                frequencies = uiState.realtimeData?.cpu?.frequencies ?: emptyList()
            )
        }
        
        item {
            GpuMonitorCard(
                usage = uiState.realtimeData?.gpu?.usage ?: 0f,
                frequency = uiState.realtimeData?.gpu?.frequency ?: 0,
                temperature = uiState.realtimeData?.gpu?.temperature ?: 0f
            )
        }
        
        item {
            MemoryCard(
                usedMb = uiState.realtimeData?.memory?.used_mb ?: 0,
                availableMb = uiState.realtimeData?.memory?.available_mb ?: 0
            )
        }
        
        item {
            BatteryCard(
                temperature = uiState.realtimeData?.battery?.temperature ?: 0f,
                powerMw = uiState.realtimeData?.battery?.power_mw ?: 0
            )
        }
    }
}

@Composable
fun SocInfoCard(socName: String, process: String) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                Icons.Default.Memory,
                contentDescription = null,
                modifier = Modifier.size(48.dp),
                tint = MaterialTheme.colorScheme.primary
            )
            Spacer(modifier = Modifier.width(16.dp))
            Column {
                Text(
                    text = socName,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "制程: $process",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}

@Composable
fun CpuMonitorCard(usage: Float, temperature: Float, frequencies: List<Int>) {
    MonitorCard(
        title = "CPU",
        icon = Icons.Default.DeveloperBoard
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            StatItem(label = "使用率", value = "${usage.toInt()}%")
            StatItem(label = "温度", value = "${temperature.toInt()}°C")
            StatItem(label = "核心数", value = "${frequencies.size}")
        }
        
        Spacer(modifier = Modifier.height(12.dp))
        
        frequencies.forEachIndexed { index, freq ->
            val maxFreq = frequencies.maxOrNull() ?: 1
            val progress = freq.toFloat() / maxFreq.toFloat()
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "核心 $index",
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.width(60.dp)
                )
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .weight(1f)
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = when {
                        freq > 2500 -> Color(0xFFEF4444)
                        freq > 2000 -> Color(0xFFF97316)
                        freq > 1500 -> Color(0xFFEAB308)
                        else -> Color(0xFF22C55E)
                    }
                )
                Text(
                    text = "${freq} MHz",
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.width(80.dp),
                    textAlign = androidx.compose.ui.text.style.TextAlign.End
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
        }
    }
}

@Composable
fun GpuMonitorCard(usage: Float, frequency: Int, temperature: Float) {
    MonitorCard(
        title = "GPU",
        icon = Icons.Default.Videocam
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            StatItem(label = "使用率", value = "${usage.toInt()}%")
            StatItem(label = "频率", value = "${frequency} MHz")
            StatItem(label = "温度", value = "${temperature.toInt()}°C")
        }
    }
}

@Composable
fun MemoryCard(usedMb: Int, availableMb: Int) {
    val totalMb = usedMb + availableMb
    val usagePercent = if (totalMb > 0) (usedMb.toFloat() / totalMb.toFloat()) * 100 else 0f
    
    MonitorCard(
        title = "内存",
        icon = Icons.Default.Storage
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            StatItem(label = "已用", value = "${usedMb / 1024} GB")
            StatItem(label = "可用", value = "${availableMb / 1024} GB")
            StatItem(label = "使用率", value = "${usagePercent.toInt()}%")
        }
        
        Spacer(modifier = Modifier.height(8.dp))
        
        LinearProgressIndicator(
            progress = { usagePercent / 100f },
            modifier = Modifier
                .fillMaxWidth()
                .height(8.dp)
                .clip(RoundedCornerShape(4.dp)),
            color = MaterialTheme.colorScheme.primary
        )
    }
}

@Composable
fun BatteryCard(temperature: Float, powerMw: Int) {
    MonitorCard(
        title = "电池",
        icon = Icons.Default.BatteryChargingFull
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            StatItem(label = "温度", value = "${temperature.toInt()}°C")
            StatItem(label = "功耗", value = "${powerMw / 1000f} W")
        }
    }
}

@Composable
fun MonitorCard(
    title: String,
    icon: ImageVector,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(modifier = Modifier.height(12.dp))
            content()
        }
    }
}

@Composable
fun StatItem(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            style = MaterialTheme.typography.titleLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.primary
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

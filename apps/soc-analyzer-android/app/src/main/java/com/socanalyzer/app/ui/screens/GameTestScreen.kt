package com.socanalyzer.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

data class InstalledApp(
    val packageName: String,
    val appName: String,
    val isGame: Boolean = false
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GameTestScreen(
    onStartTest: (String, Int) -> Unit = { _, _ -> }
) {
    var selectedApp by remember { mutableStateOf<InstalledApp?>(null) }
    var testDuration by remember { mutableStateOf(60) }
    var isRunning by remember { mutableStateOf(false) }
    var progress by remember { mutableStateOf(0f) }
    var currentFps by remember { mutableStateOf(0f) }
    var avgFps by remember { mutableStateOf(0f) }
    var jankCount by remember { mutableStateOf(0) }
    var showAppPicker by remember { mutableStateOf(false) }
    
    val installedApps = remember {
        listOf(
            InstalledApp("com.tencent.tmgp.pubgmhd", "和平精英", true),
            InstalledApp("com.miHoYo.Yuanshen", "原神", true),
            InstalledApp("com.tencent.tmgp.sgame", "王者荣耀", true),
            InstalledApp("com.netease.dwrg", "第五人格", true),
            InstalledApp("com.tencent.lolm", "英雄联盟手游", true)
        )
    }
    
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "游戏性能测试",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "测试配置",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    
                    OutlinedCard(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = { showAppPicker = true }
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "选择测试应用",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = selectedApp?.appName ?: "未选择",
                                    style = MaterialTheme.typography.bodyLarge
                                )
                            }
                            Icon(
                                imageVector = Icons.Default.ArrowDropDown,
                                contentDescription = null
                            )
                        }
                    }
                    
                    Text(
                        text = "测试时长: ${testDuration}秒",
                        style = MaterialTheme.typography.bodyMedium
                    )
                    Slider(
                        value = testDuration.toFloat(),
                        onValueChange = { testDuration = it.toInt() },
                        valueRange = 30f..300f,
                        steps = 8
                    )
                    
                    Button(
                        onClick = {
                            selectedApp?.let { app ->
                                isRunning = true
                                onStartTest(app.packageName, testDuration)
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = selectedApp != null && !isRunning
                    ) {
                        Icon(
                            imageVector = if (isRunning) Icons.Default.Stop else Icons.Default.PlayArrow,
                            contentDescription = null
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(if (isRunning) "测试中..." else "开始测试")
                    }
                }
            }
        }
        
        if (isRunning) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "测试进行中",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        LinearProgressIndicator(
                            progress = progress,
                            modifier = Modifier.fillMaxWidth()
                        )
                        Text(
                            text = "进度: ${(progress * 100).toInt()}%",
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }
        }
        
        item {
            Text(
                text = "实时数据",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        }
        
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                MetricCard(
                    modifier = Modifier.weight(1f),
                    title = "当前帧率",
                    value = "${currentFps.toInt()}",
                    unit = "FPS",
                    color = when {
                        currentFps >= 55 -> Color(0xFF4CAF50)
                        currentFps >= 30 -> Color(0xFFFF9800)
                        else -> Color(0xFFF44336)
                    }
                )
                MetricCard(
                    modifier = Modifier.weight(1f),
                    title = "平均帧率",
                    value = "${avgFps.toInt()}",
                    unit = "FPS",
                    color = MaterialTheme.colorScheme.primary
                )
                MetricCard(
                    modifier = Modifier.weight(1f),
                    title = "卡顿次数",
                    value = "$jankCount",
                    unit = "次",
                    color = if (jankCount > 10) Color(0xFFF44336) else Color(0xFF4CAF50)
                )
            }
        }
        
        item {
            Text(
                text = "测试说明",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
        }
        
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    InfoRow("1.", "选择要测试的游戏应用")
                    InfoRow("2.", "设置测试时长")
                    InfoRow("3.", "点击开始测试，切换到游戏进行操作")
                    InfoRow("4.", "测试期间会记录帧率、帧时间等数据")
                    InfoRow("5.", "测试完成后可查看详细报告")
                }
            }
        }
    }
    
    if (showAppPicker) {
        AlertDialog(
            onDismissRequest = { showAppPicker = false },
            title = { Text("选择测试应用") },
            text = {
                LazyColumn {
                    items(installedApps) { app ->
                        ListItem(
                            headlineContent = { Text(app.appName) },
                            supportingContent = { Text(app.packageName) },
                            leadingContent = {
                                Icon(
                                    imageVector = Icons.Default.Gamepad,
                                    contentDescription = null
                                )
                            },
                            modifier = Modifier.clickable {
                                selectedApp = app
                                showAppPicker = false
                            }
                        )
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showAppPicker = false }) {
                    Text("取消")
                }
            }
        )
    }
}

@Composable
private fun MetricCard(
    modifier: Modifier = Modifier,
    title: String,
    value: String,
    unit: String,
    color: Color
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = color.copy(alpha = 0.1f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = value,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = color
            )
            Text(
                text = unit,
                style = MaterialTheme.typography.bodySmall,
                color = color
            )
        }
    }
}

@Composable
private fun InfoRow(number: String, text: String) {
    Row(
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = number,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

package com.socanalyzer.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.selection.selectable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen() {
    var autoConnect by remember { mutableStateOf(true) }
    var darkMode by remember { mutableStateOf(true) }
    var pushInterval by remember { mutableStateOf(100) }
    var showNotification by remember { mutableStateOf(true) }
    var keepScreenOn by remember { mutableStateOf(false) }
    var showIntervalDialog by remember { mutableStateOf(false) }
    
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        item {
            Text(
                text = "设置",
                style = MaterialTheme.typography.headlineMedium,
                modifier = Modifier.padding(bottom = 16.dp)
            )
        }
        
        item {
            Text(
                text = "连接设置",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
        
        item {
            SettingsSwitch(
                title = "自动连接",
                subtitle = "启动时自动连接上次的PC端",
                icon = Icons.Default.Wifi,
                checked = autoConnect,
                onCheckedChange = { autoConnect = it }
            )
        }
        
        item {
            SettingsItem(
                title = "数据推送间隔",
                subtitle = "${pushInterval}ms",
                icon = Icons.Default.Speed,
                onClick = { showIntervalDialog = true }
            )
        }
        
        item {
            Divider(modifier = Modifier.padding(vertical = 8.dp))
        }
        
        item {
            Text(
                text = "显示设置",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
        
        item {
            SettingsSwitch(
                title = "深色模式",
                subtitle = "使用深色主题",
                icon = Icons.Default.DarkMode,
                checked = darkMode,
                onCheckedChange = { darkMode = it }
            )
        }
        
        item {
            SettingsSwitch(
                title = "保持屏幕常亮",
                subtitle = "测试过程中保持屏幕常亮",
                icon = Icons.Default.Brightness7,
                checked = keepScreenOn,
                onCheckedChange = { keepScreenOn = it }
            )
        }
        
        item {
            Divider(modifier = Modifier.padding(vertical = 8.dp))
        }
        
        item {
            Text(
                text = "通知设置",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
        
        item {
            SettingsSwitch(
                title = "显示通知",
                subtitle = "在状态栏显示连接状态",
                icon = Icons.Default.Notifications,
                checked = showNotification,
                onCheckedChange = { showNotification = it }
            )
        }
        
        item {
            Divider(modifier = Modifier.padding(vertical = 8.dp))
        }
        
        item {
            Text(
                text = "关于",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.primary,
                modifier = Modifier.padding(vertical = 8.dp)
            )
        }
        
        item {
            SettingsItem(
                title = "版本",
                subtitle = "1.0.0",
                icon = Icons.Default.Info,
                onClick = { }
            )
        }
        
        item {
            SettingsItem(
                title = "开源许可",
                subtitle = "查看第三方库许可证",
                icon = Icons.Default.Description,
                onClick = { }
            )
        }
        
        item {
            SettingsItem(
                title = "隐私政策",
                subtitle = "查看隐私政策",
                icon = Icons.Default.PrivacyTip,
                onClick = { }
            )
        }
    }
    
    if (showIntervalDialog) {
        IntervalPickerDialog(
            currentInterval = pushInterval,
            onDismiss = { showIntervalDialog = false },
            onConfirm = { 
                pushInterval = it
                showIntervalDialog = false
            }
        )
    }
}

@Composable
fun SettingsSwitch(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
                Column {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.bodyLarge
                    )
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Switch(
                checked = checked,
                onCheckedChange = onCheckedChange
            )
        }
    }
}

@Composable
fun SettingsItem(
    title: String,
    subtitle: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = onClick,
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.primary
                )
                Column {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.bodyLarge
                    )
                    Text(
                        text = subtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun IntervalPickerDialog(
    currentInterval: Int,
    onDismiss: () -> Unit,
    onConfirm: (Int) -> Unit
) {
    val intervals = listOf(50, 100, 200, 500, 1000)
    var selectedInterval by remember { mutableStateOf(currentInterval) }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("数据推送间隔") },
        text = {
            Column {
                intervals.forEach { interval ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .selectable(
                                selected = selectedInterval == interval,
                                onClick = { selectedInterval = interval }
                            )
                            .padding(vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = selectedInterval == interval,
                            onClick = { selectedInterval = interval }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("${interval}ms")
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = { onConfirm(selectedInterval) }) {
                Text("确定")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("取消")
            }
        }
    )
}

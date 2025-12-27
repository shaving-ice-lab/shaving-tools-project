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
import java.text.SimpleDateFormat
import java.util.*

data class TestRecord(
    val id: String,
    val testType: TestType,
    val timestamp: Long,
    val deviceModel: String,
    val socName: String,
    val score: Int? = null,
    val result: String? = null
)

enum class TestType(val displayName: String, val icon: @Composable () -> Unit) {
    CPU_BENCHMARK("CPU跑分", { Icon(Icons.Default.Memory, null) }),
    GPU_BENCHMARK("GPU跑分", { Icon(Icons.Default.GraphicEq, null) }),
    AI_BENCHMARK("AI跑分", { Icon(Icons.Default.Psychology, null) }),
    STRESS_TEST("压力测试", { Icon(Icons.Default.LocalFireDepartment, null) }),
    GAME_TEST("游戏性能", { Icon(Icons.Default.Gamepad, null) })
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(
    onRecordClick: (TestRecord) -> Unit = {}
) {
    var selectedFilter by remember { mutableStateOf<TestType?>(null) }
    var showDeleteDialog by remember { mutableStateOf(false) }
    var recordToDelete by remember { mutableStateOf<TestRecord?>(null) }
    
    val testRecords = remember {
        listOf(
            TestRecord(
                id = "1",
                testType = TestType.CPU_BENCHMARK,
                timestamp = System.currentTimeMillis() - 3600000,
                deviceModel = "Xiaomi 14",
                socName = "Snapdragon 8 Gen 3",
                score = 2156432
            ),
            TestRecord(
                id = "2",
                testType = TestType.GPU_BENCHMARK,
                timestamp = System.currentTimeMillis() - 7200000,
                deviceModel = "Xiaomi 14",
                socName = "Snapdragon 8 Gen 3",
                score = 1523456
            ),
            TestRecord(
                id = "3",
                testType = TestType.STRESS_TEST,
                timestamp = System.currentTimeMillis() - 86400000,
                deviceModel = "Xiaomi 14",
                socName = "Snapdragon 8 Gen 3",
                result = "稳定性评分: 85"
            ),
            TestRecord(
                id = "4",
                testType = TestType.GAME_TEST,
                timestamp = System.currentTimeMillis() - 172800000,
                deviceModel = "Xiaomi 14",
                socName = "Snapdragon 8 Gen 3",
                result = "平均帧率: 58.5 FPS"
            )
        )
    }
    
    val filteredRecords = if (selectedFilter != null) {
        testRecords.filter { it.testType == selectedFilter }
    } else {
        testRecords
    }
    
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "测试历史",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(bottom = 16.dp)
        )
        
        ScrollableTabRow(
            selectedTabIndex = TestType.values().indexOf(selectedFilter).coerceAtLeast(0),
            edgePadding = 0.dp
        ) {
            Tab(
                selected = selectedFilter == null,
                onClick = { selectedFilter = null },
                text = { Text("全部") }
            )
            TestType.values().forEach { type ->
                Tab(
                    selected = selectedFilter == type,
                    onClick = { selectedFilter = type },
                    text = { Text(type.displayName) }
                )
            }
        }
        
        Spacer(modifier = Modifier.height(16.dp))
        
        if (filteredRecords.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.History,
                        contentDescription = null,
                        modifier = Modifier.size(64.dp),
                        tint = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                    )
                    Text(
                        text = "暂无测试记录",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(filteredRecords) { record ->
                    HistoryRecordCard(
                        record = record,
                        onClick = { onRecordClick(record) },
                        onDelete = {
                            recordToDelete = record
                            showDeleteDialog = true
                        }
                    )
                }
            }
        }
    }
    
    if (showDeleteDialog && recordToDelete != null) {
        AlertDialog(
            onDismissRequest = { showDeleteDialog = false },
            title = { Text("删除记录") },
            text = { Text("确定要删除这条测试记录吗？此操作不可撤销。") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showDeleteDialog = false
                        recordToDelete = null
                    }
                ) {
                    Text("删除", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDeleteDialog = false }) {
                    Text("取消")
                }
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun HistoryRecordCard(
    record: TestRecord,
    onClick: () -> Unit,
    onDelete: () -> Unit
) {
    val dateFormat = remember { SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()) }
    
    Card(
        modifier = Modifier.fillMaxWidth(),
        onClick = onClick
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    color = getTestTypeColor(record.testType).copy(alpha = 0.2f),
                    shape = MaterialTheme.shapes.medium
                ) {
                    Box(
                        modifier = Modifier.padding(8.dp)
                    ) {
                        record.testType.icon()
                    }
                }
                
                Column {
                    Text(
                        text = record.testType.displayName,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = record.socName,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = dateFormat.format(Date(record.timestamp)),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                    )
                }
            }
            
            Column(
                horizontalAlignment = Alignment.End
            ) {
                if (record.score != null) {
                    Text(
                        text = formatScore(record.score),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary
                    )
                } else if (record.result != null) {
                    Text(
                        text = record.result,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                }
                
                IconButton(onClick = onDelete) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "删除",
                        tint = MaterialTheme.colorScheme.error.copy(alpha = 0.7f)
                    )
                }
            }
        }
    }
}

@Composable
private fun getTestTypeColor(type: TestType): Color {
    return when (type) {
        TestType.CPU_BENCHMARK -> Color(0xFF2196F3)
        TestType.GPU_BENCHMARK -> Color(0xFF4CAF50)
        TestType.AI_BENCHMARK -> Color(0xFF9C27B0)
        TestType.STRESS_TEST -> Color(0xFFFF5722)
        TestType.GAME_TEST -> Color(0xFFE91E63)
    }
}

private fun formatScore(score: Int): String {
    return when {
        score >= 1000000 -> String.format("%.2fM", score / 1000000f)
        score >= 1000 -> String.format("%.1fK", score / 1000f)
        else -> score.toString()
    }
}

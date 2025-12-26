package com.shavingtools.battery.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.shavingtools.battery.service.TestExecutorService
import com.shavingtools.battery.ui.components.ScenarioCard
import com.shavingtools.battery.ui.components.TestProgressCard
import com.shavingtools.battery.ui.viewmodel.TestViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TestScreen(
    viewModel: TestViewModel = hiltViewModel()
) {
    val testState by viewModel.testState.collectAsState()
    val isTestRunning by viewModel.isTestRunning.collectAsState()
    val selectedScenario by viewModel.selectedScenario.collectAsState()
    val errorMessage by viewModel.errorMessage.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("续航测试") }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp)
        ) {
            // Test Progress Card (if running)
            if (isTestRunning || testState !is TestExecutorService.TestState.Idle) {
                TestProgressCard(testState = testState)
                Spacer(modifier = Modifier.height(16.dp))

                if (isTestRunning) {
                    Button(
                        onClick = { viewModel.stopTest() },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.error
                        ),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("停止测试")
                    }
                    Spacer(modifier = Modifier.height(16.dp))
                }
            }

            // Scenario Selection
            if (!isTestRunning) {
                Text(
                    text = "选择测试场景",
                    style = MaterialTheme.typography.titleMedium
                )
                Spacer(modifier = Modifier.height(12.dp))

                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(viewModel.scenarios) { scenario ->
                        ScenarioCard(
                            scenario = scenario,
                            onClick = { viewModel.selectScenario(scenario) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Selected scenario info
                selectedScenario?.let { scenario ->
                    Text(
                        text = "已选择: ${scenario.name}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                }

                // Start Test Button
                Button(
                    onClick = { viewModel.startTest() },
                    enabled = selectedScenario != null,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("开始续航测试")
                }
            }
        }
    }

    // Error Dialog
    errorMessage?.let { message ->
        AlertDialog(
            onDismissRequest = { viewModel.clearError() },
            title = { Text("提示") },
            text = { Text(message) },
            confirmButton = {
                TextButton(onClick = { viewModel.clearError() }) {
                    Text("确定")
                }
            }
        )
    }
}

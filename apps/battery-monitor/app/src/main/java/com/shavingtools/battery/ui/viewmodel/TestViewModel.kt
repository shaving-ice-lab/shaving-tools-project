package com.shavingtools.battery.ui.viewmodel

import android.app.Application
import android.content.Intent
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.shavingtools.battery.domain.model.TestScenario
import com.shavingtools.battery.domain.model.TestScenarios
import com.shavingtools.battery.domain.usecase.StartTestUseCase
import com.shavingtools.battery.service.BatteryMonitorService
import com.shavingtools.battery.service.TestExecutorService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class TestViewModel @Inject constructor(
    private val application: Application,
    private val startTestUseCase: StartTestUseCase
) : AndroidViewModel(application) {

    val scenarios: List<TestScenario> = TestScenarios.ALL

    val testState: StateFlow<TestExecutorService.TestState> = TestExecutorService.testState

    val isTestRunning: StateFlow<Boolean> = TestExecutorService.isRunning

    private val _selectedScenario = MutableStateFlow<TestScenario?>(null)
    val selectedScenario: StateFlow<TestScenario?> = _selectedScenario.asStateFlow()

    private val _errorMessage = MutableStateFlow<String?>(null)
    val errorMessage: StateFlow<String?> = _errorMessage.asStateFlow()

    fun selectScenario(scenario: TestScenario) {
        _selectedScenario.value = scenario
    }

    fun startTest() {
        val scenario = _selectedScenario.value ?: run {
            _errorMessage.value = "请先选择测试场景"
            return
        }

        val batteryLevel = BatteryMonitorService.batteryInfo.value?.level ?: 0

        viewModelScope.launch {
            startTestUseCase(scenario, batteryLevel)
                .onSuccess { session ->
                    // Start monitor service if not running
                    if (!BatteryMonitorService.isRunning.value) {
                        val monitorIntent = Intent(application, BatteryMonitorService::class.java)
                        application.startForegroundService(monitorIntent)
                    }

                    // Start test executor service
                    TestExecutorService.startTest(application, scenario, session)
                    _errorMessage.value = null
                }
                .onFailure { error ->
                    _errorMessage.value = error.message
                }
        }
    }

    fun stopTest() {
        TestExecutorService.stopTest(application)
    }

    fun clearError() {
        _errorMessage.value = null
    }
}

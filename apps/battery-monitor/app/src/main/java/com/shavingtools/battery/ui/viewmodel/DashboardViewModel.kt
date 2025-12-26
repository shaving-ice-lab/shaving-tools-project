package com.shavingtools.battery.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shavingtools.battery.data.repository.BatteryRepository
import com.shavingtools.battery.domain.analyzer.BatteryAnalyzer
import com.shavingtools.battery.domain.model.BatteryInfo
import com.shavingtools.battery.domain.model.BatteryRecord
import com.shavingtools.battery.service.BatteryMonitorService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DashboardViewModel @Inject constructor(
    private val repository: BatteryRepository,
    private val analyzer: BatteryAnalyzer
) : ViewModel() {

    val batteryInfo: StateFlow<BatteryInfo?> = BatteryMonitorService.batteryInfo

    val isMonitorRunning: StateFlow<Boolean> = BatteryMonitorService.isRunning

    private val _recentRecords = MutableStateFlow<List<BatteryRecord>>(emptyList())
    val recentRecords: StateFlow<List<BatteryRecord>> = _recentRecords.asStateFlow()

    private val _predictedMinutes = MutableStateFlow<Long>(0)
    val predictedMinutes: StateFlow<Long> = _predictedMinutes.asStateFlow()

    private val _dischargeRate = MutableStateFlow<Float>(0f)
    val dischargeRate: StateFlow<Float> = _dischargeRate.asStateFlow()

    private val _healthScore = MutableStateFlow<BatteryAnalyzer.BatteryHealthScore?>(null)
    val healthScore: StateFlow<BatteryAnalyzer.BatteryHealthScore?> = _healthScore.asStateFlow()

    init {
        loadRecentRecords()
        observeBatteryInfo()
    }

    private fun loadRecentRecords() {
        viewModelScope.launch {
            repository.getRecentRecords(100).collect { records ->
                _recentRecords.value = records
                updateAnalysis(records)
            }
        }
    }

    private fun observeBatteryInfo() {
        viewModelScope.launch {
            BatteryMonitorService.batteryInfo.collect { info ->
                info?.let {
                    val records = _recentRecords.value
                    if (records.isNotEmpty()) {
                        _predictedMinutes.value = analyzer.predictRemainingMinutes(it.level, records)
                    }
                }
            }
        }
    }

    private fun updateAnalysis(records: List<BatteryRecord>) {
        if (records.isEmpty()) return

        _dischargeRate.value = analyzer.calculateDischargeRate(records)
        _healthScore.value = analyzer.estimateBatteryHealth(records)
    }

    fun formatPredictedTime(): String {
        val minutes = _predictedMinutes.value
        if (minutes == Long.MAX_VALUE || minutes <= 0) return "计算中..."

        val hours = minutes / 60
        val mins = minutes % 60
        return when {
            hours > 24 -> "超过24小时"
            hours > 0 -> "${hours}小时${mins}分钟"
            else -> "${mins}分钟"
        }
    }

    fun formatDischargeRate(): String {
        val rate = _dischargeRate.value
        return if (rate > 0) String.format("%.1f%%/小时", rate) else "N/A"
    }
}

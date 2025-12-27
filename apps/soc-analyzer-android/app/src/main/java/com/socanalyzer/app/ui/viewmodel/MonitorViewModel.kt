package com.socanalyzer.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.socanalyzer.app.data.collector.SocDataCollector
import com.socanalyzer.app.data.model.RealtimeMonitor
import com.socanalyzer.app.data.model.SocInfo
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MonitorViewModel @Inject constructor(
    private val dataCollector: SocDataCollector
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(MonitorUiState())
    val uiState: StateFlow<MonitorUiState> = _uiState.asStateFlow()
    
    init {
        loadSocInfo()
        startMonitoring()
    }
    
    private fun loadSocInfo() {
        viewModelScope.launch {
            val socInfo = dataCollector.getSocInfo()
            _uiState.value = _uiState.value.copy(socInfo = socInfo)
        }
    }
    
    private fun startMonitoring() {
        viewModelScope.launch {
            while (true) {
                val data = dataCollector.getRealtimeData()
                _uiState.value = _uiState.value.copy(realtimeData = data)
                delay(1000)
            }
        }
    }
}

data class MonitorUiState(
    val socInfo: SocInfo? = null,
    val realtimeData: RealtimeMonitor? = null,
    val isConnected: Boolean = false
)

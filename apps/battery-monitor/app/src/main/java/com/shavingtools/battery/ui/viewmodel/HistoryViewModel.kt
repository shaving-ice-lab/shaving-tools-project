package com.shavingtools.battery.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.shavingtools.battery.data.repository.BatteryRepository
import com.shavingtools.battery.domain.model.BatteryRecord
import com.shavingtools.battery.domain.model.TestSession
import com.shavingtools.battery.domain.usecase.GenerateReportUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HistoryViewModel @Inject constructor(
    private val repository: BatteryRepository,
    private val generateReportUseCase: GenerateReportUseCase
) : ViewModel() {

    val sessions: StateFlow<List<TestSession>> = repository.getCompletedSessions()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    private val _selectedSession = MutableStateFlow<TestSession?>(null)
    val selectedSession: StateFlow<TestSession?> = _selectedSession.asStateFlow()

    private val _sessionRecords = MutableStateFlow<List<BatteryRecord>>(emptyList())
    val sessionRecords: StateFlow<List<BatteryRecord>> = _sessionRecords.asStateFlow()

    fun selectSession(session: TestSession) {
        _selectedSession.value = session
        loadSessionRecords(session.id)
    }

    private fun loadSessionRecords(sessionId: String) {
        viewModelScope.launch {
            repository.getRecordsForSession(sessionId).collect { records ->
                _sessionRecords.value = records
            }
        }
    }

    fun deleteSession(session: TestSession) {
        viewModelScope.launch {
            repository.deleteSession(session.id)
            if (_selectedSession.value?.id == session.id) {
                _selectedSession.value = null
                _sessionRecords.value = emptyList()
            }
        }
    }

    fun clearSelection() {
        _selectedSession.value = null
        _sessionRecords.value = emptyList()
    }
}

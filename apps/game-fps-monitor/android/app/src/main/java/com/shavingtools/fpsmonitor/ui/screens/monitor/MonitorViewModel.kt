package com.shavingtools.fpsmonitor.ui.screens.monitor

import android.app.Application
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.shavingtools.fpsmonitor.data.remote.WebSocketClient
import com.shavingtools.fpsmonitor.service.FpsCollectorService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

data class MonitorUiState(
    val isCollecting: Boolean = false,
    val currentFps: Float = 0f,
    val avgFps: Float = 0f,
    val minFps: Float = 0f,
    val maxFps: Float = 0f,
    val cpuUsage: Float = 0f,
    val temperature: Float = 0f,
    val jankCount: Int = 0
)

@HiltViewModel
class MonitorViewModel @Inject constructor(
    application: Application,
    private val webSocketClient: WebSocketClient
) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(MonitorUiState())
    val uiState: StateFlow<MonitorUiState> = _uiState.asStateFlow()

    private var fpsService: FpsCollectorService? = null
    private var serviceBound = false

    private val serviceConnection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName?, service: IBinder?) {
            val binder = service as FpsCollectorService.LocalBinder
            fpsService = binder.getService()
            serviceBound = true
            observeServiceData()
        }

        override fun onServiceDisconnected(name: ComponentName?) {
            fpsService = null
            serviceBound = false
        }
    }

    init {
        bindService()
    }

    private fun bindService() {
        val intent = Intent(getApplication(), FpsCollectorService::class.java)
        getApplication<Application>().startService(intent)
        getApplication<Application>().bindService(
            intent,
            serviceConnection,
            Context.BIND_AUTO_CREATE
        )
    }

    private fun observeServiceData() {
        viewModelScope.launch {
            fpsService?.snapshotFlow?.collect { snapshot ->
                _uiState.update {
                    it.copy(
                        currentFps = snapshot.fps,
                        avgFps = snapshot.avgFps,
                        minFps = snapshot.minFps,
                        maxFps = snapshot.maxFps,
                        cpuUsage = snapshot.cpuUsage,
                        temperature = snapshot.temperature,
                        jankCount = snapshot.jankCount
                    )
                }
                // 发送到桌面端
                webSocketClient.sendSnapshot(snapshot)
            }
        }
    }

    fun startCollection() {
        fpsService?.startCollecting()
        _uiState.update { it.copy(isCollecting = true) }
    }

    fun pauseCollection() {
        fpsService?.stopCollecting()
        _uiState.update { it.copy(isCollecting = false) }
    }

    fun stopCollection() {
        fpsService?.stopCollecting()
        _uiState.update { 
            MonitorUiState(isCollecting = false)
        }
    }

    override fun onCleared() {
        super.onCleared()
        if (serviceBound) {
            getApplication<Application>().unbindService(serviceConnection)
            serviceBound = false
        }
    }
}

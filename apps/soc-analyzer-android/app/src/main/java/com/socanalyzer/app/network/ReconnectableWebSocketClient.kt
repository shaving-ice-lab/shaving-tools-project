package com.socanalyzer.app.network

import android.util.Log
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import okhttp3.*
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.TimeUnit

sealed class ConnectionState {
    object Disconnected : ConnectionState()
    object Connecting : ConnectionState()
    object Connected : ConnectionState()
    data class Reconnecting(val attempt: Int, val maxAttempts: Int) : ConnectionState()
    data class Error(val message: String) : ConnectionState()
}

class ReconnectableWebSocketClient(
    private val serverUrl: String,
    private val onMessageReceived: (String) -> Unit,
    private val onConnectionStateChanged: (ConnectionState) -> Unit
) {
    companion object {
        private const val TAG = "ReconnectableWS"
        private const val MAX_RECONNECT_ATTEMPTS = 10
        private const val INITIAL_RECONNECT_DELAY_MS = 1000L
        private const val MAX_RECONNECT_DELAY_MS = 30000L
        private const val PING_INTERVAL_MS = 15000L
        private const val CONNECTION_TIMEOUT_MS = 10000L
    }

    private val client = OkHttpClient.Builder()
        .connectTimeout(CONNECTION_TIMEOUT_MS, TimeUnit.MILLISECONDS)
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .writeTimeout(10, TimeUnit.SECONDS)
        .pingInterval(PING_INTERVAL_MS, TimeUnit.MILLISECONDS)
        .build()

    private var webSocket: WebSocket? = null
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var reconnectJob: Job? = null
    private var reconnectAttempt = 0

    private val _connectionState = MutableStateFlow<ConnectionState>(ConnectionState.Disconnected)
    val connectionState: StateFlow<ConnectionState> = _connectionState

    private val messageQueue = ConcurrentLinkedQueue<String>()
    private var isManualDisconnect = false

    fun connect() {
        if (_connectionState.value == ConnectionState.Connected ||
            _connectionState.value == ConnectionState.Connecting) {
            return
        }

        isManualDisconnect = false
        reconnectAttempt = 0
        doConnect()
    }

    private fun doConnect() {
        _connectionState.value = ConnectionState.Connecting
        onConnectionStateChanged(ConnectionState.Connecting)

        val request = Request.Builder()
            .url(serverUrl)
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d(TAG, "WebSocket connected")
                reconnectAttempt = 0
                _connectionState.value = ConnectionState.Connected
                onConnectionStateChanged(ConnectionState.Connected)
                flushMessageQueue()
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                onMessageReceived(text)
            }

            override fun onClosing(webSocket: WebSocket, code: Int, reason: String) {
                Log.d(TAG, "WebSocket closing: $code - $reason")
                webSocket.close(1000, null)
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.d(TAG, "WebSocket closed: $code - $reason")
                handleDisconnection()
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "WebSocket failure: ${t.message}")
                _connectionState.value = ConnectionState.Error(t.message ?: "Unknown error")
                onConnectionStateChanged(ConnectionState.Error(t.message ?: "Unknown error"))
                handleDisconnection()
            }
        })
    }

    private fun handleDisconnection() {
        if (isManualDisconnect) {
            _connectionState.value = ConnectionState.Disconnected
            onConnectionStateChanged(ConnectionState.Disconnected)
            return
        }

        if (reconnectAttempt < MAX_RECONNECT_ATTEMPTS) {
            scheduleReconnect()
        } else {
            _connectionState.value = ConnectionState.Error("Max reconnect attempts reached")
            onConnectionStateChanged(ConnectionState.Error("Max reconnect attempts reached"))
        }
    }

    private fun scheduleReconnect() {
        reconnectJob?.cancel()
        reconnectJob = scope.launch {
            reconnectAttempt++
            val delay = calculateReconnectDelay()
            
            Log.d(TAG, "Scheduling reconnect attempt $reconnectAttempt in ${delay}ms")
            _connectionState.value = ConnectionState.Reconnecting(reconnectAttempt, MAX_RECONNECT_ATTEMPTS)
            onConnectionStateChanged(ConnectionState.Reconnecting(reconnectAttempt, MAX_RECONNECT_ATTEMPTS))
            
            delay(delay)
            
            if (!isManualDisconnect) {
                doConnect()
            }
        }
    }

    private fun calculateReconnectDelay(): Long {
        val exponentialDelay = INITIAL_RECONNECT_DELAY_MS * (1 shl (reconnectAttempt - 1).coerceAtMost(5))
        val jitter = (Math.random() * 1000).toLong()
        return (exponentialDelay + jitter).coerceAtMost(MAX_RECONNECT_DELAY_MS)
    }

    fun send(message: String): Boolean {
        return when (_connectionState.value) {
            is ConnectionState.Connected -> {
                webSocket?.send(message) ?: false
            }
            else -> {
                messageQueue.offer(message)
                false
            }
        }
    }

    fun sendWithQueue(message: String) {
        if (_connectionState.value == ConnectionState.Connected) {
            webSocket?.send(message)
        } else {
            messageQueue.offer(message)
        }
    }

    private fun flushMessageQueue() {
        scope.launch {
            while (messageQueue.isNotEmpty() && _connectionState.value == ConnectionState.Connected) {
                val message = messageQueue.poll()
                if (message != null) {
                    webSocket?.send(message)
                    delay(10)
                }
            }
        }
    }

    fun disconnect() {
        isManualDisconnect = true
        reconnectJob?.cancel()
        webSocket?.close(1000, "Manual disconnect")
        webSocket = null
        _connectionState.value = ConnectionState.Disconnected
        onConnectionStateChanged(ConnectionState.Disconnected)
    }

    fun destroy() {
        disconnect()
        scope.cancel()
        client.dispatcher.executorService.shutdown()
    }

    fun getQueueSize(): Int = messageQueue.size

    fun clearQueue() = messageQueue.clear()

    fun isConnected(): Boolean = _connectionState.value == ConnectionState.Connected
}

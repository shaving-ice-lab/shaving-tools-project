package com.shavingtools.fpsmonitor.data.remote

import android.os.Build
import android.os.Handler
import android.os.Looper
import com.google.gson.Gson
import com.shavingtools.fpsmonitor.domain.model.FrameData
import com.shavingtools.fpsmonitor.domain.model.PerformancePacket
import com.shavingtools.fpsmonitor.domain.model.PerformanceSnapshot
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WebSocketClient @Inject constructor() {

    private var webSocket: WebSocket? = null
    private val client = OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS)
        .build()

    private val gson = Gson()
    private val handler = Handler(Looper.getMainLooper())
    private var serverUrl: String = ""
    private var isConnected = false

    var onConnected: (() -> Unit)? = null
    var onDisconnected: (() -> Unit)? = null
    var onError: ((String) -> Unit)? = null

    fun connect(url: String) {
        serverUrl = url
        val request = Request.Builder()
            .url(url)
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                isConnected = true
                handler.post { onConnected?.invoke() }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                isConnected = false
                handler.post { 
                    onError?.invoke(t.message ?: "连接失败")
                    onDisconnected?.invoke()
                }
                // 自动重连
                handler.postDelayed({ reconnect() }, 3000)
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                isConnected = false
                handler.post { onDisconnected?.invoke() }
            }
        })
    }

    fun disconnect() {
        webSocket?.close(1000, "用户断开")
        webSocket = null
        isConnected = false
    }

    private fun reconnect() {
        if (!isConnected && serverUrl.isNotEmpty()) {
            connect(serverUrl)
        }
    }

    fun sendSessionStart(sessionId: String, gameName: String) {
        val packet = PerformancePacket(
            type = "session_start",
            timestamp = System.currentTimeMillis(),
            deviceId = Build.MODEL,
            data = mapOf("sessionId" to sessionId, "gameName" to gameName)
        )
        webSocket?.send(gson.toJson(packet))
    }

    fun sendSessionEnd() {
        val packet = PerformancePacket(
            type = "session_end",
            timestamp = System.currentTimeMillis(),
            deviceId = Build.MODEL,
            data = mapOf<String, Any>()
        )
        webSocket?.send(gson.toJson(packet))
    }

    fun sendFrameData(frameData: FrameData) {
        if (!isConnected) return
        val packet = PerformancePacket(
            type = "frame",
            timestamp = frameData.timestamp,
            deviceId = Build.MODEL,
            data = frameData
        )
        webSocket?.send(gson.toJson(packet))
    }

    fun sendSnapshot(snapshot: PerformanceSnapshot) {
        if (!isConnected) return
        val packet = PerformancePacket(
            type = "snapshot",
            timestamp = snapshot.timestamp,
            deviceId = Build.MODEL,
            data = snapshot
        )
        webSocket?.send(gson.toJson(packet))
    }

    fun isConnected() = isConnected
}

package com.shavingtools.fpsmonitor.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.Binder
import android.os.IBinder
import android.view.Choreographer
import androidx.core.app.NotificationCompat
import com.shavingtools.fpsmonitor.FpsMonitorApp
import com.shavingtools.fpsmonitor.MainActivity
import com.shavingtools.fpsmonitor.R
import com.shavingtools.fpsmonitor.domain.model.FrameData
import com.shavingtools.fpsmonitor.domain.model.PerformanceSnapshot
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.launch
import java.io.BufferedReader
import java.io.FileReader
import javax.inject.Inject

@AndroidEntryPoint
class FpsCollectorService : Service() {

    private val binder = LocalBinder()
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)

    private var isCollecting = false
    private var frameCount = 0
    private var lastTime = 0L
    private var currentFps = 0f
    private var minFps = Float.MAX_VALUE
    private var maxFps = 0f
    private var totalFps = 0f
    private var fpsCount = 0
    private var jankCount = 0
    private var lastFrameTime = 0L

    private val _frameDataFlow = MutableSharedFlow<FrameData>(replay = 0)
    val frameDataFlow: SharedFlow<FrameData> = _frameDataFlow

    private val _snapshotFlow = MutableSharedFlow<PerformanceSnapshot>(replay = 0)
    val snapshotFlow: SharedFlow<PerformanceSnapshot> = _snapshotFlow

    private var lastCpuTime = 0L
    private var lastIdleTime = 0L

    private val frameCallback = object : Choreographer.FrameCallback {
        override fun doFrame(frameTimeNanos: Long) {
            if (!isCollecting) return

            val currentTime = System.currentTimeMillis()
            frameCount++

            // 计算帧时间和卡顿检测
            val frameTime = if (lastFrameTime > 0) {
                (frameTimeNanos - lastFrameTime) / 1_000_000f
            } else 0f
            lastFrameTime = frameTimeNanos

            val isJank = frameTime > 16.67f * 2 // 超过两帧算卡顿

            if (isJank) jankCount++

            // 每秒计算FPS
            if (currentTime - lastTime >= 1000) {
                currentFps = frameCount * 1000f / (currentTime - lastTime)
                frameCount = 0
                lastTime = currentTime

                if (currentFps > 0) {
                    if (currentFps < minFps) minFps = currentFps
                    if (currentFps > maxFps) maxFps = currentFps
                    totalFps += currentFps
                    fpsCount++
                }

                // 发送帧数据
                scope.launch {
                    _frameDataFlow.emit(
                        FrameData(
                            fps = currentFps,
                            frameTime = frameTime,
                            jank = isJank
                        )
                    )

                    // 发送性能快照
                    val cpuUsage = getCpuUsage()
                    _snapshotFlow.emit(
                        PerformanceSnapshot(
                            fps = currentFps,
                            avgFps = if (fpsCount > 0) totalFps / fpsCount else 0f,
                            minFps = if (minFps == Float.MAX_VALUE) 0f else minFps,
                            maxFps = maxFps,
                            cpuUsage = cpuUsage,
                            gpuUsage = 0f, // GPU需要厂商API
                            memoryUsage = getMemoryUsage(),
                            temperature = getTemperature(),
                            power = 0f,
                            jankCount = jankCount,
                            jankRate = if (fpsCount > 0) jankCount.toFloat() / fpsCount * 100 else 0f
                        )
                    )
                }
            }

            Choreographer.getInstance().postFrameCallback(this)
        }
    }

    inner class LocalBinder : Binder() {
        fun getService(): FpsCollectorService = this@FpsCollectorService
    }

    override fun onBind(intent: Intent?): IBinder = binder

    override fun onCreate() {
        super.onCreate()
        startForeground(NOTIFICATION_ID, createNotification())
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onDestroy() {
        super.onDestroy()
        stopCollecting()
        scope.cancel()
    }

    fun startCollecting() {
        if (isCollecting) return
        isCollecting = true
        resetStats()
        lastTime = System.currentTimeMillis()
        Choreographer.getInstance().postFrameCallback(frameCallback)
    }

    fun stopCollecting() {
        isCollecting = false
        Choreographer.getInstance().removeFrameCallback(frameCallback)
    }

    private fun resetStats() {
        frameCount = 0
        currentFps = 0f
        minFps = Float.MAX_VALUE
        maxFps = 0f
        totalFps = 0f
        fpsCount = 0
        jankCount = 0
        lastFrameTime = 0L
    }

    private fun getCpuUsage(): Float {
        try {
            val reader = BufferedReader(FileReader("/proc/stat"))
            val line = reader.readLine()
            reader.close()

            val parts = line.split("\\s+".toRegex())
            val user = parts[1].toLong()
            val nice = parts[2].toLong()
            val system = parts[3].toLong()
            val idle = parts[4].toLong()

            val totalTime = user + nice + system + idle
            val cpuTime = user + nice + system

            val cpuUsage = if (lastCpuTime > 0) {
                val totalDiff = totalTime - (lastCpuTime + lastIdleTime)
                val cpuDiff = cpuTime - lastCpuTime
                if (totalDiff > 0) (cpuDiff.toFloat() / totalDiff * 100) else 0f
            } else 0f

            lastCpuTime = cpuTime
            lastIdleTime = idle

            return cpuUsage
        } catch (e: Exception) {
            return -1f
        }
    }

    private fun getMemoryUsage(): Float {
        val runtime = Runtime.getRuntime()
        val usedMemory = (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024)
        return usedMemory.toFloat()
    }

    private fun getTemperature(): Float {
        try {
            val thermalDir = java.io.File("/sys/class/thermal/")
            thermalDir.listFiles()?.forEach { zone ->
                if (zone.name.startsWith("thermal_zone")) {
                    val tempFile = java.io.File(zone, "temp")
                    if (tempFile.exists()) {
                        val temp = tempFile.readText().trim().toIntOrNull()
                        if (temp != null && temp > 0) {
                            return temp / 1000f
                        }
                    }
                }
            }
        } catch (e: Exception) {
            // ignore
        }
        return 0f
    }

    private fun createNotification(): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, FpsMonitorApp.CHANNEL_ID_FPS)
            .setContentTitle("帧率监控中")
            .setContentText("正在采集游戏性能数据")
            .setSmallIcon(R.drawable.ic_fps)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    companion object {
        private const val NOTIFICATION_ID = 1001
    }
}

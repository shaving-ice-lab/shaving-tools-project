package com.shavingtools.fpsmonitor

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class FpsMonitorApp : Application() {
    
    companion object {
        const val CHANNEL_ID_FPS = "fps_collector_channel"
        const val CHANNEL_ID_OVERLAY = "overlay_channel"
    }
    
    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }
    
    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(NotificationManager::class.java)
            
            // FPS采集服务通知渠道
            val fpsChannel = NotificationChannel(
                CHANNEL_ID_FPS,
                "帧率监控服务",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "用于后台监控帧率的服务通知"
            }
            
            // 悬浮窗服务通知渠道
            val overlayChannel = NotificationChannel(
                CHANNEL_ID_OVERLAY,
                "悬浮窗服务",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "用于显示悬浮窗的服务通知"
            }
            
            notificationManager.createNotificationChannels(listOf(fpsChannel, overlayChannel))
        }
    }
}

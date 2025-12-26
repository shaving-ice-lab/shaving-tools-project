package com.shavingtools.battery

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class BatteryMonitorApp : Application() {

    companion object {
        const val CHANNEL_ID_MONITOR = "battery_monitor_channel"
        const val CHANNEL_ID_TEST = "battery_test_channel"
        const val CHANNEL_ID_ALERT = "battery_alert_channel"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(NotificationManager::class.java)

            // 电池监控通知渠道
            val monitorChannel = NotificationChannel(
                CHANNEL_ID_MONITOR,
                "电池监控",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "后台电池监控服务通知"
            }

            // 续航测试通知渠道
            val testChannel = NotificationChannel(
                CHANNEL_ID_TEST,
                "续航测试",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "续航测试进度通知"
            }

            // 电池警告通知渠道
            val alertChannel = NotificationChannel(
                CHANNEL_ID_ALERT,
                "电池警告",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "电池异常警告通知"
            }

            notificationManager.createNotificationChannels(
                listOf(monitorChannel, testChannel, alertChannel)
            )
        }
    }
}

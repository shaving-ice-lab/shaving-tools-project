package com.shavingtools.battery.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.shavingtools.battery.service.BatteryMonitorService

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            val serviceIntent = Intent(context, BatteryMonitorService::class.java)
            context.startForegroundService(serviceIntent)
        }
    }
}

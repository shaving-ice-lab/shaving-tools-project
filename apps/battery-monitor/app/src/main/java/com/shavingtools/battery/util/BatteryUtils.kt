package com.shavingtools.battery.util

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import com.shavingtools.battery.domain.model.BatteryHealth
import com.shavingtools.battery.domain.model.BatteryInfo
import com.shavingtools.battery.domain.model.BatteryStatus
import com.shavingtools.battery.domain.model.PlugType

object BatteryUtils {

    fun getBatteryInfo(context: Context): BatteryInfo {
        val batteryIntent = context.registerReceiver(
            null,
            IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        )

        return batteryIntent?.let { intent ->
            val level = intent.getIntExtra(BatteryManager.EXTRA_LEVEL, 0)
            val scale = intent.getIntExtra(BatteryManager.EXTRA_SCALE, 100)
            val percentage = (level * 100) / scale

            val status = when (intent.getIntExtra(BatteryManager.EXTRA_STATUS, -1)) {
                BatteryManager.BATTERY_STATUS_CHARGING -> BatteryStatus.CHARGING
                BatteryManager.BATTERY_STATUS_DISCHARGING -> BatteryStatus.DISCHARGING
                BatteryManager.BATTERY_STATUS_FULL -> BatteryStatus.FULL
                BatteryManager.BATTERY_STATUS_NOT_CHARGING -> BatteryStatus.NOT_CHARGING
                else -> BatteryStatus.UNKNOWN
            }

            val health = when (intent.getIntExtra(BatteryManager.EXTRA_HEALTH, -1)) {
                BatteryManager.BATTERY_HEALTH_GOOD -> BatteryHealth.GOOD
                BatteryManager.BATTERY_HEALTH_OVERHEAT -> BatteryHealth.OVERHEAT
                BatteryManager.BATTERY_HEALTH_DEAD -> BatteryHealth.DEAD
                BatteryManager.BATTERY_HEALTH_OVER_VOLTAGE -> BatteryHealth.OVER_VOLTAGE
                BatteryManager.BATTERY_HEALTH_COLD -> BatteryHealth.COLD
                else -> BatteryHealth.UNKNOWN
            }

            val plugType = when (intent.getIntExtra(BatteryManager.EXTRA_PLUGGED, -1)) {
                BatteryManager.BATTERY_PLUGGED_AC -> PlugType.AC
                BatteryManager.BATTERY_PLUGGED_USB -> PlugType.USB
                BatteryManager.BATTERY_PLUGGED_WIRELESS -> PlugType.WIRELESS
                else -> PlugType.NONE
            }

            val temperature = intent.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0) / 10f
            val voltage = intent.getIntExtra(BatteryManager.EXTRA_VOLTAGE, 0)
            val technology = intent.getStringExtra(BatteryManager.EXTRA_TECHNOLOGY) ?: "Unknown"

            val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
            val current = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CURRENT_NOW) / 1000

            BatteryInfo(
                level = percentage,
                status = status,
                health = health,
                temperature = temperature,
                voltage = voltage,
                current = current,
                plugType = plugType,
                technology = technology,
                timestamp = System.currentTimeMillis()
            )
        } ?: BatteryInfo(
            level = 0,
            status = BatteryStatus.UNKNOWN,
            health = BatteryHealth.UNKNOWN,
            temperature = 0f,
            voltage = 0,
            current = 0,
            plugType = PlugType.NONE,
            technology = "Unknown",
            timestamp = System.currentTimeMillis()
        )
    }

    fun formatDuration(minutes: Long): String {
        val hours = minutes / 60
        val mins = minutes % 60
        return when {
            hours > 24 -> "超过24小时"
            hours > 0 -> "${hours}小时${mins}分钟"
            else -> "${mins}分钟"
        }
    }

    fun formatDischargeRate(rate: Float): String {
        return if (rate > 0) String.format("%.1f%%/小时", rate) else "N/A"
    }

    fun getBatteryLevelDescription(level: Int): String {
        return when {
            level >= 80 -> "电量充足"
            level >= 50 -> "电量正常"
            level >= 20 -> "电量偏低"
            level >= 10 -> "电量不足"
            else -> "电量严重不足"
        }
    }

    fun getTemperatureDescription(temperature: Float): String {
        return when {
            temperature < 10 -> "温度过低"
            temperature < 35 -> "温度正常"
            temperature < 40 -> "温度偏高"
            temperature < 45 -> "温度过高"
            else -> "温度危险"
        }
    }
}

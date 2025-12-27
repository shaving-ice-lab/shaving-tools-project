package com.shavingtools.battery.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 设备兼容性工具 - 处理不同厂商ROM的兼容性问题
 */
@Singleton
class DeviceCompatibility @Inject constructor(
    private val context: Context
) {
    
    enum class Manufacturer {
        XIAOMI, HUAWEI, OPPO, VIVO, SAMSUNG, ONEPLUS, MEIZU, OTHER
    }
    
    data class CompatibilityStatus(
        val manufacturer: Manufacturer,
        val isBatteryOptimizationIgnored: Boolean,
        val isAutoStartEnabled: Boolean?,
        val hasRequiredPermissions: Boolean,
        val recommendations: List<CompatibilityRecommendation>
    )
    
    data class CompatibilityRecommendation(
        val title: String,
        val description: String,
        val action: (() -> Unit)?
    )
    
    /**
     * 获取设备制造商
     */
    fun getManufacturer(): Manufacturer {
        return when (Build.MANUFACTURER.lowercase()) {
            "xiaomi", "redmi" -> Manufacturer.XIAOMI
            "huawei", "honor" -> Manufacturer.HUAWEI
            "oppo", "realme" -> Manufacturer.OPPO
            "vivo", "iqoo" -> Manufacturer.VIVO
            "samsung" -> Manufacturer.SAMSUNG
            "oneplus" -> Manufacturer.ONEPLUS
            "meizu" -> Manufacturer.MEIZU
            else -> Manufacturer.OTHER
        }
    }
    
    /**
     * 检查是否已忽略电池优化
     */
    fun isBatteryOptimizationIgnored(): Boolean {
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        return powerManager.isIgnoringBatteryOptimizations(context.packageName)
    }
    
    /**
     * 请求忽略电池优化
     */
    fun requestIgnoreBatteryOptimization() {
        if (!isBatteryOptimizationIgnored()) {
            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                data = Uri.parse("package:${context.packageName}")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        }
    }
    
    /**
     * 获取兼容性状态
     */
    fun getCompatibilityStatus(): CompatibilityStatus {
        val manufacturer = getManufacturer()
        val recommendations = mutableListOf<CompatibilityRecommendation>()
        
        // 检查电池优化
        if (!isBatteryOptimizationIgnored()) {
            recommendations.add(
                CompatibilityRecommendation(
                    title = "关闭电池优化",
                    description = "请将本应用加入电池优化白名单，以确保后台持续运行",
                    action = { requestIgnoreBatteryOptimization() }
                )
            )
        }
        
        // 厂商特定建议
        when (manufacturer) {
            Manufacturer.XIAOMI -> {
                recommendations.add(
                    CompatibilityRecommendation(
                        title = "MIUI自启动权限",
                        description = "请在设置-应用管理中开启本应用的自启动权限",
                        action = { openMiuiAutoStartSettings() }
                    )
                )
                recommendations.add(
                    CompatibilityRecommendation(
                        title = "MIUI后台锁定",
                        description = "请在最近任务中长按应用卡片，点击锁定图标",
                        action = null
                    )
                )
            }
            Manufacturer.HUAWEI -> {
                recommendations.add(
                    CompatibilityRecommendation(
                        title = "华为电池管理",
                        description = "请在设置-电池-应用启动管理中，关闭本应用的自动管理",
                        action = { openHuaweiBatterySettings() }
                    )
                )
            }
            Manufacturer.OPPO -> {
                recommendations.add(
                    CompatibilityRecommendation(
                        title = "OPPO后台运行",
                        description = "请在设置-电池-应用耗电管理中，允许本应用后台运行",
                        action = { openOppoBatterySettings() }
                    )
                )
            }
            Manufacturer.VIVO -> {
                recommendations.add(
                    CompatibilityRecommendation(
                        title = "vivo后台运行",
                        description = "请在i管家-应用管理-权限管理中，允许本应用自启动和后台运行",
                        action = { openVivoBatterySettings() }
                    )
                )
            }
            else -> {}
        }
        
        return CompatibilityStatus(
            manufacturer = manufacturer,
            isBatteryOptimizationIgnored = isBatteryOptimizationIgnored(),
            isAutoStartEnabled = null, // 无法直接检测
            hasRequiredPermissions = isBatteryOptimizationIgnored(),
            recommendations = recommendations
        )
    }
    
    /**
     * 打开MIUI自启动设置
     */
    private fun openMiuiAutoStartSettings() {
        try {
            val intent = Intent().apply {
                component = android.content.ComponentName(
                    "com.miui.securitycenter",
                    "com.miui.permcenter.autostart.AutoStartManagementActivity"
                )
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            openAppSettings()
        }
    }
    
    /**
     * 打开华为电池设置
     */
    private fun openHuaweiBatterySettings() {
        try {
            val intent = Intent().apply {
                component = android.content.ComponentName(
                    "com.huawei.systemmanager",
                    "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"
                )
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            openAppSettings()
        }
    }
    
    /**
     * 打开OPPO电池设置
     */
    private fun openOppoBatterySettings() {
        try {
            val intent = Intent().apply {
                component = android.content.ComponentName(
                    "com.coloros.safecenter",
                    "com.coloros.safecenter.permission.startup.StartupAppListActivity"
                )
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            openAppSettings()
        }
    }
    
    /**
     * 打开vivo电池设置
     */
    private fun openVivoBatterySettings() {
        try {
            val intent = Intent().apply {
                component = android.content.ComponentName(
                    "com.iqoo.secure",
                    "com.iqoo.secure.ui.phoneoptimize.AddWhiteListActivity"
                )
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            openAppSettings()
        }
    }
    
    /**
     * 打开应用设置页面
     */
    private fun openAppSettings() {
        val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.parse("package:${context.packageName}")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }
}

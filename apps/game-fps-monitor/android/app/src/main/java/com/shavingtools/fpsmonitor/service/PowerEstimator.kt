package com.shavingtools.fpsmonitor.service

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 功耗估算器 - 估算设备实时功耗
 */
@Singleton
class PowerEstimator @Inject constructor(
    private val context: Context
) {
    
    data class PowerInfo(
        val currentMa: Int,           // 电流 mA (正值放电，负值充电)
        val voltageMv: Int,           // 电压 mV
        val powerMw: Float,           // 功率 mW
        val batteryLevel: Int,        // 电量百分比
        val temperature: Float,       // 电池温度
        val isCharging: Boolean,      // 是否充电中
        val energyNwh: Long,          // 剩余电量 nWh (如可获取)
        val estimatedScreenPower: Float,  // 估算屏幕功耗
        val estimatedCpuPower: Float,     // 估算CPU功耗
        val estimatedGpuPower: Float      // 估算GPU功耗
    )
    
    private val batteryManager: BatteryManager by lazy {
        context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
    }
    
    // 典型功耗参数 (根据设备类型调整)
    companion object {
        // 屏幕功耗系数 (mW per nit per inch^2)
        private const val SCREEN_POWER_COEFFICIENT = 0.1f
        
        // CPU功耗系数 (基于频率和负载)
        private const val CPU_POWER_BASE = 100f        // 基础功耗 mW
        private const val CPU_POWER_PER_GHZ = 500f     // 每GHz功耗 mW
        private const val CPU_POWER_LOAD_FACTOR = 2.0f // 负载系数
        
        // GPU功耗系数
        private const val GPU_POWER_BASE = 50f         // 基础功耗 mW
        private const val GPU_POWER_PER_MHZ = 0.5f     // 每MHz功耗 mW
        private const val GPU_POWER_LOAD_FACTOR = 3.0f // 负载系数
    }
    
    /**
     * 获取功耗信息
     */
    suspend fun getPowerInfo(
        cpuUsage: Float = 0f,
        cpuFrequencyMhz: Long = 0L,
        gpuUsage: Float = 0f,
        gpuFrequencyMhz: Long = 0L,
        screenBrightness: Float = 0.5f
    ): PowerInfo = withContext(Dispatchers.IO) {
        val current = getCurrentNow()
        val voltage = getVoltage()
        val power = calculatePower(current, voltage)
        
        PowerInfo(
            currentMa = current,
            voltageMv = voltage,
            powerMw = power,
            batteryLevel = getBatteryLevel(),
            temperature = getBatteryTemperature(),
            isCharging = isCharging(),
            energyNwh = getEnergyCounter(),
            estimatedScreenPower = estimateScreenPower(screenBrightness),
            estimatedCpuPower = estimateCpuPower(cpuUsage, cpuFrequencyMhz),
            estimatedGpuPower = estimateGpuPower(gpuUsage, gpuFrequencyMhz)
        )
    }
    
    /**
     * 获取实时电流 (mA)
     * 正值表示放电，负值表示充电
     */
    fun getCurrentNow(): Int {
        val currentMicroAmps = batteryManager.getIntProperty(
            BatteryManager.BATTERY_PROPERTY_CURRENT_NOW
        )
        // 转换为mA，某些设备返回μA
        return if (currentMicroAmps > 10000 || currentMicroAmps < -10000) {
            currentMicroAmps / 1000
        } else {
            currentMicroAmps
        }
    }
    
    /**
     * 获取平均电流 (mA)
     */
    fun getCurrentAverage(): Int {
        val currentMicroAmps = batteryManager.getIntProperty(
            BatteryManager.BATTERY_PROPERTY_CURRENT_AVERAGE
        )
        return if (currentMicroAmps > 10000 || currentMicroAmps < -10000) {
            currentMicroAmps / 1000
        } else {
            currentMicroAmps
        }
    }
    
    /**
     * 获取电池电压 (mV)
     */
    fun getVoltage(): Int {
        val intent = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        return intent?.getIntExtra(BatteryManager.EXTRA_VOLTAGE, 0) ?: 0
    }
    
    /**
     * 获取电池电量百分比
     */
    fun getBatteryLevel(): Int {
        return batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
    }
    
    /**
     * 获取电池温度 (摄氏度)
     */
    fun getBatteryTemperature(): Float {
        val intent = context.registerReceiver(null, IntentFilter(Intent.ACTION_BATTERY_CHANGED))
        val temp = intent?.getIntExtra(BatteryManager.EXTRA_TEMPERATURE, 0) ?: 0
        return temp / 10f
    }
    
    /**
     * 判断是否正在充电
     */
    fun isCharging(): Boolean {
        return batteryManager.isCharging
    }
    
    /**
     * 获取剩余电量计数器 (nWh)
     */
    fun getEnergyCounter(): Long {
        return batteryManager.getLongProperty(BatteryManager.BATTERY_PROPERTY_ENERGY_COUNTER)
    }
    
    /**
     * 获取电池容量 (μAh)
     */
    fun getChargeCounter(): Int {
        return batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CHARGE_COUNTER)
    }
    
    /**
     * 计算实时功率 (mW)
     */
    private fun calculatePower(currentMa: Int, voltageMv: Int): Float {
        // P = I * V
        // 电流可能为负（充电时），取绝对值计算功率
        return kotlin.math.abs(currentMa) * voltageMv / 1000f
    }
    
    /**
     * 估算屏幕功耗 (mW)
     * 基于亮度估算，实际功耗与屏幕类型、尺寸、分辨率相关
     */
    private fun estimateScreenPower(brightness: Float): Float {
        // 假设6.5英寸AMOLED屏幕
        // 亮度0-1对应功耗约200-1500mW
        val basePower = 200f
        val maxAdditionalPower = 1300f
        return basePower + maxAdditionalPower * brightness * brightness
    }
    
    /**
     * 估算CPU功耗 (mW)
     * 基于频率和负载估算
     */
    private fun estimateCpuPower(cpuUsage: Float, frequencyMhz: Long): Float {
        if (frequencyMhz <= 0) return 0f
        
        val frequencyGhz = frequencyMhz / 1000f
        val loadFactor = 1f + (cpuUsage / 100f) * (CPU_POWER_LOAD_FACTOR - 1f)
        
        // 功耗与频率的立方成正比（根据DVFS理论）
        val frequencyFactor = frequencyGhz * frequencyGhz * frequencyGhz
        
        return (CPU_POWER_BASE + CPU_POWER_PER_GHZ * frequencyFactor) * loadFactor
    }
    
    /**
     * 估算GPU功耗 (mW)
     * 基于频率和负载估算
     */
    private fun estimateGpuPower(gpuUsage: Float, frequencyMhz: Long): Float {
        if (frequencyMhz <= 0) return 0f
        
        val loadFactor = 1f + (gpuUsage / 100f) * (GPU_POWER_LOAD_FACTOR - 1f)
        
        return (GPU_POWER_BASE + GPU_POWER_PER_MHZ * frequencyMhz) * loadFactor
    }
    
    /**
     * 估算剩余使用时间 (分钟)
     */
    suspend fun estimateRemainingTime(): Int = withContext(Dispatchers.IO) {
        val current = kotlin.math.abs(getCurrentAverage())
        if (current <= 0 || isCharging()) return@withContext -1
        
        val chargeCounter = getChargeCounter() // μAh
        if (chargeCounter <= 0) return@withContext -1
        
        // 剩余时间 = 剩余电量 / 放电电流
        // 单位转换: (μAh / mA) = (μAh / (μA/1000)) = μAh * 1000 / μA = h * 1000 / 1000 = h
        val remainingHours = chargeCounter.toFloat() / (current * 1000)
        (remainingHours * 60).toInt()
    }
    
    /**
     * 获取充电剩余时间 (分钟)
     */
    fun getChargeTimeRemaining(): Long {
        return batteryManager.computeChargeTimeRemaining() / 1000 / 60
    }
}

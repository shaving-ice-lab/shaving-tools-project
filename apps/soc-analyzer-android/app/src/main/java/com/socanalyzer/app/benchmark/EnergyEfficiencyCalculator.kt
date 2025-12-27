package com.socanalyzer.app.benchmark

import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.BatteryManager

data class EnergyEfficiencyResult(
    val performanceScore: Long,
    val averagePowerMw: Float,
    val energyEfficiencyRatio: Float,
    val efficiencyGrade: String,
    val efficiencyPercentile: Int,
    val comparisonToBaseline: Float
)

data class PowerSnapshot(
    val timestamp: Long,
    val currentMa: Int,
    val voltageMv: Int,
    val powerMw: Float,
    val cpuUsage: Float,
    val temperature: Float
)

class EnergyEfficiencyCalculator(private val context: Context) {

    companion object {
        private const val BASELINE_EFFICIENCY = 15.0f
        
        private val EFFICIENCY_GRADES = mapOf(
            95..100 to "S+",
            90..94 to "S",
            85..89 to "A+",
            80..84 to "A",
            70..79 to "B+",
            60..69 to "B",
            50..59 to "C",
            0..49 to "D"
        )
    }

    private val powerSnapshots = mutableListOf<PowerSnapshot>()

    fun startMonitoring() {
        powerSnapshots.clear()
    }

    fun recordSnapshot(cpuUsage: Float = 0f, temperature: Float = 0f) {
        val batteryStatus = getBatteryStatus()
        val snapshot = PowerSnapshot(
            timestamp = System.currentTimeMillis(),
            currentMa = batteryStatus.first,
            voltageMv = batteryStatus.second,
            powerMw = (batteryStatus.first * batteryStatus.second) / 1000f,
            cpuUsage = cpuUsage,
            temperature = temperature
        )
        powerSnapshots.add(snapshot)
    }

    fun calculateEfficiency(performanceScore: Long): EnergyEfficiencyResult {
        if (powerSnapshots.isEmpty()) {
            return EnergyEfficiencyResult(
                performanceScore = performanceScore,
                averagePowerMw = 0f,
                energyEfficiencyRatio = 0f,
                efficiencyGrade = "N/A",
                efficiencyPercentile = 0,
                comparisonToBaseline = 0f
            )
        }

        val averagePower = powerSnapshots.map { it.powerMw }.average().toFloat()
        
        val efficiencyRatio = if (averagePower > 0) {
            performanceScore.toFloat() / averagePower
        } else {
            0f
        }

        val percentile = calculatePercentile(efficiencyRatio)
        val grade = getEfficiencyGrade(percentile)
        val comparisonToBaseline = (efficiencyRatio / BASELINE_EFFICIENCY - 1) * 100

        return EnergyEfficiencyResult(
            performanceScore = performanceScore,
            averagePowerMw = averagePower,
            energyEfficiencyRatio = efficiencyRatio,
            efficiencyGrade = grade,
            efficiencyPercentile = percentile,
            comparisonToBaseline = comparisonToBaseline
        )
    }

    private fun getBatteryStatus(): Pair<Int, Int> {
        val batteryStatus = context.registerReceiver(
            null,
            IntentFilter(Intent.ACTION_BATTERY_CHANGED)
        )
        
        val currentMa = batteryStatus?.getIntExtra(
            BatteryManager.EXTRA_VOLTAGE, 0
        ) ?: 0
        
        val voltageMv = batteryStatus?.getIntExtra(
            BatteryManager.EXTRA_VOLTAGE, 0
        ) ?: 0

        val batteryManager = context.getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        val current = batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CURRENT_NOW)
        
        return Pair(Math.abs(current / 1000), voltageMv)
    }

    private fun calculatePercentile(efficiencyRatio: Float): Int {
        return when {
            efficiencyRatio >= 25f -> 95
            efficiencyRatio >= 22f -> 90
            efficiencyRatio >= 20f -> 85
            efficiencyRatio >= 18f -> 80
            efficiencyRatio >= 15f -> 70
            efficiencyRatio >= 12f -> 60
            efficiencyRatio >= 10f -> 50
            efficiencyRatio >= 8f -> 40
            efficiencyRatio >= 5f -> 30
            else -> 20
        }
    }

    private fun getEfficiencyGrade(percentile: Int): String {
        for ((range, grade) in EFFICIENCY_GRADES) {
            if (percentile in range) {
                return grade
            }
        }
        return "D"
    }

    fun getAverageTemperatureDuringTest(): Float {
        if (powerSnapshots.isEmpty()) return 0f
        return powerSnapshots.map { it.temperature }.average().toFloat()
    }

    fun getPeakPower(): Float {
        if (powerSnapshots.isEmpty()) return 0f
        return powerSnapshots.maxOfOrNull { it.powerMw } ?: 0f
    }

    fun getMinPower(): Float {
        if (powerSnapshots.isEmpty()) return 0f
        return powerSnapshots.minOfOrNull { it.powerMw } ?: 0f
    }

    fun getTotalEnergyConsumed(): Float {
        if (powerSnapshots.size < 2) return 0f
        
        var totalEnergy = 0f
        for (i in 1 until powerSnapshots.size) {
            val timeDelta = (powerSnapshots[i].timestamp - powerSnapshots[i-1].timestamp) / 1000f
            val avgPower = (powerSnapshots[i].powerMw + powerSnapshots[i-1].powerMw) / 2
            totalEnergy += avgPower * timeDelta / 3600f
        }
        return totalEnergy
    }

    fun clearSnapshots() {
        powerSnapshots.clear()
    }
}

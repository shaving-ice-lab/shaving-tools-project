package com.shavingtools.battery.domain.analyzer

import com.shavingtools.battery.domain.model.BatteryRecord
import javax.inject.Inject
import javax.inject.Singleton
import kotlin.math.max
import kotlin.math.min

@Singleton
class BatteryAnalyzer @Inject constructor() {

    fun calculateBatteryLifeMinutes(records: List<BatteryRecord>): Long {
        if (records.size < 2) return 0
        val startTime = records.first().timestamp
        val endTime = records.last().timestamp
        return (endTime - startTime) / 60_000
    }

    fun calculateDischargeRate(records: List<BatteryRecord>): Float {
        if (records.size < 2) return 0f
        val levelDrop = records.first().level - records.last().level
        val hours = calculateBatteryLifeMinutes(records) / 60f
        return if (hours > 0) levelDrop / hours else 0f
    }

    fun predictRemainingMinutes(currentLevel: Int, recentRecords: List<BatteryRecord>): Long {
        val rate = calculateDischargeRate(recentRecords)
        if (rate <= 0) return Long.MAX_VALUE
        val hoursRemaining = currentLevel / rate
        return (hoursRemaining * 60).toLong()
    }

    fun calculateAverageTemperature(records: List<BatteryRecord>): Float {
        if (records.isEmpty()) return 0f
        return records.map { it.temperature }.average().toFloat()
    }

    fun calculateMaxTemperature(records: List<BatteryRecord>): Float {
        if (records.isEmpty()) return 0f
        return records.maxOf { it.temperature }
    }

    fun calculateMinTemperature(records: List<BatteryRecord>): Float {
        if (records.isEmpty()) return 0f
        return records.minOf { it.temperature }
    }

    fun calculatePeakDischargeRate(records: List<BatteryRecord>, windowMinutes: Int = 10): Float {
        if (records.size < 2) return 0f

        var maxRate = 0f
        val windowMs = windowMinutes * 60_000L

        for (i in records.indices) {
            val startRecord = records[i]
            val endIndex = records.indexOfLast { it.timestamp <= startRecord.timestamp + windowMs }
            if (endIndex > i) {
                val endRecord = records[endIndex]
                val levelDrop = startRecord.level - endRecord.level
                val hours = (endRecord.timestamp - startRecord.timestamp) / 3_600_000f
                if (hours > 0) {
                    val rate = levelDrop / hours
                    maxRate = max(maxRate, rate)
                }
            }
        }

        return maxRate
    }

    fun getTemperatureStatus(temperature: Float): TemperatureStatus {
        return when {
            temperature < 10 -> TemperatureStatus.COLD
            temperature < 35 -> TemperatureStatus.NORMAL
            temperature < 42 -> TemperatureStatus.WARM
            temperature < 48 -> TemperatureStatus.HOT
            else -> TemperatureStatus.OVERHEAT
        }
    }

    fun estimateBatteryHealth(records: List<BatteryRecord>): BatteryHealthScore {
        if (records.isEmpty()) return BatteryHealthScore(100, "无足够数据")

        val avgTemp = calculateAverageTemperature(records)
        val maxTemp = calculateMaxTemperature(records)

        var score = 100
        var notes = mutableListOf<String>()

        if (maxTemp > 45) {
            score -= 15
            notes.add("高温警告")
        } else if (maxTemp > 40) {
            score -= 5
            notes.add("温度偏高")
        }

        if (avgTemp > 38) {
            score -= 10
            notes.add("平均温度过高")
        }

        return BatteryHealthScore(
            score = max(0, min(100, score)),
            notes = notes.joinToString(", ").ifEmpty { "状态良好" }
        )
    }

    enum class TemperatureStatus {
        COLD, NORMAL, WARM, HOT, OVERHEAT
    }

    data class BatteryHealthScore(
        val score: Int,
        val notes: String
    )
}

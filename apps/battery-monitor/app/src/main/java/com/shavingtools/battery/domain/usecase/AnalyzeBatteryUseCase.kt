package com.shavingtools.battery.domain.usecase

import com.shavingtools.battery.data.repository.BatteryRepository
import com.shavingtools.battery.domain.analyzer.BatteryAnalyzer
import com.shavingtools.battery.domain.model.BatteryInfo
import javax.inject.Inject

class AnalyzeBatteryUseCase @Inject constructor(
    private val repository: BatteryRepository,
    private val analyzer: BatteryAnalyzer
) {
    data class AnalysisResult(
        val currentInfo: BatteryInfo,
        val predictedRemainingMinutes: Long,
        val dischargeRate: Float,
        val averageTemperature: Float,
        val healthScore: BatteryAnalyzer.BatteryHealthScore,
        val temperatureStatus: BatteryAnalyzer.TemperatureStatus
    )

    suspend operator fun invoke(currentInfo: BatteryInfo): AnalysisResult {
        val recentRecords = repository.getRecentRecordsSync(50)

        val predictedMinutes = analyzer.predictRemainingMinutes(
            currentInfo.level,
            recentRecords
        )

        val dischargeRate = analyzer.calculateDischargeRate(recentRecords)
        val avgTemp = analyzer.calculateAverageTemperature(recentRecords)
        val healthScore = analyzer.estimateBatteryHealth(recentRecords)
        val tempStatus = analyzer.getTemperatureStatus(currentInfo.temperature)

        return AnalysisResult(
            currentInfo = currentInfo,
            predictedRemainingMinutes = predictedMinutes,
            dischargeRate = dischargeRate,
            averageTemperature = avgTemp,
            healthScore = healthScore,
            temperatureStatus = tempStatus
        )
    }
}

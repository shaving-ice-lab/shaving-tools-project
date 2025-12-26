package com.shavingtools.battery.domain.usecase

import android.os.Build
import com.shavingtools.battery.data.repository.BatteryRepository
import com.shavingtools.battery.domain.analyzer.BatteryAnalyzer
import com.shavingtools.battery.domain.model.DeviceInfo
import com.shavingtools.battery.domain.model.TestReport
import com.shavingtools.battery.domain.model.TestScenarios
import javax.inject.Inject

class GenerateReportUseCase @Inject constructor(
    private val repository: BatteryRepository,
    private val analyzer: BatteryAnalyzer
) {
    suspend operator fun invoke(sessionId: String): Result<TestReport> {
        return try {
            val session = repository.getSessionById(sessionId)
                ?: return Result.failure(Exception("测试会话不存在"))

            val records = repository.getRecordsForSessionSync(sessionId)
            if (records.isEmpty()) {
                return Result.failure(Exception("没有测试记录数据"))
            }

            val scenario = TestScenarios.ALL.find { it.id == session.scenarioId }
                ?: TestScenarios.COMPREHENSIVE

            val deviceInfo = DeviceInfo(
                model = Build.MODEL,
                manufacturer = Build.MANUFACTURER,
                androidVersion = Build.VERSION.RELEASE,
                sdkVersion = Build.VERSION.SDK_INT
            )

            val report = TestReport(
                id = "${session.id}_report",
                deviceInfo = deviceInfo,
                scenario = scenario,
                session = session,
                records = records,
                totalDurationMinutes = analyzer.calculateBatteryLifeMinutes(records),
                averageTemperature = analyzer.calculateAverageTemperature(records),
                maxTemperature = analyzer.calculateMaxTemperature(records),
                minTemperature = analyzer.calculateMinTemperature(records),
                averageDischargeRate = analyzer.calculateDischargeRate(records),
                peakDischargeRate = analyzer.calculatePeakDischargeRate(records)
            )

            Result.success(report)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

package com.shavingtools.battery.domain.usecase

import android.os.Build
import com.shavingtools.battery.data.repository.BatteryRepository
import com.shavingtools.battery.domain.model.TestScenario
import com.shavingtools.battery.domain.model.TestSession
import java.util.UUID
import javax.inject.Inject

class StartTestUseCase @Inject constructor(
    private val repository: BatteryRepository
) {
    suspend operator fun invoke(
        scenario: TestScenario,
        currentBatteryLevel: Int
    ): Result<TestSession> {
        return try {
            if (currentBatteryLevel < 95) {
                return Result.failure(Exception("请先充电至95%以上再开始测试"))
            }

            val existingSession = repository.getActiveSession()
            if (existingSession != null) {
                return Result.failure(Exception("已有进行中的测试，请先结束当前测试"))
            }

            val session = TestSession(
                id = UUID.randomUUID().toString(),
                scenarioId = scenario.id,
                scenarioName = scenario.name,
                startTime = System.currentTimeMillis(),
                startLevel = currentBatteryLevel,
                deviceModel = Build.MODEL,
                androidVersion = Build.VERSION.RELEASE,
                isCompleted = false
            )

            repository.createTestSession(session)
            Result.success(session)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

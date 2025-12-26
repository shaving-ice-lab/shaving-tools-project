package com.shavingtools.battery.data.repository

import com.shavingtools.battery.data.local.dao.BatteryRecordDao
import com.shavingtools.battery.data.local.dao.TestSessionDao
import com.shavingtools.battery.data.local.entity.BatteryRecordEntity
import com.shavingtools.battery.data.local.entity.TestSessionEntity
import com.shavingtools.battery.domain.model.BatteryInfo
import com.shavingtools.battery.domain.model.BatteryRecord
import com.shavingtools.battery.domain.model.TestSession
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class BatteryRepository @Inject constructor(
    private val batteryRecordDao: BatteryRecordDao,
    private val testSessionDao: TestSessionDao
) {
    // Battery Records
    suspend fun insertBatteryRecord(record: BatteryRecord): Long {
        return batteryRecordDao.insertRecord(record.toEntity())
    }

    suspend fun insertBatteryInfo(info: BatteryInfo, sessionId: String? = null): Long {
        val entity = BatteryRecordEntity(
            timestamp = info.timestamp,
            level = info.level,
            status = info.status.name,
            health = info.health.name,
            temperature = info.temperature,
            voltage = info.voltage,
            current = info.current,
            plugType = info.plugType.name,
            technology = info.technology,
            testSessionId = sessionId
        )
        return batteryRecordDao.insertRecord(entity)
    }

    fun getRecordsForSession(sessionId: String): Flow<List<BatteryRecord>> {
        return batteryRecordDao.getRecordsForSession(sessionId).map { entities ->
            entities.map { it.toDomain() }
        }
    }

    suspend fun getRecordsForSessionSync(sessionId: String): List<BatteryRecord> {
        return batteryRecordDao.getRecordsForSessionSync(sessionId).map { it.toDomain() }
    }

    fun getRecentRecords(limit: Int = 100): Flow<List<BatteryRecord>> {
        return batteryRecordDao.getRecentRecords(limit).map { entities ->
            entities.map { it.toDomain() }
        }
    }

    suspend fun getRecentRecordsSync(limit: Int = 100): List<BatteryRecord> {
        return batteryRecordDao.getRecentRecordsSync(limit).map { it.toDomain() }
    }

    // Test Sessions
    suspend fun createTestSession(session: TestSession) {
        testSessionDao.insertSession(session.toEntity())
    }

    suspend fun updateTestSession(session: TestSession) {
        testSessionDao.updateSession(session.toEntity())
    }

    suspend fun getSessionById(sessionId: String): TestSession? {
        return testSessionDao.getSessionById(sessionId)?.toDomain()
    }

    fun getSessionByIdFlow(sessionId: String): Flow<TestSession?> {
        return testSessionDao.getSessionByIdFlow(sessionId).map { it?.toDomain() }
    }

    fun getAllSessions(): Flow<List<TestSession>> {
        return testSessionDao.getAllSessions().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    fun getCompletedSessions(): Flow<List<TestSession>> {
        return testSessionDao.getCompletedSessions().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    suspend fun getActiveSession(): TestSession? {
        return testSessionDao.getActiveSession()?.toDomain()
    }

    suspend fun deleteSession(sessionId: String) {
        testSessionDao.deleteSession(sessionId)
        batteryRecordDao.deleteRecordsForSession(sessionId)
    }

    // Extension functions for conversion
    private fun BatteryRecord.toEntity() = BatteryRecordEntity(
        id = id,
        timestamp = timestamp,
        level = level,
        status = status,
        health = health,
        temperature = temperature,
        voltage = voltage,
        current = current,
        plugType = plugType,
        technology = technology,
        testSessionId = testSessionId
    )

    private fun BatteryRecordEntity.toDomain() = BatteryRecord(
        id = id,
        timestamp = timestamp,
        level = level,
        status = status,
        health = health,
        temperature = temperature,
        voltage = voltage,
        current = current,
        plugType = plugType,
        technology = technology,
        testSessionId = testSessionId
    )

    private fun TestSession.toEntity() = TestSessionEntity(
        id = id,
        scenarioId = scenarioId,
        scenarioName = scenarioName,
        startTime = startTime,
        endTime = endTime,
        startLevel = startLevel,
        endLevel = endLevel,
        totalDurationMinutes = totalDurationMinutes,
        averageDischargeRate = averageDischargeRate,
        averageTemperature = averageTemperature,
        maxTemperature = maxTemperature,
        deviceModel = deviceModel,
        androidVersion = androidVersion,
        notes = notes,
        isCompleted = isCompleted
    )

    private fun TestSessionEntity.toDomain() = TestSession(
        id = id,
        scenarioId = scenarioId,
        scenarioName = scenarioName,
        startTime = startTime,
        endTime = endTime,
        startLevel = startLevel,
        endLevel = endLevel,
        totalDurationMinutes = totalDurationMinutes,
        averageDischargeRate = averageDischargeRate,
        averageTemperature = averageTemperature,
        maxTemperature = maxTemperature,
        deviceModel = deviceModel,
        androidVersion = androidVersion,
        notes = notes,
        isCompleted = isCompleted
    )
}

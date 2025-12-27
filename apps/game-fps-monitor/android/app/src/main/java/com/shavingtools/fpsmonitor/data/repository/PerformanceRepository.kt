package com.shavingtools.fpsmonitor.data.repository

import com.shavingtools.fpsmonitor.data.local.dao.FrameRecordDao
import com.shavingtools.fpsmonitor.data.local.dao.TestSessionDao
import com.shavingtools.fpsmonitor.data.local.entity.FrameRecordEntity
import com.shavingtools.fpsmonitor.data.local.entity.TestSessionEntity
import com.shavingtools.fpsmonitor.domain.model.FrameData
import com.shavingtools.fpsmonitor.domain.model.PerformanceSnapshot
import com.shavingtools.fpsmonitor.domain.model.TestSession
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PerformanceRepository @Inject constructor(
    private val frameRecordDao: FrameRecordDao,
    private val testSessionDao: TestSessionDao
) {
    // ==================== Test Sessions ====================
    
    suspend fun createSession(gameName: String, packageName: String): Long {
        val session = TestSessionEntity(
            gameName = gameName,
            packageName = packageName,
            startTime = System.currentTimeMillis()
        )
        return testSessionDao.insert(session)
    }
    
    suspend fun endSession(sessionId: Long) {
        val session = testSessionDao.getById(sessionId)
        session?.let {
            testSessionDao.update(it.copy(endTime = System.currentTimeMillis()))
        }
    }
    
    fun getAllSessions(): Flow<List<TestSession>> {
        return testSessionDao.getAll().map { entities ->
            entities.map { it.toDomainModel() }
        }
    }
    
    suspend fun getSessionById(sessionId: Long): TestSession? {
        return testSessionDao.getById(sessionId)?.toDomainModel()
    }
    
    suspend fun deleteSession(sessionId: Long) {
        testSessionDao.deleteById(sessionId)
    }
    
    // ==================== Frame Records ====================
    
    suspend fun saveFrameData(sessionId: Long, frameData: FrameData) {
        val record = FrameRecordEntity(
            sessionId = sessionId,
            timestamp = frameData.timestamp,
            fps = frameData.fps,
            frameTime = frameData.frameTime,
            isJank = frameData.isJank
        )
        frameRecordDao.insert(record)
    }
    
    suspend fun saveFrameDataBatch(sessionId: Long, frameDataList: List<FrameData>) {
        val records = frameDataList.map { frameData ->
            FrameRecordEntity(
                sessionId = sessionId,
                timestamp = frameData.timestamp,
                fps = frameData.fps,
                frameTime = frameData.frameTime,
                isJank = frameData.isJank
            )
        }
        frameRecordDao.insertAll(records)
    }
    
    fun getFrameRecordsForSession(sessionId: Long): Flow<List<FrameData>> {
        return frameRecordDao.getBySessionId(sessionId).map { entities ->
            entities.map { it.toDomainModel() }
        }
    }
    
    suspend fun getSessionStats(sessionId: Long): PerformanceSnapshot? {
        val avgFps = frameRecordDao.getAverageFps(sessionId) ?: return null
        val minFps = frameRecordDao.getMinFps(sessionId) ?: return null
        val maxFps = frameRecordDao.getMaxFps(sessionId) ?: return null
        val jankCount = frameRecordDao.getJankCount(sessionId)
        val totalFrames = frameRecordDao.getFrameCount(sessionId)
        
        return PerformanceSnapshot(
            fps = avgFps,
            avgFps = avgFps,
            minFps = minFps,
            maxFps = maxFps,
            cpuUsage = 0f,
            gpuUsage = 0f,
            memoryUsage = 0f,
            temperature = 0f,
            power = 0f,
            jankCount = jankCount,
            jankRate = if (totalFrames > 0) (jankCount.toFloat() / totalFrames * 100) else 0f
        )
    }
    
    // ==================== Entity Extensions ====================
    
    private fun TestSessionEntity.toDomainModel(): TestSession {
        return TestSession(
            id = id,
            gameName = gameName,
            packageName = packageName,
            startTime = startTime,
            endTime = endTime
        )
    }
    
    private fun FrameRecordEntity.toDomainModel(): FrameData {
        return FrameData(
            fps = fps,
            frameTime = frameTime,
            isJank = isJank,
            timestamp = timestamp
        )
    }
}

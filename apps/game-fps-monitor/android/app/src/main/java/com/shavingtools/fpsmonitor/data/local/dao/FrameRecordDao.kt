package com.shavingtools.fpsmonitor.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import com.shavingtools.fpsmonitor.data.local.entity.FrameRecordEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface FrameRecordDao {
    @Insert
    suspend fun insert(frame: FrameRecordEntity)

    @Insert
    suspend fun insertAll(frames: List<FrameRecordEntity>)

    @Query("SELECT * FROM frame_records WHERE sessionId = :sessionId ORDER BY timestamp ASC")
    fun getFramesBySession(sessionId: String): Flow<List<FrameRecordEntity>>

    @Query("SELECT * FROM frame_records WHERE sessionId = :sessionId ORDER BY timestamp ASC")
    suspend fun getFramesBySessionOnce(sessionId: String): List<FrameRecordEntity>

    @Query("DELETE FROM frame_records WHERE sessionId = :sessionId")
    suspend fun deleteBySession(sessionId: String)

    @Query("SELECT COUNT(*) FROM frame_records WHERE sessionId = :sessionId")
    suspend fun getFrameCount(sessionId: String): Int

    @Query("SELECT AVG(fps) FROM frame_records WHERE sessionId = :sessionId")
    suspend fun getAverageFps(sessionId: String): Float?

    @Query("SELECT MIN(fps) FROM frame_records WHERE sessionId = :sessionId")
    suspend fun getMinFps(sessionId: String): Float?

    @Query("SELECT MAX(fps) FROM frame_records WHERE sessionId = :sessionId")
    suspend fun getMaxFps(sessionId: String): Float?

    @Query("SELECT COUNT(*) FROM frame_records WHERE sessionId = :sessionId AND jank = 1")
    suspend fun getJankCount(sessionId: String): Int
}

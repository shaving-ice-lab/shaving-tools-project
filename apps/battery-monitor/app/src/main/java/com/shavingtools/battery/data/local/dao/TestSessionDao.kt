package com.shavingtools.battery.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Update
import com.shavingtools.battery.data.local.entity.TestSessionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TestSessionDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: TestSessionEntity)

    @Update
    suspend fun updateSession(session: TestSessionEntity)

    @Query("SELECT * FROM test_sessions WHERE id = :sessionId")
    suspend fun getSessionById(sessionId: String): TestSessionEntity?

    @Query("SELECT * FROM test_sessions WHERE id = :sessionId")
    fun getSessionByIdFlow(sessionId: String): Flow<TestSessionEntity?>

    @Query("SELECT * FROM test_sessions ORDER BY startTime DESC")
    fun getAllSessions(): Flow<List<TestSessionEntity>>

    @Query("SELECT * FROM test_sessions WHERE isCompleted = 1 ORDER BY startTime DESC")
    fun getCompletedSessions(): Flow<List<TestSessionEntity>>

    @Query("SELECT * FROM test_sessions WHERE isCompleted = 0 ORDER BY startTime DESC LIMIT 1")
    suspend fun getActiveSession(): TestSessionEntity?

    @Query("DELETE FROM test_sessions WHERE id = :sessionId")
    suspend fun deleteSession(sessionId: String)

    @Query("DELETE FROM test_sessions WHERE startTime < :timestamp")
    suspend fun deleteOldSessions(timestamp: Long)

    @Query("SELECT COUNT(*) FROM test_sessions WHERE isCompleted = 1")
    suspend fun getCompletedSessionCount(): Int
}

package com.shavingtools.fpsmonitor.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import androidx.room.Update
import com.shavingtools.fpsmonitor.data.local.entity.TestSessionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface TestSessionDao {
    @Insert
    suspend fun insert(session: TestSessionEntity)

    @Update
    suspend fun update(session: TestSessionEntity)

    @Query("SELECT * FROM test_sessions ORDER BY startTime DESC")
    fun getAllSessions(): Flow<List<TestSessionEntity>>

    @Query("SELECT * FROM test_sessions WHERE id = :sessionId")
    suspend fun getSession(sessionId: String): TestSessionEntity?

    @Query("UPDATE test_sessions SET endTime = :endTime WHERE id = :sessionId")
    suspend fun endSession(sessionId: String, endTime: Long)

    @Query("DELETE FROM test_sessions WHERE id = :sessionId")
    suspend fun delete(sessionId: String)

    @Query("DELETE FROM test_sessions")
    suspend fun deleteAll()
}

package com.shavingtools.battery.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.shavingtools.battery.data.local.entity.BatteryRecordEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface BatteryRecordDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecord(record: BatteryRecordEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRecords(records: List<BatteryRecordEntity>)

    @Query("SELECT * FROM battery_records WHERE testSessionId = :sessionId ORDER BY timestamp ASC")
    fun getRecordsForSession(sessionId: String): Flow<List<BatteryRecordEntity>>

    @Query("SELECT * FROM battery_records WHERE testSessionId = :sessionId ORDER BY timestamp ASC")
    suspend fun getRecordsForSessionSync(sessionId: String): List<BatteryRecordEntity>

    @Query("SELECT * FROM battery_records ORDER BY timestamp DESC LIMIT :limit")
    fun getRecentRecords(limit: Int): Flow<List<BatteryRecordEntity>>

    @Query("SELECT * FROM battery_records ORDER BY timestamp DESC LIMIT :limit")
    suspend fun getRecentRecordsSync(limit: Int): List<BatteryRecordEntity>

    @Query("SELECT * FROM battery_records WHERE timestamp BETWEEN :startTime AND :endTime ORDER BY timestamp ASC")
    fun getRecordsInRange(startTime: Long, endTime: Long): Flow<List<BatteryRecordEntity>>

    @Query("DELETE FROM battery_records WHERE testSessionId = :sessionId")
    suspend fun deleteRecordsForSession(sessionId: String)

    @Query("DELETE FROM battery_records WHERE timestamp < :timestamp")
    suspend fun deleteOldRecords(timestamp: Long)

    @Query("SELECT COUNT(*) FROM battery_records")
    suspend fun getRecordCount(): Int
}

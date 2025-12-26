package com.shavingtools.battery.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.shavingtools.battery.data.local.dao.BatteryRecordDao
import com.shavingtools.battery.data.local.dao.TestSessionDao
import com.shavingtools.battery.data.local.entity.BatteryRecordEntity
import com.shavingtools.battery.data.local.entity.TestSessionEntity

@Database(
    entities = [
        BatteryRecordEntity::class,
        TestSessionEntity::class
    ],
    version = 1,
    exportSchema = true
)
abstract class BatteryDatabase : RoomDatabase() {
    abstract fun batteryRecordDao(): BatteryRecordDao
    abstract fun testSessionDao(): TestSessionDao

    companion object {
        const val DATABASE_NAME = "battery_monitor_db"
    }
}

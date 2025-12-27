package com.shavingtools.fpsmonitor.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.shavingtools.fpsmonitor.data.local.dao.FrameRecordDao
import com.shavingtools.fpsmonitor.data.local.dao.TestSessionDao
import com.shavingtools.fpsmonitor.data.local.entity.FrameRecordEntity
import com.shavingtools.fpsmonitor.data.local.entity.TestSessionEntity

@Database(
    entities = [
        FrameRecordEntity::class,
        TestSessionEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class FpsDatabase : RoomDatabase() {
    abstract fun frameRecordDao(): FrameRecordDao
    abstract fun testSessionDao(): TestSessionDao
}

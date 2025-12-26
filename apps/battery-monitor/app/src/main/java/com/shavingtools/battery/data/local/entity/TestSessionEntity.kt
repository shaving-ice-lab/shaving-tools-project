package com.shavingtools.battery.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "test_sessions")
data class TestSessionEntity(
    @PrimaryKey
    val id: String,
    val scenarioId: String,
    val scenarioName: String,
    val startTime: Long,
    val endTime: Long? = null,
    val startLevel: Int,
    val endLevel: Int? = null,
    val totalDurationMinutes: Long? = null,
    val averageDischargeRate: Float? = null,
    val averageTemperature: Float? = null,
    val maxTemperature: Float? = null,
    val deviceModel: String,
    val androidVersion: String,
    val notes: String? = null,
    val isCompleted: Boolean = false
)

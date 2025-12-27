package com.shavingtools.fpsmonitor.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "test_sessions")
data class TestSessionEntity(
    @PrimaryKey
    val id: String,
    val gameName: String,
    val startTime: Long,
    val endTime: Long? = null,
    val deviceModel: String
)

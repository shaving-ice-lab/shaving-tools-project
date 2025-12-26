package com.shavingtools.battery.domain.model

data class BatteryRecord(
    val id: Long = 0,
    val timestamp: Long,
    val level: Int,
    val status: String,
    val health: String,
    val temperature: Float,
    val voltage: Int,
    val current: Int,
    val plugType: String,
    val technology: String,
    val testSessionId: String? = null
)

package com.shavingtools.fpsmonitor.domain.model

data class TestSession(
    val id: Long = 0,
    val gameName: String,
    val packageName: String,
    val startTime: Long,
    val endTime: Long? = null
) {
    val duration: Long
        get() = (endTime ?: System.currentTimeMillis()) - startTime
    
    val isActive: Boolean
        get() = endTime == null
}

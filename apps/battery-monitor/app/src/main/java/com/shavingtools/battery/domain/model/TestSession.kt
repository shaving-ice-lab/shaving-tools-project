package com.shavingtools.battery.domain.model

data class TestSession(
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
) {
    val durationText: String
        get() {
            val minutes = totalDurationMinutes ?: return "进行中..."
            val hours = minutes / 60
            val mins = minutes % 60
            return if (hours > 0) "${hours}小时${mins}分钟" else "${mins}分钟"
        }

    val dischargeRateText: String
        get() = averageDischargeRate?.let { String.format("%.1f%%/小时", it) } ?: "N/A"
}

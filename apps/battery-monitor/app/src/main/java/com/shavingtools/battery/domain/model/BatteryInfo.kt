package com.shavingtools.battery.domain.model

data class BatteryInfo(
    val level: Int,
    val status: BatteryStatus,
    val health: BatteryHealth,
    val temperature: Float,
    val voltage: Int,
    val current: Int,
    val plugType: PlugType,
    val technology: String,
    val timestamp: Long = System.currentTimeMillis()
)

enum class BatteryStatus {
    CHARGING,
    DISCHARGING,
    FULL,
    NOT_CHARGING,
    UNKNOWN;

    fun toDisplayString(): String = when (this) {
        CHARGING -> "充电中"
        DISCHARGING -> "放电中"
        FULL -> "已充满"
        NOT_CHARGING -> "未充电"
        UNKNOWN -> "未知"
    }
}

enum class BatteryHealth {
    GOOD,
    OVERHEAT,
    DEAD,
    OVER_VOLTAGE,
    UNSPECIFIED_FAILURE,
    COLD,
    UNKNOWN;

    fun toDisplayString(): String = when (this) {
        GOOD -> "良好"
        OVERHEAT -> "过热"
        DEAD -> "损坏"
        OVER_VOLTAGE -> "过压"
        UNSPECIFIED_FAILURE -> "故障"
        COLD -> "过冷"
        UNKNOWN -> "未知"
    }
}

enum class PlugType {
    NONE,
    AC,
    USB,
    WIRELESS;

    fun toDisplayString(): String = when (this) {
        NONE -> "未连接"
        AC -> "交流充电"
        USB -> "USB充电"
        WIRELESS -> "无线充电"
    }
}

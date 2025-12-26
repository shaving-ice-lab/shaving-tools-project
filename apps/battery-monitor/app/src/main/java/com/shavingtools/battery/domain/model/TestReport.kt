package com.shavingtools.battery.domain.model

data class TestReport(
    val id: String,
    val deviceInfo: DeviceInfo,
    val scenario: TestScenario,
    val session: TestSession,
    val records: List<BatteryRecord>,
    val totalDurationMinutes: Long,
    val averageTemperature: Float,
    val maxTemperature: Float,
    val minTemperature: Float,
    val averageDischargeRate: Float,
    val peakDischargeRate: Float,
    val generatedAt: Long = System.currentTimeMillis()
) {
    val summary: String
        get() = buildString {
            appendLine("设备: ${deviceInfo.model}")
            appendLine("测试场景: ${scenario.name}")
            appendLine("续航时间: ${session.durationText}")
            appendLine("平均放电速率: ${String.format("%.1f%%/小时", averageDischargeRate)}")
            appendLine("平均温度: ${String.format("%.1f°C", averageTemperature)}")
            appendLine("最高温度: ${String.format("%.1f°C", maxTemperature)}")
        }
}

data class DeviceInfo(
    val model: String,
    val manufacturer: String,
    val androidVersion: String,
    val sdkVersion: Int,
    val batteryCapacity: Int? = null
)

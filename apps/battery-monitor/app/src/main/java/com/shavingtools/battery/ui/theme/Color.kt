package com.shavingtools.battery.ui.theme

import androidx.compose.ui.graphics.Color

// Primary colors
val Green500 = Color(0xFF4CAF50)
val Green700 = Color(0xFF388E3C)
val Green200 = Color(0xFFA5D6A7)

// Battery status colors
val BatteryCharging = Color(0xFF4CAF50)
val BatteryDischarging = Color(0xFF2196F3)
val BatteryLow = Color(0xFFF44336)
val BatteryMedium = Color(0xFFFF9800)
val BatteryHigh = Color(0xFF4CAF50)
val BatteryFull = Color(0xFF4CAF50)

// Temperature colors
val TempCold = Color(0xFF2196F3)
val TempNormal = Color(0xFF4CAF50)
val TempWarm = Color(0xFFFF9800)
val TempHot = Color(0xFFFF5722)
val TempOverheat = Color(0xFFF44336)

// Dark theme colors
val DarkSurface = Color(0xFF1C1B1F)
val DarkCard = Color(0xFF2D2C31)
val DarkBackground = Color(0xFF121212)

// Light theme colors
val LightSurface = Color(0xFFFFFBFE)
val LightCard = Color(0xFFF5F5F5)
val LightBackground = Color(0xFFFFFFFF)

// Text colors
val TextPrimary = Color(0xFFE6E1E5)
val TextSecondary = Color(0xFFCAC4D0)

fun getBatteryLevelColor(level: Int): Color {
    return when {
        level <= 20 -> BatteryLow
        level <= 50 -> BatteryMedium
        else -> BatteryHigh
    }
}

fun getTemperatureColor(temperature: Float): Color {
    return when {
        temperature < 10 -> TempCold
        temperature < 35 -> TempNormal
        temperature < 42 -> TempWarm
        temperature < 48 -> TempHot
        else -> TempOverheat
    }
}

package com.shavingtools.battery.util

object Constants {

    // Notification Channels
    const val CHANNEL_ID_MONITOR = "battery_monitor_channel"
    const val CHANNEL_ID_TEST = "battery_test_channel"
    const val CHANNEL_ID_ALERT = "battery_alert_channel"

    // Notification IDs
    const val NOTIFICATION_ID_MONITOR = 1
    const val NOTIFICATION_ID_TEST = 2
    const val NOTIFICATION_ID_ALERT = 3

    // Service Actions
    const val ACTION_START_MONITOR = "com.shavingtools.battery.START_MONITOR"
    const val ACTION_STOP_MONITOR = "com.shavingtools.battery.STOP_MONITOR"
    const val ACTION_START_TEST = "com.shavingtools.battery.START_TEST"
    const val ACTION_STOP_TEST = "com.shavingtools.battery.STOP_TEST"

    // Broadcast Actions
    const val ACTION_BATTERY_UPDATE = "com.shavingtools.battery.BATTERY_UPDATE"
    const val ACTION_TEST_PROGRESS = "com.shavingtools.battery.TEST_PROGRESS"
    const val ACTION_TEST_COMPLETE = "com.shavingtools.battery.TEST_COMPLETE"

    // Extra Keys
    const val EXTRA_SCENARIO_ID = "scenario_id"
    const val EXTRA_SESSION_ID = "session_id"
    const val EXTRA_BATTERY_LEVEL = "battery_level"
    const val EXTRA_BATTERY_TEMPERATURE = "battery_temperature"

    // Sampling Intervals (in milliseconds)
    const val SAMPLING_INTERVAL_NORMAL = 60_000L  // 1 minute
    const val SAMPLING_INTERVAL_TEST = 30_000L   // 30 seconds during test
    const val SAMPLING_INTERVAL_HIGH_FREQ = 10_000L // 10 seconds for high frequency

    // Test Thresholds
    const val MIN_BATTERY_LEVEL_FOR_TEST = 20
    const val RECOMMENDED_BATTERY_LEVEL_FOR_TEST = 95
    const val LOW_BATTERY_WARNING_LEVEL = 15
    const val CRITICAL_BATTERY_LEVEL = 5

    // Temperature Thresholds (in Celsius)
    const val TEMP_NORMAL_MAX = 35f
    const val TEMP_WARM_MAX = 40f
    const val TEMP_HOT_MAX = 45f
    const val TEMP_OVERHEAT = 50f

    // Data Retention
    const val MAX_RECORDS_TO_KEEP = 10000
    const val RECORDS_CLEANUP_THRESHOLD = 12000
    const val DATA_RETENTION_DAYS = 30

    // Preferences Keys
    const val PREF_AUTO_START_MONITOR = "auto_start_monitor"
    const val PREF_SAMPLING_INTERVAL = "sampling_interval"
    const val PREF_LOW_BATTERY_ALERT = "low_battery_alert"
    const val PREF_HIGH_TEMP_ALERT = "high_temp_alert"
    const val PREF_DARK_MODE = "dark_mode"
}

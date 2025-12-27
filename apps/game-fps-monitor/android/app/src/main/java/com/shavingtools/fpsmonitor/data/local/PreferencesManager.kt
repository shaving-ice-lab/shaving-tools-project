package com.shavingtools.fpsmonitor.data.local

import android.content.Context
import android.content.SharedPreferences
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PreferencesManager @Inject constructor(
    @ApplicationContext context: Context
) {
    private val prefs: SharedPreferences = context.getSharedPreferences(
        PREFS_NAME, Context.MODE_PRIVATE
    )
    
    // ==================== Server Settings ====================
    
    var serverIp: String
        get() = prefs.getString(KEY_SERVER_IP, DEFAULT_SERVER_IP) ?: DEFAULT_SERVER_IP
        set(value) = prefs.edit().putString(KEY_SERVER_IP, value).apply()
    
    var serverPort: Int
        get() = prefs.getInt(KEY_SERVER_PORT, DEFAULT_SERVER_PORT)
        set(value) = prefs.edit().putInt(KEY_SERVER_PORT, value).apply()
    
    // ==================== Overlay Settings ====================
    
    var overlayEnabled: Boolean
        get() = prefs.getBoolean(KEY_OVERLAY_ENABLED, true)
        set(value) = prefs.edit().putBoolean(KEY_OVERLAY_ENABLED, value).apply()
    
    var overlayX: Int
        get() = prefs.getInt(KEY_OVERLAY_X, 0)
        set(value) = prefs.edit().putInt(KEY_OVERLAY_X, value).apply()
    
    var overlayY: Int
        get() = prefs.getInt(KEY_OVERLAY_Y, 100)
        set(value) = prefs.edit().putInt(KEY_OVERLAY_Y, value).apply()
    
    var overlayAlpha: Float
        get() = prefs.getFloat(KEY_OVERLAY_ALPHA, 0.9f)
        set(value) = prefs.edit().putFloat(KEY_OVERLAY_ALPHA, value).apply()
    
    var overlayMode: OverlayMode
        get() = OverlayMode.fromValue(prefs.getInt(KEY_OVERLAY_MODE, OverlayMode.SIMPLE.value))
        set(value) = prefs.edit().putInt(KEY_OVERLAY_MODE, value.value).apply()
    
    // ==================== Collection Settings ====================
    
    var sampleRate: Int
        get() = prefs.getInt(KEY_SAMPLE_RATE, DEFAULT_SAMPLE_RATE)
        set(value) = prefs.edit().putInt(KEY_SAMPLE_RATE, value).apply()
    
    var autoConnect: Boolean
        get() = prefs.getBoolean(KEY_AUTO_CONNECT, true)
        set(value) = prefs.edit().putBoolean(KEY_AUTO_CONNECT, value).apply()
    
    companion object {
        private const val PREFS_NAME = "fps_monitor_prefs"
        
        private const val KEY_SERVER_IP = "server_ip"
        private const val KEY_SERVER_PORT = "server_port"
        private const val KEY_OVERLAY_ENABLED = "overlay_enabled"
        private const val KEY_OVERLAY_X = "overlay_x"
        private const val KEY_OVERLAY_Y = "overlay_y"
        private const val KEY_OVERLAY_ALPHA = "overlay_alpha"
        private const val KEY_OVERLAY_MODE = "overlay_mode"
        private const val KEY_SAMPLE_RATE = "sample_rate"
        private const val KEY_AUTO_CONNECT = "auto_connect"
        
        private const val DEFAULT_SERVER_IP = "192.168.1.100"
        private const val DEFAULT_SERVER_PORT = 8765
        private const val DEFAULT_SAMPLE_RATE = 1000 // ms
    }
}

enum class OverlayMode(val value: Int) {
    SIMPLE(0),
    DETAILED(1);
    
    companion object {
        fun fromValue(value: Int): OverlayMode {
            return entries.find { it.value == value } ?: SIMPLE
        }
    }
}

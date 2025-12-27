package com.shavingtools.fpsmonitor.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.shavingtools.fpsmonitor.FpsMonitorApp
import com.shavingtools.fpsmonitor.MainActivity
import com.shavingtools.fpsmonitor.R
import com.shavingtools.fpsmonitor.data.local.OverlayMode
import com.shavingtools.fpsmonitor.data.local.PreferencesManager
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class OverlayService : Service() {

    @Inject
    lateinit var preferencesManager: PreferencesManager

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var windowManager: WindowManager? = null
    private var overlayView: View? = null
    private var fpsTextView: TextView? = null
    private var detailsContainer: LinearLayout? = null
    private var cpuTextView: TextView? = null
    private var memTextView: TextView? = null
    private var tempTextView: TextView? = null

    private var initialX = 0
    private var initialY = 0
    private var initialTouchX = 0f
    private var initialTouchY = 0f
    private var currentMode = OverlayMode.SIMPLE

    private val layoutParams by lazy {
        WindowManager.LayoutParams().apply {
            type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE
            }
            format = PixelFormat.TRANSLUCENT
            flags = WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE
            gravity = Gravity.TOP or Gravity.START
            width = WindowManager.LayoutParams.WRAP_CONTENT
            height = WindowManager.LayoutParams.WRAP_CONTENT
            x = preferencesManager.overlayX
            y = preferencesManager.overlayY
            alpha = preferencesManager.overlayAlpha
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        startForeground(NOTIFICATION_ID, createNotification())
        createOverlay()
    }

    override fun onDestroy() {
        super.onDestroy()
        removeOverlay()
        scope.cancel()
    }

    private fun createOverlay() {
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        overlayView = LayoutInflater.from(this).inflate(R.layout.overlay_fps, null)
        fpsTextView = overlayView?.findViewById(R.id.fps_text)

        overlayView?.setOnTouchListener { view, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = layoutParams.x
                    initialY = layoutParams.y
                    initialTouchX = event.rawX
                    initialTouchY = event.rawY
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    layoutParams.x = initialX + (event.rawX - initialTouchX).toInt()
                    layoutParams.y = initialY + (event.rawY - initialTouchY).toInt()
                    windowManager?.updateViewLayout(overlayView, layoutParams)
                    true
                }
                else -> false
            }
        }

        windowManager?.addView(overlayView, layoutParams)
    }

    private fun removeOverlay() {
        // Save position before removing
        saveOverlayPosition()
        overlayView?.let {
            windowManager?.removeView(it)
            overlayView = null
        }
    }

    private fun saveOverlayPosition() {
        preferencesManager.overlayX = layoutParams.x
        preferencesManager.overlayY = layoutParams.y
    }

    fun updateFps(fps: Float, cpuUsage: Float = 0f, memoryUsage: Float = 0f, temperature: Float = 0f) {
        scope.launch {
            fpsTextView?.text = String.format("%.0f FPS", fps)
            
            // Update detailed info if in detailed mode
            if (currentMode == OverlayMode.DETAILED) {
                cpuTextView?.text = String.format("CPU: %.0f%%", cpuUsage)
                memTextView?.text = String.format("MEM: %.0fMB", memoryUsage)
                tempTextView?.text = String.format("TEMP: %.0f°C", temperature)
            }
        }
    }

    fun setAlpha(alpha: Float) {
        layoutParams.alpha = alpha
        preferencesManager.overlayAlpha = alpha
        windowManager?.updateViewLayout(overlayView, layoutParams)
    }

    fun toggleMode() {
        currentMode = if (currentMode == OverlayMode.SIMPLE) {
            OverlayMode.DETAILED
        } else {
            OverlayMode.SIMPLE
        }
        preferencesManager.overlayMode = currentMode
        updateModeUI()
    }

    private fun updateModeUI() {
        detailsContainer?.visibility = if (currentMode == OverlayMode.DETAILED) {
            View.VISIBLE
        } else {
            View.GONE
        }
    }

    private fun createNotification(): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, FpsMonitorApp.CHANNEL_ID_OVERLAY)
            .setContentTitle("悬浮窗显示中")
            .setContentText("点击返回应用")
            .setSmallIcon(R.drawable.ic_fps)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    companion object {
        private const val NOTIFICATION_ID = 1002
    }
}

package com.shavingtools.battery.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.graphics.Path
import android.view.accessibility.AccessibilityEvent
import com.shavingtools.battery.domain.model.SwipeDirection
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class AutomationService : AccessibilityService() {

    companion object {
        private var instance: AutomationService? = null

        private val _isEnabled = MutableStateFlow(false)
        val isEnabled: StateFlow<Boolean> = _isEnabled.asStateFlow()

        fun getInstance(): AutomationService? = instance

        fun isServiceEnabled(): Boolean = instance != null
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        _isEnabled.value = true
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // 可以在这里监听窗口变化等事件
    }

    override fun onInterrupt() {
        // 服务中断处理
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
        _isEnabled.value = false
    }

    fun performSwipe(direction: SwipeDirection, durationMs: Long = 300): Boolean {
        val displayMetrics = resources.displayMetrics
        val screenWidth = displayMetrics.widthPixels
        val screenHeight = displayMetrics.heightPixels

        val centerX = screenWidth / 2f
        val centerY = screenHeight / 2f

        val path = Path().apply {
            when (direction) {
                SwipeDirection.UP -> {
                    moveTo(centerX, screenHeight * 0.7f)
                    lineTo(centerX, screenHeight * 0.3f)
                }
                SwipeDirection.DOWN -> {
                    moveTo(centerX, screenHeight * 0.3f)
                    lineTo(centerX, screenHeight * 0.7f)
                }
                SwipeDirection.LEFT -> {
                    moveTo(screenWidth * 0.8f, centerY)
                    lineTo(screenWidth * 0.2f, centerY)
                }
                SwipeDirection.RIGHT -> {
                    moveTo(screenWidth * 0.2f, centerY)
                    lineTo(screenWidth * 0.8f, centerY)
                }
            }
        }

        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, durationMs))
            .build()

        return dispatchGesture(gesture, null, null)
    }

    fun performClick(xPercent: Float, yPercent: Float): Boolean {
        val displayMetrics = resources.displayMetrics
        val x = displayMetrics.widthPixels * xPercent
        val y = displayMetrics.heightPixels * yPercent

        val path = Path().apply {
            moveTo(x, y)
        }

        val gesture = GestureDescription.Builder()
            .addStroke(GestureDescription.StrokeDescription(path, 0, 50))
            .build()

        return dispatchGesture(gesture, null, null)
    }

    fun performScroll(times: Int = 1) {
        repeat(times) {
            performSwipe(SwipeDirection.UP, 200)
            Thread.sleep(500)
        }
    }

    fun goHome(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_HOME)
    }

    fun goBack(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_BACK)
    }

    fun openRecents(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_RECENTS)
    }

    fun lockScreen(): Boolean {
        return performGlobalAction(GLOBAL_ACTION_LOCK_SCREEN)
    }
}

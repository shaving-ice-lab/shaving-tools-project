package com.shavingtools.battery.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder
import android.os.PowerManager
import android.provider.Settings
import androidx.core.app.NotificationCompat
import com.shavingtools.battery.BatteryMonitorApp
import com.shavingtools.battery.MainActivity
import com.shavingtools.battery.R
import com.shavingtools.battery.data.repository.BatteryRepository
import com.shavingtools.battery.domain.analyzer.BatteryAnalyzer
import com.shavingtools.battery.domain.model.TestScenario
import com.shavingtools.battery.domain.model.TestSession
import com.shavingtools.battery.domain.model.TestStep
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class TestExecutorService : Service() {

    companion object {
        private const val NOTIFICATION_ID = 1002
        private const val EXTRA_SCENARIO_ID = "scenario_id"
        private const val EXTRA_SESSION_ID = "session_id"

        private val _testState = MutableStateFlow<TestState>(TestState.Idle)
        val testState: StateFlow<TestState> = _testState.asStateFlow()

        private val _isRunning = MutableStateFlow(false)
        val isRunning: StateFlow<Boolean> = _isRunning.asStateFlow()

        fun startTest(context: Context, scenario: TestScenario, session: TestSession) {
            val intent = Intent(context, TestExecutorService::class.java).apply {
                putExtra(EXTRA_SCENARIO_ID, scenario.id)
                putExtra(EXTRA_SESSION_ID, session.id)
            }
            context.startForegroundService(intent)
        }

        fun stopTest(context: Context) {
            context.stopService(Intent(context, TestExecutorService::class.java))
        }
    }

    @Inject
    lateinit var repository: BatteryRepository

    @Inject
    lateinit var analyzer: BatteryAnalyzer

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private var testJob: Job? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private var currentScenario: TestScenario? = null
    private var currentSession: TestSession? = null

    override fun onCreate() {
        super.onCreate()
        acquireWakeLock()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val scenarioId = intent?.getStringExtra(EXTRA_SCENARIO_ID)
        val sessionId = intent?.getStringExtra(EXTRA_SESSION_ID)

        if (scenarioId == null || sessionId == null) {
            stopSelf()
            return START_NOT_STICKY
        }

        _isRunning.value = true
        startForeground(NOTIFICATION_ID, createNotification("准备开始测试..."))

        serviceScope.launch {
            val session = repository.getSessionById(sessionId)
            if (session != null) {
                currentSession = session
                BatteryMonitorService.currentSessionId = sessionId

                val scenario = com.shavingtools.battery.domain.model.TestScenarios.ALL
                    .find { it.id == scenarioId }

                if (scenario != null) {
                    currentScenario = scenario
                    applyTestSettings(scenario)
                    startTestLoop(scenario, session)
                }
            }
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        _isRunning.value = false
        _testState.value = TestState.Idle
        testJob?.cancel()
        releaseWakeLock()
        serviceScope.cancel()
        BatteryMonitorService.currentSessionId = null

        serviceScope.launch {
            currentSession?.let { session ->
                finalizeTest(session)
            }
        }
    }

    private fun startTestLoop(scenario: TestScenario, session: TestSession) {
        testJob = serviceScope.launch {
            val startTime = System.currentTimeMillis()
            var stepIndex = 0

            while (isActive) {
                val batteryLevel = BatteryMonitorService.batteryInfo.value?.level ?: 100

                if (batteryLevel <= 5) {
                    _testState.value = TestState.Completed(
                        durationMinutes = (System.currentTimeMillis() - startTime) / 60_000
                    )
                    finalizeTest(session)
                    stopSelf()
                    break
                }

                val step = scenario.steps[stepIndex % scenario.steps.size]
                _testState.value = TestState.Running(
                    scenarioName = scenario.name,
                    currentStep = getStepDescription(step),
                    elapsedMinutes = (System.currentTimeMillis() - startTime) / 60_000,
                    batteryLevel = batteryLevel
                )

                updateNotification(
                    "测试中: ${scenario.name}\n" +
                    "电量: ${batteryLevel}% | 已运行: ${(System.currentTimeMillis() - startTime) / 60_000}分钟"
                )

                executeStep(step)
                stepIndex++
            }
        }
    }

    private suspend fun executeStep(step: TestStep) {
        val automationService = AutomationService.getInstance()

        when (step) {
            is TestStep.LaunchApp -> {
                try {
                    val intent = packageManager.getLaunchIntentForPackage(step.packageName)
                    intent?.let { startActivity(it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)) }
                } catch (e: Exception) {
                    // App not installed, skip
                }
                delay(2000)
            }
            is TestStep.Wait -> delay(step.durationMs)
            is TestStep.Swipe -> {
                automationService?.performSwipe(step.direction)
                delay(500)
            }
            is TestStep.Click -> {
                automationService?.performClick(step.xPercent, step.yPercent)
                delay(500)
            }
            is TestStep.ScrollPage -> {
                automationService?.performScroll(step.times)
                delay(500)
            }
            is TestStep.PlayVideo -> {
                delay(5000)
            }
            is TestStep.LockScreen -> {
                automationService?.lockScreen()
                delay(1000)
            }
            is TestStep.UnlockScreen -> {
                delay(1000)
            }
            is TestStep.GoHome -> {
                automationService?.goHome()
                delay(500)
            }
        }
    }

    private fun getStepDescription(step: TestStep): String = when (step) {
        is TestStep.LaunchApp -> "启动应用: ${step.displayName}"
        is TestStep.Wait -> "等待 ${step.durationMs / 1000}秒"
        is TestStep.Swipe -> "滑动: ${step.direction}"
        is TestStep.Click -> "点击屏幕"
        is TestStep.ScrollPage -> "滚动页面"
        is TestStep.PlayVideo -> "播放视频"
        is TestStep.LockScreen -> "锁定屏幕"
        is TestStep.UnlockScreen -> "解锁屏幕"
        is TestStep.GoHome -> "返回主页"
    }

    private fun applyTestSettings(scenario: TestScenario) {
        try {
            Settings.System.putInt(
                contentResolver,
                Settings.System.SCREEN_BRIGHTNESS,
                scenario.brightness
            )
        } catch (e: Exception) {
            // 需要WRITE_SETTINGS权限
        }
    }

    private suspend fun finalizeTest(session: TestSession) {
        val records = repository.getRecordsForSessionSync(session.id)
        val endTime = System.currentTimeMillis()
        val endLevel = BatteryMonitorService.batteryInfo.value?.level ?: 0

        val updatedSession = session.copy(
            endTime = endTime,
            endLevel = endLevel,
            totalDurationMinutes = (endTime - session.startTime) / 60_000,
            averageDischargeRate = analyzer.calculateDischargeRate(records),
            averageTemperature = analyzer.calculateAverageTemperature(records),
            maxTemperature = analyzer.calculateMaxTemperature(records),
            isCompleted = true
        )

        repository.updateTestSession(updatedSession)
    }

    private fun createNotification(content: String): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, BatteryMonitorApp.CHANNEL_ID_TEST)
            .setContentTitle("续航测试进行中")
            .setContentText(content)
            .setSmallIcon(R.drawable.ic_battery)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    private fun updateNotification(content: String) {
        val notification = createNotification(content)
        val notificationManager = getSystemService(NOTIFICATION_SERVICE) as android.app.NotificationManager
        notificationManager.notify(NOTIFICATION_ID, notification)
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
            "BatteryMonitor::TestWakeLock"
        ).apply {
            acquire(24 * 60 * 60 * 1000L)
        }
    }

    private fun releaseWakeLock() {
        wakeLock?.let {
            if (it.isHeld) it.release()
        }
        wakeLock = null
    }

    sealed class TestState {
        data object Idle : TestState()
        data class Running(
            val scenarioName: String,
            val currentStep: String,
            val elapsedMinutes: Long,
            val batteryLevel: Int
        ) : TestState()
        data class Completed(val durationMinutes: Long) : TestState()
        data class Error(val message: String) : TestState()
    }
}

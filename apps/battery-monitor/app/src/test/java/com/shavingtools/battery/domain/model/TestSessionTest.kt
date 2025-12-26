package com.shavingtools.battery.domain.model

import org.junit.Assert.assertEquals
import org.junit.Test

class TestSessionTest {

    @Test
    fun `durationText formats hours and minutes correctly`() {
        val session = createSession(totalDurationMinutes = 125) // 2小时5分钟
        assertEquals("2小时5分钟", session.durationText)
    }

    @Test
    fun `durationText formats minutes only correctly`() {
        val session = createSession(totalDurationMinutes = 45)
        assertEquals("45分钟", session.durationText)
    }

    @Test
    fun `durationText handles null duration`() {
        val session = createSession(totalDurationMinutes = null)
        assertEquals("进行中", session.durationText)
    }

    @Test
    fun `dischargeRateText formats correctly`() {
        val session = createSession(averageDischargeRate = 8.5f)
        assertEquals("8.5%/小时", session.dischargeRateText)
    }

    @Test
    fun `dischargeRateText handles null rate`() {
        val session = createSession(averageDischargeRate = null)
        assertEquals("N/A", session.dischargeRateText)
    }

    private fun createSession(
        totalDurationMinutes: Long? = null,
        averageDischargeRate: Float? = null
    ): TestSession {
        return TestSession(
            id = "test_session_1",
            scenarioId = "video_playback",
            scenarioName = "视频播放",
            startTime = System.currentTimeMillis(),
            endTime = null,
            startLevel = 100,
            endLevel = null,
            totalDurationMinutes = totalDurationMinutes,
            averageDischargeRate = averageDischargeRate,
            averageTemperature = null,
            maxTemperature = null,
            deviceModel = "Test Device",
            androidVersion = "14",
            notes = null,
            isCompleted = false
        )
    }
}

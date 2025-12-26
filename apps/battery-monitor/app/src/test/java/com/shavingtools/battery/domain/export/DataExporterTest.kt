package com.shavingtools.battery.domain.export

import com.shavingtools.battery.domain.model.BatteryRecord
import com.shavingtools.battery.domain.model.TestSession
import org.json.JSONObject
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class DataExporterTest {

    private lateinit var exporter: DataExporter

    @Before
    fun setup() {
        exporter = DataExporter()
    }

    @Test
    fun `exportSessionToJson contains required fields`() {
        val session = createTestSession()
        val records = listOf(createRecord(), createRecord())

        val json = exporter.exportSessionToJson(session, records)

        assertTrue(json.contains("session"))
        assertTrue(json.contains("records"))
        assertTrue(json.contains("scenarioName"))
    }

    @Test
    fun `exportSessionToCsv contains header and data`() {
        val session = createTestSession()
        val records = listOf(createRecord(), createRecord())

        val csv = exporter.exportSessionToCsv(session, records)

        assertTrue(csv.contains("测试会话信息"))
        assertTrue(csv.contains("电池记录数据"))
        assertTrue(csv.contains("视频播放"))
    }

    @Test
    fun `generateFileName creates proper format`() {
        val fileName = exporter.generateFileName("battery_report", "json")

        assertTrue(fileName.startsWith("battery_report_"))
        assertTrue(fileName.endsWith(".json"))
    }

    private fun createTestSession(): TestSession {
        return TestSession(
            id = "session_1",
            scenarioId = "video_playback",
            scenarioName = "视频播放",
            startTime = System.currentTimeMillis(),
            endTime = System.currentTimeMillis() + 3600000,
            startLevel = 100,
            endLevel = 80,
            totalDurationMinutes = 60,
            averageDischargeRate = 20f,
            averageTemperature = 35f,
            maxTemperature = 40f,
            deviceModel = "Test Device",
            androidVersion = "14",
            notes = null,
            isCompleted = true
        )
    }

    private fun createRecord(): BatteryRecord {
        return BatteryRecord(
            id = 0,
            timestamp = System.currentTimeMillis(),
            level = 90,
            status = "DISCHARGING",
            health = "GOOD",
            temperature = 35f,
            voltage = 4100,
            current = -500,
            plugType = "NONE",
            technology = "Li-ion",
            testSessionId = "session_1"
        )
    }
}

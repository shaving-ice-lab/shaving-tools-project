package com.shavingtools.battery.domain.analyzer

import com.shavingtools.battery.domain.model.BatteryRecord
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class BatteryAnalyzerTest {

    private lateinit var analyzer: BatteryAnalyzer

    @Before
    fun setup() {
        analyzer = BatteryAnalyzer()
    }

    @Test
    fun `calculateBatteryLifeMinutes returns correct duration`() {
        val records = listOf(
            createRecord(timestamp = 0, level = 100),
            createRecord(timestamp = 60_000, level = 99),    // 1 minute
            createRecord(timestamp = 120_000, level = 98)    // 2 minutes
        )

        val minutes = analyzer.calculateBatteryLifeMinutes(records)
        assertEquals(2L, minutes)
    }

    @Test
    fun `calculateBatteryLifeMinutes returns 0 for insufficient records`() {
        val records = listOf(createRecord(timestamp = 0, level = 100))
        assertEquals(0L, analyzer.calculateBatteryLifeMinutes(records))
    }

    @Test
    fun `calculateDischargeRate returns correct rate`() {
        val records = listOf(
            createRecord(timestamp = 0, level = 100),
            createRecord(timestamp = 3_600_000, level = 90)  // 1 hour, 10% drop
        )

        val rate = analyzer.calculateDischargeRate(records)
        assertEquals(10f, rate, 0.1f)
    }

    @Test
    fun `calculateDischargeRate returns 0 for insufficient records`() {
        val records = listOf(createRecord(timestamp = 0, level = 100))
        assertEquals(0f, analyzer.calculateDischargeRate(records), 0.01f)
    }

    @Test
    fun `predictRemainingMinutes calculates correctly`() {
        val records = listOf(
            createRecord(timestamp = 0, level = 100),
            createRecord(timestamp = 3_600_000, level = 90)  // 10%/hour
        )

        val remaining = analyzer.predictRemainingMinutes(50, records)
        // 50% / (10%/hour) = 5 hours = 300 minutes
        assertEquals(300L, remaining)
    }

    @Test
    fun `calculateAverageTemperature returns correct average`() {
        val records = listOf(
            createRecord(temperature = 30f),
            createRecord(temperature = 35f),
            createRecord(temperature = 40f)
        )

        val avg = analyzer.calculateAverageTemperature(records)
        assertEquals(35f, avg, 0.1f)
    }

    @Test
    fun `calculateMaxTemperature returns correct max`() {
        val records = listOf(
            createRecord(temperature = 30f),
            createRecord(temperature = 45f),
            createRecord(temperature = 35f)
        )

        assertEquals(45f, analyzer.calculateMaxTemperature(records), 0.1f)
    }

    @Test
    fun `calculateMinTemperature returns correct min`() {
        val records = listOf(
            createRecord(temperature = 30f),
            createRecord(temperature = 45f),
            createRecord(temperature = 25f)
        )

        assertEquals(25f, analyzer.calculateMinTemperature(records), 0.1f)
    }

    @Test
    fun `getTemperatureStatus returns correct status`() {
        assertEquals(BatteryAnalyzer.TemperatureStatus.COLD, analyzer.getTemperatureStatus(5f))
        assertEquals(BatteryAnalyzer.TemperatureStatus.NORMAL, analyzer.getTemperatureStatus(25f))
        assertEquals(BatteryAnalyzer.TemperatureStatus.WARM, analyzer.getTemperatureStatus(38f))
        assertEquals(BatteryAnalyzer.TemperatureStatus.HOT, analyzer.getTemperatureStatus(45f))
        assertEquals(BatteryAnalyzer.TemperatureStatus.OVERHEAT, analyzer.getTemperatureStatus(50f))
    }

    @Test
    fun `estimateBatteryHealth returns good score for normal temps`() {
        val records = listOf(
            createRecord(temperature = 30f),
            createRecord(temperature = 32f),
            createRecord(temperature = 34f)
        )

        val healthScore = analyzer.estimateBatteryHealth(records)
        assertEquals(100, healthScore.score)
        assertEquals("状态良好", healthScore.notes)
    }

    @Test
    fun `estimateBatteryHealth reduces score for high temps`() {
        val records = listOf(
            createRecord(temperature = 40f),
            createRecord(temperature = 46f),
            createRecord(temperature = 44f)
        )

        val healthScore = analyzer.estimateBatteryHealth(records)
        assertTrue(healthScore.score < 100)
        assertTrue(healthScore.notes.contains("高温") || healthScore.notes.contains("温度"))
    }

    private fun createRecord(
        timestamp: Long = System.currentTimeMillis(),
        level: Int = 100,
        temperature: Float = 30f
    ): BatteryRecord {
        return BatteryRecord(
            id = 0,
            timestamp = timestamp,
            level = level,
            status = "DISCHARGING",
            health = "GOOD",
            temperature = temperature,
            voltage = 4200,
            current = -500,
            plugType = "NONE",
            technology = "Li-ion",
            testSessionId = null
        )
    }
}

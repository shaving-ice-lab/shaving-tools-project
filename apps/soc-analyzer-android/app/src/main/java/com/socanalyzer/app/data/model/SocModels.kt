package com.socanalyzer.app.data.model

import kotlinx.serialization.Serializable

@Serializable
data class DeviceHandshake(
    val type: String = "handshake",
    val device: DeviceInfo,
    val app_version: String,
    val timestamp: Long
)

@Serializable
data class DeviceInfo(
    val brand: String,
    val model: String,
    val android_version: String,
    val soc: String
)

@Serializable
data class CpuCore(
    val type: String,
    val arch: String,
    val max_freq: Int,
    val current_freq: Int,
    val min_freq: Int = 0
)

@Serializable
data class SocInfo(
    val type: String = "soc_info",
    val cpu: CpuInfo,
    val gpu: GpuInfo,
    val memory: MemoryInfo,
    val npu: NpuInfo? = null
)

@Serializable
data class CpuInfo(
    val name: String,
    val cores: List<CpuCore>,
    val process: String
)

@Serializable
data class GpuInfo(
    val name: String,
    val max_freq: Int,
    val current_freq: Int
)

@Serializable
data class MemoryInfo(
    val type: String,
    val size_gb: Int,
    val bandwidth: String
)

@Serializable
data class NpuInfo(
    val name: String,
    val tops: Int
)

@Serializable
data class RealtimeMonitor(
    val type: String = "realtime_monitor",
    val timestamp: Long,
    val cpu: CpuMonitor,
    val gpu: GpuMonitor,
    val memory: MemoryMonitor,
    val battery: BatteryMonitor
)

@Serializable
data class CpuMonitor(
    val usage: Float,
    val frequencies: List<Int>,
    val temperature: Float
)

@Serializable
data class GpuMonitor(
    val usage: Float,
    val frequency: Int,
    val temperature: Float
)

@Serializable
data class MemoryMonitor(
    val used_mb: Int,
    val available_mb: Int
)

@Serializable
data class BatteryMonitor(
    val temperature: Float,
    val current_ma: Int,
    val voltage_mv: Int,
    val power_mw: Int
)

@Serializable
data class BenchmarkResult(
    val type: String = "benchmark_result",
    val timestamp: Long,
    val cpu: CpuBenchmark,
    val gpu: GpuBenchmark,
    val ai: AiBenchmark? = null
)

@Serializable
data class CpuBenchmark(
    val single_core: Int,
    val multi_core: Int,
    val integer: Int,
    val float: Int,
    val memory_bandwidth: Int
)

@Serializable
data class GpuBenchmark(
    val score: Int,
    val fill_rate: Int,
    val texture: Int,
    val compute: Int
)

@Serializable
data class AiBenchmark(
    val score: Int,
    val int8: Int,
    val fp16: Int
)

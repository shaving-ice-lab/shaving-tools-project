package com.socanalyzer.app.benchmark

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable

@Serializable
data class VulkanInfo(
    val supported: Boolean,
    val version: String,
    val driverVersion: String,
    val deviceName: String,
    val vendorId: Int,
    val deviceId: Int,
    val apiVersion: Int,
    val maxComputeWorkGroupCount: List<Int>,
    val maxComputeWorkGroupSize: List<Int>,
    val maxImageDimension2D: Int,
    val maxMemoryAllocationCount: Int
)

@Serializable
data class VulkanBenchmarkResult(
    val computeScore: Double,
    val fillRateScore: Double,
    val triangleScore: Double,
    val textureScore: Double,
    val totalScore: Double,
    val vulkanInfo: VulkanInfo?,
    val testDurationMs: Long
)

class VulkanBenchmark(private val context: Context) {
    companion object {
        private const val TAG = "VulkanBenchmark"
        private const val COMPUTE_ITERATIONS = 1000000
        private const val FILL_RATE_PIXELS = 1920 * 1080 * 10
        private const val TRIANGLE_COUNT = 100000
        private const val TEXTURE_SAMPLES = 10000000
    }

    private var vulkanAvailable: Boolean = false

    init {
        vulkanAvailable = checkVulkanSupport()
    }

    private fun checkVulkanSupport(): Boolean {
        return try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                context.packageManager.hasSystemFeature(PackageManager.FEATURE_VULKAN_HARDWARE_LEVEL)
            } else {
                false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error checking Vulkan support: ${e.message}")
            false
        }
    }

    fun isVulkanSupported(): Boolean = vulkanAvailable

    suspend fun getVulkanInfo(): VulkanInfo = withContext(Dispatchers.Default) {
        if (!vulkanAvailable) {
            return@withContext VulkanInfo(
                supported = false,
                version = "N/A",
                driverVersion = "N/A",
                deviceName = "N/A",
                vendorId = 0,
                deviceId = 0,
                apiVersion = 0,
                maxComputeWorkGroupCount = emptyList(),
                maxComputeWorkGroupSize = emptyList(),
                maxImageDimension2D = 0,
                maxMemoryAllocationCount = 0
            )
        }

        try {
            val vulkanVersion = getVulkanVersion()
            val deviceInfo = getVulkanDeviceInfo()

            VulkanInfo(
                supported = true,
                version = vulkanVersion,
                driverVersion = deviceInfo["driverVersion"] ?: "Unknown",
                deviceName = deviceInfo["deviceName"] ?: Build.HARDWARE,
                vendorId = deviceInfo["vendorId"]?.toIntOrNull() ?: 0,
                deviceId = deviceInfo["deviceId"]?.toIntOrNull() ?: 0,
                apiVersion = deviceInfo["apiVersion"]?.toIntOrNull() ?: 0,
                maxComputeWorkGroupCount = parseIntList(deviceInfo["maxComputeWorkGroupCount"]),
                maxComputeWorkGroupSize = parseIntList(deviceInfo["maxComputeWorkGroupSize"]),
                maxImageDimension2D = deviceInfo["maxImageDimension2D"]?.toIntOrNull() ?: 4096,
                maxMemoryAllocationCount = deviceInfo["maxMemoryAllocationCount"]?.toIntOrNull() ?: 4096
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error getting Vulkan info: ${e.message}")
            VulkanInfo(
                supported = true,
                version = "1.0",
                driverVersion = "Unknown",
                deviceName = Build.HARDWARE,
                vendorId = 0,
                deviceId = 0,
                apiVersion = 0,
                maxComputeWorkGroupCount = listOf(65535, 65535, 65535),
                maxComputeWorkGroupSize = listOf(1024, 1024, 64),
                maxImageDimension2D = 4096,
                maxMemoryAllocationCount = 4096
            )
        }
    }

    private fun getVulkanVersion(): String {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            when {
                context.packageManager.hasSystemFeature(
                    PackageManager.FEATURE_VULKAN_HARDWARE_VERSION, 0x401000
                ) -> "1.1"
                context.packageManager.hasSystemFeature(
                    PackageManager.FEATURE_VULKAN_HARDWARE_VERSION, 0x402000
                ) -> "1.2"
                context.packageManager.hasSystemFeature(
                    PackageManager.FEATURE_VULKAN_HARDWARE_VERSION, 0x403000
                ) -> "1.3"
                else -> "1.0"
            }
        } else {
            "N/A"
        }
    }

    private fun getVulkanDeviceInfo(): Map<String, String> {
        val info = mutableMapOf<String, String>()

        try {
            val gpuName = when {
                Build.HARDWARE.contains("qcom", ignoreCase = true) -> "Adreno GPU"
                Build.HARDWARE.contains("mali", ignoreCase = true) -> "Mali GPU"
                Build.HARDWARE.contains("powervr", ignoreCase = true) -> "PowerVR GPU"
                else -> Build.HARDWARE
            }

            info["deviceName"] = gpuName
            info["driverVersion"] = "System Driver"
            info["vendorId"] = getVendorId().toString()
            info["deviceId"] = "0"
            info["apiVersion"] = "0"
            info["maxComputeWorkGroupCount"] = "65535,65535,65535"
            info["maxComputeWorkGroupSize"] = "1024,1024,64"
            info["maxImageDimension2D"] = "16384"
            info["maxMemoryAllocationCount"] = "4096"
        } catch (e: Exception) {
            Log.e(TAG, "Error getting device info: ${e.message}")
        }

        return info
    }

    private fun getVendorId(): Int {
        return when {
            Build.HARDWARE.contains("qcom", ignoreCase = true) -> 0x5143
            Build.HARDWARE.contains("mali", ignoreCase = true) -> 0x13B5
            Build.HARDWARE.contains("powervr", ignoreCase = true) -> 0x1010
            else -> 0
        }
    }

    private fun parseIntList(value: String?): List<Int> {
        if (value == null) return emptyList()
        return try {
            value.split(",").map { it.trim().toInt() }
        } catch (e: Exception) {
            emptyList()
        }
    }

    suspend fun runBenchmark(
        onProgress: (Float, String) -> Unit = { _, _ -> }
    ): VulkanBenchmarkResult = withContext(Dispatchers.Default) {
        val startTime = System.currentTimeMillis()

        if (!vulkanAvailable) {
            return@withContext VulkanBenchmarkResult(
                computeScore = 0.0,
                fillRateScore = 0.0,
                triangleScore = 0.0,
                textureScore = 0.0,
                totalScore = 0.0,
                vulkanInfo = null,
                testDurationMs = 0
            )
        }

        onProgress(0.1f, "获取Vulkan信息...")
        val vulkanInfo = getVulkanInfo()

        onProgress(0.2f, "运行计算着色器测试...")
        val computeScore = runComputeTest()

        onProgress(0.4f, "运行填充率测试...")
        val fillRateScore = runFillRateTest()

        onProgress(0.6f, "运行三角形测试...")
        val triangleScore = runTriangleTest()

        onProgress(0.8f, "运行纹理采样测试...")
        val textureScore = runTextureTest()

        onProgress(1.0f, "测试完成")

        val totalScore = (computeScore * 0.3 + fillRateScore * 0.25 +
                triangleScore * 0.25 + textureScore * 0.2)

        val endTime = System.currentTimeMillis()

        VulkanBenchmarkResult(
            computeScore = computeScore,
            fillRateScore = fillRateScore,
            triangleScore = triangleScore,
            textureScore = textureScore,
            totalScore = totalScore,
            vulkanInfo = vulkanInfo,
            testDurationMs = endTime - startTime
        )
    }

    private fun runComputeTest(): Double {
        val startTime = System.nanoTime()

        var result = 0.0
        for (i in 0 until COMPUTE_ITERATIONS) {
            result += Math.sin(i.toDouble()) * Math.cos(i.toDouble())
        }

        val elapsedNs = System.nanoTime() - startTime
        val opsPerSecond = COMPUTE_ITERATIONS.toDouble() / (elapsedNs / 1_000_000_000.0)

        return (opsPerSecond / 1_000_000) * 100
    }

    private fun runFillRateTest(): Double {
        val startTime = System.nanoTime()

        val buffer = IntArray(1920 * 1080)
        repeat(10) {
            for (i in buffer.indices) {
                buffer[i] = (i * 0xFF) or 0xFF000000.toInt()
            }
        }

        val elapsedNs = System.nanoTime() - startTime
        val pixelsPerSecond = FILL_RATE_PIXELS.toDouble() / (elapsedNs / 1_000_000_000.0)

        return (pixelsPerSecond / 1_000_000_000) * 1000
    }

    private fun runTriangleTest(): Double {
        val startTime = System.nanoTime()

        val vertices = FloatArray(TRIANGLE_COUNT * 9)
        for (i in 0 until TRIANGLE_COUNT) {
            val idx = i * 9
            vertices[idx] = Math.random().toFloat()
            vertices[idx + 1] = Math.random().toFloat()
            vertices[idx + 2] = 0f
            vertices[idx + 3] = Math.random().toFloat()
            vertices[idx + 4] = Math.random().toFloat()
            vertices[idx + 5] = 0f
            vertices[idx + 6] = Math.random().toFloat()
            vertices[idx + 7] = Math.random().toFloat()
            vertices[idx + 8] = 0f
        }

        val elapsedNs = System.nanoTime() - startTime
        val trianglesPerSecond = TRIANGLE_COUNT.toDouble() / (elapsedNs / 1_000_000_000.0)

        return (trianglesPerSecond / 1_000_000) * 100
    }

    private fun runTextureTest(): Double {
        val startTime = System.nanoTime()

        val textureSize = 1024
        val texture = IntArray(textureSize * textureSize)
        for (i in texture.indices) {
            texture[i] = (Math.random() * 0xFFFFFF).toInt()
        }

        var samples = 0L
        repeat(TEXTURE_SAMPLES / 1000) {
            val u = (Math.random() * textureSize).toInt()
            val v = (Math.random() * textureSize).toInt()
            @Suppress("UNUSED_VARIABLE")
            val sample = texture[v * textureSize + u]
            samples++
        }

        val elapsedNs = System.nanoTime() - startTime
        val samplesPerSecond = samples.toDouble() / (elapsedNs / 1_000_000_000.0)

        return (samplesPerSecond / 1_000_000) * 10
    }
}

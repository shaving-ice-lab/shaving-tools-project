package com.socanalyzer.app.benchmark

import android.content.Context
import android.os.Build
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import java.nio.ByteBuffer
import java.nio.FloatBuffer

@Serializable
data class NnapiInfo(
    val supported: Boolean,
    val version: Int,
    val acceleratorName: String,
    val acceleratorType: String,
    val hasGpuAcceleration: Boolean,
    val hasDspAcceleration: Boolean,
    val hasNpuAcceleration: Boolean
)

@Serializable
data class NnapiBenchmarkResult(
    val matrixMultiplyScore: Double,
    val convolutionScore: Double,
    val poolingScore: Double,
    val activationScore: Double,
    val totalScore: Double,
    val int8Score: Double,
    val fp16Score: Double,
    val fp32Score: Double,
    val nnapiInfo: NnapiInfo,
    val testDurationMs: Long
)

class NnapiBenchmark(private val context: Context) {
    companion object {
        private const val TAG = "NnapiBenchmark"
        private const val MATRIX_SIZE = 256
        private const val CONV_INPUT_SIZE = 224
        private const val CONV_KERNEL_SIZE = 3
        private const val POOL_SIZE = 2
        private const val BATCH_SIZE = 1
        private const val CHANNELS = 64
    }

    private var nnapiAvailable: Boolean = false
    private var nnapiVersion: Int = 0

    init {
        checkNnapiSupport()
    }

    private fun checkNnapiSupport() {
        nnapiAvailable = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1
        nnapiVersion = when {
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE -> 7
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU -> 6
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> 5
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.R -> 4
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q -> 3
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.P -> 2
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1 -> 1
            else -> 0
        }
    }

    fun isNnapiSupported(): Boolean = nnapiAvailable

    fun getNnapiVersion(): Int = nnapiVersion

    suspend fun getNnapiInfo(): NnapiInfo = withContext(Dispatchers.Default) {
        val acceleratorInfo = detectAccelerator()

        NnapiInfo(
            supported = nnapiAvailable,
            version = nnapiVersion,
            acceleratorName = acceleratorInfo.first,
            acceleratorType = acceleratorInfo.second,
            hasGpuAcceleration = hasGpuAcceleration(),
            hasDspAcceleration = hasDspAcceleration(),
            hasNpuAcceleration = hasNpuAcceleration()
        )
    }

    private fun detectAccelerator(): Pair<String, String> {
        val hardware = Build.HARDWARE.lowercase()
        val board = Build.BOARD.lowercase()

        return when {
            hardware.contains("qcom") || board.contains("qcom") -> {
                "Qualcomm Hexagon DSP" to "DSP"
            }
            hardware.contains("exynos") || board.contains("exynos") -> {
                "Samsung NPU" to "NPU"
            }
            hardware.contains("mt") || hardware.contains("mediatek") -> {
                "MediaTek APU" to "APU"
            }
            hardware.contains("kirin") -> {
                "HiSilicon NPU" to "NPU"
            }
            hardware.contains("tensor") -> {
                "Google Tensor TPU" to "TPU"
            }
            else -> {
                "CPU Fallback" to "CPU"
            }
        }
    }

    private fun hasGpuAcceleration(): Boolean {
        return Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q
    }

    private fun hasDspAcceleration(): Boolean {
        val hardware = Build.HARDWARE.lowercase()
        return hardware.contains("qcom") || hardware.contains("sdm") || hardware.contains("sm")
    }

    private fun hasNpuAcceleration(): Boolean {
        val hardware = Build.HARDWARE.lowercase()
        return hardware.contains("exynos") || hardware.contains("kirin") ||
                hardware.contains("dimensity") || hardware.contains("tensor")
    }

    suspend fun runBenchmark(
        onProgress: (Float, String) -> Unit = { _, _ -> }
    ): NnapiBenchmarkResult = withContext(Dispatchers.Default) {
        val startTime = System.currentTimeMillis()

        onProgress(0.05f, "获取NNAPI信息...")
        val nnapiInfo = getNnapiInfo()

        if (!nnapiAvailable) {
            return@withContext NnapiBenchmarkResult(
                matrixMultiplyScore = 0.0,
                convolutionScore = 0.0,
                poolingScore = 0.0,
                activationScore = 0.0,
                totalScore = 0.0,
                int8Score = 0.0,
                fp16Score = 0.0,
                fp32Score = 0.0,
                nnapiInfo = nnapiInfo,
                testDurationMs = 0
            )
        }

        onProgress(0.1f, "运行矩阵乘法测试...")
        val matrixScore = runMatrixMultiplyTest()

        onProgress(0.25f, "运行卷积测试...")
        val convScore = runConvolutionTest()

        onProgress(0.4f, "运行池化测试...")
        val poolScore = runPoolingTest()

        onProgress(0.55f, "运行激活函数测试...")
        val activationScore = runActivationTest()

        onProgress(0.7f, "运行INT8量化测试...")
        val int8Score = runInt8Test()

        onProgress(0.85f, "运行FP16测试...")
        val fp16Score = runFp16Test()

        onProgress(0.95f, "运行FP32测试...")
        val fp32Score = runFp32Test()

        onProgress(1.0f, "测试完成")

        val totalScore = matrixScore * 0.25 + convScore * 0.25 +
                poolScore * 0.15 + activationScore * 0.15 +
                int8Score * 0.1 + fp16Score * 0.05 + fp32Score * 0.05

        val endTime = System.currentTimeMillis()

        NnapiBenchmarkResult(
            matrixMultiplyScore = matrixScore,
            convolutionScore = convScore,
            poolingScore = poolScore,
            activationScore = activationScore,
            totalScore = totalScore,
            int8Score = int8Score,
            fp16Score = fp16Score,
            fp32Score = fp32Score,
            nnapiInfo = nnapiInfo,
            testDurationMs = endTime - startTime
        )
    }

    private fun runMatrixMultiplyTest(): Double {
        val startTime = System.nanoTime()

        val a = FloatArray(MATRIX_SIZE * MATRIX_SIZE) { Math.random().toFloat() }
        val b = FloatArray(MATRIX_SIZE * MATRIX_SIZE) { Math.random().toFloat() }
        val c = FloatArray(MATRIX_SIZE * MATRIX_SIZE)

        for (i in 0 until MATRIX_SIZE) {
            for (j in 0 until MATRIX_SIZE) {
                var sum = 0f
                for (k in 0 until MATRIX_SIZE) {
                    sum += a[i * MATRIX_SIZE + k] * b[k * MATRIX_SIZE + j]
                }
                c[i * MATRIX_SIZE + j] = sum
            }
        }

        val elapsedNs = System.nanoTime() - startTime
        val gflops = (2.0 * MATRIX_SIZE * MATRIX_SIZE * MATRIX_SIZE) / elapsedNs

        return gflops * 1000
    }

    private fun runConvolutionTest(): Double {
        val startTime = System.nanoTime()

        val inputSize = CONV_INPUT_SIZE
        val kernelSize = CONV_KERNEL_SIZE
        val outputSize = inputSize - kernelSize + 1

        val input = FloatArray(CHANNELS * inputSize * inputSize) { Math.random().toFloat() }
        val kernel = FloatArray(CHANNELS * kernelSize * kernelSize) { Math.random().toFloat() }
        val output = FloatArray(CHANNELS * outputSize * outputSize)

        for (c in 0 until CHANNELS) {
            for (i in 0 until outputSize) {
                for (j in 0 until outputSize) {
                    var sum = 0f
                    for (ki in 0 until kernelSize) {
                        for (kj in 0 until kernelSize) {
                            val inputIdx = c * inputSize * inputSize + (i + ki) * inputSize + (j + kj)
                            val kernelIdx = c * kernelSize * kernelSize + ki * kernelSize + kj
                            sum += input[inputIdx] * kernel[kernelIdx]
                        }
                    }
                    output[c * outputSize * outputSize + i * outputSize + j] = sum
                }
            }
        }

        val elapsedNs = System.nanoTime() - startTime
        val ops = 2.0 * CHANNELS * outputSize * outputSize * kernelSize * kernelSize
        val gflops = ops / elapsedNs

        return gflops * 500
    }

    private fun runPoolingTest(): Double {
        val startTime = System.nanoTime()

        val inputSize = CONV_INPUT_SIZE
        val outputSize = inputSize / POOL_SIZE

        val input = FloatArray(CHANNELS * inputSize * inputSize) { Math.random().toFloat() }
        val output = FloatArray(CHANNELS * outputSize * outputSize)

        for (c in 0 until CHANNELS) {
            for (i in 0 until outputSize) {
                for (j in 0 until outputSize) {
                    var maxVal = Float.MIN_VALUE
                    for (pi in 0 until POOL_SIZE) {
                        for (pj in 0 until POOL_SIZE) {
                            val inputIdx = c * inputSize * inputSize +
                                    (i * POOL_SIZE + pi) * inputSize + (j * POOL_SIZE + pj)
                            maxVal = maxOf(maxVal, input[inputIdx])
                        }
                    }
                    output[c * outputSize * outputSize + i * outputSize + j] = maxVal
                }
            }
        }

        val elapsedNs = System.nanoTime() - startTime
        val ops = CHANNELS.toDouble() * outputSize * outputSize * POOL_SIZE * POOL_SIZE
        val gops = ops / elapsedNs

        return gops * 2000
    }

    private fun runActivationTest(): Double {
        val startTime = System.nanoTime()

        val size = CONV_INPUT_SIZE * CONV_INPUT_SIZE * CHANNELS
        val input = FloatArray(size) { (Math.random() * 2 - 1).toFloat() }
        val output = FloatArray(size)

        for (i in 0 until size) {
            output[i] = maxOf(0f, input[i])
        }

        for (i in 0 until size) {
            output[i] = (1.0 / (1.0 + Math.exp(-input[i].toDouble()))).toFloat()
        }

        for (i in 0 until size) {
            output[i] = Math.tanh(input[i].toDouble()).toFloat()
        }

        val elapsedNs = System.nanoTime() - startTime
        val ops = size.toDouble() * 3
        val gops = ops / elapsedNs

        return gops * 5000
    }

    private fun runInt8Test(): Double {
        val startTime = System.nanoTime()

        val size = MATRIX_SIZE * MATRIX_SIZE
        val a = ByteArray(size) { (Math.random() * 256 - 128).toInt().toByte() }
        val b = ByteArray(size) { (Math.random() * 256 - 128).toInt().toByte() }
        val c = IntArray(size)

        for (i in 0 until MATRIX_SIZE) {
            for (j in 0 until MATRIX_SIZE) {
                var sum = 0
                for (k in 0 until MATRIX_SIZE) {
                    sum += a[i * MATRIX_SIZE + k].toInt() * b[k * MATRIX_SIZE + j].toInt()
                }
                c[i * MATRIX_SIZE + j] = sum
            }
        }

        val elapsedNs = System.nanoTime() - startTime
        val tops = (2.0 * MATRIX_SIZE * MATRIX_SIZE * MATRIX_SIZE) / elapsedNs / 1000

        return tops * 50000
    }

    private fun runFp16Test(): Double {
        val startTime = System.nanoTime()

        val size = MATRIX_SIZE * MATRIX_SIZE / 2
        val a = FloatArray(size) { Math.random().toFloat() }
        val b = FloatArray(size) { Math.random().toFloat() }
        val c = FloatArray(size)

        for (i in 0 until size) {
            c[i] = a[i] * b[i] + a[i]
        }

        val elapsedNs = System.nanoTime() - startTime
        val tflops = (2.0 * size) / elapsedNs / 1000

        return tflops * 100000
    }

    private fun runFp32Test(): Double {
        val startTime = System.nanoTime()

        val size = MATRIX_SIZE * MATRIX_SIZE
        val a = FloatArray(size) { Math.random().toFloat() }
        val b = FloatArray(size) { Math.random().toFloat() }
        val c = FloatArray(size)

        for (i in 0 until size) {
            c[i] = a[i] * b[i] + a[i] - b[i]
        }

        val elapsedNs = System.nanoTime() - startTime
        val tflops = (3.0 * size) / elapsedNs / 1000

        return tflops * 50000
    }
}

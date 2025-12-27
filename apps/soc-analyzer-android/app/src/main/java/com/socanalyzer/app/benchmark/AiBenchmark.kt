package com.socanalyzer.app.benchmark

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlin.random.Random

data class AiBenchmarkResult(
    val overallScore: Int,
    val int8Score: Int,
    val fp16Score: Int,
    val fp32Score: Int,
    val inferenceLatencyMs: Double
)

class AiBenchmark {
    
    companion object {
        private const val MATRIX_SIZE = 256
        private const val ITERATIONS = 100
    }
    
    suspend fun runFullBenchmark(
        onProgress: (Float, String) -> Unit
    ): AiBenchmarkResult = withContext(Dispatchers.Default) {
        
        onProgress(0.1f, "初始化AI测试环境...")
        
        onProgress(0.25f, "正在测试INT8量化推理...")
        val int8Score = runInt8Benchmark()
        
        onProgress(0.50f, "正在测试FP16半精度推理...")
        val fp16Score = runFp16Benchmark()
        
        onProgress(0.75f, "正在测试FP32全精度推理...")
        val fp32Score = runFp32Benchmark()
        
        onProgress(0.90f, "测量推理延迟...")
        val inferenceLatency = measureInferenceLatency()
        
        onProgress(0.95f, "计算综合分数...")
        val overallScore = (int8Score * 0.4 + fp16Score * 0.35 + fp32Score * 0.25).toInt()
        
        onProgress(1.0f, "AI测试完成")
        
        AiBenchmarkResult(
            overallScore = overallScore,
            int8Score = int8Score,
            fp16Score = fp16Score,
            fp32Score = fp32Score,
            inferenceLatencyMs = inferenceLatency
        )
    }
    
    private fun runInt8Benchmark(): Int {
        val matrixA = Array(MATRIX_SIZE) { ByteArray(MATRIX_SIZE) { Random.nextInt(-128, 127).toByte() } }
        val matrixB = Array(MATRIX_SIZE) { ByteArray(MATRIX_SIZE) { Random.nextInt(-128, 127).toByte() } }
        val result = Array(MATRIX_SIZE) { IntArray(MATRIX_SIZE) }
        
        val startTime = System.nanoTime()
        
        repeat(ITERATIONS) {
            int8MatMul(matrixA, matrixB, result)
        }
        
        val endTime = System.nanoTime()
        val elapsedMs = (endTime - startTime) / 1_000_000.0
        
        val opsPerSecond = (ITERATIONS.toLong() * MATRIX_SIZE * MATRIX_SIZE * MATRIX_SIZE * 2) / (elapsedMs / 1000.0)
        return (opsPerSecond / 1_000_000_000.0 * 100).toInt()
    }
    
    private fun int8MatMul(a: Array<ByteArray>, b: Array<ByteArray>, result: Array<IntArray>) {
        val n = MATRIX_SIZE
        for (i in 0 until n) {
            for (j in 0 until n) {
                var sum = 0
                for (k in 0 until n) {
                    sum += a[i][k].toInt() * b[k][j].toInt()
                }
                result[i][j] = sum
            }
        }
    }
    
    private fun runFp16Benchmark(): Int {
        val matrixA = Array(MATRIX_SIZE) { FloatArray(MATRIX_SIZE) { Random.nextFloat() * 2 - 1 } }
        val matrixB = Array(MATRIX_SIZE) { FloatArray(MATRIX_SIZE) { Random.nextFloat() * 2 - 1 } }
        val result = Array(MATRIX_SIZE) { FloatArray(MATRIX_SIZE) }
        
        val startTime = System.nanoTime()
        
        repeat(ITERATIONS / 2) {
            fp16MatMul(matrixA, matrixB, result)
        }
        
        val endTime = System.nanoTime()
        val elapsedMs = (endTime - startTime) / 1_000_000.0
        
        val opsPerSecond = ((ITERATIONS / 2).toLong() * MATRIX_SIZE * MATRIX_SIZE * MATRIX_SIZE * 2) / (elapsedMs / 1000.0)
        return (opsPerSecond / 1_000_000_000.0 * 100).toInt()
    }
    
    private fun fp16MatMul(a: Array<FloatArray>, b: Array<FloatArray>, result: Array<FloatArray>) {
        val n = MATRIX_SIZE
        for (i in 0 until n) {
            for (j in 0 until n) {
                var sum = 0f
                for (k in 0 until n) {
                    sum += a[i][k] * b[k][j]
                }
                result[i][j] = sum
            }
        }
    }
    
    private fun runFp32Benchmark(): Int {
        val matrixA = Array(MATRIX_SIZE) { DoubleArray(MATRIX_SIZE) { Random.nextDouble() * 2 - 1 } }
        val matrixB = Array(MATRIX_SIZE) { DoubleArray(MATRIX_SIZE) { Random.nextDouble() * 2 - 1 } }
        val result = Array(MATRIX_SIZE) { DoubleArray(MATRIX_SIZE) }
        
        val startTime = System.nanoTime()
        
        repeat(ITERATIONS / 4) {
            fp32MatMul(matrixA, matrixB, result)
        }
        
        val endTime = System.nanoTime()
        val elapsedMs = (endTime - startTime) / 1_000_000.0
        
        val opsPerSecond = ((ITERATIONS / 4).toLong() * MATRIX_SIZE * MATRIX_SIZE * MATRIX_SIZE * 2) / (elapsedMs / 1000.0)
        return (opsPerSecond / 1_000_000_000.0 * 100).toInt()
    }
    
    private fun fp32MatMul(a: Array<DoubleArray>, b: Array<DoubleArray>, result: Array<DoubleArray>) {
        val n = MATRIX_SIZE
        for (i in 0 until n) {
            for (j in 0 until n) {
                var sum = 0.0
                for (k in 0 until n) {
                    sum += a[i][k] * b[k][j]
                }
                result[i][j] = sum
            }
        }
    }
    
    private fun measureInferenceLatency(): Double {
        val inputSize = 224 * 224 * 3
        val input = FloatArray(inputSize) { Random.nextFloat() }
        
        val layers = listOf(
            Pair(inputSize, 1024),
            Pair(1024, 512),
            Pair(512, 256),
            Pair(256, 128),
            Pair(128, 1000)
        )
        
        var currentInput = input
        
        val startTime = System.nanoTime()
        
        repeat(10) {
            currentInput = input
            for ((inSize, outSize) in layers) {
                currentInput = simulateDenseLayer(currentInput.take(inSize).toFloatArray(), outSize)
            }
        }
        
        val endTime = System.nanoTime()
        val elapsedMs = (endTime - startTime) / 1_000_000.0
        
        return elapsedMs / 10.0
    }
    
    private fun simulateDenseLayer(input: FloatArray, outputSize: Int): FloatArray {
        val output = FloatArray(outputSize)
        val inputSize = input.size
        
        for (o in 0 until outputSize) {
            var sum = 0f
            for (i in 0 until minOf(inputSize, 256)) {
                sum += input[i] * ((o * 31 + i * 17) % 1000 / 1000f - 0.5f)
            }
            output[o] = maxOf(0f, sum)
        }
        
        return output
    }
}

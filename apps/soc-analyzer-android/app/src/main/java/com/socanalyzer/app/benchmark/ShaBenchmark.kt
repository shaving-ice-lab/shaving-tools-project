package com.socanalyzer.app.benchmark

import java.security.MessageDigest
import kotlin.random.Random
import kotlin.system.measureNanoTime

data class ShaBenchmarkResult(
    val sha256Score: Long,
    val sha512Score: Long,
    val sha256Throughput: Double,
    val sha512Throughput: Double,
    val totalScore: Long
)

class ShaBenchmark {

    companion object {
        private const val DATA_SIZE = 1024 * 1024
        private const val ITERATIONS = 50
    }

    fun runBenchmark(onProgress: (Float) -> Unit = {}): ShaBenchmarkResult {
        val testData = ByteArray(DATA_SIZE).apply { Random.nextBytes(this) }
        
        onProgress(0.1f)
        val sha256Result = benchmarkSha256(testData)
        
        onProgress(0.5f)
        val sha512Result = benchmarkSha512(testData)
        
        onProgress(0.9f)
        
        val sha256Throughput = calculateThroughput(sha256Result, DATA_SIZE)
        val sha512Throughput = calculateThroughput(sha512Result, DATA_SIZE)
        
        val sha256Score = calculateScore(sha256Throughput, 500.0)
        val sha512Score = calculateScore(sha512Throughput, 400.0)
        val totalScore = (sha256Score * 0.6 + sha512Score * 0.4).toLong()
        
        onProgress(1.0f)
        
        return ShaBenchmarkResult(
            sha256Score = sha256Score,
            sha512Score = sha512Score,
            sha256Throughput = sha256Throughput,
            sha512Throughput = sha512Throughput,
            totalScore = totalScore
        )
    }

    private fun benchmarkSha256(data: ByteArray): Long {
        val digest = MessageDigest.getInstance("SHA-256")
        var totalTime = 0L
        
        repeat(ITERATIONS) {
            val time = measureNanoTime {
                digest.reset()
                digest.update(data)
                digest.digest()
            }
            totalTime += time
        }
        
        return totalTime / ITERATIONS
    }

    private fun benchmarkSha512(data: ByteArray): Long {
        val digest = MessageDigest.getInstance("SHA-512")
        var totalTime = 0L
        
        repeat(ITERATIONS) {
            val time = measureNanoTime {
                digest.reset()
                digest.update(data)
                digest.digest()
            }
            totalTime += time
        }
        
        return totalTime / ITERATIONS
    }

    private fun calculateThroughput(avgTimeNanos: Long, dataSize: Int): Double {
        val timeSeconds = avgTimeNanos / 1_000_000_000.0
        val dataMB = dataSize / (1024.0 * 1024.0)
        return dataMB / timeSeconds
    }

    private fun calculateScore(throughput: Double, baseline: Double): Long {
        return ((throughput / baseline) * 1000).toLong()
    }

    fun runSha256Only(data: ByteArray): ByteArray {
        val digest = MessageDigest.getInstance("SHA-256")
        return digest.digest(data)
    }

    fun runSha512Only(data: ByteArray): ByteArray {
        val digest = MessageDigest.getInstance("SHA-512")
        return digest.digest(data)
    }

    fun runHmacSha256(data: ByteArray, key: ByteArray): ByteArray {
        val hmac = javax.crypto.Mac.getInstance("HmacSHA256")
        val secretKey = javax.crypto.spec.SecretKeySpec(key, "HmacSHA256")
        hmac.init(secretKey)
        return hmac.doFinal(data)
    }
}

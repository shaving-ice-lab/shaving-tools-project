package com.socanalyzer.app.benchmark

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.withContext
import kotlin.math.PI
import kotlin.math.sin
import kotlin.math.cos
import kotlin.math.sqrt
import kotlin.math.ln
import kotlin.random.Random

data class CpuBenchmarkResult(
    val singleCoreScore: Int,
    val multiCoreScore: Int,
    val integerScore: Int,
    val floatScore: Int,
    val memoryBandwidth: Long,
    val memoryLatency: Double,
    val cryptoScore: Int,
    val compressionScore: Int
)

class CpuBenchmark {
    
    companion object {
        private const val DHRYSTONE_LOOPS = 10_000_000
        private const val LINPACK_SIZE = 200
        private const val MEMORY_TEST_SIZE = 64 * 1024 * 1024 // 64MB
        private const val CRYPTO_ITERATIONS = 100_000
    }
    
    suspend fun runFullBenchmark(
        onProgress: (Float, String) -> Unit
    ): CpuBenchmarkResult = withContext(Dispatchers.Default) {
        
        onProgress(0.05f, "正在测试单核整数性能...")
        val integerScore = runDhrystoneBenchmark()
        
        onProgress(0.15f, "正在测试单核浮点性能...")
        val floatScore = runLinpackBenchmark()
        
        onProgress(0.25f, "计算单核综合分数...")
        val singleCoreScore = ((integerScore + floatScore) / 2)
        
        onProgress(0.35f, "正在测试多核整数性能...")
        val multiIntScore = runMultiCoreDhrystone()
        
        onProgress(0.50f, "正在测试多核浮点性能...")
        val multiFloatScore = runMultiCoreLinpack()
        
        onProgress(0.60f, "计算多核综合分数...")
        val multiCoreScore = ((multiIntScore + multiFloatScore) / 2)
        
        onProgress(0.70f, "正在测试内存带宽...")
        val memoryBandwidth = runMemoryBandwidthTest()
        
        onProgress(0.80f, "正在测试内存延迟...")
        val memoryLatency = runMemoryLatencyTest()
        
        onProgress(0.88f, "正在测试加密性能...")
        val cryptoScore = runCryptoBenchmark()
        
        onProgress(0.95f, "正在测试压缩性能...")
        val compressionScore = runCompressionBenchmark()
        
        onProgress(1.0f, "测试完成")
        
        CpuBenchmarkResult(
            singleCoreScore = singleCoreScore,
            multiCoreScore = multiCoreScore,
            integerScore = integerScore,
            floatScore = floatScore,
            memoryBandwidth = memoryBandwidth,
            memoryLatency = memoryLatency,
            cryptoScore = cryptoScore,
            compressionScore = compressionScore
        )
    }
    
    private fun runDhrystoneBenchmark(): Int {
        var intGlob = 0
        var boolGlob = false
        var char1Glob = 'A'
        var char2Glob = 'B'
        var array1Glob = IntArray(50)
        var array2Glob = Array(50) { IntArray(50) }
        var ptrGlob = DhrystoneRecord()
        var nextPtrGlob = DhrystoneRecord()
        
        ptrGlob.ptrComp = nextPtrGlob
        ptrGlob.discr = 0
        ptrGlob.enumComp = 2
        ptrGlob.intComp = 40
        ptrGlob.stringComp = "DHRYSTONE PROGRAM, SOME STRING"
        
        val startTime = System.nanoTime()
        
        repeat(DHRYSTONE_LOOPS) { i ->
            proc5()
            proc4()
            
            val intLoc1 = 2
            var intLoc2 = 3
            var intLoc3: Int
            var charLoc: Char
            var enumLoc: Int
            
            intLoc2 = intLoc2 * intLoc1
            intLoc1.let { intLoc3 = it + intLoc2 }
            intLoc2 = intLoc3 + intLoc1
            
            intGlob = intLoc2
            charLoc = 'A'
            boolGlob = charLoc == 'A'
            
            array1Glob[intLoc1] = intLoc1
            array1Glob[intLoc1 + 1] = array1Glob[intLoc1]
            array2Glob[intLoc1][intLoc1 - 1] = intLoc1
            
            if (boolGlob) {
                intGlob = intLoc3
            }
        }
        
        val endTime = System.nanoTime()
        val elapsedSeconds = (endTime - startTime) / 1_000_000_000.0
        val dhrystonesPerSecond = DHRYSTONE_LOOPS / elapsedSeconds
        
        return (dhrystonesPerSecond / 1757.0).toInt()
    }
    
    private fun proc4() {
        var boolLoc = 'A' == 'A'
        boolLoc = boolLoc || true
    }
    
    private fun proc5() {
        var charLoc = 'A'
        var boolLoc = false
    }
    
    private fun runLinpackBenchmark(): Int {
        val n = LINPACK_SIZE
        val a = Array(n) { DoubleArray(n) }
        val b = DoubleArray(n)
        val x = DoubleArray(n)
        val ipvt = IntArray(n)
        
        val random = Random(42)
        for (i in 0 until n) {
            for (j in 0 until n) {
                a[i][j] = random.nextDouble() * 2.0 - 1.0
            }
            b[i] = random.nextDouble() * 2.0 - 1.0
        }
        
        val startTime = System.nanoTime()
        
        repeat(10) {
            val aCopy = Array(n) { i -> a[i].copyOf() }
            val bCopy = b.copyOf()
            
            luDecomposition(aCopy, ipvt, n)
            luSolve(aCopy, bCopy, ipvt, n, x)
        }
        
        val endTime = System.nanoTime()
        val elapsedSeconds = (endTime - startTime) / 1_000_000_000.0
        
        val ops = 10.0 * (2.0 / 3.0 * n * n * n + 2.0 * n * n)
        val mflops = ops / elapsedSeconds / 1_000_000.0
        
        return (mflops * 10).toInt()
    }
    
    private fun luDecomposition(a: Array<DoubleArray>, ipvt: IntArray, n: Int) {
        for (k in 0 until n - 1) {
            var kp1 = k + 1
            var m = k
            
            for (i in kp1 until n) {
                if (kotlin.math.abs(a[i][k]) > kotlin.math.abs(a[m][k])) {
                    m = i
                }
            }
            
            ipvt[k] = m
            if (m != k) {
                val temp = a[m]
                a[m] = a[k]
                a[k] = temp
            }
            
            if (a[k][k] != 0.0) {
                for (i in kp1 until n) {
                    a[i][k] = a[i][k] / a[k][k]
                }
                
                for (j in kp1 until n) {
                    for (i in kp1 until n) {
                        a[i][j] = a[i][j] - a[i][k] * a[k][j]
                    }
                }
            }
        }
        ipvt[n - 1] = n - 1
    }
    
    private fun luSolve(a: Array<DoubleArray>, b: DoubleArray, ipvt: IntArray, n: Int, x: DoubleArray) {
        for (i in 0 until n) {
            x[i] = b[i]
        }
        
        for (k in 0 until n - 1) {
            val m = ipvt[k]
            val t = x[m]
            x[m] = x[k]
            x[k] = t
            
            for (i in k + 1 until n) {
                x[i] = x[i] - a[i][k] * x[k]
            }
        }
        
        for (k in n - 1 downTo 0) {
            x[k] = x[k] / a[k][k]
            for (i in 0 until k) {
                x[i] = x[i] - a[i][k] * x[k]
            }
        }
    }
    
    private suspend fun runMultiCoreDhrystone(): Int = withContext(Dispatchers.Default) {
        val numCores = Runtime.getRuntime().availableProcessors()
        val jobs = (1..numCores).map {
            async {
                runDhrystoneBenchmark()
            }
        }
        val scores = jobs.awaitAll()
        scores.sum()
    }
    
    private suspend fun runMultiCoreLinpack(): Int = withContext(Dispatchers.Default) {
        val numCores = Runtime.getRuntime().availableProcessors()
        val jobs = (1..numCores).map {
            async {
                runLinpackBenchmark()
            }
        }
        val scores = jobs.awaitAll()
        scores.sum()
    }
    
    private fun runMemoryBandwidthTest(): Long {
        val arraySize = MEMORY_TEST_SIZE / 8
        val array = LongArray(arraySize)
        
        for (i in 0 until arraySize) {
            array[i] = i.toLong()
        }
        
        val startTime = System.nanoTime()
        
        var sum = 0L
        repeat(5) {
            for (i in 0 until arraySize) {
                sum += array[i]
            }
        }
        
        val endTime = System.nanoTime()
        val elapsedSeconds = (endTime - startTime) / 1_000_000_000.0
        
        val bytesProcessed = 5L * arraySize * 8
        val bandwidthMBps = (bytesProcessed / elapsedSeconds / 1_000_000).toLong()
        
        return bandwidthMBps
    }
    
    private fun runMemoryLatencyTest(): Double {
        val arraySize = 16 * 1024 * 1024
        val array = IntArray(arraySize)
        
        val random = Random(42)
        for (i in 0 until arraySize) {
            array[i] = random.nextInt(arraySize)
        }
        
        val startTime = System.nanoTime()
        
        var index = 0
        repeat(10_000_000) {
            index = array[index % arraySize]
        }
        
        val endTime = System.nanoTime()
        val elapsedNs = (endTime - startTime).toDouble()
        
        return elapsedNs / 10_000_000.0
    }
    
    private fun runCryptoBenchmark(): Int {
        val data = ByteArray(1024) { it.toByte() }
        val key = ByteArray(32) { it.toByte() }
        
        val startTime = System.nanoTime()
        
        repeat(CRYPTO_ITERATIONS) {
            simulateAesEncrypt(data, key)
            simulateSha256(data)
        }
        
        val endTime = System.nanoTime()
        val elapsedSeconds = (endTime - startTime) / 1_000_000_000.0
        
        val opsPerSecond = CRYPTO_ITERATIONS * 2 / elapsedSeconds
        return (opsPerSecond / 100).toInt()
    }
    
    private fun simulateAesEncrypt(data: ByteArray, key: ByteArray): ByteArray {
        val result = ByteArray(data.size)
        for (i in data.indices) {
            result[i] = (data[i].toInt() xor key[i % key.size].toInt()).toByte()
            result[i] = ((result[i].toInt() + key[(i + 1) % key.size].toInt()) and 0xFF).toByte()
            result[i] = (result[i].toInt() xor (key[(i + 2) % key.size].toInt() shl 4)).toByte()
        }
        return result
    }
    
    private fun simulateSha256(data: ByteArray): ByteArray {
        val hash = ByteArray(32)
        var h0 = 0x6a09e667
        var h1 = 0xbb67ae85L
        var h2 = 0x3c6ef372
        var h3 = 0xa54ff53aL
        
        for (i in data.indices) {
            h0 = h0 xor (data[i].toInt() * 31)
            h1 = (h1 + data[i].toLong()) and 0xFFFFFFFFL
            h2 = (h2 * 17) xor data[i].toInt()
            h3 = (h3 xor (data[i].toLong() shl 8)) and 0xFFFFFFFFL
        }
        
        for (i in 0 until 8) {
            hash[i] = ((h0 shr (i * 4)) and 0xFF).toByte()
            hash[i + 8] = ((h1 shr (i * 4)) and 0xFF).toByte()
            hash[i + 16] = ((h2 shr (i * 4)) and 0xFF).toByte()
            hash[i + 24] = ((h3 shr (i * 4)) and 0xFF).toByte()
        }
        
        return hash
    }
    
    private fun runCompressionBenchmark(): Int {
        val data = ByteArray(65536)
        val random = Random(42)
        for (i in data.indices) {
            data[i] = if (random.nextFloat() < 0.3f) {
                random.nextInt(256).toByte()
            } else {
                (i % 256).toByte()
            }
        }
        
        val startTime = System.nanoTime()
        
        repeat(1000) {
            simulateLz4Compress(data)
        }
        
        val endTime = System.nanoTime()
        val elapsedSeconds = (endTime - startTime) / 1_000_000_000.0
        
        val throughputMBps = (1000.0 * data.size / elapsedSeconds / 1_000_000.0)
        return (throughputMBps * 10).toInt()
    }
    
    private fun simulateLz4Compress(data: ByteArray): ByteArray {
        val result = mutableListOf<Byte>()
        var i = 0
        
        while (i < data.size) {
            var matchLen = 0
            var matchOffset = 0
            
            for (j in maxOf(0, i - 255) until i) {
                var len = 0
                while (i + len < data.size && data[j + len] == data[i + len] && len < 15) {
                    len++
                }
                if (len > matchLen) {
                    matchLen = len
                    matchOffset = i - j
                }
            }
            
            if (matchLen >= 4) {
                result.add(((matchLen - 4) or ((matchOffset and 0xF0) shr 4)).toByte())
                result.add((matchOffset and 0xFF).toByte())
                i += matchLen
            } else {
                result.add(data[i])
                i++
            }
        }
        
        return result.toByteArray()
    }
}

private data class DhrystoneRecord(
    var ptrComp: DhrystoneRecord? = null,
    var discr: Int = 0,
    var enumComp: Int = 0,
    var intComp: Int = 0,
    var stringComp: String = ""
)

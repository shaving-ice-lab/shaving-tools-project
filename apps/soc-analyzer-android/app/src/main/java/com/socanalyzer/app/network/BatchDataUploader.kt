package com.socanalyzer.app.network

import android.content.Context
import kotlinx.coroutines.*
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.io.File
import java.util.concurrent.ConcurrentLinkedQueue

@Serializable
data class BatchData(
    val id: String,
    val type: String,
    val timestamp: Long,
    val data: String,
    val retryCount: Int = 0
)

@Serializable
data class BatchUploadResult(
    val success: Boolean,
    val uploadedCount: Int,
    val failedCount: Int,
    val pendingCount: Int
)

class BatchDataUploader(
    private val context: Context,
    private val webSocketClient: ReconnectableWebSocketClient,
    private val maxBatchSize: Int = 50,
    private val uploadIntervalMs: Long = 5000L
) {
    companion object {
        private const val TAG = "BatchDataUploader"
        private const val PENDING_DATA_FILE = "pending_uploads.json"
        private const val MAX_RETRY_COUNT = 3
    }

    private val pendingQueue = ConcurrentLinkedQueue<BatchData>()
    private val scope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private val mutex = Mutex()
    private var uploadJob: Job? = null
    private var isRunning = false

    private val json = Json { ignoreUnknownKeys = true }

    fun start() {
        if (isRunning) return
        isRunning = true
        loadPendingData()
        startUploadLoop()
    }

    fun stop() {
        isRunning = false
        uploadJob?.cancel()
        savePendingData()
    }

    fun addData(type: String, data: String) {
        val batchData = BatchData(
            id = "${System.currentTimeMillis()}_${(Math.random() * 10000).toInt()}",
            type = type,
            timestamp = System.currentTimeMillis(),
            data = data
        )
        pendingQueue.offer(batchData)
    }

    fun addBenchmarkResult(resultJson: String) {
        addData("benchmark_result", resultJson)
    }

    fun addGamePerformanceReport(reportJson: String) {
        addData("game_performance_report", reportJson)
    }

    fun addStressTestResult(resultJson: String) {
        addData("stress_test_result", resultJson)
    }

    private fun startUploadLoop() {
        uploadJob = scope.launch {
            while (isRunning) {
                try {
                    if (webSocketClient.isConnected() && pendingQueue.isNotEmpty()) {
                        uploadBatch()
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
                delay(uploadIntervalMs)
            }
        }
    }

    private suspend fun uploadBatch() = mutex.withLock {
        val batch = mutableListOf<BatchData>()
        
        repeat(maxBatchSize.coerceAtMost(pendingQueue.size)) {
            pendingQueue.poll()?.let { batch.add(it) }
        }

        if (batch.isEmpty()) return@withLock

        val batchMessage = json.encodeToString(mapOf(
            "type" to "batch_upload",
            "timestamp" to System.currentTimeMillis(),
            "count" to batch.size,
            "items" to batch.map { mapOf(
                "id" to it.id,
                "type" to it.type,
                "timestamp" to it.timestamp,
                "data" to it.data
            )}
        ))

        val success = webSocketClient.send(batchMessage)
        
        if (!success) {
            batch.forEach { item ->
                if (item.retryCount < MAX_RETRY_COUNT) {
                    pendingQueue.offer(item.copy(retryCount = item.retryCount + 1))
                }
            }
        }
    }

    suspend fun forceUploadAll(): BatchUploadResult {
        var uploadedCount = 0
        var failedCount = 0

        mutex.withLock {
            if (!webSocketClient.isConnected()) {
                return BatchUploadResult(
                    success = false,
                    uploadedCount = 0,
                    failedCount = 0,
                    pendingCount = pendingQueue.size
                )
            }

            while (pendingQueue.isNotEmpty()) {
                val batch = mutableListOf<BatchData>()
                repeat(maxBatchSize.coerceAtMost(pendingQueue.size)) {
                    pendingQueue.poll()?.let { batch.add(it) }
                }

                val batchMessage = json.encodeToString(mapOf(
                    "type" to "batch_upload",
                    "timestamp" to System.currentTimeMillis(),
                    "count" to batch.size,
                    "items" to batch.map { mapOf(
                        "id" to it.id,
                        "type" to it.type,
                        "timestamp" to it.timestamp,
                        "data" to it.data
                    )}
                ))

                val success = webSocketClient.send(batchMessage)
                if (success) {
                    uploadedCount += batch.size
                } else {
                    failedCount += batch.size
                    batch.forEach { item ->
                        if (item.retryCount < MAX_RETRY_COUNT) {
                            pendingQueue.offer(item.copy(retryCount = item.retryCount + 1))
                        }
                    }
                    break
                }

                delay(100)
            }
        }

        return BatchUploadResult(
            success = failedCount == 0,
            uploadedCount = uploadedCount,
            failedCount = failedCount,
            pendingCount = pendingQueue.size
        )
    }

    private fun savePendingData() {
        try {
            val file = File(context.filesDir, PENDING_DATA_FILE)
            val pendingList = pendingQueue.toList()
            if (pendingList.isNotEmpty()) {
                file.writeText(json.encodeToString(pendingList))
            } else {
                file.delete()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun loadPendingData() {
        try {
            val file = File(context.filesDir, PENDING_DATA_FILE)
            if (file.exists()) {
                val pendingList = json.decodeFromString<List<BatchData>>(file.readText())
                pendingList.forEach { pendingQueue.offer(it) }
                file.delete()
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun getPendingCount(): Int = pendingQueue.size

    fun clearPending() {
        pendingQueue.clear()
        File(context.filesDir, PENDING_DATA_FILE).delete()
    }
}

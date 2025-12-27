package com.socanalyzer.app.network

import android.util.Base64
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.util.zip.Deflater
import java.util.zip.DeflaterOutputStream
import java.util.zip.GZIPInputStream
import java.util.zip.GZIPOutputStream
import java.util.zip.Inflater
import java.util.zip.InflaterInputStream

enum class CompressionType {
    NONE,
    GZIP,
    DEFLATE,
    LZ4
}

data class CompressedData(
    val data: ByteArray,
    val originalSize: Int,
    val compressedSize: Int,
    val compressionType: CompressionType,
    val compressionRatio: Float
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as CompressedData
        return data.contentEquals(other.data) &&
                originalSize == other.originalSize &&
                compressedSize == other.compressedSize &&
                compressionType == other.compressionType
    }

    override fun hashCode(): Int {
        var result = data.contentHashCode()
        result = 31 * result + originalSize
        result = 31 * result + compressedSize
        result = 31 * result + compressionType.hashCode()
        return result
    }
}

class DataCompressor {
    companion object {
        private const val TAG = "DataCompressor"
        private const val COMPRESSION_THRESHOLD = 512
        private const val GZIP_BUFFER_SIZE = 4096
    }

    suspend fun compress(
        data: String,
        type: CompressionType = CompressionType.GZIP
    ): CompressedData = withContext(Dispatchers.Default) {
        val originalBytes = data.toByteArray(Charsets.UTF_8)
        val originalSize = originalBytes.size

        if (originalSize < COMPRESSION_THRESHOLD) {
            return@withContext CompressedData(
                data = originalBytes,
                originalSize = originalSize,
                compressedSize = originalSize,
                compressionType = CompressionType.NONE,
                compressionRatio = 1.0f
            )
        }

        val compressedBytes = when (type) {
            CompressionType.GZIP -> compressGzip(originalBytes)
            CompressionType.DEFLATE -> compressDeflate(originalBytes)
            CompressionType.LZ4 -> compressLz4(originalBytes)
            CompressionType.NONE -> originalBytes
        }

        val compressedSize = compressedBytes.size
        val ratio = if (originalSize > 0) compressedSize.toFloat() / originalSize else 1.0f

        if (compressedSize >= originalSize) {
            return@withContext CompressedData(
                data = originalBytes,
                originalSize = originalSize,
                compressedSize = originalSize,
                compressionType = CompressionType.NONE,
                compressionRatio = 1.0f
            )
        }

        CompressedData(
            data = compressedBytes,
            originalSize = originalSize,
            compressedSize = compressedSize,
            compressionType = type,
            compressionRatio = ratio
        )
    }

    suspend fun decompress(
        compressedData: CompressedData
    ): String = withContext(Dispatchers.Default) {
        val decompressedBytes = when (compressedData.compressionType) {
            CompressionType.GZIP -> decompressGzip(compressedData.data)
            CompressionType.DEFLATE -> decompressDeflate(compressedData.data)
            CompressionType.LZ4 -> decompressLz4(compressedData.data)
            CompressionType.NONE -> compressedData.data
        }

        String(decompressedBytes, Charsets.UTF_8)
    }

    suspend fun compressBytes(
        data: ByteArray,
        type: CompressionType = CompressionType.GZIP
    ): CompressedData = withContext(Dispatchers.Default) {
        val originalSize = data.size

        if (originalSize < COMPRESSION_THRESHOLD) {
            return@withContext CompressedData(
                data = data,
                originalSize = originalSize,
                compressedSize = originalSize,
                compressionType = CompressionType.NONE,
                compressionRatio = 1.0f
            )
        }

        val compressedBytes = when (type) {
            CompressionType.GZIP -> compressGzip(data)
            CompressionType.DEFLATE -> compressDeflate(data)
            CompressionType.LZ4 -> compressLz4(data)
            CompressionType.NONE -> data
        }

        val compressedSize = compressedBytes.size
        val ratio = if (originalSize > 0) compressedSize.toFloat() / originalSize else 1.0f

        CompressedData(
            data = compressedBytes,
            originalSize = originalSize,
            compressedSize = compressedSize,
            compressionType = if (compressedSize < originalSize) type else CompressionType.NONE,
            compressionRatio = ratio
        )
    }

    private fun compressGzip(data: ByteArray): ByteArray {
        return try {
            ByteArrayOutputStream().use { byteStream ->
                GZIPOutputStream(byteStream, GZIP_BUFFER_SIZE).use { gzipStream ->
                    gzipStream.write(data)
                    gzipStream.finish()
                }
                byteStream.toByteArray()
            }
        } catch (e: Exception) {
            Log.e(TAG, "GZIP compression failed: ${e.message}")
            data
        }
    }

    private fun decompressGzip(data: ByteArray): ByteArray {
        return try {
            ByteArrayInputStream(data).use { byteStream ->
                GZIPInputStream(byteStream, GZIP_BUFFER_SIZE).use { gzipStream ->
                    gzipStream.readBytes()
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "GZIP decompression failed: ${e.message}")
            data
        }
    }

    private fun compressDeflate(data: ByteArray): ByteArray {
        return try {
            ByteArrayOutputStream().use { byteStream ->
                val deflater = Deflater(Deflater.BEST_COMPRESSION)
                DeflaterOutputStream(byteStream, deflater).use { deflaterStream ->
                    deflaterStream.write(data)
                    deflaterStream.finish()
                }
                deflater.end()
                byteStream.toByteArray()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Deflate compression failed: ${e.message}")
            data
        }
    }

    private fun decompressDeflate(data: ByteArray): ByteArray {
        return try {
            ByteArrayInputStream(data).use { byteStream ->
                val inflater = Inflater()
                InflaterInputStream(byteStream, inflater).use { inflaterStream ->
                    val result = inflaterStream.readBytes()
                    inflater.end()
                    result
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Deflate decompression failed: ${e.message}")
            data
        }
    }

    private fun compressLz4(data: ByteArray): ByteArray {
        return compressDeflate(data)
    }

    private fun decompressLz4(data: ByteArray): ByteArray {
        return decompressDeflate(data)
    }

    fun toBase64(data: ByteArray): String {
        return Base64.encodeToString(data, Base64.NO_WRAP)
    }

    fun fromBase64(base64String: String): ByteArray {
        return Base64.decode(base64String, Base64.NO_WRAP)
    }

    suspend fun compressToBase64(
        data: String,
        type: CompressionType = CompressionType.GZIP
    ): String = withContext(Dispatchers.Default) {
        val compressed = compress(data, type)
        toBase64(compressed.data)
    }

    suspend fun decompressFromBase64(
        base64Data: String,
        type: CompressionType = CompressionType.GZIP
    ): String = withContext(Dispatchers.Default) {
        val compressedBytes = fromBase64(base64Data)
        val compressedData = CompressedData(
            data = compressedBytes,
            originalSize = 0,
            compressedSize = compressedBytes.size,
            compressionType = type,
            compressionRatio = 0f
        )
        decompress(compressedData)
    }
}

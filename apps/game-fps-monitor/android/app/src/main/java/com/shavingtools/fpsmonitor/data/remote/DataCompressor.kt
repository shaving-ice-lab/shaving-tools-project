package com.shavingtools.fpsmonitor.data.remote

import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.util.zip.GZIPInputStream
import java.util.zip.GZIPOutputStream
import javax.inject.Inject
import javax.inject.Singleton

/**
 * 数据压缩器 - 用于压缩传输数据
 */
@Singleton
class DataCompressor @Inject constructor() {
    
    companion object {
        private const val COMPRESSION_THRESHOLD = 1024 // 1KB以上才压缩
    }
    
    /**
     * 压缩字符串数据
     */
    fun compress(data: String): ByteArray {
        if (data.length < COMPRESSION_THRESHOLD) {
            return data.toByteArray(Charsets.UTF_8)
        }
        
        val byteArrayOutputStream = ByteArrayOutputStream()
        GZIPOutputStream(byteArrayOutputStream).use { gzip ->
            gzip.write(data.toByteArray(Charsets.UTF_8))
        }
        return byteArrayOutputStream.toByteArray()
    }
    
    /**
     * 解压缩数据
     */
    fun decompress(compressedData: ByteArray): String {
        return try {
            val byteArrayInputStream = ByteArrayInputStream(compressedData)
            GZIPInputStream(byteArrayInputStream).use { gzip ->
                gzip.bufferedReader(Charsets.UTF_8).readText()
            }
        } catch (e: Exception) {
            // 如果解压失败，可能数据未压缩
            String(compressedData, Charsets.UTF_8)
        }
    }
    
    /**
     * 压缩字节数组
     */
    fun compressBytes(data: ByteArray): ByteArray {
        if (data.size < COMPRESSION_THRESHOLD) {
            return data
        }
        
        val byteArrayOutputStream = ByteArrayOutputStream()
        GZIPOutputStream(byteArrayOutputStream).use { gzip ->
            gzip.write(data)
        }
        return byteArrayOutputStream.toByteArray()
    }
    
    /**
     * 解压缩字节数组
     */
    fun decompressBytes(compressedData: ByteArray): ByteArray {
        return try {
            val byteArrayInputStream = ByteArrayInputStream(compressedData)
            GZIPInputStream(byteArrayInputStream).use { gzip ->
                gzip.readBytes()
            }
        } catch (e: Exception) {
            compressedData
        }
    }
    
    /**
     * 检查数据是否已压缩 (GZIP魔数)
     */
    fun isCompressed(data: ByteArray): Boolean {
        return data.size >= 2 && 
               data[0] == 0x1f.toByte() && 
               data[1] == 0x8b.toByte()
    }
    
    /**
     * 获取压缩比
     */
    fun getCompressionRatio(original: ByteArray, compressed: ByteArray): Float {
        if (original.isEmpty()) return 1f
        return compressed.size.toFloat() / original.size.toFloat()
    }
    
    /**
     * 智能压缩 - 仅当压缩有效时返回压缩数据
     */
    fun smartCompress(data: String): CompressedData {
        val originalBytes = data.toByteArray(Charsets.UTF_8)
        
        if (originalBytes.size < COMPRESSION_THRESHOLD) {
            return CompressedData(
                data = originalBytes,
                isCompressed = false,
                originalSize = originalBytes.size,
                compressedSize = originalBytes.size
            )
        }
        
        val compressedBytes = compress(data)
        
        // 如果压缩后更大，则使用原始数据
        return if (compressedBytes.size < originalBytes.size) {
            CompressedData(
                data = compressedBytes,
                isCompressed = true,
                originalSize = originalBytes.size,
                compressedSize = compressedBytes.size
            )
        } else {
            CompressedData(
                data = originalBytes,
                isCompressed = false,
                originalSize = originalBytes.size,
                compressedSize = originalBytes.size
            )
        }
    }
    
    data class CompressedData(
        val data: ByteArray,
        val isCompressed: Boolean,
        val originalSize: Int,
        val compressedSize: Int
    ) {
        val compressionRatio: Float
            get() = if (originalSize > 0) compressedSize.toFloat() / originalSize else 1f
        
        val savedBytes: Int
            get() = originalSize - compressedSize
        
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false
            other as CompressedData
            if (!data.contentEquals(other.data)) return false
            if (isCompressed != other.isCompressed) return false
            return true
        }
        
        override fun hashCode(): Int {
            var result = data.contentHashCode()
            result = 31 * result + isCompressed.hashCode()
            return result
        }
    }
}

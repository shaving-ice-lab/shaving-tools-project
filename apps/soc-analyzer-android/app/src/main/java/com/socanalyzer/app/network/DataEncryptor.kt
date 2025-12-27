package com.socanalyzer.app.network

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import android.util.Base64
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.KeyGenerator
import javax.crypto.SecretKey
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

enum class EncryptionType {
    NONE,
    AES_128_GCM,
    AES_256_GCM,
    AES_256_CBC
}

data class EncryptedData(
    val cipherText: ByteArray,
    val iv: ByteArray,
    val tag: ByteArray?,
    val encryptionType: EncryptionType
) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as EncryptedData
        return cipherText.contentEquals(other.cipherText) &&
                iv.contentEquals(other.iv) &&
                (tag?.contentEquals(other.tag ?: ByteArray(0)) ?: (other.tag == null)) &&
                encryptionType == other.encryptionType
    }

    override fun hashCode(): Int {
        var result = cipherText.contentHashCode()
        result = 31 * result + iv.contentHashCode()
        result = 31 * result + (tag?.contentHashCode() ?: 0)
        result = 31 * result + encryptionType.hashCode()
        return result
    }

    fun toBase64String(): String {
        val ivBase64 = Base64.encodeToString(iv, Base64.NO_WRAP)
        val cipherBase64 = Base64.encodeToString(cipherText, Base64.NO_WRAP)
        val tagBase64 = tag?.let { Base64.encodeToString(it, Base64.NO_WRAP) } ?: ""
        return "$ivBase64:$cipherBase64:$tagBase64:${encryptionType.name}"
    }

    companion object {
        fun fromBase64String(encoded: String): EncryptedData {
            val parts = encoded.split(":")
            require(parts.size >= 4) { "Invalid encrypted data format" }
            return EncryptedData(
                iv = Base64.decode(parts[0], Base64.NO_WRAP),
                cipherText = Base64.decode(parts[1], Base64.NO_WRAP),
                tag = if (parts[2].isNotEmpty()) Base64.decode(parts[2], Base64.NO_WRAP) else null,
                encryptionType = EncryptionType.valueOf(parts[3])
            )
        }
    }
}

class DataEncryptor {
    companion object {
        private const val TAG = "DataEncryptor"
        private const val ANDROID_KEYSTORE = "AndroidKeyStore"
        private const val KEY_ALIAS = "SocAnalyzerKey"
        private const val GCM_IV_LENGTH = 12
        private const val GCM_TAG_LENGTH = 128
        private const val CBC_IV_LENGTH = 16
        private const val AES_KEY_SIZE_128 = 128
        private const val AES_KEY_SIZE_256 = 256
    }

    private val secureRandom = SecureRandom()
    private var sessionKey: SecretKey? = null

    fun generateSessionKey(keySize: Int = AES_KEY_SIZE_256): SecretKey {
        val keyGenerator = KeyGenerator.getInstance("AES")
        keyGenerator.init(keySize, secureRandom)
        sessionKey = keyGenerator.generateKey()
        return sessionKey!!
    }

    fun setSessionKey(keyBytes: ByteArray) {
        sessionKey = SecretKeySpec(keyBytes, "AES")
    }

    fun deriveKeyFromPassword(password: String, salt: ByteArray? = null): Pair<SecretKey, ByteArray> {
        val actualSalt = salt ?: ByteArray(16).also { secureRandom.nextBytes(it) }

        val md = MessageDigest.getInstance("SHA-256")
        md.update(actualSalt)
        val keyBytes = md.digest(password.toByteArray(Charsets.UTF_8))

        val key = SecretKeySpec(keyBytes, "AES")
        sessionKey = key
        return Pair(key, actualSalt)
    }

    suspend fun encrypt(
        plainText: String,
        type: EncryptionType = EncryptionType.AES_256_GCM,
        key: SecretKey? = null
    ): EncryptedData = withContext(Dispatchers.Default) {
        val encryptionKey = key ?: sessionKey ?: generateSessionKey()
        val plainBytes = plainText.toByteArray(Charsets.UTF_8)

        when (type) {
            EncryptionType.AES_256_GCM, EncryptionType.AES_128_GCM -> encryptAesGcm(plainBytes, encryptionKey, type)
            EncryptionType.AES_256_CBC -> encryptAesCbc(plainBytes, encryptionKey)
            EncryptionType.NONE -> EncryptedData(
                cipherText = plainBytes,
                iv = ByteArray(0),
                tag = null,
                encryptionType = EncryptionType.NONE
            )
        }
    }

    suspend fun decrypt(
        encryptedData: EncryptedData,
        key: SecretKey? = null
    ): String = withContext(Dispatchers.Default) {
        val decryptionKey = key ?: sessionKey
            ?: throw IllegalStateException("No decryption key available")

        val decryptedBytes = when (encryptedData.encryptionType) {
            EncryptionType.AES_256_GCM, EncryptionType.AES_128_GCM -> 
                decryptAesGcm(encryptedData, decryptionKey)
            EncryptionType.AES_256_CBC -> 
                decryptAesCbc(encryptedData, decryptionKey)
            EncryptionType.NONE -> 
                encryptedData.cipherText
        }

        String(decryptedBytes, Charsets.UTF_8)
    }

    private fun encryptAesGcm(
        plainBytes: ByteArray,
        key: SecretKey,
        type: EncryptionType
    ): EncryptedData {
        return try {
            val iv = ByteArray(GCM_IV_LENGTH)
            secureRandom.nextBytes(iv)

            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            val gcmSpec = GCMParameterSpec(GCM_TAG_LENGTH, iv)
            cipher.init(Cipher.ENCRYPT_MODE, key, gcmSpec)

            val cipherText = cipher.doFinal(plainBytes)

            EncryptedData(
                cipherText = cipherText,
                iv = iv,
                tag = null,
                encryptionType = type
            )
        } catch (e: Exception) {
            Log.e(TAG, "AES-GCM encryption failed: ${e.message}")
            throw e
        }
    }

    private fun decryptAesGcm(
        encryptedData: EncryptedData,
        key: SecretKey
    ): ByteArray {
        return try {
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            val gcmSpec = GCMParameterSpec(GCM_TAG_LENGTH, encryptedData.iv)
            cipher.init(Cipher.DECRYPT_MODE, key, gcmSpec)

            cipher.doFinal(encryptedData.cipherText)
        } catch (e: Exception) {
            Log.e(TAG, "AES-GCM decryption failed: ${e.message}")
            throw e
        }
    }

    private fun encryptAesCbc(
        plainBytes: ByteArray,
        key: SecretKey
    ): EncryptedData {
        return try {
            val iv = ByteArray(CBC_IV_LENGTH)
            secureRandom.nextBytes(iv)

            val cipher = Cipher.getInstance("AES/CBC/PKCS5Padding")
            val ivSpec = IvParameterSpec(iv)
            cipher.init(Cipher.ENCRYPT_MODE, key, ivSpec)

            val cipherText = cipher.doFinal(plainBytes)

            EncryptedData(
                cipherText = cipherText,
                iv = iv,
                tag = null,
                encryptionType = EncryptionType.AES_256_CBC
            )
        } catch (e: Exception) {
            Log.e(TAG, "AES-CBC encryption failed: ${e.message}")
            throw e
        }
    }

    private fun decryptAesCbc(
        encryptedData: EncryptedData,
        key: SecretKey
    ): ByteArray {
        return try {
            val cipher = Cipher.getInstance("AES/CBC/PKCS5Padding")
            val ivSpec = IvParameterSpec(encryptedData.iv)
            cipher.init(Cipher.DECRYPT_MODE, key, ivSpec)

            cipher.doFinal(encryptedData.cipherText)
        } catch (e: Exception) {
            Log.e(TAG, "AES-CBC decryption failed: ${e.message}")
            throw e
        }
    }

    fun generateKeyInKeystore(): Boolean {
        return try {
            val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE)
            keyStore.load(null)

            if (keyStore.containsAlias(KEY_ALIAS)) {
                return true
            }

            val keyGenerator = KeyGenerator.getInstance(
                KeyProperties.KEY_ALGORITHM_AES,
                ANDROID_KEYSTORE
            )

            val keyGenParameterSpec = KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT
            )
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .setKeySize(AES_KEY_SIZE_256)
                .build()

            keyGenerator.init(keyGenParameterSpec)
            keyGenerator.generateKey()

            Log.d(TAG, "Key generated in Android Keystore")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to generate key in Keystore: ${e.message}")
            false
        }
    }

    fun getKeystoreKey(): SecretKey? {
        return try {
            val keyStore = KeyStore.getInstance(ANDROID_KEYSTORE)
            keyStore.load(null)

            val secretKeyEntry = keyStore.getEntry(KEY_ALIAS, null) as? KeyStore.SecretKeyEntry
            secretKeyEntry?.secretKey
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get key from Keystore: ${e.message}")
            null
        }
    }

    suspend fun encryptWithKeystore(plainText: String): EncryptedData? = withContext(Dispatchers.Default) {
        val key = getKeystoreKey() ?: run {
            if (!generateKeyInKeystore()) return@withContext null
            getKeystoreKey() ?: return@withContext null
        }

        encrypt(plainText, EncryptionType.AES_256_GCM, key)
    }

    suspend fun decryptWithKeystore(encryptedData: EncryptedData): String? = withContext(Dispatchers.Default) {
        val key = getKeystoreKey() ?: return@withContext null
        try {
            decrypt(encryptedData, key)
        } catch (e: Exception) {
            Log.e(TAG, "Keystore decryption failed: ${e.message}")
            null
        }
    }

    fun computeHash(data: String, algorithm: String = "SHA-256"): String {
        val md = MessageDigest.getInstance(algorithm)
        val hashBytes = md.digest(data.toByteArray(Charsets.UTF_8))
        return hashBytes.joinToString("") { "%02x".format(it) }
    }

    fun computeHmac(data: String, key: ByteArray): String {
        val mac = javax.crypto.Mac.getInstance("HmacSHA256")
        mac.init(SecretKeySpec(key, "HmacSHA256"))
        val hmacBytes = mac.doFinal(data.toByteArray(Charsets.UTF_8))
        return hmacBytes.joinToString("") { "%02x".format(it) }
    }
}

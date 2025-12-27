package com.socanalyzer.app.data.collector

import android.content.Context
import android.os.Build
import java.io.File

data class NpuInfo(
    val name: String,
    val manufacturer: String,
    val tops: Float,
    val supportedPrecisions: List<String>,
    val acceleratorType: String
)

data class IspInfo(
    val name: String,
    val maxResolution: String,
    val maxVideoResolution: String,
    val features: List<String>
)

data class ModemInfo(
    val name: String,
    val networkSupport: List<String>,
    val maxDownloadSpeed: String,
    val maxUploadSpeed: String,
    val is5GSupported: Boolean
)

class NpuInfoCollector(private val context: Context) {

    fun getNpuInfo(): NpuInfo {
        val socName = getSocName()
        return matchNpuFromDatabase(socName)
    }

    fun getIspInfo(): IspInfo {
        val socName = getSocName()
        return matchIspFromDatabase(socName)
    }

    fun getModemInfo(): ModemInfo {
        val socName = getSocName()
        return matchModemFromDatabase(socName)
    }

    private fun getSocName(): String {
        return try {
            val cpuInfo = File("/proc/cpuinfo").readText()
            val hardwareLine = cpuInfo.lines().find { it.startsWith("Hardware") }
            hardwareLine?.substringAfter(":")?.trim() ?: Build.HARDWARE
        } catch (e: Exception) {
            Build.HARDWARE
        }
    }

    private fun matchNpuFromDatabase(socName: String): NpuInfo {
        val lowerSoc = socName.lowercase()
        
        return when {
            lowerSoc.contains("8 gen 3") || lowerSoc.contains("sm8650") -> NpuInfo(
                name = "Hexagon NPU",
                manufacturer = "Qualcomm",
                tops = 45f,
                supportedPrecisions = listOf("INT4", "INT8", "FP16", "FP32"),
                acceleratorType = "Hexagon DSP + Tensor Accelerator"
            )
            lowerSoc.contains("8 gen 2") || lowerSoc.contains("sm8550") -> NpuInfo(
                name = "Hexagon NPU",
                manufacturer = "Qualcomm",
                tops = 35f,
                supportedPrecisions = listOf("INT4", "INT8", "FP16", "FP32"),
                acceleratorType = "Hexagon DSP + Tensor Accelerator"
            )
            lowerSoc.contains("8 gen 1") || lowerSoc.contains("sm8450") -> NpuInfo(
                name = "Hexagon NPU",
                manufacturer = "Qualcomm",
                tops = 27f,
                supportedPrecisions = listOf("INT8", "FP16", "FP32"),
                acceleratorType = "Hexagon DSP"
            )
            lowerSoc.contains("dimensity 9300") || lowerSoc.contains("mt6989") -> NpuInfo(
                name = "APU 790",
                manufacturer = "MediaTek",
                tops = 46f,
                supportedPrecisions = listOf("INT4", "INT8", "FP16", "BF16"),
                acceleratorType = "MediaTek APU"
            )
            lowerSoc.contains("dimensity 9200") || lowerSoc.contains("mt6985") -> NpuInfo(
                name = "APU 690",
                manufacturer = "MediaTek",
                tops = 35f,
                supportedPrecisions = listOf("INT4", "INT8", "FP16"),
                acceleratorType = "MediaTek APU"
            )
            lowerSoc.contains("exynos 2400") -> NpuInfo(
                name = "Samsung NPU",
                manufacturer = "Samsung",
                tops = 37f,
                supportedPrecisions = listOf("INT8", "FP16"),
                acceleratorType = "Samsung NPU"
            )
            lowerSoc.contains("exynos 2200") -> NpuInfo(
                name = "Samsung NPU",
                manufacturer = "Samsung",
                tops = 26f,
                supportedPrecisions = listOf("INT8", "FP16"),
                acceleratorType = "Samsung NPU"
            )
            lowerSoc.contains("kirin 9000") -> NpuInfo(
                name = "Da Vinci NPU",
                manufacturer = "HiSilicon",
                tops = 24f,
                supportedPrecisions = listOf("INT8", "FP16"),
                acceleratorType = "Dual Big Core + Tiny Core NPU"
            )
            lowerSoc.contains("tensor g3") -> NpuInfo(
                name = "Google TPU",
                manufacturer = "Google",
                tops = 22f,
                supportedPrecisions = listOf("INT8", "FP16", "BF16"),
                acceleratorType = "Tensor Processing Unit"
            )
            else -> NpuInfo(
                name = "Unknown NPU",
                manufacturer = "Unknown",
                tops = 0f,
                supportedPrecisions = listOf("INT8"),
                acceleratorType = "Unknown"
            )
        }
    }

    private fun matchIspFromDatabase(socName: String): IspInfo {
        val lowerSoc = socName.lowercase()
        
        return when {
            lowerSoc.contains("8 gen 3") || lowerSoc.contains("sm8650") -> IspInfo(
                name = "Spectra ISP",
                maxResolution = "200MP",
                maxVideoResolution = "8K@30fps",
                features = listOf("Triple 18-bit ISP", "Cognitive ISP", "Real-time Semantic Segmentation", "AI Face Detection")
            )
            lowerSoc.contains("8 gen 2") || lowerSoc.contains("sm8550") -> IspInfo(
                name = "Spectra ISP",
                maxResolution = "200MP",
                maxVideoResolution = "8K@30fps",
                features = listOf("Triple 18-bit ISP", "Cognitive ISP", "Real-time Bokeh")
            )
            lowerSoc.contains("dimensity 9300") || lowerSoc.contains("mt6989") -> IspInfo(
                name = "Imagiq 990",
                maxResolution = "320MP",
                maxVideoResolution = "8K@30fps",
                features = listOf("AI-ISP", "HDR-ISP", "4K Cinema Mode", "AI Noise Reduction")
            )
            lowerSoc.contains("dimensity 9200") || lowerSoc.contains("mt6985") -> IspInfo(
                name = "Imagiq 890",
                maxResolution = "320MP",
                maxVideoResolution = "8K@24fps",
                features = listOf("AI-ISP", "HDR-ISP", "AI Noise Reduction")
            )
            lowerSoc.contains("exynos 2400") -> IspInfo(
                name = "Samsung ISP",
                maxResolution = "200MP",
                maxVideoResolution = "8K@30fps",
                features = listOf("AI Image Processing", "HDR10+", "Multi-frame Processing")
            )
            lowerSoc.contains("tensor g3") -> IspInfo(
                name = "Google ISP",
                maxResolution = "108MP",
                maxVideoResolution = "4K@60fps",
                features = listOf("HDR+", "Night Sight", "Magic Eraser", "Photo Unblur")
            )
            else -> IspInfo(
                name = "Unknown ISP",
                maxResolution = "Unknown",
                maxVideoResolution = "Unknown",
                features = emptyList()
            )
        }
    }

    private fun matchModemFromDatabase(socName: String): ModemInfo {
        val lowerSoc = socName.lowercase()
        
        return when {
            lowerSoc.contains("8 gen 3") || lowerSoc.contains("sm8650") -> ModemInfo(
                name = "Snapdragon X75",
                networkSupport = listOf("5G Sub-6", "5G mmWave", "4G LTE", "3G", "2G"),
                maxDownloadSpeed = "10 Gbps",
                maxUploadSpeed = "3.5 Gbps",
                is5GSupported = true
            )
            lowerSoc.contains("8 gen 2") || lowerSoc.contains("sm8550") -> ModemInfo(
                name = "Snapdragon X70",
                networkSupport = listOf("5G Sub-6", "5G mmWave", "4G LTE", "3G", "2G"),
                maxDownloadSpeed = "10 Gbps",
                maxUploadSpeed = "3.5 Gbps",
                is5GSupported = true
            )
            lowerSoc.contains("8 gen 1") || lowerSoc.contains("sm8450") -> ModemInfo(
                name = "Snapdragon X65",
                networkSupport = listOf("5G Sub-6", "5G mmWave", "4G LTE", "3G", "2G"),
                maxDownloadSpeed = "10 Gbps",
                maxUploadSpeed = "3 Gbps",
                is5GSupported = true
            )
            lowerSoc.contains("dimensity 9300") || lowerSoc.contains("mt6989") -> ModemInfo(
                name = "MediaTek M80",
                networkSupport = listOf("5G Sub-6", "5G mmWave", "4G LTE", "3G", "2G"),
                maxDownloadSpeed = "7.9 Gbps",
                maxUploadSpeed = "4.2 Gbps",
                is5GSupported = true
            )
            lowerSoc.contains("dimensity 9200") || lowerSoc.contains("mt6985") -> ModemInfo(
                name = "MediaTek M80",
                networkSupport = listOf("5G Sub-6", "5G mmWave", "4G LTE", "3G", "2G"),
                maxDownloadSpeed = "7.9 Gbps",
                maxUploadSpeed = "4.2 Gbps",
                is5GSupported = true
            )
            lowerSoc.contains("exynos 2400") -> ModemInfo(
                name = "Exynos Modem 5400",
                networkSupport = listOf("5G Sub-6", "5G mmWave", "4G LTE", "3G", "2G"),
                maxDownloadSpeed = "12.1 Gbps",
                maxUploadSpeed = "3.87 Gbps",
                is5GSupported = true
            )
            lowerSoc.contains("tensor g3") -> ModemInfo(
                name = "Exynos Modem 5300",
                networkSupport = listOf("5G Sub-6", "5G mmWave", "4G LTE", "3G", "2G"),
                maxDownloadSpeed = "7.35 Gbps",
                maxUploadSpeed = "3.67 Gbps",
                is5GSupported = true
            )
            else -> ModemInfo(
                name = "Unknown Modem",
                networkSupport = listOf("4G LTE"),
                maxDownloadSpeed = "Unknown",
                maxUploadSpeed = "Unknown",
                is5GSupported = false
            )
        }
    }

    fun checkNnapiSupport(): Boolean {
        return try {
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1
        } catch (e: Exception) {
            false
        }
    }

    fun getNnapiDevices(): List<String> {
        val devices = mutableListOf<String>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            devices.add("NNAPI Available (Android ${Build.VERSION.SDK_INT})")
        }
        return devices
    }
}

/**
 * 噪点估计算法模块
 * 用于分析图像噪点水平
 */

import { standardDeviation, mean } from './statistics'

export interface NoiseAnalysisResult {
  luminanceNoise: number      // 亮度噪点 (σ)
  chrominanceNoise: number    // 色度噪点 (σ)
  snr: number                 // 信噪比 (dB)
  noiseSpectrum: number[]     // 噪点频谱
  uniformityScore: number     // 均匀性评分 0-100
}

export interface NoiseRegion {
  x: number
  y: number
  width: number
  height: number
  avgLuminance: number
  stdDev: number
}

/**
 * RGB转YCbCr色彩空间
 */
export function rgbToYCbCr(r: number, g: number, b: number): [number, number, number] {
  const y = 0.299 * r + 0.587 * g + 0.114 * b
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b
  return [y, cb, cr]
}

/**
 * 从ImageData提取亮度通道
 */
export function extractLuminanceChannel(imageData: ImageData): number[] {
  const { data, width, height } = imageData
  const luminance: number[] = []
  
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    const [y] = rgbToYCbCr(r, g, b)
    luminance.push(y)
  }
  
  return luminance
}

/**
 * 从ImageData提取色度通道 (Cb, Cr)
 */
export function extractChrominanceChannels(imageData: ImageData): { cb: number[], cr: number[] } {
  const { data, width, height } = imageData
  const cb: number[] = []
  const cr: number[] = []
  
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    const [, cbVal, crVal] = rgbToYCbCr(r, g, b)
    cb.push(cbVal)
    cr.push(crVal)
  }
  
  return { cb, cr }
}

/**
 * 检测图像中的均匀区域（适合噪点分析）
 */
export function detectUniformRegions(
  imageData: ImageData,
  blockSize: number = 32,
  maxStdDev: number = 10
): NoiseRegion[] {
  const { data, width, height } = imageData
  const regions: NoiseRegion[] = []
  
  for (let y = 0; y < height - blockSize; y += blockSize) {
    for (let x = 0; x < width - blockSize; x += blockSize) {
      const blockPixels: number[] = []
      
      for (let by = 0; by < blockSize; by++) {
        for (let bx = 0; bx < blockSize; bx++) {
          const idx = ((y + by) * width + (x + bx)) * 4
          const luminance = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
          blockPixels.push(luminance)
        }
      }
      
      const avgValue = mean(blockPixels)
      const stdDev = standardDeviation(blockPixels)
      
      if (stdDev < maxStdDev) {
        regions.push({
          x,
          y,
          width: blockSize,
          height: blockSize,
          avgLuminance: avgValue,
          stdDev
        })
      }
    }
  }
  
  return regions.sort((a, b) => a.stdDev - b.stdDev)
}

/**
 * 计算亮度噪点
 */
export function calculateLuminanceNoise(imageData: ImageData, region?: NoiseRegion): number {
  let pixels: number[]
  
  if (region) {
    pixels = extractRegionLuminance(imageData, region)
  } else {
    pixels = extractLuminanceChannel(imageData)
  }
  
  // 使用高通滤波分离噪点
  const filtered = highPassFilter(pixels, Math.sqrt(pixels.length))
  return standardDeviation(filtered)
}

/**
 * 计算色度噪点
 */
export function calculateChrominanceNoise(imageData: ImageData, region?: NoiseRegion): number {
  const { cb, cr } = region 
    ? extractRegionChrominance(imageData, region)
    : extractChrominanceChannels(imageData)
  
  const cbFiltered = highPassFilter(cb, Math.sqrt(cb.length))
  const crFiltered = highPassFilter(cr, Math.sqrt(cr.length))
  
  const cbNoise = standardDeviation(cbFiltered)
  const crNoise = standardDeviation(crFiltered)
  
  return Math.sqrt((cbNoise * cbNoise + crNoise * crNoise) / 2)
}

/**
 * 提取区域亮度
 */
function extractRegionLuminance(imageData: ImageData, region: NoiseRegion): number[] {
  const { data, width } = imageData
  const pixels: number[] = []
  
  for (let y = region.y; y < region.y + region.height; y++) {
    for (let x = region.x; x < region.x + region.width; x++) {
      const idx = (y * width + x) * 4
      const luminance = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
      pixels.push(luminance)
    }
  }
  
  return pixels
}

/**
 * 提取区域色度
 */
function extractRegionChrominance(imageData: ImageData, region: NoiseRegion): { cb: number[], cr: number[] } {
  const { data, width } = imageData
  const cb: number[] = []
  const cr: number[] = []
  
  for (let y = region.y; y < region.y + region.height; y++) {
    for (let x = region.x; x < region.x + region.width; x++) {
      const idx = (y * width + x) * 4
      const [, cbVal, crVal] = rgbToYCbCr(data[idx], data[idx + 1], data[idx + 2])
      cb.push(cbVal)
      cr.push(crVal)
    }
  }
  
  return { cb, cr }
}

/**
 * 简单高通滤波（提取噪点）
 */
function highPassFilter(pixels: number[], width: number): number[] {
  const height = Math.floor(pixels.length / width)
  const result: number[] = []
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x
      
      // 3x3 拉普拉斯算子
      const center = pixels[idx] * 4
      const neighbors = 
        pixels[idx - width] + 
        pixels[idx + width] + 
        pixels[idx - 1] + 
        pixels[idx + 1]
      
      result.push(center - neighbors)
    }
  }
  
  return result
}

/**
 * 计算信噪比 (SNR)
 */
export function calculateSNR(signal: number, noise: number): number {
  if (noise <= 0) return 100 // 无限大SNR
  return 20 * Math.log10(signal / noise)
}

/**
 * 综合噪点分析
 */
export function analyzeNoise(imageData: ImageData): NoiseAnalysisResult {
  // 检测均匀区域
  const uniformRegions = detectUniformRegions(imageData)
  
  let luminanceNoise: number
  let chrominanceNoise: number
  let signalLevel: number
  
  if (uniformRegions.length > 0) {
    // 使用最均匀的区域分析
    const bestRegion = uniformRegions[0]
    luminanceNoise = calculateLuminanceNoise(imageData, bestRegion)
    chrominanceNoise = calculateChrominanceNoise(imageData, bestRegion)
    signalLevel = bestRegion.avgLuminance
  } else {
    // 使用整个图像
    luminanceNoise = calculateLuminanceNoise(imageData)
    chrominanceNoise = calculateChrominanceNoise(imageData)
    signalLevel = mean(extractLuminanceChannel(imageData))
  }
  
  const snr = calculateSNR(signalLevel, luminanceNoise)
  
  // 计算噪点频谱（简化版）
  const noiseSpectrum = calculateNoiseSpectrum(imageData)
  
  // 均匀性评分
  const uniformityScore = calculateUniformityScore(uniformRegions)
  
  return {
    luminanceNoise,
    chrominanceNoise,
    snr,
    noiseSpectrum,
    uniformityScore
  }
}

/**
 * 计算噪点频谱（简化版）
 */
function calculateNoiseSpectrum(imageData: ImageData): number[] {
  const luminance = extractLuminanceChannel(imageData)
  const filtered = highPassFilter(luminance, imageData.width)
  
  // 简化的频谱分析：按区域统计噪点分布
  const spectrum: number[] = []
  const binCount = 10
  const binSize = Math.floor(filtered.length / binCount)
  
  for (let i = 0; i < binCount; i++) {
    const bin = filtered.slice(i * binSize, (i + 1) * binSize)
    spectrum.push(standardDeviation(bin))
  }
  
  return spectrum
}

/**
 * 计算均匀性评分
 */
function calculateUniformityScore(regions: NoiseRegion[]): number {
  if (regions.length === 0) return 0
  
  const avgStdDev = mean(regions.map(r => r.stdDev))
  
  // 标准差越小，均匀性越好
  // 假设stdDev < 2为满分，> 20为0分
  const score = Math.max(0, Math.min(100, 100 - (avgStdDev - 2) * 5.5))
  return Math.round(score)
}

/**
 * 评估可用ISO上限
 */
export function estimateUsableISOLimit(
  noiseAtISO: { iso: number; snr: number }[],
  minAcceptableSNR: number = 30
): number {
  const sorted = [...noiseAtISO].sort((a, b) => a.iso - b.iso)
  
  for (const { iso, snr } of sorted) {
    if (snr < minAcceptableSNR) {
      return iso
    }
  }
  
  return sorted[sorted.length - 1]?.iso || 0
}

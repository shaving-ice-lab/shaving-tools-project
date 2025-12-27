// 计算均值
export function mean(data: number[]): number {
  if (data.length === 0) return 0
  return data.reduce((sum, val) => sum + val, 0) / data.length
}

// 计算标准差
export function standardDeviation(data: number[]): number {
  if (data.length === 0) return 0
  const avg = mean(data)
  const squareDiffs = data.map(value => Math.pow(value - avg, 2))
  return Math.sqrt(mean(squareDiffs))
}

// 计算方差
export function variance(data: number[]): number {
  const std = standardDeviation(data)
  return std * std
}

// 计算中位数
export function median(data: number[]): number {
  if (data.length === 0) return 0
  const sorted = [...data].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

// 计算直方图
export function histogram(data: number[], bins: number = 256): number[] {
  const hist = new Array(bins).fill(0)
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  for (const value of data) {
    const binIndex = Math.min(bins - 1, Math.floor(((value - min) / range) * bins))
    hist[binIndex]++
  }

  return hist
}

// 计算信噪比 (SNR) in dB
export function signalToNoiseRatio(signal: number, noise: number): number {
  if (noise === 0) return Infinity
  return 20 * Math.log10(signal / noise)
}

// 提取图像区域的像素值
export function extractRegionPixels(
  imageData: ImageData,
  x: number,
  y: number,
  width: number,
  height: number
): { r: number[]; g: number[]; b: number[]; gray: number[] } {
  const r: number[] = []
  const g: number[] = []
  const b: number[] = []
  const gray: number[] = []

  for (let py = y; py < y + height && py < imageData.height; py++) {
    for (let px = x; px < x + width && px < imageData.width; px++) {
      const idx = (py * imageData.width + px) * 4
      const rv = imageData.data[idx]
      const gv = imageData.data[idx + 1]
      const bv = imageData.data[idx + 2]

      r.push(rv)
      g.push(gv)
      b.push(bv)
      gray.push(0.299 * rv + 0.587 * gv + 0.114 * bv)
    }
  }

  return { r, g, b, gray }
}

// 计算图像区域的噪点水平
export function calculateNoise(
  imageData: ImageData,
  x: number,
  y: number,
  width: number,
  height: number
): {
  luminanceNoise: number
  chromaNoise: number
  snr: number
} {
  const pixels = extractRegionPixels(imageData, x, y, width, height)

  // 亮度噪点 (灰度通道的标准差)
  const luminanceNoise = standardDeviation(pixels.gray)

  // 色度噪点 (Cb/Cr 通道的平均标准差)
  // 简化计算：使用 R-G 和 B-G 的差值
  const cb: number[] = []
  const cr: number[] = []

  for (let i = 0; i < pixels.r.length; i++) {
    cb.push(pixels.b[i] - pixels.g[i])
    cr.push(pixels.r[i] - pixels.g[i])
  }

  const chromaNoise = (standardDeviation(cb) + standardDeviation(cr)) / 2

  // 信噪比
  const signal = mean(pixels.gray)
  const snr = signalToNoiseRatio(signal, luminanceNoise)

  return { luminanceNoise, chromaNoise, snr }
}

// 计算累积直方图
export function cumulativeHistogram(hist: number[]): number[] {
  const cumulative = new Array(hist.length).fill(0)
  cumulative[0] = hist[0]
  for (let i = 1; i < hist.length; i++) {
    cumulative[i] = cumulative[i - 1] + hist[i]
  }
  return cumulative
}

// 计算百分位数
export function percentile(data: number[], p: number): number {
  if (data.length === 0) return 0
  const sorted = [...data].sort((a, b) => a - b)
  const index = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  const weight = index - lower
  return sorted[lower] * (1 - weight) + sorted[upper] * weight
}

// 计算动态范围 (EV)
export function calculateDynamicRange(
  steps: { brightness: number; noise: number }[],
  snrThreshold: number = 1 // SNR > 1 (0dB) 认为有效
): number {
  let validSteps = 0

  for (const step of steps) {
    if (step.brightness > step.noise * snrThreshold) {
      validSteps++
    }
  }

  // 假设每个灰阶步骤代表 0.5 EV
  return validSteps * 0.5
}

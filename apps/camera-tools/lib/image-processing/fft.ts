// 快速傅里叶变换 (Cooley-Tukey算法)
export function fft(real: number[], imag?: number[]): { real: number[]; imag: number[] } {
  const n = real.length

  // 确保长度是2的幂
  if (n & (n - 1)) {
    throw new Error('FFT length must be a power of 2')
  }

  const realOut = [...real]
  const imagOut = imag ? [...imag] : new Array(n).fill(0)

  // 位反转排列
  const bits = Math.log2(n)
  for (let i = 0; i < n; i++) {
    const j = reverseBits(i, bits)
    if (i < j) {
      ;[realOut[i], realOut[j]] = [realOut[j], realOut[i]]
      ;[imagOut[i], imagOut[j]] = [imagOut[j], imagOut[i]]
    }
  }

  // Cooley-Tukey FFT
  for (let size = 2; size <= n; size *= 2) {
    const halfSize = size / 2
    const tableStep = n / size

    for (let i = 0; i < n; i += size) {
      for (let j = i, k = 0; j < i + halfSize; j++, k += tableStep) {
        const angle = (-2 * Math.PI * k) / n
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)

        const tReal = realOut[j + halfSize] * cos - imagOut[j + halfSize] * sin
        const tImag = realOut[j + halfSize] * sin + imagOut[j + halfSize] * cos

        realOut[j + halfSize] = realOut[j] - tReal
        imagOut[j + halfSize] = imagOut[j] - tImag
        realOut[j] += tReal
        imagOut[j] += tImag
      }
    }
  }

  return { real: realOut, imag: imagOut }
}

// 逆FFT
export function ifft(real: number[], imag: number[]): { real: number[]; imag: number[] } {
  const n = real.length

  // 共轭
  const conjImag = imag.map(v => -v)

  // FFT
  const result = fft(real, conjImag)

  // 共轭并缩放
  return {
    real: result.real.map(v => v / n),
    imag: result.imag.map(v => -v / n),
  }
}

// 位反转
function reverseBits(n: number, bits: number): number {
  let result = 0
  for (let i = 0; i < bits; i++) {
    result = (result << 1) | (n & 1)
    n >>= 1
  }
  return result
}

// 计算幅度谱
export function magnitude(real: number[], imag: number[]): number[] {
  return real.map((r, i) => Math.sqrt(r * r + imag[i] * imag[i]))
}

// 计算相位谱
export function phase(real: number[], imag: number[]): number[] {
  return real.map((r, i) => Math.atan2(imag[i], r))
}

// 将数据补零到2的幂次
export function padToPowerOf2(data: number[]): number[] {
  const n = data.length
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(n)))

  if (n === nextPow2) return data

  const padded = new Array(nextPow2).fill(0)
  for (let i = 0; i < n; i++) {
    padded[i] = data[i]
  }

  return padded
}

// 1D FFT用于MTF计算
export function computeMTFFromLSF(lsf: number[]): number[] {
  // 补零到2的幂次
  const padded = padToPowerOf2(lsf)

  // 计算FFT
  const { real, imag } = fft(padded)

  // 计算幅度谱
  const mag = magnitude(real, imag)

  // 归一化 (DC分量归一化为1)
  const dc = mag[0] || 1
  return mag.map(v => v / dc)
}

// 汉宁窗
export function hanningWindow(n: number): number[] {
  const window = new Array(n)
  for (let i = 0; i < n; i++) {
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)))
  }
  return window
}

// 应用窗函数
export function applyWindow(data: number[], window: number[]): number[] {
  return data.map((v, i) => v * (window[i] || 0))
}

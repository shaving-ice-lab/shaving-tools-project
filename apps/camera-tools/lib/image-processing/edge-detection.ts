import { mean } from './statistics'

// Sobel 边缘检测核
const SOBEL_X = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1],
]

const SOBEL_Y = [
  [-1, -2, -1],
  [0, 0, 0],
  [1, 2, 1],
]

// 获取像素灰度值
function getGray(imageData: ImageData, x: number, y: number): number {
  if (x < 0 || x >= imageData.width || y < 0 || y >= imageData.height) {
    return 0
  }
  const idx = (y * imageData.width + x) * 4
  const r = imageData.data[idx]
  const g = imageData.data[idx + 1]
  const b = imageData.data[idx + 2]
  return 0.299 * r + 0.587 * g + 0.114 * b
}

// 卷积操作
function convolve(imageData: ImageData, x: number, y: number, kernel: number[][]): number {
  let sum = 0
  for (let ky = -1; ky <= 1; ky++) {
    for (let kx = -1; kx <= 1; kx++) {
      sum += getGray(imageData, x + kx, y + ky) * kernel[ky + 1][kx + 1]
    }
  }
  return sum
}

// Sobel 边缘检测
export function sobelEdge(imageData: ImageData): {
  magnitude: Float32Array
  direction: Float32Array
} {
  const width = imageData.width
  const height = imageData.height
  const magnitude = new Float32Array(width * height)
  const direction = new Float32Array(width * height)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const gx = convolve(imageData, x, y, SOBEL_X)
      const gy = convolve(imageData, x, y, SOBEL_Y)

      const idx = y * width + x
      magnitude[idx] = Math.sqrt(gx * gx + gy * gy)
      direction[idx] = Math.atan2(gy, gx)
    }
  }

  return { magnitude, direction }
}

// 检测斜边角度 (用于MTF测试)
export function detectSlantedEdgeAngle(imageData: ImageData): number {
  const { direction, magnitude } = sobelEdge(imageData)

  // 找到梯度最强的区域，计算平均角度
  const threshold = Math.max(...magnitude) * 0.5
  const angles: number[] = []

  for (let i = 0; i < magnitude.length; i++) {
    if (magnitude[i] > threshold) {
      angles.push(direction[i])
    }
  }

  if (angles.length === 0) return 0

  // 计算平均角度 (考虑角度的周期性)
  let sumSin = 0
  let sumCos = 0
  for (const angle of angles) {
    sumSin += Math.sin(angle)
    sumCos += Math.cos(angle)
  }

  return Math.atan2(sumSin / angles.length, sumCos / angles.length)
}

// 提取ESF (Edge Spread Function)
export function extractESF(imageData: ImageData, edgeAngle: number, oversample: number = 4): number[] {
  const width = imageData.width
  const height = imageData.height

  // 将边缘旋转到垂直方向
  const cos = Math.cos(edgeAngle)
  const sin = Math.sin(edgeAngle)

  // 投影到垂直于边缘的方向
  const projections: Map<number, number[]> = new Map()

  const centerX = width / 2
  const centerY = height / 2

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gray = getGray(imageData, x, y)

      // 相对于中心的坐标
      const dx = x - centerX
      const dy = y - centerY

      // 投影到垂直于边缘的方向
      const proj = dx * cos + dy * sin

      // 量化到过采样网格
      const bin = Math.round(proj * oversample)

      if (!projections.has(bin)) {
        projections.set(bin, [])
      }
      projections.get(bin)!.push(gray)
    }
  }

  // 对每个bin取平均
  const bins = Array.from(projections.keys()).sort((a, b) => a - b)
  const esf: number[] = []

  for (const bin of bins) {
    esf.push(mean(projections.get(bin)!))
  }

  return esf
}

// 计算LSF (Line Spread Function) - ESF的导数
export function computeLSF(esf: number[]): number[] {
  const lsf: number[] = []

  for (let i = 1; i < esf.length; i++) {
    lsf.push(esf[i] - esf[i - 1])
  }

  return lsf
}

// 查找MTF50/MTF30值
export function findMTFValue(mtf: number[], targetContrast: number): number {
  // MTF曲线通常是从1开始递减
  // 找到对比度降到目标值时的频率位置

  for (let i = 1; i < mtf.length; i++) {
    if (mtf[i] <= targetContrast && mtf[i - 1] > targetContrast) {
      // 线性插值
      const ratio = (targetContrast - mtf[i - 1]) / (mtf[i] - mtf[i - 1])
      return i - 1 + ratio
    }
  }

  // 如果没有找到，返回最大频率或0
  return mtf[mtf.length - 1] > targetContrast ? mtf.length - 1 : 0
}

// 网格交点检测 (用于畸变测试)
export function detectGridIntersections(imageData: ImageData, expectedRows: number, expectedCols: number): { x: number; y: number }[] {
  // 简化实现：使用Harris角点检测原理
  const { magnitude } = sobelEdge(imageData)
  const width = imageData.width
  const height = imageData.height

  const corners: { x: number; y: number; strength: number }[] = []

  // 非极大值抑制窗口
  const windowSize = Math.min(width, height) / Math.max(expectedRows, expectedCols) / 2

  for (let y = windowSize; y < height - windowSize; y += windowSize / 2) {
    for (let x = windowSize; x < width - windowSize; x += windowSize / 2) {
      const idx = Math.round(y) * width + Math.round(x)
      const strength = magnitude[idx]

      // 检查是否是局部最大值
      let isMax = true
      for (let dy = -windowSize / 2; dy <= windowSize / 2 && isMax; dy++) {
        for (let dx = -windowSize / 2; dx <= windowSize / 2 && isMax; dx++) {
          const nidx = Math.round(y + dy) * width + Math.round(x + dx)
          if (nidx !== idx && magnitude[nidx] > strength) {
            isMax = false
          }
        }
      }

      if (isMax && strength > 50) {
        corners.push({ x, y, strength })
      }
    }
  }

  // 按强度排序并选择最强的点
  corners.sort((a, b) => b.strength - a.strength)
  const expectedPoints = expectedRows * expectedCols

  return corners.slice(0, expectedPoints).map(({ x, y }) => ({ x, y }))
}

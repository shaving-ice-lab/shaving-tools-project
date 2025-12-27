/**
 * 图像插值算法模块
 * 用于图像缩放和变换
 */

/**
 * 最近邻插值
 */
export function nearestNeighbor(
  srcData: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number
): Uint8ClampedArray {
  const dstData = new Uint8ClampedArray(dstWidth * dstHeight * 4)
  
  const xRatio = srcWidth / dstWidth
  const yRatio = srcHeight / dstHeight
  
  for (let y = 0; y < dstHeight; y++) {
    for (let x = 0; x < dstWidth; x++) {
      const srcX = Math.floor(x * xRatio)
      const srcY = Math.floor(y * yRatio)
      
      const srcIdx = (srcY * srcWidth + srcX) * 4
      const dstIdx = (y * dstWidth + x) * 4
      
      dstData[dstIdx] = srcData[srcIdx]
      dstData[dstIdx + 1] = srcData[srcIdx + 1]
      dstData[dstIdx + 2] = srcData[srcIdx + 2]
      dstData[dstIdx + 3] = srcData[srcIdx + 3]
    }
  }
  
  return dstData
}

/**
 * 双线性插值
 */
export function bilinear(
  srcData: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number
): Uint8ClampedArray {
  const dstData = new Uint8ClampedArray(dstWidth * dstHeight * 4)
  
  const xRatio = (srcWidth - 1) / dstWidth
  const yRatio = (srcHeight - 1) / dstHeight
  
  for (let y = 0; y < dstHeight; y++) {
    for (let x = 0; x < dstWidth; x++) {
      const srcX = x * xRatio
      const srcY = y * yRatio
      
      const x0 = Math.floor(srcX)
      const y0 = Math.floor(srcY)
      const x1 = Math.min(x0 + 1, srcWidth - 1)
      const y1 = Math.min(y0 + 1, srcHeight - 1)
      
      const xFrac = srcX - x0
      const yFrac = srcY - y0
      
      const idx00 = (y0 * srcWidth + x0) * 4
      const idx01 = (y0 * srcWidth + x1) * 4
      const idx10 = (y1 * srcWidth + x0) * 4
      const idx11 = (y1 * srcWidth + x1) * 4
      
      const dstIdx = (y * dstWidth + x) * 4
      
      for (let c = 0; c < 4; c++) {
        const top = srcData[idx00 + c] * (1 - xFrac) + srcData[idx01 + c] * xFrac
        const bottom = srcData[idx10 + c] * (1 - xFrac) + srcData[idx11 + c] * xFrac
        dstData[dstIdx + c] = Math.round(top * (1 - yFrac) + bottom * yFrac)
      }
    }
  }
  
  return dstData
}

/**
 * 双三次插值核函数
 */
function cubicKernel(x: number, a: number = -0.5): number {
  const absX = Math.abs(x)
  
  if (absX <= 1) {
    return (a + 2) * absX * absX * absX - (a + 3) * absX * absX + 1
  } else if (absX < 2) {
    return a * absX * absX * absX - 5 * a * absX * absX + 8 * a * absX - 4 * a
  }
  
  return 0
}

/**
 * 双三次插值 (Bicubic)
 */
export function bicubic(
  srcData: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number
): Uint8ClampedArray {
  const dstData = new Uint8ClampedArray(dstWidth * dstHeight * 4)
  
  const xRatio = srcWidth / dstWidth
  const yRatio = srcHeight / dstHeight
  
  for (let y = 0; y < dstHeight; y++) {
    for (let x = 0; x < dstWidth; x++) {
      const srcX = x * xRatio
      const srcY = y * yRatio
      
      const x0 = Math.floor(srcX)
      const y0 = Math.floor(srcY)
      
      const dstIdx = (y * dstWidth + x) * 4
      
      for (let c = 0; c < 4; c++) {
        let value = 0
        let weight = 0
        
        for (let j = -1; j <= 2; j++) {
          for (let i = -1; i <= 2; i++) {
            const px = Math.max(0, Math.min(srcWidth - 1, x0 + i))
            const py = Math.max(0, Math.min(srcHeight - 1, y0 + j))
            
            const srcIdx = (py * srcWidth + px) * 4
            const w = cubicKernel(srcX - (x0 + i)) * cubicKernel(srcY - (y0 + j))
            
            value += srcData[srcIdx + c] * w
            weight += w
          }
        }
        
        dstData[dstIdx + c] = Math.max(0, Math.min(255, Math.round(value / weight)))
      }
    }
  }
  
  return dstData
}

/**
 * Lanczos插值核函数
 */
function lanczosKernel(x: number, a: number = 3): number {
  if (x === 0) return 1
  if (Math.abs(x) >= a) return 0
  
  const piX = Math.PI * x
  return (a * Math.sin(piX) * Math.sin(piX / a)) / (piX * piX)
}

/**
 * Lanczos插值 (高质量)
 */
export function lanczos(
  srcData: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number,
  a: number = 3
): Uint8ClampedArray {
  const dstData = new Uint8ClampedArray(dstWidth * dstHeight * 4)
  
  const xRatio = srcWidth / dstWidth
  const yRatio = srcHeight / dstHeight
  
  for (let y = 0; y < dstHeight; y++) {
    for (let x = 0; x < dstWidth; x++) {
      const srcX = (x + 0.5) * xRatio - 0.5
      const srcY = (y + 0.5) * yRatio - 0.5
      
      const x0 = Math.floor(srcX)
      const y0 = Math.floor(srcY)
      
      const dstIdx = (y * dstWidth + x) * 4
      
      for (let c = 0; c < 4; c++) {
        let value = 0
        let weight = 0
        
        for (let j = 1 - a; j <= a; j++) {
          for (let i = 1 - a; i <= a; i++) {
            const px = Math.max(0, Math.min(srcWidth - 1, x0 + i))
            const py = Math.max(0, Math.min(srcHeight - 1, y0 + j))
            
            const srcIdx = (py * srcWidth + px) * 4
            const w = lanczosKernel(srcX - (x0 + i), a) * lanczosKernel(srcY - (y0 + j), a)
            
            value += srcData[srcIdx + c] * w
            weight += w
          }
        }
        
        if (weight > 0) {
          dstData[dstIdx + c] = Math.max(0, Math.min(255, Math.round(value / weight)))
        }
      }
    }
  }
  
  return dstData
}

/**
 * 图像缩放函数
 */
export function resizeImage(
  imageData: ImageData,
  newWidth: number,
  newHeight: number,
  method: 'nearest' | 'bilinear' | 'bicubic' | 'lanczos' = 'bilinear'
): ImageData {
  const { data, width, height } = imageData
  
  let resizedData: Uint8ClampedArray
  
  switch (method) {
    case 'nearest':
      resizedData = nearestNeighbor(data, width, height, newWidth, newHeight)
      break
    case 'bilinear':
      resizedData = bilinear(data, width, height, newWidth, newHeight)
      break
    case 'bicubic':
      resizedData = bicubic(data, width, height, newWidth, newHeight)
      break
    case 'lanczos':
      resizedData = lanczos(data, width, height, newWidth, newHeight)
      break
    default:
      resizedData = bilinear(data, width, height, newWidth, newHeight)
  }
  
  return new ImageData(resizedData as unknown as Uint8ClampedArray, newWidth, newHeight)
}

/**
 * 旋转图像
 */
export function rotateImage(
  imageData: ImageData,
  angleDegrees: number,
  method: 'nearest' | 'bilinear' = 'bilinear'
): ImageData {
  const { data, width, height } = imageData
  const angleRad = (angleDegrees * Math.PI) / 180
  
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)
  
  // 计算旋转后的边界
  const corners = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: 0, y: height },
    { x: width, y: height }
  ]
  
  const rotatedCorners = corners.map(c => ({
    x: c.x * cos - c.y * sin,
    y: c.x * sin + c.y * cos
  }))
  
  const minX = Math.min(...rotatedCorners.map(c => c.x))
  const maxX = Math.max(...rotatedCorners.map(c => c.x))
  const minY = Math.min(...rotatedCorners.map(c => c.y))
  const maxY = Math.max(...rotatedCorners.map(c => c.y))
  
  const newWidth = Math.ceil(maxX - minX)
  const newHeight = Math.ceil(maxY - minY)
  
  const dstData = new Uint8ClampedArray(newWidth * newHeight * 4)
  
  const centerX = width / 2
  const centerY = height / 2
  const newCenterX = newWidth / 2
  const newCenterY = newHeight / 2
  
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      // 反向映射
      const dx = x - newCenterX
      const dy = y - newCenterY
      
      const srcX = dx * cos + dy * sin + centerX
      const srcY = -dx * sin + dy * cos + centerY
      
      const dstIdx = (y * newWidth + x) * 4
      
      if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
        if (method === 'nearest') {
          const sx = Math.round(srcX)
          const sy = Math.round(srcY)
          const srcIdx = (sy * width + sx) * 4
          
          dstData[dstIdx] = data[srcIdx]
          dstData[dstIdx + 1] = data[srcIdx + 1]
          dstData[dstIdx + 2] = data[srcIdx + 2]
          dstData[dstIdx + 3] = data[srcIdx + 3]
        } else {
          // 双线性插值
          const x0 = Math.floor(srcX)
          const y0 = Math.floor(srcY)
          const x1 = Math.min(x0 + 1, width - 1)
          const y1 = Math.min(y0 + 1, height - 1)
          
          const xFrac = srcX - x0
          const yFrac = srcY - y0
          
          const idx00 = (y0 * width + x0) * 4
          const idx01 = (y0 * width + x1) * 4
          const idx10 = (y1 * width + x0) * 4
          const idx11 = (y1 * width + x1) * 4
          
          for (let c = 0; c < 4; c++) {
            const top = data[idx00 + c] * (1 - xFrac) + data[idx01 + c] * xFrac
            const bottom = data[idx10 + c] * (1 - xFrac) + data[idx11 + c] * xFrac
            dstData[dstIdx + c] = Math.round(top * (1 - yFrac) + bottom * yFrac)
          }
        }
      } else {
        // 透明
        dstData[dstIdx + 3] = 0
      }
    }
  }
  
  return new ImageData(dstData as unknown as Uint8ClampedArray, newWidth, newHeight)
}

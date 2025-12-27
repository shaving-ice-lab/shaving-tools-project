import type { RGB, Lab, XYZ } from '@/types'

// D65 白点参考值
const REF_X = 95.047
const REF_Y = 100.0
const REF_Z = 108.883

// sRGB to XYZ 转换矩阵
const SRGB_TO_XYZ = [
  [0.4124564, 0.3575761, 0.1804375],
  [0.2126729, 0.7151522, 0.072175],
  [0.0193339, 0.119192, 0.9503041],
]

// XYZ to sRGB 转换矩阵
const XYZ_TO_SRGB = [
  [3.2404542, -1.5371385, -0.4985314],
  [-0.969266, 1.8760108, 0.041556],
  [0.0556434, -0.2040259, 1.0572252],
]

// sRGB gamma 校正
function srgbGamma(value: number): number {
  return value > 0.04045 ? Math.pow((value + 0.055) / 1.055, 2.4) : value / 12.92
}

// sRGB 反gamma 校正
function srgbInverseGamma(value: number): number {
  return value > 0.0031308 ? 1.055 * Math.pow(value, 1 / 2.4) - 0.055 : 12.92 * value
}

// Lab f函数
function labF(t: number): number {
  const delta = 6 / 29
  return t > Math.pow(delta, 3) ? Math.pow(t, 1 / 3) : t / (3 * Math.pow(delta, 2)) + 4 / 29
}

// Lab 反f函数
function labFInverse(t: number): number {
  const delta = 6 / 29
  return t > delta ? Math.pow(t, 3) : 3 * Math.pow(delta, 2) * (t - 4 / 29)
}

// RGB [0-255] to XYZ
export function rgbToXyz(r: number, g: number, b: number): XYZ {
  // 归一化到 [0, 1]
  const rn = srgbGamma(r / 255)
  const gn = srgbGamma(g / 255)
  const bn = srgbGamma(b / 255)

  // 矩阵乘法
  const x = (SRGB_TO_XYZ[0][0] * rn + SRGB_TO_XYZ[0][1] * gn + SRGB_TO_XYZ[0][2] * bn) * 100
  const y = (SRGB_TO_XYZ[1][0] * rn + SRGB_TO_XYZ[1][1] * gn + SRGB_TO_XYZ[1][2] * bn) * 100
  const z = (SRGB_TO_XYZ[2][0] * rn + SRGB_TO_XYZ[2][1] * gn + SRGB_TO_XYZ[2][2] * bn) * 100

  return { x, y, z }
}

// XYZ to RGB [0-255]
export function xyzToRgb(x: number, y: number, z: number): RGB {
  // 归一化
  const xn = x / 100
  const yn = y / 100
  const zn = z / 100

  // 矩阵乘法
  let rn = XYZ_TO_SRGB[0][0] * xn + XYZ_TO_SRGB[0][1] * yn + XYZ_TO_SRGB[0][2] * zn
  let gn = XYZ_TO_SRGB[1][0] * xn + XYZ_TO_SRGB[1][1] * yn + XYZ_TO_SRGB[1][2] * zn
  let bn = XYZ_TO_SRGB[2][0] * xn + XYZ_TO_SRGB[2][1] * yn + XYZ_TO_SRGB[2][2] * zn

  // 反gamma校正并转换到 [0, 255]
  const r = Math.round(Math.max(0, Math.min(255, srgbInverseGamma(rn) * 255)))
  const g = Math.round(Math.max(0, Math.min(255, srgbInverseGamma(gn) * 255)))
  const b = Math.round(Math.max(0, Math.min(255, srgbInverseGamma(bn) * 255)))

  return { r, g, b }
}

// XYZ to Lab
export function xyzToLab(x: number, y: number, z: number): Lab {
  const xn = x / REF_X
  const yn = y / REF_Y
  const zn = z / REF_Z

  const fx = labF(xn)
  const fy = labF(yn)
  const fz = labF(zn)

  const l = 116 * fy - 16
  const a = 500 * (fx - fy)
  const bVal = 200 * (fy - fz)

  return { l, a, b: bVal }
}

// Lab to XYZ
export function labToXyz(l: number, a: number, b: number): XYZ {
  const fy = (l + 16) / 116
  const fx = a / 500 + fy
  const fz = fy - b / 200

  const x = labFInverse(fx) * REF_X
  const y = labFInverse(fy) * REF_Y
  const z = labFInverse(fz) * REF_Z

  return { x, y, z }
}

// RGB to Lab
export function rgbToLab(r: number, g: number, b: number): Lab {
  const xyz = rgbToXyz(r, g, b)
  return xyzToLab(xyz.x, xyz.y, xyz.z)
}

// Lab to RGB
export function labToRgb(l: number, a: number, b: number): RGB {
  const xyz = labToXyz(l, a, b)
  return xyzToRgb(xyz.x, xyz.y, xyz.z)
}

// 计算 ΔE2000 色差
export function deltaE2000(lab1: Lab, lab2: Lab): number {
  const L1 = lab1.l,
    a1 = lab1.a,
    b1 = lab1.b
  const L2 = lab2.l,
    a2 = lab2.a,
    b2 = lab2.b

  const kL = 1,
    kC = 1,
    kH = 1

  const C1 = Math.sqrt(a1 * a1 + b1 * b1)
  const C2 = Math.sqrt(a2 * a2 + b2 * b2)
  const Cab = (C1 + C2) / 2

  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cab, 7) / (Math.pow(Cab, 7) + Math.pow(25, 7))))

  const a1p = (1 + G) * a1
  const a2p = (1 + G) * a2

  const C1p = Math.sqrt(a1p * a1p + b1 * b1)
  const C2p = Math.sqrt(a2p * a2p + b2 * b2)

  let h1p = (Math.atan2(b1, a1p) * 180) / Math.PI
  if (h1p < 0) h1p += 360

  let h2p = (Math.atan2(b2, a2p) * 180) / Math.PI
  if (h2p < 0) h2p += 360

  const dLp = L2 - L1
  const dCp = C2p - C1p

  let dhp: number
  if (C1p * C2p === 0) {
    dhp = 0
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360
  } else {
    dhp = h2p - h1p + 360
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp * Math.PI) / 360)

  const Lp = (L1 + L2) / 2
  const Cp = (C1p + C2p) / 2

  let hp: number
  if (C1p * C2p === 0) {
    hp = h1p + h2p
  } else if (Math.abs(h1p - h2p) <= 180) {
    hp = (h1p + h2p) / 2
  } else if (h1p + h2p < 360) {
    hp = (h1p + h2p + 360) / 2
  } else {
    hp = (h1p + h2p - 360) / 2
  }

  const T =
    1 -
    0.17 * Math.cos(((hp - 30) * Math.PI) / 180) +
    0.24 * Math.cos((2 * hp * Math.PI) / 180) +
    0.32 * Math.cos(((3 * hp + 6) * Math.PI) / 180) -
    0.2 * Math.cos(((4 * hp - 63) * Math.PI) / 180)

  const dTheta = 30 * Math.exp(-Math.pow((hp - 275) / 25, 2))

  const RC = 2 * Math.sqrt(Math.pow(Cp, 7) / (Math.pow(Cp, 7) + Math.pow(25, 7)))

  const SL = 1 + (0.015 * Math.pow(Lp - 50, 2)) / Math.sqrt(20 + Math.pow(Lp - 50, 2))
  const SC = 1 + 0.045 * Cp
  const SH = 1 + 0.015 * Cp * T

  const RT = -Math.sin((2 * dTheta * Math.PI) / 180) * RC

  const dE = Math.sqrt(
    Math.pow(dLp / (kL * SL), 2) + Math.pow(dCp / (kC * SC), 2) + Math.pow(dHp / (kH * SH), 2) + RT * (dCp / (kC * SC)) * (dHp / (kH * SH))
  )

  return dE
}

// 估算色温 (基于RGB)
export function estimateColorTemperature(rgb: RGB): number {
  const { r, g, b } = rgb

  // 简化的色温估算算法
  // 基于红蓝比率
  const ratio = r / (b + 0.001)

  // 经验公式近似
  if (ratio > 1.5) {
    return 2700 + (ratio - 1.5) * 500
  } else if (ratio < 0.7) {
    return 8000 - (0.7 - ratio) * 3000
  } else {
    return 5500 + (1 - ratio) * 2000
  }
}

// 计算饱和度偏差
export function calculateSaturationBias(measured: Lab[], reference: Lab[]): number {
  if (measured.length !== reference.length || measured.length === 0) return 0

  let totalBias = 0
  for (let i = 0; i < measured.length; i++) {
    const measuredChroma = Math.sqrt(measured[i].a ** 2 + measured[i].b ** 2)
    const refChroma = Math.sqrt(reference[i].a ** 2 + reference[i].b ** 2)
    if (refChroma > 0) {
      totalBias += (measuredChroma - refChroma) / refChroma
    }
  }

  return (totalBias / measured.length) * 100
}

// 计算色相偏移 (平均角度偏移)
export function calculateHueBias(measured: Lab[], reference: Lab[]): number {
  if (measured.length !== reference.length || measured.length === 0) return 0

  let totalBias = 0
  let count = 0

  for (let i = 0; i < measured.length; i++) {
    const measuredHue = (Math.atan2(measured[i].b, measured[i].a) * 180) / Math.PI
    const refHue = (Math.atan2(reference[i].b, reference[i].a) * 180) / Math.PI

    let diff = measuredHue - refHue
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360

    const chroma = Math.sqrt(reference[i].a ** 2 + reference[i].b ** 2)
    if (chroma > 10) {
      // 只考虑有足够饱和度的颜色
      totalBias += diff
      count++
    }
  }

  return count > 0 ? totalBias / count : 0
}

// 图像相关类型
export interface Region {
  x: number
  y: number
  width: number
  height: number
}

export interface ImageInfo {
  file: File
  url: string
  width: number
  height: number
  exif?: ExifData
}

export interface ExifData {
  make?: string
  model?: string
  focalLength?: number
  aperture?: number
  iso?: number
  shutterSpeed?: string
  dateTime?: string
}

// 色彩空间类型
export interface RGB {
  r: number
  g: number
  b: number
}

export interface Lab {
  l: number
  a: number
  b: number
}

export interface XYZ {
  x: number
  y: number
  z: number
}

// MTF相关类型
export interface MTFCurve {
  frequencies: number[]
  values: number[]
}

export interface MTFMetrics {
  mtf50: number
  mtf30: number
  mtf10: number
  centerSharpness: number
  edgeSharpness: number
}

export interface MTFMeasurement {
  position: 'center' | 'edge' | 'corner'
  horizontal: MTFCurve
  vertical: MTFCurve
  metrics: MTFMetrics
}

// 色彩准确度类型
export interface ColorPatch {
  id: number
  name: string
  reference: Lab
  measured: Lab
  deltaE: number
}

export interface ColorAccuracyResult {
  patches: ColorPatch[]
  averageDeltaE: number
  maxDeltaE: number
  saturationBias: number
  hueBias: number
}

// 动态范围类型
export interface DynamicRangeResult {
  totalRange: number
  highlightHeadroom: number
  shadowRange: number
  baseISORange: number
  steps: { ev: number; snr: number }[]
}

// 噪点分析类型
export interface NoiseResult {
  luminanceNoise: number
  chromaNoise: number
  snr: number
  iso: number
}

export interface NoiseAnalysis {
  results: NoiseResult[]
  maxUsableISO: number
}

// 畸变类型
export interface DistortionResult {
  maxDistortion: number
  type: 'barrel' | 'pincushion' | 'mustache' | 'none'
  k1: number
  k2: number
  residualError: number
  gridPoints: { original: { x: number; y: number }; measured: { x: number; y: number } }[]
}

// 暗角类型
export interface VignettingResult {
  cornerFalloff: number
  edgeFalloff: number
  uniformityScore: number
  heatmap: number[][]
}

// 白平衡类型
export interface WhiteBalanceResult {
  measuredTemp: number
  referenceTemp: number
  tempDeviation: number
  tintDeviation: number
  presetAccuracy: { preset: string; deltaE: number }[]
}

// 对焦性能类型
export interface AutoFocusResult {
  focusTime: number
  hitRate: number
  lowLightLimit: number
  trackingSuccessRate: number
}

// 视频规格类型
export interface VideoSpecResult {
  resolution: { horizontal: number; vertical: number }
  frameRateStability: number
  rollingShutter: number
  cropFactor: number
  maxRecordingTime: number
}

// 报告类型
export interface CameraInfo {
  make: string
  model: string
  lens?: string
  serialNumber?: string
}

export interface ReportSection {
  title: string
  type: 'text' | 'chart' | 'table' | 'image'
  content: unknown
}

export interface ReportTemplate {
  title: string
  camera: CameraInfo
  testDate: Date
  tester: string
  sections: ReportSection[]
}

// 工具类型
export type ToolType = 'mtf' | 'color' | 'dynamic-range' | 'noise' | 'distortion' | 'vignetting' | 'white-balance' | 'autofocus' | 'video'

export interface ToolInfo {
  id: ToolType
  name: string
  description: string
  icon: string
}

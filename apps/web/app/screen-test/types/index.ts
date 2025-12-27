export interface TestConfig {
  id: string
  name: string
  description: string
  icon: string
  path: string
  category: 'pixel' | 'color' | 'motion' | 'display'
}

export interface ColorConfig {
  name: string
  value: string
  description?: string
}

export interface FrameData {
  timestamp: number
  delta: number
}

export interface PWMTestConfig {
  frequency: number
  name: string
  description: string
  risk: 'low' | 'medium' | 'high'
}

export interface SpeedConfig {
  name: string
  pixelsPerFrame: number
}

export interface ColorGamutConfig {
  name: string
  colors: { name: string; value: string }[]
  description: string
}

export interface AngleData {
  alpha: number
  beta: number
  gamma: number
}

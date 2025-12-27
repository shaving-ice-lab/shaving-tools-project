// 设备握手数据
export interface DeviceHandshake {
  type: 'handshake'
  device: {
    brand: string
    model: string
    android_version: string
    soc: string
  }
  app_version: string
  timestamp: number
}

// CPU核心信息
export interface CpuCore {
  type: 'prime' | 'big' | 'middle' | 'little'
  arch: string
  max_freq: number
  current_freq: number
  min_freq?: number
}

// SoC信息
export interface SocInfo {
  type: 'soc_info'
  cpu: {
    name: string
    cores: CpuCore[]
    process: string
  }
  gpu: {
    name: string
    max_freq: number
    current_freq: number
  }
  memory: {
    type: string
    size_gb: number
    bandwidth: string
  }
  npu?: {
    name: string
    tops: number
  }
  isp?: {
    name: string
    max_resolution: string
  }
  modem?: {
    name: string
    max_speed: string
  }
}

// 实时监控数据
export interface RealtimeMonitor {
  type: 'realtime_monitor'
  timestamp: number
  cpu: {
    usage: number
    frequencies: number[]
    temperature: number
  }
  gpu: {
    usage: number
    frequency: number
    temperature: number
  }
  memory: {
    used_mb: number
    available_mb: number
  }
  battery: {
    temperature: number
    current_ma: number
    voltage_mv: number
    power_mw: number
  }
}

// 跑分结果
export interface BenchmarkResult {
  type: 'benchmark_result'
  timestamp: number
  cpu: {
    single_core: number
    multi_core: number
    integer: number
    float: number
    memory_bandwidth: number
  }
  gpu: {
    score: number
    fill_rate: number
    texture: number
    compute: number
  }
  ai?: {
    score: number
    int8: number
    fp16: number
  }
}

// 压力测试数据
export interface StressTestData {
  type: 'stress_test'
  timestamp: number
  elapsed_seconds: number
  cpu_frequency: number[]
  cpu_temperature: number
  gpu_frequency: number
  gpu_temperature: number
  throttle_detected: boolean
  performance_score: number
}

// 游戏帧率数据
export interface GameFrameData {
  type: 'game_frame'
  timestamp: number
  app_name: string
  fps: number
  frame_time_ms: number
  jank_count: number
  cpu_temperature: number
  gpu_temperature: number
}

// 芯片数据库条目
export interface ChipDatabaseEntry {
  id: string
  name: string
  manufacturer: string
  process: string
  cpu_config: string
  cpu_cores: {
    type: string
    count: number
    arch: string
    max_freq: number
  }[]
  gpu_name: string
  gpu_freq: number
  npu_tops?: number
  memory_type: string
  memory_bandwidth: string
  tdp?: number
  release_date: string
  benchmark_reference?: {
    single_core: number
    multi_core: number
    gpu: number
    ai?: number
  }
}

// 连接状态
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

// WebSocket消息类型
export type WSMessage = DeviceHandshake | SocInfo | RealtimeMonitor | BenchmarkResult | StressTestData | GameFrameData

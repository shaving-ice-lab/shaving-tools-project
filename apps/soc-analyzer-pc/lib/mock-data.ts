import { SocInfo, RealtimeMonitor, BenchmarkResult, DeviceHandshake } from './types'

// 模拟设备握手数据
export const mockDeviceHandshake: DeviceHandshake = {
  type: 'handshake',
  device: {
    brand: 'Xiaomi',
    model: '14 Pro',
    android_version: '14',
    soc: 'Snapdragon 8 Gen 3',
  },
  app_version: '1.0.0',
  timestamp: Date.now(),
}

// 模拟SoC信息
export const mockSocInfo: SocInfo = {
  type: 'soc_info',
  cpu: {
    name: 'Snapdragon 8 Gen 3',
    cores: [
      { type: 'prime', arch: 'Cortex-X4', max_freq: 3300, current_freq: 2800 },
      { type: 'big', arch: 'Cortex-A720', max_freq: 3150, current_freq: 2400 },
      { type: 'big', arch: 'Cortex-A720', max_freq: 3150, current_freq: 2400 },
      { type: 'big', arch: 'Cortex-A720', max_freq: 2960, current_freq: 2100 },
      { type: 'big', arch: 'Cortex-A720', max_freq: 2960, current_freq: 2100 },
      { type: 'little', arch: 'Cortex-A520', max_freq: 2270, current_freq: 1800 },
      { type: 'little', arch: 'Cortex-A520', max_freq: 2270, current_freq: 1800 },
      { type: 'little', arch: 'Cortex-A520', max_freq: 2270, current_freq: 1800 },
    ],
    process: '4nm TSMC',
  },
  gpu: {
    name: 'Adreno 750',
    max_freq: 903,
    current_freq: 680,
  },
  memory: {
    type: 'LPDDR5X',
    size_gb: 16,
    bandwidth: '8533 MT/s',
  },
  npu: {
    name: 'Hexagon NPU',
    tops: 45,
  },
}

// 生成模拟实时监控数据
export function generateMockRealtimeData(): RealtimeMonitor {
  const baseFreqs = [3300, 3150, 3150, 2960, 2960, 2270, 2270, 2270]
  const frequencies = baseFreqs.map(f => Math.floor(f * (0.5 + Math.random() * 0.5)))
  
  return {
    type: 'realtime_monitor',
    timestamp: Date.now(),
    cpu: {
      usage: 20 + Math.random() * 60,
      frequencies,
      temperature: 35 + Math.random() * 20,
    },
    gpu: {
      usage: 10 + Math.random() * 50,
      frequency: Math.floor(400 + Math.random() * 500),
      temperature: 33 + Math.random() * 18,
    },
    memory: {
      used_mb: 8192 + Math.floor(Math.random() * 4096),
      available_mb: 16384 - 8192 - Math.floor(Math.random() * 4096),
    },
    battery: {
      temperature: 30 + Math.random() * 10,
      current_ma: -(500 + Math.random() * 1000),
      voltage_mv: 4000 + Math.random() * 200,
      power_mw: 2000 + Math.random() * 3000,
    },
  }
}

// 模拟跑分结果
export const mockBenchmarkResult: BenchmarkResult = {
  type: 'benchmark_result',
  timestamp: Date.now(),
  cpu: {
    single_core: 2150,
    multi_core: 7200,
    integer: 2300,
    float: 2000,
    memory_bandwidth: 120000,
  },
  gpu: {
    score: 18500,
    fill_rate: 12000,
    texture: 9500,
    compute: 15000,
  },
  ai: {
    score: 35000,
    int8: 45000,
    fp16: 25000,
  },
}

// 生成模拟历史数据
export function generateHistoricalData(count: number): RealtimeMonitor[] {
  const data: RealtimeMonitor[] = []
  const now = Date.now()
  
  for (let i = count - 1; i >= 0; i--) {
    const item = generateMockRealtimeData()
    item.timestamp = now - i * 1000
    data.push(item)
  }
  
  return data
}

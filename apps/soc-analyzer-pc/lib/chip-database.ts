import { ChipDatabaseEntry } from './types'

// 主流SoC芯片数据库
export const chipDatabase: ChipDatabaseEntry[] = [
  // Qualcomm Snapdragon
  {
    id: 'sd-8-gen-3',
    name: 'Snapdragon 8 Gen 3',
    manufacturer: 'Qualcomm',
    process: '4nm TSMC',
    cpu_config: '1+5+2',
    cpu_cores: [
      { type: 'prime', count: 1, arch: 'Cortex-X4', max_freq: 3300 },
      { type: 'big', count: 5, arch: 'Cortex-A720', max_freq: 3150 },
      { type: 'little', count: 2, arch: 'Cortex-A520', max_freq: 2270 },
    ],
    gpu_name: 'Adreno 750',
    gpu_freq: 903,
    npu_tops: 45,
    memory_type: 'LPDDR5X',
    memory_bandwidth: '8533 MT/s',
    tdp: 12,
    release_date: '2023-10',
    benchmark_reference: {
      single_core: 2250,
      multi_core: 7400,
      gpu: 19000,
      ai: 38000,
    },
  },
  {
    id: 'sd-8-gen-2',
    name: 'Snapdragon 8 Gen 2',
    manufacturer: 'Qualcomm',
    process: '4nm TSMC',
    cpu_config: '1+4+3',
    cpu_cores: [
      { type: 'prime', count: 1, arch: 'Cortex-X3', max_freq: 3200 },
      { type: 'big', count: 4, arch: 'Cortex-A715/A710', max_freq: 2800 },
      { type: 'little', count: 3, arch: 'Cortex-A510', max_freq: 2000 },
    ],
    gpu_name: 'Adreno 740',
    gpu_freq: 680,
    npu_tops: 35,
    memory_type: 'LPDDR5X',
    memory_bandwidth: '8533 MT/s',
    tdp: 10,
    release_date: '2022-11',
    benchmark_reference: {
      single_core: 2000,
      multi_core: 5500,
      gpu: 15000,
      ai: 32000,
    },
  },
  {
    id: 'sd-8-gen-1',
    name: 'Snapdragon 8 Gen 1',
    manufacturer: 'Qualcomm',
    process: '4nm Samsung',
    cpu_config: '1+3+4',
    cpu_cores: [
      { type: 'prime', count: 1, arch: 'Cortex-X2', max_freq: 3000 },
      { type: 'big', count: 3, arch: 'Cortex-A710', max_freq: 2500 },
      { type: 'little', count: 4, arch: 'Cortex-A510', max_freq: 1800 },
    ],
    gpu_name: 'Adreno 730',
    gpu_freq: 818,
    npu_tops: 27,
    memory_type: 'LPDDR5',
    memory_bandwidth: '6400 MT/s',
    tdp: 10,
    release_date: '2021-12',
    benchmark_reference: {
      single_core: 1700,
      multi_core: 4800,
      gpu: 12000,
      ai: 25000,
    },
  },
  // MediaTek Dimensity
  {
    id: 'dimensity-9300',
    name: 'Dimensity 9300',
    manufacturer: 'MediaTek',
    process: '4nm TSMC',
    cpu_config: '4+4',
    cpu_cores: [
      { type: 'prime', count: 4, arch: 'Cortex-X4', max_freq: 3250 },
      { type: 'big', count: 4, arch: 'Cortex-A720', max_freq: 2000 },
    ],
    gpu_name: 'Immortalis-G720 MC12',
    gpu_freq: 1300,
    npu_tops: 46,
    memory_type: 'LPDDR5X',
    memory_bandwidth: '9600 MT/s',
    tdp: 12,
    release_date: '2023-11',
    benchmark_reference: {
      single_core: 2200,
      multi_core: 7800,
      gpu: 18500,
      ai: 40000,
    },
  },
  {
    id: 'dimensity-9200',
    name: 'Dimensity 9200',
    manufacturer: 'MediaTek',
    process: '4nm TSMC',
    cpu_config: '1+3+4',
    cpu_cores: [
      { type: 'prime', count: 1, arch: 'Cortex-X3', max_freq: 3050 },
      { type: 'big', count: 3, arch: 'Cortex-A715', max_freq: 2850 },
      { type: 'little', count: 4, arch: 'Cortex-A510', max_freq: 1800 },
    ],
    gpu_name: 'Immortalis-G715 MC11',
    gpu_freq: 981,
    npu_tops: 35,
    memory_type: 'LPDDR5X',
    memory_bandwidth: '8533 MT/s',
    tdp: 10,
    release_date: '2022-11',
    benchmark_reference: {
      single_core: 1950,
      multi_core: 5800,
      gpu: 14500,
      ai: 33000,
    },
  },
  // Apple A series (for reference)
  {
    id: 'apple-a17-pro',
    name: 'Apple A17 Pro',
    manufacturer: 'Apple',
    process: '3nm TSMC',
    cpu_config: '2+4',
    cpu_cores: [
      { type: 'big', count: 2, arch: 'Performance', max_freq: 3780 },
      { type: 'little', count: 4, arch: 'Efficiency', max_freq: 2110 },
    ],
    gpu_name: 'Apple GPU 6-core',
    gpu_freq: 1398,
    npu_tops: 35,
    memory_type: 'LPDDR5',
    memory_bandwidth: '6400 MT/s',
    release_date: '2023-09',
    benchmark_reference: {
      single_core: 2900,
      multi_core: 7200,
      gpu: 21000,
      ai: 36000,
    },
  },
  {
    id: 'apple-a16-bionic',
    name: 'Apple A16 Bionic',
    manufacturer: 'Apple',
    process: '4nm TSMC',
    cpu_config: '2+4',
    cpu_cores: [
      { type: 'big', count: 2, arch: 'Performance', max_freq: 3460 },
      { type: 'little', count: 4, arch: 'Efficiency', max_freq: 2020 },
    ],
    gpu_name: 'Apple GPU 5-core',
    gpu_freq: 1338,
    npu_tops: 17,
    memory_type: 'LPDDR5',
    memory_bandwidth: '6400 MT/s',
    release_date: '2022-09',
    benchmark_reference: {
      single_core: 2500,
      multi_core: 6400,
      gpu: 18000,
      ai: 28000,
    },
  },
  // Huawei Kirin
  {
    id: 'kirin-9000s',
    name: 'Kirin 9000S',
    manufacturer: 'Huawei/SMIC',
    process: '7nm SMIC',
    cpu_config: '1+3+4',
    cpu_cores: [
      { type: 'prime', count: 1, arch: 'TaiShan V121', max_freq: 2620 },
      { type: 'big', count: 3, arch: 'TaiShan V121', max_freq: 2150 },
      { type: 'little', count: 4, arch: 'TaiShan V121', max_freq: 1530 },
    ],
    gpu_name: 'Maleoon 910',
    gpu_freq: 750,
    npu_tops: 16,
    memory_type: 'LPDDR5',
    memory_bandwidth: '6400 MT/s',
    release_date: '2023-08',
    benchmark_reference: {
      single_core: 1150,
      multi_core: 3800,
      gpu: 8500,
      ai: 18000,
    },
  },
  // Samsung Exynos
  {
    id: 'exynos-2400',
    name: 'Exynos 2400',
    manufacturer: 'Samsung',
    process: '4nm Samsung',
    cpu_config: '1+2+3+4',
    cpu_cores: [
      { type: 'prime', count: 1, arch: 'Cortex-X4', max_freq: 3200 },
      { type: 'big', count: 2, arch: 'Cortex-A720', max_freq: 2900 },
      { type: 'middle', count: 3, arch: 'Cortex-A720', max_freq: 2600 },
      { type: 'little', count: 4, arch: 'Cortex-A520', max_freq: 1950 },
    ],
    gpu_name: 'Xclipse 940 (AMD RDNA3)',
    gpu_freq: 1300,
    npu_tops: 37,
    memory_type: 'LPDDR5X',
    memory_bandwidth: '8533 MT/s',
    tdp: 10,
    release_date: '2024-01',
    benchmark_reference: {
      single_core: 2100,
      multi_core: 6800,
      gpu: 16500,
      ai: 35000,
    },
  },
  {
    id: 'exynos-2200',
    name: 'Exynos 2200',
    manufacturer: 'Samsung',
    process: '4nm Samsung',
    cpu_config: '1+3+4',
    cpu_cores: [
      { type: 'prime', count: 1, arch: 'Cortex-X2', max_freq: 2800 },
      { type: 'big', count: 3, arch: 'Cortex-A710', max_freq: 2520 },
      { type: 'little', count: 4, arch: 'Cortex-A510', max_freq: 1820 },
    ],
    gpu_name: 'Xclipse 920 (AMD RDNA2)',
    gpu_freq: 1300,
    npu_tops: 26,
    memory_type: 'LPDDR5',
    memory_bandwidth: '6400 MT/s',
    tdp: 8,
    release_date: '2022-01',
    benchmark_reference: {
      single_core: 1350,
      multi_core: 4200,
      gpu: 11000,
      ai: 24000,
    },
  },
  // Google Tensor
  {
    id: 'tensor-g3',
    name: 'Google Tensor G3',
    manufacturer: 'Google/Samsung',
    process: '4nm Samsung',
    cpu_config: '1+4+4',
    cpu_cores: [
      { type: 'prime', count: 1, arch: 'Cortex-X3', max_freq: 2910 },
      { type: 'big', count: 4, arch: 'Cortex-A715', max_freq: 2370 },
      { type: 'little', count: 4, arch: 'Cortex-A510', max_freq: 1700 },
    ],
    gpu_name: 'Mali-G715 MC7',
    gpu_freq: 890,
    npu_tops: 30,
    memory_type: 'LPDDR5X',
    memory_bandwidth: '8533 MT/s',
    release_date: '2023-10',
    benchmark_reference: {
      single_core: 1800,
      multi_core: 4900,
      gpu: 12500,
      ai: 45000,
    },
  },
]

// 根据芯片名称搜索
export function searchChips(query: string): ChipDatabaseEntry[] {
  const lowerQuery = query.toLowerCase()
  return chipDatabase.filter(
    (chip) =>
      chip.name.toLowerCase().includes(lowerQuery) ||
      chip.manufacturer.toLowerCase().includes(lowerQuery)
  )
}

// 根据ID获取芯片
export function getChipById(id: string): ChipDatabaseEntry | undefined {
  return chipDatabase.find((chip) => chip.id === id)
}

// 获取所有制造商
export function getManufacturers(): string[] {
  return [...new Set(chipDatabase.map((chip) => chip.manufacturer))]
}

// 根据制造商筛选
export function getChipsByManufacturer(manufacturer: string): ChipDatabaseEntry[] {
  return chipDatabase.filter((chip) => chip.manufacturer === manufacturer)
}

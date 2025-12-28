# 手机AI性能测试套件 - 开发文档

> **项目编号**: 14  
> **项目目录**: `apps/ai-benchmark` (移动端Web App) / `apps/ai-benchmark-desktop` (桌面端)  
> **优先级**: P2  
> **状态**: � 开发中  
> **预计工期**: 2-3周  
> **技术难度**: ⭐⭐⭐⭐☆  
> **开源协议**: MIT

---

## 📋 项目概述

手机AI性能测试套件是一套包含 **移动端Web App** 和 **桌面端展示程序** 的完整解决方案。移动端负责在手机浏览器中执行各类AI性能测试（图像分类、对象检测、NLP等），测量推理速度、准确率和能效；桌面端负责接收、存储和可视化展示AI性能测试数据，支持多设备对比和历史追踪。

### 系统架构

```text
┌─────────────────┐      无线/有线传输      ┌─────────────────┐
│  移动端 Web App  │ ◄──────────────────────► │    桌面端程序    │
│  (AI性能测试)    │    WebSocket / USB      │   (数据展示端)   │
└─────────────────┘                          └─────────────────┘
        │                                            │
        ▼                                            ▼
   图像分类测试                                 性能数据可视化
   对象检测测试                                 多设备对比分析
   NLP性能测试                                  历史趋势追踪
   AI应用场景测试                               性能排行榜
   能效测试                                     测试报告生成
```

### 核心价值

1. **AI推理性能测试**: 使用TensorFlow.js在浏览器中运行各类AI模型
2. **跨设备对比**: 测试不同手机的AI计算能力差异
3. **能效分析**: 评估AI推理任务对电池的影响
4. **场景模拟**: 模拟真实AI应用场景的性能表现
5. **桌面端大屏展示**: 专业级数据可视化与历史追踪

---

## 🛠️ 技术栈

### 移动端 Web App

| 类别         | 技术选型              | 说明                   |
| ------------ | --------------------- | ---------------------- |
| **框架**     | Next.js 14            | React SSR框架          |
| **语言**     | TypeScript            | 类型安全               |
| **AI引擎**   | TensorFlow.js         | 浏览器端AI推理         |
| **UI组件**   | TailwindCSS + shadcn  | 现代UI组件             |
| **图表**     | Recharts              | 数据可视化             |
| **存储**     | IndexedDB             | 本地测试数据存储       |
| **通信**     | WebSocket             | 实时数据传输           |
| **PWA**      | next-pwa              | 离线支持               |
| **部署**     | Vercel                | 边缘部署               |

### 桌面端程序

| 类别         | 技术选型              | 说明                   |
| ------------ | --------------------- | ---------------------- |
| **框架**     | Electron + React      | 跨平台桌面应用         |
| **语言**     | TypeScript            | 类型安全               |
| **UI库**     | TailwindCSS + shadcn  | 现代UI组件             |
| **图表**     | Recharts              | 数据可视化             |
| **通信**     | WebSocket Server      | 接收移动端数据         |
| **数据存储** | SQLite                | 本地数据持久化         |
| **ADB集成**  | Node ADB (可选)       | USB有线传输支持        |

---

## 🎯 功能模块

### 移动端 Web App 功能

#### 1. 图像分类性能测试

- **MobileNet测试**: 使用MobileNet v2进行图像分类
- **EfficientNet测试**: 使用EfficientNet进行高精度分类
- **推理时间测量**: 单次/批量推理时间统计
- **准确率验证**: 使用标准测试集验证准确率
- **预热运行**: 多次预热消除冷启动影响
- **多轮测试**: 自动运行多轮取平均值

#### 2. 对象检测性能测试

- **COCO-SSD测试**: 使用COCO-SSD模型检测
- **YOLO测试**: 支持YOLO Tiny模型
- **检测速度**: FPS帧率测量
- **检测精度**: mAP准确率评估
- **实时检测**: 摄像头实时检测测试
- **批量检测**: 多图批量处理性能

#### 3. NLP性能测试

- **文本分类**: 情感分析等任务测试
- **文本嵌入**: 向量化速度测试
- **问答模型**: QA模型推理测试
- **Tokenization**: 分词速度测试
- **序列长度**: 不同文本长度性能对比

#### 4. AI应用场景测试

- **人脸检测**: 人脸检测速度与准确率
- **姿态估计**: PoseNet/MoveNet测试
- **图像分割**: 语义分割性能测试
- **风格迁移**: 图像风格迁移速度
- **超分辨率**: 图像超分性能测试

#### 5. 能效测试

- **电池消耗监控**: AI任务期间电量变化
- **温度监控**: 设备温度变化（如可获取）
- **持续测试**: 长时间运行稳定性
- **能效比计算**: 性能/功耗比评估
- **节能模式对比**: 不同电源模式下的性能

#### 6. 设备信息采集

- **硬件信息**: CPU/GPU/内存信息
- **浏览器信息**: 浏览器版本、WebGL支持
- **WebGPU状态**: WebGPU可用性检测
- **WASM支持**: WebAssembly SIMD支持
- **后端选择**: TensorFlow.js后端检测

#### 7. 数据同步

- **实时推送**: WebSocket推送到桌面端
- **批量同步**: 一次性同步所有测试结果
- **二维码配对**: 扫码快速连接桌面端
- **连接状态**: 显示桌面端连接状态

### 桌面端功能

#### 1. 设备连接

- **局域网发现**: mDNS/UDP广播发现设备
- **二维码配对**: 生成配对二维码
- **USB传输**: 通过ADB端口转发
- **多设备管理**: 同时管理多台测试设备
- **连接状态监控**: 实时显示连接状态

#### 2. AI性能数据展示

- **推理时间曲线**: 各模型推理时间趋势
- **性能对比图**: 多设备性能对比
- **雷达图展示**: 多维度性能评估
- **数据表格**: 详细测试数据表格

#### 3. 分类测试分析

- **模型对比**: 不同模型性能对比
- **设备对比**: 同模型不同设备对比
- **历史趋势**: 性能变化趋势追踪
- **准确率分析**: Top-1/Top-5准确率展示

#### 4. 检测测试分析

- **FPS趋势图**: 检测帧率变化曲线
- **mAP统计**: 检测准确率统计
- **模型对比**: COCO-SSD vs YOLO对比
- **实时性分析**: 延迟与帧率关系

#### 5. NLP测试分析

- **处理速度**: Token/秒处理速度
- **模型对比**: 不同NLP模型对比
- **序列长度影响**: 长度vs性能关系图

#### 6. 能效分析

- **电池消耗曲线**: AI任务电量变化
- **温度曲线**: 设备温度变化（如有）
- **能效排名**: 设备能效比排名
- **优化建议**: 基于数据的优化建议

#### 7. 设备排行榜

- **综合AI评分**: 多维度加权评分
- **分类排名**: 图像/检测/NLP单项排名
- **历史排名**: 排名变化追踪
- **导出排行榜**: 导出排名报告

#### 8. 数据存档

- **测试记录管理**: 按设备/日期/模型归档
- **数据导入导出**: JSON/CSV格式
- **报告生成**: PDF测试报告
- **对比报告**: 多设备对比报告

---

## 📁 项目目录结构

### 移动端 Web App

```text
apps/ai-benchmark/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # 首页
│   ├── classification/
│   │   └── page.tsx                # 图像分类测试
│   ├── detection/
│   │   └── page.tsx                # 对象检测测试
│   ├── nlp/
│   │   └── page.tsx                # NLP测试
│   ├── scenarios/
│   │   └── page.tsx                # AI场景测试
│   ├── efficiency/
│   │   └── page.tsx                # 能效测试
│   ├── results/
│   │   └── page.tsx                # 测试结果
│   ├── sync/
│   │   └── page.tsx                # 数据同步
│   └── settings/
│       └── page.tsx                # 设置
│
├── components/
│   ├── benchmark/
│   │   ├── ClassificationBench.tsx # 分类测试组件
│   │   ├── DetectionBench.tsx      # 检测测试组件
│   │   ├── NLPBench.tsx            # NLP测试组件
│   │   ├── ScenarioBench.tsx       # 场景测试组件
│   │   └── EfficiencyBench.tsx     # 能效测试组件
│   ├── results/
│   │   ├── ResultCard.tsx          # 结果卡片
│   │   ├── PerformanceChart.tsx    # 性能图表
│   │   └── ComparisonTable.tsx     # 对比表格
│   ├── device/
│   │   ├── DeviceInfo.tsx          # 设备信息
│   │   └── BackendStatus.tsx       # 后端状态
│   ├── sync/
│   │   ├── QRScanner.tsx           # 二维码扫描
│   │   ├── ConnectionStatus.tsx    # 连接状态
│   │   └── SyncPanel.tsx           # 同步面板
│   └── ui/
│       ├── ProgressBar.tsx         # 进度条
│       └── TestTimer.tsx           # 测试计时器
│
├── lib/
│   ├── models/
│   │   ├── ModelLoader.ts          # 模型加载器
│   │   ├── ClassificationModels.ts # 分类模型
│   │   ├── DetectionModels.ts      # 检测模型
│   │   └── NLPModels.ts            # NLP模型
│   ├── benchmark/
│   │   ├── BenchmarkRunner.ts      # 测试运行器
│   │   ├── ClassificationBenchmark.ts
│   │   ├── DetectionBenchmark.ts
│   │   ├── NLPBenchmark.ts
│   │   └── EfficiencyBenchmark.ts
│   ├── utils/
│   │   ├── deviceInfo.ts           # 设备信息获取
│   │   ├── performanceTimer.ts     # 性能计时
│   │   └── batteryMonitor.ts       # 电池监控
│   ├── storage/
│   │   └── indexedDB.ts            # 本地存储
│   └── sync/
│       └── websocketClient.ts      # WebSocket客户端
│
├── hooks/
│   ├── useBenchmark.ts
│   ├── useDeviceInfo.ts
│   ├── useBattery.ts
│   └── useSync.ts
│
├── public/
│   ├── models/                     # 预置模型文件
│   └── test-images/                # 测试图片
│
├── package.json
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

### 桌面端

```text
apps/ai-benchmark-desktop/
├── src/
│   ├── main/
│   │   ├── index.ts                # 主进程入口
│   │   ├── websocketServer.ts      # WebSocket服务器
│   │   ├── database.ts             # SQLite数据库
│   │   ├── discovery.ts            # 设备发现服务
│   │   └── adbBridge.ts            # ADB端口转发
│   │
│   ├── renderer/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   │   ├── OverviewPanel.tsx
│   │   │   │   ├── DeviceCards.tsx
│   │   │   │   └── QuickStats.tsx
│   │   │   ├── charts/
│   │   │   │   ├── InferenceTimeChart.tsx
│   │   │   │   ├── FPSChart.tsx
│   │   │   │   ├── AccuracyChart.tsx
│   │   │   │   ├── RadarChart.tsx
│   │   │   │   └── EnergyChart.tsx
│   │   │   ├── tables/
│   │   │   │   ├── ResultsTable.tsx
│   │   │   │   ├── RankingTable.tsx
│   │   │   │   └── CompareTable.tsx
│   │   │   ├── device/
│   │   │   │   ├── DeviceList.tsx
│   │   │   │   ├── DeviceDetail.tsx
│   │   │   │   └── QRCodeDisplay.tsx
│   │   │   └── export/
│   │   │       ├── ExportPanel.tsx
│   │   │       └── PDFReport.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # 仪表盘
│   │   │   ├── Classification.tsx  # 分类测试结果
│   │   │   ├── Detection.tsx       # 检测测试结果
│   │   │   ├── NLP.tsx             # NLP测试结果
│   │   │   ├── Scenarios.tsx       # 场景测试结果
│   │   │   ├── Efficiency.tsx      # 能效分析
│   │   │   ├── Ranking.tsx         # 设备排行榜
│   │   │   ├── Compare.tsx         # 设备对比
│   │   │   ├── Archive.tsx         # 数据存档
│   │   │   └── Settings.tsx        # 设置
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAIBenchmarkStore.ts
│   │   │   ├── useDevices.ts
│   │   │   └── useRanking.ts
│   │   │
│   │   └── styles/
│   │       └── globals.css
│   │
│   └── preload/
│       └── index.ts
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── electron-builder.json
```

---

## 📡 数据传输协议

### WebSocket协议（无线传输）

```typescript
// 连接: ws://desktop_ip:8770

interface AIBenchmarkPacket {
  type: 'classification_result' | 'detection_result' | 'nlp_result' | 
        'scenario_result' | 'efficiency_result' | 'device_info' | 
        'sync_all' | 'heartbeat';
  timestamp: number;
  deviceId: string;
  data: ClassificationResult | DetectionResult | NLPResult | 
        ScenarioResult | EfficiencyResult | DeviceInfo | AllResults;
}

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  manufacturer: string;
  model: string;
  platform: string;
  osVersion: string;
  browserName: string;
  browserVersion: string;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  memory?: number;              // navigator.deviceMemory
  cores?: number;               // navigator.hardwareConcurrency
  gpu?: string;                 // WebGL renderer info
  webglVersion: string;
  webgpuSupported: boolean;
  wasmSupported: boolean;
  simdSupported: boolean;
  tfBackend: string;            // 'webgl' | 'wasm' | 'cpu' | 'webgpu'
}

interface ClassificationResult {
  testId: string;
  modelName: string;            // 'mobilenet_v2' | 'efficientnet_b0' | etc
  modelSize: number;            // bytes
  inputSize: [number, number];  // [224, 224]
  testImages: number;           // 测试图片数量
  warmupRuns: number;           // 预热次数
  testRuns: number;             // 测试次数
  results: {
    avgInferenceTime: number;   // ms
    minInferenceTime: number;
    maxInferenceTime: number;
    stdDev: number;
    throughput: number;         // images/sec
    top1Accuracy: number;       // 0-1
    top5Accuracy: number;       // 0-1
  };
  individual: {
    imageIndex: number;
    inferenceTime: number;
    prediction: string;
    confidence: number;
    correct: boolean;
  }[];
  timestamp: number;
}

interface DetectionResult {
  testId: string;
  modelName: string;            // 'coco-ssd' | 'yolo-tiny' | etc
  modelSize: number;
  inputSize: [number, number];
  testImages: number;
  warmupRuns: number;
  testRuns: number;
  results: {
    avgInferenceTime: number;   // ms
    minInferenceTime: number;
    maxInferenceTime: number;
    fps: number;                // 平均FPS
    mAP: number;                // 平均精度
    avgDetections: number;      // 平均检测数量
  };
  individual: {
    imageIndex: number;
    inferenceTime: number;
    detections: {
      class: string;
      score: number;
      bbox: [number, number, number, number];
    }[];
  }[];
  realtimeTest?: {
    duration: number;           // 测试时长(秒)
    totalFrames: number;
    avgFPS: number;
    minFPS: number;
    maxFPS: number;
    droppedFrames: number;
  };
  timestamp: number;
}

interface NLPResult {
  testId: string;
  taskType: 'classification' | 'embedding' | 'qa' | 'tokenization';
  modelName: string;
  modelSize: number;
  testSamples: number;
  results: {
    avgProcessTime: number;     // ms per sample
    tokensPerSecond: number;
    accuracy?: number;          // 如适用
    avgSequenceLength: number;
  };
  individual: {
    sampleIndex: number;
    sequenceLength: number;
    processTime: number;
    result: any;
  }[];
  timestamp: number;
}

interface ScenarioResult {
  testId: string;
  scenario: 'face_detection' | 'pose_estimation' | 'segmentation' | 
            'style_transfer' | 'super_resolution';
  modelName: string;
  modelSize: number;
  inputSize: [number, number];
  testSamples: number;
  results: {
    avgProcessTime: number;
    throughput: number;
    accuracy?: number;
    specificMetrics: Record<string, number>;  // 场景特定指标
  };
  timestamp: number;
}

interface EfficiencyResult {
  testId: string;
  testType: 'sustained' | 'burst';
  duration: number;             // 测试时长(秒)
  modelUsed: string;
  totalInferences: number;
  battery: {
    startLevel: number;         // 开始电量%
    endLevel: number;           // 结束电量%
    consumption: number;        // 消耗%
    estimatedMah?: number;      // 估算mAh
  };
  performance: {
    avgInferenceTime: number;
    inferenceTimeOverTime: {
      timestamp: number;
      inferenceTime: number;
    }[];
    throttling: boolean;        // 是否发生降频
    throttlePoint?: number;     // 降频发生时间点
  };
  efficiency: {
    inferencesPerPercent: number;  // 每1%电量可执行推理数
    score: number;              // 能效评分 0-100
  };
  timestamp: number;
}
```

### USB传输（ADB端口转发）

```text
通过ADB端口转发实现:
1. 桌面端执行: adb forward tcp:8770 tcp:8770
2. 移动端Web App通过localhost:8770连接
3. 实现与无线传输相同的WebSocket协议
```

### 二维码配对流程

```text
1. 桌面端生成包含IP和端口的二维码
2. 移动端扫描二维码获取连接信息
3. 建立WebSocket连接
4. 双向握手确认配对成功
```

---

## 📋 开发任务清单 (TODO List)

### 移动端 Web App

#### 项目初始化

- [x] 创建Next.js 14项目
- [x] 配置TypeScript
- [x] 配置TailwindCSS + shadcn/ui
- [x] 配置TensorFlow.js
- [ ] 配置Recharts图表库
- [x] 配置IndexedDB存储
- [ ] 配置PWA支持
- [x] 配置WebSocket客户端

#### 模型加载模块

- [x] 实现模型加载器基类
- [x] 实现MobileNet v2加载
- [ ] 实现EfficientNet加载
- [x] 实现COCO-SSD加载
- [ ] 实现YOLO Tiny加载 (可选)
- [ ] 实现NLP模型加载
- [ ] 实现PoseNet/MoveNet加载
- [x] 实现模型缓存机制
- [x] 实现加载进度显示

#### 图像分类测试模块

- [x] 实现分类测试运行器
- [x] 实现预热运行机制
- [x] 实现多轮测试统计
- [x] 实现推理时间精确测量
- [ ] 实现准确率计算
- [x] 实现测试图片管理
- [x] 设计分类测试UI
- [x] 设计结果展示组件

#### 对象检测测试模块

- [x] 实现检测测试运行器
- [x] 实现批量图片检测
- [x] 实现实时摄像头检测
- [x] 实现FPS计算
- [ ] 实现mAP计算 (简化版)
- [x] 设计检测测试UI
- [x] 设计实时检测预览

#### NLP测试模块

- [x] 实现文本分类测试
- [x] 实现文本嵌入测试
- [x] 实现Tokenization测试
- [x] 实现处理速度计算
- [x] 实现序列长度测试
- [x] 设计NLP测试UI
- [x] 设计结果展示组件

#### AI场景测试模块

- [x] 实现人脸检测测试
- [x] 实现姿态估计测试
- [ ] 实现图像分割测试 (可选)
- [ ] 实现风格迁移测试 (可选)
- [x] 设计场景测试UI
- [x] 设计场景选择器

#### 能效测试模块

- [x] 实现Battery API监控
- [x] 实现持续推理测试
- [x] 实现电量消耗计算
- [x] 实现性能降频检测
- [x] 实现能效评分算法
- [x] 设计能效测试UI
- [x] 设计电量曲线展示

#### 设备信息采集模块

- [x] 实现基础设备信息获取
- [x] 实现WebGL信息获取
- [x] 实现WebGPU检测
- [x] 实现WASM/SIMD检测
- [x] 实现TensorFlow.js后端检测
- [x] 设计设备信息展示UI

#### 数据存储模块

- [x] 设计IndexedDB Schema
- [x] 实现测试结果存储
- [x] 实现设备信息缓存
- [x] 实现历史记录查询
- [x] 实现数据导出功能

#### 数据同步模块

- [x] 实现WebSocket客户端
- [ ] 实现桌面端发现机制
- [x] 实现二维码扫描配对
- [x] 实现实时数据推送
- [x] 实现批量历史同步
- [x] 实现连接状态管理
- [x] 设计同步面板UI

#### UI页面开发

- [x] 首页（测试类型选择）
- [x] 图像分类测试页
- [x] 对象检测测试页
- [x] NLP测试页
- [x] AI场景测试页
- [x] 能效测试页
- [x] 测试结果页
- [x] 数据同步页
- [x] 设置页

### 桌面端程序

#### 项目初始化

- [x] 创建Electron + React项目
- [x] 配置TypeScript
- [x] 配置TailwindCSS + shadcn/ui
- [ ] 配置Recharts
- [x] 配置SQLite (better-sqlite3)
- [x] 配置electron-builder
- [ ] 配置ADB集成 (可选)

#### 通信模块

- [x] 实现WebSocket服务器
- [ ] 实现UDP广播设备发现
- [x] 实现二维码生成
- [ ] 实现ADB端口转发
- [x] 实现多设备连接管理
- [x] 实现数据接收处理
- [x] 实现心跳保活机制

#### 数据存储模块

- [x] 设计SQLite表结构
- [x] 实现分类测试结果存储
- [x] 实现检测测试结果存储
- [x] 实现NLP测试结果存储
- [x] 实现场景测试结果存储
- [x] 实现能效测试结果存储
- [x] 实现设备信息存储
- [x] 实现数据查询接口

#### 分类测试展示模块

- [ ] 实现推理时间曲线图
- [ ] 实现模型对比柱状图
- [ ] 实现设备对比图
- [ ] 实现准确率展示
- [ ] 实现历史趋势图
- [ ] 设计分类测试页面

#### 检测测试展示模块

- [ ] 实现FPS曲线图
- [ ] 实现mAP统计展示
- [ ] 实现实时测试回放
- [ ] 实现模型对比图
- [ ] 设计检测测试页面

#### NLP测试展示模块

- [x] 实现处理速度图表
- [ ] 实现序列长度影响图
- [x] 实现任务类型对比
- [x] 设计NLP测试页面

#### 场景测试展示模块

- [x] 实现场景测试结果展示
- [x] 实现场景对比图
- [x] 设计场景测试页面

#### 能效分析模块

- [x] 实现电量消耗曲线
- [x] 实现性能降频图示
- [x] 实现能效评分展示
- [x] 实现设备能效对比
- [x] 设计能效分析页面

#### 设备排行榜模块

- [x] 实现综合AI评分算法
- [x] 实现分类性能排名
- [x] 实现检测性能排名
- [x] 实现能效排名
- [x] 实现排行榜表格
- [ ] 实现历史排名追踪
- [x] 设计排行榜页面

#### 设备对比模块

- [x] 实现设备选择器
- [x] 实现并排数据对比
- [ ] 实现雷达图对比
- [x] 实现对比数据表
- [x] 设计对比页面

#### 数据存档模块

- [x] 实现按设备/日期/模型筛选
- [x] 实现JSON导出
- [x] 实现CSV导出
- [ ] 实现PDF报告生成
- [x] 设计存档页面

#### UI页面开发

- [x] 仪表盘（设备概览+连接状态）
- [x] 分类测试结果页
- [x] 检测测试结果页
- [x] NLP测试结果页
- [x] 场景测试结果页
- [x] 能效分析页
- [x] 设备排行榜页
- [x] 设备对比页
- [x] 数据存档页
- [x] 设置页

### 测试与发布

#### 测试

- [ ] 移动端Web App功能测试
- [ ] 桌面端功能测试
- [ ] 多浏览器兼容性测试
- [ ] 数据传输稳定性测试
- [ ] 多设备并发测试
- [ ] 性能数据准确性验证
- [ ] TensorFlow.js后端对比测试

#### 发布

- [ ] 移动端部署到Vercel
- [ ] 桌面端Windows打包
- [ ] 桌面端macOS打包
- [ ] 编写使用文档
- [ ] 开源发布 (MIT协议)

---

## 🔑 核心技术实现

### TensorFlow.js 模型加载

```typescript
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as posenet from '@tensorflow-models/posenet';

class ModelLoader {
  private cache: Map<string, any> = new Map();
  
  async loadClassificationModel(modelName: string): Promise<mobilenet.MobileNet> {
    if (this.cache.has(modelName)) {
      return this.cache.get(modelName);
    }
    
    // 设置后端
    await tf.setBackend('webgl');
    await tf.ready();
    
    let model: mobilenet.MobileNet;
    
    if (modelName === 'mobilenet_v2') {
      model = await mobilenet.load({ version: 2, alpha: 1.0 });
    } else {
      model = await mobilenet.load();
    }
    
    this.cache.set(modelName, model);
    return model;
  }
  
  async loadDetectionModel(modelName: string): Promise<cocoSsd.ObjectDetection> {
    if (this.cache.has(modelName)) {
      return this.cache.get(modelName);
    }
    
    await tf.setBackend('webgl');
    await tf.ready();
    
    const model = await cocoSsd.load();
    this.cache.set(modelName, model);
    return model;
  }
  
  async loadPoseModel(): Promise<posenet.PoseNet> {
    if (this.cache.has('posenet')) {
      return this.cache.get('posenet');
    }
    
    const model = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: 640, height: 480 },
      multiplier: 0.75
    });
    
    this.cache.set('posenet', model);
    return model;
  }
  
  getBackendInfo(): string {
    return tf.getBackend() || 'unknown';
  }
}
```

### 图像分类测试

```typescript
class ClassificationBenchmark {
  private model: mobilenet.MobileNet | null = null;
  
  async runBenchmark(
    images: HTMLImageElement[],
    warmupRuns: number = 3,
    testRuns: number = 10
  ): Promise<ClassificationResult> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }
    
    // 预热运行
    for (let i = 0; i < warmupRuns; i++) {
      await this.model.classify(images[0]);
    }
    
    // 正式测试
    const results: number[] = [];
    const individual: any[] = [];
    
    for (let run = 0; run < testRuns; run++) {
      for (let i = 0; i < images.length; i++) {
        const startTime = performance.now();
        const predictions = await this.model.classify(images[i]);
        const inferenceTime = performance.now() - startTime;
        
        results.push(inferenceTime);
        individual.push({
          imageIndex: i,
          inferenceTime,
          prediction: predictions[0].className,
          confidence: predictions[0].probability
        });
      }
    }
    
    // 统计结果
    const avgInferenceTime = results.reduce((a, b) => a + b) / results.length;
    const minInferenceTime = Math.min(...results);
    const maxInferenceTime = Math.max(...results);
    const stdDev = this.calculateStdDev(results);
    const throughput = 1000 / avgInferenceTime;
    
    return {
      testId: crypto.randomUUID(),
      modelName: 'mobilenet_v2',
      modelSize: 0, // 从模型获取
      inputSize: [224, 224],
      testImages: images.length,
      warmupRuns,
      testRuns,
      results: {
        avgInferenceTime,
        minInferenceTime,
        maxInferenceTime,
        stdDev,
        throughput,
        top1Accuracy: 0, // 需要ground truth
        top5Accuracy: 0
      },
      individual,
      timestamp: Date.now()
    };
  }
  
  private calculateStdDev(values: number[]): number {
    const avg = values.reduce((a, b) => a + b) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    return Math.sqrt(squareDiffs.reduce((a, b) => a + b) / values.length);
  }
}
```

### 实时检测FPS测试

```typescript
class RealtimeDetectionBenchmark {
  private model: cocoSsd.ObjectDetection | null = null;
  private isRunning = false;
  
  async runRealtimeTest(
    video: HTMLVideoElement,
    duration: number = 10 // 秒
  ): Promise<RealtimeTestResult> {
    if (!this.model) {
      throw new Error('Model not loaded');
    }
    
    this.isRunning = true;
    const startTime = performance.now();
    const frameTimes: number[] = [];
    let totalFrames = 0;
    
    while (this.isRunning && (performance.now() - startTime) < duration * 1000) {
      const frameStart = performance.now();
      await this.model.detect(video);
      const frameTime = performance.now() - frameStart;
      
      frameTimes.push(frameTime);
      totalFrames++;
      
      // 让出主线程
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    
    const fps = frameTimes.map(t => 1000 / t);
    
    return {
      duration: (performance.now() - startTime) / 1000,
      totalFrames,
      avgFPS: fps.reduce((a, b) => a + b) / fps.length,
      minFPS: Math.min(...fps),
      maxFPS: Math.max(...fps),
      droppedFrames: fps.filter(f => f < 10).length
    };
  }
  
  stop() {
    this.isRunning = false;
  }
}
```

### 能效测试

```typescript
class EfficiencyBenchmark {
  private batteryManager: BatteryManager | null = null;
  
  async init() {
    if ('getBattery' in navigator) {
      this.batteryManager = await (navigator as any).getBattery();
    }
  }
  
  async runSustainedTest(
    model: any,
    testImage: HTMLImageElement,
    duration: number = 60 // 秒
  ): Promise<EfficiencyResult> {
    const startBattery = this.batteryManager?.level || 0;
    const startTime = performance.now();
    
    let totalInferences = 0;
    const inferenceTimeOverTime: { timestamp: number; inferenceTime: number }[] = [];
    let throttleDetected = false;
    let throttlePoint: number | undefined;
    
    // 基准推理时间
    const baselineTime = await this.measureInferenceTime(model, testImage);
    
    while ((performance.now() - startTime) < duration * 1000) {
      const inferenceStart = performance.now();
      await model.classify(testImage);
      const inferenceTime = performance.now() - inferenceStart;
      
      totalInferences++;
      inferenceTimeOverTime.push({
        timestamp: performance.now() - startTime,
        inferenceTime
      });
      
      // 检测降频 (推理时间增加超过50%)
      if (!throttleDetected && inferenceTime > baselineTime * 1.5) {
        throttleDetected = true;
        throttlePoint = performance.now() - startTime;
      }
      
      // 小延迟避免过热
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    const endBattery = this.batteryManager?.level || 0;
    const batteryConsumption = (startBattery - endBattery) * 100;
    
    return {
      testId: crypto.randomUUID(),
      testType: 'sustained',
      duration,
      modelUsed: 'mobilenet_v2',
      totalInferences,
      battery: {
        startLevel: startBattery * 100,
        endLevel: endBattery * 100,
        consumption: batteryConsumption
      },
      performance: {
        avgInferenceTime: inferenceTimeOverTime.reduce((a, b) => a + b.inferenceTime, 0) / inferenceTimeOverTime.length,
        inferenceTimeOverTime,
        throttling: throttleDetected,
        throttlePoint
      },
      efficiency: {
        inferencesPerPercent: batteryConsumption > 0 ? totalInferences / batteryConsumption : 0,
        score: this.calculateEfficiencyScore(totalInferences, batteryConsumption, throttleDetected)
      },
      timestamp: Date.now()
    };
  }
  
  private async measureInferenceTime(model: any, image: HTMLImageElement): Promise<number> {
    const times: number[] = [];
    for (let i = 0; i < 5; i++) {
      const start = performance.now();
      await model.classify(image);
      times.push(performance.now() - start);
    }
    return times.reduce((a, b) => a + b) / times.length;
  }
  
  private calculateEfficiencyScore(
    inferences: number,
    batteryUsed: number,
    throttled: boolean
  ): number {
    let score = 50;
    
    // 基于每%电量推理数评分
    const efficiency = batteryUsed > 0 ? inferences / batteryUsed : 100;
    score += Math.min(efficiency / 10, 40);
    
    // 降频惩罚
    if (throttled) {
      score -= 20;
    }
    
    return Math.max(0, Math.min(100, score));
  }
}
```

### 设备AI评分算法

```typescript
class AIScoreCalculator {
  calculateComprehensiveScore(results: DeviceResults): number {
    const weights = {
      classification: 0.30,   // 图像分类
      detection: 0.25,        // 对象检测
      nlp: 0.15,              // NLP
      efficiency: 0.20,       // 能效
      versatility: 0.10      // 多功能性
    };
    
    const classificationScore = this.scoreClassification(results.classification);
    const detectionScore = this.scoreDetection(results.detection);
    const nlpScore = this.scoreNLP(results.nlp);
    const efficiencyScore = results.efficiency?.efficiency.score || 50;
    const versatilityScore = this.scoreVersatility(results);
    
    return (
      classificationScore * weights.classification +
      detectionScore * weights.detection +
      nlpScore * weights.nlp +
      efficiencyScore * weights.efficiency +
      versatilityScore * weights.versatility
    );
  }
  
  private scoreClassification(result: ClassificationResult | undefined): number {
    if (!result) return 0;
    
    // 基于推理时间评分 (100ms以下满分)
    const timeScore = Math.max(0, 100 - (result.results.avgInferenceTime - 50) / 5);
    
    // 基于吞吐量评分
    const throughputScore = Math.min(100, result.results.throughput * 10);
    
    return (timeScore + throughputScore) / 2;
  }
  
  private scoreDetection(result: DetectionResult | undefined): number {
    if (!result) return 0;
    
    // 基于FPS评分 (30fps满分)
    const fpsScore = Math.min(100, result.results.fps / 30 * 100);
    
    // 基于推理时间
    const timeScore = Math.max(0, 100 - (result.results.avgInferenceTime - 30) / 3);
    
    return (fpsScore + timeScore) / 2;
  }
  
  private scoreNLP(result: NLPResult | undefined): number {
    if (!result) return 0;
    
    // 基于每秒token数评分
    const speedScore = Math.min(100, result.results.tokensPerSecond / 100 * 100);
    
    return speedScore;
  }
  
  private scoreVersatility(results: DeviceResults): number {
    let score = 0;
    
    // 每支持一种测试类型加20分
    if (results.classification) score += 20;
    if (results.detection) score += 20;
    if (results.nlp) score += 20;
    if (results.scenarios?.length) score += 20;
    if (results.efficiency) score += 20;
    
    return score;
  }
}
```

### 数据同步客户端

```typescript
class AIBenchmarkSyncClient {
  private ws: WebSocket | null = null;
  private deviceId: string;
  
  constructor() {
    this.deviceId = this.getOrCreateDeviceId();
  }
  
  async connect(serverUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(serverUrl);
      
      this.ws.onopen = () => {
        this.sendDeviceInfo();
        resolve();
      };
      
      this.ws.onerror = (error) => reject(error);
      
      this.ws.onclose = () => {
        // 自动重连
        setTimeout(() => this.connect(serverUrl), 3000);
      };
    });
  }
  
  sendClassificationResult(result: ClassificationResult) {
    this.send({
      type: 'classification_result',
      timestamp: Date.now(),
      deviceId: this.deviceId,
      data: result
    });
  }
  
  sendDetectionResult(result: DetectionResult) {
    this.send({
      type: 'detection_result',
      timestamp: Date.now(),
      deviceId: this.deviceId,
      data: result
    });
  }
  
  sendNLPResult(result: NLPResult) {
    this.send({
      type: 'nlp_result',
      timestamp: Date.now(),
      deviceId: this.deviceId,
      data: result
    });
  }
  
  sendEfficiencyResult(result: EfficiencyResult) {
    this.send({
      type: 'efficiency_result',
      timestamp: Date.now(),
      deviceId: this.deviceId,
      data: result
    });
  }
  
  syncAllResults(results: AllResults) {
    this.send({
      type: 'sync_all',
      timestamp: Date.now(),
      deviceId: this.deviceId,
      data: results
    });
  }
  
  private sendDeviceInfo() {
    const info = this.collectDeviceInfo();
    this.send({
      type: 'device_info',
      timestamp: Date.now(),
      deviceId: this.deviceId,
      data: info
    });
  }
  
  private collectDeviceInfo(): DeviceInfo {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
    
    return {
      deviceId: this.deviceId,
      deviceName: navigator.userAgent.match(/\(([^)]+)\)/)?.[1] || 'Unknown',
      manufacturer: '', // 从UA解析
      model: '',
      platform: navigator.platform,
      osVersion: '',
      browserName: this.getBrowserName(),
      browserVersion: this.getBrowserVersion(),
      userAgent: navigator.userAgent,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      pixelRatio: window.devicePixelRatio,
      memory: (navigator as any).deviceMemory,
      cores: navigator.hardwareConcurrency,
      gpu: debugInfo ? gl?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : undefined,
      webglVersion: gl instanceof WebGL2RenderingContext ? '2.0' : '1.0',
      webgpuSupported: 'gpu' in navigator,
      wasmSupported: typeof WebAssembly !== 'undefined',
      simdSupported: this.checkSIMDSupport(),
      tfBackend: 'webgl'
    };
  }
  
  private send(packet: AIBenchmarkPacket) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(packet));
    }
  }
  
  private getOrCreateDeviceId(): string {
    let id = localStorage.getItem('ai_benchmark_device_id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('ai_benchmark_device_id', id);
    }
    return id;
  }
  
  private getBrowserName(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Firefox')) return 'Firefox';
    return 'Unknown';
  }
  
  private getBrowserVersion(): string {
    const match = navigator.userAgent.match(/(Chrome|Safari|Firefox)\/(\d+)/);
    return match ? match[2] : 'Unknown';
  }
  
  private checkSIMDSupport(): boolean {
    try {
      return WebAssembly.validate(new Uint8Array([
        0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123,
        3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11
      ]));
    } catch {
      return false;
    }
  }
}
```

---

## ⚠️ 技术风险与解决方案

### 风险1: TensorFlow.js性能差异

**问题**: 不同浏览器/设备的TensorFlow.js性能差异大

**解决方案**:
1. 自动检测最佳后端 (WebGPU > WebGL > WASM > CPU)
2. 提供后端切换选项
3. 标注测试环境信息
4. 多后端对比测试

### 风险2: 模型加载时间长

**问题**: 首次加载大型AI模型需要较长时间

**解决方案**:
1. 使用IndexedDB缓存模型
2. 显示加载进度
3. 支持选择轻量级模型
4. 预加载常用模型

### 风险3: Battery API兼容性

**问题**: Battery API在部分浏览器被废弃或限制

**解决方案**:
1. 检测API可用性
2. 提供手动输入电量选项
3. 能效测试标记为可选
4. 使用其他指标替代

### 风险4: 移动端浏览器限制

**问题**: 移动浏览器可能限制长时间后台运行

**解决方案**:
1. 提供屏幕常亮选项
2. 分段测试机制
3. 及时保存中间结果
4. 支持断点续测

### 风险5: WebGPU支持有限

**问题**: WebGPU尚未在所有浏览器普及

**解决方案**:
1. 优先使用WebGL作为默认后端
2. 检测WebGPU支持情况
3. 在支持的设备上提供WebGPU测试
4. 记录后端类型用于对比

---

## 📊 验收标准

### 功能验收

- [ ] 图像分类测试正常运行
- [ ] 对象检测测试正常运行
- [ ] NLP测试正常运行 (至少1种任务)
- [ ] 能效测试正常运行 (需Battery API)
- [ ] 数据同步延迟<1s
- [ ] 设备排行榜评分合理

### 性能验收

- [ ] Web App首屏加载<3s
- [ ] 模型加载有进度提示
- [ ] 测试过程流畅不卡顿
- [ ] 桌面端内存<300MB

### 兼容性验收

- [ ] Chrome (Android/Desktop)
- [ ] Safari (iOS/macOS)
- [ ] Edge (Windows)
- [ ] Windows 10/11 桌面端
- [ ] macOS 10.15+ 桌面端

---

## 📚 参考资料

1. [TensorFlow.js官方文档](https://www.tensorflow.org/js)
2. [TensorFlow.js模型库](https://github.com/tensorflow/tfjs-models)
3. [WebGPU规范](https://www.w3.org/TR/webgpu/)
4. [Battery Status API](https://developer.mozilla.org/en-US/docs/Web/API/Battery_Status_API)
5. [Next.js官方文档](https://nextjs.org/docs)
6. [Electron官方文档](https://www.electronjs.org/docs)

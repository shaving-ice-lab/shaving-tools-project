# SoC芯片性能深度分析平台 - 开发文档

> **项目编号**: 05  
> **项目目录**: `apps/soc-analyzer`  
> **优先级**: P0（最高优先级）  
> **状态**: � 开发中  
> **预计工期**: 3-4周  
> **技术难度**: ⭐⭐⭐⭐⭐

---

## 📋 项目概述

SoC芯片性能深度分析平台是一个**双端协作系统**，由Android手机端应用和PC端展示平台组成。手机端负责采集芯片性能数据，通过有线（ADB/USB）或无线（WebSocket/HTTP）方式传输到PC端进行专业可视化展示和分析。

### 系统架构

```
┌─────────────────────┐         ┌─────────────────────┐
│   Android 手机端    │ ──────> │     PC 展示端       │
│  (数据采集 & 测试)  │  有线   │  (数据展示 & 分析)  │
│                     │   或    │                     │
│  - 芯片信息读取     │  无线   │  - 实时数据大屏     │
│  - 性能跑分测试     │         │  - 芯片数据库       │
│  - 温度/功耗监控    │         │  - 对比分析图表     │
│  - 游戏帧率采集     │         │  - 报告生成         │
└─────────────────────┘         └─────────────────────┘
```

### 传输方案

| 方式 | 协议 | 优点 | 缺点 |
|------|------|------|------|
| **无线传输** | WebSocket | 灵活、无需数据线 | 需同一局域网 |
| **有线传输** | ADB Forward | 稳定、低延迟 | 需USB连接 |
| **混合模式** | HTTP REST | 兼容性好 | 需配对连接 |

---

## 🛠️ 技术栈

### Android 手机端

| 类别 | 技术选型 | 说明 |
|------|----------|------|
| **开发语言** | Kotlin | Android现代开发语言 |
| **UI框架** | Jetpack Compose | 声明式UI |
| **架构** | MVVM + Clean Architecture | 分层清晰 |
| **依赖注入** | Hilt | Google官方DI |
| **网络通信** | OkHttp + Ktor WebSocket | 有线无线双模式 |
| **数据采集** | /proc/cpuinfo + sysfs | 系统级信息读取 |
| **性能测试** | 自研算法 + RenderScript | CPU/GPU跑分 |
| **最低版本** | Android 8.0 (API 26) | 覆盖95%+设备 |

### PC 展示端

| 类别 | 技术选型 | 说明 |
|------|----------|------|
| **框架** | React + TypeScript | 现代Web技术 |
| **UI库** | TailwindCSS + shadcn/ui | 精美UI组件 |
| **图表** | ECharts / Recharts | 专业数据可视化 |
| **通信** | WebSocket Server | 实时数据接收 |
| **桌面封装** | Electron / Tauri | 跨平台桌面应用 |
| **数据库** | SQLite (本地) | 芯片数据库存储 |

---

## 📝 开发 TODO List

### 🔧 基础设施搭建

- [x] 创建Android项目 `apps/soc-analyzer-android`
- [x] 创建PC端项目 `apps/soc-analyzer-pc`
- [x] 设计通用数据协议格式 (JSON Schema)
- [x] 实现WebSocket通信基础框架
- [x] 实现ADB有线传输方案
- [x] 设计手机端与PC端配对机制

---

### 📱 Android 手机端开发

#### 芯片信息采集模块

- [x] 读取 `/proc/cpuinfo` 获取CPU基础信息
- [x] 读取 `/sys/devices/system/cpu/` 获取CPU核心配置
- [x] 获取每个核心的当前频率、最大频率、最小频率
- [x] 识别大中小核架构 (big.LITTLE)
- [x] 获取CPU架构类型 (ARMv8.x / ARMv9)
- [x] 读取GPU信息 (Adreno/Mali/PowerVR型号)
- [x] 获取GPU当前频率和最大频率
- [x] 获取内存总量和可用内存
- [x] 获取内存带宽信息 (LPDDR4X/LPDDR5)
- [x] 读取设备制程工艺信息 (从芯片数据库匹配)
- [x] 获取NPU/AI加速器信息
- [x] 获取ISP图像处理器信息
- [x] 获取基带型号和网络支持

#### CPU性能测试模块

- [x] 实现单核整数运算测试 (Dhrystone算法)
- [x] 实现单核浮点运算测试 (Linpack算法)
- [x] 实现多核整数运算测试
- [x] 实现多核浮点运算测试
- [x] 实现内存带宽测试 (Stream算法)
- [x] 实现内存延迟测试
- [x] 实现压缩/解压缩性能测试 (LZ4/ZSTD)
- [x] 实现加密解密性能测试 (AES-256)
- [x] 实现SHA计算性能测试
- [x] 计算综合单核跑分
- [x] 计算综合多核跑分

#### GPU性能测试模块

- [x] 实现OpenGL ES 3.2填充率测试
- [x] 实现三角形渲染性能测试
- [x] 实现纹理采样性能测试
- [x] 实现Shader计算性能测试
- [x] 实现Vulkan API性能测试 (如支持)
- [x] 实现离屏渲染测试
- [x] 计算GPU综合跑分

#### AI/NPU性能测试模块

- [x] 实现NNAPI基准测试
- [x] 实现TFLite推理性能测试
- [x] 实现常见AI模型推理 (MobileNet/ResNet)
- [x] 测试INT8量化推理性能
- [x] 测试FP16半精度推理性能
- [x] 计算AI综合跑分

#### 持续性能测试 (压力测试)

- [x] 实现CPU满载压力测试 (持续15分钟)
- [x] 监控压力测试过程中的频率变化
- [x] 检测CPU降频阈值
- [x] 记录温度墙触发时间点
- [x] 计算性能衰减曲线
- [x] 计算稳定性得分

#### 温度与功耗监控

- [x] 读取CPU温度 (`/sys/class/thermal/`)
- [x] 读取电池温度
- [x] 读取GPU温度 (如可获取)
- [x] 读取各温区温度数据
- [x] 估算实时功耗 (电流×电压)
- [x] 计算能效比 (性能/功耗)

#### 游戏性能测试模块

- [x] 实现帧率采集服务 (SurfaceFlinger/Choreographer)
- [x] 实现帧时间分析 (Frame Time)
- [x] 计算平均帧率
- [x] 计算帧率稳定性 (1% Low / 0.1% Low)
- [x] 检测卡顿帧数量 (Jank)
- [x] 记录测试过程中温度变化
- [x] 记录测试过程中频率变化
- [x] 支持指定应用进行测试
- [x] 生成游戏性能测试报告

#### 数据传输模块

- [x] 实现WebSocket客户端
- [x] 实现自动发现PC端服务 (mDNS/UDP广播)
- [x] 实现二维码配对连接
- [x] 实现实时数据推送 (100ms间隔)
- [x] 实现测试结果批量上传
- [x] 断线自动重连
- [x] 实现有线ADB转发模式
- [x] 支持切换有线/无线模式

#### 手机端UI界面

- [x] 设计主界面 (功能入口)
- [x] 芯片信息详情页面
- [x] 实时监控仪表盘
- [x] 性能测试界面 (进度显示)
- [x] 游戏性能测试界面
- [x] 压力测试界面 (实时曲线)
- [x] 连接设置页面 (配对PC端)
- [x] 测试历史记录页面
- [x] 设置页面

---

### 💻 PC 展示端开发

#### 项目初始化

- [x] 初始化React + TypeScript项目
- [x] 配置TailwindCSS + shadcn/ui
- [x] 配置ECharts图表库
- [x] 设计整体UI布局 (深色主题)
- [x] 实现响应式布局

#### 通信服务模块

- [x] 实现WebSocket Server
- [x] 实现设备连接管理
- [x] 实现设备配对流程 (生成二维码)
- [x] 实现ADB有线连接检测
- [x] 实现多设备同时连接支持
- [x] 实现数据接收与解析

#### 芯片数据库模块

- [x] 设计芯片数据表结构
- [x] 录入主流SoC芯片数据 (骁龙/天玑/麒麟/A系列)
- [x] 包含CPU核心配置信息
- [x] 包含GPU型号和规格
- [x] 包含制程工艺信息
- [x] 包含NPU算力信息
- [x] 包含ISP规格信息
- [x] 包含内存带宽规格
- [x] 包含TDP功耗信息
- [x] 实现芯片搜索功能
- [x] 实现芯片对比功能

#### 实时监控大屏

- [x] CPU频率实时曲线图
- [x] CPU使用率实时显示
- [x] GPU频率实时曲线图
- [x] 温度实时曲线图 (多温区)
- [x] 内存使用实时显示
- [x] 功耗估算实时显示
- [x] 大核/中核/小核分别显示
- [x] 仪表盘式数据展示

#### 性能测试结果展示

- [x] CPU单核/多核跑分雷达图
- [x] GPU跑分柱状图
- [x] AI性能跑分展示
- [x] 与芯片数据库历史数据对比
- [x] 同级别芯片排行榜
- [x] 跑分趋势分析

#### 压力测试分析

- [x] 持续性能曲线图
- [x] 温度变化曲线叠加
- [x] 频率降频时间轴标注
- [x] 温度墙触发点标注
- [x] 性能衰减百分比计算
- [x] 稳定性评分展示

#### 游戏性能分析

- [x] 帧率实时曲线图
- [x] 帧时间分布直方图
- [x] 1% Low / 0.1% Low显示
- [x] 卡顿次数统计
- [x] 温度与帧率关联分析
- [x] 多游戏对比分析

#### 发热分析

- [x] 热点温度分布图
- [x] 各场景温度对比
- [x] 散热效率评估
- [x] 温度趋势预测

#### 报告生成模块

- [x] 设计报告模板
- [x] 生成PDF测试报告
- [x] 生成HTML分享页面
- [x] 包含所有测试数据汇总
- [x] 包含对比分析结论
- [x] 支持自定义水印

#### 设置与管理

- [x] 设备管理页面
- [x] 连接历史记录
- [x] 测试数据导入/导出
- [x] 主题设置 (深色/浅色)
- [x] 语言设置 (中/英)

---

### 🔌 通信协议设计

- [x] 定义设备握手协议
- [x] 定义芯片信息数据结构
- [x] 定义实时监控数据结构
- [x] 定义跑分测试数据结构
- [x] 定义游戏帧率数据结构
- [x] 定义压力测试数据结构
- [x] 定义温度监控数据结构
- [x] 实现数据压缩传输 (可选)
- [x] 实现数据加密传输 (可选)

---

### 📦 桌面应用打包

- [x] 选择打包方案 (Electron/Tauri)
- [x] 配置Windows打包
- [x] 配置macOS打包
- [x] 配置自动更新机制
- [x] 设计应用图标
- [x] 编写安装说明

---

### 🧪 测试与优化

- [ ] Android端各机型兼容性测试
- [ ] PC端各浏览器兼容性测试
- [ ] 有线传输稳定性测试
- [ ] 无线传输稳定性测试
- [ ] 大数据量传输性能优化
- [ ] 内存泄漏检测与修复
- [ ] UI性能优化

---

### 📖 文档编写

- [x] 编写用户使用手册
- [ ] 编写开发者API文档
- [ ] 编写芯片数据库贡献指南
- [ ] 录制演示视频

---

## 📊 数据协议示例

### 设备握手

```json
{
  "type": "handshake",
  "device": {
    "brand": "Xiaomi",
    "model": "14 Pro",
    "android_version": "14",
    "soc": "Snapdragon 8 Gen 3"
  },
  "app_version": "1.0.0",
  "timestamp": 1703654321000
}
```

### 芯片信息

```json
{
  "type": "soc_info",
  "cpu": {
    "name": "Snapdragon 8 Gen 3",
    "cores": [
      {"type": "prime", "arch": "Cortex-X4", "max_freq": 3300, "current_freq": 2800},
      {"type": "big", "arch": "Cortex-A720", "max_freq": 3150, "current_freq": 2400},
      {"type": "big", "arch": "Cortex-A720", "max_freq": 3150, "current_freq": 2400},
      {"type": "big", "arch": "Cortex-A720", "max_freq": 2960, "current_freq": 2100},
      {"type": "big", "arch": "Cortex-A720", "max_freq": 2960, "current_freq": 2100},
      {"type": "little", "arch": "Cortex-A520", "max_freq": 2270, "current_freq": 1800},
      {"type": "little", "arch": "Cortex-A520", "max_freq": 2270, "current_freq": 1800},
      {"type": "little", "arch": "Cortex-A520", "max_freq": 2270, "current_freq": 1800}
    ],
    "process": "4nm"
  },
  "gpu": {
    "name": "Adreno 750",
    "max_freq": 903,
    "current_freq": 680
  },
  "memory": {
    "type": "LPDDR5X",
    "size_gb": 16,
    "bandwidth": "8533 MT/s"
  },
  "npu": {
    "name": "Hexagon NPU",
    "tops": 45
  }
}
```

### 实时监控数据

```json
{
  "type": "realtime_monitor",
  "timestamp": 1703654321000,
  "cpu": {
    "usage": 45.5,
    "frequencies": [2800, 2400, 2400, 2100, 2100, 1800, 1800, 1800],
    "temperature": 42.5
  },
  "gpu": {
    "usage": 30.2,
    "frequency": 680,
    "temperature": 40.1
  },
  "memory": {
    "used_mb": 8192,
    "available_mb": 8192
  },
  "battery": {
    "temperature": 35.2,
    "current_ma": -850,
    "voltage_mv": 4200,
    "power_mw": 3570
  }
}
```

### 跑分结果

```json
{
  "type": "benchmark_result",
  "timestamp": 1703654321000,
  "cpu": {
    "single_core": 2150,
    "multi_core": 7200,
    "integer": 2300,
    "float": 2000,
    "memory_bandwidth": 120000
  },
  "gpu": {
    "score": 18500,
    "fill_rate": 12000,
    "texture": 9500,
    "compute": 15000
  },
  "ai": {
    "score": 35000,
    "int8": 45000,
    "fp16": 25000
  }
}
```

---

## 🎨 UI设计参考

### PC端大屏布局

```
┌────────────────────────────────────────────────────────────────┐
│  SOC Analyzer Pro                    [设备: Xiaomi 14 Pro] 🟢  │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   CPU Info   │  │   GPU Info   │  │   Memory     │          │
│  │  SD 8 Gen 3  │  │  Adreno 750  │  │  16GB LPDDR5X│          │
│  │  1+5+2 核心  │  │   903 MHz    │  │  8533 MT/s   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
├────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    CPU频率实时曲线                       │   │
│  │  ▁▂▃▅▆▇█▇▆▅▄▃▂▁▂▃▄▅▆▇█▇▆▅▄▃▂▁                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    温度实时曲线                          │   │
│  │  ▁▁▂▂▃▃▄▄▅▅▆▆▆▆▅▅▄▄▃▃▂▂▁▁                               │   │
│  └─────────────────────────────────────────────────────────┘   │
├────────────────────────────────────────────────────────────────┤
│  [开始跑分] [压力测试] [游戏测试] [生成报告]                    │
└────────────────────────────────────────────────────────────────┘
```

---

## 📝 开发优先级排序

**第一批 (Week 1)**:
1. 基础项目搭建
2. 芯片信息采集
3. WebSocket通信
4. 实时监控

**第二批 (Week 2)**:
1. CPU/GPU跑分测试
2. 温度监控
3. PC端基础UI
4. 实时数据展示

**第三批 (Week 3)**:
1. 压力测试
2. 游戏帧率测试
3. 芯片数据库
4. 对比分析

**第四批 (Week 4)**:
1. AI跑分测试
2. 报告生成
3. 桌面应用打包
4. 测试与优化

---

## ⚠️ 技术难点与解决方案

| 难点 | 解决方案 |
|------|----------|
| 获取准确的CPU频率 | 读取 `/sys/devices/system/cpu/cpuX/cpufreq/scaling_cur_freq` |
| 获取GPU信息 | 不同厂商路径不同，需适配Adreno/Mali/PowerVR |
| 游戏帧率采集 | 使用SurfaceFlinger或Choreographer回调 |
| 无Root获取温度 | 使用公开的thermal zone接口 |
| 跨设备传输 | mDNS自动发现 + 二维码配对 |
| 功耗估算 | 电流×电压，或使用PowerProfile |

---

## 📚 参考资源

- [Android BatteryManager API](https://developer.android.com/reference/android/os/BatteryManager)
- [Linux Thermal Subsystem](https://www.kernel.org/doc/html/latest/driver-api/thermal/)
- [CPU Frequency Scaling](https://www.kernel.org/doc/html/latest/admin-guide/pm/cpufreq.html)
- [Choreographer Frame Timing](https://developer.android.com/reference/android/view/Choreographer)

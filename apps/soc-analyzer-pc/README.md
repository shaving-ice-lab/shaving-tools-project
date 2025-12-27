# SoC Analyzer PC - 芯片性能深度分析平台

PC端数据展示与分析平台，配合Android手机端应用使用。

## 功能特性

- **实时监控大屏**: CPU/GPU频率、温度、内存使用实时曲线
- **性能跑分测试**: CPU单核/多核、GPU、AI/NPU跑分展示
- **压力测试分析**: 持续性能曲线、降频检测、温度墙分析
- **游戏性能测试**: 帧率曲线、帧时间分布、卡顿检测
- **芯片数据库**: 主流SoC芯片规格对比
- **报告生成**: PDF/HTML格式测试报告

## 技术栈

- **框架**: Next.js 14 + React 18
- **语言**: TypeScript
- **样式**: TailwindCSS + shadcn/ui
- **图表**: ECharts
- **通信**: WebSocket

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3002

### 构建

```bash
pnpm build
```

## 连接方式

### 无线连接 (WebSocket)

1. 确保手机和PC在同一局域网
2. PC端显示二维码
3. 手机端App扫描二维码连接

### 有线连接 (ADB Forward)

1. 使用USB数据线连接手机
2. 开启USB调试
3. 运行: `adb forward tcp:8765 tcp:8765`
4. PC端选择有线模式连接

## 数据协议

通信使用JSON格式，主要消息类型:

- `handshake`: 设备握手
- `soc_info`: 芯片信息
- `realtime_monitor`: 实时监控数据
- `benchmark_result`: 跑分结果
- `stress_test`: 压力测试数据
- `game_frame`: 游戏帧率数据

## 目录结构

```
soc-analyzer-pc/
├── app/                # Next.js App Router
│   ├── api/           # API路由
│   ├── layout.tsx     # 根布局
│   └── page.tsx       # 主页面
├── components/         # React组件
│   ├── dashboard/     # 仪表盘组件
│   └── ui/            # UI基础组件
├── lib/               # 工具库
│   ├── types.ts       # TypeScript类型
│   ├── utils.ts       # 工具函数
│   ├── chip-database.ts # 芯片数据库
│   └── mock-data.ts   # 模拟数据
└── public/            # 静态资源
```

## 芯片数据库

内置以下主流SoC芯片数据:

- **Qualcomm**: Snapdragon 8 Gen 3/2/1
- **MediaTek**: Dimensity 9300/9200
- **Apple**: A17 Pro, A16 Bionic
- **Samsung**: Exynos 2400/2200
- **Google**: Tensor G3
- **Huawei**: Kirin 9000S

## License

MIT

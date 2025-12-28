# APP性能分析工具 - 开发文档

> **项目编号**: 13  
> **项目目录**: `apps/app-profiler` (移动端) / `apps/app-profiler-desktop` (桌面端)  
> **优先级**: P1（高优先级）  
> **状态**: 🟢 开发完成（Android App + 桌面端）  
> **预计工期**: 3周  
> **技术难度**: ⭐⭐⭐⭐☆  
> **开源协议**: MIT

---

## 📋 项目概述

APP性能分析工具是一套包含 **Android App** 和 **桌面端展示程序** 的完整解决方案。Android App负责通过ADB接口采集APP性能数据、进行启动时间测试、内存泄漏检测等；桌面端负责接收、存储和可视化展示性能分析数据，支持多APP对比和排行榜功能。

### 系统架构

```text
┌─────────────────┐      无线/有线传输      ┌─────────────────┐
│   Android App   │ ◄──────────────────────► │    桌面端程序    │
│  (数据采集端)    │    WebSocket / USB      │   (数据展示端)   │
└─────────────────┘                          └─────────────────┘
        │                                            │
        ▼                                            ▼
   APP性能监控                                 性能数据可视化
   启动时间测试                                多APP对比分析
   内存泄漏检测                                APP排行榜展示
   电池消耗分析                                历史数据存档
```

### 核心价值

1. **APP性能监控**: 实时监控APP的CPU、内存、GPU使用情况
2. **启动时间测试**: 精确测量APP冷启动/热启动时间
3. **内存泄漏检测**: 自动检测APP内存泄漏问题
4. **电池消耗分析**: 分析APP对电池的影响
5. **APP排行榜**: 根据性能指标对APP进行排名
6. **桌面端大屏展示**: 专业级数据可视化与对比分析

---

## 🛠️ 技术栈

### Android App

| 类别         | 技术选型              | 说明             |
| ------------ | --------------------- | ---------------- |
| **框架**     | React Native          | 跨平台移动框架   |
| **语言**     | TypeScript            | 类型安全         |
| **ADB通信**  | react-native-adb      | ADB命令执行      |
| **后台服务** | Python (可选)         | 复杂数据处理     |
| **UI组件**   | React Native Paper    | Material Design  |
| **图表**     | react-native-chart-kit| 数据可视化       |
| **存储**     | AsyncStorage / SQLite | 本地数据库       |
| **权限**     | Shizuku / Root        | 系统级权限       |

### 桌面端程序

| 类别         | 技术选型              | 说明             |
| ------------ | --------------------- | ---------------- |
| **框架**     | Electron + React      | 跨平台桌面应用   |
| **语言**     | TypeScript            | 类型安全         |
| **UI库**     | TailwindCSS + shadcn  | 现代UI组件       |
| **图表**     | Recharts              | 数据可视化       |
| **通信**     | WebSocket             | 实时数据传输     |
| **数据存储** | SQLite                | 本地数据持久化   |
| **ADB集成**  | Node ADB (可选)       | 直连设备采集     |

---

## 🎯 功能模块

### Android App 功能

#### 1. APP性能监控

- **CPU使用率**: 实时监控目标APP的CPU占用
- **内存使用**: 监控RSS/PSS/USS内存指标
- **GPU渲染**: 帧率、渲染时间监控
- **网络流量**: 上行/下行流量统计
- **线程监控**: 活跃线程数量与状态

#### 2. 启动时间测试

- **冷启动测试**: 完全退出后的启动时间
- **热启动测试**: 后台恢复的启动时间
- **首帧渲染时间**: 从启动到首帧显示
- **多次测试统计**: 自动多次测试取平均值
- **启动阶段拆分**: 各启动阶段耗时分析

#### 3. 内存泄漏检测

- **内存增长监控**: 长时间运行内存趋势
- **泄漏预警**: 内存持续增长告警
- **GC监控**: 垃圾回收频率与效果
- **大对象检测**: 识别内存占用大的对象
- **泄漏报告**: 生成内存分析报告

#### 4. 电池消耗分析

- **耗电速率**: 计算APP的耗电速度
- **唤醒次数**: WakeLock使用统计
- **后台耗电**: 后台运行电量消耗
- **对比分析**: 与同类APP对比耗电
- **优化建议**: 提供省电优化建议

#### 5. APP管理

- **已安装APP列表**: 显示所有已安装APP
- **APP信息**: 版本、大小、权限等
- **快速启动测试**: 一键启动性能测试
- **收藏APP**: 常用APP快速访问

#### 6. 数据同步

- **实时推送**: WebSocket推送到桌面端
- **批量同步**: 一次性同步历史数据
- **增量同步**: 仅同步新增数据
- **连接状态**: 显示桌面端连接状态

### 桌面端功能

#### 1. 设备连接

- **局域网发现**: 自动发现同网络设备
- **USB连接**: 通过ADB直连设备
- **多设备管理**: 同时管理多台测试设备
- **连接状态监控**: 实时显示连接状态

#### 2. 性能数据展示

- **实时监控面板**: CPU/内存/GPU实时曲线
- **历史趋势图**: 长期性能变化趋势
- **性能指标卡片**: 关键指标一目了然
- **数据表格**: 详细数据表格展示

#### 3. 启动时间分析

- **启动时间曲线**: 多次测试结果对比
- **阶段拆分饼图**: 各阶段耗时占比
- **优化建议**: 根据数据给出建议
- **版本对比**: 不同版本启动时间对比

#### 4. 内存分析视图

- **内存趋势图**: 内存使用长期趋势
- **泄漏检测结果**: 泄漏风险等级
- **GC统计**: 垃圾回收频率与效果
- **内存快照对比**: 不同时间点对比

#### 5. APP排行榜

- **综合性能排名**: 多维度加权评分
- **分类排名**: CPU/内存/启动等单项排名
- **历史排名变化**: 追踪排名变化趋势
- **导出排行榜**: 导出排名报告

#### 6. 多APP对比

- **选择对比APP**: 选择多个APP进行对比
- **并排图表**: 多个APP性能曲线对比
- **雷达图对比**: 多维度性能雷达图
- **对比报告**: 生成对比分析报告

#### 7. 数据存档

- **测试记录管理**: 按APP/设备/日期归档
- **数据导入导出**: JSON/CSV格式
- **报告生成**: PDF分析报告

---

## 📁 项目目录结构

### Android App

```text
apps/app-profiler/
├── android/
│   └── ...                         # Android原生代码
├── src/
│   ├── App.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx          # 首页
│   │   ├── MonitorScreen.tsx       # 实时监控
│   │   ├── StartupTestScreen.tsx   # 启动测试
│   │   ├── MemoryScreen.tsx        # 内存分析
│   │   ├── BatteryScreen.tsx       # 电池分析
│   │   ├── AppListScreen.tsx       # APP列表
│   │   ├── RankingScreen.tsx       # 排行榜
│   │   ├── SyncScreen.tsx          # 数据同步
│   │   └── SettingsScreen.tsx      # 设置
│   │
│   ├── components/
│   │   ├── monitor/
│   │   │   ├── CpuChart.tsx        # CPU图表
│   │   │   ├── MemoryChart.tsx     # 内存图表
│   │   │   ├── GpuChart.tsx        # GPU图表
│   │   │   └── MetricCard.tsx      # 指标卡片
│   │   ├── startup/
│   │   │   ├── StartupTimer.tsx    # 启动计时器
│   │   │   └── PhaseBreakdown.tsx  # 阶段分解
│   │   ├── memory/
│   │   │   ├── LeakIndicator.tsx   # 泄漏指示器
│   │   │   └── GcStats.tsx         # GC统计
│   │   ├── app/
│   │   │   ├── AppCard.tsx         # APP卡片
│   │   │   └── AppSelector.tsx     # APP选择器
│   │   └── sync/
│   │       ├── ConnectionStatus.tsx
│   │       └── SyncPanel.tsx
│   │
│   ├── services/
│   │   ├── adb/
│   │   │   ├── AdbService.ts       # ADB服务
│   │   │   ├── CpuMonitor.ts       # CPU监控
│   │   │   ├── MemoryMonitor.ts    # 内存监控
│   │   │   ├── StartupProfiler.ts  # 启动分析
│   │   │   └── BatteryMonitor.ts   # 电池监控
│   │   ├── analysis/
│   │   │   ├── LeakDetector.ts     # 泄漏检测
│   │   │   └── RankingCalculator.ts# 排名计算
│   │   ├── database.ts             # 本地存储
│   │   └── websocket.ts            # WebSocket客户端
│   │
│   ├── hooks/
│   │   ├── useAdb.ts
│   │   ├── useMonitor.ts
│   │   └── useSync.ts
│   │
│   └── utils/
│       └── formatters.ts
│
├── package.json
└── tsconfig.json
```

### 桌面端

```text
apps/app-profiler-desktop/
├── src/
│   ├── main/
│   │   ├── index.ts                # 主进程入口
│   │   ├── websocket.ts            # WebSocket服务器
│   │   ├── database.ts             # SQLite数据库
│   │   ├── discovery.ts            # 设备发现
│   │   └── adb.ts                  # ADB集成(可选)
│   │
│   ├── renderer/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── MonitorPanel.tsx    # 监控面板
│   │   │   ├── CpuChart.tsx        # CPU曲线
│   │   │   ├── MemoryChart.tsx     # 内存曲线
│   │   │   ├── StartupChart.tsx    # 启动时间图
│   │   │   ├── LeakAnalysis.tsx    # 泄漏分析
│   │   │   ├── RankingTable.tsx    # 排行榜表格
│   │   │   ├── CompareView.tsx     # 对比视图
│   │   │   ├── DeviceList.tsx      # 设备列表
│   │   │   └── ExportPanel.tsx     # 导出面板
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx       # 仪表盘
│   │   │   ├── Monitor.tsx         # 实时监控
│   │   │   ├── Startup.tsx         # 启动分析
│   │   │   ├── Memory.tsx          # 内存分析
│   │   │   ├── Battery.tsx         # 电池分析
│   │   │   ├── Ranking.tsx         # APP排行榜
│   │   │   ├── Compare.tsx         # APP对比
│   │   │   ├── Archive.tsx         # 数据存档
│   │   │   └── Settings.tsx        # 设置
│   │   ├── hooks/
│   │   │   ├── useProfilerStore.ts
│   │   │   └── useRanking.ts
│   │   └── styles/
│   │
│   └── preload/
│       └── index.ts
│
├── package.json
└── electron-builder.json
```

---

## 📡 数据传输协议

### WebSocket协议（无线传输）

```typescript
// 连接: ws://desktop_ip:8769

interface ProfilerPacket {
  type: 'monitor_data' | 'startup_result' | 'memory_analysis' | 
        'battery_data' | 'sync_history' | 'device_info' | 'app_list';
  timestamp: number;
  deviceId: string;
  data: MonitorData | StartupResult | MemoryAnalysis | 
        BatteryData | HistoryData[] | DeviceInfo | AppInfo[];
}

interface MonitorData {
  sessionId: string;
  packageName: string;
  appName: string;
  timestamp: number;
  cpu: {
    usage: number;           // 0-100%
    cores: number[];         // 各核心使用率
  };
  memory: {
    rss: number;             // Resident Set Size (KB)
    pss: number;             // Proportional Set Size (KB)
    uss: number;             // Unique Set Size (KB)
    heap: number;            // Java Heap (KB)
    native: number;          // Native Heap (KB)
  };
  gpu: {
    fps: number;
    frameTime: number;       // ms
    jankCount: number;
  };
  network: {
    rxBytes: number;         // 接收字节
    txBytes: number;         // 发送字节
  };
  threads: number;
}

interface StartupResult {
  testId: string;
  packageName: string;
  appName: string;
  testType: 'cold' | 'warm';
  totalTime: number;         // ms
  phases: {
    processStart: number;    // 进程启动
    contentProvider: number; // ContentProvider初始化
    application: number;     // Application创建
    activityCreate: number;  // Activity创建
    firstFrame: number;      // 首帧渲染
  };
  iterations: number;        // 测试次数
  average: number;           // 平均值
  min: number;
  max: number;
  stdDev: number;            // 标准差
}

interface MemoryAnalysis {
  analysisId: string;
  packageName: string;
  appName: string;
  duration: number;          // 监控时长(秒)
  samples: {
    timestamp: number;
    memory: number;          // KB
  }[];
  trend: 'stable' | 'growing' | 'leaking';
  leakRisk: 'low' | 'medium' | 'high';
  gcCount: number;
  gcTime: number;            // 总GC时间
  peakMemory: number;
  avgMemory: number;
}

interface BatteryData {
  sessionId: string;
  packageName: string;
  appName: string;
  duration: number;          // 监控时长(秒)
  startLevel: number;        // 开始电量%
  endLevel: number;          // 结束电量%
  consumption: number;       // 消耗mAh
  rate: number;              // 耗电速率 mAh/hour
  wakelocks: number;         // WakeLock次数
  cpuTime: number;           // CPU时间(ms)
  networkUsage: number;      // 网络流量(bytes)
}

interface AppInfo {
  packageName: string;
  appName: string;
  versionName: string;
  versionCode: number;
  installTime: number;
  lastUpdateTime: number;
  apkSize: number;           // bytes
  dataSize: number;          // bytes
  icon?: string;             // base64
}

interface DeviceInfo {
  model: string;
  manufacturer: string;
  androidVersion: string;
  sdkLevel: number;
  cpuInfo: string;
  totalRam: number;
  availableRam: number;
}
```

### USB传输（ADB）

```text
通过ADB端口转发实现:
1. 桌面端执行: adb forward tcp:8769 tcp:8769
2. Android App启动本地WebSocket服务器
3. 桌面端连接 localhost:8769 进行数据传输
```

---

## 📋 开发任务清单 (TODO List)

### Android App

#### 项目初始化

- [x] 创建React Native项目
- [x] 配置TypeScript
- [x] 配置React Native Paper UI
- [x] 配置react-native-chart-kit
- [x] 配置本地存储 (AsyncStorage/SQLite)
- [x] 配置ADB通信模块
- [x] 配置Shizuku权限 (可选)

#### ADB通信模块

- [x] 实现ADB命令执行封装
- [x] 实现Shell命令解析
- [x] 实现dumpsys数据解析
- [x] 实现进程信息获取
- [x] 实现APP列表获取
- [x] 实现权限检测与申请

#### APP性能监控模块

- [x] 实现CPU使用率监控
- [x] 实现内存使用监控 (PSS/USS/RSS)
- [x] 实现GPU帧率监控
- [x] 实现网络流量监控
- [x] 实现线程数量监控
- [x] 设计实时监控UI
- [x] 设计指标卡片组件

#### 启动时间测试模块

- [x] 实现冷启动时间测量
- [x] 实现热启动时间测量
- [x] 实现首帧渲染时间获取
- [x] 实现启动阶段拆分
- [x] 实现多次测试统计
- [x] 设计启动测试UI
- [x] 设计测试结果展示

#### 内存泄漏检测模块

- [x] 实现长时间内存监控
- [x] 实现内存增长趋势分析
- [x] 实现泄漏风险评估算法
- [x] 实现GC监控统计
- [x] 实现大对象检测 (可选)
- [x] 设计内存分析UI
- [x] 设计泄漏预警组件

#### 电池消耗分析模块

- [x] 实现电池状态监控
- [x] 实现耗电速率计算
- [x] 实现WakeLock统计
- [x] 实现后台耗电分析
- [x] 设计电池分析UI
- [x] 设计耗电报告组件

#### APP管理模块

- [x] 实现已安装APP列表获取
- [x] 实现APP详细信息获取
- [x] 实现APP图标获取
- [x] 实现APP收藏功能
- [x] 设计APP列表UI
- [x] 设计APP详情弹窗

#### 数据存储模块

- [x] 设计本地存储Schema
- [x] 实现监控数据存储
- [x] 实现测试结果存储
- [x] 实现APP信息缓存
- [x] 实现数据导出功能

#### 数据同步模块

- [x] 实现WebSocket客户端
- [x] 实现桌面端自动发现
- [x] 实现实时数据推送
- [x] 实现批量历史同步
- [x] 实现增量同步
- [x] 设计连接状态UI
- [x] 设计同步面板UI

#### UI页面开发

- [x] 首页（概览仪表盘）
- [x] 实时监控页
- [x] 启动时间测试页
- [x] 内存分析页
- [x] 电池分析页
- [x] APP列表页
- [x] 本地排行榜页
- [x] 数据同步页
- [x] 设置页

### 桌面端程序

#### 项目初始化

- [x] 创建Electron + React项目
- [x] 配置TypeScript
- [x] 配置TailwindCSS + shadcn/ui
- [x] 配置Recharts
- [x] 配置SQLite (better-sqlite3)
- [x] 配置electron-builder
- [x] 配置ADB集成 (可选)

#### 通信模块

- [x] 实现WebSocket服务器
- [x] 实现UDP广播发现
- [x] 实现ADB端口转发
- [x] 实现多设备连接管理
- [x] 实现数据接收处理

#### 数据存储模块

- [x] 设计SQLite表结构
- [x] 实现监控数据存储
- [x] 实现测试结果存储
- [x] 实现APP信息存储
- [x] 实现设备档案存储
- [x] 实现数据查询接口

#### 性能监控展示模块

- [x] 实现CPU使用率曲线图
- [x] 实现内存使用曲线图
- [x] 实现GPU帧率曲线图
- [x] 实现网络流量曲线图
- [x] 实现实时数据刷新
- [x] 设计监控面板布局

#### 启动时间分析模块

- [x] 实现启动时间曲线图
- [x] 实现阶段拆分饼图
- [x] 实现多次测试对比
- [x] 实现版本对比功能
- [x] 设计启动分析页面

#### 内存分析模块

- [x] 实现内存趋势图表
- [x] 实现泄漏风险展示
- [x] 实现GC统计展示
- [x] 实现内存快照对比
- [x] 设计内存分析页面

#### 电池分析模块

- [x] 实现耗电曲线图
- [x] 实现WakeLock统计展示
- [x] 实现后台耗电分析
- [x] 设计电池分析页面

#### APP排行榜模块

- [x] 实现综合评分算法
- [x] 实现分类排名算法
- [x] 实现排行榜表格
- [x] 实现历史排名追踪
- [x] 设计排行榜页面

#### 多APP对比模块

- [x] 实现APP选择器
- [x] 实现并排曲线对比
- [x] 实现雷达图对比
- [x] 实现对比数据表
- [x] 设计对比页面布局

#### 数据存档模块

- [x] 实现按APP/设备/日期筛选
- [x] 实现数据导入功能
- [x] 实现JSON/CSV导出
- [x] 实现PDF报告生成
- [x] 设计存档列表UI

#### UI页面开发

- [x] 仪表盘（设备概览+连接状态）
- [x] 实时监控页
- [x] 启动时间分析页
- [x] 内存分析页
- [x] 电池分析页
- [x] APP排行榜页
- [x] APP对比页
- [x] 数据存档页
- [x] 设置页

### 测试与发布

#### 测试

- [ ] Android App功能测试
- [ ] 桌面端功能测试
- [ ] ADB通信稳定性测试
- [ ] 数据传输稳定性测试
- [ ] 多设备并发测试
- [ ] 性能数据准确性验证

#### 发布

- [ ] Android APK打包
- [ ] 桌面端Windows打包
- [ ] 桌面端macOS打包
- [ ] 编写使用文档
- [ ] 开源发布 (MIT协议)

---

## 🔑 核心技术实现

### ADB命令封装

```typescript
class AdbService {
  // 执行Shell命令
  async execShell(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const process = spawn('adb', ['shell', command]);
      let output = '';
      
      process.stdout.on('data', (data) => {
        output += data.toString();
      });
      
      process.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`ADB command failed: ${command}`));
        }
      });
    });
  }
  
  // 获取APP CPU使用率
  async getCpuUsage(packageName: string): Promise<number> {
    const output = await this.execShell(
      `top -n 1 | grep ${packageName}`
    );
    const match = output.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }
  
  // 获取APP内存信息
  async getMemoryInfo(packageName: string): Promise<MemoryInfo> {
    const output = await this.execShell(
      `dumpsys meminfo ${packageName}`
    );
    return this.parseMeminfo(output);
  }
  
  private parseMeminfo(output: string): MemoryInfo {
    const lines = output.split('\n');
    const result: MemoryInfo = { pss: 0, uss: 0, rss: 0, heap: 0, native: 0 };
    
    for (const line of lines) {
      if (line.includes('TOTAL PSS:')) {
        const match = line.match(/(\d+)/);
        result.pss = match ? parseInt(match[1]) : 0;
      }
      if (line.includes('TOTAL USS:')) {
        const match = line.match(/(\d+)/);
        result.uss = match ? parseInt(match[1]) : 0;
      }
      // ... 解析其他字段
    }
    
    return result;
  }
}
```

### 启动时间测量

```typescript
class StartupProfiler {
  private adb: AdbService;
  
  // 冷启动测试
  async coldStartTest(packageName: string, activity: string): Promise<StartupResult> {
    // 强制停止APP
    await this.adb.execShell(`am force-stop ${packageName}`);
    await this.sleep(1000);
    
    // 清除缓存
    await this.adb.execShell(`pm clear ${packageName}`);
    await this.sleep(500);
    
    // 启动APP并测量时间
    const startTime = Date.now();
    const output = await this.adb.execShell(
      `am start-activity -W -n ${packageName}/${activity}`
    );
    
    return this.parseStartupOutput(output, startTime);
  }
  
  // 热启动测试
  async warmStartTest(packageName: string, activity: string): Promise<StartupResult> {
    // 先冷启动一次
    await this.coldStartTest(packageName, activity);
    await this.sleep(2000);
    
    // 按Home键回到桌面
    await this.adb.execShell('input keyevent KEYCODE_HOME');
    await this.sleep(1000);
    
    // 再次启动
    const startTime = Date.now();
    const output = await this.adb.execShell(
      `am start-activity -W -n ${packageName}/${activity}`
    );
    
    return this.parseStartupOutput(output, startTime);
  }
  
  private parseStartupOutput(output: string, startTime: number): StartupResult {
    // 解析 am start-activity 输出
    // TotalTime: xxx
    // WaitTime: xxx
    const totalMatch = output.match(/TotalTime:\s*(\d+)/);
    const waitMatch = output.match(/WaitTime:\s*(\d+)/);
    
    return {
      totalTime: totalMatch ? parseInt(totalMatch[1]) : 0,
      waitTime: waitMatch ? parseInt(waitMatch[1]) : 0,
      actualTime: Date.now() - startTime,
    };
  }
  
  // 多次测试取平均
  async runMultipleTests(
    packageName: string, 
    activity: string, 
    iterations: number = 5,
    type: 'cold' | 'warm' = 'cold'
  ): Promise<StartupResult> {
    const results: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const result = type === 'cold' 
        ? await this.coldStartTest(packageName, activity)
        : await this.warmStartTest(packageName, activity);
      results.push(result.totalTime);
      await this.sleep(2000);
    }
    
    return {
      iterations,
      average: results.reduce((a, b) => a + b) / results.length,
      min: Math.min(...results),
      max: Math.max(...results),
      stdDev: this.calculateStdDev(results),
    };
  }
}
```

### 内存泄漏检测

```typescript
class LeakDetector {
  private samples: { timestamp: number; memory: number }[] = [];
  
  // 添加内存采样点
  addSample(memory: number) {
    this.samples.push({
      timestamp: Date.now(),
      memory,
    });
  }
  
  // 分析内存趋势
  analyzeTrend(): MemoryAnalysis {
    if (this.samples.length < 10) {
      return { trend: 'stable', leakRisk: 'low' };
    }
    
    // 线性回归计算斜率
    const slope = this.calculateSlope();
    const avgMemory = this.samples.reduce((a, b) => a + b.memory, 0) / this.samples.length;
    
    // 斜率阈值判断
    const slopeRatio = slope / avgMemory;
    
    if (slopeRatio > 0.001) {
      return { 
        trend: 'leaking', 
        leakRisk: slopeRatio > 0.005 ? 'high' : 'medium',
        slope,
        avgMemory,
      };
    } else if (slopeRatio > 0.0001) {
      return { trend: 'growing', leakRisk: 'low', slope, avgMemory };
    } else {
      return { trend: 'stable', leakRisk: 'low', slope, avgMemory };
    }
  }
  
  private calculateSlope(): number {
    const n = this.samples.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      const x = i;
      const y = this.samples[i].memory;
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumX2 += x * x;
    }
    
    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  }
}
```

### APP排名算法

```typescript
class RankingCalculator {
  // 计算综合评分
  calculateScore(app: AppMetrics): number {
    const weights = {
      startup: 0.25,      // 启动时间
      memory: 0.25,       // 内存使用
      cpu: 0.20,          // CPU使用
      battery: 0.20,      // 电池消耗
      stability: 0.10,    // 稳定性
    };
    
    // 各项评分 (0-100, 越高越好)
    const startupScore = this.normalizeStartup(app.avgStartupTime);
    const memoryScore = this.normalizeMemory(app.avgMemory);
    const cpuScore = this.normalizeCpu(app.avgCpu);
    const batteryScore = this.normalizeBattery(app.batteryRate);
    const stabilityScore = app.crashRate === 0 ? 100 : 100 - app.crashRate * 10;
    
    return (
      startupScore * weights.startup +
      memoryScore * weights.memory +
      cpuScore * weights.cpu +
      batteryScore * weights.battery +
      stabilityScore * weights.stability
    );
  }
  
  // 启动时间评分 (假设1000ms以下为优秀)
  private normalizeStartup(time: number): number {
    if (time <= 500) return 100;
    if (time >= 5000) return 0;
    return 100 - ((time - 500) / 4500) * 100;
  }
  
  // 内存使用评分
  private normalizeMemory(memory: number): number {
    // memory in KB
    if (memory <= 50000) return 100;      // < 50MB 优秀
    if (memory >= 500000) return 0;       // > 500MB 差
    return 100 - ((memory - 50000) / 450000) * 100;
  }
  
  // 生成排行榜
  generateRanking(apps: AppMetrics[]): RankedApp[] {
    return apps
      .map(app => ({
        ...app,
        score: this.calculateScore(app),
      }))
      .sort((a, b) => b.score - a.score)
      .map((app, index) => ({
        ...app,
        rank: index + 1,
      }));
  }
}
```

### 数据同步

```typescript
class ProfilerSyncClient {
  private ws: WebSocket | null = null;
  
  async connect(serverUrl: string) {
    this.ws = new WebSocket(serverUrl);
    
    this.ws.onclose = () => {
      setTimeout(() => this.connect(serverUrl), 3000);
    };
  }
  
  // 同步监控数据
  sendMonitorData(data: MonitorData) {
    this.send({
      type: 'monitor_data',
      timestamp: Date.now(),
      deviceId: this.getDeviceId(),
      data: data
    });
  }
  
  // 同步启动测试结果
  sendStartupResult(result: StartupResult) {
    this.send({
      type: 'startup_result',
      timestamp: Date.now(),
      deviceId: this.getDeviceId(),
      data: result
    });
  }
  
  // 同步内存分析
  sendMemoryAnalysis(analysis: MemoryAnalysis) {
    this.send({
      type: 'memory_analysis',
      timestamp: Date.now(),
      deviceId: this.getDeviceId(),
      data: analysis
    });
  }
  
  // 批量同步历史
  async syncHistory(records: any[]) {
    this.send({
      type: 'sync_history',
      timestamp: Date.now(),
      deviceId: this.getDeviceId(),
      data: records
    });
  }
  
  private send(packet: ProfilerPacket) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(packet));
    }
  }
}
```

---

## ⚠️ 技术风险与解决方案

### 风险1: ADB权限限制

**问题**: 普通APP无法直接执行ADB命令

**解决方案**:
1. 使用Shizuku提供ADB权限
2. 提供Root模式支持
3. 部分功能降级使用系统API
4. 文档说明开启USB调试

### 风险2: 数据采集准确性

**问题**: top/dumpsys数据可能有延迟或不准确

**解决方案**:
1. 多次采样取平均值
2. 使用更精确的/proc文件读取
3. 标注数据可能的误差范围
4. 提供数据校验机制

### 风险3: 后台运行限制

**问题**: Android后台限制可能影响长时间监控

**解决方案**:
1. 使用前台服务保持运行
2. 利用WorkManager定时采集
3. 提示用户设置电池优化白名单
4. 支持短时间集中测试模式

### 风险4: 不同Android版本兼容

**问题**: 不同版本的dumpsys输出格式可能不同

**解决方案**:
1. 针对主流版本(Android 10+)优先适配
2. 多种解析策略fallback
3. 使用Version API适配
4. 提供版本兼容性说明

---

## 📊 验收标准

### 功能验收

- [ ] CPU/内存/GPU监控数据正确
- [ ] 启动时间测量误差<50ms
- [ ] 内存泄漏检测准确率>80%
- [ ] 电池消耗数据与系统一致
- [ ] 数据同步延迟<1s
- [ ] APP排行榜评分合理

### 性能验收

- [ ] 监控对系统性能影响<5%
- [ ] App启动时间<2s
- [ ] 数据采集频率可达1次/秒
- [ ] 桌面端内存<300MB

### 兼容性验收

- [ ] Android 10/11/12/13/14
- [ ] 主流厂商ROM适配
- [ ] Windows 10/11
- [ ] macOS 10.15+

---

## 📚 参考资料

1. [Android Debug Bridge (ADB)](https://developer.android.com/studio/command-line/adb)
2. [dumpsys命令详解](https://developer.android.com/studio/command-line/dumpsys)
3. [Shizuku权限框架](https://shizuku.rikka.app/)
4. [React Native](https://reactnative.dev/)
5. [Recharts](https://recharts.org/)
6. [Electron](https://www.electronjs.org/)

---

## 📝 更新日志

| 日期       | 版本 | 更新内容       |
| ---------- | ---- | -------------- |
| 2025-12-28 | v0.1 | 初始文档创建   |
| 2025-01-XX | v0.5 | 桌面端开发完成 |
| 2025-01-XX | v0.8 | Android App开发完成 |
| 2025-XX-XX | v1.0 | App和桌面端开发完成 |

---

**文档维护者**: 开发团队  
**最后更新**: 2025年12月28日

# 电池续航分析工具

一款 Android 原生应用，用于专业级电池续航测试与分析。

## 功能特性

### 📊 实时电池监控
- 电量百分比显示
- 充电状态（充电中/放电中/已充满）
- 电池温度监控
- 电压/电流显示
- 电池健康状态

### 🔋 自动化续航测试
- **视频播放**: 模拟刷视频/看剧
- **游戏模式**: 重度游戏使用
- **社交日常**: 微信/微博等
- **阅读模式**: 电子书/新闻
- **网页浏览**: 上网冲浪
- **综合使用**: 混合场景
- **待机测试**: 纯待机消耗
- **通话测试**: 模拟长通话

### 📈 数据分析
- 续航时间计算
- 放电速率分析
- 剩余时间预测
- 温度曲线分析
- 历史记录对比

### 📄 测试报告
- 详细测试数据
- 电量变化曲线
- 温度变化曲线
- 设备信息汇总
- **PDF导出**: 生成专业测试报告
- **JSON/CSV导出**: 原始数据导出
- **分享功能**: 一键分享报告

## 技术栈

- **语言**: Kotlin
- **UI**: Jetpack Compose + Material 3
- **架构**: MVVM + Clean Architecture
- **依赖注入**: Hilt
- **数据库**: Room
- **图表**: Vico Charts
- **最低版本**: Android 8.0 (API 26)

## 权限说明

| 权限 | 用途 |
|------|------|
| FOREGROUND_SERVICE | 后台持续监控电池 |
| WAKE_LOCK | 防止测试中断 |
| REQUEST_IGNORE_BATTERY_OPTIMIZATIONS | 防止被系统杀死 |
| SYSTEM_ALERT_WINDOW | 悬浮窗显示进度 |
| QUERY_ALL_PACKAGES | 启动测试目标应用 |
| AccessibilityService | 自动化操作 |

## 使用方法

1. 安装应用后，首先在设置中开启**无障碍服务**
2. 将应用添加到**电池优化白名单**
3. 充电至 95% 以上
4. 选择测试场景，点击开始测试
5. 等待测试完成，查看报告

## 项目结构

```
app/src/main/java/com/shavingtools/battery/
├── BatteryMonitorApp.kt      # Application
├── MainActivity.kt           # 主Activity
├── data/                     # 数据层
│   ├── local/               # Room数据库
│   └── repository/          # Repository
├── domain/                   # 业务逻辑层
│   ├── model/               # 领域模型
│   ├── usecase/             # 用例
│   ├── analyzer/            # 分析器
│   └── export/              # 数据导出
├── service/                  # 后台服务
│   ├── BatteryMonitorService.kt
│   ├── AutomationService.kt
│   └── TestExecutorService.kt
├── ui/                       # UI层
│   ├── theme/               # 主题
│   ├── components/          # 组件
│   ├── screens/             # 页面
│   ├── viewmodel/           # ViewModel
│   └── navigation/          # 导航
├── util/                     # 工具类
│   ├── BatteryUtils.kt
│   ├── Constants.kt
│   └── PermissionHelper.kt
├── receiver/                 # 广播接收器
└── di/                       # 依赖注入
```

## 构建

在 Android Studio 中打开 `apps/battery-monitor` 目录，同步 Gradle 后即可构建。

```bash
./gradlew assembleDebug
```

## 注意事项

- 不同厂商 ROM 可能需要额外设置自启动权限
- 某些设备需要手动关闭省电模式
- 测试过程中请勿手动操作手机

## 开发进度

- [x] 项目基础架构
- [x] 电池监控服务
- [x] Room数据库
- [x] 自动化测试引擎
- [x] UI界面 (Dashboard/Test/History/Settings/Report)
- [x] 数据导出 (JSON/CSV)
- [x] PDF报告生成
- [x] 单元测试
- [ ] 真机测试
- [ ] 性能优化
- [ ] 发布准备

## 许可证

MIT License

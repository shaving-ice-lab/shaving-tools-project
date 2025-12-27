# 游戏帧率监控工具 - Android端

实时监控Android设备上游戏的FPS和性能数据，并通过WebSocket传输到桌面端进行分析。

## 功能特性

- **实时FPS监控**: 使用Choreographer精确采集帧率数据
- **性能数据采集**: CPU使用率、内存占用、设备温度
- **悬浮窗显示**: 游戏内实时显示FPS悬浮窗
- **数据传输**: 通过WebSocket将数据实时传输到桌面端
- **本地存储**: 使用Room数据库存储历史测试数据

## 技术栈

- **Kotlin**: 开发语言
- **Jetpack Compose**: UI框架
- **Hilt**: 依赖注入
- **Room**: 本地数据库
- **OkHttp/WebSocket**: 网络通信
- **Vico**: 图表库

## 项目结构

```
app/src/main/java/com/shavingtools/fpsmonitor/
├── FpsMonitorApp.kt          # Application类
├── MainActivity.kt           # 主Activity
├── di/                       # 依赖注入模块
│   └── AppModule.kt
├── domain/model/             # 数据模型
│   └── FrameData.kt
├── data/
│   ├── local/                # 本地数据库
│   │   ├── FpsDatabase.kt
│   │   ├── entity/
│   │   └── dao/
│   └── remote/               # 远程通信
│       └── WebSocketClient.kt
├── service/                  # 后台服务
│   ├── FpsCollectorService.kt
│   └── OverlayService.kt
└── ui/                       # UI层
    ├── theme/
    ├── navigation/
    └── screens/
        ├── home/
        ├── monitor/
        ├── history/
        └── settings/
```

## 环境要求

- Android Studio Hedgehog或更高版本
- JDK 17
- Android SDK 34
- 设备需支持Android 8.0 (API 26) 或更高版本

## 构建和运行

1. 使用Android Studio打开 `android` 目录
2. 同步Gradle项目
3. 连接Android设备或启动模拟器
4. 点击运行按钮

## 权限说明

- `FOREGROUND_SERVICE`: 前台服务运行权限
- `SYSTEM_ALERT_WINDOW`: 悬浮窗权限
- `INTERNET`: 网络通信权限
- `POST_NOTIFICATIONS`: 通知权限

## 使用说明

1. 启动应用，授予必要权限
2. 在设置中配置桌面端IP和端口
3. 点击"开始监控"按钮
4. 切换到游戏，悬浮窗将显示实时FPS
5. 数据会自动同步到桌面端

## 许可证

MIT License

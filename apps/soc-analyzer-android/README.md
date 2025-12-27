# SoC Analyzer Android - 芯片性能深度分析平台

Android端数据采集应用，负责采集SoC芯片信息并通过WebSocket发送到PC端。

## 功能特性

- **芯片信息采集**: CPU/GPU架构、频率、制程信息
- **实时监控**: CPU/GPU使用率、频率、温度、功耗
- **性能跑分**: CPU单核/多核、GPU、AI/NPU跑分
- **压力测试**: 持续满载测试，检测降频和温度墙
- **连接管理**: 支持无线WiFi、有线ADB、扫码三种连接方式

## 技术栈

- **语言**: Kotlin
- **UI框架**: Jetpack Compose + Material 3
- **架构**: MVVM + Clean Architecture
- **DI**: Hilt
- **网络**: OkHttp + Ktor WebSocket
- **序列化**: kotlinx.serialization

## 快速开始

### 环境要求

- Android Studio Hedgehog 或更高版本
- JDK 17
- Android SDK 34
- Kotlin 1.9.21

### 构建运行

1. 使用Android Studio打开项目
2. 同步Gradle依赖
3. 连接Android设备或启动模拟器
4. 点击Run运行应用

### 生成APK

```bash
./gradlew assembleRelease
```

## 项目结构

```
soc-analyzer-android/
├── app/
│   ├── src/main/
│   │   ├── java/com/socanalyzer/app/
│   │   │   ├── data/
│   │   │   │   ├── collector/       # 数据采集模块
│   │   │   │   └── model/           # 数据模型
│   │   │   ├── di/                  # Hilt依赖注入
│   │   │   ├── service/             # 后台服务
│   │   │   └── ui/                  # UI界面
│   │   │       ├── screens/         # 页面
│   │   │       ├── theme/           # 主题
│   │   │       └── viewmodel/       # ViewModel
│   │   ├── res/                     # 资源文件
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
├── gradle/
│   └── libs.versions.toml           # 版本目录
├── build.gradle.kts
└── settings.gradle.kts
```

## 连接方式

### 无线连接 (WiFi)

1. 确保手机和PC在同一局域网
2. 输入PC端显示的IP地址和端口
3. 点击连接

### 有线连接 (ADB)

1. 使用USB数据线连接手机
2. 开启USB调试
3. 在PC端运行: `adb forward tcp:8765 tcp:8765`
4. 选择有线模式连接

### 扫码连接

1. PC端显示连接二维码
2. 手机端扫描二维码自动连接

## 权限说明

- `INTERNET`: 网络连接
- `ACCESS_NETWORK_STATE`: 网络状态检测
- `ACCESS_WIFI_STATE`: WiFi状态检测
- `CAMERA`: 扫描二维码
- `FOREGROUND_SERVICE`: 后台数据采集
- `WAKE_LOCK`: 防止休眠中断数据采集

## License

MIT

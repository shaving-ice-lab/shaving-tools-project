package com.shavingtools.battery.domain.model

data class TestScenario(
    val id: String,
    val name: String,
    val description: String,
    val iconRes: Int,
    val steps: List<TestStep>,
    val durationMinutes: Long? = null,
    val brightness: Int = 128,
    val volumeLevel: Float = 0.5f,
    val keepScreenOn: Boolean = true
)

sealed class TestStep {
    data class LaunchApp(val packageName: String, val displayName: String) : TestStep()
    data class Wait(val durationMs: Long) : TestStep()
    data class Swipe(val direction: SwipeDirection) : TestStep()
    data class Click(val xPercent: Float, val yPercent: Float) : TestStep()
    data class PlayVideo(val source: VideoSource) : TestStep()
    data class ScrollPage(val times: Int) : TestStep()
    data object LockScreen : TestStep()
    data object UnlockScreen : TestStep()
    data object GoHome : TestStep()
}

enum class SwipeDirection {
    UP, DOWN, LEFT, RIGHT
}

sealed class VideoSource {
    data object LocalSample : VideoSource()
    data class Url(val url: String) : VideoSource()
}

object TestScenarios {
    val VIDEO_PLAYBACK = TestScenario(
        id = "video_playback",
        name = "视频播放",
        description = "模拟刷视频/看剧场景，亮度50%，音量50%",
        iconRes = 0,
        brightness = 128,
        volumeLevel = 0.5f,
        keepScreenOn = true,
        steps = listOf(
            TestStep.PlayVideo(VideoSource.LocalSample),
            TestStep.Wait(300_000),
            TestStep.Swipe(SwipeDirection.UP),
            TestStep.Wait(300_000)
        )
    )

    val GAMING = TestScenario(
        id = "gaming",
        name = "游戏模式",
        description = "重度游戏使用，最高亮度，性能模式",
        iconRes = 0,
        brightness = 255,
        volumeLevel = 0.7f,
        keepScreenOn = true,
        steps = listOf(
            TestStep.Wait(60_000),
            TestStep.Swipe(SwipeDirection.UP),
            TestStep.Click(0.5f, 0.5f),
            TestStep.Wait(60_000)
        )
    )

    val SOCIAL = TestScenario(
        id = "social",
        name = "社交日常",
        description = "微信/微博等社交应用使用",
        iconRes = 0,
        brightness = 128,
        volumeLevel = 0.3f,
        keepScreenOn = true,
        steps = listOf(
            TestStep.Wait(30_000),
            TestStep.ScrollPage(5),
            TestStep.Wait(30_000),
            TestStep.Swipe(SwipeDirection.DOWN)
        )
    )

    val READING = TestScenario(
        id = "reading",
        name = "阅读模式",
        description = "电子书/新闻阅读，低亮度，定时翻页",
        iconRes = 0,
        brightness = 64,
        volumeLevel = 0f,
        keepScreenOn = true,
        steps = listOf(
            TestStep.Wait(60_000),
            TestStep.Swipe(SwipeDirection.LEFT),
            TestStep.Wait(60_000)
        )
    )

    val WEB_BROWSING = TestScenario(
        id = "web_browsing",
        name = "网页浏览",
        description = "上网冲浪，自动滚动加载网页",
        iconRes = 0,
        brightness = 128,
        volumeLevel = 0.3f,
        keepScreenOn = true,
        steps = listOf(
            TestStep.Wait(20_000),
            TestStep.ScrollPage(3),
            TestStep.Wait(20_000),
            TestStep.Swipe(SwipeDirection.DOWN)
        )
    )

    val COMPREHENSIVE = TestScenario(
        id = "comprehensive",
        name = "综合使用",
        description = "模拟真实日常使用，混合多种场景",
        iconRes = 0,
        brightness = 128,
        volumeLevel = 0.5f,
        keepScreenOn = true,
        steps = listOf(
            TestStep.Wait(120_000),
            TestStep.ScrollPage(3),
            TestStep.Wait(60_000),
            TestStep.Swipe(SwipeDirection.UP),
            TestStep.Wait(120_000),
            TestStep.GoHome
        )
    )

    val STANDBY = TestScenario(
        id = "standby",
        name = "待机测试",
        description = "纯待机消耗，锁屏静置测试待机时间",
        iconRes = 0,
        brightness = 0,
        volumeLevel = 0f,
        keepScreenOn = false,
        steps = listOf(
            TestStep.LockScreen,
            TestStep.Wait(600_000)
        )
    )

    val CALL = TestScenario(
        id = "call",
        name = "通话测试",
        description = "模拟长时间通话，播放音频",
        iconRes = 0,
        brightness = 64,
        volumeLevel = 0.7f,
        keepScreenOn = true,
        steps = listOf(
            TestStep.Wait(300_000)
        )
    )

    val ALL = listOf(
        VIDEO_PLAYBACK,
        GAMING,
        SOCIAL,
        READING,
        WEB_BROWSING,
        COMPREHENSIVE,
        STANDBY,
        CALL
    )
}

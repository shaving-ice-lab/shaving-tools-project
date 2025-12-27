# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.kts.

# Keep WebSocket classes
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# Keep data classes
-keep class com.shavingtools.fpsmonitor.domain.model.** { *; }

# Build NextUps Android APK Script
$ErrorActionPreference = "Stop"

$gradleBat = (Get-ChildItem "C:\Users\L\.gradle\wrapper\dists\gradle-*\*\*\bin\gradle.bat" | Select-Object -First 1).FullName
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\L\AppData\Local\Android\Sdk"

Write-Host "==> Using Gradle: $gradleBat"
Write-Host "==> Using JAVA_HOME: $env:JAVA_HOME"
Write-Host "==> Using ANDROID_HOME: $env:ANDROID_HOME"

cd "android-app"
& $gradleBat assembleDebug --no-daemon

$apkSource = "app\build\outputs\apk\debug\app-debug.apk"
$apkTarget = "..\public\downloads\NextUps-v1.0.0.apk"

if (Test-Path $apkSource) {
    Copy-Item -Force $apkSource $apkTarget
    $apkSize = (Get-Item $apkTarget).Length
    Write-Host "`nSUCCESS: Android APK built successfully at $apkTarget ($apkSize bytes)"
} else {
    throw "APK output not found at $apkSource"
}

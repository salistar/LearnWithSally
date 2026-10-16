param(
  [string]$OutputDirectory = (Join-Path $PSScriptRoot '../dist-android'),
  [string]$Architectures = 'arm64-v8a,armeabi-v7a'
)
$ErrorActionPreference = 'Stop'
$projectDirectory = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
if (-not $env:ANDROID_HOME -or -not (Test-Path -LiteralPath $env:ANDROID_HOME)) { throw 'Configure ANDROID_HOME with an installed Android SDK.' }
if (-not $env:EXPO_PUBLIC_API_URL) { throw 'Set EXPO_PUBLIC_API_URL to the API server URL before building (USB local: http://127.0.0.1:8097 with adb reverse tcp:8097 tcp:8097).' }
Push-Location $projectDirectory
try {
  npx expo prebuild --platform android --no-install
  if ($LASTEXITCODE) { throw 'Expo prebuild failed.' }
  $availableDrive = @('L','M','N','O','P','Q','R') | Where-Object { -not (Test-Path "${_}:\") } | Select-Object -First 1
  if (-not $availableDrive) { throw 'No free temporary drive letter.' }
  # Short temp path for Java's Windows socket paths. Keep Gradle on the real
  # project path: mixing substituted and canonical drive roots breaks codegen.
  subst "${availableDrive}:" $projectDirectory
  $mappedProject = "${availableDrive}:\"
  $savedTemp = $env:TEMP; $savedTmp = $env:TMP; $savedJavaOptions = $env:JAVA_TOOL_OPTIONS; $savedNodeEnv = $env:NODE_ENV; $savedBuildRoot = $env:LWS_ANDROID_BUILD_ROOT
  try {
    $temporaryDirectory = Join-Path $mappedProject '.tmp'
    New-Item -ItemType Directory -Force $temporaryDirectory | Out-Null
    $env:TEMP = $temporaryDirectory; $env:TMP = $temporaryDirectory
    $env:JAVA_TOOL_OPTIONS = "$savedJavaOptions -Djava.io.tmpdir=$temporaryDirectory"
    $env:NODE_ENV = 'production'
    $env:LWS_ANDROID_BUILD_ROOT = Join-Path $temporaryDirectory 'cxx'
    & "$projectDirectory/android/gradlew.bat" -p "$projectDirectory/android" -I "$PSScriptRoot/android-local.init.gradle" assembleRelease bundleRelease "-PreactNativeArchitectures=$Architectures" --max-workers=2 --console=plain
    if ($LASTEXITCODE) { throw 'Android build failed.' }
    New-Item -ItemType Directory -Force $OutputDirectory | Out-Null
    Copy-Item android/app/build/outputs/apk/release/app-release.apk (Join-Path $OutputDirectory 'LearnWithSally-local.apk')
    Copy-Item android/app/build/outputs/bundle/release/app-release.aab (Join-Path $OutputDirectory 'LearnWithSally-local.aab')
    Get-FileHash (Join-Path $OutputDirectory '*') -Algorithm SHA256
    Write-Warning 'Local test artifacts use the Expo debug signing certificate. Configure your upload keystore before publishing to Google Play.'
  } finally {
    $env:TEMP = $savedTemp; $env:TMP = $savedTmp; $env:JAVA_TOOL_OPTIONS = $savedJavaOptions; $env:NODE_ENV = $savedNodeEnv
    $env:LWS_ANDROID_BUILD_ROOT = $savedBuildRoot
    subst "${availableDrive}:" /D
  }
} finally { Pop-Location }

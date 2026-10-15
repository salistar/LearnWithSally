# Creates / updates the .env file by asking for each key.
# Usage (PowerShell, from the project root):  ./scripts/setup-env.ps1
# Keys are typed locally and written only to .env (ignored by Git).

$ErrorActionPreference = "Stop"
$envFile = Join-Path $PSScriptRoot "..\.env"

$current = @{}
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*([A-Z0-9_]+)\s*=\s*(.*)$') { $current[$Matches[1]] = $Matches[2] }
  }
}

$vars = @(
  @{ Name = "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY"; Help = "Clerk > Configure > API keys > Publishable key (pk_test_...)"; Secret = $false },
  @{ Name = "CLERK_SECRET_KEY"; Help = "Clerk > Configure > API keys > Secret key (sk_test_...)"; Secret = $true },
  @{ Name = "STREAM_API_KEY"; Help = "dashboard.getstream.io > your app > Key"; Secret = $false },
  @{ Name = "STREAM_API_SECRET"; Help = "dashboard.getstream.io > your app > Secret"; Secret = $true },
  @{ Name = "OPENAI_API_KEY"; Help = "platform.openai.com/api-keys > Create new secret key (sk-...)"; Secret = $true },
  @{ Name = "POSTHOG_PROJECT_TOKEN"; Help = "PostHog > Project settings > Project API key (phc_...) - optional"; Secret = $false },
  @{ Name = "POSTHOG_HOST"; Help = "https://eu.i.posthog.com or https://us.i.posthog.com - optional"; Secret = $false },
  @{ Name = "VISION_AGENT_URL"; Help = "Python teacher URL seen by the Expo server"; Secret = $false; Default = "http://localhost:8000" }
)

foreach ($v in $vars) {
  $existing = $current[$v.Name]
  if (-not $existing -and $v.Default) { $existing = $v.Default }
  $shown = if ($existing) { if ($v.Secret) { "(already set, Enter to keep)" } else { "[$existing]" } } else { "" }
  Write-Host ""
  Write-Host "$($v.Name)  -  $($v.Help)" -ForegroundColor Cyan
  if ($v.Secret) {
    $secure = Read-Host "Value $shown" -AsSecureString
    $value = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))
  } else {
    $value = Read-Host "Value $shown"
  }
  if ($value) { $current[$v.Name] = $value.Trim() } elseif ($existing) { $current[$v.Name] = $existing }
}

$lines = $vars | Where-Object { $current[$_.Name] } | ForEach-Object { "$($_.Name)=$($current[$_.Name])" }
Set-Content -Path $envFile -Value $lines -Encoding UTF8
Write-Host ""
Write-Host ".env written. Now run:  npm run check:env" -ForegroundColor Green

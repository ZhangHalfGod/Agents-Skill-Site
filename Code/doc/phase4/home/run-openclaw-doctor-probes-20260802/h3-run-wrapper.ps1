# h3-run-wrapper.ps1 - invoke cursor-agent index.js directly (PS5.1-safe arg passing)
# usage: powershell -NoProfile -File h3-run-wrapper.ps1 -WorkDir <repo> -Goal <goalFile> [-TimeoutSec 1200]
param(
  [Parameter(Mandatory = $true)][string]$WorkDir,
  [Parameter(Mandatory = $true)][string]$Goal,
  [int]$TimeoutSec = 1200
)
$ErrorActionPreference = 'Stop'

# Load WorkDir\.env (existing process env vars take priority)
$envFile = Join-Path $WorkDir '.env'
if (Test-Path -LiteralPath $envFile) {
  Get-Content -LiteralPath $envFile -Encoding UTF8 | ForEach-Object {
    if ($_ -match '^\s*#' -or $_ -match '^\s*$') { return }
    $i = $_.IndexOf('=')
    if ($i -lt 1) { return }
    $k = $_.Substring(0, $i).Trim()
    $v = $_.Substring($i + 1).Trim()
    if (-not [string]::IsNullOrWhiteSpace($k) -and -not (Get-Item -Path "Env:$k" -ErrorAction SilentlyContinue)) {
      Set-Item -Path "Env:$k" -Value $v
    }
  }
}

$goal = [System.IO.File]::ReadAllText((Resolve-Path -LiteralPath $Goal).Path, [System.Text.UTF8Encoding]::new($false))

$scriptPath = 'C:\Users\Administrator\AppData\Local\cursor-agent'
$versionDir = Get-ChildItem -Path "$scriptPath\versions" -Directory |
  Where-Object { $_.Name -match '^\d{4}\.\d{1,2}\.\d{1,2}(-\d{2}-\d{2}-\d{2})?-[a-f0-9]+$' } |
  Sort-Object Name -Descending | Select-Object -First 1
if (-not $versionDir) { throw "no cursor-agent version found under $scriptPath\versions" }
$nodePath = Join-Path $versionDir.FullName 'node.exe'
$indexJs = Join-Path $versionDir.FullName 'index.js'

Write-Host "[h3-run-wrapper] WorkDir=$WorkDir node=$nodePath"
$sw = [System.Diagnostics.Stopwatch]::StartNew()
& $nodePath $indexJs '-p' '--trust' '--force' '--approve-mcps' '--workspace' $WorkDir '--output-format' 'text' $goal
$code = $LASTEXITCODE
$sw.Stop()
Write-Host "[h3-run-wrapper] exit=$code elapsedSec=$([math]::Round($sw.Elapsed.TotalSeconds,1))"
exit $code

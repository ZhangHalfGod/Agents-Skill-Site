#Requires -Version 5.1
<#
.SYNOPSIS
  Home：注册 weekly-lesson-digest（周一 09:00 → 飞书群）。

.DESCRIPTION
  必须用 -Encoding UTF8 读消息文件（PS 5.1 默认 ANSI 会乱码）。
  注册成功后请把 UUID 记到同目录 README「本机 job」表。

.PARAMETER FeishuTo
  飞书投递 target（与 openclaw cron --to 相同，例如 chat:oc_xxxx）。

.EXAMPLE
  .\register-weekly-lesson-digest.ps1 -FeishuTo "chat:oc_xxxxxxxx"
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)][string]$FeishuTo,
  [string]$JobName = 'weekly-lesson-digest',
  [string]$CronExpr = '0 9 * * 1',
  [string]$Tz = 'Asia/Shanghai',
  [string]$Agent = 'main',
  [int]$TimeoutSeconds = 600
)

$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$msgFile = Join-Path $here 'weekly-lesson-digest.message.md'
if (-not (Test-Path -LiteralPath $msgFile)) {
  throw "message file not found: $msgFile"
}

# ⚠ PS 5.1：必须 -Encoding UTF8
$msg = Get-Content -LiteralPath $msgFile -Raw -Encoding UTF8

Write-Host "Registering cron job '$JobName' -> feishu $FeishuTo ..."
# OpenClaw 2026.5.x：必须 --name（无位置参数名）
openclaw cron add --name $JobName --cron $CronExpr --tz $Tz `
  --agent $Agent --session isolated --message $msg --thinking off `
  --timeout-seconds $TimeoutSeconds `
  --announce --channel feishu --to $FeishuTo --exact
if ($LASTEXITCODE -ne 0) {
  throw "openclaw cron add failed with exit $LASTEXITCODE"
}

Write-Host ""
Write-Host "Done. Run: openclaw cron list"
$json = openclaw cron list --json 2>&1 | Out-String
$id = $null
try {
  $obj = $json | ConvertFrom-Json
  $hit = @($obj.jobs) | Where-Object { $_.name -eq $JobName } | Select-Object -First 1
  if ($hit) { $id = $hit.id }
} catch { }

if ($id) {
  Set-Content -LiteralPath (Join-Path $here 'job-id.txt') -Value $id -Encoding UTF8
  Write-Host "Wrote job-id.txt: $id"
  Write-Host "Also paste UUID into: $here\README.md (本机 job table)"
} else {
  Write-Host "Copy the UUID into: $here\job-id.txt and README.md (本机 job table)"
}

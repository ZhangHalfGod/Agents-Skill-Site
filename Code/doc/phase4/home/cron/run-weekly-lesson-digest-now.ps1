#Requires -Version 5.1
<#
.SYNOPSIS
  Home：立即跑一次 weekly-lesson-digest（会真实推飞书群）。

.PARAMETER JobId
  cron job UUID（默认读同目录 job-id.txt；也可手动传入）。
#>
[CmdletBinding()]
param(
  [string]$JobId = ''
)

$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
if (-not $JobId) {
  $idFile = Join-Path $here 'job-id.txt'
  if (Test-Path -LiteralPath $idFile) {
    $JobId = (Get-Content -LiteralPath $idFile -Raw -Encoding UTF8).Trim()
  }
}
if (-not $JobId) {
  throw "Pass -JobId <uuid> or write UUID into $here\job-id.txt"
}

Write-Host "Running cron job $JobId (will announce to Feishu) ..."
openclaw cron run $JobId
openclaw cron get $JobId

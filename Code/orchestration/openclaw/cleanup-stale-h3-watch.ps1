# 关闭误登记的历史 run（保留 AI_Virtual_Glasses 近 72h 活跃项）
$stale = @(
  'D:\trae_git\Agents-Skill-Site\Code\doc\phase4\bm\run-opt-tier-20260804',
  'D:\trae_git\Agents-Skill-Site\Code\doc\phase4\run-ai-vg-web-ui-route1-20260803',
  'D:\trae_git\Agents-Skill-Site\Code\doc\phase4\run-openapi-voice-20260731',
  'D:\trae_git\MechAssist-Fusion\doc\run-swagger-ui-readonly-20260731'
)
foreach ($d in $stale) {
  $p = Join-Path $d 'h3-watch.json'
  if (-not (Test-Path $p)) { continue }
  $w = Get-Content -Raw $p | ConvertFrom-Json
  $h = @{}
  $w.PSObject.Properties | ForEach-Object { $h[$_.Name] = $_.Value }
  $h.status = 'closed'
  $h.closedReason = 'stale_bootstrap_cleanup'
  $h.closedAt = (Get-Date).ToString('o')
  ($h | ConvertTo-Json -Depth 6) + "`n" | Set-Content -Encoding UTF8 $p
  Write-Host "closed $d"
}

$wsWatch = 'D:\trae_git\AI_Virtual_Glasses\docs\pipeline\run-ws-stub-20260804\h3-watch.json'
if (Test-Path $wsWatch) {
  node D:\trae_git\Agents-Skill-Site\Code\orchestration\openclaw\register-h3-watch.cjs `
    --run-dir D:\trae_git\AI_Virtual_Glasses\docs\pipeline\run-ws-stub-20260804 `
    --work-dir D:\trae_git\AI_Virtual_Glasses\web `
    --repo-root D:\trae_git\AI_Virtual_Glasses | Out-Null
  Write-Host 'refreshed ws-stub watch'
}

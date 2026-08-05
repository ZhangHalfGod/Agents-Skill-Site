# setup-h3-watch-cron.ps1 — 安装 OpenClaw 每 2 分钟 H3 看门狗（幂等）
$ErrorActionPreference = 'Stop'
$Orch = Split-Path -Parent 'D:\trae_git\Agents-Skill-Site\Code\orchestration\openclaw\poll-h3-watch.cjs'
$Poll = Join-Path $Orch 'poll-h3-watch.cjs'
$Patch = Join-Path $Orch 'patch-h3-watch-cron.cjs'
$DeclKey = 'pipeline-h3-watch-v1'
$JobName = 'pipeline-h3-watch'
$KnownJobId = '9ccb4f4f-cb1f-478d-a1fa-e810d5cb5b06'

Write-Host '== close stale watches =='
& (Join-Path $Orch 'cleanup-stale-h3-watch.ps1')

Write-Host '== install or reuse cron (every 2m) =='
$addOut = openclaw cron add `
  --name $JobName `
  --every 2m `
  --command 'node D:/trae_git/Agents-Skill-Site/Code/orchestration/openclaw/poll-h3-watch.cjs --once --trigger-h4 --quiet' `
  --timeout-seconds 120 `
  --no-deliver `
  --declaration-key $DeclKey `
  --description 'Poll h3-watch: auto-start H3, trigger H4 when done' 2>&1 | Out-String
Write-Host $addOut

$jobId = $null
if ($addOut -match '"id":\s*"([a-f0-9-]+)"') { $jobId = $Matches[1] }
else { $jobId = $KnownJobId; Write-Host "== reuse known job id: $jobId ==" }

Write-Host '== patch argv (Windows node + --auto-start-h3 --trigger-h4) =='
node $Patch $jobId

Write-Host '== verify =='
openclaw cron list | Select-String -Pattern $JobName

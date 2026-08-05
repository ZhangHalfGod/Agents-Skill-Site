# h3-run-wrapper.ps1 — 标准 H3 派遣（复制到 <run-dir>/ 后改 $runDir / $workDir）
# 编排者 MUST：-Fresh + -TimeoutSec 480 + -RawOutPath；结束后跑 check-h3-done（不单等 wake）
$ErrorActionPreference = 'Stop'
$runDir = '<RUN_DIR>'
$workDir = '<WORK_DIR>'
$repoRoot = '<REPO_ROOT>'
$register = 'D:\trae_git\Agents-Skill-Site\Code\orchestration\openclaw\register-h3-watch.cjs'
$goal = [IO.File]::ReadAllText((Join-Path $runDir 'h3-goal.md'), [Text.Encoding]::UTF8)
$rawPath = Join-Path $runDir 'h3-dev.raw.txt'
$checkScript = 'D:\trae_git\Agents-Skill-Site\Code\orchestration\openclaw\check-h3-done.cjs'
$invoke = 'D:\trae_git\MechAssist-Fusion\scripts\openclaw\common\coding\invoke-cursor-agent.ps1'

& node $register --run-dir $runDir --work-dir $workDir --repo-root $repoRoot | Out-Null

& $invoke `
  -WorkDir $workDir `
  -Goal $goal `
  -Fresh `
  -TimeoutSec 480 `
  -RawOutPath $rawPath
$invokeExit = $LASTEXITCODE

$checkJson = & node $checkScript --run-dir $runDir --work-dir $repoRoot --expect-commit 2>&1 | Out-String
$statusPath = Join-Path $runDir 'h3-status.json'
[IO.File]::WriteAllText($statusPath, (@{
  invokeExit = $invokeExit
  checkedAt  = (Get-Date).ToString('o')
  check      = ($checkJson | ConvertFrom-Json -ErrorAction SilentlyContinue)
  checkRaw   = $checkJson.Trim()
} | ConvertTo-Json -Depth 4), (New-Object System.Text.UTF8Encoding $false))

Write-Output "h3-status=$statusPath"
Write-Output $checkJson.Trim()
exit $invokeExit

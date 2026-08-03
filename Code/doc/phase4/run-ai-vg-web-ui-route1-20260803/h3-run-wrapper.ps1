# H3 runner — ai-vg-web-ui-route1
# Reads goal from file and invokes cursor-agent (avoids PS5.1 argv mangling).
$ErrorActionPreference = "Stop"
$runDir = "D:\trae_git\Agents-Skill-Site\Code\doc\phase4\run-ai-vg-web-ui-route1-20260803"
$goal = [IO.File]::ReadAllText((Join-Path $runDir "h3-goal.md"), [Text.Encoding]::UTF8)
& "D:\trae_git\MechAssist-Fusion\scripts\openclaw\common\coding\invoke-cursor-agent.ps1" `
  -WorkDir "D:\trae_git\AI_Virtual_Glasses" `
  -Goal $goal `
  -TimeoutSec 1200 `
  -RawOutPath (Join-Path $runDir "h3-dev.raw.txt")
exit $LASTEXITCODE

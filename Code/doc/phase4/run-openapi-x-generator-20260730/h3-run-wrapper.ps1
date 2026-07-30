$ErrorActionPreference = "Stop"
$goal = Get-Content -Raw -LiteralPath "D:\trae_git\Agents-Skill-Site\Code\doc\phase4\run-openapi-x-generator-20260730\h3-code-hop.goal.md"
& "D:\trae_git\MechAssist-Fusion\scripts\openclaw\common\coding\invoke-cursor-agent.ps1" -WorkDir "D:\trae_git\MechAssist-Fusion\extern-api" -Goal $goal -TimeoutSec 1200
exit $LASTEXITCODE

# 从本机 Cursor mcp.json 同步挂接 agents-skill-remote 到 OpenClaw（不打印 token）
# 用法：powershell -NoProfile -File mount-agents-skill-remote.ps1
$ErrorActionPreference = 'Stop'
$mcpPath = Join-Path $env:USERPROFILE '.cursor\mcp.json'
if (-not (Test-Path $mcpPath)) { throw "missing $mcpPath" }
$j = Get-Content $mcpPath -Raw -Encoding UTF8 | ConvertFrom-Json
$remote = $j.mcpServers.'agents-skill-remote'
if (-not $remote) { throw 'agents-skill-remote not in Cursor mcp.json' }
$url = ($remote.url -replace '([^:])//+', '$1/').TrimEnd('/')
if ($url -notmatch '/mcp$') { $url = $url.TrimEnd('/') + '/mcp' }
$auth = $remote.headers.Authorization
if (-not $auth) { throw 'Authorization header missing' }

$envPath = Join-Path $env:USERPROFILE '.openclaw\.env'
$lines = @()
if (Test-Path $envPath) {
  $lines = Get-Content $envPath -Encoding UTF8 | Where-Object { $_ -notmatch '^\s*MCP_TOKEN=' }
}
$token = if ($auth -match '^Bearer\s+(.+)$') { $Matches[1] } else { $auth }
$lines += "MCP_TOKEN=$token"
Set-Content -Path $envPath -Value $lines -Encoding UTF8

openclaw mcp unset agents-skill-remote 2>$null | Out-Null
openclaw mcp add agents-skill-remote --transport streamable-http --url $url --header "Authorization=$auth"
Write-Host "mounted URL=$url"
openclaw mcp list
openclaw mcp probe

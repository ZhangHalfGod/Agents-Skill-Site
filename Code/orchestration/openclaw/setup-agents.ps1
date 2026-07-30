#Requires -Version 5.1
<#
.SYNOPSIS
  OpenClaw 角色花名册一键重建 / 对齐（幂等）。

.DESCRIPTION
  按同目录 agents.example.yaml 的分档契约创建或对齐 7 个角色 agent：
    pm / arch                = deepseek/deepseek-v4-pro   （top，核心决策）
    ui / dev / test / sec / ops = deepseek/deepseek-v4-flash（mid/econ，执行与文档）

  行为（均可重复执行）：
  - agent 不存在  → openclaw agents add（并写 SOUL.md 角色锚定版）
  - agent 已存在  → 校验 ~/.openclaw/openclaw.json 中 agents.list[].model，
                    不一致则就地改（Gateway 热加载免重启；改前自动 .bak-setup 备份）
  - 模型已一致    → 跳过
  - $env:DEEPSEEK_API_KEY 已设置 → 逐 agent 自动注入 key；
                    未设置 → 末尾打印手动注入清单
  本脚本不含任何凭证；key 只从环境变量读取，不落盘。

.EXAMPLE
  .\setup-agents.ps1

.EXAMPLE
  $env:DEEPSEEK_API_KEY = 'sk-...'   # 仅在当前会话设置，不进历史文件
  .\setup-agents.ps1 -UpdatePersona  # 强制重写 SOUL.md
#>
[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [switch]$UpdatePersona
)

$ErrorActionPreference = 'Stop'

$Roster = @(
  @{ Id = 'pm';   Title = '产品经理';   Role = 'ProductManager';   Model = 'deepseek/deepseek-v4-pro' },
  @{ Id = 'arch'; Title = '架构师';     Role = 'Architect';        Model = 'deepseek/deepseek-v4-pro' },
  @{ Id = 'ui';   Title = 'UI 设计师';  Role = 'UIDesigner';       Model = 'deepseek/deepseek-v4-flash' },
  @{ Id = 'dev';  Title = '开发负责人'; Role = 'DevLead';          Model = 'deepseek/deepseek-v4-flash' },
  @{ Id = 'test'; Title = '测试工程师'; Role = 'TestEngineer';     Model = 'deepseek/deepseek-v4-flash' },
  @{ Id = 'sec';  Title = '安全工程师'; Role = 'SecurityEngineer'; Model = 'deepseek/deepseek-v4-flash' },
  @{ Id = 'ops';  Title = '运维工程师'; Role = 'OpsEngineer';      Model = 'deepseek/deepseek-v4-flash' }
)

$OcHome = Join-Path $HOME '.openclaw'
$OcJson = Join-Path $OcHome 'openclaw.json'
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..\..')).Path

if (-not (Get-Command openclaw -ErrorAction SilentlyContinue)) {
  throw '未找到 openclaw CLI——请先安装 OpenClaw 再运行本脚本'
}

function Get-ExistingAgentIds {
  $out = openclaw agents list 2>$null
  @($out | Select-String -Pattern '^- (\w+)' | ForEach-Object { $_.Matches[0].Groups[1].Value })
}

function Get-AgentModel([string]$Id) {
  $raw = [System.IO.File]::ReadAllText($OcJson)
  $m = [regex]::Match($raw, '"id":\s*"' + $Id + '"[\s\S]*?"model":\s*"([^"]*)"')
  if ($m.Success) { return $m.Groups[1].Value }
  return $null
}

function Set-AgentModel([string]$Id, [string]$Model) {
  Copy-Item $OcJson "$OcJson.bak-setup" -Force
  $raw = [System.IO.File]::ReadAllText($OcJson)
  $pattern = '("id":\s*"' + $Id + '"[\s\S]*?"model":\s*")[^"]*'
  $new = [regex]::Replace($raw, $pattern, ('${1}' + $Model))
  [System.IO.File]::WriteAllText($OcJson, $new, (New-Object System.Text.UTF8Encoding $false))
}

function Get-SoulMd([hashtable]$A) {
  @"
# SOUL.md — $($A.Role)

你是$($A.Title)（$($A.Role)），AI 编码治理团队的角色 agent（OpenClaw 编排总线成员）。

角色说明书（权威真源）：``docs/zh/agents/standard/$($A.Role)/index.md``（本仓 Code/code 下）。
技能绑定查询：经 agents-skill-remote MCP（``get_agent`` / ``get_skill``）拿 source 路径后按说明书执行。

执行要点：
- 只产出本角色交付物 kind 的结构化 Markdown（可直接落盘的内容）
- 收到交接信封时先确认 context / deliverables 齐全，缺项先回问再动手
- 不越权产出其他角色的交付物；跨角色需求转回编排者 main
"@
}

$existing = Get-ExistingAgentIds
$results = @()

foreach ($a in $Roster) {
  $id = $a.Id
  $workspace = Join-Path $OcHome "workspace-$id"
  $status = [ordered]@{ Agent = $id; Model = $a.Model; Action = ''; Persona = '' }

  if ($existing -notcontains $id) {
    if ($PSCmdlet.ShouldProcess($id, 'openclaw agents add')) {
      openclaw agents add $id --model $a.Model --workspace $workspace --non-interactive | Out-Null
      $status.Action = 'created'
    } else { $status.Action = 'would-create' }
    $soulPath = Join-Path $workspace 'SOUL.md'
    if ($PSCmdlet.ShouldProcess($soulPath, 'write SOUL.md')) {
      [System.IO.File]::WriteAllText($soulPath, (Get-SoulMd $a), (New-Object System.Text.UTF8Encoding $false))
      $status.Persona = 'written'
    }
  }
  else {
    $current = Get-AgentModel $id
    if ($current -ne $a.Model) {
      if ($PSCmdlet.ShouldProcess($id, "model $current -> $($a.Model)")) {
        Set-AgentModel $id $a.Model
        $status.Action = "model: $current -> $($a.Model)"
      } else { $status.Action = 'would-fix-model' }
    } else {
      $status.Action = 'ok (exists)'
    }
    if ($UpdatePersona) {
      $soulPath = Join-Path $workspace 'SOUL.md'
      if ($PSCmdlet.ShouldProcess($soulPath, 'rewrite SOUL.md')) {
        [System.IO.File]::WriteAllText($soulPath, (Get-SoulMd $a), (New-Object System.Text.UTF8Encoding $false))
        $status.Persona = 'rewritten'
      }
    } else {
      $status.Persona = 'kept'
    }
  }
  $results += [pscustomobject]$status
}

# key 注入
$keyNote = ''
if ($env:DEEPSEEK_API_KEY) {
  foreach ($a in $Roster) {
    if ($PSCmdlet.ShouldProcess($a.Id, 'inject deepseek api key')) {
      $env:DEEPSEEK_API_KEY | openclaw models auth --agent $a.Id paste-api-key --provider deepseek | Out-Null
    }
  }
  $keyNote = '已逐 agent 注入 DEEPSEEK_API_KEY（provider=deepseek）'
} else {
  $keyNote = '未检测到 $env:DEEPSEEK_API_KEY——请手动逐 agent 注入（见下方清单）'
}

Write-Host ''
Write-Host '=== 花名册对齐结果 ==='
$results | Format-Table -AutoSize
Write-Host $keyNote
if (-not $env:DEEPSEEK_API_KEY) {
  Write-Host ''
  Write-Host '手动注入清单（每行一个 agent；key 从安全渠道读取，勿贴进聊天/文件）：'
  foreach ($a in $Roster) {
    Write-Host ("  `$key | openclaw models auth --agent {0} paste-api-key --provider deepseek" -f $a.Id)
  }
}
Write-Host ''
Write-Host '冒烟验证：openclaw agent --agent pm --message "ping"'
Write-Host '查看实际模型：openclaw sessions list --agent pm  （Model 列 = 实跑模型）'
Write-Host "契约对照：$RepoRoot\Code\orchestration\openclaw\agents.example.yaml"

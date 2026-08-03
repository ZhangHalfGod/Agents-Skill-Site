# H3a Goal — workdir-whitelist（Cursor 执行 · 业务仓 MechAssist-Fusion）

你是本机 Cursor Agent 内的开发执行者。这是【新项目需求 workdir-whitelist】的 H3 阶段（业务仓部分）：给 `invoke-cursor-agent.ps1`（业务仓副本）加 WorkDir 白名单校验，并同步 SKILL.md。**你只改白名单指定文件，不碰其他任何业务逻辑。**

工作目录（业务仓）：`E:\zhangchangWork\Work_Space\Trae_Study\MechAssist-Fusion`（分支 feature/Home_window，以下相对路径均相对该根）

---

## 一、原始需求（用户原文）

【新项目需求】workdir-whitelist：给 invoke-cursor-agent.ps1 加 WorkDir 白名单；非法路径 FAIL 中文原因；同步 SKILL/文档。不做：改 Cursor 本身、扩大改业务仓逻辑。验收：白名单内可跑；白名单外拒绝且不启动 agent。

## 二、架构约束（H2 定稿，必须逐条执行）

### M1：`scripts/openclaw/common/coding/invoke-cursor-agent.ps1`（业务仓 V5 P1 副本）

**插入位置**：`Test-Path` 存在性检查块（`if (-not (Test-Path -LiteralPath $WorkDir -PathType Container)) { ... }`）**之后**、`$agentCmd` 赋值**之前**。该脚本 L17 已有 `$WorkDir = [IO.Path]::GetFullPath($WorkDir)`，白名单校验直接复用此归一化变量。

**插入代码**（精确按此实现，中文注释保留 UTF-8）：

```powershell
# --- WorkDir whitelist (gateway security) ---
$allowedRoots = @(
  "E:\zhangchangWork\Work_Space\Trae_Study\MechAssist-Fusion",
  "E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site",
  "E:\zhangchangWork\Work_Space\Trae_Study\MCP_Gaode_Map",
  "E:\zhangchangWork\Work_Space\Trae_Study\Life-Coach-AI",
  "E:\zhangchangWork\Work_Space\Trae_Study\AI_People_System",
  "E:\zhangchangWork\Work_Space\Trae_Study\openclaw_trae_cursor"
)
if ($env:WORKDIR_WHITELIST) {
  $extra = $env:WORKDIR_WHITELIST -split ';' | ForEach-Object { $_.Trim() } | Where-Object { $_ -and (Test-Path -LiteralPath $_) }
  $allowedRoots += $extra
}
$normalized = $allowedRoots | ForEach-Object { [IO.Path]::GetFullPath($_) }
$wd = [IO.Path]::GetFullPath($WorkDir)
if ($wd -notin $normalized) {
  Write-Output "FAIL: 工作目录不在白名单中: $WorkDir"
  exit 1
}
```

### M3：`scripts/openclaw/common/skills/code-via-cursor-cli/SKILL.md`

在合适位置（如 `## Rules` 段）新增「WorkDir 白名单」小节，内容含：invoke-cursor-agent.ps1 仅允许 6 个 Trae_Study git 仓库作为 -WorkDir；白名单外路径输出 `FAIL: 工作目录不在白名单中` 并 exit 1、不启动 agent；可用环境变量 `WORKDIR_WHITELIST`（分号分隔）追加额外允许目录；白名单为精确目录匹配（GetFullPath 归一化）。

### P1（评估后决定）：`scripts/openclaw/common/coding/configure-cursor-code.ps1`

读该脚本：若其生成/嵌入与 invoke-cursor-agent.ps1 行为相关的 SKILL 模板文本（含 WorkDir 用法说明），则同步加一句白名单说明；若只是生成无关配置，跳过并在报告中说明原因。

### 显式不做

- 不改 Cursor CLI 本身、不改 OpenClaw Gateway 配置、不改 extern-api/ 业务逻辑、不改 .env*
- 不新增独立配置文件（白名单内嵌脚本数组）
- 不 git commit / push；不 npm install / rebuild
- 不调用 agents-skill-remote / 任何 Site MCP；不再读 Agents-Skill-Site 仓 `docs/zh/**` 说明书
- 不调用 feishu_doc / feishu_drive（双写由编排者 main 做）

## 三、Playbook Pack（合并快照，本 Goal 已内嵌；禁止再调 Site MCP / 再读 Agents-Skill-Site docs/zh 说明书）

- **硬禁区**：只改上述白名单文件；不改其他业务逻辑；不 git push/commit；不写 .env/Token/密钥；不调 feishu 工具；不 npm install/rebuild；输出 UTF-8
- **红色记录（网关层安全 AI 生成代码）**：本改动为网关层安全校验，属核心模块红色记录范畴——实现后必须自检：①白名单数组 6 仓路径与实际一致；②`-in` 精确比较 + GetFullPath 归一化；③FAIL 中文文案 + exit 1；④FAIL 后不进入 agent 启动逻辑（不调 Resolve-ChatId/Start-Process）；⑤环境变量追加逻辑正确
- **如实记录**：做不到/异常写清，不空勾掩盖

## 四、输出契约

交付物正文（说明改了什么、插入位置、自检结果、P1 评估结论）→ 单独一行 `---SPLIT---` → 信封 YAML：
```yaml
from: dev
to: main (orchestrator)
project: workdir-whitelist
stage: H3a
deliverable:
  kind: implementation-report
  path: scripts/openclaw/common/coding/invoke-cursor-agent.ps1, scripts/openclaw/common/skills/code-via-cursor-cli/SKILL.md [, configure-cursor-code.ps1?]
  summary: > 修改摘要与自检结果
decisions: [P1 是否同步及理由等]
gate:
  checklist: stage-gate-flow
  items: [M1/M3/P1 逐条自检结果 + 红色记录五项]
evidence: [grep/diff 输出摘要]
lesson_hint: ""
```
最后附**改动清单**：`git status --short`（只读）输出，确认本次改动面仅上述白名单文件。

## 五、完成后注意

- 不要 git commit / push；输出正文控制在 12K 字符内；文件一律 UTF-8

# H3b Goal — workdir-whitelist（Cursor 执行 · 编排仓 Agents-Skill-Site）

你是本机 Cursor Agent 内的开发执行者。这是【新项目需求 workdir-whitelist】的 H3 阶段（编排仓部分）：给编排侧副本 `invoke-cursor-agent.ps1` 加与业务仓副本一致的 WorkDir 白名单校验。**你只改这一个文件。**

工作目录（编排仓）：`E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site`（以下相对路径均相对该根）

---

## 一、原始需求（用户原文）

【新项目需求】workdir-whitelist：给 invoke-cursor-agent.ps1 加 WorkDir 白名单；非法路径 FAIL 中文原因；同步 SKILL/文档。不做：改 Cursor 本身、扩大改业务仓逻辑。验收：白名单内可跑；白名单外拒绝且不启动 agent。

## 二、架构约束（H2 定稿，必须逐条执行）

### M2：`Code/orchestration/openclaw/invoke-cursor-agent.ps1`（编排侧 Home 版副本）

**插入位置**：`Test-Path` 存在性检查块（`if (-not (Test-Path -LiteralPath $WorkDir)) { throw ... }`）**之后**、`.env` 加载（`$envFile = Join-Path $WorkDir '.env'`）**之前**。

**注意**：本副本在参数区**没有** `$WorkDir = [IO.Path]::GetFullPath($WorkDir)`，插入白名单块前必须先补这一行归一化（放在 Test-Path 检查之前或白名单块开头均可，保证 `$WorkDir` 已归一化）。

**插入代码**（精确按此实现，中文注释保留 UTF-8）：

```powershell
# --- WorkDir whitelist (gateway security) ---
$WorkDir = [IO.Path]::GetFullPath($WorkDir)
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

**注意**：若你发现实际文件行号与「L19→L20」描述有出入，以结构匹配为准（Test-Path 块之后、.env 加载之前），不要臆造重复插入。

### 显式不做

- 不改本仓其他任何文件（编排脚本、run-dir-presets、模板、README 等一律不动——本仓的 SKILL/文档同步由业务仓 H3a 与后续处理覆盖）
- 不 git commit / push；不 npm install / rebuild
- 不调用 agents-skill-remote / 任何 Site MCP；不再读本仓 `docs/zh/**` 说明书
- 不调用 feishu_doc / feishu_drive（双写由编排者 main 做）

## 三、Playbook Pack（合并快照，本 Goal 已内嵌；禁止再调 Site MCP / 再读 Agents-Skill-Site docs/zh 说明书）

- **硬禁区**：只改上述 1 个文件；不 git push/commit；不写 .env/Token/密钥；不调 feishu 工具；不 npm install/rebuild；输出 UTF-8
- **红色记录（网关层安全 AI 生成代码）**：本改动为网关层安全校验，属核心模块红色记录范畴——实现后必须自检：①白名单数组 6 仓路径与实际一致；②先补 GetFullPath 归一化再比较；③`-in` 精确比较；④FAIL 中文文案 + exit 1；⑤FAIL 后不进入后续 agent 启动逻辑
- **如实记录**：做不到/异常写清，不空勾掩盖

## 四、输出契约

交付物正文（说明改了什么、插入位置、自检结果）→ 单独一行 `---SPLIT---` → 信封 YAML：
```yaml
from: dev
to: main (orchestrator)
project: workdir-whitelist
stage: H3b
deliverable:
  kind: implementation-report
  path: Code/orchestration/openclaw/invoke-cursor-agent.ps1
  summary: > 修改摘要与自检结果
decisions: []
gate:
  checklist: stage-gate-flow
  items: [M2 逐条自检结果 + 红色记录五项]
evidence: [grep/diff 输出摘要]
lesson_hint: ""
```
最后附**改动清单**：`git status --short`（只读）输出，确认本次改动面仅该文件。

## 五、完成后注意

- 不要 git commit / push；输出正文控制在 8K 字符内；文件一律 UTF-8

# 架构约束与执行计划（H2 — Architect）

**项目**：workdir-whitelist  
**阶段**：H2（架构合规复核）  
**日期**：2026-08-02  
**产出者**：Architect（agent=arch）  
**上一跳**：H1 PM 范围清单（`h1-pm.scope-checklist.md`）  
**业务仓**：MechAssist-Fusion（分支 feature/Home_window）  
**run_dir**：`Code/doc/phase4/home/run-workdir-whitelist-20260802`

---

## 1. 复核结论

H1 范围清单经本跳原位复核（只读），**核心事实均确认无误**：

| 复核项 | H1 结论 | H2 复核 | 状态 |
|--------|---------|---------|------|
| 业务仓副本 L18-L21 仅 Test-Path | ✅ 无白名单 | 源码确认 | 一致 |
| 编排副本 L17-L19 仅 Test-Path | ✅ 无白名单 | 源码确认 | 一致 |
| 白名单候选 6 仓均存在 | ✅ 列出 6 个 | 实查 Trae_Study（7 目录，Api_Gateway 非 git repo，确认为 6） | 一致 |
| SKILL.md 无白名单说明 | ✅ 需新增 | 全文阅读确认 | 一致 |
| 两份脚本调用方式不同 | ✅ V5 P1 版用 agent.cmd+resume+Start-Process；编排版用 cursor-agent 直调 | 源码确认 | 一致 |

---

## 2. 白名单方案定稿

### 2.1 默认目录集（6 仓绝对路径）

```text
E:\zhangchangWork\Work_Space\Trae_Study\MechAssist-Fusion
E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site
E:\zhangchangWork\Work_Space\Trae_Study\MCP_Gaode_Map
E:\zhangchangWork\Work_Space\Trae_Study\Life-Coach-AI
E:\zhangchangWork\Work_Space\Trae_Study\AI_People_System
E:\zhangchangWork\Work_Space\Trae_Study\openclaw_trae_cursor
```

### 2.2 环境变量：`$env:WORKDIR_WHITELIST`（分号分隔，追加语义）

```powershell
if ($env:WORKDIR_WHITELIST) {
  $extra = $env:WORKDIR_WHITELIST -split ';' `
    | ForEach-Object { $_.Trim() } `
    | Where-Object { $_ -and (Test-Path -LiteralPath $_) }
  $allowedRoots += $extra
}
```

### 2.3 匹配算法

- **方式**：精确目录比较，`-in` 操作符（PowerShell 默认不区分大小写，适配 Windows 文件系统）
- **归一化**：白名单条目 + `$WorkDir` 双方均经 `[IO.Path]::GetFullPath()` 处理
- **大小写**：不敏感（Windows NTFS 本身不区分大小写；`-in` 默认 IgnoreCase）

完整校验块（伪代码，两份脚本**核心逻辑相同**）：

```powershell
# --- WorkDir whitelist (gateway security) ---
$allowedRoots = @(
  "E:\...\MechAssist-Fusion",
  "E:\...\Agents-Skill-Site",
  "E:\...\MCP_Gaode_Map",
  "E:\...\Life-Coach-AI",
  "E:\...\AI_People_System",
  "E:\...\openclaw_trae_cursor"
)
if ($env:WORKDIR_WHITELIST) {
  $extra = $env:WORKDIR_WHITELIST -split ';' | % { $_.Trim() } | ? { $_ -and (Test-Path $_) }
  $allowedRoots += $extra
}
$normalized = $allowedRoots | % { [IO.Path]::GetFullPath($_) }
$wd = [IO.Path]::GetFullPath($WorkDir)
if ($wd -notin $normalized) {
  Write-Output "FAIL: 工作目录不在白名单中: $WorkDir"
  exit 1
}
```

### 2.4 FAIL 语义

- **输出**：`FAIL: 工作目录不在白名单中: <原始WorkDir>`
- **退出码**：`exit 1`（与目录不存在统一，避免破坏调用方 exit code 分类约定）
- **不启动 agent**：白名单 FAIL 后直接 exit，不进入 `Resolve-ChatId` / `Start-Process` / `$agentArgs` 等后续逻辑

### 2.5 插入点（两份脚本各异）

| 副本 | 插入位置 | 精确描述 |
|------|---------|---------|
| **M1** 业务仓 V5 P1 | `Test-Path` 存在性检查（L18-L21 的 `}` ）**之后**、`$agentCmd` 赋值（L23）**之前** | L17 已有 `$WorkDir = [IO.Path]::GetFullPath($WorkDir)`，白名单校验复用此变量 |
| **M2** 编排 Home 版 | `Test-Path` 存在性检查（L17-L19 的 `}` ）**之后**、`.env` 加载（L21 的 `$envFile` 赋值）**之前** | 编排版未做 `GetFullPath`，需在白名单校验前补 `$WorkDir = [IO.Path]::GetFullPath($WorkDir)` |

---

## 3. 红色记录 — 核心模块AI生成

本任务将白名单校验逻辑写入 `invoke-cursor-agent.ps1`，该脚本位于**网关层**（OpenClaw → Cursor Agent CLI 的调用入口），拦截非法 WorkDir，属于安全模块。根据 `ai-code-boundary`（contentHash=f8e641bd8ab22698）：网关层代码允许 AI 生成，但**必须登记红色记录并通过强化审查**。

### 红色记录条目

| 字段 | 值 |
|------|-----|
| **模块名** | `invoke-cursor-agent.ps1`（网关层 — Agent 启动入口） |
| **变更范围** | 在 Test-Path 后、agent 启动前插入 WorkDir 白名单校验（~15 行 × 2 副本） |
| **风险点** | 白名单过宽 → agent 在非预期目录执行（数据泄露/误操作）；白名单过紧 → 阻塞正常派遣；GetFullPath 边界（符号链接/挂载点） |
| **审查人** | Architect（H2）+ DevLead（H3）+ TestEngineer（H4） |
| **审查结论** | H2：方案通过；H3：代码实现后复核；H4：实测验收 |
| **关联 Prompt 版本** | workdir-whitelist H1 scope-checklist（待 H4 补充 H3 prompt hash） |

---

## 4. 修改面白名单

### P0（强制）

| # | 文件 | 变更 | 行号指引 |
|---|------|------|---------|
| M1 | `MechAssist-Fusion/scripts/openclaw/common/coding/invoke-cursor-agent.ps1` | 在 L21 `}` 后、L23 `$agentCmd` 前插入白名单校验块（~15 行） | L21→L22 之间 |
| M2 | `Agents-Skill-Site/Code/orchestration/openclaw/invoke-cursor-agent.ps1` | 在 L19 `}` 后、L21 `$envFile` 前插入白名单校验块（~17 行，含 GetFullPath 补丁） | L19→L20 之间 |
| M3 | `MechAssist-Fusion/scripts/openclaw/common/skills/code-via-cursor-cli/SKILL.md` | 新增"WorkDir 白名单"段落，含 6 仓枚举、WORKDIR_WHITELIST 用法 | `## Rules` 段下 |

### P1（推荐同步）

| # | 文件 | 变更 |
|---|------|------|
| P1 | `configure-cursor-code.ps1` | 如该脚本生成与 invoke-cursor-agent.ps1 相关的 SKILL 模板，同步更新白名单说明 |

### P2（建议但不强制）

| 文件 | 原因 |
|------|------|
| `docs/README.md`、`doctor.ps1`、顶层 `README.md`、`orchestrator-main-soul.draft.md`、`orchestrator-main.md` | 若引用 invoke-cursor-agent.ps1 行为，建议在对应段落注明白名单存在，但不阻塞 H4 验收 |

---

## 5. 显式不做清单

| 禁止项 | 原因 |
|--------|------|
| 改 Cursor CLI 本身 | 用户明确排除 |
| 改 OpenClaw Gateway 配置 | 不涉及 |
| 改 `extern-api/` 业务逻辑 | 不涉及 |
| 改 `.env` / `.env.example` | 含密钥/配置 |
| 新增独立配置文件（如 `whitelist.json`） | H1 决策：脚本内硬编码 |
| 白名单匹配改为前缀/子目录匹配 | 精确匹配已裁定 |
| git push / npm install / rebuild | 硬约束 |

---

## 6. 验收口径

| 用户验收条件 | 架构映射 | 验收方式 |
|------------|---------|---------|
| 白名单内可跑 | 6 仓任一作为 `-WorkDir`，校验通过进入 agent 启动逻辑 | H4：`invoke-cursor-agent.ps1 -WorkDir "E:\...\MechAssist-Fusion" -Goal "test" -Fresh` → 进入 agent 启动 |
| 白名单外拒绝且不启动 agent | 非白名单路径 → `FAIL: 工作目录不在白名单中` + `exit 1`，不调用 Resolve-ChatId/Start-Process | H4：`invoke-cursor-agent.ps1 -WorkDir "C:\Windows" -Goal "test"` → exit 1 + 中文 FAIL + $LASTEXITCODE=1 |
| 中文 FAIL | 输出含 `工作目录不在白名单中` | H4：stdout grep |
| WORKDIR_WHITELIST 追加生效 | `$env:WORKDIR_WHITELIST="D:\foo"` → 白名单包含 6+1 条 | H4：追加路径 + 校验通过 |
| SKILL 同步 | SKILL.md 含"白名单"+"WORKDIR_WHITELIST" | H4：grep |
| H4 改动面仅脚本+文档 | git diff --stat 仅 .ps1 + .md | H4：git diff |

---

## 7. 风险与回滚

| 风险 | 等级 | 缓解 | 回滚 |
|------|------|------|------|
| 白名单过紧阻塞派遣 | 低 | WORKDIR_WHITELIST 环境变量即时追加，无需改脚本 | git checkout |
| 编排副本不同步 | 低 | M1+M2 同期修改，架构约束中已明确两份插入点 | git checkout |
| GetFullPath 不解析符号链接/SUBST/Junction | 低 | 本机环境无此类挂载；若出现问题，WORKDIR_WHITELIST 追加目标路径绕过 | git checkout |
| 白名单校验在 Test-Path 之后、agent 启动之前 → 与 agent 失败混淆 | 低 | 输出 `FAIL: 工作目录不在白名单中` 语义独立于目录不存在/agent 超时等 FAIL；调用方可区分 | —— |

---

## 8. H1 开放问题裁定

| # | H1 问题 | H2 裁定 | 理由 |
|---|---------|---------|------|
| Q1 | 白名单默认包含哪些目录？ | **6 个全列入**（Trae_Study 下所有 git 仓库）。实查确认 7 个目录中 Api_Gateway 无 .git，排除。 | 与 H1 建议一致；覆盖本机全量 git 仓库，最大化可用性 |
| Q2 | Agents-Skill-Site 编排副本是否同步？ | **是**。编排者主 soul（orchestrator-main-soul.draft.md L91）也通过该副本派遣 agent。 | H1 建议一致 |
| Q3 | WORKDIR_WHITELIST 追加 vs 覆盖？ | **追加**。`$allowedRoots += $extra`，默认白名单不可移除（硬编码），环境变量仅做追加以缓解白名单过紧。 | H1 建议一致；安全优先 |
| Q4 | 匹配方式：精确 vs 前缀？ | **精确目录比较**（`-in`）。防止 `E:\...\MechAssist-Fusion\malicious` 借前缀绕过。 | H1 建议一致；攻击面最小 |
| Q5 | FAIL 退出码：exit 1 vs exit 3？ | **exit 1**。与目录不存在的退出码统一，避免调用方需要维护多级错误码。调用方通过 stdout 文本区分失败原因。 | H1 建议一致 |

---

*本文由 Architect 产出，基于 H1 范围清单原位复核、双副本源码比对与 MCP 角色自查。红色记录已登记。提交 DevLead（H3）执行代码修改。*

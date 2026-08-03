# AI代码生成范围清单（H1 — ProductManager）

**项目**：workdir-whitelist  
**短名**：workdir-whitelist  
**阶段**：H1（需求拆解 & 范围界定）  
**日期**：2026-08-02  
**产出者**：ProductManager（agent=pm）  
**业务仓**：MechAssist-Fusion（分支 feature/Home_window）  
**run_dir**：`Code/doc/phase4/home/run-workdir-whitelist-20260802`

---

## 1. 目标

给 `invoke-cursor-agent.ps1` 增加 WorkDir 白名单校验：白名单内路径允许启动 Cursor Agent；白名单外路径拒绝，输出中文 FAIL 原因（exit 非零），不启动 agent。同步更新 SKILL 文档与两份脚本副本。

### 成功画像

| 维度 | 标准 |
|------|------|
| 安全校验 | 在 `Test-Path` 存在性检查后、调用 agent 前，新增白名单校验；非法路径 FAIL 并阻停 |
| 白名单默认值 | 覆盖本机 `Trae_Study` 下 6 个 git 仓库（绝对路径） |
| 中文 FAIL | 白名单外路径拒绝时输出 `FAIL: 工作目录不在白名单中: <path>`，exit 1 |
| 不启动 agent | 白名单校验失败后不执行后续 `Resolve-ChatId` / `Start-Process` |
| 可配置覆盖 | 支持环境变量 `WORKDIR_WHITELIST`（分号分隔）追加到默认列表 |
| 双副本同步 | 业务仓副本 + 编排仓副本（`Agents-Skill-Site/Code/orchestration/openclaw/`）均加白名单 |
| 文档同步 | SKILL.md 更新白名单说明 |

---

## 2. 范围条目

### 2.1 原位探查结论（只读确认）

#### invoke-cursor-agent.ps1 现状

| 副本 | 路径 | 校验现状 | 白名单 |
|------|------|---------|--------|
| 业务仓 V5 P1 | `MechAssist-Fusion/scripts/openclaw/common/coding/invoke-cursor-agent.ps1` | L18–L22：`GetFullPath` → `Test-Path` 存在性检查 | ❌ 无 |
| 编排侧 Home版 | `Agents-Skill-Site/Code/orchestration/openclaw/invoke-cursor-agent.ps1` | L17–L19：`Test-Path` 存在性检查 | ❌ 无 |

#### 本机 git 仓库（白名单候选集，Trae_Study 下 6 个）

`MechAssist-Fusion`、`Agents-Skill-Site`、`MCP_Gaode_Map`、`Life-Coach-AI`、`AI_People_System`、`openclaw_trae_cursor`

#### 引用 invoke-cursor-agent 的文件（需同步）

**P0**：两份 invoke-cursor-agent.ps1（主体修改）、SKILL.md（文档同步）  
**P1**：configure-cursor-code.ps1（生成的 SKILL 模板）  
**P2**：docs/README.md、doctor.ps1、README.md（顶层）、orchestrator-main-soul.draft.md、orchestrator-main.md

### 2.2 修改条目（P0）

| # | 文件 | 修改动作 |
|---|------|---------|
| M1 | `MechAssist-Fusion/scripts/openclaw/common/coding/invoke-cursor-agent.ps1` | 在 Test-Path 后插入白名单校验（~10 行）。FAIL：`"FAIL: 工作目录不在白名单中: $WorkDir"`，exit 1 |
| M2 | `Agents-Skill-Site/Code/orchestration/openclaw/invoke-cursor-agent.ps1` | 同 M1 |
| M3 | `SKILL.md` | 新增"WorkDir 白名单"说明段落 |

### 2.3 白名单设计决策（提交 H2）

| 决策项 | 建议 | 替代方案 |
|--------|------|---------|
| 存储 | 脚本内数组 + `$env:WORKDIR_WHITELIST` 追加 | 独立配置文件 |
| 匹配 | 精确目录比较（`-in`），双方 `GetFullPath` 归一化 | 前缀匹配 |
| 默认值 | 6 个 Trae_Study git 仓库绝对路径 | 仅 2 个 |
| FAIL 码 | exit 1 | exit 3（独立类别） |

### 2.4 不修改（显式不做）

Cursor CLI 本身、OpenClaw Gateway 配置、`extern-api/` 业务逻辑、`.env`、新增独立配置文件、git push

---

## 3. 验收口径

| 用户验收条件 | Given-When-Then |
|------------|-----------------|
| 白名单内可跑 | Given WorkDir=MechAssist-Fusion → 脚本继续执行 agent 启动 |
| 白名单外拒绝且不启动 agent | Given WorkDir=`C:\Windows` → 输出中文 FAIL + exit 1，不调 agent |
| 中文 FAIL | 输出含"工作目录不在白名单中" |
| 同步 SKILL | SKILL.md 可 grep "白名单" |
| H4 改动面仅脚本+文档 | git diff --stat 仅 .ps1 + .md |

---

## 4. 风险与回滚

白名单太紧 → `WORKDIR_WHITELIST` 环境变量追加；编排副本不同步 → M1+M2 同期修改；回滚 → git checkout。

---

## 5. 开放问题（提交 H2 决策）

1. 白名单默认包含哪些目录？（建议 6 个全列入）
2. Agents-Skill-Site 编排副本是否同步？（是——编排者 H3 派遣也用它，见 `orchestrator-main-soul.draft.md` L91）
3. `WORKDIR_WHITELIST` 追加还是覆盖默认值？（建议追加）
4. 匹配方式：精确目录 vs 前缀匹配？（建议精确）
5. FAIL 退出码 exit 1 vs 独立 exit 3？

---

## 6. 红色记录

WorkDir 白名单属于**网关层安全校验**——拦截非法路径，防止 agent 在非预期目录执行。`invoke-cursor-agent.ps1` 新增白名单（AI 生成代码），触发红色记录。H2 确认方案后放行 H3；H4 实测。

---

*本清单由 ProductManager 根据原位探查（只读）与 MCP 角色真源产出，提交架构师（H2）复核。*

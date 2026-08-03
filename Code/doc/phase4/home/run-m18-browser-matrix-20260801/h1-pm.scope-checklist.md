# AI代码生成范围清单 — m18-browser-matrix

> **项目**：MechAssist-Fusion / M18 语音（mcp-gaode SPA）浏览器测试矩阵回填
> **阶段**：H1（需求拆解）→ 下游 H2 执行（Arch/DevLead/TestEngineer）
> **产出**：本文（scope-checklist）+ 交接信封
> **日期**：2026-08-01
> **角色**：ProductManager（pm）

---

## 1. 业务目标

在 Windows 环境下实测 M18 语音的浏览器端 ASR（麦克风→输入框）与 TTS（朗读），将结果填入测试矩阵与冒烟清单，实现文档闭环；macOS 行标注「本环境跳过」（无 Mac 设备）。

### SMART 指标

- **S**：完成 Win Chrome ASR + TTS 两条用例，Win Edge 两条至少有一条结果
- **M**：每条用例状态为 ✅ / ❌ / ⏭（跳过+原因），填写到矩阵与测试报告
- **A**：本机 Chrome/Edge 可用，麦克风可用（iKF-V11 Pro），豆包 TTS 服务端已验
- **R**：不改代码，只需打开已有服务/页面执行测试并记录
- **T**：H2 执行窗口内完成（不跨阶段）

---

## 2. 范围条目（精确到文件与动作）

### 2.1 新增文件

| # | 文件（相对业务仓 `doc/方案C/方案C_M18_语音_mcp-gaode/测试与发布/`） | 动作 | 说明 | 优先级 |
|---|------|------|------|--------|
| N1 | `AI代码测试报告.md` | 新建 | 结构化测试报告：环境信息、步骤、每个用例通过/失败/跳过、截图或日志摘要（禁止写密钥） | P0 |

### 2.2 修改文件

| # | 文件 | 动作 | 说明 | 优先级 |
|---|------|------|------|--------|
| M1 | `doc/方案C/方案C_M18_语音_mcp-gaode/测试与发布/README.md` §1 浏览器矩阵 | 修改 | 勾选 Win Chrome ASR □→✅/❌、TTS □→✅/❌；Win Edge ASR □→✅/❌/⏭、TTS □→✅/❌/⏭；macOS 行填 ⏭「本环境跳过」 | P0 |
| M2 | `doc/方案C/方案C_M18_语音_mcp-gaode/测试与发布/README.md` §2 功能冒烟 | 修改 | #1~#4 实测后勾选或填「本环境跳过」+ 原因 | P0 |
| M3 | `doc/方案C/方案C_M18_语音_mcp-gaode/执行进度.md` §4 验证记录 | 修改 | 追加浏览器矩阵实测行 | P1 |
| M4 | `doc/方案C/方案C_M18_语音_mcp-gaode/执行进度.md` §6 待办 | 修改 | 勾掉/更新待办#1「本机方法三：/chat 端到端 + Chrome/Edge（Win）各 1 次 ASR + 朗读」 | P1 |

### 2.3 测试执行条目（不改文件，但需在 H2 实际执行）

| # | OS | 浏览器 | 用例 | 方法 | 通过条件 | 优先级 |
|---|-----|--------|------|------|----------|--------|
| T1 | Win 10/11 | Chrome | ASR | 打开 mcp-gaode `/chat`，点麦克风按钮，口述目的地；验证文本填入输入框，可编辑后发送 | 文本正确填入输入框 | P0 |
| T2 | Win 10/11 | Chrome | TTS | 助手回复后点「朗读」按钮；验证音频播放（开朗姐姐音色），可停止 | 音频正常播放/停止 | P0 |
| T3 | Win 10/11 | Edge | ASR | 同上，用 Edge 打开 /chat；若 Edge 不支持 Web Speech API 或权限异常则记录原因 | 同 T1；否则⏭+原因 | P1 |
| T4 | Win 10/11 | Edge | TTS | 同上，Edge 中点朗读；TTS 为服务端合成，预期与 Chrome 一致 | 同 T2；否则⏭+原因 | P1 |
| T5 | — | macOS Chrome | ASR+TTS | 本机无 Mac → ⏭「本环境跳过」 | 不执行 | P1 |
| T6 | — | macOS Safari | ASR+TTS | 本机无 Mac → ⏭「本环境跳过」 | 不执行 | P1 |

### 2.4 冒烟测试条目（README §2，H2 执行时对照）

| # | README §2 条目 | 动作 | 备注 |
|---|---------------|------|------|
| S1 | 打开 /chat，文本发一句 | 实测后勾选 | M17 已验证，H2 在测试环境中再验一次 |
| S2 | 麦克风口述目的地 | 实测后勾选 | 对应 T1/T3 |
| S3 | 助手回复后点朗读 | 实测后勾选 | 对应 T2/T4；后端 TTS ✅ 已验 |
| S4 | 拒绝麦克风权限 | 实测后勾选 | 需在浏览器中主动拒绝权限后验证 |
| S5 | 无豆包配置 | 已 ✅（逻辑已实现），不重测 | — |
| S6 | `GET /api/voice/capabilities` | ✅（新进程），不重测 | — |
| S7 | `POST /api/voice/tts` | ✅，不重测 | — |

---

## 3. 「本环境跳过」标注规则

满足以下任一条件时填写 `⏭ 本环境跳过` 并附原因：

1. **本机无 Mac 设备** → macOS Chrome/Safari 行全填 `⏭ 本环境跳过（无 Mac 设备）`
2. **Edge 浏览器无法完成 ASR**（如 Web Speech API 不支持）→ 填 `⏭ 本环境跳过（Edge 不支持 Web Speech ASR）`
3. **豆包额度耗尽且无法切换 2.0** → 填 `⏭ 本环境跳过（豆包额度耗尽，无法合成）`
4. **麦克风硬件不可用** → 填 `⏭ 本环境跳过（无可用麦克风）`

**当前环境事实**（经探查确认）：
- Chrome：✅ 已安装（`C:\Program Files\Google\Chrome\Application\chrome.exe`）
- Edge：✅ 已安装（`C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe`）
- 麦克风：✅ 可用（iKF-V11 Pro(7.1) 耳机麦，PnpDevice Status OK）
- 豆包 TTS：✅ 服务端已配置（`mcp-gaode/.env` 存在），后端直连已验证通过（执行进度 §4）
- macOS：❌ 本机无 Mac 设备

---

## 4. 显式不做

| # | 不做事项 | 依据 |
|---|---------|------|
| X1 | 不修改 mcp-gaode / extern-api 业务代码与默认配置 | 需求原文「明确不做」 |
| X2 | 不提交 .env、Token、原始音频进文档或仓库 | 需求原文 + playbook 硬禁区 |
| X3 | 不扩展为「重做 M18 功能」或「接入新 TTS 厂商」 | 需求原文「明确不做」 |
| X4 | 不在无麦克风时硬测 ASR（若硬件异常则写清阻塞，完成文档闭环） | 需求原文「明确不做」 |
| X5 | 不做 macOS 实测（无 Mac） | 需求原文 + 本环境跳过规则 |
| X6 | 不 npm install / rebuild / 安装新依赖 | 需求硬约束 |
| X7 | 不 git push / 不提交任何变更 | 需求硬约束 |
| X8 | 不调用 feishu_doc / feishu_drive 等飞书工具 | playbook 硬禁区（飞书双写由编排者 main） |
| X9 | 不产出其他角色的交付物（Arch/DevLead/TestEngineer 等） | SOUL.md 角色边界 |
| X10 | 不要求 MCP health 通过即可自行绕过；MCP 失败→停跳上报 | playbook 硬禁区 |

---

## 5. 验收口径（映射用户验收①~④）

| 用户验收 | 映射到本文条目 | 验证方法 |
|----------|---------------|----------|
| ① 矩阵与报告中 Win Chrome 结果完整（✅/❌/跳过+原因） | N1 + M1 + T1/T2 | H4 核对 AI代码测试报告.md §矩阵 + README.md §1，确认 Win Chrome 行每格有状态+原因 |
| ② Edge 有结果或明确跳过原因 | M1 + T3/T4 | 同上，确认 Win Edge 行不为空 |
| ③ README 勾选与报告一致；无密钥泄露 | M1/M2/M3 ↔ N1 | H4 逐格交叉核对；全文搜索 `DOUBAO_TTS` / `APP_ID` / `ACCESS_KEY` / `Token` 确认未泄露 |
| ④ H4 只需核对文档与勾选，不要求改代码 | 全体 | H4 只读核对交付物一致性，不下发代码修改 |

---

## 6. 约束引用

| 约束 | 来源 |
|------|------|
| 不改业务代码/默认配置 | 需求原文「明确不做」§1 |
| 不改 mcp-gaode / extern-api | 需求原文「明确不做」§1 |
| 不提交 .env / Token / 原始音频 | 需求原文「明确不做」§2 |
| 不扩展为重做 M18 / 接入新厂商 | 需求原文「明确不做」§3 |
| 无麦写清阻塞，完成文档闭环 | 需求原文「明确不做」§4 |
| 飞书双写由编排者 main 负责 | playbook-pack-h1.md 硬禁区 |
| MCP 失败停跳，不臆造 | playbook-pack-h1.md 硬禁区 |
| UTF-8 only | 需求硬约束 |

---

## 7. 阶段门禁（stage-gate-flow）

- [x] 当前阶段输入已确认（需求原文 + 业务仓文件 → 已探查）
- [x] 阶段状态：H1 — 需求拆解/范围清单
- [x] 核心模块红色记录：本任务不涉及代码生成，仅文档产出 → 不适用
- [x] 本阶段 Lesson：无新教训（首次 H1 pm 任务）
- [x] 交付物 kind：scope-list（`h1-pm.scope-checklist.md`）+ 交接信封
- [ ] 下一阶段 H2 输入：Arch 复核 scope + 执行测试/回填文档

---

## 8. 交付物索引

| 文件 | 路径（run_dir = `Code/doc/phase4`） | 说明 |
|------|------|------|
| MCP 溯源 | `mcp-resolve-h1.yaml` | MCP health + agent/skill source + contentHash |
| Playbook 摘录 | `playbook-pack-h1.md` | 角色义务 / 出门清单 / 硬禁区 / sources |
| 范围清单（本文） | `h1-pm.scope-checklist.md` | 业务目标、范围条目、验收口径、约束 |
| 交接信封 | 见下文 `---SPLIT---` 后 YAML | from:pm to:arch |

# 架构约束与执行计划 — m18-browser-matrix (H2)

> **from**: arch（架构师）
> **to**: devlead / dev（H3 执行者）
> **project**: m18-browser-matrix
> **stage**: H2
> **deliverable.kind**: arch-constraints
> **前序**: H1 pm → `h1-pm.scope-checklist.md` + 交接信封
> **日期**: 2026-08-01

---

## 0. 范围准入复核（必读）

H1 scope-list 经过复核，**全部接受，无裁剪**。复核要点：

| 条目 | 复核结论 |
|------|---------|
| N1 新建 `AI代码测试报告.md` | ✅ 通过。目标文件不存在（已确认），H3 新建 |
| M1 README.md §1 矩阵回填 | ✅ 通过。当前矩阵全部为空 □，与 scope 一致 |
| M2 README.md §2 冒烟勾选 | ✅ 通过。#1~#4 待浏览器实测；#5~#7 已有 ✅ 不需重测 |
| M3 执行进度.md §4 追加验证行 | ✅ 通过。需在现有 §4 表格后追加 |
| M4 执行进度.md §6 待办更新 | ✅ 通过。勾掉 #1 或更新状态 |
| T1~T6 测试条目 | ✅ 通过。P0 覆盖 Win Chrome ASR/TTS，P1 覆盖 Win Edge，macOS 全跳过 |
| 显式不做 X1~X10 | ✅ 全部确认。无代码变更，无密钥泄露风险，无飞书调用 |

---

## 1. 架构约束

### 1.1 实测入口（产品边界对齐）

**约束 C1**：实测入口优先 **extern-api `/chat`**（端口 3002），与全局说明 §2 「用户主入口 = Extern_API `/chat`」一致。理由：

- extern-api 是方案 C 主产品线，TTS 已在此侧完整实现（`extern-api/server/services/voiceTtsService.js` + `doubaoTtsService.js` + 前端 `doubaoTtsPlayer.js`）
- 执行进度 §4 已记录 extern-api `/chat` 朗读端到端 ✅（2026-06-07），mcp-gaode `/chat` 朗读 ✅
- H1 决策明确：「实测入口优先 extern-api /chat」

**约束 C1.1**：若 extern-api 服务因任何原因不可用，回退到 mcp-gaode `/chat` 联调测试（需确认 `mcp-gaode/.env` 中 TTS 已配或临时配置）。

### 1.2 TTS Provider 固化

**约束 C2**：TTS provider 使用 doubao（`VOICE_TTS_PROVIDER=doubao`），不切换 local（本机 GPU TTS 路径验证属于 M18-E，非本任务范围）。

**约束 C2.1**：doubao 1.0 免费额度（约 5000 字符）若用尽 → 按执行进度 §3.1 切换 2.0（`DOUBAO_TTS_RESOURCE_ID=seed-tts-2.0` + 对应音色 `zh_female_vv_uranus_bigtts`）。H3 执行前需确认额度。

**约束 C2.2**：mcp-gaode 联调侧若需独立验证 TTS mcp-gaode `/chat`，H3 可自行决定是否在 `mcp-gaode/.env` 中配入 `DOUBAO_TTS_*`（H1 已放权）。若仅测 extern-api，mcp-gaode 侧 TTS 非必须。

### 1.3 浏览器矩阵分层策略

**约束 C3 — 矩阵执行分层**：

```
Layer 1 (P0) ── Win Chrome  ASR + TTS  →  必须实测 ✅/❌
Layer 2 (P1) ── Win Edge    ASR + TTS  →  有结果或明确 ⏭
Layer 3 (P1) ── macOS All   ASR + TTS  →  ⏭ 本环境跳过（无 Mac 设备）
```

**约束 C3.1**：Layer 2 (Win Edge) 的执行策略：Web Speech ASR 在 Edge 上的兼容性已知良好（Edge 基于 Chromium），但 H3 仍需在实际测试中确认 Web Speech API 是否可用。若 Edge SpeechRecognition 返回 `not-allowed` / `service-not-allowed` / 权限异常 → ⏭ + 原因，不阻塞。

**约束 C3.2**：朗读（TTS）在 Chrome/Edge 间预期行为一致（服务端合成，浏览器仅播放 blob: URL）。若某一浏览器朗读异常，记录原因而非重复全链路排查。

### 1.4 数据流（本次实测范围）

```
用户操作         浏览器 ASR              ChatPage.jsx         后端 TTS
                    │                      │                    │
Chrome/Edge         │                      │                    │
  点击麦克风 ──────► SpeechRecognition ────► 填入输入框          │
                    │  (Web Speech API)     │                    │
  点击发送 ────────────────────────────────► POST /api/chat/*    │
                                            │                    │
  点击朗读 ◄─────────────────────────────── POST /api/voice/tts ─► doubaoTtsService
                                            │  ◄── base64 mp3 ────┘
                                            │
                                          blob: URL → <audio>
```

**约束 C4**：H3 实测时不修改上述数据流中的任何组件（代码不变）。只记录终端行为：ASR 结果是否正确填入输入框、TTS 音频是否正常播放/停止。

### 1.5 文档模板与一致性

**约束 C5 — `AI代码测试报告.md` 结构**（H3 新建时必须包含以下 section）：

```markdown
# AI 代码测试报告 — M18 语音 浏览器矩阵
## 1. 测试环境
## 2. 浏览器矩阵结果（§1 回填表）
## 3. 功能冒烟结果（§2 回填表）
## 4. 测试日志/截图
## 5. 已知问题与风险
## 6. 结论与签字
```

**约束 C5.1**：报告中的矩阵行与 README.md §1 必须逐格一致（H4 交叉核对）。

**约束 C5.2**：测试日志/截图节禁止写入 `DOUBAO_TTS_*` / `APP_ID` / `ACCESS_KEY` / `Token` / 原始 audioBase64。

### 1.6 文件写准入

**约束 C6**：H3 仅允许修改以下文件（其他一律只读）：

| 文件 | 路径（相对业务仓根 `MechAssist-Fusion`） | 动作 |
|------|------|------|
| `AI代码测试报告.md` | `doc/方案C/方案C_M18_语音_mcp-gaode/测试与发布/` | **新建** |
| `README.md` | `doc/方案C/方案C_M18_语音_mcp-gaode/测试与发布/` | **修改 §1、§2** |
| `执行进度.md` | `doc/方案C/方案C_M18_语音_mcp-gaode/` | **修改 §4 追加、§6 更新** |

**禁止**修改：mcp-gaode 业务代码、`.env` 文件、`extern-api/` 下任何文件（除非 H3 自行决定在 mcp-gaode/.env 配 TTS — 此为 scope 允许的 H3 自主权）。

---

## 2. 执行计划（H3 devlead/dev 参考）

### Phase 1 环境确认（预估 5 min）

| 步骤 | 检查项 | 阻塞判定 |
|------|--------|---------|
| E1 | Chrome 可启动 → `chrome.exe` 存在 | ❌ 则全部 ❌ |
| E2 | Edge 可启动 → `msedge.exe` 存在 | 可 ⏭ P1 |
| E3 | 麦克风可用 → iKF-V11 Pro 状态 OK | ❌ ASR 阻塞 |
| E4 | extern-api 服务可访问 → `http://localhost:3002/chat` | 回退 mcp-gaode |
| E5 | TTS 额度充足 → 发一句测试朗读 | 额度耗尽→切换 2.0 |
| E6 | `AI代码测试报告.md` 不存在 → 确认可新建 | — |

### Phase 2 ASR 实测 (Win Chrome + Edge)

| 步骤 | 浏览器 | 操作 | 成功条件 | 输出 |
|------|--------|------|---------|------|
| A1 | Chrome | 打开 `/chat` → 点击麦克风 → 口述目的地（如"去天安门"） | 文本正确填入输入框，可编辑后发送 | 截图 + 状态 |
| A2 | Edge | 同上 | 同 A1；若 API 异常 → ⏭ + 原因 | 截图 + 状态 |
| A3 | Chrome | 浏览器设置中拒绝麦克风权限 → 返回页面点击麦克风 | 友好提示（降级为纯文本或权限提示） | 对应 README §2 #4 |

### Phase 3 TTS 实测 (Win Chrome + Edge)

| 步骤 | 浏览器 | 操作 | 成功条件 | 输出 |
|------|--------|------|---------|------|
| T1 | Chrome | `/chat` 发送消息 → 助手回复 → 点击「朗读」 | 音频播放，可停止 | 截图/录屏 |
| T2 | Edge | 同上 | 同 T1；预期行为一致 | 截图 |

### Phase 4 文档回填

| 步骤 | 文件 | 操作 |
|------|------|------|
| D1 | `AI代码测试报告.md` | 按约束 C5 结构填写：环境、矩阵、冒烟、截图、结论 |
| D2 | `README.md` §1 | 矩阵 Win Chrome 行填 ✅/❌，Edge 行填 ✅/❌/⏭+原因，macOS 行填 ⏭「本环境跳过（无 Mac 设备）」 |
| D3 | `README.md` §2 | #1~#4 实测后勾选或填 ⏭+原因；#5~#7 标注「已 ✅ 不重测」 |
| D4 | `执行进度.md` §4 | 追加浏览器矩阵实测行（格式对齐已有记录） |
| D5 | `执行进度.md` §6 | 勾掉待办 #1 或更新为「已完成 Win Chrome/Edge ASR + 朗读」|

### Phase 5 自检

| 检查 | 方法 |
|------|------|
| README §1 与 `AI代码测试报告.md` 矩阵行一致 | 逐格交叉核对 |
| 全文无 `DOUBAO_TTS` / `APP_ID` / `ACCESS_KEY` / `Token` | Ctrl+F 搜索 |
| 所有 macOS 行标注完整 | #5 #6 矩阵 + 冒烟 |
| `执行进度.md` §7 变更记录追加本次更新行 | 必须包含日期 + 说明 |

---

## 3. 开放问题裁定（Open Questions）

### 3.1 M18-7 已有验证记录 vs 矩阵回填

**H1 问题**：「执行进度.md §5 M18-7 已标注 `✅ Win Edge/Chrome 朗读 + Chat（extern /chat）`，但矩阵 §1 所有框为空：请 H2 裁定——将已有验证记录直接回填矩阵，还是重新实测后填入？」

**H2 裁定**：**重新实测后填入，不直接用已有记录回填。**

理由：
1. M18-7 的 ✅ 标记来自 **2026-06-07** 的 extern-api l朗读联调验证 + **阶段 A 验收**（`本地联调_A阶段验收.md`），距今约 2 个月。期间环境可能变化（豆包额度、浏览器版本、TTS 配置等）。
2. H1 scope 明确要求「实测」— 语义上要求当次执行验证，而非回溯旧记录。
3. M18-7 的记录是**朗读 + Chat 端到端**，但未区分 ASR / TTS 分别记录，也未明确覆盖「停止朗读」「权限拒绝」等冒烟 sub-item。
4. 用户验收口径：「Win Chrome 结果完整（✅/❌/跳过+原因）」—— 所谓完整要求每个格子有独立状态 + 原因，M18-7 的一行 "✅" 粒度不足。

**但**：旧记录可作为 **对照基线**（放入 `AI代码测试报告.md` §1 测试环境说明或 §4 日志节作为引用），帮助 H3 快速判断是否有回归。例如：

> "历史基线（2026-06-07）：extern-api `/chat` 朗读 ✅（doubao 1.0），Edge 朗读 ✅（长文合成 ~9.6s）。本次实测以此基线对照。"

### 3.2 mcp-gaode 前端依赖

**H1 问题**：「mcp-gaode 前端依赖是否完整（npm install 可通过）待 H3 首次启动验证」

**H2 裁定**：作为 H3 环境确认步骤 E4.1。若 npm install 失败（node_modules 缺失或依赖冲突），H3 可执行 `npm install`（此操作不修改仓库业务代码，属于环境准备）。若仍然失败，应记录阻塞并降级为「仅测 extern-api」—— extern-api 依赖独立，不依赖于 mcp-gaode 前端。

### 3.3 豆包 1.0 免费额度

**H1 问题**：「doubao 1.0 免费额度（~5000 字符）是否已用尽？若用尽，是否已按执行进度 §3.1 切 2.0？」

**H2 裁定**：作为 H3 环境确认步骤 E5。H3 在测试前发送一条简短朗读请求（如「测试」），观察是否正常返回。若失败且错误码指示额度耗尽 → 按执行进度 §3.1 切换 2.0。切换操作仅改 `.env`，不修改仓库代码（已在 scope 允许范围内）。

### 3.4 macOS 行标注格式

**H2 裁定**：统一格式为 `⏭ 本环境跳过（无 Mac 设备）`。**不要**缩写为「跳过」或省略「无 Mac 设备」原因。README §2 冒烟 #1 对应 macOS 行也使用相同格式。

### 3.5 执行进度 §5 M18-7 状态更新

H3 完成浏览器矩阵实测后，M18-7 的状态应从 `✅ Win Edge/Chrome 朗读 + Chat（extern /chat）` 更新为包含细分结果，如：

```
✅ Win Chrome ASR ✅ TTS ✅ / Win Edge ASR ✅(或⏭+原因) TTS ✅
```

---

## 4. 门禁清单（stage-gate-flow — H2 → H3 出门）

- [x] H2 输入已确认（H1 pm scope-list + 交接信封 + 业务仓探查）
- [x] 架构约束 C1~C6 已明确，覆盖入口/TTS/矩阵分层/文档模板/文件准入
- [x] 执行计划 Phase 1~5 已编排，预估路径清晰
- [x] H1 开放问题全部裁定（3 个 + 2 个补充裁定）
- [x] 核心模块红色记录：**不适用**（纯文档回填，无代码变更）
- [x] 本阶段 Lesson 已写入（见 §5）
- [ ] H3 接收确认：devlead/dev 确认约束与计划可执行

---

## 5. Lesson（本阶段）

**L-H2-001**：H1 PM 的 M18-7 标记 `✅` 在矩阵层面粒度不足——PM 将「朗读 + Chat 端到端验证」记为一条 ✅，但验收需要 ASR/TTS 逐格填入。建议后续 PM 阶段在矩阵状交付物上直接按格子标记状态，避免二维信息的扁平化折叠导致下游语义缺失。

**L-H2-002**：`执行进度.md` 存在路径不一致风险——README.md M18 目录中的 `../执行进度.md` 引用指向的是 `doc/方案C/方案C_M18_语音_mcp-gaode/执行进度.md`，但执行进度中自身 §4 也引用了 `../执行进度.md`。本次探查已确认文件位置正确，但建议 H4 复核时再踩一次路径交叉引用。

---

## 6. 证据索引

| 证据 | 路径 |
|------|------|
| MCP 溯源 (H2) | `Code/doc/phase4/run-m18-browser-matrix-20260801/mcp-resolve-h2.yaml` |
| Playbook 摘录 (H2) | `Code/doc/phase4/run-m18-browser-matrix-20260801/playbook-pack-h2.md` |
| H1 范围清单 | `Code/doc/phase4/run-m18-browser-matrix-20260801/h1-pm.scope-checklist.md` |
| 业务仓 README.md (矩阵 §1) | `doc/方案C/方案C_M18_语音_mcp-gaode/测试与发布/README.md` |
| 业务仓 执行进度.md | `doc/方案C/方案C_M18_语音_mcp-gaode/执行进度.md` |
| 业务仓 全局说明.md | `doc/方案C/方案C_M18_语音_mcp-gaode/全局说明.md` |
| 业务仓 AI代码测试报告.md | **尚不存在**（已确认 — H3 将新建） |

---

---SPLIT---

```yaml
from: arch
to: devlead / dev
project: m18-browser-matrix
stage: H2

deliverable:
  kind: arch-constraints
  path: Code/doc/phase4/run-m18-browser-matrix-20260801/h2-arch-constraints.md
  summary: >
    复核 H1 pm scope-list（全部接受）；输出架构约束 C1~C6（实测入口 extern-api
    /chat 优先、TTS=doubao 不切 local、矩阵分层 P0/P1/跳过、文档模板与一致性、
    文件写准入白名单）；执行计划 Phase 1~5；裁定 3 个 H1 开放问题 + 2 个补充裁定。

decisions:
  - "实测入口优先 extern-api /chat（端口 3002），与全局说明 §2 产品边界一致（H1 决策重申）"
  - "TTS provider = doubao（extern-api 已配），不切换 local（M18-E 不在本任务范围）"
  - "M18-7 已有验证记录仅作对照基线，不直接回填矩阵；H3 必须重新实测（时隔近 2 月，环境和验收粒度均需更新）"
  - "矩阵分层：Layer1 Win Chrome P0 必须实测；Layer2 Win Edge P1 有结果或 ⏭+原因；Layer3 macOS 全 ⏭"
  - "macOS 跳过统一格式：⏭ 本环境跳过（无 Mac 设备）"
  - "不触发《核心模块AI生成红色记录》（纯文档回填，无代码变更）"
  - "不调用 feishu_doc / feishu_drive 等飞书工具（飞书双写由编排者 main）"
  - "H3 可自行决定是否在 mcp-gaode/.env 配 TTS 以独立验证 mcp-gaode /chat（H1 已放权）"

open_questions:
  - question: "豆包 1.0 免费额度是否已用尽？"
    resolution: "H3 Phase 1 E5 实测前确认；若用尽→按执行进度 §3.1 切 2.0"
  - question: "mcp-gaode 前端依赖是否完整？"
    resolution: "H3 Phase 1 E4.1 确认；允许 npm install（环境准备），失败则降级仅测 extern-api"

gate:
  checklist: stage-gate-flow
  items:
    - "H2 输入已确认（H1 scope-list ✅）"
    - "架构约束 C1~C6 已明确"
    - "执行计划 Phase 1~5 已编排"
    - "H1 开放问题全部裁定"
    - "核心模块红色记录：N/A（纯文档）"
    - "本阶段 Lesson 已写入（L-H2-001, L-H2-002）"

evidence:
  - mcp-resolve-h2.yaml
  - playbook-pack-h2.md
  - h2-arch-constraints.md（本文）
  - h1-pm.scope-checklist.md（上游）

lesson_hint: >
  矩阵状交付物应按格子标记状态，避免扁平化成一句 ✅ 导致粒度缺失（L-H2-001）。
  执行进度.md 路径交叉引用需要在 H4 复核（L-H2-002）。
```

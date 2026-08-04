# 10 — 编排流水现网实现流程 + 优化点清单

> **文档级别**：四期运维 / 优化设计  
> **日期**：2026-08-04  
> **机器**：bm（证据来自本机 OpenClaw + Site 仓）  
> **Demo 真源**：[`../../Code/doc/phase4/run-ai-vg-web-ui-route1-20260803/`](../../Code/doc/phase4/run-ai-vg-web-ui-route1-20260803/)  
> **相关契约**：[`02`](02-orchestration-contracts.md) · [`06` SF-HS](06-single-facade-hop-snapshot.md) · [`07` M0](07-run-dir-m0-card.md) · [`08` 成本](08-cost-ledger-schema.md) · SOUL 草稿 `Code/orchestration/prompts/orchestrator-main-soul.draft.md`

**读法**：§1–§3 = 现状怎么跑；§4 = Demo 数据；§5 = 提升点（**特别标识**，含预估收益与改动面）。  
数字带「预估」的不是承诺 KPI，落地后用下一轮 `cost-ledger.yaml` + 墙钟对照本表复核。

---

## 1. 一句话现状

```text
飞书【新项目需求】
  → main（OpenClaw）M0 选 run-dir
  → H1 pm → H2 arch [∥ H2b ui]
  → M2 人签字停
  →（放行）H3 Cursor 写码 → H4 复验
```

- **大脑**：本机 OpenClaw Gateway + 命名 agent（pm/arch/ui…）+ `agents-skill-remote` MCP  
- **手脚**：本机 Cursor Agent CLI（H3）  
- **痕迹**：M0 选定的 `run-dir`（默认 `Code/doc/phase4/run-<短名>-<日期>/`）  
- **人不进代码跳**：M2 未放行前禁止 H3  

---

## 2. 端到端实现流程（按脚本/产物）

### 2.1 参与组件

| 层 | 路径 / 配置 | 作用 |
|----|-------------|------|
| 编排人格 | `~/.openclaw/workspace/SOUL.md`（草稿：`orchestrator-main-soul.draft.md`） | main 路由、门禁、防空转、升格 |
| 花名册 | `~/.openclaw/openclaw.json` · `setup-agents.ps1` | pm=pro / arch=pro / ui…=flash |
| MCP | `agents-skill-remote`（公网只读） | SF-HS：health → get_agent/skill → get_source_text |
| 派遣 | `invoke-openclaw-agent.cjs` | 绕开 PS5.1 argv；可选 `--cost-ledger` |
| M0 | `build-run-dir-card.cjs` + `resolve-run-dir.cjs` + `run-dir-presets.yaml` | 飞书卡选痕迹目录 |
| 成本 | `openclaw/cost/*.cjs` + `pricing.yaml` | 每跳 usage → `cost-ledger.yaml` |
| 出图（可选） | `openclaw/ui-image/generate-ui-image.cjs` | 路线1：H2b 写 JSON，main 调 ARK |
| H3 | MechAssist `invoke-cursor-agent.ps1`（SOUL 引用） | Goal 文件 + TimeoutSec |

### 2.2 跳序与门禁

```mermaid
sequenceDiagram
  participant U as 用户/飞书
  participant M as main OpenClaw
  participant PM as pm
  participant AR as arch
  participant UI as ui
  participant C as Cursor H3

  U->>M: 【新项目需求】
  M->>U: M0 卡（本回合停）
  U->>M: 选 phase4 / run_dir=
  M->>PM: invoke H1 + SF-HS
  PM-->>M: scope-list + envelope + pack
  M->>AR: invoke H2
  par 可选 UI
    M->>UI: invoke H2b
  end
  M->>U: M2 摘要+成本（本回合停）
  U->>M: 放行
  M->>C: invoke Cursor Goal
  C-->>M: 代码落盘
  M->>U: H4/闭环汇报
```

| 阶段 | 谁 | 输入 | 输出（落盘约定） | 停止条件 |
|------|-----|------|------------------|----------|
| **M0** | main | 需求短名 | 交互卡；确认后 `runDir` | **本回合停** |
| **H1** | pm | `h1.message.md` | `h1-*.md` / `handoff-h1.envelope.yaml` / `mcp-resolve-h1.yaml` / `playbook-pack-h1.md` | 信封四要素 + Pack 非空 |
| **H2** | arch | 上跳信封 + 范围清单 | arch 交付物 + envelope + Pack | 同上 |
| **H2b** | ui | H1（+H2 若已有） | UI 规范 + envelope；路线1 另写 `ui-image-request.json` | 无图可不挡 |
| **双写** | main | 本地 md | 飞书云文档链接 | create 须 folder_token |
| **M2** | 人 | 摘要 | 「放行」 | **本回合停**，禁开 H3 |
| **H3** | Cursor | `h3-goal.md`（灌 Pack 快照） | 业务仓代码 + raw | TimeoutSec；僵死即停 |
| **H4** | main/人 | 代码 | 复验记录 | 系统 node 复验（勿用 agent 内 node） |

### 2.3 单跳内部（文档跳 SF-HS）

对 **pm / arch / ui** 每一跳，消息稿要求：

1. `health` → `get_agent` → `get_skill`(1–N) → **`get_source_text`**（全文）  
2. 落盘 `mcp-resolve-hN.yaml`（无 token）+ `playbook-pack-hN.md`  
3. 写交付物全文 → stdout（或 raw）中 `---`SPLIT`---` → handoff YAML  
4. main：校验 →（文档类）`feishu_doc` 双写 → `append-cost-hop`  

**禁止**：子 agent 调飞书；用本机 Site 路径替代 MCP 正文主路径。

### 2.4 路线1 出图（可选支路）

```text
H2b → ui-image-request.json（无 Key）
  → main: generate-ui-image.cjs（Key 仅 ~/.openclaw/.env）
  → PNG → 规范 §0 image_path
  → H3 Goal 带规范路径 + 图路径
```

---

## 3. Demo：`run-ai-vg-web-ui-route1-20260803`

> 需求：AI Virtual Glasses Web/UI 调试控制台（路线1：脚本出图）  
> 短名：`ai-vg-web-ui-route1`  
> run-dir：`Code/doc/phase4/run-ai-vg-web-ui-route1-20260803/`

### 3.1 时间与跳数（台账）

摘自同目录 `cost-ledger.yaml`：

| 字段 | 值 |
|------|-----|
| `created_at` → `updated_at` | `2026-08-03T05:54Z` → `07:34Z` ≈ **~100 min** 墙钟 |
| `hop_count` | **4**（H1 / H2 / H2b / H3） |
| `tokens_total` | **1,415,669** |
| `tokens_input` / `output` / `cached_input` | 161,913 / 58,620 / **1,195,136** |
| 模型 | H1/H2：`deepseek-v4-pro`；H2b：`deepseek-v4-flash`；H3：`cursor/agent` |

### 3.2 每跳 tokens（Demo）

| Hop | role | model | tokens.total | 备注 |
|:---:|------|--------|-------------:|------|
| H1 | pm | v4-pro | 438,286 | trajectory **4** 个 session |
| H2 | arch | v4-pro | 449,040 | trajectory **4** 个 session |
| H2b | ui | v4-flash | 528,343 | 交付物最大 |
| H3 | cursor | subscription | 0（未计入 token） | 曾出现 ~30min 僵死 poll |

### 3.3 产物体积（Demo，约）

| 文件 | 约大小 | 说明 |
|------|-------:|------|
| `h1.message.md` | 3.4 KB | 消息稿 |
| `h2.message.md` | 5.6 KB | 内嵌上跳信封，偏重 |
| `h2b.message.md` | 4.2 KB | |
| `h1-scope-list` 类交付 | ~13 KB | |
| `h2b-ui.deliverable.md` | **~42 KB** | UI 规范全文 |
| `h2b-ui.raw.txt` | **0 B** | stdout 空；靠落盘抢救（已知 Lesson） |
| `h3-goal.md` | ~11 KB | 灌 Pack / 规范路径 |
| `playbook-pack-h1/h2/h2b` | 4–7 KB | SF-HS 快照 |
| 目录合计 | ~130 KB | 不含业务仓 `web/` 代码 |

### 3.4 目录骨架（Demo）

```text
run-ai-vg-web-ui-route1-20260803/
  h1.message.md / h1-*.md / handoff-h1.envelope.yaml
  mcp-resolve-h1.yaml / playbook-pack-h1.md
  h2.message.md / h2-*.md / handoff-h2.envelope.yaml / …
  h2b.message.md / h2b-ui.deliverable.md / handoff-h2b.envelope.yaml / …
  ui-image-request.json
  h3-goal.md / h3-run-wrapper.ps1
  cost-ledger.yaml / cursor-usage.json
```

### 3.5 瓶颈归因（对照 Demo）

| 现象 | 主因 |
|------|------|
| cached_input ≈ 总 token 的 84% | 多 session 轨迹叠加 + 每跳 MCP 全文 |
| H2b 最重 | UIDesigner / frontend-design / doc-coauthoring 全文 + 大规范 |
| 墙钟 ~100min | 串行跳 + 飞书双写 + **H3 空等** |
| raw 0 字节 | CLI stdout 空信封问题（已有 wrapper/Lesson，未根治流程侧） |

---

## 4. 与「只 /new」的关系

`/new` 只清**当前聊天**上下文，**不能**：

- 缩短子 agent 每跳 MCP 全文  
- 去掉 H3 僵死等待  
- 减少 SOUL 常驻体积  
- 合并飞书双写等待  

优化必须改：**契约 / SOUL / 消息模板 / 脚本 / 模型分档 / 超时纪律**。

---

## 5. 提升点清单（特别标识）

图例：

- **【提升】** 建议项  
- **预估** = 相对 Demo（~100min / ~1.4M tokens）的量级，落地后复核  
- **改动面** = 要碰的文件/配置  

---

### 【提升】P0-1 · H3 硬超时 + 僵死即停/续跑

| 项 | 内容 |
|----|------|
| **问题** | Cursor `-TimeoutSec 1200`；poll 无增量仍空等 ~30min（Lesson `2026-08-03-ai-vg-web-ui-h3-stale-process`） |
| **预估墙钟** | **−20～40 min / 次**（砍掉空等；有代码则直接 H4） |
| **预估上下文** | 主会话少烧 poll 轮次（中） |
| **改动什么** | ① 线上 `SOUL.md` + 草稿：TimeoutSec→**300–480**；连续 2 次无增量即上报并停 ② `h3-run-wrapper` 模板默认超时 ③ 可选：wrapper 检测业务仓文件 mtime 变化则标记「可续 H4」 |
| **验收** | 再跑一跳：卡住不超过新超时；用户说「跳过」立即 H4 |

---

### 【提升】P0-2 · 每跳强制新 isolated session

| 项 | 内容 |
|----|------|
| **问题** | Demo H1/H2 各挂 **4** 个 trajectory → cached 膨胀 |
| **预估 token** | cached **−40～70%**（文档跳）；总 token **−30～50%** 量级 |
| **预估墙钟** | **−5～15 min**（少工具环/少重读） |
| **改动什么** | ① `invoke-openclaw-agent.cjs` 默认加「新 session」类 flag（以 OpenClaw CLI 实测为准，如 `--session`/`isolated`） ② SOUL：禁止同 role 续旧会话跑新 hop ③ 台账 `notes` 记录 session_id 唯一性 |
| **验收** | 新 run 的每 hop `source.paths` **≤1** 条 trajectory |

---

### 【提升】P1-1 · 交付物只落盘，stdout 只回信封

| 项 | 内容 |
|----|------|
| **问题** | 契约要求交付物全文进 agent 最终回复；H2b ~42KB 灌会话 |
| **预估 token** | 文档跳 output/上下文 **−20～40%**；拆包更稳（对齐 raw=0 时的落盘抢救） |
| **预估墙钟** | **−3～8 min**（少生成/少传大段） |
| **改动什么** | ① `02` / SOUL / `h*.message` 模板：最终回复 = 路径 + envelope YAML；正文必须已写入 `*.deliverable.md` ② main 校验改「读文件」而非「解析 stdout 全文」 ③ `role-session.md` 同步 |
| **风险** | 须防「声称已写盘但文件空」——校验文件 size>0 + 含标题 |

---

### 【提升】P1-2 · H2 ∥ H2b 真并行 + 飞书双写挪到 M2

| 项 | 内容 |
|----|------|
| **问题** | 契约写并行，现网常串行；每跳双写阻塞 |
| **预估墙钟** | **−10～25 min**（UI 与 arch 重叠；少 1～2 次飞书往返穿插） |
| **预估 token** | 近似不变（并行不省 token） |
| **改动什么** | ① SOUL：H2 与 H2b **同时** `invoke`，汇合后再 M2 ② 双写：H1/H2/H2b 本地齐了再一次性 `feishu_doc` ③ 消息稿去掉「等 H2 完成再开 H2b」硬依赖（保留「待 arch 复核」标注即可） |
| **验收** | 日志显示两 invoke 重叠；M2 前才出现飞书链接 |

---

### 【提升】P1-3 · 消息稿增量引用（不粘贴上跳全文）

| 项 | 内容 |
|----|------|
| **问题** | H2 message 粘贴完整 H1 YAML，链式变重 |
| **预估 token** | 后续跳输入 **−10～25%** |
| **预估墙钟** | **−2～5 min** |
| **改动什么** | ① 消息稿模板：`prev_envelope_path` + `contentHash` ② 子 agent 用 `read` 打开路径 ③ main 在写 message 时只写指针 |
| **验收** | `h2.message.md` 体积接近 H1 message，不再随上跳膨胀 |

---

### 【提升】P2-1 · SOUL 拆模式附录

| 项 | 内容 |
|----|------|
| **问题** | 常驻 SOUL ~18KB：流水线+升格+成本细则全在 |
| **预估 token** | **main 每轮 −30～50% 系统提示**（仅日常编排时） |
| **预估墙钟** | main 回合略快（次要） |
| **改动什么** | ① 常驻：短路由+硬禁区 ② `SOUL-promote.md` / `SOUL-cost.md` 触发句再 read ③ 部署清单写明同步顺序 |
| **风险** | 忘同步附录会导致「同意升格」失效——部署检查表打勾 |

---

### 【提升】P2-2 · SF-HS hash 命中跳过 get_source_text

| 项 | 内容 |
|----|------|
| **问题** | 每跳强制拉 agent/skill **全文**（UI 系最重） |
| **预估 token** | 文档跳 **−20～40%**（重复项目连跑时更高） |
| **预估墙钟** | **−5～12 min**（少 MCP 往返+少读） |
| **改动什么** | ① `06` 契约：允许「hash 未变 → 复用上跳 Pack 片段」 ② 消息稿分支逻辑 ③ 可选 MCP 侧增 `get_meta`（若公网 MCP 未提供则先本地缓存 hash） |
| **验收** | 同日第二需求：mcp-resolve 显示 `cache_hit: true` 且无全文 toolResult |

---

### 【提升】P2-3 · 文档跳默认 flash，签字前可选 pro

| 项 | 内容 |
|----|------|
| **问题** | Demo H1/H2 用 v4-pro，延迟与费用高于 flash |
| **预估墙钟** | H1+H2 **−20～40%** 跳内时间（模型相关，波动大） |
| **预估费用** | DeepSeek 文档跳明显下降（按官方价） |
| **改动什么** | ① `openclaw.json` / `agents.example.yaml`：pm/arch 默认 flash ② SOUL：M2 前可选「升格复核」再跑 pro ③ `03` 路由表改分档说明 |
| **风险** | 架构质量可能波动——仅对「熟模板需求」默认 flash |

---

### 【提升】P2-4 · 快轨路由（小需求跳跳）

| 项 | 内容 |
|----|------|
| **问题** | 任何【新项目需求】都走满链 |
| **预估墙钟** | 小改 **−50～70%**（跳过 H2b/双写/甚至 H2） |
| **预估 token** | 同量级下降 |
| **改动什么** | ① SOUL 增加 `【快轨】` / 自动判定（无 UI、单文件） ② `02` 增加快轨表 ③ M0 卡可选「快轨」按钮（扩展） |
| **验收** | 飞书一条快轨需求 ≤ H1+H3+H4 |

---

### 【提升】P2-5 · 出图移出关键路径

| 项 | 内容 |
|----|------|
| **问题** | 路线1 出图穿插在 H2b→M2 之间，失败/慢会拖签字 |
| **预估墙钟** | 含出图需求 **−3～10 min** 到 M2（出图改异步） |
| **改动什么** | SOUL + 眼镜仓 pipeline 文：M2 可无图签字；放行后或 H3 前再跑 `generate-ui-image.cjs` |
| **验收** | 无 ARK 时仍能 M2；有图再补 §0 |

---

## 6. 汇总表（优先序）

| ID | 提升点 | 预估墙钟 | 预估 token/上下文 | 改动面 | 优先级 |
|----|--------|----------|-------------------|--------|:------:|
| P0-1 | H3 超时+僵死停 | −20～40 min | 中 | SOUL / h3 wrapper | **P0** |
| P0-2 | 每跳新 session | −5～15 min | cached −40～70% | invoke + SOUL | **P0** |
| P1-1 | 落盘正文 / stdout 信封 | −3～8 min | 文档跳 −20～40% | 02 / 消息模板 / main 校验 | P1 |
| P1-2 | H2∥H2b + 双写并到 M2 | −10～25 min | ≈0 | SOUL | P1 |
| P1-3 | 消息增量引用 | −2～5 min | −10～25% | 消息模板 | P1 |
| P2-1 | SOUL 拆附录 | 次要 | main 系统提示 −30～50% | SOUL 部署 | P2 |
| P2-2 | SF-HS hash 跳过全文 | −5～12 min | −20～40% | 06 + 消息 + 可选 MCP | P2 |
| P2-3 | 文档跳 flash | H1+H2 跳内 −20～40% | 费用↓ | openclaw.json | P2 |
| P2-4 | 快轨 | 小改 −50～70% | 同降 | SOUL + 02 | P2 |
| P2-5 | 出图异步 | 到 M2 −3～10 min | 小 | SOUL + 业务 pipeline | P2 |

**若只做 P0-1 + P0-2 + P1-2**：相对本 Demo，墙钟有机会从 ~100min 落到 **~40–60min** 量级（仍取决于 H3 真实编码时间）。

---

## 7. 建议落地节奏（bm `feature/bm`）

1. **本周 P0**：改 SOUL 草稿 → 同步 `~/.openclaw/workspace/SOUL.md` → 改 invoke 会话策略 → 用小需求烟测一跳 H3。  
2. **下周 P1**：改消息模板与 `02` 契约；跑一条含 UI 的需求，对比新 `cost-ledger.yaml` 填回 §6「实测」列。  
3. **再后 P2**：SOUL 拆分 / hash 缓存 / 快轨按钮。  

合入：在 `feature/bm` 提交 → PR → `develop`（勿直接改 `feature/home`）。

---

## 8. 复核模板（下一轮 Demo 粘贴）

```yaml
run_id: run-xxxxx
wall_clock_min:   # created→updated 或人工掐表
tokens_total:
tokens_cached_input:
trajectories_per_hop: { H1: 1, H2: 1, H2b: 1 }  # 目标全 1
h3_wait_min:      # 从 invoke 到停/续
notes:            # 启用了哪些【提升】ID
vs_baseline_100min: # 差值
```

基线：本文件 §3（`run-ai-vg-web-ui-route1-20260803`）。

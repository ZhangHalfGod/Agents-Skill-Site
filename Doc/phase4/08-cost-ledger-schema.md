# 成本台账字段草案（现网 DeepSeek / Cursor）

> **日期**：2026-07-31 · **实现**：2026-08-03  
> **状态**：字段契约 + 采集/计价脚本已落地（`Code/orchestration/openclaw/cost/`）  
> **范围**：bm Windows · OpenClaw DeepSeek 角色跳 + Cursor Agent H3  
> **非目标**：本版不写自动调档逻辑

## 1. 现网模型绑定（草案锚定）

摘自 bm `~/.openclaw/openclaw.json`（2026-07-31）：

| agentId | 模型 id | 典型跳 |
|---------|---------|--------|
| `pm` / `arch` | `deepseek/deepseek-v4-pro` | H1 / H2（重推理） |
| `ui` / `dev` / `test` / `sec` / `ops` | `deepseek/deepseek-v4-flash` | 轻跳 / 辅助 |
| Cursor H3 | Cursor Agent CLI（本机订阅/配额，模型由 Cursor 侧决定） | 写码 |

价格以 **运营商公开价或合同价** 填入 `pricing.yaml`；下表为**占位**，落地前必须改成实价（单位：USD / 1M tokens，或人民币注明）：

| model_id | input_per_1m (miss) | cached_input_per_1m | output_per_1m | currency |
|----------|--------------------:|--------------------:|--------------:|----------|
| `deepseek/deepseek-v4-pro` | 0.435 | 0.003625 | 0.87 | USD |
| `deepseek/deepseek-v4-flash` | 0.14 | 0.0028 | 0.28 | USD |
| `cursor/agent` | — | — | — | USD（subscription，amount=0） |

实价文件：[`Code/orchestration/openclaw/cost/pricing.yaml`](../../Code/orchestration/openclaw/cost/pricing.yaml)（以 DeepSeek 官网公开价为准，改价只改该文件）。

## 2. 落点文件（建议）

每个 run-dir 一份：

```text
<run-dir>/
  cost-ledger.yaml      # 本 Run 台账（机器 SoT）
  cost-pricing.ref.yaml # 可选：本 Run 冻结的单价快照（避免事后改价扯皮）
```

飞书 Goal 页底部「本 Run 成本」一行：由 `cost-ledger.yaml` 的 `totals` 渲染（人读）；**不以飞书为金额 SoT**。

共享单价表（仓内，无密钥）：

```text
Code/orchestration/openclaw/cost/pricing.yaml          # 现网采用
Code/orchestration/openclaw/cost/pricing.example.yaml  # 示例副本
Code/orchestration/openclaw/cost/append-cost-hop.cjs
Code/orchestration/openclaw/cost/collect-openclaw-usage.cjs
Code/orchestration/openclaw/cost/collect-cursor-usage.cjs
Code/orchestration/openclaw/cost/summarize-cost.cjs
```

OpenClaw 用量源：`~/.openclaw/agents/<role>/sessions/*.trajectory.jsonl` 中 `type=model.completed` → `data.usage.{input,output,cacheRead}`。

## 3. 顶层 schema（`cost-ledger.yaml`）

```yaml
schema_version: 1
run_id: swagger-ui-readonly-20260731
project: MechAssist-Fusion
goal_doc_url: "https://..."          # 可选
currency_primary: CNY                # 汇总展示币种
fx_note: "Cursor 若为 USD，按记账日汇率折算；汇率写入 totals.fx"
created_at: "2026-07-31T10:00:00+08:00"
updated_at: "2026-07-31T18:00:00+08:00"
status: open                         # open | sealed

hops: []                             # 见 §4
quality: {}                          # 见 §5
totals: {}                           # 见 §6
recommendations: []                  # 见 §7（仅建议，不自动执行）
```

## 4. 单跳记录 `hops[]`

一条 = 一次可计费调用（OpenClaw 一轮 agent 会话，或 Cursor 一次 `agent` 调用）。

| 字段 | 类型 | 必填 | 说明 |
|------|------|:----:|------|
| `hop_id` | string | ✅ | 如 `H1` / `H2` / `H3` / `H4`；同跳多次重试用 `H3#2` |
| `role` | string | ✅ | `pm` / `arch` / `dev` / `cursor` / … |
| `provider` | enum | ✅ | `deepseek` \| `cursor` \| `other` |
| `model_id` | string | ✅ | 与现网绑定一致，如 `deepseek/deepseek-v4-pro` |
| `billing_mode` | enum | ✅ | `token` \| `subscription` \| `unknown` |
| `started_at` / `ended_at` | ISO8601 | ○ | |
| `duration_ms` | int | ○ | |
| `ok` | bool | ✅ | 是否业务成功（失败也记成本） |
| `tokens.input` | int | ○* | prompt / input tokens |
| `tokens.output` | int | ○* | completion / output tokens |
| `tokens.total` | int | ○ | 若源只有合计可先填这个 |
| `tokens.cached_input` | int | ○ | 若 API 区分 cache |
| `cost.amount` | number | ○ | 本跳金额（按计价算出） |
| `cost.currency` | string | ○ | |
| `cost.pricing_ref` | string | ○ | 用的哪条单价（model_id + 日期） |
| `source.kind` | enum | ✅ | 见 §8 |
| `source.path` | string | ○ | 本地日志/会话相对 run-dir 或绝对路径 |
| `source.session_id` | string | ○ | OpenClaw / Cursor session id |
| `source.raw_excerpt` | string | ○ | 可选截断原文，便于对账 |
| `notes` | string | ○ | |

\* `billing_mode=token` 时至少要有 `input+output` 或 `total`；`subscription` 时可只记 tokens 作用量，金额标 `0` 并在 notes 写「包月摊销另计」。

### 示例一条（DeepSeek H1）

```yaml
- hop_id: H1
  role: pm
  provider: deepseek
  model_id: deepseek/deepseek-v4-pro
  billing_mode: token
  ok: true
  tokens: { input: 12000, output: 3500, total: 15500 }
  cost: { amount: 0.0, currency: CNY, pricing_ref: "deepseek-v4-pro@TBD" }
  source:
    kind: openclaw_session
    session_id: "..."
    path: ""   # 采集脚本解析后回填
```

### 示例一条（Cursor H3）

```yaml
- hop_id: H3
  role: cursor
  provider: cursor
  model_id: cursor/agent
  billing_mode: subscription   # 或 token（若 CLI 能给出可计价用量）
  ok: true
  tokens: { input: 0, output: 0, total: 0 }  # 从 CLI/日志填；未知则 0 + notes
  cost: { amount: 0, currency: USD, pricing_ref: "cursor-sub@month" }
  source:
    kind: cursor_cli
    path: "out/cursor-invoke.json"   # 相对 run-dir 约定
  notes: "包月套餐；本跳金额不计入现金，仅记用量与墙钟"
```

## 5. 质量字段 `quality`（与成本并列，供以后调档）

| 字段 | 类型 | 说明 |
|------|------|------|
| `retry_count` | int | 本 Run 因质量/失败重试次数 |
| `h3_pass` | bool | Cursor 交付是否一次过门禁 |
| `human_override` | bool | 是否人工改过方案/回滚 |
| `score_overall` | number 0–1 | 可选人工或规则分 |
| `score_notes` | string | |

**原则**：质量分**不自动改模型**；只进入 §7 建议。

## 6. 汇总 `totals`

```yaml
totals:
  tokens_input: 0
  tokens_output: 0
  tokens_total: 0
  cost_by_provider:
    deepseek: { amount: 0, currency: CNY }
    cursor: { amount: 0, currency: USD }
  cost_primary: { amount: 0, currency: CNY }   # 折算后主币种合计
  fx: { USD_CNY: null, as_of: null }           # 手工或脚本填
  hop_count: 0
  failed_hops: 0
```

飞书展示建议一行：

`本 Run：DeepSeek ¥x.xx · Cursor（包月/用量）· 合计折合 ¥y.yy · 跳数 n`

## 7. 建议 `recommendations[]`（人闸）

```yaml
recommendations:
  - id: R1
    at: "2026-07-31T18:00:00+08:00"
    kind: model_tier                 # model_tier | hop_skip | prompt_shrink
    message: "近 5 次 H1 均短需求，建议试用 flash 并 A/B"
    proposed_change:
      role: pm
      from: deepseek/deepseek-v4-pro
      to: deepseek/deepseek-v4-flash
    requires_human: true
    status: pending                  # pending | accepted | rejected
```

## 8. 数据来源（现网怎么取）

| `source.kind` | 现网位置（bm） | 预期字段 |
|---------------|----------------|----------|
| `openclaw_session` | OpenClaw 会话/transcript（`~/.openclaw/` 下 sessions；以本机实际布局为准） | model、input/output tokens、时长 |
| `openclaw_invoke_log` | 若 invoke 包装写了 run-dir 日志 | 同上 |
| `cursor_cli` | `MechAssist-Fusion` `invoke-cursor-agent` 的 result / stdout JSON | usage、model、elapsed |
| `manual` | 对账补录 | 任意 |

**采集优先级**：能自动解析则自动；解析不到 → `billing_mode=unknown`，tokens 空，仍记 hop 墙钟与成功失败，避免台账断档。

## 9. 计价公式（token 模式）

```text
cost = (tokens.input         / 1e6) * input_per_1m          # cache miss
     + (tokens.cached_input  / 1e6) * cached_input_per_1m   # cache hit（trajectory: cacheRead）
     + (tokens.output        / 1e6) * output_per_1m
```

- 仅有 `tokens.total` 时：拒绝自动计价（amount=null / billing_mode=unknown）。
- `subscription`：`cost.amount=0`，用量仍累加到 `totals.tokens_*`。

## 10. 与编排闭环的挂点（实现时）

| 时机 | 动作 |
|------|------|
| 每跳结束（H1/H2/H3/H4） | append 一条 `hops[]` |
| Run 收口 / 飞书结案 | 重算 `totals`，可选写飞书一行 |
| 每周 | 聚合多 Run → 生成 `recommendations`（人审） |

**不改**：SF-HS、Lesson 路径、M0 卡；仅在 run-dir 增文件。

## 11. 验收

- [x] 字段覆盖现网 DeepSeek pro/flash + Cursor H3
- [x] 区分 token / subscription
- [x] 质量与建议分栏，禁止自动调档
- [x] 单价表填 DeepSeek 官方公开价（USD）
- [x] `collect-openclaw-usage` / `append-cost-hop` / invoke `--cost-ledger`
- [ ] 真实编排 Run 全链路飞书贴出 summarize 一行（人工冒烟）

## 12. 示例骨架（可直接复制到 run-dir）

```yaml
schema_version: 1
run_id: REPLACE
project: REPLACE
currency_primary: CNY
created_at: "REPLACE"
updated_at: "REPLACE"
status: open
hops: []
quality:
  retry_count: 0
  h3_pass: false
  human_override: false
totals:
  tokens_input: 0
  tokens_output: 0
  tokens_total: 0
  cost_by_provider:
    deepseek: { amount: 0, currency: CNY }
    cursor: { amount: 0, currency: USD }
  cost_primary: { amount: 0, currency: CNY }
  fx: { USD_CNY: null, as_of: null }
  hop_count: 0
  failed_hops: 0
recommendations: []
```

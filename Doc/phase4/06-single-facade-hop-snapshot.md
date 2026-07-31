# 06 — Single-Facade MCP + Hop Snapshot（SF-HS）

> **文档级别**：四期流程契约  
> **日期**：2026-07-31  
> **依赖**：[`04-tool-registration.md`](04-tool-registration.md) · [`02-orchestration-contracts.md`](02-orchestration-contracts.md)  
> **样板**：`Code/orchestration/openclaw/templates/`

---

## 1. 一句话

**说明书只从公网 `agents-skill-remote` 取（单门面）；派 Cursor 前冻成 Playbook Pack 写入 Goal（跳界快照）。**  
Cursor **禁止**再调 Site MCP、**禁止**再读 Site 仓说明书。

## 2. 流水线

```text
OpenClaw 文档跳（pm/arch）
  health → get_agent / get_skill → get_source_text（正文）
  → 交付物 md + handoff 信封
  → mcp-resolve-hN.yaml + playbook-pack-hN.md

M2 放行后
  main 合并 pack（缺 DevLead 则补查 MCP）
  → h3.goal.md 内嵌 Playbook Pack + 定稿要点
  → invoke-cursor-agent（只吃 Goal，改业务仓）
```

## 3. 落盘件

| 文件 | 职责 |
|------|------|
| `mcp-resolve-hN.yaml` | 索引快照：endpoint、agent/skill id、source、contentHash（无 token） |
| `playbook-pack-hN.md` | 从 `get_source_text` 摘出的角色义务 / 出门清单 / 硬禁区 |
| `handoff-hN.envelope.yaml` | 既有业务交接（decisions / path / gate） |
| `h3.goal.md` | 定稿要点 + **整段 Playbook Pack** + 实施/验收 |

模板：[`../../Code/orchestration/openclaw/templates/`](../../Code/orchestration/openclaw/templates/)

## 4. 与形态 A（飞书）分工

- 飞书双写：人对人交付物（scope / constraints）  
- SF-HS：AI 说明书路径与正文  
- Playbook Pack **默认不进飞书**（可在门禁摘要写「说明书包已灌入 Goal」）

## 5. 验收

- [ ] OpenClaw `mcp list` 仅见 `agents-skill-remote`（本流水线不挂 gaode/faq）
- [ ] 会话内 `get_source_text` 对 `stage-gate-flow` 返回 `ok` + `text`
- [ ] 某次 H2 run-dir 含 `mcp-resolve-*.yaml` + `playbook-pack-*.md`
- [ ] H3 Goal 含 Playbook Pack，且写明禁止再调 MCP / 再读 Site 说明书
- [ ] 密钥未进信封 / Goal / 飞书

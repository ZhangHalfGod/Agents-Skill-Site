# 00 — 四期交接上下文

> **文档级别**：四期交接（服从 S0）  
> **日期**：2026-07-29  
> **分支**：`feature/phase4-memory-orchestration`  
> **前置阅读**：[`../SYSTEM-DIRECTION.md`](../SYSTEM-DIRECTION.md) §1～§3 → 本文 → [`01`](01-cross-project-memory.md) → [`02`](02-orchestration-contracts.md)

---

## 1. 为什么有四期

[`../当前亮点与后续发展.md`](../当前亮点与后续发展.md) 排了四个优先级，四期做前两个：

| 优先级 | 方向 | 四期落点 |
|:------:|------|----------|
| ① | 跨项目记忆复用：Lesson 不再按项目隔离，相似教训自动浮现并推送到通用 skill 库 | **4A**（本仓，已落地） |
| ② | OpenClaw 做 Agent 编排总线：Agent 间不靠手动 @，session routing 自动流转 | **4B**（契约 + 样例进本仓；运行时在部署侧） |
| ③ | 成本观测与自动化模型调配 | 四期不做，待 4B 路由表稳定后立项 |
| ④ | 远期探索 | 不做 |

## 2. 已确认决策（2026-07-29，三项）

| # | 问题 | 结论 |
|---|------|------|
| D1 | 记忆复用自动化程度 | **规范 + 半自动扫描**：Lesson Card 加「适用范围」字段；扫描脚本跨项目聚类并出升格建议清单；**人终审** |
| D2 | 编排总线落地形态 | **契约文档 + 配置样例进本仓**（`Doc/phase4/` + `Code/orchestration/`）；真实 OpenClaw 配置与凭证留部署侧（`MechAssist-Fusion/scripts/openclaw/`） |
| D3 | OpenClaw 接口资料 | 以部署侧真实资料为准：`MechAssist-Fusion/doc/remote-agent-openclaw/` + `scripts/openclaw/`；文档覆盖不到的接口点在 `03` 中标注「待验证」 |

## 3. 拓扑：哪个仓干什么

| 仓 | 四期职责 |
|----|----------|
| **本仓 Agents-Skill-Site** | 4A 全部（卡片字段、扫描脚本、SOP）；4B 契约文档 + 配置样例；SoT 与索引不变 |
| `MechAssist-Fusion`（外部仓） | OpenClaw 部署与运维脚手架（`scripts/openclaw/`）；真实渠道/密钥配置；编排试点执行面 |
| 各业务仓 | 交付物落盘（范围清单 / 架构约束 / 代码 / 报告）；Lesson 按项目写回对应治理仓 operations |

## 4. S0 对齐声明（硬约束逐条对照）

| S0 条款 | 四期如何遵守 |
|---------|--------------|
| §3.2-2 网站禁止做成 Agent 运行时 | 编排会话跑在 OpenClaw 部署侧；本仓只存契约/样例/扫描脚本，站点无任何会话执行代码 |
| §3.2-3 MCP 不替网站（只读第二门面） | 4B 挂进 OpenClaw 的 MCP 服务沿用只读工具；**不新增任何 MCP 写工具** |
| 蒸馏经人工判断（三期惯例） | `lessons:scan` 只出建议清单；升格合入走 operations README「升格操作步骤」，人终审 |
| §3.1-9 模板与实例分离 | Lesson 仍先落 `operations/<project>/`；升格才进 `skills/custom/common/**` |
| §7 改方向必留日志 | 四期启动已追加 §8 决策日志（见 [`../CHANGELOG.md`](../CHANGELOG.md) 同行摘要） |

## 5. 范围边界（明确不做）

- 不做 MCP 写接口（Lesson 仍由 Agent 写工作区文件）
- 不做脚本自动合入 skill 正文（扫描 = 建议，合入 = 人）
- 不做网站内编排 UI / 会话面板
- 不自研 Agent-to-Agent 协议（用 OpenClaw session routing + 交接信封）
- 不接 `extern-api` 公网 Chat 主链路进编排总线（四期 v1 不动）
- 不动模型分层比例（仅把分层写进路由表；成本观测属优先级③）

## 6. 执行顺序与验收

```text
4A（A1 卡片 v2 → A2 lessons:scan → A3 SOP 挂钩）→ 4B（B1 契约 → B2 样例 → B3 试点 → B4 治理对齐）
```

验收清单见三期同款位置：本文 §7；逐条勾选后进 `Code/doc/phase4/` 写实现笔记。

## 7. 四期关门定义

- [x] A1 卡片 v2：模板 + phase3 规范同步；3 条存量回填 `scope`/`promoted_to`
- [x] A2 `npm run lessons:scan` 看板 + 聚类 + 建议；`--strict` 可阻断非法 frontmatter
- [x] A3 operations README / 触发句 / PR 模板挂钩更新
- [x] B1 五篇契约文档齐（00～04）
- [x] B2 `Code/orchestration/` 样例（路由 / 工具注册 / 交接信封 / Prompt 模板）
- [x] B3 OpenClaw 最小两跳试点（PM→Architect）跑通，证据落 `Code/doc/phase4/`；试点 Lesson 走 4A 流程（2026-07-29 bm 实测）
- [x] B4 S0 §8 + CHANGELOG + 亮点文档状态更新；`npm run generate && npm run validate` 绿（2026-07-29 hash=11551bc5b589d320）

（B3/B4 已完成；机制 A 与 q004/q005 已于 2026-07-29 下午实测定案，见 [`03-openclaw-route-table.md`](03-openclaw-route-table.md) §6。剩余：H3 起全链路推广、信封 schema 机器校验、mcp 挂接字段级验证。）

## 8. 端到端全景（4A + 4B 一条链）

> 2026-07-29 逐环核对后的修正版；每环标注验证状态。

```text
① 飞书 → OpenClaw Gateway（长期在线）：项目需求进来
② 文档跳（OpenClaw 内，机制 A ✅）：PM → Architect 等命名 agent 在 session 里产出
   范围清单 / 架构约束 + 交接信封（角色可经 agents-skill-remote MCP 查绑定，见 04）
③ 代码跳（机制 B 模式 ✅）：按需拉起无头 Cursor CLI（invoke-cursor-agent.ps1），
   走 demo 流程：health → get_agent → get_skill → @ source 清单干活 → 阶段出门
④ 踩坑/出门：触发句记 Lesson → 写回本仓 operations/<项目>/lessons/（raw，集中真源）
⑤ 周一 09:00：weekly-lesson-digest 推飞书 ✅ → 人工逐条终审（merged/distilled/rejected）
⑥ merged → 公共 skill 注册 ✅（清单见 05 §⑤）→ 下个项目的 agent 绑定里就有它
```

两个易错点（已纠正）：

- **OpenClaw 不会「识别到 Cursor 连上」**：两个运行时互相不感知；Cursor 是被按需派遣的无头进程，跑完即走。MCP 配置写在项目仓 / 用户设置里，任何 Cursor 会话（手动或无头拉起）都自带 `agents-skill-remote`。
- **Lesson 不写业务仓**：统一回本仓 `Code/code/docs/zh/operations/<project-id>/lessons/`——集中才能跨项目聚类、进周推；业务仓只收代码产出。

验证状态诚实版：每一环均单独验证过（机制 A ✅ / Cursor CLI 派遣模式 ✅ / 记卡→周推→终审→升格 ✅ 2026-07-29 首跑）；「飞书进、代码出」**全自动端到端尚未一次性连跑**（目前由人或 orchestrator prompt 按契约驱动），为下一验证点。

流程参考：单环细节 [`../guides/mcp-work-then-distill-demo.md`](../guides/mcp-work-then-distill-demo.md)；记忆闭环 Runbook [`05`](05-lesson-memory-loop.md)；路由与机制 [`03`](03-openclaw-route-table.md)。

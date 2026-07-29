---
id: 2026-07-29-main-agent-persona-injection
project: openclaw-orchestration-pilot
date: 2026-07-29
audience: skill
audience_guess: skill
target_id: ""
priority: P2
status: raw
scope: common
seen_in_projects: [openclaw-orchestration-pilot]
promoted_to: ""
related_agents: [ProductManager, Architect]
related_skills: [stage-gate-flow]
---

# Lesson：单 main + 消息内 persona 注入跑通两跳（机制 A 未验证时的保底路径）

## 现象

编排总线最小两跳试点（PM → Architect）：命名 agent（pm/arch）与 per-agent 模型绑定在 OpenClaw 部署侧尚未验证（机制 A），但改用 `openclaw agent --agent main` 单 session、在消息内注入「角色 persona 文件路径 + 交接契约 + 已定决策 + 悬置问题」，两跳信封交接一次跑通：交付物必备章节齐全，H1 的 q001~q003 在 H2 全部收口为 d005~d007，信封字段完整。

另：首次 H1 调用被人为中断（约 45s），重发同一条消息后 agent 回复「文件已就位（上次轮次已产出）」——同 session 续跑有效，中断不等于重来。

## 期望

- v1 编排试点统一走「main + 消息内 persona 注入」路径（写入路由表机制 B 段落），命名 agent 注册验证通过后再切机制 A
- 每跳消息模板固化：persona 路径 / 上一跳交付物路径 / 已定决策（不可推翻）/ 悬置问题 / 输出路径 / 只回信封
- 中断重发同一 session，勿新开

## 当时上下文

- 角色：编排试点（本机 Cursor 侧发起 `openclaw agent --agent main`）
- 技能：stage-gate-flow（信封 gate 引用）
- 摘要：默认模型 `deepseek/deepseek-v4-flash`；H1 约 30s、H2 约 97s；证据在 `Code/doc/phase4/pilot/`

## 建议沉淀形态

- [ ] 新 skill
- [ ] 扩写已有 skill checklist
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule（须说明重复次数）
- [x] 仅项目内保留，不升格（待机制 A 验证、更多试点重复后，再考虑升格进编排契约 `Doc/phase4/03` §3 机制段落或新 skill）

## 证据

- 试点交付物与信封存档：`Code/doc/phase4/pilot/`（4 个文件）
- 路由表机制 A/B 定义：`Doc/phase4/03-openclaw-route-table.md` §3

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：
- 变更摘要：

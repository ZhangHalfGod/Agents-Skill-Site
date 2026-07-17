---
id: 2026-07-17-mcp-health-not-host-curl
project: stage-gate-exit-evidence
date: 2026-07-17
audience: skill
audience_guess: skill
target_id: stage-gate-flow
priority: P2
status: merged
related_agents: [OpsEngineer, TestEngineer]
related_skills: [stage-gate-flow]
---

## 现象

三期 A～D 出门时，本机会话无法 SSH 跑 ECS 上带 Host 的 `curl`，仅凭 Cursor 侧 `agents-skill-remote` 的 `health`（`ok: true`）就勾「部署验收通过」；这与 `deploy-verify.md` 要求的静态站 / Host 探测**不完全等价**，容易把「MCP 索引可读」当成「整站部署已验收」。

## 期望

- 出门清单部署项拆开勾：MCP health / healthz 与「带 Host 的静态站 + manifest」分开记证据  
- 本机无 SSH 时：部署项标「部分证据 / 待 ECS 补 Host curl」，勿默认全绿  
- 仍禁止无 Host 的 `curl 127.0.0.1` 误判 404  

## 当时上下文

- 角色：站点维护 / 出门门禁试跑  
- 技能：stage-gate-flow + deploy-verify（@ 正文，MCP 只读 list/get/health）  
- 摘要：PR #1 已合 main；远程 health 绿、dataSource 为 ECS 本地 manifest；未在本会话执行 Host curl

## 建议沉淀形态

- [x] 扩写已有 skill checklist（deploy-verify：证据分层）  
- [ ] 新 skill  
- [ ] 改 agent 职责或矩阵绑定  
- [ ] 升 L2 rule（须说明重复次数）  
- [ ] 仅项目内保留，不升格  

## 证据

- PR / commit / issue：PR #1 · `0a4f2e6`（phase3 B–D）  
- 相关已 merged Lesson：`docs/operations/ecs-deploy-host404/lessons/2026-07-17-nginx-host-false-404.md`

## 蒸馏笔记

- 升格目标路径：`docs/skills/custom/common/stage-gate-flow/docs/deploy-verify.md`（证据分层表）+ 主页出门清单一句  
- 变更摘要：MCP health ≠ Host 静态站探测；无 SSH 时标部分证据，勿默认全绿  

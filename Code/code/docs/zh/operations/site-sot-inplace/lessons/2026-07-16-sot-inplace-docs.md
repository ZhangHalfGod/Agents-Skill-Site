---
id: 2026-07-16-sot-inplace-docs
project: site-sot-inplace
date: 2026-07-16
audience: agent
audience_guess: agent
target_id: ""
priority: P1
status: merged
related_agents: []
related_skills: []
---

## 现象

日常迭代依赖「外仓改 Markdown → `STANDARDS_ROOT` → `npm run sync`」双仓流程，与三期「成长性迭代」摩擦大，且本仓并不自带 `standards/`。

## 期望

只在本仓 `docs/**` 增删改 agents / skills / rules / operations；`npm run generate` 只刷新 manifest 与侧栏，不再从外仓拷贝正文。

## 当时上下文

- 角色：站点维护 / 三期规划  
- 技能：—  
- 摘要：确认方案 B + 就地 docs；不执行「导出到 standards 布局」可选步骤。

## 建议沉淀形态

- [x] 改 agent 职责或矩阵绑定（流程与文档约定）  
- [x] 仅项目内保留，不升格（本 lesson 记录决策）  

## 证据

- 决策：`Doc/SYSTEM-DIRECTION.md` §8 `2026-07-16-01`  
- 脚本：`Code/code/scripts/sync-standards.mjs`（generate）  
- 路径：`Code/code/docs/operations/`

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：S0 / README / phase3 上下文（流程文档）  
- 变更摘要：废止双仓日常 sync；本仓 docs = SoT  

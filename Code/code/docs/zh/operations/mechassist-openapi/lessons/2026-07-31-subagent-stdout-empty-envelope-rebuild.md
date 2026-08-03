---
id: 2026-07-31-subagent-stdout-empty-envelope-rebuild
project: mechassist-swagger-ui-readonly
date: 2026-07-31
audience: rule
audience_guess: rule
target_id: "SOUL.md 流水线编排模式·每跳标准动作"
priority: P2
status: raw
scope: domain
seen_in_projects: [mechassist-openapi-voice, mechassist-swagger-ui-readonly]
promoted_to: ""
related_agents: [pm, arch]
related_skills: []
---

## 现象

连续两个文档跳（H1 pm、H2 arch）均出现：子 agent 按消息稿要求把交付物/mcp-resolve/playbook-pack 直接落盘到 run-dir，但 `invoke-openclaw-agent.cjs` 的 stdout 回传为空（`h<N>-<role>.raw.txt` 为 0 字节），`split-reply.cjs` 拆不出信封。H2 消息稿已明确要求「交付物与信封必须在回复正文完整输出」，但 arch 仍只落盘不回传正文。

## 期望

- 消息稿在「输出契约」中把「回复正文必须包含交付物全文 + ---SPLIT--- + 信封 YAML」提到最高优先级，并注明「仅落盘文件不算完成，正文缺失按拒收处理」
- 编排者侧：raw 为空但 run-dir 文件齐备时，允许从交付物原文逐字重建信封（decisions 必须逐字引用，不得改写），并在信封 lesson_hint 中记录重建事实；重建不视为同跳不合格
- 若连续 2 跳都正文缺失，考虑在 invoke 脚本或消息稿模板层加硬校验

## 当时上下文

- 角色：main（编排者）
- 技能：SOUL.md 流水线编排模式
- 摘要：H1/H2 两次派遣均 EXIT=0 但 raw 0 字节；交付物文件内容完整、质量合格；信封由编排者从 h1-pm.scope-checklist.md / h2-arch.constraints.md 逐字重建 decisions 后继续流转，未触发拒收重派。

## 建议沉淀形态

- [ ] 新 skill
- [ ] 扩写已有 skill checklist
- [x] 改 agent 职责或矩阵绑定（消息稿输出契约措辞）
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- run-dir: D:\trae_git\MechAssist-Fusion\doc\run-swagger-ui-readonly-20260731（h1-pm.raw.txt / h2-arch.raw.txt 均为 0 字节；handoff-h1/h2.envelope.yaml 为编排者重建版）

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：
- 变更摘要：

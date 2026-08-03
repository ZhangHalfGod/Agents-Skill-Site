---
id: 2026-08-02-mcp-docs-openapi-align-corrected-lesson-propagation
project: mcp-docs-openapi-align
date: 2026-08-02
audience: skill
audience_guess: skill
target_id: ""
priority: P1
status: raw
scope: project
seen_in_projects: [mcp-docs-openapi-align, openapi-doc-sync]
promoted_to: ""
related_agents: [Architect, DevLead]
related_skills: [openclaw-ops]
---

# Lesson：已纠正的事实结论会跨 run 复现——lesson 修正版需显式标注「推翻旧结论」

## 现象

openapi-doc-sync（同日早些时候）H4 已实测 `GET /api/docs` 返回 200（`chatRoutes.js:828` 经 `toMountPath(API_PATHS.API_DOCS)` 挂载），推翻了该 run H2「无路由→404」的假阴性结论，并写入修正版 Lesson 卡。但同日下午 mcp-docs-openapi-align 的 H2 arch agent 再次给出「/api/docs 无路由、预期 404、§7 不列入联调清单」的旧错误结论——修正版 lesson 未被下游消费，错误结论跨 run 复现。编排者（main）以自身 H4 实测证据纠正后才放行 H3，H4 复验确认 /api/docs 200。

## 期望

- 已纠正的事实结论（尤其「实测推翻推断」类）在 lesson 卡中必须**显式标注「推翻 xx 结论」**，而非仅写正确结论，便于下游 agent 检索到「旧说法是错的」
- 编排者组装 Goal 时，对涉及历史结论的约束做一次事实复核（必要时起服务 curl），不以 agent 转述为准
- H4 实测应覆盖文档中所有新写入的链接（本 run 4/4 端点均 200）

## 当时上下文

- 角色：编排者（H2 交付物中发现旧结论复现 → 纠正 → H3 Goal 内嵌纠正事实 → H4 实测验证）
- 技能：openclaw-ops
- 摘要：MCP接入文档.md 补 §9 四端点索引 + §2.1/§7/§8 同步；纯文档 +24 行；H4 四端点 200（含 /api/docs）；grep 文档无「未实现/404」矛盾表述

## 编排侧踩坑（同 run 记录）

1. **H2 派遣 billing 瞬时失败**：deepseek-v4-pro「API key 余额不足」报错（EXIT=1 无产出）；重试一次即成功。**建议**：billing/瞬时错误重试 1 次再上报人工，先查 run-dir 有无半成品。
2. **H2 信封内嵌文件第 4 次出现**：arch 回复仍只有摘要，完整交付物+信封在文件里。main 从文件提取。**强烈建议**：编排流程正式允许「文件内嵌 SPLIT + 回复摘要」双通道，固定提取规则，别再当异常处理。
3. **split 覆盖 agent 富文件**（第 3 次）：split-reply 输出同名覆盖 agent 落盘的更完整版本。**建议**：拆分前先比较 reply 交付物与既有文件大小，取更完整者；或改拆分目标文件名为 `-reply` 后缀。

## 建议沉淀形态

- [ ] 新 skill
- [x] 扩写已有 skill checklist（openclaw-ops：lesson 修正版显式标注「推翻」；Goal 组装时事实复核；billing 重试 1 次；split 不覆盖富文件）
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- H4 独立复验（main，系统 node）：GET /v2/、/api/openapi.json、/api/openapi.yaml、/api/docs → 均 HTTP 200
- 文档核对 10/10：含四端点、§9 存在、同源 registry.js 说明、端口 3002、无「未实现/规划中/404」矛盾、§2.1 补行、§8 索引
- git diff：仅 `doc/方案C/方案C_文档对齐/MCP接入文档.md` +24 行
- 产物：run-mcp-docs-openapi-align-20260802（三跳信封/mcp-resolve/playbook-pack/h3 报告+信封/h4-check.cjs/m2-gate-sign.yaml）
- 本 session 2026-08-02（run-mcp-docs-openapi-align-20260802）

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：
- 变更摘要：

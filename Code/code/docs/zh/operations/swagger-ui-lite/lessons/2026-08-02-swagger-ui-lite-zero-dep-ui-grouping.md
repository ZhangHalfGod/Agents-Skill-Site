---
id: 2026-08-02-swagger-ui-lite-zero-dep-ui-grouping
project: swagger-ui-lite
date: 2026-08-02
audience: skill
audience_guess: skill
target_id: ""
priority: P1
status: merged
scope: common
seen_in_projects: [swagger-ui-lite]
promoted_to: docs/zh/skills/custom/common/openclaw-ops/docs/orchestration-pitfalls.md
related_agents: [ProductManager, Architect, DevLead]
related_skills: [openclaw-ops, ai-code-boundary]
---

# Lesson：零依赖 UI 方案——CSP 先查再选型，分组映射容忍未列 segment

## 现象

swagger-ui-lite 托管轻量 API 浏览页（GET /api/docs/ui 加载 /api/openapi.json）。因 node_modules 无 swagger-ui-dist 且 CSP 无 CDN 域，选择「自研极简 HTML」（独立文件 server/views/swagger-ui.html + res.sendFile），零依赖、无需放宽 CSP（scriptSrc 已含 'unsafe-inline'）。网关层新增端点触发红色记录（H2 登记 → H3 五项自检 → H4 实测）。H4：页面 200/text/html、7 组映射命中、live spec 实际 11 组（voice/system/docs/gateway 等未映射段按原样显示）、/api/openapi.json 行为不变。

## 期望

- UI 托管类需求先查 CSP 与依赖现状再选型：CDN 方案需放宽 CSP（新域 + connectSrc），自研 inline 方案在 'unsafe-inline' 已存在时零改动
- 分组映射表对未列出的路径段采用「按原样显示」兜底，避免新 slug 出现时整页失效
- 网关层新增端点（即使纯静态）也走红色记录：H2 登记 → H3 自检（无注入/无遍历/无密钥）→ H4 实测

## 当时上下文

- 角色：编排者（H4 独立复验：curl 页面 + live spec 分组复算）
- 技能：openclaw-ops / ai-code-boundary
- 摘要：openapiRoutes.js +14 行（/docs/ui sendFile 固定路径）+ views/swagger-ui.html ~153 行（fetch 分组渲染、escapeHtml、失败降级）；H4 4/4 全过

## 编排侧踩坑（同 run 记录）

1. **feishu token 第 3 次手滑**：本次是把截断 token 又加了空格（`SrZJdw…pn pb`）→ 400；用完整 22 位 id 成功。**建议**：写 feishu_doc 时直接从 create 返回的 document_id 原样复制，禁止手打/缩写。
2. **H2 信封内嵌文件第 7 次出现**：arch 回复仅摘要、完整交付物+信封在文件内；main 提取归档。**强烈建议**：编排流程正式化「文件内嵌 SPLIT + 回复摘要」双通道（已连续 7 run 100% 出现，固定规则即可）。
3. **H1 富文件覆盖流程已固化**：先 split 到临时名 → 比大小 → 保留大者（本 run 及上 run 均未再覆盖）。**建议**：保持该流程。

## 建议沉淀形态

- [ ] 新 skill
- [x] 扩写已有 skill checklist（openclaw-ops：UI 托管先查 CSP/依赖；分组映射兜底；feishu token 原样复制；信封双通道正式化）
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- H4 独立复验（main，临时实例 PID 16048，端口 3002，验后已关）：
  - GET /api/docs/ui → HTTP 200 + Content-Type text/html; charset=UTF-8
  - HTML 含 7 组映射 key（auth/chat/faq/repair-records/admin/release/other）+ fetch('/api/openapi.json') + escapeHtml + 失败降级
  - live spec 分组复算：11 组（auth,chat,voice,system,faq,repair-records,admin,docs,release,gateway,other）≥5 ✅
  - GET /api/openapi.json → 200（行为不变）
- git：openapiRoutes.js +14 行；新增 extern-api/server/views/swagger-ui.html（5666B）
- 产物：run-swagger-ui-lite-20260802（三跳信封/mcp-resolve/playbook-pack/h3 报告+信封/h4-*.cjs/m2-gate-sign.yaml）
- 本 session 2026-08-02（run-swagger-ui-lite-20260802）

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：
- 变更摘要：

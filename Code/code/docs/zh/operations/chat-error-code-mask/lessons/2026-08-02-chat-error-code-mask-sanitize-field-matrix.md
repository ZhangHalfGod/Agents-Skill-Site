---
id: 2026-08-02-chat-error-code-mask-sanitize-field-matrix
project: chat-error-code-mask
date: 2026-08-02
audience: skill
audience_guess: skill
target_id: ""
priority: P1
status: merged
scope: common
seen_in_projects: [chat-error-code-mask]
promoted_to: docs/zh/skills/custom/common/openclaw-ops/docs/orchestration-pitfalls.md
related_agents: [ProductManager, Architect, DevLead]
related_skills: [openclaw-ops, ai-code-boundary]
---

# Lesson：脱敏函数必须按「字段矩阵」盘点——只脱敏 message 会漏 error.code

## 现象

聊天工具失败时 `sanitizeEnvelopeForLlm` 只替换 `error.message`，`error.code`（AMAP_/QUOTA_/MCP_/ARK_ 等内部码）经 spread 原样保留，随 `summarizeMcpEnvelopeForLlm` → JSON.stringify 注入 LLM prompt，LLM 可能复述到用户可见回复。修复：`stripErr` 内对匹配 LEAK_PATTERNS 的 `code` 执行 `delete`（top-level + nested result.error 共用该函数，一处修改全覆盖），LEAK_PATTERNS 追加 `^QUOTA_`/`^MCP_`/`^ARK_` 前缀，prompt 加「不得复述内部错误码」，单测 T1-T4 覆盖。

## 期望

- 凡脱敏/清洗函数，先列「字段矩阵」：message / code / url / headers / 嵌套 result 等每个敏感字段的脱敏行为（脱敏/删除/保留），再写实现与单测
- 单测必须含：top-level + nested 两条路径、命中前缀、安全码保留、null/undefined 保留
- 内部错误码前缀是持续演进的枚举 → 集中维护（LEAK_PATTERNS）并定期按新工具前缀补录

## 当时上下文

- 角色：编排者（H4 独立复验：系统 node 重跑 vitest + 直接 import 模块注入 AMAP_ERROR 场景）
- 技能：openclaw-ops / ai-code-boundary（红色记录边界：service 层脱敏工具 N/A，但需 H4 验证 delete 语义）
- 摘要：M1a stripErr delete unsafe code；M1b LEAK_PATTERNS +3；M2 T1-T4（+48）；M3 prompt +1；diff 3 文件 +59/-2；vitest 10/10（原 6 + 新 4）；H4 注入 8 场景全过

## 编排侧踩坑（同 run 记录）

1. **H3 首派 ECONNRESET 中断**（53.6s，EXIT=1，无产出）：cursor-agent 偶发传输错误；重派前先 `git status` 核对无半成品（3 目标文件均未动）→ 直接重派成功（60.6s）。**建议**：H3 派遣失败先查 git 有无半成品，无则直接重派，不必走拒收流程。
2. **H2 信封内嵌文件第 3 次出现**（openapi/workdir/chat 三连）：arch agent 回复只给摘要，完整交付物+信封写进文件。main 均从文件提取归档。**建议**：编排流程应改为「交付物落盘 + 信封必须进回复」的机器校验，或正式允许双通道并固定提取规则。
3. **正面经验**：H2 给出精确伪代码 + 用例表（Given/Then）→ H3 一次通过；H4 用「直接 import 模块注入验收场景」比全量测试更精准覆盖用户验收（8/8）。

## 建议沉淀形态

- [ ] 新 skill
- [x] 扩写已有 skill checklist（openclaw-ops：脱敏字段矩阵；H3 派遣失败先查半成品再重派；信封进回复校验）
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- H4 独立复验（系统 node v22.22.0）：
  - `npx vitest run server/services/mcpToolUserMessages.test.js` → Test Files 1 passed / Tests 10 passed (309ms)
  - 注入场景 8/8：top-level AMAP_ERROR/AMAP_ERR → code 删除；nested QUOTA_EXCEEDED/MCP_TIMEOUT/ARK_QUERY_FAILED → code 删除；VALIDATION_ERROR 保留；code:null 保留；用户可见内容（sanitize 输出）无 AMAP_/QUOTA_/MCP_[A-Z]/ARK_[A-Z]
- git diff：3 文件 +59/-2（mcpToolUserMessages.js +12/-2、test.js +48、chat-system-v1.md +1）；无关工作区改动未触碰
- 产物：run-chat-error-code-mask-20260802（信封/mcp-resolve/playbook-pack/h3 报告+信封/h4-check.cjs/m2-gate-sign.yaml）
- 本 session 2026-08-02（run-chat-error-code-mask-20260802）

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：
- 变更摘要：

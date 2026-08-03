---
id: 2026-07-30-ps51-openclaw-cli-argv-stdout
project: mechassist-openapi
date: 2026-07-30
audience: skill
audience_guess: skill
target_id: ""
priority: P2
status: merged
scope: common
seen_in_projects: [mechassist-openapi]
promoted_to: docs/zh/skills/custom/common/powershell-utf8/index.md
related_agents: [OpsEngineer]
related_skills: [powershell-utf8, openclaw-ops]
---

# Lesson：PS 5.1 调 openclaw CLI 双向皆坑——argv 引号拆分 + stdout 乱码，node wrapper 双杀

## 现象

端到端首跑 H2 跳：消息文件内含 YAML 双引号字符串（信封 decisions），`openclaw agent --agent arch --message (Get-Content -Raw -Encoding UTF8 ...)` 直接报 `Too many arguments for this command`。根因：**PowerShell 5.1 向 native 命令传参时不转义内嵌双引号**，argv 被拆碎（PS 7.3+ 的 `$PSNativeCommandArgumentPassing` 才修；消息无引号的 H1 跳恰好侥幸通过）。

同族另一坑（H1 跳实发）：openclaw CLI（node）stdout 为 UTF-8，PS 5.1 按系统 ANSI/GBK 解码接管 → 中文全乱码，写文件即损失。

## 期望

- 凡编排侧调 `openclaw agent`，一律走 `Code/orchestration/openclaw/invoke-openclaw-agent.cjs`：node `spawnSync` 数组传参（引号/换行免疫）+ stdout 按 UTF-8 解码（乱码免疫），消息从文件读
- 应急替代：`[Console]::OutputEncoding=[Text.Encoding]::UTF8` 可修 stdout 方向，但修不了 argv 引号方向
- 已乱码的输出**不必重跑**：agent session 转录在 `~/.openclaw/agents/<id>/sessions/*.jsonl`，直接读文件提取最后一条 assistant 消息即为干净全文（本跳 H1 即如此抢救，零 token 损耗）
- 与既有 powershell-utf8 的分工：encoding 坑管「字节怎么读」，本坑管「argv 怎么传」——同一会话两类坑都踩了
- 触发条件是**引号**（与消息长度/换行无关）：H1 消息无引号幸存，H2 消息含信封 YAML 双引号即炸

## 当时上下文

- 角色：编排执行器（Cursor 侧 Shell 驱动 `openclaw agent --agent pm/arch`）
- 技能：powershell-utf8（同族 PS5.1 native 交互坑，此前只覆盖文件读写与 .ps1 BOM，未覆盖 native argv/stdout）
- 摘要：H1 乱码 → jsonl 抢救；H2 argv 拆分 → wrapper 落地，后续跳全部改走 wrapper

## 建议沉淀形态

- [ ] 新 skill
- [x] 扩写已有 skill checklist（powershell-utf8 或 openclaw-ops 增补「native argv/stdout」两条；wrapper 用法进 openclaw-ops）
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- wrapper：`Code/orchestration/openclaw/invoke-openclaw-agent.cjs`
- 乱码原件与抢救产物：`Code/doc/phase4/e2e-openapi/h1-pm.raw.txt`（乱）vs `h1-pm.clean.txt`（jsonl 提取）
- H2 报错原文：`Code/doc/phase4/e2e-openapi/h2-arch.raw.txt` 首跑残留（"Too many arguments"）

## 蒸馏笔记（status=merged 后填）

- 升格目标路径：docs/zh/skills/custom/common/powershell-utf8/index.md
- 变更摘要：powershell-utf8 增两条 checklist：PS5.1 调 native CLI 不转义内嵌双引号（argv 拆分，走 node wrapper）；stdout UTF-8 被 GBK 解码乱码（OutputEncoding 只修 stdout 方向，jsonl 提取干净全文）

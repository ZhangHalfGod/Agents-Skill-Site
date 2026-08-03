---
id: 2026-08-02-workdir-whitelist-skill-template-dual-write
project: workdir-whitelist
date: 2026-08-02
audience: skill
audience_guess: skill
target_id: ""
priority: P1
status: merged
scope: common
seen_in_projects: [workdir-whitelist]
promoted_to: docs/zh/skills/custom/common/openclaw-ops/docs/orchestration-pitfalls.md
related_agents: [ProductManager, Architect, DevLead]
related_skills: [openclaw-ops, code-via-cursor-cli]
---

# Lesson：生成器会覆盖静态 SKILL 文档——白名单/行为说明必须双写模板与副本

## 现象

workdir-whitelist 任务给 `invoke-cursor-agent.ps1` 加 WorkDir 白名单并同步文档。H3a 发现 `scripts/openclaw/common/coding/configure-cursor-code.ps1` 会**重新生成并覆盖仓内 SKILL.md**（含 invoke-cursor-agent 用法），若只改静态 SKILL.md 不改生成器模板，下次运行 configure 会把白名单说明抹掉。因此 P1（configure-cursor-code.ps1 模板）必须与 M3（SKILL.md 静态副本）**同步双写**。

## 期望

- 凡「生成器产出文档 + 仓内静态文档副本」并存的场景，改动必须双写：生成模板与静态副本同步改，否则下一次生成即回滚
- 文档同步类任务的范围清单应显式排查生成器（configure/install/template 脚本），不能只扫 .md

## 当时上下文

- 角色：编排者（H3a 派遣后核对 diff 发现 P1 必要性；H3a agent 自行评估后同步）
- 技能：code-via-cursor-cli / openclaw-ops
- 摘要：M1 业务仓副本 + M2 编排仓副本插入白名单（6 仓 + WORKDIR_WHITELIST 追加 + GetFullPath 归一化 + -notin 精确 + 中文 FAIL + exit 1）；M3 SKILL.md；P1 configure-cursor-code.ps1 模板同步。H4 实测 7/7：两份副本 ×（白名单外拒绝 / 白名单内放行 / env 追加放行）

## 编排侧踩坑（同 run 记录）

1. **H2 信封再次内嵌交付物文件**（openapi run 同款，第 2 次出现）：arch 回复只有摘要，完整交付物+信封写进 h2-arch-constraints.md；main 从文件提取信封归档。**建议**：文档跳输出契约增加「信封必须在回复」的机器校验，或允许双通道并固定提取规则。
2. **H4 中文输出编码坑**：PowerShell 5.1 `Write-Output` 中文经管道被 node utf8 捕获成 GBK 乱码（`FAIL: 工作目录不在白名单中` 显示为 mojibake），首轮 7 项判定误报 4 FAIL；改用 `TextDecoder('gbk')` 解码后 3/3 拒绝路径确认通过。**建议**：校验脚本中文输出时用 GBK 解码或读文件比对；脚本文件本身 UTF-8 正确（控制台/管道编码分离）。
3. **正面经验**：H2 精确到行号+伪代码的约束（两份脚本插入点、GetFullPath 补齐、FAIL 文案/退出码）让 H3a/H3b 一次通过；跨两仓改动分两次派遣（各自 WorkDir）比单次跨仓更稳。
4. **红色记录流程走通**：网关层安全 AI 生成代码（白名单）按 ai-code-boundary 登记（H2 §3）→ H3 五项自检 → H4 独立实测验收（白名单内可跑 / 白名单外拒绝不启动 agent / 中文 FAIL）。

## 建议沉淀形态

- [ ] 新 skill
- [x] 扩写已有 skill checklist（openclaw-ops：文档同步须排查生成器；编排契约：信封必须进回复 + 中文输出 GBK 校验）
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- H4 独立实测（main，非 agent 自报）：7 项功能用例全过——B1/O1 白名单外 C:\Windows → `FAIL: 工作目录不在白名单中: C:\Windows` + exit 1 + 无 RUN agent；B2/O2 白名单内（MCP_Gaode_Map / Agents-Skill-Site）→ 通过白名单进入 agent 启动（TimeoutSec=3 超时属预期）；B3/O3 `WORKDIR_WHITELIST` 追加测试目录 → 放行；B4 未追加同目录 → 拒绝
- 结构核验：两份脚本均含 whitelist 块（6 仓 / GetFullPath / -notin / FAIL 中文 / exit 1 / env 追加）；SKILL.md 含「白名单」+「WORKDIR_WHITELIST」
- git diff（业务仓）：3 文件 +38 行（invoke-cursor-agent.ps1 +20、SKILL.md +12、configure-cursor-code.ps1 +6）；编排仓仅 invoke-cursor-agent.ps1（该文件在仓内未跟踪，属既有状态）
- 产物：run-workdir-whitelist-20260802（H1/H2 信封、mcp-resolve、playbook-pack、h3a/h3b 报告+信封、h4-*.cjs、m2-gate-sign.yaml）
- 本 session 2026-08-02（run-workdir-whitelist-20260802）

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：
- 变更摘要：

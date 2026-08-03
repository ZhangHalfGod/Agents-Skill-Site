---
id: 2026-07-30-cursor-cli-node-abi-rebuild
project: mechassist-openapi
date: 2026-07-30
audience: skill
audience_guess: skill
target_id: ""
priority: P1
status: merged
scope: common
seen_in_projects: [mechassist-openapi]
promoted_to: docs/zh/skills/custom/common/openclaw-ops/index.md
related_agents: [DevLead, OpsEngineer]
related_skills: [openclaw-ops]
---

# Lesson：无头 Cursor CLI 里跑 npm rebuild 会按"它自带的 node"翻转原生模块 ABI + 残留验收服务占锁

## 现象

代码跳（invoke-cursor-agent.ps1）中，CLI agent 为了让 baseline 测试转绿执行了 `npm rebuild better-sqlite3`——但用的是 **cursor-agent 自带 node 24**（NODE_MODULE_VERSION 137），把模块从系统 node 22（127）的 ABI 翻转了；系统 node 起服务直接报版本不匹配。更隐蔽的是：agent 自报"验收服务已关闭"，实际**残留了一个 cursor-agent node 起的 `server/server.js` 进程**持有 `better_sqlite3.node` 文件锁，导致系统侧 rebuild 也 EBUSY/EPERM 失败。编排侧连环排障：定位占锁进程（Get-Process Modules 枚举）→ 杀残留 → 按系统 node 重建 → 服务/测试才恢复。

## 期望

- 代码跳 Goal 硬约束加一条：**禁跑 `npm rebuild`/`npm install` 类改写 node_modules 的命令**；原生模块 ABI 问题上报编排侧处理，不自行修
- 代码跳收尾后编排侧例行检查：有无残留 server 进程（ cursor-agent node 路径特征明显），有则杀
- 必须 rebuild 时，以"跑服务的那个 node"为准；rebuild 前确认无进程持有 `.node` 文件锁
- agent 报告测试通过时问一句"用的哪个 node"——`process.version` 写进红色记录更稳
- `npm rebuild` 失败先看是不是锁文件（EBUSY/EPERM unlink）→ 找锁主（`Get-Process | Modules` 枚举），别盲目重试

## 当时上下文

- 角色：代码跳独立复核（编排侧不信 agent 自报，亲自起服务/curl/跑全量测试时发现）
- 技能：openclaw-ops（known issue 候选）
- 摘要：agent 自报 43/1 全绿属实（在其 node 24 环境下）；但副作用（ABI 翻转 + 残留进程）未自报，独立复核才暴露

## 建议沉淀形态

- [ ] 新 skill
- [x] 扩写已有 skill checklist（openclaw-ops「代码跳副作用」两条；invoke-cursor-agent.ps1 注释或 code-via-cursor-cli skill 加硬约束句）
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- 复核过程记录：本 session 2026-07-30（服务启动报 NODE_MODULE_VERSION 137→127 不匹配；Get-Process 枚举到 pid 持有模块，CommandLine = cursor-agent node 起 server/server.js）
- 修复后系统 node 22 全量测试 43 pass / 1 fail（唯一 fail 为存量 vitest 冲突，与本跳无关）

## 蒸馏笔记（status=merged 后填）

- 升格目标路径：docs/zh/skills/custom/common/openclaw-ops/index.md
- 变更摘要：openclaw-ops 可执行清单增两条：代码跳收尾查残留 server 进程（cursor-agent node 特征，按 PID 清杀）；无头 Cursor CLI 禁跑 npm rebuild/install（ABI 翻转）

---
id: 2026-07-31-h3-agent-node-env-vs-system-node
project: mechassist-swagger-ui-readonly
date: 2026-07-31
audience: rule
audience_guess: rule
target_id: "SOUL.md 流水线编排模式·代码跳（H3）与独立复验（H4）"
priority: P2
status: raw
scope: domain
seen_in_projects: [mechassist-swagger-ui-readonly]
promoted_to: ""
related_agents: [dev, test]
related_skills: []
---

## 现象

H3 代码跳的 dev agent 报告「全量 node server/server.js 因 better-sqlite3 ABI（127 vs 137）起不来（禁 rebuild，已上报），冒烟改用临时 Express 进程完成」。但 H4 用**系统 node**（v22.22.3）在同一工作区直接 `node server/server.js`（PORT=3012）启动成功：日志显示「后端服务器启动完成」、DB 表加载正常、所有关键端点实测通过。说明 cursor-agent 环境的 node（或其加载的原生模块）与系统 node 存在 ABI/版本差异，agent 自报「起不来」并不代表系统环境起不来。

## 期望

- H4 独立复验必须用系统 node 重试 agent 报告的「环境阻塞」，不能直接采信「起不来」结论
- H3 goal 中可加一句：若 agent 遇到原生模块 ABI 问题，除上报外仍需说明「是否已用系统 node 重试」；起服冒烟尽量用 `PORT=<新端口>` 覆盖，避免与存量监听端口冲突（本次 3002 已被改动前代码的存量服务占用，3012 正常起服）
- 端口冲突处理：先 `netstat` 查占用，不杀存量服务，换端口验证

## 当时上下文

- 角色：main（编排者）
- 技能：SOUL.md 流水线编排模式·H4 独立复验
- 摘要：extern-api 端口 3002 被 10:52 启动的存量服务占用（改动前代码，未动）；H3 agent 称 better-sqlite3 ABI 起不来；H4 用系统 node + PORT=3012 起新实例成功，curl 全部通过，验完按 PID 精准杀掉自起实例（28092），存量 30032 保留。

## 建议沉淀形态

- [ ] 新 skill
- [ ] 扩写已有 skill checklist
- [x] 改 agent 职责或矩阵绑定（H3 消息稿 + H4 复验 checklist）
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- run-dir: D:\trae_git\MechAssist-Fusion\doc\run-swagger-ui-readonly-20260731\h3-dev.raw.txt（agent 自报 ABI 起不来）
- H4 实测：h4-verify-http.cjs 全部 OK（/api/docs/swagger 200、/api/docs openapi.swagger、/api/openapi.json 3.0.3 paths=28 含 voice）；h4-srv2.out.log 显示启动完成

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：
- 变更摘要：

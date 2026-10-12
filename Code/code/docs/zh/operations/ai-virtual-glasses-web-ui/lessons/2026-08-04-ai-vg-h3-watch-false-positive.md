---
id: 2026-08-04-ai-vg-h3-watch-false-positive
project: ai-virtual-glasses-web-ui
date: 2026-08-04
audience: agent
audience_guess: agent
target_id: "main"
priority: P1
status: raw
scope: project           # project | domain | common
seen_in_projects: []
promoted_to: ""
related_agents: [main]
related_skills: []
---

## 现象

1. `check-h3-done.cjs --expect-commit` 的 `ai_commit_present` 分支只检查仓库 HEAD 是否含 `[AI生成]`，
   **不校验该 commit 是否属于当前 run**。run-imu-20260804 的 `822e4cf` 成为 HEAD 后，run-ws-push-20260804
   在 watch 登记仅 28 秒（14:57:51 → 14:58:19）即被误判 H3 完成、误触发自动 H4——而此时该 run 的 H3
   从未真正启动（无 h3-dev.raw.txt、无 invoke-cursor-agent 进程、无本 run 提交）。
2. 若误触发后把 `h4TriggeredAt` 留在 watch 文件里，`register-h3-watch.cjs` 会对该 run **跳过重注册**
   （`h4_already_triggered`），导致 H3 真正跑完后自动 H4 永久失效——复位时必须清掉 `h4TriggeredAt`。
3. 编排者组装完 goal+wrapper+register 后被打断（watchdog 消息抢先到达），wrapper 的
   invoke-cursor-agent 一步未执行，属于「登记了但从未启动」，不是「重跑」。

## 期望

- `ai_commit_present` 生效前必须校验 commit 时间 >= 本 run watch `startedAt`，否则判定为跨 run 误报
  （提示语明确写出 commit 时间与 run 开始时间，供人快速定位）。
- 误触发处置三件套：不伪造 H4 闭环 + 清除 `h4TriggeredAt` 复位 `status=watching` + 写误报证据文件；
  补丁未提交前提示人工复核。

## 当时上下文

- 角色：main（编排者，看门狗 H4 触发回合）
- 技能：openclaw 编排流水线（H3 看门狗 cron → poll-h3-watch → check-h3-done → 自动 H4）
- 摘要：同日第三个 run（ws-push 后端 WS 推送）；前两个 run（ws-stub / imu）均正常闭环，
  暴露了多 run 共用仓库时完成判定未绑定 run 身份的缺陷。

## 建议沉淀形式

- [ ] 扩写已有 skill checklist（openclaw 编排流水线：H3 完成判定规范 + 误触发复位三件套）
- [ ] 补丁正式提交：`check-h3-done.cjs` 的 commit-recency 守卫（当前仅工作区生效，未 commit）
- [x] 仅项目内保留，不升格

## 证据

- run-dir：`D:\trae_git\AI_Virtual_Glasses\docs\pipeline\run-ws-push-20260804\h4-false-positive.md`
- 补丁：`D:\trae_git\Agents-Skill-Site\Code\orchestration\openclaw\check-h3-done.cjs`
  （ai_commit_present 分支加 `commitMs >= runStartMs` 守卫；`node --check` 通过）
- 实测：ws-push 复检 → `done=false, exit 1`，hint 明确「belongs to another run」；
  imu run 复检 → 仍 `raw_has_summary, done=true`（无回归）
- watch 复位：`status=h4_pending→watching`、`h4TriggeredAt=2026-08-04T06:58:19.284Z→null`、`lastCheck→null`

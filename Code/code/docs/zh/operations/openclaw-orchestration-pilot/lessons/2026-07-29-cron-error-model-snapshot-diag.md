---
id: 2026-07-29-cron-error-model-snapshot-diag
project: openclaw-orchestration-pilot
date: 2026-07-29
audience: skill
audience_guess: skill
target_id: ""
priority: P3
status: merged
scope: common
seen_in_projects: [openclaw-orchestration-pilot]
promoted_to: docs/zh/skills/custom/common/openclaw-ops/docs/cron-troubleshooting.md
related_agents: [OpsEngineer]
related_skills: []
---

# Lesson：OpenClaw cron error 排查路径——先 cron get 看 lastError，别猜

## 现象

bm 三条 brief cron 任务（09:00×2、20:30×1）状态 error，另四条正常。`cron list` 的 Model 列全部显示 `-`（继承），看不出差异。

## 排查路径（实证有效，按序）

1. `openclaw cron get <job-uuid>` → `state.lastError` / `lastDiagnostics` 直接给出根因（本例：`403 Free quota exhausted`，`lastErrorReason: "auth"`）
2. `openclaw sessions list` → 各 cron isolated session 的 **Model 列 = 上次运行实际用的模型**，可发现「同继承、不同实跑模型」（本例：error 三条都跑 qwen3.7-max，ok 的都跑 flash——原因是默认模型切换发生在当天 09:21，之前的 run 还在旧默认上）
3. `openclaw cron runs <job-uuid>` → 历史 run 级明细

## 关键认知

- **`cron list` Model 列 `-` ≠ 实际运行模型**；session 列表才反映实跑模型（按 run 时默认解析，非 session 永久快照）
- **job 无模型 pin 时，改全局默认立即对下次 run 生效**，无需重建 job 或清 session
- 403 配额类 error 的 `lastDurationMs` 极短（本例 1.3s fail-fast），可与超时类（顶满 timeoutSeconds）一眼区分

## 修复（本例）

用户将全局默认模型切为 `deepseek/deepseek-v4-flash`；当晚 20:00/20:30 档自愈验证。

## 适用范围

scope=common：凡 OpenClaw cron 任务异常均可套此排查路径。

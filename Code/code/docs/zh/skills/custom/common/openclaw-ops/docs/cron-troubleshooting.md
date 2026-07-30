# cron error 三步排查法（回灌自 Lesson）

> 来源 Lesson：
> - `docs/operations/openclaw-orchestration-pilot/lessons/2026-07-29-cron-error-model-snapshot-diag.md`（merged）

## 排查路径（按序，勿跳步）

| 步 | 命令 | 看什么 |
|----|------|--------|
| 1 | `openclaw cron get <job-uuid>` | `state.lastError` / `lastDiagnostics` —— **直接给根因**（例：`403 Free quota exhausted`，`lastErrorReason:"auth"`） |
| 2 | `openclaw sessions list` | 各 cron isolated session 的 **Model 列 = 上次 run 实际用的模型**——可发现「同继承、不同实跑」 |
| 3 | `openclaw cron runs <job-uuid>` | 历史 run 级明细 |

⚠ `cron get/run/edit` 只认 job UUID（`cron list` 第一列），传名字报 `invalid params: id not found`。

## 关键认知

- **`cron list` Model 列 `-`（继承）≠ 实跑模型**；实跑模型看 session 列表（按 run 时的默认解析）
- **job 无模型 pin 时，改全局默认立即对下次 run 生效**，无需重建 job 或清 session
- **403 配额/认证类 error 的 `lastDurationMs` 极短**（实测 1.3s fail-fast），与超时类（顶满 `timeoutSeconds`）一眼区分
- error 修复后通常自愈——等下一档自然 run 验证，或 `cron run <uuid>` 立即补跑（会真实投递）

## 典型案例（2026-07-29，bm）

三条 brief 任务 error：`cron get` → `403 Free quota exhausted`（qwen 免费额度耗尽）；`sessions list` → error 三条实跑 qwen3.7-max、ok 的实跑 flash（默认模型切换发生在当天 09:21，之前的 run 还在旧默认）。修复 = 全局默认切 deepseek，当晚档自愈。

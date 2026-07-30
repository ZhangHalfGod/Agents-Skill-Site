---
title: "openclaw-ops"
description: "OpenClaw deployment ops and three-step cron error diagnosis"
---

# OpenClaw Ops Troubleshooting

Ops runbook for the bm OpenClaw deployment (Gateway + named agents + cron + Feishu channel).

## When to use

- Cron job in error state / delivery failure
- CLI reports Gateway 1006 / connection failure
- Agent unresponsive, model errors, session anomalies

## Checklist

- [ ] Start with `openclaw health` + `openclaw doctor` — never guess
- [ ] Cron errors: follow the three-step diagnosis (read `lastError` before acting)
- [ ] Gateway down (nothing listening on 18789): `openclaw gateway run --force`; for recurring drops consider `openclaw gateway install` as a service
- [ ] After config changes, re-run `openclaw doctor` and check for new warnings

## Known gotchas (bm-verified)

- Occasional CLI `1006 abnormal closure`: `openclaw agent` falls back to embedded automatically; for commands without fallback, retry once before investigating the Gateway
- `cron get/run/edit` require the job UUID (first column of `cron list`), not the name
- Within one session, an interrupted agent resumes on resend instead of starting over (pilot-verified 2026-07-29)
- `openclaw gateway restart` fails on Windows with `Unknown signal: SIGUSR1` (service path is Unix-only); use `gateway run --force` to restart (verified 2026-07-30)
- Editing `openclaw.json` (e.g. `agents.list[].model`) hot-reloads — no gateway restart needed (verified 2026-07-30)
- PowerShell 5.1 must pass `-Encoding UTF8` when reading repo text — see powershell-utf8

Source Lesson: `docs/operations/openclaw-orchestration-pilot/lessons/2026-07-29-cron-error-model-snapshot-diag.md` (merged)

## Related roles (matrix reverse)

**Primary**

- [OpsEngineer](/agents/standard/OpsEngineer/)

## Use this skill in Cursor

1. `@` reference: `docs/skills/custom/common/openclaw-ops/index.md`
2. Or follow the checklist on this page (skill 5)

This site does not run model inference.

- **Browse this page**: `@` the English path listed above.
- **Via MCP**: `get_skill` → `@` the returned **`source`** (`docs/zh/...`).

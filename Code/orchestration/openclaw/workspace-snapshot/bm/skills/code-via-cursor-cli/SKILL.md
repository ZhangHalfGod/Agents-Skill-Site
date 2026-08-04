---
name: code-via-cursor-cli
description: "When user asks to implement/plan a feature in a local project directory, run Cursor Agent CLI via invoke-cursor-agent.ps1 (one-line prompt, resume chat, -f auto-run) and return 当前进度 + 下一步计划."
---

# Code via Cursor CLI (V5 P1)

## When to use

- 帮我在 `D:\path\to\repo` 实现 XXX
- 给某目录工程加功能 / 修 bug / 只要计划 / 接着上次继续

## How

1. Extract absolute **WorkDir** and **Goal** (keep Goal on one line).
2. Mode: default `implement`; if user says 只要计划/先别改代码 -> `plan` (helper encodes as prompt constraint; do not call bare `agent --mode plan`).
3. Session: default resume same WorkDir. If FAIL asks for goals / 想做什么 -> retry once with `-Fresh`.
4. exec (timeout >= 600s):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\trae_git\MechAssist-Fusion\scripts\openclaw\common\invoke-cursor-agent.ps1" -WorkDir "ABS_DIR" -Goal "GOAL_TEXT" -Mode implement -TimeoutSec 600
```

5. Reply preserving `## 当前进度` / `## 下一步计划` / `## 本次结果摘要`.
6. If Cursor returns a real plan/result, **do not** redo the work yourself. Only self-serve if helper FAIL after `-Fresh` retry.

## Rules

- Always use the helper (`--trust -f --approve-mcps --resume`). Never bare `agent -p` without trust.
- Never interpret Cursor「想做什么」as「等待输入」then abandon Cursor — retry `-Fresh` once.
- Absolute Windows paths only.
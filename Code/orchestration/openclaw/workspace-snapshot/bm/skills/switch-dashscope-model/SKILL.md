---
name: switch-dashscope-model
description: "When user asks to switch OpenClaw/DashScope model (e.g. qwen3.7-max-2026-05-17), run switch-model.ps1 to update config and restart gateway. Also list models / show current."
---

# Switch DashScope model (bm free quota)

## When to use

- 鍒囨崲妯″瀷 / 鎹㈡ā鍨?/ 鏀规垚 `qwen3.7-max-2026-05-17`
- 鍒楀嚭鍙敤鍏嶈垂妯″瀷 / 褰撳墠鐢ㄧ殑浠€涔堟ā鍨?

## How

1. If user asks 褰撳墠妯″瀷 / 浠€涔堟ā鍨?
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\trae_git\MechAssist-Fusion\scripts\openclaw\common\model\switch-model.ps1" -StatusOnly
```

2. If user asks 鍒楀嚭妯″瀷 / 鏈夊摢浜涙ā鍨?
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\trae_git\MechAssist-Fusion\scripts\openclaw\common\model\switch-model.ps1" -List
```

3. If user names a DashScope model code (with or without `qwen/` prefix):
```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\trae_git\MechAssist-Fusion\scripts\openclaw\common\model\switch-model.ps1" -Model "MODEL_CODE"
```
Examples: `qwen3.7-max-2026-05-17`, `qwen3.7-max-2026-06-08`, `qwen3.7-plus`

4. Reply in Chinese with: 鍘熸ā鍨?鈫?鏂版ā鍨嬶紱鎻愰啋銆屼笅涓€鏉℃秷鎭捣鐢熸晥銆嶃€侱o **not** claim you are already the new model in the same turn.

## Rules

- **Exact path only**: `D:\trae_git\MechAssist-Fusion\scripts\openclaw\common\model\switch-model.ps1`
  (`coding\switch-model.ps1` is a shim only; prefer `model\`).
- Always use the helper (registers provider model + `openclaw models set` + deferred gateway restart).
- Prefer allowlisted codes from `-List`; unknown codes still try but warn.
- Never print API keys / gateway tokens.
- After switch, gateway restarts ~2s later; if Feishu goes quiet briefly, wait and ping again.
- Model switch does **not** clear Feishu session context; token usage is from the whole chat thread, not "fresh after switch".
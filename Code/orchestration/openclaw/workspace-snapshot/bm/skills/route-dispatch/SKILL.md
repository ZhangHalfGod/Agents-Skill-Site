---
name: route-dispatch
description: "Parse Feishu cues like 在 mac/windows ... and 朗读：; when target=mac probe MAC worker and reply 节点离线 if unreachable (OpenClaw-Feishu-V4)."
---

# Route dispatch (V4)

When the user message contains `在 mac` / `在 windows` / `在 win`, run `invoke-route.ps1`.

Prefer **Base64** to avoid Windows console encoding issues:

`powershell
$msg = @'
FULL_USER_TEXT
'@
$b64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($msg))
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\trae_git\MechAssist-Fusion\scripts\openclaw\common\invoke-route.ps1" -MessageBase64 $b64
`

## Behavior

- JSON: `target`, `project`, `kind`, `task`, `nodeStatus`, `replyHint`
- If offline / `replyHint` is `节点离线`: reply **节点离线** clearly. Do not pretend Mac ran the command.
- If `target=windows`: handle locally (weather / TTS / exec) using `task` + `kind`.

## V4 acceptance

`在 mac 执行：ping` -> expect offline reply when Mac worker is not configured.
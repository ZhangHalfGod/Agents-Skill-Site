---
name: local-tts-9880
description: "Call local MechAssist-compatible TTS at http://127.0.0.1:9880/v1/tts when the user asks to read aloud (Chinese cue: 鏈楄)."
---

# Local TTS (:9880)

When the user asks to read aloud (prefix `鏈楄锛歚 / `鏈楄:`), call the local gateway with **exec** (PowerShell).

## Command

Prefer the helper script (prints OK/FAIL only, no base64):

`powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "D:\trae_git\MechAssist-Fusion\scripts\openclaw\common\invoke-tts.ps1" -Text "PLAIN_TEXT_WITHOUT_PREFIX"
`

Or direct:

`powershell
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:9880/v1/tts -ContentType "application/json" -Body ((@{ text = "PLAIN_TEXT_WITHOUT_PREFIX" } | ConvertTo-Json -Compress))
`

Success JSON has `audioBase64` + `format` (bm: wav / System.Speech; Home CosyVoice: often mp3).

## Reply (V3)

- Success: short reply confirming spoken (Chinese OK: 宸叉湕璇?. Never paste base64.
- Failure: clear reason; on bm suggest `scripts/openclaw/common/start-bm-tts.ps1`.

## Rules

- Always hit `:9880`; do not claim TTS is unavailable if health is up.
- Do not require ElevenLabs / CosyVoice on bm.
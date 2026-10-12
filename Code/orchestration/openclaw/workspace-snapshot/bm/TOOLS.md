# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup: camera names and locations, SSH hosts and aliases, preferred TTS voices, speaker/room names, device nicknames, anything environment-specific.

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Related

- [Agent workspace](/concepts/agent-workspace)

## Local TTS (V3 / :9880)

- Endpoint: `POST http://127.0.0.1:9880/v1/tts` body `{"text":"..."}`
- bm: System.Speech light gateway (`scripts/openclaw/common/start-bm-tts.ps1`)
- Home: CosyVoice (`scripts/local-tts/start-all.ps1`)
- User cue: `鏈楄锛歺xx` -> call TTS -> reply `宸叉湕璇籤 or clear failure
- Skill: `skills/local-tts-9880/SKILL.md`

## Routing (V4)

- Parser/probe: `scripts/openclaw/common/invoke-route.ps1`
- Config example: `scripts/openclaw/common/openclaw-routing.example.yaml` (copy to `~/.openclaw/openclaw-routing.yaml`)
- Env: `MAC_BASE_URL=http://<mac-tailscale-ip>:18789`
- Cue: `鍦?mac 鎵ц锛歱ing` -> expect `鑺傜偣绂荤嚎` until Mac worker is up
- Skill: `skills/route-dispatch/SKILL.md`

## Code via Cursor CLI (V5)

- Helper: `D:\trae_git\MechAssist-Fusion\scripts\openclaw\common\invoke-cursor-agent.ps1`
- Defaults: per-workdir `--resume` + `-f/--trust` auto-run
- Cue: 帮我在 <绝对目录> 实现 <功能>（接着改同一目录会带上下文）
- 新开一轮: add `-Fresh`
- Returns: 当前进度 / 下一步计划 / 本次结果摘要
- Skill: `skills/code-via-cursor-cli/SKILL.md`

## Switch DashScope model

- Helper: `D:\trae_git\MechAssist-Fusion\scripts\openclaw\common\model\switch-model.ps1`
- Cue: 鍒囨崲妯″瀷鍒?qwen3.7-max-2026-05-17 / 鍒楀嚭妯″瀷 / 褰撳墠妯″瀷
- Skill: `skills/switch-dashscope-model/SKILL.md`
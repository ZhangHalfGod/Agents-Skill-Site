---
title: "powershell-utf8"
description: "Explicit encoding rules for repo UTF-8 text on Windows PowerShell 5.1"
---

# PowerShell UTF-8 Conventions

Rules for reading/writing this repo's UTF-8 (no BOM) text from **Windows PowerShell 5.1**: always state encodings explicitly; never rely on defaults.

## When to use

- Reading repo `.md`/config into a variable, then feeding it to CLI / HTTP / another process
- Writing repo files via `Set-Content` / `Out-File`
- Any "looks fine in the terminal, garbled on disk/wire" suspicion

## Checklist

- [ ] Read: `Get-Content <path> -Raw -Encoding UTF8` (5.1 defaults to system ANSI = GBK; UTF-8 will garble)
- [ ] Prefer editor/agent file tools over PS redirection for writing (`>` emits UTF-16LE; `Set-Content -Encoding utf8` adds a BOM on 5.1)
- [ ] If PS must write: `[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))`
- [ ] When debugging, verify actual file bytes first — the PS console display often lies about UTF-8

## Blocker hints

- Mojibake like `銆愭瘡鍛ㄤ换鍔°€` = UTF-8 bytes decoded as GBK → check the reading side for `-Encoding UTF8`
- Chinese turning into `?` after passing through a command line → same cause, check the file-reading step first

Source Lesson: `docs/operations/openclaw-orchestration-pilot/lessons/2026-07-29-ps-getcontent-utf8-cron.md` (merged)

## Related roles (matrix reverse)

**Recommended**

- [OpsEngineer](/agents/standard/OpsEngineer/)
- [DevLead](/agents/standard/DevLead/)

## Use this skill in Cursor

1. `@` reference: `docs/skills/custom/common/powershell-utf8/index.md`
2. Or follow the checklist on this page (skill 6)

This site does not run model inference.

- **Browse this page**: `@` the English path listed above.
- **Via MCP**: `get_skill` → `@` the returned **`source`** (`docs/zh/...`).

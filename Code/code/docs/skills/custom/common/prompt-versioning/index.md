---
title: "prompt-versioning"
description: "Prompt naming, structure, dual review, and version linkage"
---

# Prompt Engineering Standards

All Prompts used for code generation must follow versioning, structure, and review rules.

## When to use

- When writing, editing, or running a code-generation Prompt
- When reviewing a Prompt

## Naming

`[Project]-[Module]-[Purpose]-V[version].md`

Example: `LifeCoach-UserService-login-api-V1.0.md`

## Required structure

Every Prompt must include:

- **Requirements**
- **Architecture constraints**
- **Code standards**
- **Output format**
- **Prohibited items**
- **Core module Red Record requirement** (when touching core / gateway / security / architecture)

## Review & usage checklist

- [ ] Reviewed by **Dev Lead + Architect**
- [ ] Prompt version tracked in Git and linked to generated code
- [ ] Red Record linked when Prompt targets core or architecture modules
- [ ] Do **not** generate code from unreviewed Prompts

## Validation

Missing required sections → flag gaps and refuse code generation.

Core/architecture Prompt without Red Record → refuse generation and ask to complete the record.

## Related agents

- [DevLead](/agents/standard/DevLead/)
- [Architect](/agents/standard/Architect/)

## Related roles (matrix reverse)

**Primary**

- [DevLead](/agents/standard/DevLead/)

**Recommended**

- [Architect](/agents/standard/Architect/)

## Use this skill in Cursor

1. `@` reference: `docs/skills/custom/common/prompt-versioning/index.md`
2. Or follow the checklist on this page (skill 3)

This site does not run model inference.

- **Browse this page**: `@` the English path listed above.
- **Via MCP**: `get_skill` → `@` the returned **`source`** (`docs/zh/...`).

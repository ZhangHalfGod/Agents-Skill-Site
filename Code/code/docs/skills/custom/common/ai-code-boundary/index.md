---
title: "ai-code-boundary"
description: "AI generation boundaries and tiered controls; red records for core modules"
---

# AI Code Generation Boundary

Tiered control for AI-generated code: ordinary modules may be generated through the normal flow; core layer, gateway, security, and architecture code may be AI-generated but require an extra **Core Module AI Generation Red Record** and strengthened review.

## When to use

- When an agent generates code
- When an agent reviews AI-generated code

## Allowed AI generation

- DTO mapping / conversion
- Utility classes
- Logging wrappers
- Simple interface implementations (non-core)
- Core business layer (requires Red Record)
- Gateway layer (requires Red Record)
- Core persistence logic (requires Red Record)
- Security / auth modules (requires Red Record)
- Architecture layer (requires Red Record)

## Red Record requirements (core modules)

When generating core, gateway, security, or architecture code, maintain a **Core Module AI Generation Red Record** with at least:

- Module name
- Change scope
- Risk points
- Reviewer
- Review conclusion
- Linked Prompt version

## Key rules

- Follow project directory layout (e.g. controller / service / mapper / util) and naming conventions
- Third-party dependencies must be on the project allow-list
- Do **not** block core-layer generation outright — block **commit/release** if the Red Record is missing

## Validation

If core-layer code lacks a Red Record, intercept and respond: **"Missing Core Module AI Generation Red Record — commit/release blocked."**

## Related agents

- [ProductManager](/agents/standard/ProductManager/)
- [Architect](/agents/standard/Architect/)
- [SecurityEngineer](/agents/standard/SecurityEngineer/)

## Related roles (matrix reverse)

**Primary**

- [ProductManager](/agents/standard/ProductManager/)
- [Architect](/agents/standard/Architect/)

**Recommended**

- [SecurityEngineer](/agents/standard/SecurityEngineer/)
- [UIDesigner](/agents/standard/UIDesigner/)

## Use this skill in Cursor

1. `@` reference: `docs/skills/custom/common/ai-code-boundary/index.md`
2. Or follow the checklist on this page (skill 1)

This site does not run model inference.

- **Browse this page**: `@` the English path listed above.
- **Via MCP**: `get_skill` → `@` the returned **`source`** (`docs/zh/...`).

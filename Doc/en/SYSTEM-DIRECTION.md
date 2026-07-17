# SYSTEM-DIRECTION — Summary (English)

**Language:** [English](SYSTEM-DIRECTION.md) | [Full Chinese](../SYSTEM-DIRECTION.md)

> Living S0 constraints. **Chinese file is authoritative**; this page is a short English summary for orientation.

## North star

Turn in-repo governance Markdown (`Code/code/docs/zh/**` for full Chinese playbooks; English stubs under `docs/**`) into a **browsable, searchable, playbook-triggerable, Lesson-growing asset surface**.

- Disk Markdown = Source of Truth  
- Website = discovery / index (VitePress; `npm run generate`)  
- Cursor / MCP = execution (read-only index; `@` source paths)  
- **Do not substitute** site for IDE execution, or MCP for playbook body  

## Hard constraints (abbrev.)

- No in-site Agent inference  
- MCP stays read-only (no write tools for SoT)  
- No secrets in docs / Lessons  
- Prefer small distill loops over big-bang skill rewrites  

## i18n (2026-07-17)

- VitePress: `locales.root` = English (`/`), Chinese = `/zh/`  
- SoT body: `docs/zh/**`  
- Engineering docs: Chinese under `Doc/**`; English highlights under `Doc/en/`  

See decision note: `Code/doc/phase3/i18n-vitepress.md`.

## Read next

- Full Chinese S0: [`../SYSTEM-DIRECTION.md`](../SYSTEM-DIRECTION.md)  
- Flow demo: [`guides/mcp-work-then-distill-demo.md`](guides/mcp-work-then-distill-demo.md)

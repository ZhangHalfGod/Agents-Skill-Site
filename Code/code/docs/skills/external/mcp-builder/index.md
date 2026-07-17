---
title: "mcp-builder"
description: "MCP tool/service design and contracts"
---

# MCP Builder

Build MCP (Model Context Protocol) servers so LLMs can interact with external services through well-designed tools.

## When to use

- Creating or improving an MCP server
- Integrating an API as MCP tools for agents

## Workflow

### Phase 1 — Research & planning

- Balance **API coverage** vs **workflow tools**; when unsure, favor comprehensive coverage
- Use clear prefixed names (e.g. `github_create_issue`, `github_list_repos`)
- Design concise descriptions, pagination, focused responses
- Errors must be actionable (suggest next steps)
- Read MCP spec: `https://modelcontextprotocol.io/sitemap.xml` (fetch `.md` pages)
- **Stack:** TypeScript + streamable HTTP (remote) or stdio (local); Python optional via official SDKs

### Phase 2 — Implementation

- Shared utilities: auth client, errors, JSON/Markdown formatting, pagination
- Per tool: Zod/Pydantic input schema with constraints; `outputSchema` where supported
- Annotations: `readOnlyHint`, `destructiveHint`, `idempotentHint`, `openWorldHint`
- Async I/O, structured + text content in responses

### Phase 3 — Review & test

- [ ] DRY, consistent errors, full types, clear descriptions
- [ ] TypeScript: `npm run build`; test with `npx @modelcontextprotocol/inspector`
- [ ] Python: `python -m py_compile`; test with Inspector

### Phase 4 — Evaluations

Create ~10 independent, read-only, complex, realistic, verifiable Q&A pairs (XML format). Each answer must be stable and checkable by string match.

## Key rules

- Tool names discoverable; descriptions tell agents when to use each tool
- Paginate large result sets
- Security: validate inputs; never expose secrets in errors
- Load language guides and evaluation reference from bundled `reference/` when implementing

## Related roles (matrix reverse)

_No strong standard-role binding (see matrix or domain roles)._

## Use this skill in Cursor

1. `@` reference: `docs/skills/external/mcp-builder/index.md`
2. Or follow the checklist on this page (skill 6)

This site does not run model inference. MCP SoT remains under `docs/zh/...`.

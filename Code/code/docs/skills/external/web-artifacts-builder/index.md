---
title: "web-artifacts-builder"
description: "Complex web artifacts and multi-state builds"
---

# Web Artifacts Builder

Build rich claude.ai-style frontend artifacts as a single HTML file.

## When to use

- User needs an interactive HTML artifact (dashboard, demo, tool UI)
- Stack: React 18 + TypeScript + Vite + Parcel + Tailwind + shadcn/ui

## Steps

1. **Initialize:** `bash scripts/init-artifact.sh <project-name>` then `cd <project-name>`
2. **Develop:** Edit generated React/TS sources
3. **Bundle:** `bash scripts/bundle-artifact.sh` → `bundle.html` (self-contained, inline assets)
4. **Share** `bundle.html` with the user
5. **(Optional)** Test/visualize only if requested — prefer showing artifact first to reduce latency

## Design rules

Avoid "AI slop": excessive centering, purple gradients, uniform rounded corners, Inter font.

## Requirements

- Project root must have `index.html`
- Bundler inlines JS/CSS via Parcel + html-inline

## Reference

- shadcn/ui: https://ui.shadcn.com/docs/components

## Related roles (matrix reverse)

**Recommended**

- [UIDesigner](/agents/standard/UIDesigner/)

## Use this skill in Cursor

1. `@` reference: `docs/skills/external/web-artifacts-builder/index.md`
2. Or follow the checklist on this page (skill 9)

This site does not run model inference. MCP SoT remains under `docs/zh/...`.

---
title: "doc-coauthoring"
description: "Document co-authoring and spec-style outputs"
---

# Document Co-Authoring

Structured workflow for collaborative document creation: **Context Gathering → Refinement & Structure → Reader Testing**.

## When to use

- User wants to write a doc, proposal, spec, PRD, design doc, RFC, or decision record
- Substantial writing task where structure and reader clarity matter

Offer the three-stage workflow; if declined, work freeform.

## Stage 1 — Context gathering

**Goal:** Close the gap between what the user knows and what you know.

1. Ask meta questions: doc type, audience, desired impact, template/format, constraints
2. Encourage an info dump (background, alternatives rejected, stakeholders, timeline, architecture)
3. Ask 5–10 clarifying questions on gaps
4. **Exit:** You can discuss trade-offs without re-explaining basics

## Stage 2 — Refinement & structure

**Goal:** Build section by section.

For each section:

1. Ask 5–10 clarifying questions
2. Brainstorm 5–20 inclusion options
3. User curates (keep / remove / combine)
4. Gap check — anything missing?
5. Draft with surgical edits (`str_replace`), not full reprints
6. Iterate until satisfied; after 3 stable rounds, ask what can be cut

Start with the highest-uncertainty section (usually core decision or technical approach). Leave summary sections for last.

Create scaffold (artifact or `.md` file) with placeholders, then fill section by section.

## Stage 3 — Reader testing

**Goal:** Verify the doc works for readers without author context.

1. Generate 5–10 realistic reader questions
2. Test with a fresh agent/sub-agent (or ask user to paste doc into new chat)
3. Check ambiguity, false assumptions, contradictions
4. Fix gaps; loop to Stage 2 for weak sections

**Exit:** Reader consistently answers correctly with no new gaps.

## Key rules

- Be direct and procedural; give user agency to skip stages
- Use `create_file` for drafts, `str_replace` for edits
- Quality over speed — every sentence should earn its place
- Final read-through is the user's responsibility (facts, links, impact)

## Related roles (matrix reverse)

**Recommended**

- [ProductManager](/agents/standard/ProductManager/)
- [UIDesigner](/agents/standard/UIDesigner/)
- [Architect](/agents/standard/Architect/)

## Use this skill in Cursor

1. `@` reference: `docs/skills/external/doc-coauthoring/index.md`
2. Or follow the checklist on this page (skill 5)

This site does not run model inference.

- **Browse this page**: `@` the English path listed above.
- **Via MCP**: `get_skill` → `@` the returned **`source`** (`docs/zh/...`).

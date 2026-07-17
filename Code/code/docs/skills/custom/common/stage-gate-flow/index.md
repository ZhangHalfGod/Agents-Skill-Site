---
title: "stage-gate-flow"
description: "Waterfall / agile stage-gate exit checklist"
---

# Waterfall / Agile Stage Gate

All AI code generation must follow waterfall or agile stage gates. **Keep the main skill short** — mode details and deploy verification live under `docs/`.

## When to use

- Starting AI code generation work
- Producing requirements / design / test documents
- Stage exit or before PR merge

## Exit checklist (required)

- [ ] Current phase inputs / outputs / review status are documented
- [ ] Previous phase not approved → do **not** advance
- [ ] Core / gateway / security / architecture changes include **Core Module AI Generation Red Record** (or marked N/A)
- [ ] **Phase lesson**: written under `docs/zh/operations/<project>/lessons/`, or explicitly checked **no new lesson this phase**
- [ ] (If deploy/release) verified per [Deploy verification checklist](./docs/deploy-verify.md): MCP health and Host-header static-site probes recorded **separately**; never treat no-Host `curl 127.0.0.1` 404 as proof

## Intercept messages

- Out of phase: **Complete previous phase review first**
- Missing Red Record: **Complete Core Module AI Generation Red Record**
- Missing lesson: **Write a Lesson Card or explicitly mark no new lesson**

## Record a lesson (trigger phrase)

```text
Record a lesson: <one-line observation>. Project <project-id>. Write using the operations Lesson Card template.
```

Template: `docs/zh/operations/_template/lessons/_lesson-card.template.md`  
Target: `docs/zh/operations/<project-id>/lessons/YYYY-MM-DD-short-slug.md`

> **SoT note:** Operations lessons live under `docs/zh/operations/` (Chinese locale folder). English `docs/operations` mirrors may exist for stubs; write new lessons to `docs/zh/operations/<project>/lessons/`.

## Layered docs (open when needed)

| Layer | Path | When |
|-------|------|------|
| L2 (this page) | Main skill checklist | Default |
| L3 modes | [Waterfall / agile details](./docs/waterfall-agile-modes.md) | Need mode rules |
| L3 deploy | [Deploy verification](./docs/deploy-verify.md) | Release / Nginx / MCP acceptance |

Runtime discipline: MCP `list_*` / `get_*` first, then `@` this page; one primary skill + at most two secondary skills per task.

## Related agents

- [ProductManager](/agents/standard/ProductManager/)
- [Architect](/agents/standard/Architect/)
- [DevLead](/agents/standard/DevLead/)
- [TestEngineer](/agents/standard/TestEngineer/)
- [OpsEngineer](/agents/standard/OpsEngineer/)

## Related roles (matrix reverse)

**Primary**

- [ProductManager](/agents/standard/ProductManager/)
- [Architect](/agents/standard/Architect/)
- [DevLead](/agents/standard/DevLead/)
- [TestEngineer](/agents/standard/TestEngineer/)

**Recommended**

- [OpsEngineer](/agents/standard/OpsEngineer/)
- [NmosEngineer](/agents/standard/NmosEngineer/)

## Use this skill in Cursor

1. `@` reference: `docs/skills/custom/common/stage-gate-flow/index.md`
2. Or follow the checklist on this page (skill 4)

This site does not run model inference. MCP SoT remains under `docs/zh/...`.

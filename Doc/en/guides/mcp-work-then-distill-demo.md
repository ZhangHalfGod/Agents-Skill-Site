# Flow demo: MCP → work → distill → ship

**Language:** [English](mcp-work-then-distill-demo.md) | [中文](../../guides/mcp-work-then-distill-demo.md)

> MCP discovers which playbook to use (read-only). Work and distill happen in Git Markdown. `generate` refreshes the index. **MCP does not write body content.**

## Pipeline

```text
MCP list/get → @ source → do work / exit gate
  → Lesson (files) → distill into skill/agent/rule
  → generate + validate → commit/push → server pull + build
```

## Roles

| Who | Does | Does not |
|-----|------|----------|
| MCP | `health` / `list_*` / `get_*` → ids, bindings, `source` | Write files, Lessons, deploy |
| Repo Markdown | Agents / skills / rules / Lessons | — |
| generate + validate | Refresh manifest / sidebars | Replace human distill judgment |
| Git + server | commit / push / pull / build | Commit generate dirt on deploy hosts |

## This repo mapping

| Concept | Path |
|---------|------|
| Chinese SoT (full playbooks) | `Code/code/docs/zh/**` |
| English site stubs | `Code/code/docs/**` (root locale) |
| Lessons | `Code/code/docs/zh/operations/<project>/lessons/` |
| generate | `cd Code/code && npm run generate && npm run validate` |
| MCP `source` example | `docs/zh/skills/custom/common/stage-gate-flow/index.md` |

## Checklist

- [ ] MCP `health` ok  
- [ ] `get_*` returned `source`  
- [ ] `@` body executed (not index-only)  
- [ ] Exit gate / deploy evidence layered  
- [ ] Lesson written or explicit “no new lesson”  
- [ ] Distilled → `merged` / `rejected`  
- [ ] generate + validate  
- [ ] push + server build  
- [ ] No MCP write API requested  

Chinese full guide: [`../../guides/mcp-work-then-distill-demo.md`](../../guides/mcp-work-then-distill-demo.md).

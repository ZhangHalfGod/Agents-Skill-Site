---
title: "skill-creator"
description: "Method and evaluation for creating or iterating skills"
---

# Skill Creator

Create new Agent Skills and iterate until they trigger reliably and produce good outputs.

## When to use

- User wants a new skill or to improve an existing one
- Need eval loop: draft → test → review → revise

## Core loop

1. **Capture intent** — What should the skill do? When should it trigger? Output format? Need tests?
2. **Interview** — Edge cases, examples, success criteria, dependencies
3. **Write SKILL.md** — YAML frontmatter (`name`, pushy `description`) + imperative body (<500 lines ideal)
4. **Test cases** — 2–3 realistic prompts → save to `evals/evals.json`
5. **Run evals** — With-skill vs baseline in parallel; workspace `<skill>-workspace/iteration-N/`
6. **Review** — `eval-viewer/generate_review.py`; collect `feedback.json`
7. **Improve** — Generalize from feedback; bundle repeated scripts into `scripts/`
8. **Repeat** until user satisfied or feedback empty
9. **(Optional)** Description optimization via `scripts.run_loop`
10. **(Optional)** `python -m scripts.package_skill`

## SKILL.md anatomy

```
skill-name/
├── SKILL.md          # required
├── scripts/          # deterministic helpers
├── references/       # load on demand
└── assets/           # templates, icons
```

**Progressive disclosure:** metadata always loaded; body when triggered; references/scripts as needed.

## Eval checklist

- [ ] Spawn with-skill **and** baseline in the same turn
- [ ] Save `timing.json` from task notifications (`total_tokens`, `duration_ms`)
- [ ] Grade assertions → `grading.json` (`text`, `passed`, `evidence`)
- [ ] Aggregate: `python -m scripts.aggregate_benchmark`
- [ ] Launch viewer **before** self-grading when possible
- [ ] Read `feedback.json`; empty feedback = acceptable

## Writing principles

- Explain **why**, not endless MUST caps
- Description is the primary trigger — include near-miss phrases
- No malware or surprise content; Principle of Lack of Surprise
- Prefer imperative instructions and concrete output templates

## Key rules

- Do not use `/skill-test` — follow this skill's eval sequence
- Generalize improvements; avoid overfitting to eval prompts
- In headless/Cowork: viewer `--static` output; feedback downloads as `feedback.json`

## Related roles (matrix reverse)

_No strong standard-role binding (see matrix or domain roles)._

## Use this skill in Cursor

1. `@` reference: `docs/skills/external/skill-creator/index.md`
2. Or follow the checklist on this page (skill 10)

This site does not run model inference. MCP SoT remains under `docs/zh/...`.

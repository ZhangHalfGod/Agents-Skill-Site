# Agents Skill Site — AI Coding Governance Discovery

**Language / 语言:** [English](README.md) | [中文](README.zh-CN.md)

> **Turn AI coding governance from tribal knowledge and scattered docs into an organization-level asset surface that is browsable, searchable, and triggerable by playbooks.**

[![GitHub](https://img.shields.io/badge/GitHub-ZhangHalfGod%2FAgents--Skill--Site-blue?logo=github)](https://github.com/ZhangHalfGod/Agents-Skill-Site)
[![Build](https://github.com/ZhangHalfGod/Agents-Skill-Site/actions/workflows/build.yml/badge.svg)](https://github.com/ZhangHalfGod/Agents-Skill-Site/actions/workflows/build.yml)
[![VitePress](https://img.shields.io/badge/built%20with-VitePress-41b883?logo=vitepress)](https://vitepress.dev/)
[![MCP](https://img.shields.io/badge/MCP-Server-6366f1?logo=modelcontextprotocol)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **What this repo is**: VitePress discovery site + MCP index + **governance source of truth**.  
> **SoT**: `Code/code/docs/**` (agents · skills · rules · operations). Edit Markdown, then `npm run generate` to refresh the index.  
> **No longer required**: external `standards/` + `STANDARDS_ROOT` sync (legacy flow retired).

---

## Table of contents

- [Flow demo: MCP → work → distill → ship](#flow-demo-mcp--work--distill--ship)
- [Background: the governance gap](#background-the-governance-gap)
- [Pain points](#pain-points)
- [What this project solves](#what-this-project-solves)
- [Dual-consumer architecture](#dual-consumer-architecture)
- [Quick start](#quick-start)
- [Use cases](#use-cases)
- [Repository layout](#repository-layout)
- [FAQ](#faq)

---

## Flow demo: MCP → work → distill → ship

End-to-end reference (paths are examples; includes a fictional walkthrough + this-repo mapping):

**[Doc/guides/mcp-work-then-distill-demo.md](Doc/guides/mcp-work-then-distill-demo.md)**

```text
MCP read-only lookup → @ source body → do work / exit gate
  → write Lesson (files, not via MCP) → distill into skill/agent/rule
  → generate + validate → commit/push → server pull + build
```

Key point: MCP **does not write** body content. Distill and ship go through Git and build — no write tools on MCP.

---

## Background: the governance gap

AI coding tools (Cursor, Claude Code, Codex CLI, …) change how teams build software. Most teams still hit the same wall:

```text
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  Cursor IDE  │    │  Claude Code  │   │  Codex CLI   │
│  Prompt-led  │    │  Chat collab  │   │  Automation  │
└──────┬──────┘    └──────┬───────┘    └──────┬───────┘
       │                  │                   │
       │     ❌ No governance layer                 │
       │                                          │
       ├── Who owns which role?                     │
       ├── Where do skills / lessons live?          │
       ├── Are rules written down or tribal?        │
       └── How does a newcomer ramp up?             │
```

The market covers the **execution layer** (how to change code with tools) and often misses the **governance layer** (who does what, how, and what is mandatory / forbidden).

**This project fills that gap.**

---

## Pain points

### Pain 1: Fuzzy roles
> "Who splits the requirement? Who reviews architecture? How should QA work with AI-generated code?"

Without shared role definitions, boundaries and ownership stay unclear.

### Pain 2: Scattered skills
> "We hit this before — it lived in an old wiki… newcomers never see it."

Best practices sit in Confluence, chat logs, or one person’s memory. No catalog, no “which skills belong to this role.”

### Pain 3: Implicit rules
> "DB changes need approval — that’s tribal knowledge."

Hard constraints, process rules, and scenario rules either don’t exist or live only in veterans’ heads.

### Pain 4: No iteration loop
> "We stepped on the same rake again."

Experience doesn’t compound across people, projects, or stacks.

### Pain 5: MCP without an org layer
> "Thousands of MCP servers — none tell me which tools this role should use, in what order, under which rules."

---

## What this project solves

### Solution 1: Role playbooks

**8 standard roles**, each with duties, workflow, outputs, and collaboration notes:

| # | Role | One-line job |
|:---:|------|-----------|
| 1 | Product Manager | Scope, acceptance, AI generation boundary list |
| 2 | Architect | Architecture fit, interfaces, core-module review |
| 3 | Dev Lead | Implementation, quality, module delivery |
| 4 | Test Engineer | Strategy, AI-code verification, quality gates |
| 5 | Security Engineer | Audit, scanning, compliance |
| 6 | Ops Engineer | Release, CI/CD, monitoring |
| 7 | UI Designer | Design system, components, visual acceptance |
| 8 | Nmos Engineer | AV / NMOS protocol engineering tasks |

> Start here, then customize `Code/code/docs/agents/**` and run `npm run generate`.

### Solution 2: Skill catalog + binding matrix

**11 starter skills** across the delivery lifecycle, bound to roles via a matrix:

```text
Skill catalog (example)          Role ↔ skill matrix
┌──────────────────┐         ┌──────────────────────┐
│ stage-gate-flow  │◄────────┤ ProductManager       │
│  stage gates     │         │  ├─ stage-gate-flow  │
├──────────────────┤         │  └─ ai-code-boundary │
│ ai-code-boundary │◄────────┤                      │
│  AI code bounds  │         │ Architect            │
├──────────────────┤         │  ├─ stage-gate-flow  │
│ mcp-builder      │◄────────┤  ├─ mcp-builder      │
│  MCP builder     │         │  └─ skill-creator   │
├──────────────────┤         └──────────────────────┘
│ skill-creator    │
└──────────────────┘
```

Update `Doc/phase1/05-agent-skill-matrix.md`, then regenerate — site and MCP stay aligned.

### Solution 3: Layered rules

| Level | Name | Examples |
|:---:|------|------|
| **L0** | Hard constraints | Language policy; no hardcoded secrets; no backdoors |
| **L1** | Process rules | Stage-gate review; change approval |
| **L2** | Scenario rules | MCP minimal contract; core-module red records |

L0 always; L1 by stage; L2 on demand. Visible on the site and via MCP.

### Solution 4: Dual consumers — humans on the web, AI via MCP

```
Same source (manifest.json)
         │
    ┌────┴────┐
    ▼         ▼
Static site    MCP server
(for people)   (for AI)
    │         │
    ▼         ▼
Browse playbooks   Cursor tools
  → copy prompts     → bindings + source paths
```

- **Web**: VitePress static site for roles, skills, rules  
- **MCP**: Cursor / Claude Code query the index without leaving the chat  

### Solution 5: Git-backed inheritance

```text
First clone                 Six months later
┌────────────┐           ┌────────────────────┐
│ 8 roles    │           │ 10 roles (+2)      │
│ 11 skills  │           │ 18 skills (+7)     │
│ base rules │           │ org-specific rules │
│ base matrix│           │ tuned matrix       │
│ Git init   │           │ 127 commits        │
└────────────┘           └────────────────────┘
```

Every change is history. Newcomers clone the compounded asset. Governance travels with the repo.

---

## Dual-consumer architecture

```text
  Agents-Skill-Site (this repo)
  ┌─── SoT + unified index ─────────────────────────┐
  │  Code/code/docs/**  (agents / skills / rules)    │
  │  manifest.json · health.json · generated sidebars│
  └─────────┬──────────────────────────┬────────────┘
            │                          │
            ▼                          ▼
     ┌──────────────┐           ┌──────────────┐
     │ Consumer A   │           │ Consumer B   │
     │ VitePress    │           │ MCP (RO)     │
     │ → dist/      │           │ stdio / HTTP │
     └──────────────┘           └──────┬───────┘
                                       ▼
                                 Cursor IDE (list/get → @ source)
```

> Body lives in-repo under `docs/**`. After edits, run `npm run generate` (alias `sync`) to refresh `manifest.json` and sidebars. `npm run dev` / `build` run generate automatically.

### Layer model

```
┌─────────────────────────────────────────────────────────┐
│  Governance SoT (this repo docs/**)                     │
│  agents / skills / rules / operations = Markdown on disk│
└───────────────────────────┬─────────────────────────────┘
                            │ generate (index / sidebars)
┌───────────────────────────▼─────────────────────────────┐
│  Discovery layer                                        │
│  Site + manifest + read-only MCP                        │
└───────────────────────────┬─────────────────────────────┘
                            │ same manifest
┌───────────────────────────▼─────────────────────────────┐
│  Execution layer (no model inference in the site)       │
│  Cursor @files / MCP tools (read-only)                  │
└─────────────────────────────────────────────────────────┘
```

> **Principle**: site = discovery; Cursor/MCP = execution. **Do not substitute one for the other.** MCP is an index waiter, not the role playbook.

---

## Quick start

### Local site preview

```bash
# 1. Clone
git clone https://github.com/ZhangHalfGod/Agents-Skill-Site.git
cd Agents-Skill-Site/Code/code

# 2. Install
npm ci

# 3. Dev (auto generate + validate)
npm run dev
# → http://localhost:5173/agents-skill/

# After editing docs you can also run:
# npm run generate
```

### Configure Cursor MCP

> **Token**: on the server, `openssl rand -hex 32` (64 hex chars). Replace `<YOUR_TOKEN>` below including the angle brackets.  
> Without `openssl`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.

```json
// ~/.cursor/mcp.json or project .cursor/mcp.json
{
  "mcpServers": {
    "agents-skill-remote": {
      "url": "http://YOUR_DEPLOYED_HOST/agents-skill-mcp/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_TOKEN>"
      }
    }
  }
}
```

Local stdio if remote MCP is not deployed yet:

```json
{
  "mcpServers": {
    "agents-skill": {
      "command": "node",
      "args": ["/absolute/path/Agents-Skill-Site/Code/code/mcp/server.mjs"],
      "env": {
        "MANIFEST_URL": "http://YOUR_DEPLOYED_HOST/agents-skill/manifest.json"
      }
    }
  }
}
```

### Production deploy

```bash
# 1. On the server
git pull origin main
cd Code/code
npm ci && npm run build

# 2. Nginx (see deploy/nginx-agents-skill.snippet.conf)
#    alias → docs/.vitepress/dist/

# 3. Optional remote MCP
cd Code/mcp-remote
cp deploy/env.production.example .env   # set MCP_TOKEN
npm ci
pm2 start deploy/ecosystem.config.cjs
pm2 save
```

---

## Use cases

### Onboarding

> New hire → browse 8 roles on the site → understand AI coding collaboration → configure Cursor MCP → start work

### Day-to-day Cursor

> In chat → “use agents-skill-remote to list skills bound to ProductManager” → get bindings → execute as that role

### Governance iteration

> New norm → Lesson under `docs/operations/.../lessons/` → distill into `docs/skills|agents|rules` → `npm run generate` → commit  

See the [flow demo](#flow-demo-mcp--work--distill--ship).

### Org standardization

> Upstream template → team forks customize → periodically merge upstream improvements

---

## Repository layout

```text
Agents-Skill-Site/                   # discovery site + MCP + docs SoT
├── README.md                        # English (default)
├── README.zh-CN.md                  # Chinese
├── deploy.sh
│
├── Doc/                             # engineering docs
│   ├── SYSTEM-DIRECTION.md          # S0 (must-read)
│   ├── CHANGELOG.md
│   ├── guides/                      # cross-project flow demos
│   ├── phase1/ · phase2/ · phase3/
│
├── Code/
│   ├── doc/                         # implementation notes / ADR / deploy logs
│   ├── code/                        # VitePress + stdio MCP
│   └── mcp-remote/                  # remote HTTP MCP
│
└── .gitignore
```

---

## Fork your customized edition

1. **Fork** this repo on GitHub  
2. **Clone** your fork  
3. **Add upstream**: `git remote add upstream https://github.com/ZhangHalfGod/Agents-Skill-Site.git`  
4. **Customize** `Code/code/docs/**`, then `cd Code/code && npm run generate`  
5. **Sync upstream**: `git fetch upstream && git merge upstream/main`  

Details: [Git guide](Doc/git/fork-and-upstream.md); phase-3 context: [`Doc/phase3/00-context.md`](Doc/phase3/00-context.md).

Keep your `docs/**` customizations when merging upstream.

---

## FAQ

### How is this different from typical MCP servers?

Typical MCP servers are **point tools**. This repo is a **governance discovery site + index** — roles, skills, rules, and matrix are browsable and queryable; MCP is one consumer. **MCP is the index waiter, not the playbook.**

### Where do I edit body content?

In **`Code/code/docs/**`**, then `npm run generate` (`predev` / `prebuild` also run it). MCP reads the same `manifest.json`.

### Must I keep the 8 roles?

No. Add/change/remove under `docs/agents/**`, update `Doc/phase1/05-agent-skill-matrix.md` and the generate registry if needed, then `npm run generate`.

### Relation to Cursor Rules / `.cursorrules`?

This project does not replace Cursor Rules. Use Rules for runtime L0; this site defines, browses, and retrieves. MCP `source` points at `docs/...` — `@` them in a workspace that has this repo open.

### Security?

- `.env` is gitignored — **no secrets in Git**  
- MCP binds `127.0.0.1`; public access via Nginx + Bearer Token  
- Static site only — no DB, no in-site inference  
- Lessons/body must not contain secrets or raw customer data (`docs/operations/README.md`)

### What do I need to deploy?

- **Site**: any static host (Nginx, GitHub Pages, Vercel, …)  
- **Remote MCP**: Node 22+ + PM2 (or Docker)  
- **Minimal**: Nginx alias to `dist` for the site alone  

### How do I add a custom skill?

1. Write `docs/skills/custom/common/<id>/index.md`  
2. Update matrix + generate registry  
3. `npm run generate`  

### How do I capture a Lesson?

Copy `docs/operations/_template/lessons/_lesson-card.template.md` to `docs/operations/<project>/lessons/`, distill, then edit `docs/skills|agents|rules`.

---

## License

[MIT License](LICENSE) — use, modify, distribute. Stars, forks, and PRs welcome.

---

<p align="center">
  <b>From tribal verbal rules to browsable, searchable, inheritable governance assets</b><br>
  <sub>— A seedling today, a tree in a decade —</sub>
</p>

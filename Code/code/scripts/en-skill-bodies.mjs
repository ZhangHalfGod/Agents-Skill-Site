/**
 * English skill bodies for VitePress root locale (no frontmatter).
 * SoT for full Chinese text: docs/zh/skills/**
 */
export const SKILL_BODIES = {
  'ai-code-boundary': `# AI Code Generation Boundary

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
- [SecurityEngineer](/agents/standard/SecurityEngineer/)`,

  'traceability-compliance': `# End-to-End Traceability & Compliance

AI-generated code must meet traceability, security compliance, and copyright compliance requirements.

## When to use

- When an agent commits AI-generated code
- When an agent releases AI-generated code to production

## Commit checklist

- [ ] Commit message includes: \`[AI-generated] ModuleName-PromptVersion-VX.X\`

## Pre-release checklist

- [ ] Security scan passed (no high-severity findings)
- [ ] Copyright / license check passed (no protocol conflicts)
- [ ] Test coverage ≥ 80%

## Traceability & compliance rules

- Retain Prompt version + code version + reviewer mapping for audit
- Do not generate malicious code or hard-code secrets
- Core / gateway / security / architecture changes must link the **Core Module AI Generation Red Record**

## Validation

Reject commit or release when traceability/compliance is incomplete; output a remediation list.

Missing Red Record for core or architecture code = traceability failure — reject commit/release.

## Related agents

- [Architect](/agents/standard/Architect/)
- [DevLead](/agents/standard/DevLead/)
- [TestEngineer](/agents/standard/TestEngineer/)
- [SecurityEngineer](/agents/standard/SecurityEngineer/)
- [OpsEngineer](/agents/standard/OpsEngineer/)`,

  'prompt-versioning': `# Prompt Engineering Standards

All Prompts used for code generation must follow versioning, structure, and review rules.

## When to use

- When writing, editing, or running a code-generation Prompt
- When reviewing a Prompt

## Naming

\`[Project]-[Module]-[Purpose]-V[version].md\`

Example: \`LifeCoach-UserService-login-api-V1.0.md\`

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
- [Architect](/agents/standard/Architect/)`,

  'stage-gate-flow': `# Waterfall / Agile Stage Gate

All AI code generation must follow waterfall or agile stage gates. **Keep the main skill short** — mode details and deploy verification live under \`docs/\`.

## When to use

- Starting AI code generation work
- Producing requirements / design / test documents
- Stage exit or before PR merge

## Exit checklist (required)

- [ ] Current phase inputs / outputs / review status are documented
- [ ] Previous phase not approved → do **not** advance
- [ ] Core / gateway / security / architecture changes include **Core Module AI Generation Red Record** (or marked N/A)
- [ ] **Phase lesson**: written under \`docs/zh/operations/<project>/lessons/\`, or explicitly checked **no new lesson this phase**
- [ ] (If deploy/release) verified per [Deploy verification checklist](./docs/deploy-verify.md): MCP health and Host-header static-site probes recorded **separately**; never treat no-Host \`curl 127.0.0.1\` 404 as proof

## Intercept messages

- Out of phase: **Complete previous phase review first**
- Missing Red Record: **Complete Core Module AI Generation Red Record**
- Missing lesson: **Write a Lesson Card or explicitly mark no new lesson**

## Record a lesson (trigger phrase)

\`\`\`text
Record a lesson: <one-line observation>. Project <project-id>. Write using the operations Lesson Card template.
\`\`\`

Template: \`docs/zh/operations/_template/lessons/_lesson-card.template.md\`  
Target: \`docs/zh/operations/<project-id>/lessons/YYYY-MM-DD-short-slug.md\`

> **SoT note:** Operations lessons live under \`docs/zh/operations/\` (Chinese locale folder). English \`docs/operations\` mirrors may exist for stubs; write new lessons to \`docs/zh/operations/<project>/lessons/\`.

## Layered docs (open when needed)

| Layer | Path | When |
|-------|------|------|
| L2 (this page) | Main skill checklist | Default |
| L3 modes | [Waterfall / agile details](./docs/waterfall-agile-modes.md) | Need mode rules |
| L3 deploy | [Deploy verification](./docs/deploy-verify.md) | Release / Nginx / MCP acceptance |

Runtime discipline: MCP \`list_*\` / \`get_*\` first, then \`@\` this page; one primary skill + at most two secondary skills per task.

## Related agents

- [ProductManager](/agents/standard/ProductManager/)
- [Architect](/agents/standard/Architect/)
- [DevLead](/agents/standard/DevLead/)
- [TestEngineer](/agents/standard/TestEngineer/)
- [OpsEngineer](/agents/standard/OpsEngineer/)`,

  'doc-coauthoring': `# Document Co-Authoring

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
5. Draft with surgical edits (\`str_replace\`), not full reprints
6. Iterate until satisfied; after 3 stable rounds, ask what can be cut

Start with the highest-uncertainty section (usually core decision or technical approach). Leave summary sections for last.

Create scaffold (artifact or \`.md\` file) with placeholders, then fill section by section.

## Stage 3 — Reader testing

**Goal:** Verify the doc works for readers without author context.

1. Generate 5–10 realistic reader questions
2. Test with a fresh agent/sub-agent (or ask user to paste doc into new chat)
3. Check ambiguity, false assumptions, contradictions
4. Fix gaps; loop to Stage 2 for weak sections

**Exit:** Reader consistently answers correctly with no new gaps.

## Key rules

- Be direct and procedural; give user agency to skip stages
- Use \`create_file\` for drafts, \`str_replace\` for edits
- Quality over speed — every sentence should earn its place
- Final read-through is the user's responsibility (facts, links, impact)`,

  'mcp-builder': `# MCP Builder

Build MCP (Model Context Protocol) servers so LLMs can interact with external services through well-designed tools.

## When to use

- Creating or improving an MCP server
- Integrating an API as MCP tools for agents

## Workflow

### Phase 1 — Research & planning

- Balance **API coverage** vs **workflow tools**; when unsure, favor comprehensive coverage
- Use clear prefixed names (e.g. \`github_create_issue\`, \`github_list_repos\`)
- Design concise descriptions, pagination, focused responses
- Errors must be actionable (suggest next steps)
- Read MCP spec: \`https://modelcontextprotocol.io/sitemap.xml\` (fetch \`.md\` pages)
- **Stack:** TypeScript + streamable HTTP (remote) or stdio (local); Python optional via official SDKs

### Phase 2 — Implementation

- Shared utilities: auth client, errors, JSON/Markdown formatting, pagination
- Per tool: Zod/Pydantic input schema with constraints; \`outputSchema\` where supported
- Annotations: \`readOnlyHint\`, \`destructiveHint\`, \`idempotentHint\`, \`openWorldHint\`
- Async I/O, structured + text content in responses

### Phase 3 — Review & test

- [ ] DRY, consistent errors, full types, clear descriptions
- [ ] TypeScript: \`npm run build\`; test with \`npx @modelcontextprotocol/inspector\`
- [ ] Python: \`python -m py_compile\`; test with Inspector

### Phase 4 — Evaluations

Create ~10 independent, read-only, complex, realistic, verifiable Q&A pairs (XML format). Each answer must be stable and checkable by string match.

## Key rules

- Tool names discoverable; descriptions tell agents when to use each tool
- Paginate large result sets
- Security: validate inputs; never expose secrets in errors
- Load language guides and evaluation reference from bundled \`reference/\` when implementing`,

  'frontend-design': `# Frontend Design

Create distinctive, production-grade frontend interfaces — avoid generic "AI slop" aesthetics.

## When to use

- Building a component, page, app, or interface with strong visual identity
- User provides frontend requirements (purpose, audience, constraints)

## Design thinking (before code)

- **Purpose:** What problem? Who uses it?
- **Tone:** Commit to a bold direction (minimal, maximal, retro-futurist, editorial, brutalist, etc.)
- **Constraints:** Framework, performance, accessibility
- **Differentiation:** One memorable hook

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is functional, cohesive, and meticulously refined.

## Aesthetics checklist

- **Typography:** Distinctive display + refined body fonts — avoid Arial, Inter, Roboto defaults
- **Color:** CSS variables; dominant palette + sharp accents
- **Motion:** High-impact moments (staggered load, scroll/hover surprises); CSS-first for static HTML
- **Layout:** Asymmetry, overlap, grid-breaking, intentional density or whitespace
- **Depth:** Textures, gradients, noise, shadows — not flat purple-gradient-on-white clichés

## Key rules

- Intentionality beats intensity — minimal and maximal both work if executed precisely
- Match code complexity to the aesthetic vision
- Vary themes/fonts across projects; do not converge on the same "AI default" look
- Never ship cookie-cutter layouts lacking context-specific character`,

  'webapp-testing': `# Web App Testing

Test local web applications with native Python Playwright scripts.

## When to use

- Automating browser tests for local web apps
- Verifying UI behavior after changes

## Decision tree

\`\`\`
Static HTML?
  Yes → Read HTML for selectors → Playwright script
  No  → Server running?
          No  → python scripts/with_server.py --help → helper + script
          Yes → Reconnaissance: navigate → networkidle → screenshot/DOM → act
\`\`\`

## Helper scripts

- \`scripts/with_server.py\` — manages server lifecycle (multi-server supported)
- **Always run \`--help\` first** — treat scripts as black boxes; do not read source unless necessary

**Single server:**
\`\`\`bash
python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_automation.py
\`\`\`

**Playwright skeleton:**
\`\`\`python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')  # CRITICAL for dynamic apps
    # ... automation
    browser.close()
\`\`\`

## Key rules

- Wait for \`networkidle\` before DOM inspection on dynamic apps
- Use descriptive selectors: \`text=\`, \`role=\`, CSS, IDs
- Always close the browser
- See \`examples/\` for element discovery, static HTML, console logging`,

  'web-artifacts-builder': `# Web Artifacts Builder

Build rich claude.ai-style frontend artifacts as a single HTML file.

## When to use

- User needs an interactive HTML artifact (dashboard, demo, tool UI)
- Stack: React 18 + TypeScript + Vite + Parcel + Tailwind + shadcn/ui

## Steps

1. **Initialize:** \`bash scripts/init-artifact.sh <project-name>\` then \`cd <project-name>\`
2. **Develop:** Edit generated React/TS sources
3. **Bundle:** \`bash scripts/bundle-artifact.sh\` → \`bundle.html\` (self-contained, inline assets)
4. **Share** \`bundle.html\` with the user
5. **(Optional)** Test/visualize only if requested — prefer showing artifact first to reduce latency

## Design rules

Avoid "AI slop": excessive centering, purple gradients, uniform rounded corners, Inter font.

## Requirements

- Project root must have \`index.html\`
- Bundler inlines JS/CSS via Parcel + html-inline

## Reference

- shadcn/ui: https://ui.shadcn.com/docs/components`,

  'skill-creator': `# Skill Creator

Create new Agent Skills and iterate until they trigger reliably and produce good outputs.

## When to use

- User wants a new skill or to improve an existing one
- Need eval loop: draft → test → review → revise

## Core loop

1. **Capture intent** — What should the skill do? When should it trigger? Output format? Need tests?
2. **Interview** — Edge cases, examples, success criteria, dependencies
3. **Write SKILL.md** — YAML frontmatter (\`name\`, pushy \`description\`) + imperative body (<500 lines ideal)
4. **Test cases** — 2–3 realistic prompts → save to \`evals/evals.json\`
5. **Run evals** — With-skill vs baseline in parallel; workspace \`<skill>-workspace/iteration-N/\`
6. **Review** — \`eval-viewer/generate_review.py\`; collect \`feedback.json\`
7. **Improve** — Generalize from feedback; bundle repeated scripts into \`scripts/\`
8. **Repeat** until user satisfied or feedback empty
9. **(Optional)** Description optimization via \`scripts.run_loop\`
10. **(Optional)** \`python -m scripts.package_skill\`

## SKILL.md anatomy

\`\`\`
skill-name/
├── SKILL.md          # required
├── scripts/          # deterministic helpers
├── references/       # load on demand
└── assets/           # templates, icons
\`\`\`

**Progressive disclosure:** metadata always loaded; body when triggered; references/scripts as needed.

## Eval checklist

- [ ] Spawn with-skill **and** baseline in the same turn
- [ ] Save \`timing.json\` from task notifications (\`total_tokens\`, \`duration_ms\`)
- [ ] Grade assertions → \`grading.json\` (\`text\`, \`passed\`, \`evidence\`)
- [ ] Aggregate: \`python -m scripts.aggregate_benchmark\`
- [ ] Launch viewer **before** self-grading when possible
- [ ] Read \`feedback.json\`; empty feedback = acceptable

## Writing principles

- Explain **why**, not endless MUST caps
- Description is the primary trigger — include near-miss phrases
- No malware or surprise content; Principle of Lack of Surprise
- Prefer imperative instructions and concrete output templates

## Key rules

- Do not use \`/skill-test\` — follow this skill's eval sequence
- Generalize improvements; avoid overfitting to eval prompts
- In headless/Cowork: viewer \`--static\` output; feedback downloads as \`feedback.json\``,

  Human: `# Human (De-AI Tone)

Edit writing to remove AI-generated patterns and restore natural, human voice. Based on Wikipedia "Signs of AI writing" (WikiProject AI Cleanup).

## When to use

- Text sounds generic, promotional, or "ChatGPT-ish"
- User asks to humanize, de-AI, or add voice to prose

## Process

1. Scan for patterns below
2. Rewrite problematic sections — preserve meaning, match intended tone
3. Add soul: opinions, rhythm, specificity — not just pattern removal
4. Deliver rewritten text (+ brief change summary if helpful)

## Add voice (not just clean)

- Vary sentence length; mix short punchy lines with longer ones
- Allow uncertainty: "impressive but unsettling" beats neutral lists
- Use "I" when honest; specific feelings beat "this is concerning"
- Let minor mess in — perfect structure feels algorithmic

## Patterns to fix (high signal)

| # | Problem | Watch for |
|---|---------|-----------|
| 1 | Inflated significance | testament, pivotal, landscape, underscores importance |
| 2 | Notability padding | lists of outlets without substance |
| 3 | -ing phrase depth | highlighting…, ensuring…, reflecting… |
| 4 | Promo tone | nestled, vibrant, breathtaking, must-visit |
| 5 | Weasel words | experts say, industry reports (no source) |
| 6 | Formulaic "challenges" sections | Despite challenges… continues to thrive |
| 7 | AI vocabulary | Additionally, delve, crucial, showcase, tapestry |
| 8 | Copula avoidance | serves as, boasts, features (use is/are/has) |
| 9 | Negative parallelism | not just X, it's Y |
| 10 | Rule of three overload | three adjectives/lists everywhere |
| 11 | Synonym cycling | protagonist → main character → central figure |
| 12 | False ranges | from X to Y on meaningless scales |
| 13 | Em dash overuse | — |
| 14 | Mechanical bold | |
| 15 | Bold-header bullet lists | **Topic:** sentence… |
| 16 | Title Case Headings | |
| 17 | Emoji bullets | |
| 18 | Curly quotes | use straight " |
| 19 | Chatbot artifacts | I hope this helps, Certainly!, Let me know |
| 20 | Knowledge-cutoff disclaimers | as of my last update… |
| 21 | Sycophancy | Great question! You're absolutely right! |
| 22 | Filler | in order to → to; due to the fact that → because |
| 23 | Excessive hedging | could potentially possibly… |
| 24 | Generic upbeat endings | bright future, exciting journey |

## Output quality bar

- Sounds natural read aloud
- Specific details over vague claims
- Simple constructions (is/are/has) where appropriate
- Tone fits context (formal, casual, technical)`
}

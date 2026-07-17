---
title: "webapp-testing"
description: "Web app testing flow and checks"
---

# Web App Testing

Test local web applications with native Python Playwright scripts.

## When to use

- Automating browser tests for local web apps
- Verifying UI behavior after changes

## Decision tree

```
Static HTML?
  Yes → Read HTML for selectors → Playwright script
  No  → Server running?
          No  → python scripts/with_server.py --help → helper + script
          Yes → Reconnaissance: navigate → networkidle → screenshot/DOM → act
```

## Helper scripts

- `scripts/with_server.py` — manages server lifecycle (multi-server supported)
- **Always run `--help` first** — treat scripts as black boxes; do not read source unless necessary

**Single server:**
```bash
python scripts/with_server.py --server "npm run dev" --port 5173 -- python your_automation.py
```

**Playwright skeleton:**
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')  # CRITICAL for dynamic apps
    # ... automation
    browser.close()
```

## Key rules

- Wait for `networkidle` before DOM inspection on dynamic apps
- Use descriptive selectors: `text=`, `role=`, CSS, IDs
- Always close the browser
- See `examples/` for element discovery, static HTML, console logging

## Related roles (matrix reverse)

**Recommended**

- [TestEngineer](/agents/standard/TestEngineer/)
- [UIDesigner](/agents/standard/UIDesigner/)

## Use this skill in Cursor

1. `@` reference: `docs/skills/external/webapp-testing/index.md`
2. Or follow the checklist on this page (skill 8)

This site does not run model inference. MCP SoT remains under `docs/zh/...`.

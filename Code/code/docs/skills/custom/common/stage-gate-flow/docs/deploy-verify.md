# Deployment Verification Checklist (fed back from Lessons)

> Source lessons:
> - `docs/zh/operations/ecs-deploy-host404/lessons/2026-07-17-nginx-host-false-404.md` (merged)
> - `docs/zh/operations/stage-gate-exit-evidence/lessons/2026-07-17-mcp-health-not-host-curl.md` (merged)

## Evidence layers (check separately at stage exit)

| Evidence | Proves | Does **not** prove |
|----------|--------|---------------------|
| Cursor-side `agents-skill-remote` / `health` green | MCP index readable, same-origin manifest | Static site Nginx, HTTP 200 with Host header |
| On ECS: static site + `manifest.json` curl **with Host** | Site and index reachable via Nginx | — |
| On ECS: `/agents-skill-mcp/healthz` **with Host** | MCP HTTP liveness | Static site page content |

When **no SSH from local machine**: MCP health counts as **partial evidence**; static-site Host probe is **pending ECS run** — do **not** mark all deploy items green by default.

Still forbidden: `curl 127.0.0.1` **without Host** and treating a 404 as proof of failure.

## Static site / manifest

1. Server tracks **`main`**; before `git pull`, if generate left dirty files: `git restore .` (do not commit generated artifacts on the deploy host)
2. `cd Code/code && npm ci && npm run build`
3. Confirm artifacts exist:
   - `docs/.vitepress/dist/index.html`
   - `docs/public/manifest.json`
4. Nginx probes **must** include Host (match `server_name`):

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  -H 'Host: <PUBLIC_HOST>' http://127.0.0.1/agents-skill/
# Expect 200; without Host you often hit default server → false 404
```

5. Spot-check index: `curl -sS -H 'Host: <PUBLIC_HOST>' http://127.0.0.1/agents-skill/manifest.json | head`

## Remote MCP

- Index same-origin: `MANIFEST_PATH` → `docs/public/manifest.json` (updated by build/generate)
- **Docs/manifest only**: usually no `pm2 restart` needed (~60s cache); for immediate effect: `pm2 restart agents-skill-mcp-remote`
- **Changed mcp-remote code/deps**: `npm ci` + restart
- Liveness: `curl -sS -H 'Host: <PUBLIC_HOST>' http://127.0.0.1/agents-skill-mcp/healthz`

## Build notes

- Do not use relative links from `docs/**` to repo-external `Doc/` (VitePress dead-links break build)
- Mention engineering doc paths as plain text only

Details: `Code/doc/phase1/07-deploy.md` (placeholder `<PUBLIC_HOST>`).

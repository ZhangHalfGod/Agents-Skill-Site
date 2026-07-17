# i18n — VitePress locales + Doc/en

> **日期**：2026-07-17  
> **决策**：发现站 `root` = English（`/`），中文 = `/zh/`；治理 SoT = `docs/zh/**`；工程文档 `Doc/**` 中文主仓 + `Doc/en/` 精选镜像。

## 背景

根 README 已英/中互链，但 VitePress 与 `Doc/` 仍为中文单语。需要官方 `locales` 顶栏切换，且不一次翻译全部正文。

## 决策

| 项 | 选择 |
|----|------|
| VitePress root | `en`（`/`） |
| 中文 locale | `zh`（`/zh/`） |
| 完整治理正文 SoT | `Code/code/docs/zh/**` |
| 英文站正文 | `docs/**`（root）：Role/Skill **全文**；Rules/Domains / 角色附属 docs 仍可 stub |
| MCP `source` | `docs/zh/...` |
| Doc 工程文档 | 中文真源；`Doc/en/` 仅高频对外页 |
| 不做 | IP 自动语言；机翻入库；MCP 写接口 |

## 影响

- 英文 Role/Skill：`/agents/...`、`/skills/...` 为独立英文全文（`scripts/en-*-bodies.mjs` + `npm run generate`）
- Cursor `@`（MCP）：以 MCP 返回的 `source`（`docs/zh/...`）为准；英文页可另 `@docs/agents|skills/...`
- `npm run generate`：扫描 `docs/zh`，写双 sidebar（en + zh），并写出英文 Role/Skill

## 验收

- 顶栏 EN / 简体中文可切换
- `/agents-skill/` 英文首页；Role/Skill 英文全文可读（不强制跳转 `/zh/`）
- `/agents-skill/zh/` 中文全文
- `generate` + `validate` + `build` 通过

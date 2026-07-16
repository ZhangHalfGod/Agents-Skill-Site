# agents-skill-site

VitePress 治理发现站源码。约束见 [`../doc/phase1/ADR-001-architecture-and-stack.md`](../doc/phase1/ADR-001-architecture-and-stack.md)。

## 真源

**`docs/**` 即为 Source of Truth**（agents · skills · rules · domains · operations）。  
直接编辑 Markdown；`npm run generate` 只刷新 `manifest.json`、侧栏与目录索引，**不会**从外仓覆盖正文。

## 本地开发

```bash
cd Code/code
npm install
npm run generate   # 或 npm run sync（别名）
npm run dev
```

开发服务器默认打开后，因 `base: '/agents-skill/'`，请访问：

`http://localhost:5173/agents-skill/`

已挂载样例：`http://localhost:5173/agents-skill/agents/standard/Architect/`

## 构建

```bash
npm run build
```

`prebuild` = `generate` + `validate`。

单独跑：

```bash
npm run generate
npm run validate
```

产物：`docs/.vitepress/dist/`；健康摘要：`/health/`、`public/health.json`。

生产发布见 [`../doc/phase1/07-deploy.md`](../doc/phase1/07-deploy.md)；放行勾选 [`../doc/phase1/08-release-checklist.md`](../doc/phase1/08-release-checklist.md)。

二期 MCP：[`mcp/README.md`](mcp/README.md)；规划 [`../../Doc/phase2/01-mcp-server-plan.md`](../../Doc/phase2/01-mcp-server-plan.md)。

```bash
npm run mcp:health
npm run mcp:server
```

## 本地预览（模拟生产端口）

```bash
npm run preview
```

访问：`http://127.0.0.1:3010/agents-skill/`

## 三期 Lesson

见 `docs/operations/README.md` 与 [`../../Doc/phase3/03-lesson-card-and-operations.md`](../../Doc/phase3/03-lesson-card-and-operations.md)。

## 目录

```text
scripts/
  sync-standards.mjs      # generate：docs → manifest / 侧栏
docs/
  .vitepress/config.mts   # base=/agents-skill/
  agents/ … skills/ … rules/ … operations/
  public/manifest.json    # generate 生成
```

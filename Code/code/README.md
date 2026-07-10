# agents-skill-site

VitePress 治理发现站源码。约束见 [`../doc/ADR-001-architecture-and-stack.md`](../doc/ADR-001-architecture-and-stack.md)。

## 本地开发

```bash
cd Code/code
npm install
npm run sync   # 从 Agents_Skill/standards 同步（可设 STANDARDS_ROOT）
npm run dev
```

开发服务器默认打开后，因 `base: '/agents-skill/'`，请访问：

`http://localhost:5173/agents-skill/`

已挂载样例：`http://localhost:5173/agents-skill/agents/standard/Architect/`

## 构建

```bash
npm run build
```

`prebuild` = `sync` + `validate`。无 `STANDARDS_ROOT` 时 sync 自动 repo scan 刷新 manifest，再用 validate 门禁。

单独跑：

```bash
npm run sync
npm run validate
```

产物：`docs/.vitepress/dist/`；健康摘要：`/health/`、`public/health.json`。

本机要从 standards 更新正文：设好 `STANDARDS_ROOT` 后 `npm run sync`。

生产发布见 [`../doc/07-deploy.md`](../doc/07-deploy.md)；放行勾选 [`../doc/08-release-checklist.md`](../doc/08-release-checklist.md)。

## 本地预览（模拟生产端口）

```bash
npm run preview
```

访问：`http://127.0.0.1:3010/agents-skill/`

## 目录

```text
scripts/
  sync-standards.mjs      # standards → docs 只读同步
docs/
  .vitepress/config.mts   # base=/agents-skill/
  index.md                # 首页
  agents/index.md
  agents/standard/Architect/index.md   # sync 生成
  skills/index.md
  rules/index.md
  public/manifest.json    # sync 生成（最小索引）
```

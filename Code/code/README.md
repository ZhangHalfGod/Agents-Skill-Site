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

`prebuild` 会先跑 `sync`。产物：`docs/.vitepress/dist/`

服务器只 clone 本仓、无 standards 树时：

```bash
SKIP_SYNC=1 npm run build
```

生产发布步骤见 [`../doc/07-deploy.md`](../doc/07-deploy.md)（git pull + 服务器编译）。

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

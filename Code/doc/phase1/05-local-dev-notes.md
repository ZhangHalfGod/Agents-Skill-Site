# 05 — 本地开发与构建笔记

## 已验证（2026-07-10）

| 项 | 结果 |
|----|------|
| Node（本机开发） | v22.22.0 |
| VitePress | 1.6.4 |
| `npm run build` | 通过 |
| 产物目录 | `docs/.vitepress/dist/` |

## 命令

```bash
cd Code/code
npm install
npm run generate # 扫 docs → manifest / 侧栏（npm run sync 为别名）
npm run dev      # http://localhost:5173/agents-skill/
npm run build
npm run preview  # http://127.0.0.1:3010/agents-skill/
```

注意：必须带 base 路径 `/agents-skill/`，根路径 `/` 会 404。

已验证挂载页：`/agents-skill/agents/standard/Architect/`（见 `06-content-mount.md`）。

## 生产部署

完整步骤见 [`07-deploy.md`](07-deploy.md)（形态 α）。摘要：本机 push → 服务器 git pull + build → Nginx `location /agents-skill/`。

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
npm run sync     # 从 standards 同步（默认 ../../../standards）
npm run dev      # http://localhost:5173/agents-skill/
npm run build
npm run preview  # http://127.0.0.1:3010/agents-skill/
```

注意：必须带 base 路径 `/agents-skill/`，根路径 `/` 会 404。

已验证挂载页：`/agents-skill/agents/standard/Architect/`（见 `06-content-mount.md`）。

## 生产部署（待执行）

见 ADR-001 §5。建议形态 α：将 `dist` 同步到服务器，Nginx：

```nginx
location /agents-skill/ {
    alias /var/www/agents-skill-site/dist/;
    try_files $uri $uri/ /agents-skill/index.html;
}
```

（上线前在 ECS 上 `nginx -t` 再 reload；不新开安全组端口。）

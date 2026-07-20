# 生产部署 — 静态站（Nginx）

> **Language:** 中文（本页）· 远程 MCP 见 [`../../mcp-remote/deploy/README.md`](../../mcp-remote/deploy/README.md)  
> **详细笔记（含排障）:** [`../../doc/phase1/07-deploy.md`](../../doc/phase1/07-deploy.md)

## 架构一览

| 组件 | 是否需要进程 | 说明 |
|------|:------------:|------|
| **静态发现站** | 否（默认） | Nginx `alias` → VitePress `dist/`；**一般不用 PM2** |
| **远程 MCP**（可选） | 是 | PM2 跑 `agents-skill-mcp-remote` → `127.0.0.1:3921`，再由 Nginx 反代 |
| **形态 β**（备选） | 可选 | [`ecosystem.config.cjs`](ecosystem.config.cjs) 用 `serve` 托管静态；默认不走这条 |

```text
http(s)://<PUBLIC_HOST>
  ├─ /agents-skill/      → 静态站（本目录 Nginx 片段）
  └─ /agents-skill-mcp/  → 远程 MCP（mcp-remote 部署文档）
```

`<PUBLIC_HOST>` = 你的公网 IP 或域名（Nginx `server_name`）。**勿**写进角色/技能正文。

---

## 1. 参数（本项目约定）

| 项 | 值 |
|----|-----|
| 服务器 clone 目录 | `/var/www/agents-skill-site` |
| 部署分支 | `main` |
| 构建目录 | `Code/code` |
| 构建产物（Nginx alias） | `Code/code/docs/.vitepress/dist/` |
| 索引（MCP 常用） | `Code/code/docs/public/manifest.json` |
| 对外路径 | `/agents-skill/` |
| Nginx 片段 | [`nginx-agents-skill.snippet.conf`](nginx-agents-skill.snippet.conf) |

---

## 2. 本机：推送到 main

```bash
# 在仓库根
git push origin main
```

改过 `docs/**` 时，服务器上 `npm run build` 会自动 `generate` 刷新 manifest。

---

## 3. 服务器：首次 / 日常构建

```bash
cd /var/www/agents-skill-site
git checkout main
git pull origin main

cd Code/code
node -v          # 建议 Node ≥ 22
npm ci
npm run build

test -f docs/.vitepress/dist/index.html
test -f docs/public/manifest.json
```

---

## 4. 服务器：Nginx

1. 打开你的站点配置，例如：`/etc/nginx/sites-available/<your-site>`  
2. 将 [`nginx-agents-skill.snippet.conf`](nginx-agents-skill.snippet.conf) 里的 `location /agents-skill/` 粘贴进对应 `server { }`  
3. 按需改 `alias` 路径（若 clone 目录不是 `/var/www/agents-skill-site`）  
4. 校验并重载：

```bash
nginx -t && nginx -s reload
# 或：service nginx reload
```

---

## 5. 验收

```bash
# 经本机 Nginx 探测时，Host 须与 server_name 一致，否则可能落到 default → 假 404
curl -sS -o /dev/null -w '%{http_code}\n' \
  -H 'Host: <PUBLIC_HOST>' http://127.0.0.1/agents-skill/

# 或直接公网 / 域名
curl -sS -o /dev/null -w '%{http_code}\n' http://<PUBLIC_HOST>/agents-skill/
```

期望 HTTP **200**，浏览器可打开首页。

---

## 6. 可选：远程 MCP（PM2 + Nginx）

静态站部署完成后，若要 Cursor 远程查索引：

→ 完整步骤见 **[`../../mcp-remote/deploy/README.md`](../../mcp-remote/deploy/README.md)**  
→ Nginx 片段：[`../../mcp-remote/deploy/nginx-agents-skill-mcp.snippet.conf`](../../mcp-remote/deploy/nginx-agents-skill-mcp.snippet.conf)  
→ Cursor 配置：[`../../mcp-remote/CURSOR-SETUP.md`](../../mcp-remote/CURSOR-SETUP.md)

摘要：

```bash
cd /var/www/agents-skill-site/Code/mcp-remote
cp deploy/env.production.example .env   # 设置 MCP_TOKEN，勿提交
npm ci
pm2 start deploy/ecosystem.config.cjs
pm2 save
# 再粘贴 /agents-skill-mcp/ location 并 nginx -t && nginx -s reload
```

---

## 本目录文件

| 文件 | 用途 |
|------|------|
| `nginx-agents-skill.snippet.conf` | 静态站 Nginx `location` |
| `ecosystem.config.cjs` | 形态 β 备选（PM2 + `serve`）；默认不用 |
| `README.md` | 本页 |

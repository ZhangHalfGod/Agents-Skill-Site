# 远程 MCP 部署（R2）

约束：[../../../Doc/phase2/03-remote-mcp-http.md](../../../Doc/phase2/03-remote-mcp-http.md)  
一期静态站：[../../doc/phase1/07-deploy.md](../../doc/phase1/07-deploy.md)

| 项 | 值 |
|----|-----|
| 进程 | PM2 名 **`agents-skill-mcp-remote`**（勿改 `mechassist-api` / `mcp-faq` / `mcp-gaode`） |
| 绑定 | `127.0.0.1:3921` |
| Nginx | `location /agents-skill-mcp/` → 上游 `/` |
| 探活 | `http://<PUBLIC_HOST>/agents-skill-mcp/healthz`（无 Token） |
| MCP | `http://<PUBLIC_HOST>/agents-skill-mcp/mcp`（Bearer） |
| 索引 | 默认 `MANIFEST_PATH` → 本仓 `Code/code/docs/public/manifest.json`（与静态站同源 generate） |
| 密钥 | 仅服务器 `.env`；**禁止**提交真实 Token |

`<PUBLIC_HOST>` = Nginx `server_name`（公网 IP 或域名）。用 `127.0.0.1` 测 Nginx 时须加 `-H 'Host: <PUBLIC_HOST>'`，否则易进 `default` 得假 404。详见 [07-deploy §6](../../doc/phase1/07-deploy.md)。

---

## 1. 本机：推送代码

合并进 **`main`** 并 push 后，再在服务器拉取。日常部署跟 `main`，勿长期停在 feature 分支。

---

## 2. 服务器：安装并启动进程

```bash
cd /var/www/agents-skill-site
git checkout main
git pull origin main

cd Code/mcp-remote
cp deploy/env.production.example .env
nano .env   # 设置 MCP_TOKEN=…；确认 MANIFEST_PATH

npm ci
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 status agents-skill-mcp-remote

# 直连进程探活（不经过 Nginx，无需 Host）
curl -sS http://127.0.0.1:3921/healthz
```

### 日常：只更新了站点 / docs（索引）

先按 [07-deploy](../../doc/phase1/07-deploy.md) 在 `Code/code` 执行 `npm run build`（会 generate 新 `manifest.json`）。

| 情况 | 是否 `pm2 restart` |
|------|:------------------:|
| 仅正文 / manifest 变更 | **通常不必**（`CACHE_TTL_MS` 默认约 60s 会刷新）；想立刻生效再重启 |
| 改了 `Code/mcp-remote/` 代码或依赖 | **要**：`npm ci` 后 restart |

```bash
# 可选：立刻清缓存
pm2 restart agents-skill-mcp-remote
```

### 日常：MCP 代码有变更

```bash
cd /var/www/agents-skill-site && git pull origin main
cd Code/mcp-remote && npm ci
pm2 restart agents-skill-mcp-remote
```

---

## 3. 服务器：Nginx location

1. 打开 `/etc/nginx/sites-available/mechassist`  
2. 将 [`nginx-agents-skill-mcp.snippet.conf`](nginx-agents-skill-mcp.snippet.conf) 中的 `location /agents-skill-mcp/` 块粘贴到 `location /agents-skill/` **之后**  
3. 校验并重载：

```bash
nginx -t && nginx -s reload
```

不要用 `systemctl reload nginx`（现网可能无该 unit）。

---

## 4. 验收

```bash
# 经 Nginx（带 Host）
curl -sS -H 'Host: <PUBLIC_HOST>' http://127.0.0.1/agents-skill-mcp/healthz
# 期望：{"ok":true,...}

curl -sS -H 'Host: <PUBLIC_HOST>' \
  http://127.0.0.1/agents-skill/manifest.json | head -c 200

# 或公网 / 域名
curl -sS http://<PUBLIC_HOST>/agents-skill-mcp/healthz

# 无 Token → 401
curl -sS -o /dev/null -w '%{http_code}\n' -X POST \
  -H 'Host: <PUBLIC_HOST>' http://127.0.0.1/agents-skill-mcp/mcp

# 静态站不受影响
curl -sS -o /dev/null -w '%{http_code}\n' \
  -H 'Host: <PUBLIC_HOST>' http://127.0.0.1/agents-skill/

ss -lntp | egrep '3921|3001|3002|3003|80'
```

Cursor：[`../CURSOR-SETUP.md`](../CURSOR-SETUP.md)；样例 [`../cursor-mcp.url.production.json.example`](../cursor-mcp.url.production.json.example)。

冒烟（经 Nginx，需 Token）：

```bash
cd /var/www/agents-skill-site/Code/mcp-remote
SMOKE_BASE=http://127.0.0.1/agents-skill-mcp MCP_TOKEN='…' npm run smoke
```

（若冒烟走公网 Host 校验失败，改用直连 `http://127.0.0.1:3921` 或带正确 Host 的客户端。）

---

## 5. 回滚

```bash
pm2 stop agents-skill-mcp-remote
# 可选：pm2 delete agents-skill-mcp-remote && pm2 save

# 删掉 mechassist 里 location /agents-skill-mcp/ 块
nginx -t && nginx -s reload
```

`/agents-skill/` 静态站应仍可用。

---

## 本目录文件

| 文件 | 用途 |
|------|------|
| `nginx-agents-skill-mcp.snippet.conf` | Nginx 粘贴片段 |
| `ecosystem.config.cjs` | PM2 |
| `env.production.example` | 服务器 `.env` 模板（无密钥） |

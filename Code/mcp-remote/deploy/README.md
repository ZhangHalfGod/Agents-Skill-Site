# 远程 MCP 部署（R2）

约束：[../../../Doc/phase2/03-remote-mcp-http.md](../../../Doc/phase2/03-remote-mcp-http.md)  
一期静态站：[../../doc/phase1/07-deploy.md](../../doc/phase1/07-deploy.md)

| 项 | 值 |
|----|-----|
| 进程 | PM2 名 **`agents-skill-mcp-remote`**（新建；勿改 `mechassist-api` / `mcp-faq` / `mcp-gaode`） |
| 绑定 | `127.0.0.1:3921` |
| Nginx | `location /agents-skill-mcp/` → 上游 `/` |
| 探活 | `http://8.163.18.183/agents-skill-mcp/healthz`（无 Token） |
| MCP | `http://8.163.18.183/agents-skill-mcp/mcp`（Bearer） |
| 密钥 | 仅服务器 `.env`；**禁止**提交真实 Token |

## 1. 本机：推送代码

在 `feature/remote-mcp-http`（或已合入的 main）推送到 GitHub 后，再在服务器拉取。

## 2. 服务器：安装并启动进程

```bash
cd /var/www/agents-skill-site
git pull   # 按你的分支策略；脏工作树先处理生成物

cd Code/mcp-remote
cp deploy/env.production.example .env
nano .env   # 设置 MCP_TOKEN=…；确认 MANIFEST_PATH

npm ci
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 status agents-skill-mcp-remote

# 本机探活（未过 Nginx）
curl -sS http://127.0.0.1:3921/healthz
```

日常更新进程：

```bash
cd /var/www/agents-skill-site && git pull
cd Code/mcp-remote && npm ci   # lock 有变时
pm2 restart agents-skill-mcp-remote
```

## 3. 服务器：Nginx location

1. 打开 `/etc/nginx/sites-available/mechassist`
2. 将 [`nginx-agents-skill-mcp.snippet.conf`](nginx-agents-skill-mcp.snippet.conf) 中的 `location /agents-skill-mcp/` 块  
   粘贴到现有 `location /agents-skill/` **之后**
3. 校验并重载（**不要** `systemctl reload nginx`）：

```bash
nginx -t && nginx -s reload
```

## 4. 验收

```bash
# 探活（公网 / 本机经 Nginx）
curl -sS http://127.0.0.1/agents-skill-mcp/healthz
curl -sS http://8.163.18.183/agents-skill-mcp/healthz

# 无 Token → 401
curl -sS -o /dev/null -w '%{http_code}\n' -X POST http://127.0.0.1/agents-skill-mcp/mcp

# 静态站不受影响
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1/agents-skill/

# 端口：3921 仅 127.0.0.1；未动 3001–3003
ss -lntp | egrep '3921|3001|3002|3003|80'
```

Cursor：完整步骤见 [`../CURSOR-SETUP.md`](../CURSOR-SETUP.md)；JSON 样例见 [`../cursor-mcp.url.production.json.example`](../cursor-mcp.url.production.json.example)。

本机冒烟（经公网，需 Token）：

```bash
cd /var/www/agents-skill-site/Code/mcp-remote
SMOKE_BASE=http://127.0.0.1/agents-skill-mcp MCP_TOKEN='…' npm run smoke
```

（`SMOKE_BASE` 无尾斜杠；脚本会请求 `$SMOKE_BASE/healthz` 与 `$SMOKE_BASE/mcp`。）

## 5. 回滚

```bash
# 停进程
pm2 stop agents-skill-mcp-remote
# 可选：pm2 delete agents-skill-mcp-remote && pm2 save

# 删掉 mechassist 里 location /agents-skill-mcp/ 块
nginx -t && nginx -s reload
```

`/agents-skill/` 静态站应仍可用。

## 本目录文件

| 文件 | 用途 |
|------|------|
| `nginx-agents-skill-mcp.snippet.conf` | Nginx 粘贴片段 |
| `ecosystem.config.cjs` | PM2 |
| `env.production.example` | 服务器 `.env` 模板（无密钥） |

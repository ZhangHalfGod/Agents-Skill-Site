# mcp-remote — 远程 MCP（URL / HTTP）

> **功能分支**：`feature/remote-mcp-http`  
> **架构约束**：[../../Doc/phase2/03-remote-mcp-http.md](../../Doc/phase2/03-remote-mcp-http.md)（**Accepted**；公网 Nginx + Token）  
> **阶段**：**R2** — Nginx `/agents-skill-mcp/` + PM2；R1 本地仍可用

Cursor 等客户端通过 **URL** 连接，无需本机跑 `Code/code/mcp` stdio。

## 与 `Code/code/mcp/` 的区别

| | `Code/code/mcp/` | `Code/mcp-remote/`（本目录） |
|--|------------------|------------------------------|
| 传输 | stdio | Streamable HTTP |
| 客户端 | 需本机 Node + 本仓脚本 | 只配 URL + Token |
| 数据 | `MANIFEST_PATH` / `MANIFEST_URL` | 同左（复用 `catalog-api.mjs`） |

## 本地运行（R1）

```bash
cd Code/mcp-remote
cp .env.example .env   # 改 MCP_TOKEN；按需改 MANIFEST_URL
npm install
npm start
```

- 探活（无鉴权）：`http://127.0.0.1:3921/healthz`
- MCP（需 Bearer）：`http://127.0.0.1:3921/mcp`
- 进程**只绑** `127.0.0.1`；拒绝 `0.0.0.0`

冒烟（另开终端，Token 与 `.env` 一致）：

```bash
cd Code/mcp-remote
MCP_TOKEN=change-me-local-token npm run smoke
```

## 生产部署（R2）

步骤见 **[`deploy/README.md`](deploy/README.md)**（Nginx 片段、PM2、验收、回滚）。

- 公网探活：`http://8.163.18.183/agents-skill-mcp/healthz`
- 公网 MCP：`http://8.163.18.183/agents-skill-mcp/mcp`
- Cursor 样例：[`cursor-mcp.url.production.json.example`](cursor-mcp.url.production.json.example)

## Cursor 配置

| 场景 | 样例 |
|------|------|
| 本机 R1 | [`cursor-mcp.url.json.example`](cursor-mcp.url.json.example) |
| 公网 R2 | [`cursor-mcp.url.production.json.example`](cursor-mcp.url.production.json.example) |

把 `<TOKEN>` 换成你的 `MCP_TOKEN`。选 URL **或** stdio，不必双开。

## 环境变量

| 变量 | 含义 | 默认 |
|------|------|------|
| `MCP_TOKEN` | Bearer 密钥（**必填**） | — |
| `HOST` | 绑定地址 | `127.0.0.1` |
| `PORT` | 端口 | `3921` |
| `MANIFEST_URL` | 远程索引 | 见 `.env.example` |
| `MANIFEST_PATH` | 本地 manifest（无 URL 时） | `Code/code/docs/public/manifest.json` |
| `CACHE_TTL_MS` | 缓存 TTL | `60000` |
| `ALLOWED_HOSTS` | 可选；逗号分隔 Host 白名单（Nginx 已改写 Host 时通常不需要） | — |

## 布局

```text
mcp-remote/
  src/server.mjs
  src/auth.mjs
  src/create-mcp.mjs
  scripts/smoke.mjs
  deploy/                 # R2 Nginx / PM2 / env 模板
  cursor-mcp.url.json.example
  cursor-mcp.url.production.json.example
```

## 硬约束（摘录）

- 只读；密钥不进 Git
- 不新开安全组端口；对外走 Nginx
- 不占用 mechassist `3001–3003`
- 关闭本服务不影响 `/agents-skill/` 网站

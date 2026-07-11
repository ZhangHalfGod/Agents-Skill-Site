# mcp-remote — 远程 MCP（URL / HTTP）

> **功能分支**：`feature/remote-mcp-http`  
> **架构约束**：[../../Doc/phase2/03-remote-mcp-http.md](../../Doc/phase2/03-remote-mcp-http.md)（**Accepted**；公网 Nginx + Token）  
> **阶段**：**R1** — 本地 `127.0.0.1:3921` + Bearer + tools 对齐 stdio

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

## Cursor 配置

见 [`cursor-mcp.url.json.example`](cursor-mcp.url.json.example)。把 `<TOKEN>` 换成你的 `MCP_TOKEN`。  
R2 上线后 URL 改为 `http://<host>/agents-skill-mcp/mcp`（Nginx 反代，见 `deploy/`）。

## 环境变量

| 变量 | 含义 | 默认 |
|------|------|------|
| `MCP_TOKEN` | Bearer 密钥（**必填**） | — |
| `HOST` | 绑定地址 | `127.0.0.1` |
| `PORT` | 端口 | `3921` |
| `MANIFEST_URL` | 远程索引 | 见 `.env.example` |
| `MANIFEST_PATH` | 本地 manifest（无 URL 时） | `Code/code/docs/public/manifest.json` |
| `CACHE_TTL_MS` | 缓存 TTL | `60000` |

## 布局

```text
mcp-remote/
  src/server.mjs          # HTTP 入口
  src/auth.mjs            # Bearer
  src/create-mcp.mjs      # tools（对齐 stdio）
  scripts/smoke.mjs
  cursor-mcp.url.json.example
  deploy/                 # R2 Nginx / 进程示例
```

## 硬约束（摘录）

- 只读；密钥不进 Git
- 不新开安全组端口；对外走 Nginx（R2）
- 不占用 mechassist `3001–3003`
- 关闭本服务不影响 `/agents-skill/` 网站

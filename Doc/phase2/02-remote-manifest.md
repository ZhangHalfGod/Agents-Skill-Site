# 02 — 远程 Manifest（他人可共用 MCP）

> **状态**：Accepted（实现约束）  
> **日期**：2026-07-11  
> **上级**：[`00-cursor-mcp.md`](00-cursor-mcp.md)、[`01-mcp-server-plan.md`](01-mcp-server-plan.md)  
> **实现笔记**：[`../../Code/doc/phase2/02-remote-manifest.md`](../../Code/doc/phase2/02-remote-manifest.md)  
> **改代码前必读**：本文件。

---

## 1. 目标

1. Cursor MCP **数据**不依赖本机仓库里的 `manifest.json`，改为读取**服务器已发布的静态索引**。  
2. **其他人**用同一套 MCP 配置（或克隆本仓 `mcp/` 后改 URL）即可查询你的 agents/skills/rules 目录。  
3. **仍不**在公网暴露 MCP 端口；他人本机跑 stdio MCP，只去拉你的 HTTPS/HTTP 静态 JSON。

```text
他人的 Cursor
  └─ 本机 node mcp/server.mjs（stdio）
        └─ GET http://8.163.18.183/agents-skill/manifest.json
              （及同目录 health.json / validate-report.json）
```

---

## 2. 硬约束

- [ ] 只读；禁止写 standards / 禁止远程写接口  
- [ ] 默认推荐 `MANIFEST_URL` 指向已上线静态文件；`MANIFEST_PATH` 仅本地开发兜底  
- [ ] **不**新增 ECS 上 MCP listen 端口；不新开安全组  
- [ ] 返回字段仍优先 `id` + `source`；不把「必须本机有 standards 树」写进协议  
- [ ] 网络失败返回明确错误：`FETCH_FAIL` / `NO_MANIFEST`  
- [ ] 他人文档写清：需要 Node ≥ 22 + 本仓 `Code/code/mcp`（或整仓），**数据**来自你的公网 URL  

---

## 3. 环境变量约定

| 变量 | 含义 | 示例 |
|------|------|------|
| `MANIFEST_URL` | 远程 manifest 完整 URL（优先） | `http://8.163.18.183/agents-skill/manifest.json` |
| `MANIFEST_PATH` | 本地文件（`MANIFEST_URL` 未设时） | `…/docs/public/manifest.json` |
| `CATALOG_BASE_URL` | 可选；未设则从 `MANIFEST_URL` 去掉文件名 | `http://8.163.18.183/agents-skill` |

派生：

- `{base}/health.json`  
- `{base}/validate-report.json`  

生产默认 base（文档与 example 使用）：

`http://8.163.18.183/agents-skill`

（有域名后只改 URL，不改 tool 名。）

---

## 4. 实现范围

| 文件 | 动作 |
|------|------|
| `mcp/catalog-api.mjs` | 支持 async 加载 URL；`createCatalogApi` 可 async 或提供 `loadCatalog()` |
| `mcp/server.mjs` | 启动时按 URL/PATH 加载；tool 内可刷新或启动缓存 |
| `mcp/cursor-mcp.json.example` | **仅** `MANIFEST_URL`（+ 指向 server.mjs 的 args，可用相对说明） |
| `mcp/cursor-mcp.shared.json.example` | 给他人复制的共享配置模板 |
| `mcp/README.md` | 他人接入步骤 |
| `Code/doc/phase2/02-remote-manifest.md` | 实现笔记 |

### 缓存策略（本步）

- 进程启动加载一次；提供 tool `health` 时可选重拉（简单：每次 `health`/`validate` 重拉，list/get 用内存缓存 + `CACHE_TTL_MS` 默认 60s）。  
- 本步采用：**TTL 60s 内存缓存**；`MANIFEST_URL` 模式下生效。

---

## 5. 他人如何用（验收话术）

1. 克隆本仓库（或至少 `Code/code`）。  
2. `cd Code/code && npm install`。  
3. Cursor MCP 配置：

```json
{
  "mcpServers": {
    "agents-skill": {
      "command": "node",
      "args": ["<他本机绝对路径>/Code/code/mcp/server.mjs"],
      "env": {
        "MANIFEST_URL": "http://8.163.18.183/agents-skill/manifest.json"
      }
    }
  }
}
```

4. 对话：`list_agents` / `get_agent` — 数据来自你的服务器静态文件。  

说明：`args` 仍需要他本机有一份 `server.mjs`（协议限制 stdio 要本地进程）；**索引内容**不依赖他是否有 standards 或是否 pull 最新 docs。

---

## 6. 明确不做（本步）

- ECS 上常驻 MCP SSE/HTTP 服务  
- 鉴权 / 多租户账号  
- 把 MCP 打成无仓库的单文件远程下载（可三期再做 npm 包）  

---

## 7. 验收

- [x] 仅设 `MANIFEST_URL`、不设 `MANIFEST_PATH` 时 CLI `health` 成功  
- [x] `get_agent Architect` 与公网站点一致  
- [x] 断网或错误 URL → `FETCH_FAIL`  
- [x] 本地 `MANIFEST_PATH` 模式仍可用（开发兜底）  
- [x] 网站 / 安全组无变更  

---

## 8. 回退

去掉 `MANIFEST_URL` 即回到只读本地文件；不影响 ECS 静态站。

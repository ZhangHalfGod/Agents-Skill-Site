# 03 — 远程 MCP（URL）实现笔记

> **状态**：R1 ✅ · **R2 文档/片段已就绪**（待 ECS 粘贴 Nginx + PM2 实操勾选）  
> **计划**：[../../Doc/phase2/03-remote-mcp-http.md](../../Doc/phase2/03-remote-mcp-http.md)（**Accepted**；公网 Nginx + Token）  
> **代码**：[`../../mcp-remote/`](../../mcp-remote/README.md)  
> **分支**：`feature/remote-mcp-http`  
> **SDK**：`@modelcontextprotocol/sdk@^1.29.0`  
> **进程管理（已选）**：PM2 名 `agents-skill-mcp-remote`

## R1 落点

| 路径 | 说明 |
|------|------|
| `src/server.mjs` | `127.0.0.1:3921`；`/healthz` 无鉴权；`/mcp` Bearer；可选 `ALLOWED_HOSTS` |
| `src/auth.mjs` | `Authorization: Bearer`；缺 `MCP_TOKEN` 拒绝启动 |
| `src/create-mcp.mjs` | tools 对齐 stdio；复用 `catalog-api.mjs` |
| `scripts/smoke.mjs` | healthz → 401 → listTools → health / list_agents |
| `cursor-mcp.url.json.example` | 本机 URL |

### 路径约定（写死）

- 进程：`/mcp`、`/healthz`
- 公网：`http://8.163.18.183/agents-skill-mcp/mcp` → Nginx 反代 `http://127.0.0.1:3921/mcp`
- Nginx 将 `Host` 设为 `127.0.0.1`，以通过 SDK localhost Host 校验

### 本地验收

```bash
cd Code/mcp-remote && cp .env.example .env && npm install && npm start
MCP_TOKEN=change-me-local-token npm run smoke
```

- [x] 仅绑 `127.0.0.1`
- [x] 无 Token → 401
- [x] tools 与 stdio 同名只读集
- [x] `npm run smoke` PASS（2026-07-11）
- [ ] Cursor IDE 本机 URL 调通（待人工勾选）

## R2 落点

| 路径 | 说明 |
|------|------|
| `deploy/nginx-agents-skill-mcp.snippet.conf` | `location /agents-skill-mcp/` |
| `deploy/ecosystem.config.cjs` | PM2 |
| `deploy/env.production.example` | 服务器 `.env` 模板 |
| `deploy/README.md` | 安装 / Nginx / 验收 / 回滚 |
| `cursor-mcp.url.production.json.example` | 公网 URL 样例 |

### ECS 实操勾选（人工）

- [ ] `npm ci` + `.env`（`MCP_TOKEN` + `MANIFEST_PATH`）
- [ ] `pm2 start deploy/ecosystem.config.cjs` 且 `curl 127.0.0.1:3921/healthz` → ok
- [ ] `mechassist` 已插入 location；`nginx -t` && `nginx -s reload`
- [ ] `curl http://8.163.18.183/agents-skill-mcp/healthz` → ok
- [ ] 无 Token POST `/agents-skill-mcp/mcp` → 401
- [ ] `curl -I http://8.163.18.183/agents-skill/` 仍 200
- [ ] `ss`：3921 仅本机；3001–3003 未动

## R3

- 他人零克隆 + Cursor 仅 URL；计划 §9 合入勾选

## 验收勾选（合入前，对照计划 §9）

- [ ] Cursor 仅 URL + Token，无本仓，可 list/get/validate
- [x] 错误 Token → 401；无写类 tool
- [ ] 停进程后静态站仍 200（ECS 勾选）
- [x] 未绑 `0.0.0.0`
- [x] README + example；密钥未进 Git
- [ ] R2 ECS 实操勾选完成

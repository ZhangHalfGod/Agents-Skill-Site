# 03 — 远程 MCP（URL）实现笔记

> **状态**：R1 实现中 / 本地可跑  
> **计划**：[../../Doc/phase2/03-remote-mcp-http.md](../../Doc/phase2/03-remote-mcp-http.md)（**Accepted**；公网 Nginx + Token）  
> **代码**：[`../../mcp-remote/`](../../mcp-remote/README.md)  
> **分支**：`feature/remote-mcp-http`  
> **SDK**：`@modelcontextprotocol/sdk@^1.29.0`（`StreamableHTTPServerTransport` + `createMcpExpressApp`）

## R1 落点

| 路径 | 说明 |
|------|------|
| `src/server.mjs` | `127.0.0.1:3921`；`/healthz` 无鉴权；`/mcp` Bearer |
| `src/auth.mjs` | `Authorization: Bearer`；缺 `MCP_TOKEN` 拒绝启动 |
| `src/create-mcp.mjs` | tools 对齐 `Code/code/mcp/server.mjs`；复用 `catalog-api.mjs` |
| `scripts/smoke.mjs` | healthz → 401 → listTools → health / list_agents |
| `cursor-mcp.url.json.example` | 本机 URL 样例 |

### 路径约定（写死）

- 进程 MCP 路径：`/mcp`（末尾无强制斜杠）
- 探活：`/healthz`
- R2 公网预期：`http://<host>/agents-skill-mcp/mcp` → 反代到 `http://127.0.0.1:3921/mcp`

### 本地验收

```bash
cd Code/mcp-remote && cp .env.example .env && npm install && npm start
# 另终端：
MCP_TOKEN=change-me-local-token npm run smoke
```

- [x] 仅绑 `127.0.0.1`
- [x] 无 Token → 401
- [x] tools 与 stdio 同名只读集
- [x] `npm run smoke` PASS（2026-07-11）
- [ ] Cursor IDE 本机 URL 调通（待人工勾选）

## R2 / R3

- Nginx location 片段、进程管理 → `deploy/`
- 他人零克隆验收 → 计划 §9

## 验收勾选（合入前，对照计划 §9）

- [ ] Cursor 仅 URL + Token，无本仓，可 list/get/validate
- [x] 错误 Token → 401；无写类 tool
- [ ] 停进程后静态站仍 200（R2 后验）
- [x] 未绑 `0.0.0.0`
- [x] README + example；密钥未进 Git
- [ ] 本笔记 R2/R3 勾选完成

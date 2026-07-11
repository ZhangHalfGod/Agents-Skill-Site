# 04 — 他人零克隆：只用 Cursor 连远程 MCP

> **状态**：Accepted（R3）  
> **日期**：2026-07-11  
> **对象**：同事 / 外包 / 另一台电脑——**不克隆** Agents-Skill-Site 仓库  
> **详细步骤**：[../../Code/mcp-remote/CURSOR-SETUP.md](../../Code/mcp-remote/CURSOR-SETUP.md)

---

## 1. 一句话

向运维要 **Token**，在 Cursor 的 `mcp.json` 里加一个 **URL MCP**，即可查询与网站同一套 agents / skills / rules。

**不要**：`git clone`、本机 `npm install`、跑 `node server.mjs`。

---

## 2. 发给对方的最小信息（运维可复制）

```text
MCP URL:  http://8.163.18.183/agents-skill-mcp/mcp
探活:     http://8.163.18.183/agents-skill-mcp/healthz   （浏览器可开，无需 Token）
网站:     http://8.163.18.183/agents-skill/              （可选，给人看）
Token:    （口头/密钥渠道单独发，勿进群聊长期留存）
手册:     仓库 Code/mcp-remote/CURSOR-SETUP.md（有仓可读；无仓则把下面 JSON 发出去即可）
```

对方 `~/.cursor/mcp.json`（或项目 `.cursor/mcp.json`）增加：

```json
"agents-skill-remote": {
  "url": "http://8.163.18.183/agents-skill-mcp/mcp",
  "headers": {
    "Authorization": "Bearer <TOKEN>"
  }
}
```

注意：若文件里已有其它 `mcpServers` 项，只**追加这一项**，不要再嵌套一层 `"mcpServers"`。

---

## 3. 对方如何自测（30 秒）

1. `curl -sS http://8.163.18.183/agents-skill-mcp/healthz` → 含 `"ok":true`  
2. Cursor MCP 面板里 `agents-skill-remote` 为已连接  
3. 对话：「用 list_agents 列出标准角色」→ 约 8 条  
4. 「调用 health」→ `ok: true`

失败时：Token 是否一致、URL 是否漏了末尾 `/mcp`、公司网是否拦 HTTP。见 CURSOR-SETUP §6。

---

## 4. 边界（避免误解）

| 能做 | 不能做 |
|------|--------|
| 只读查目录、编号、校验摘要 | 改 standards / 写仓库 |
| 用返回的 `source` 路径在**自己有文件的工作区**里 `@` | 远程 MCP **不会**自动把 standards 同步到对方磁盘 |
| 关 MCP 不影响对方其它项目 | 把 Token 提交进 Git |

对方若要按角色说明书改代码，仍需自己有对应源码仓（或另获 standards）；MCP 只提供**索引与路径提示**。

---

## 5. 与 stdio / 远程 Manifest 方案对比

| 方案 | 对方要不要本仓 | 文档 |
|------|:--------------:|------|
| **远程 URL MCP（本文）** | 否 | 本文件 + CURSOR-SETUP |
| 本机 stdio + `MANIFEST_URL` | 要（跑 server.mjs） | `02-remote-manifest.md` |
| 只浏览网站 | 否 | 浏览器打开 `/agents-skill/` |

推荐对外统一用 **远程 URL MCP**。

# Cursor 配置远程 MCP（URL + Token）

> 适用：公网已部署的 `agents-skill-mcp-remote`（R2/R3 已验收）  
> 你**不需要**克隆本仓库、**不需要**本机跑 Node。  
> 给他人的一页纸：[../../Doc/phase2/04-zero-clone-share.md](../../Doc/phase2/04-zero-clone-share.md)  
> 架构说明：[../../Doc/phase2/03-remote-mcp-http.md](../../Doc/phase2/03-remote-mcp-http.md)

---

## 1. 你需要准备的两样东西


| 项      | 值                                                   | 说明                        |
| ------ | --------------------------------------------------- | ------------------------- |
| MCP 地址 | `http://8.163.18.183/agents-skill-mcp/mcp`          | 固定；末尾是 `/mcp`             |
| Token  | 与服务器 `Code/mcp-remote/.env` 里的 `MCP_TOKEN` **完全一致** | 向运维索取；**不要**写进 Git / 聊天记录 |


先在浏览器或终端确认服务活着（探活**不用** Token）：

```bash
curl -sS http://8.163.18.183/agents-skill-mcp/healthz
# 期望含 "ok": true
```

---

## 2. 在 Cursor 里加 MCP（推荐：全局配置）

### 方式 A — 设置界面

1. 打开 Cursor → **Settings**（设置）
2. 找到 **MCP**（或 Features → MCP）
3. 选择 **Add new global MCP server** / 编辑 MCP 配置
4. 若打开的是 JSON 文件，把下面整段合并进 `mcpServers`（已有其它 server 时只加这一项，不要删掉别人的）

### 方式 B — 直接编辑配置文件

常见路径（按你本机 Cursor 版本二选一或都有）：


| 范围            | 路径                       |
| ------------- | ------------------------ |
| 全局（推荐，任意项目可用） | `~/.cursor/mcp.json`     |
| 仅当前项目         | 项目根目录 `.cursor/mcp.json` |


---

## 3. 配置内容（复制后改 Token）

把 `<TOKEN>` 换成真实密钥（不要带尖括号，不要换行）：

```json
{
  "mcpServers": {
    "agents-skill-remote": {
      "url": "http://8.163.18.183/agents-skill-mcp/mcp",
      "headers": {
        "Authorization": "Bearer <TOKEN>"
      }
    }
  }
}
```

仓库内同款样例（无真实密钥）：

- `[cursor-mcp.url.production.json.example](cursor-mcp.url.production.json.example)`

### 本机调试用（可选）

仅当你在本机 `npm start` 了 `Code/mcp-remote` 时：

```json
{
  "mcpServers": {
    "agents-skill-remote-local": {
      "url": "http://127.0.0.1:3921/mcp",
      "headers": {
        "Authorization": "Bearer <与本地 .env 相同的 MCP_TOKEN>"
      }
    }
  }
}
```

样例：`[cursor-mcp.url.json.example](cursor-mcp.url.json.example)`

---

## 4. 保存后如何确认接通

1. 保存 `mcp.json` 后，回到 Cursor **MCP** 面板，看 `agents-skill-remote` 是否为已连接 / 绿点（若显示错误，点 Refresh）
2. 新开 Agent 对话，试一句：
  - 「用 agents-skill-remote 的 `list_agents` 列出标准角色」  
  - 或：「调用 health 看索引是否健康」
3. 期望：能列出约 **8** 个标准角色；`health` 返回 `ok` 与 counts

可用 tools（只读）：`health`、`refresh_catalog`、`list_agents`、`get_agent`、`list_skills`、`get_skill`、`list_rules`、`resolve_number`、`validate`。

---

## 5. 和旧版「本机 stdio MCP」的关系


| 方式             | 配置形态                               | 要不要本仓 |
| -------------- | ---------------------------------- | ----- |
| **远程 URL（本文）** | `"url"` + Bearer                   | **否** |
| 本机 stdio       | `"command": "node"` + `server.mjs` | 要     |


- **推荐日常只用远程 URL**，配置更简单。  
- 不要同时开两个指向同一套目录的 MCP（名字都叫 agents-skill），以免对话里搞混。  
- 若以前配过 `Code/code/mcp` 的 stdio，可在 MCP 面板里先关掉/删掉旧项。

---

## 6. 常见问题


| 现象                             | 处理                                                                          |
| ------------------------------ | --------------------------------------------------------------------------- |
| 浏览器打开 `/mcp` 显示 `unauthorized` | **正常**；浏览器不会带 Bearer，请用 Cursor 配置                                           |
| Cursor 里红字 / Unauthorized      | Token 与服务器 `.env` 不一致，或多了空格/换行                                              |
| 连不上 / timeout                  | 确认 `curl …/healthz` 为 ok；公司网络是否拦非 HTTPS                                     |
| tools 列表为空                     | MCP 面板 Refresh；检查 URL 是否写成了 `/agents-skill-mcp/` 而漏了 `**/mcp`**             |
| 想换密钥                           | 服务器改 `MCP_TOKEN` → `pm2 restart agents-skill-mcp-remote` → 本机同步改 `mcp.json` |


探活（给人看）与 MCP（给 Cursor）路径不同：

- 探活：`http://8.163.18.183/agents-skill-mcp/healthz`  
- MCP：`http://8.163.18.183/agents-skill-mcp/mcp`

---

## 7. 安全注意

- Token 只放在本机 Cursor 配置或密码管理器；**禁止**提交到 Git、禁止写进 `standards/` 角色 md。  
- 远程 MCP **只读**，不能代替你在 Cursor 里改代码的确认步骤；拿到 `source` 路径后再 `@` 文件执行。


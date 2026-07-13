# Cursor 配置远程 MCP（URL + Token）

> 适用：公网已部署的 `agents-skill-mcp-remote`  
> 你**不需要**克隆本仓库、**不需要**本机跑 Node，只需配置一个 URL + Token。

---

## 1. 你需要准备的两样东西

| 项      | 值                                                   | 说明                        |
| ------ | --------------------------------------------------- | ------------------------- |
| MCP 地址 | `http://YOUR_DEPLOYED_HOST/agents-skill-mcp/mcp`     | 末尾是 `/mcp`               |
| Token  | 与服务器 `.env` 里的 `MCP_TOKEN` **完全一致**        | 向管理员索取；**不要**写进 Git |

先在浏览器或终端确认服务活着（探活**不用** Token）：

```bash
curl -sS http://YOUR_DEPLOYED_HOST/agents-skill-mcp/healthz
# 期望含 "ok": true
```

---

## 2. 在 Cursor 里加 MCP

### 方式 A — 设置界面

1. 打开 Cursor → **Settings**（设置）
2. 找到 **MCP**（或 Features → MCP）
3. 选择 **Add new global MCP server**
4. 填入 URL 和 Token

### 方式 B — 直接编辑配置文件

| 范围    | 路径                       |
| ------ | ------------------------- |
| 全局    | `~/.cursor/mcp.json`      |
| 仅项目  | 项目根目录 `.cursor/mcp.json` |

---

## 3. 配置内容

```json
{
  "mcpServers": {
    "agents-skill-remote": {
      "url": "http://YOUR_DEPLOYED_HOST/agents-skill-mcp/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_TOKEN>"
      }
    }
  }
}
```

### 本机调试用（可选）

仅当你在本机跑 `Code/mcp-remote` 时：

```json
{
  "mcpServers": {
    "agents-skill-remote-local": {
      "url": "http://127.0.0.1:3921/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_TOKEN>"
      }
    }
  }
}
```

---

## 4. 保存后确认接通

1. 回到 Cursor **MCP** 面板，看 `agents-skill-remote` 是否为绿点
2. 新开 Agent 对话，试一句：
   - 「用 agents-skill-remote 的 `list_agents` 列出标准角色」
   - 「调用 `health` 看索引是否健康」
3. 期望：能列出约 **8** 个标准角色；`health` 返回 `ok` 与 counts

可用 tools（全部只读）：`health`、`refresh_catalog`、`list_agents`、`get_agent`、`list_skills`、`get_skill`、`list_rules`、`resolve_number`、`validate`。

---

## 5. 和本机 stdio MCP 的关系

| 方式             | 配置形态                               | 要不要本仓 |
| -------------- | ---------------------------------- | ----- |
| **远程 URL（推荐）** | `"url"` + Bearer                   | **否** |
| 本机 stdio       | `"command": "node"` + `server.mjs` | 要     |

推荐日常只用远程 URL，配置更简单。不要同时开两个指向同一套目录的 MCP。

---

## 6. 常见问题

| 现象                             | 处理                                                                          |
| ------------------------------ | --------------------------------------------------------------------------- |
| 浏览器打开 `/mcp` 显示 `unauthorized` | **正常**；浏览器不会带 Bearer                                                |
| Cursor 里红字 / Unauthorized      | Token 与服务器 `.env` 不一致，或多了空格/换行                                  |
| 连不上 / timeout                  | 确认 `curl …/healthz` 为 ok；公司网络是否拦非 HTTPS                           |
| tools 列表为空                     | MCP 面板 Refresh；检查 URL 末尾 `/mcp` 是否正确                               |
| 想换密钥                           | 服务器改 `MCP_TOKEN` → 重启进程 → 本机同步改 `mcp.json`                      |

探活与 MCP 路径不同：
- 探活：`http://YOUR_DEPLOYED_HOST/agents-skill-mcp/healthz`
- MCP：`http://YOUR_DEPLOYED_HOST/agents-skill-mcp/mcp`

---

## 7. 安全注意

- Token 只放在本机 Cursor 配置或密码管理器；**禁止**提交到 Git
- 远程 MCP **只读**，拿到 `source` 路径后再在 Cursor 中 `@` 对应 Markdown 源文件执行

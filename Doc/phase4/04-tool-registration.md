# 04 — MCP 服务 → OpenClaw tool 注册映射

> **文档级别**：四期契约  
> **日期**：2026-07-29  
> **硬约束**：所有挂进编排总线的 MCP 服务**只读**；Lesson / skill 正文永远由 Agent 写工作区文件，不经 MCP  
> **样例落点**：[`../../Code/orchestration/openclaw/mcp.servers.example.yaml`](../../Code/orchestration/openclaw/mcp.servers.example.yaml)

---

## 1. 服务清单与挂接映射

| 服务 | 形态 | 端点 | 鉴权 | 挂进 OpenClaw 的用途 | 状态 |
|------|------|------|------|----------------------|:----:|
| **agents-skill-remote**（本仓 `Code/mcp-remote/`） | MCP Streamable HTTP | `http(s)://<PUBLIC_HOST>/agents-skill-mcp/mcp`（R1 本机 `127.0.0.1:3921/mcp`） | Bearer `MCP_TOKEN` | 角色/技能索引查询：每跳开场 `get_agent`/`get_skill` → 拿 `source` 路径 → `@` 正文 | ✅ 线上运行 |
| **mcp-gaode**（外部仓） | 自建 HTTP（`GET /capabilities` + `POST /tools/call`） | 部署侧地址 | Key 在 env | 出行/天气工具（Home 天气主路径已用） | ✅ Home 已挂 |
| **mcp-faq**（外部仓） | 同上 | 部署侧地址 | 同上 | 机械 FAQ 查询 | ✅ 线上运行 |
| extern-api（对话入口） | 自建 HTTP | — | — | **四期 v1 不接入总线**（公网 Chat 主链路不动） | 明确不做 |

## 2. agents-skill-remote 只读工具（9 个）在编排中的用法

| 工具 | 编排中的典型用法 |
|------|------------------|
| `health` | 每跳开场自检；注意 **health 绿 ≠ 交付物已验收**（证据分层教训） |
| `refresh_catalog` | 蒸馏合入后刷索引 |
| `list_agents` / `get_agent` | 唤起角色前取 persona 的 `source` 路径与绑定技能 |
| `list_skills` / `get_skill` | 取出门清单（stage-gate-flow 等）`source` |
| `list_rules` | 查 L0/L1/L2 约束路径 |
| `resolve_number` | 「使用技能 N」编号协议解析 |
| `validate` | 构建门禁结果只读查询 |

**纪律**：`get_*` 只回索引（id / 绑定 / `source`），正文仍由执行层 `@` 磁盘文件——这条是站点分层模型的根，编排总线同样遵守。

## 3. 挂接方式（OpenClaw 侧）

Home 机已有成功路径（天气走 `mcp.servers` 挂 mcp-gaode）。四期沿用同一机制，样例：

```yaml
# 节选自 Code/orchestration/openclaw/mcp.servers.example.yaml（无密钥；真实配置留部署侧）
mcp:
  servers:
    agents-skill-remote:
      transport: http
      url: "http://127.0.0.1:3921/mcp"        # 或公网 /agents-skill-mcp/mcp
      auth:
        type: bearer
        token_env: "MCP_TOKEN"                # 值只放 ~/.openclaw/.env
    mcp-gaode:
      transport: http
      url: "http://<部署侧>/tools/call"
      capabilities_url: "http://<部署侧>/capabilities"
```

**待验证**（试点时逐条确认）：OpenClaw 配置文件中 `mcp.servers` 的确切键名结构、bearer 注入方式、HTTP 自建服务（capabilities/tools.call 形态）与标准 MCP 的适配层是否需要薄封装。

## 4. 安全基线（与部署侧既有基线一致）

| 项 | 要求 |
|----|------|
| 密钥 | `MCP_TOKEN` / 高德 Key 等只放 `~/.openclaw/.env` 或部署侧 env；样例只写 `*_env` 键名 |
| 网络 | 本机走 `127.0.0.1`；跨机只走 Tailscale；公网只经既有 Nginx 门面 |
| 只读 | 不为编排新增任何 MCP 写工具；要改文件 → 机制 B 的 Cursor CLI 在业务仓改 |
| 审计 | 编排者保留信封与工具调用摘要；密钥不进信封、不进飞书回执 |

## 5. 验收（试点时勾）

- [ ] OpenClaw 会话内 `agents-skill-remote` 调 `health` 返回 `ok: true` 且 dataSource 正确
- [ ] 会话内经 `get_skill stage-gate-flow` 拿到 `source` 并能 `@` 正文
- [ ] 全链路无任何一次 MCP 写调用（工具列表核对）

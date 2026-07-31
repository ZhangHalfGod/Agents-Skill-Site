# 04 — MCP 服务 → OpenClaw tool 注册映射

> **文档级别**：四期契约  
> **日期**：2026-07-29 · **修订**：2026-07-31（SF-HS）  
> **硬约束**：挂进编排总线的 MCP **只读**（含正文只读）；Lesson / 业务代码永不经 MCP 写入  
> **流程名**：**Single-Facade MCP + Hop Snapshot**（详见 [`06-single-facade-hop-snapshot.md`](06-single-facade-hop-snapshot.md)）  
> **样例落点**：[`../../Code/orchestration/openclaw/mcp.servers.example.yaml`](../../Code/orchestration/openclaw/mcp.servers.example.yaml)

---

## 1. 服务清单与挂接映射

| 服务 | 形态 | 端点 | 鉴权 | 挂进 OpenClaw 的用途 | 状态 |
|------|------|------|------|----------------------|:----:|
| **agents-skill-remote**（本仓 `Code/mcp-remote/`） | MCP Streamable HTTP | `http(s)://<PUBLIC_HOST>/agents-skill-mcp/mcp` | Bearer `MCP_TOKEN` | **唯一**角色/技能门面：索引 + `get_source_text` 正文 | ✅ 线上；正文工具须部署本仓 0.2+ |
| **mcp-gaode** / **mcp-faq** | — | — | — | **本流水线不挂**（Home 天气等另线） | 明确不做 |
| extern-api（对话入口） | — | — | — | **四期 v1 不接入总线** | 明确不做 |
| 本机 `127.0.0.1:3921` | 同左 | R1 | 同左 | **后续另一条路**；当前编排统一公网 | 延后 |

## 2. agents-skill-remote 只读工具（10 个）

| 工具 | 编排中的典型用法 |
|------|------------------|
| `health` | 每跳开场自检；**health 绿 ≠ 交付物已验收** |
| `refresh_catalog` | 蒸馏合入后刷索引（非每跳） |
| `list_agents` / `get_agent` | 角色自查：取 id / 绑定 / `source` |
| `list_skills` / `get_skill` | 技能自查：取 `source` |
| **`get_source_text`** | **单门面正文**：`source` 或 `kind`+`id` → 返回 markdown 文本（可 `maxChars` 截断） |
| `list_rules` | L0/L1/L2 路径 |
| `resolve_number` | 编号协议 |
| `validate` | 构建门禁只读查询 |

**纪律**：

1. OpenClaw 文档跳：**角色自查** MCP（main 不代查说明书）。  
2. 拿到 `source` 后必须用 **`get_source_text`** 取正文——**禁止**改读本机 Site 仓、禁止另开 HTTP 爬站作为主路径。  
3. 派 Cursor 前：把正文摘录冻成 **Playbook Pack** 写入 Goal（跳界快照）；Cursor 不再回源。

## 3. 挂接方式（OpenClaw 侧 · CLI）

```bash
# Token 只放 ~/.openclaw/.env 或 --header，勿进 Git
openclaw mcp add agents-skill-remote \
  --transport streamable-http \
  --url "http://<PUBLIC_HOST>/agents-skill-mcp/mcp" \
  --header "Authorization=Bearer <MCP_TOKEN>"

openclaw mcp probe
openclaw mcp list
```

样例意图见 `mcp.servers.example.yaml`（无密钥）。  
**已验证（bm）**：`openclaw mcp add` 支持 `--transport streamable-http`、`--url`、`--header`；挂接后 `list`/`probe` 可见工具。

## 4. 安全基线

| 项 | 要求 |
|----|------|
| 密钥 | `MCP_TOKEN` 只放 env / header 运行时；样例只写占位 |
| 网络 | 编排统一公网门面；本机 R1 延后 |
| 只读 | 不新增 MCP 写工具；`get_source_text` 仅读 `docs/zh|en/**/*.md` |
| 审计 | 信封 / resolve / pack 不含 token；飞书不贴正文全量 pack |

## 5. 验收（试点时勾）

- [ ] OpenClaw 会话内 `health` → `ok: true`
- [ ] `get_skill stage-gate-flow` 得 `source`，且 `get_source_text` 返回正文
- [ ] 工具列表无写接口；本流水线未挂 gaode/faq
- [ ] H3 Goal 含 Playbook Pack（见 06）

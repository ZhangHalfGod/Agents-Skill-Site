# 00 — 二期规划：Cursor + MCP 正确消费本站 Agents

> **文档级别**：二期规划（服从 S0）  
> **日期**：2026-07-11  
> **前提**：一期网站已验收；磁盘 `standards/` 仍是 Source of Truth  
> **目标**：在 Cursor 里用 MCP **只读**拿到与网站同一套 agents/skills/rules 索引，按说明书触发执行——**不是**在网页里跑 Agent。
> **目录**：本文件位于 `Doc/phase2/`；一期文档见 `Doc/phase1/`。

---

## 1. 为什么要 MCP（以及为什么不能替代网站）

```text
治理层（已有）          执行层（二期补强）
standards/  ──sync──►  网站浏览/Health/RunGuide
     │                      │
     └── 同一份 manifest ───┼──► MCP tools（list/get/validate）
                            │
                            ▼
                         Cursor 对话里调 tool
                         → 再 @ 源 md / 改代码
```

| 做 | 不做 |
|----|------|
| MCP 暴露 `manifest` 同源数据 | 网站内嵌模型推理 |
| Cursor 用 tool 查「角色 2 绑哪些技能」 | 用 MCP 替代文档站发现能力 |
| tool 返回**源路径**与站点 URI | 在角色 md 写死公网 IP |
| 可开关关闭 MCP，不影响网站 | 把组织知识只写在 tool 描述里 |

对齐 S0：[`../SYSTEM-DIRECTION.md`](../SYSTEM-DIRECTION.md) §2～§3 —— **MCP 补手不替脑**。

---

## 2. 推荐使用方式（人在 Cursor 里怎么做）

### 2.1 日常（不依赖 MCP，一期已可用）

1. 浏览器打开 `http://8.163.18.183/agents-skill/`（或本地 preview）  
2. 选角色 → **复制 Cursor 触发句** / 导出任务上下文 `.md`  
3. 粘贴到 Cursor；按需 `@standards/.../Role.md` 与技能 `SKILL.md`  
4. 编号：`使用角色 2` / `使用技能 1`（站点 QuickJump 或口头约定）

### 2.2 二期（Cursor + MCP）

1. 在 Cursor 配置本仓库 MCP Server（见 §4）  
2. 对话示例：  
   - 「列出标准 8 角色」→ `list_agents`  
   - 「Architect 绑定哪些技能」→ `get_agent`  
   - 「使用技能 4 的源路径」→ `get_skill` / `resolve_number`  
   - 「当前索引是否健康」→ `health` / `validate`  
3. Agent **根据 tool 返回的 `source` 路径**再 `@` 文件执行；**禁止**只凭 tool 短描述改核心模块  

### 2.3 正确心智模型

| 错误 | 正确 |
|------|------|
| 「MCP 就是我的 Agent」 | MCP 是**目录服务员**；角色说明书在 `standards/` |
| 「打开网站 URL 让模型爬」 | 用 manifest / tool；URL 仅给人看 |
| 「公网 IP 写进 Prompt」 | 只传相对源路径与技能 ID |

---

## 3. MCP 最小工具契约（建议）

与 `Doc/phase1/03-uri-registry.md` §6 对齐，一期静态 `manifest.json` 已具备数据，二期 MCP **读同一文件**（或构建产物副本）。

| Tool | 入参 | 出参（摘要） | 说明 |
|------|------|--------------|------|
| `health` | — | `ok`, `contentHash`, `validatedAt`, counts | 对齐站点 `/health/` |
| `list_agents` | `scope?=standard\|domain` | `[{index,id,title,siteUri,source}]` | 标准八角色 + 可选 domains |
| `get_agent` | `id` 或 `index` | 元数据 + `skills[]` + `skillsRecommended[]` + `source` | 矩阵同源 |
| `list_skills` | — | 1～11 + 可选 domain skills | |
| `get_skill` | `id` 或 `index` | `siteUri`, `source`, `boundAgents` | |
| `list_rules` | `level?` | L0/L1/L2 列表 | |
| `resolve_number` | `kind: role\|skill`, `n` | 对应 URI + source | 编号协议 |
| `validate` | — | 与 `npm run validate` 同口径摘要 | 可选，重计算或读报告 |

**约束**：

- 只读；无 `write_*` / 无改仓库 tool（一期）。  
- 返回字段优先 `id` + `source`（相对 `standards/`），站点 `siteUri` 可选。  
- 错误用明确 code：`NOT_FOUND` / `VALIDATE_FAIL`。

---

## 4. 实现落点（建议顺序）

| 步 | 内容 | 产出 |
|:--:|------|------|
| A | 冻结本文件 + S0 §8 决策「启动 MCP 门面」 | 本文 |
| B | 独立小包 `mcp-agents-skill`（或 `Code/code/mcp/`）读 `manifest.json` | Node MCP server |
| C | Cursor `mcp.json` 指向本地 server；**默认不绑公网** | 开发机可用 |
| D | （可选）内网 / Tailscale 只读 HTTP：`GET /agents-skill/manifest.json` 已有 | 远程 Cursor 读静态 JSON |
| E | 文档：在 Ops / DevLead 运行指引中增加「MCP 调用示例」 | 不写进角色 SoT URL |
| F | operations 只读入口（若需要）另开 ADR；默认关 | 与 7.4 一致 |

**技术偏好**：先 **stdio 本地 MCP**（Cursor 官方常见），再考虑远程 SSE；数据源优先 **构建已校验的 manifest**，避免 MCP 自己扫盘与网站漂移。

---

## 5. Cursor 配置草图（实现时再落文件）

**推荐（读服务器索引，给他人共用）：**

```json
{
  "mcpServers": {
    "agents-skill": {
      "command": "node",
      "args": ["/绝对路径/Agents-Skill-Site/Code/code/mcp/server.mjs"],
      "env": {
        "MANIFEST_URL": "http://8.163.18.183/agents-skill/manifest.json"
      }
    }
  }
}
```

详见 [`02-remote-manifest.md`](02-remote-manifest.md) 与 `Code/code/mcp/cursor-mcp.shared.json.example`。

对话策略建议写进用户规则（可选）：

> 涉及本仓库治理角色时，先调用 `agents-skill` 的 `get_agent` / `get_skill` 取得源路径，再 `@` 对应 md；核心模块遵守 L0。

---

## 6. 与现有资产映射

| 网站 / 文件 | MCP |
|-------------|-----|
| `/health/` + `health.json` | `health` |
| `manifest.json` agents/skills/rules | `list_*` / `get_*` |
| QuickJump 编号 | `resolve_number` |
| RunGuide 导出的上下文 md | 可由 `get_agent` 在客户端拼出同等内容 |
| `npm run validate` | `validate` 或发布前 CI |

---

## 7. 验收口径（二期 MCP MVP）

- [ ] Cursor 能 `list_agents` 得到 8 条且与网站一致  
- [ ] `get_agent Architect` 的 skills 与矩阵 / 站点标签一致  
- [ ] `resolve_number role 2` → Architect 源路径  
- [ ] 关闭 MCP 进程后，网站浏览不受影响  
- [ ] 无工具可写 standards；无公网强制依赖  

---

## 8. 明确不做（二期仍禁止）

- 网页聊天执行 Agent  
- MCP 自动改业务代码而不经 Cursor 确认  
- 用爬取 `8.163.18.183` HTML 代替 manifest  
- operations 未脱敏就挂公网  

---

## 9. 下一步行动

1. 评审本文；S0 §8 记「启动二期 MCP 门面规划」。  
2. 实现 `Code/code/mcp/server.mjs`（或独立仓）最小 `health` + `list_agents` + `get_agent`。  
3. 本机 Cursor 接通后，用 Architect 任务跑通「tool → @ 文件 → 产出」。  
4. 稳定后把示例回灌 `mcp-builder` 技能说明（改 standards，再 sync 网站）。

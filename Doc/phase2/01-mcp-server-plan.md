# 01 — MCP Server 实现计划（二期步 B/C）

> **状态**：Accepted（实现约束）  
> **日期**：2026-07-11  
> **上级**：[`00-cursor-mcp.md`](00-cursor-mcp.md)  
> **实现笔记**：[`../../Code/doc/phase2/01-mcp-server.md`](../../Code/doc/phase2/01-mcp-server.md)  
> **改代码前必读**：本文件；冲突时以 S0 + `00-cursor-mcp.md` 为准。

---

## 1. 本步目标

在本机 Cursor 通过 **stdio MCP** 只读查询与网站同源的 `manifest.json`，跑通：

`health` → `list_agents` → `get_agent` → `resolve_number`

**不做**：写 standards、爬公网、SSE/远程服务、operations。

---

## 2. 硬约束（实现检查单）

- [x] 数据源仅 `docs/public/manifest.json`（可用 `MANIFEST_PATH` 覆盖）  
- [x] 全部 tool **只读**；禁止任何写盘 / 改 git tool  
- [x] 返回优先 `id` + `source`；可附 `siteUri`；**不**返回公网 IP  
- [x] 错误码：`NOT_FOUND` / `BAD_KIND` / `VALIDATE_FAIL` / `NO_MANIFEST`  
- [x] 日志只打 **stderr**（stdout 留给 MCP 协议）  
- [x] 关闭 MCP 进程不影响 VitePress 站点  
- [x] 依赖装在 `Code/code/`，不污染 standards  

---

## 3. 技术选型（冻结本步）

| 项 | 选定 | 理由 |
|----|------|------|
| 运行时 | Node ≥ 22.2.1（与一期一致） | ADR-001 |
| SDK | `@modelcontextprotocol/sdk`（稳定 1.x 线） | Cursor 生态常用；stdio 成熟 |
| Schema | `zod`（随 SDK 用法） | tool 入参校验 |
| 入口 | `Code/code/mcp/server.mjs` | 与 `00` §5 草图一致 |
| 业务逻辑 | `Code/code/mcp/catalog-api.mjs` | 已有；本步补全 rules/validate/domains |
| 传输 | Stdio only | 本机 Cursor；不绑公网 |

换 SDK 大版本须新开 `Doc/phase2/02-*.md` 计划，禁止静默换栈。

---

## 4. Tool 清单（本步必须实现）

| Tool | 入参 | 行为 |
|------|------|------|
| `health` | 无 | 读 manifest + 可选 `health.json`；返回 ok/hash/counts |
| `list_agents` | `scope?`: `standard` \| `domain` \| `all` | standard=八角色；domain=manifest.domains；默认 standard |
| `get_agent` | `id?` 或 `index?`（至少一个） | 标准角色详情；含 skills |
| `list_skills` | `include_domain?` bool | 默认仅 common 1～11 |
| `get_skill` | `id?` 或 `index?` | 技能详情 |
| `list_rules` | `level?` L0\|L1\|L2 | 过滤层级 |
| `resolve_number` | `kind`: role\|skill，`n`: number | 编号协议 |
| `validate` | 无 | 读 `validate-report.json` 或 `health.json`；无文件则根据 manifest 计数做轻量检查 |

---

## 5. 文件产出

| 路径 | 动作 |
|------|------|
| `Code/code/mcp/catalog-api.mjs` | 扩展 list_rules / validate / domains；修正 CLI |
| `Code/code/mcp/server.mjs` | **新建** MCP stdio server |
| `Code/code/mcp/cursor-mcp.json.example` | Cursor 配置样例（相对路径说明） |
| `Code/code/package.json` | 加依赖 + `mcp:server` script |
| `Code/doc/phase2/01-mcp-server.md` | 实现笔记与验收记录 |
| `Doc/phase2/README.md` | 链到本计划 |

---

## 6. 验收（本步出门）

```bash
cd Code/code
npm run sync && npm run validate   # 确保 manifest 新鲜
node mcp/catalog-api.mjs health
node mcp/server.mjs                # 应挂起等 stdio；Ctrl+C 退出
# Cursor：按 example 配置后对话「列出标准角色」
```

- [x] CLI `health` / `get_agent Architect` 正常  
- [ ] Cursor 能列出 8 agents（待 IDE 接通勾选）  
- [x] `resolve_number kind=role n=2` → Architect + source  
- [x] 无 write tool；`npm run accept` 网站仍通过  

---

## 7. 回退

删除/停用 Cursor 中 `agents-skill` MCP 条目即可；网站与一期流程不变。

---

## 8. 下一步（本步完成后）

另开计划 `02-cursor-usage.md`：用户规则话术、Architect 联调剧本；可选再开 `03-remote-manifest.md`（Tailscale 读静态 JSON）。

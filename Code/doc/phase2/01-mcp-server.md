# 01 — MCP Server 实现笔记

> 约束计划：[`../../Doc/phase2/01-mcp-server-plan.md`](../../Doc/phase2/01-mcp-server-plan.md)  
> 上级规划：[`../../Doc/phase2/00-cursor-mcp.md`](../../Doc/phase2/00-cursor-mcp.md)

## 状态

| 项 | 状态 |
|----|:----:|
| 计划文档 `01-mcp-server-plan.md` | ✅ |
| catalog-api 扩展（rules/validate/domains） | ✅ |
| `server.mjs` stdio + 8 tools | ✅ |
| Cursor example | ✅ |
| CLI 冒烟 | ✅ 2026-07-11 |
| Cursor 接通 | 待你在 IDE 配置后勾选 |

## 命令

```bash
cd Code/code
npm install
npm run validate
npm run mcp:health
npm run mcp:server          # stdio；一般由 Cursor 拉起
```

## Cursor 配置

1. 打开 Cursor → Settings → MCP  
2. 参考 `Code/code/mcp/cursor-mcp.json.example`  
3. 本机可复制 `cursor-mcp.local.json`（已填本仓库绝对路径；已 gitignore）内容到 MCP 设置  

对话：「用 agents-skill 的 list_agents 列出标准角色」→ 再 `get_agent` id=Architect → `@` 返回的 `source`。

## 验收记录

| 项 | 结果 | 日期 |
|----|------|------|
| CLI health | ✅ ok + hash | 2026-07-11 |
| resolve_number role 2 → Architect | ✅ | 2026-07-11 |
| list_agents ×8 | ✅（CLI/API） | 2026-07-11 |
| get_agent Architect | ✅ | 2026-07-11 |
| 无 write tool | ✅ | 2026-07-11 |
| Cursor 接通 | ⬜ 待用户确认 | |

## 回退

在 Cursor MCP 设置中移除 `agents-skill` 即可；网站不受影响。

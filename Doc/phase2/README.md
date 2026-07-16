# 二期文档（Cursor + MCP）

在 Cursor 中用 MCP **只读**消费与网站同一套 agents/skills/rules 索引；**不**在网页内跑 Agent。

## 本目录（先计划后改代码）

| 文件 | 用途 | 状态 |
|------|------|:----:|
| [00-cursor-mcp.md](00-cursor-mcp.md) | 总规划：用法、契约、禁区 | ✅ |
| [01-mcp-server-plan.md](01-mcp-server-plan.md) | MCP Server 实现计划 | ✅ |
| [02-remote-manifest.md](02-remote-manifest.md) | 远程 Manifest（stdio + 远程数据） | ✅ |
| [03-remote-mcp-http.md](03-remote-mcp-http.md) | **远程 MCP（URL / HTTP）架构**（公网 Nginx + Token） | ✅ |
| [04-zero-clone-share.md](04-zero-clone-share.md) | **他人零克隆**分享说明（R3） | ✅ |

**Cursor 怎么配远程 MCP（操作手册）** → [`../../Code/mcp-remote/CURSOR-SETUP.md`](../../Code/mcp-remote/CURSOR-SETUP.md)

后续计划命名：`04-*.md`… **每步改代码前先写计划**。  
远程 MCP 功能分支：`feature/remote-mcp-http`。

## 实现落点

| 路径 | 说明 |
|------|------|
| [../../Code/code/mcp/](../../Code/code/mcp/README.md) | stdio server / catalog-api / Cursor 样例 |
| [../../Code/mcp-remote/](../../Code/mcp-remote/README.md) | **远程 URL MCP**（独立目录，本分支主战场） |
| [../../Code/doc/phase2/01-mcp-server.md](../../Code/doc/phase2/01-mcp-server.md) | stdio 实现笔记 |
| [../../Code/doc/phase2/03-remote-mcp-http.md](../../Code/doc/phase2/03-remote-mcp-http.md) | 远程 MCP 实现笔记 |

## 硬约束（摘自 S0）

- Source of Truth 是本仓 `Code/code/docs/**`；MCP 与网站消费 generate 后的索引  
- MCP 补手不替脑；关闭 MCP 不影响网站  
- 禁止角色 md 写死公网 URL  

上级入口：[../README.md](../README.md) · 一期：[../phase1/](../phase1/README.md)

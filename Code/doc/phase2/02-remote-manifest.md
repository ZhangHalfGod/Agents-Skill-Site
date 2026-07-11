# 02 — 远程 Manifest 实现笔记

> 约束计划：[`../../Doc/phase2/02-remote-manifest.md`](../../Doc/phase2/02-remote-manifest.md)

## 状态

| 项 | 状态 |
|----|:----:|
| 计划文档 | ✅ |
| `MANIFEST_URL` 加载 + TTL 缓存 | ✅ |
| 共享 Cursor 样例 | ✅ `mcp/cursor-mcp.shared.json.example` |
| 远程 health 冒烟 | ✅ 2026-07-11 |

## 他人配置要点

1. 克隆仓库 + `npm install`（只要有 `server.mjs`）  
2. `env.MANIFEST_URL=http://8.163.18.183/agents-skill/manifest.json`  
3. `args` 指向**他自己机器上**的 `server.mjs` 绝对路径  

数据来自你的 ECS 静态文件；不在服务器开 MCP 端口。

## 验收

| 项 | 结果 |
|----|------|
| 仅 MANIFEST_URL 时 health | ✅ mode=remote |
| get_agent Architect | ✅ |
| 错误 URL → FETCH_FAIL | ✅ |
| 本地 PATH 兜底 | ✅（不设 URL 时） |

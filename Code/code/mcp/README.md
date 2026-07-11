# agents-skill MCP（二期）

只读 catalog。约束：

- [`Doc/phase2/01-mcp-server-plan.md`](../../../Doc/phase2/01-mcp-server-plan.md)
- [`Doc/phase2/02-remote-manifest.md`](../../../Doc/phase2/02-remote-manifest.md)

## 两种数据模式

| 模式 | 环境变量 | 说明 |
|------|----------|------|
| **远程（推荐分享）** | `MANIFEST_URL` | 读服务器静态 `manifest.json`，不依赖本机 docs |
| **本地（开发）** | `MANIFEST_PATH` | 读仓库内文件 |

生产索引：

`http://8.163.18.183/agents-skill/manifest.json`

## 你自己 / 其他人怎么配 Cursor

1. 克隆本仓库，`cd Code/code && npm install`  
2. 复制 [`cursor-mcp.shared.json.example`](cursor-mcp.shared.json.example)  
3. 把 `args` 里的路径改成**他电脑上** `server.mjs` 的绝对路径  
4. **保留** `MANIFEST_URL` 为你的公网地址（数据来自你的服务器）  
5. 粘贴到 Cursor → Settings → MCP  

本机已填好路径的文件：`cursor-mcp.local.json`（gitignore，默认已用 `MANIFEST_URL`）。

## 命令

```bash
cd Code/code
# 读服务器
MANIFEST_URL=http://8.163.18.183/agents-skill/manifest.json npm run mcp:health
# 读本地
npm run mcp:health
npm run mcp:server
```

## 说明

- MCP **进程**在每人自己的电脑上（Cursor stdio 限制）。  
- **目录数据**来自你服务器上的静态 JSON，大家共享同一份线上索引。  
- 不会在 ECS 上新开 MCP 端口。

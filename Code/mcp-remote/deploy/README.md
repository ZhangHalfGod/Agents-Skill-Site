# 远程 MCP 部署片段（占位）

Nginx `location`、进程管理示例将在 **R2** 写入本目录。

约束见：[../../../Doc/phase2/03-remote-mcp-http.md](../../../Doc/phase2/03-remote-mcp-http.md)

- 仅反代到 `127.0.0.1:3921`（或环境变量端口）
- 变更后：`nginx -t` && `nginx -s reload`
- **禁止**提交真实 Token

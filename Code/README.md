# Code — 网站实现工程根

> 对齐 S0：[`../Doc/SYSTEM-DIRECTION.md`](../Doc/SYSTEM-DIRECTION.md)  
> **技术栈冻结**：[`doc/phase1/ADR-001-architecture-and-stack.md`](doc/phase1/ADR-001-architecture-and-stack.md)

## 目录约定

```text
Doc/
  phase1/              # 一期规划
  phase2/              # 二期规划（Cursor+MCP）
Code/
  doc/
    00-dev-log.md      # 跨期日志
    phase1/            # 一期实现笔记 + ADR
    phase2/            # 二期实现笔记
  code/                # VitePress 源码 + mcp/
```

| 目录 | 放什么 | 不放什么 |
|------|--------|----------|
| `doc/` | 服务器清单、ADR、部署、验收、踩坑 | 密钥、口令、私钥 |
| `code/` | 可构建的网站工程 | `node_modules`、`.env` 真密钥 |

文档索引：[`doc/README.md`](doc/README.md)

## 当前状态

- **一期（阶段 1～7）验收完成**。  
- 生产：`http://8.163.18.183/agents-skill/`。  
- 验收：`cd Code/code && npm run accept`。  
- **二期**：[`Doc/phase2/00-cursor-mcp.md`](../Doc/phase2/00-cursor-mcp.md)；骨架 `code/mcp/catalog-api.mjs`。

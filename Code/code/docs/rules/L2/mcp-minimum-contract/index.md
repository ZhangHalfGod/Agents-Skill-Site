---
title: "L2 · MCP 最低契约"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
同步自 `.mdc`：`standards/common/rules/L2/mcp-minimum-contract.mdc`。本站只读呈现，不注入 Cursor Rules。
:::

# L2 · MCP 最低契约

1. `/capabilities` 中工具定义必须与 `/tools/call` 实际行为一致。
2. 每个工具必须具备完整 description 与 parameters。
3. 错误语义稳定，避免同一错误场景返回不一致结构。

## 元数据

- 层级：`L2`
- 文件：`mcp-minimum-contract.mdc`
- alwaysApply：`false`
- 源路径：`standards/common/rules/L2/mcp-minimum-contract.mdc`

## 在 Cursor 中使用

`@standards/common/rules/L2/mcp-minimum-contract.mdc`

---
title: "L2 · 对话最低安全"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
同步自 `.mdc`：`standards/common/rules/L2/dialog-minimum-safety.mdc`。本站只读呈现，不注入 Cursor Rules。
:::

# L2 · 对话最低安全

1. 高风险问题必须走安全兜底路径。
2. 工具调用失败必须返回可解释的降级结果。
3. 会话上下文不得无限增长，应有窗口与清理策略。

## 元数据

- 层级：`L2`
- 文件：`dialog-minimum-safety.mdc`
- alwaysApply：`false`
- 源路径：`standards/common/rules/L2/dialog-minimum-safety.mdc`

## 在 Cursor 中使用

`@standards/common/rules/L2/dialog-minimum-safety.mdc`

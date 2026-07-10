---
title: "L1 · 批量与 CR"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
同步自 `.mdc`：`standards/common/rules/L1/03-batch-and-cr.mdc`。本站只读呈现，不注入 Cursor Rules。
:::

# L1 · 批量与 CR

1. AI 生成代码需小批量分段提交。
2. 每批变更必须经过人工初审与代码审查。
3. 审查未通过不得合并。
4. 若批次包含核心模块或架构层改动，必须附《核心模块AI生成红色记录》并由高级评审人签字确认后方可合并。

## 元数据

- 层级：`L1`
- 文件：`03-batch-and-cr.mdc`
- alwaysApply：`false`
- 源路径：`standards/common/rules/L1/03-batch-and-cr.mdc`

## 在 Cursor 中使用

`@standards/common/rules/L1/03-batch-and-cr.mdc`

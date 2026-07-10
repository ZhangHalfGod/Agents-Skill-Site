---
title: "L2 · 并发与容量基线"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
同步自 `.mdc`：`standards/common/rules/L2/concurrency-minimum-capacity.mdc`。本站只读呈现，不注入 Cursor Rules。
:::

# L2 · 并发与容量基线

1. 上线前必须有压测基线与容量结论。
2. 必须定义限流、背压与降级策略。
3. 必须配置核心指标与告警阈值。

## 元数据

- 层级：`L2`
- 文件：`concurrency-minimum-capacity.mdc`
- alwaysApply：`false`
- 源路径：`standards/common/rules/L2/concurrency-minimum-capacity.mdc`

## 在 Cursor 中使用

`@standards/common/rules/L2/concurrency-minimum-capacity.mdc`

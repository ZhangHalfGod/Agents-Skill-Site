---
title: "L1 · 六阶段门禁"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
同步自 `.mdc`：`standards/common/rules/L1/01-stage-gate.mdc`。本站只读呈现，不注入 Cursor Rules。
:::

# L1 · 六阶段门禁

1. 必须按需求、设计、开发、测试、安全、上线顺序推进。
2. 每阶段必须有明确输入、输出与完成状态。
3. 上一阶段未完成，不得进入下一阶段。
4. 涉及核心模块或架构层改动时，阶段输出必须包含《核心模块AI生成红色记录》并在门禁中校验。

## 元数据

- 层级：`L1`
- 文件：`01-stage-gate.mdc`
- alwaysApply：`false`
- 源路径：`standards/common/rules/L1/01-stage-gate.mdc`

## 在 Cursor 中使用

`@standards/common/rules/L1/01-stage-gate.mdc`

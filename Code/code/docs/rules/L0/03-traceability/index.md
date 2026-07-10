---
title: "L0 · 可追溯性"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
同步自 `.mdc`：`standards/common/rules/L0/03-traceability.mdc`。本站只读呈现，不注入 Cursor Rules。
:::

# L0 · 可追溯性

1. AI 生成代码提交信息必须包含 `[AI生成] 模块名-Prompt版本-VX.X`。
2. 代码变更必须能追溯到 Prompt 版本与审核记录。
3. 涉及核心模块或架构层改动时，必须关联《核心模块AI生成红色记录》。
4. 缺失追溯信息或红色记录的提交禁止进入上线阶段。

## 元数据

- 层级：`L0`
- 文件：`03-traceability.mdc`
- alwaysApply：`true`
- 源路径：`standards/common/rules/L0/03-traceability.mdc`

## 在 Cursor 中使用

`@standards/common/rules/L0/03-traceability.mdc`

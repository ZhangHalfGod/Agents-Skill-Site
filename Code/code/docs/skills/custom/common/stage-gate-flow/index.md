---
title: "瀑布/敏捷阶段门禁"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
本页由 `npm run sync` 从 `standards/common/skills/custom/common/stage-gate-flow/SKILL.md` 同步生成，**请勿手改**。本站不执行模型推理。
:::

# 瀑布/敏捷阶段门禁

所有 AI 代码生成活动必须适配瀑布/敏捷开发模型，按阶段执行管控节点。

## 触发条件

- 智能体启动 AI 代码生成相关活动时
- 智能体输出需求/设计/测试文档时

## 执行逻辑

### 瀑布模式

- 严格按「需求分析 → 设计 → 生成 → 测试 → 上线」阶段执行
- 前一阶段未审核通过，禁止进入下一阶段
- 输出物必须包含：**阶段标识**、**审核状态**、**责任人**
- 涉及核心层/网关层/安全模块/架构代码的生成任务，阶段输出必须追加《核心模块AI生成红色记录》

### 敏捷模式

- 按 Sprint 周期执行
- 每日站会同步 AI 生成进度
- 迭代回顾时优化 Prompt
- 输出物必须包含：**阶段标识**、**审核状态**、**责任人**
- 涉及核心层/网关层/安全模块/架构代码的迭代项，必须在当期 Sprint 中补齐《核心模块AI生成红色记录》

## 校验规则

未按阶段执行的操作，智能体应自动拦截并提示：「请完成上一阶段审核」。
若核心模块或架构代码未附《核心模块AI生成红色记录》，智能体应自动拦截并提示：「请补齐核心模块AI生成红色记录」。

## 参考文档

- 《AI代码生成开发流程规范文档-瀑布篇》
- 《AI代码生成开发流程规范文档-敏捷篇》

## 关联角色（矩阵反向）

**主要绑定**

- [ProductManager](/agents/standard/ProductManager/)
- [Architect](/agents/standard/Architect/)
- [DevLead](/agents/standard/DevLead/)
- [TestEngineer](/agents/standard/TestEngineer/)

**推荐关联**

- [OpsEngineer](/agents/standard/OpsEngineer/)
- [NmosEngineer](/agents/standard/NmosEngineer/)

## 在 Cursor 中使用本技能

1. `@` 引用：`standards/common/skills/custom/common/stage-gate-flow/SKILL.md`
2. 或 `@` skills README 后说「使用技能 4」

本站不执行模型推理。

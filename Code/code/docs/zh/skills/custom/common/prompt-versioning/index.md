---
title: "Prompt 工程化规范"
description: 本仓 docs 真源；直接编辑本页后 npm run generate
---

# Prompt 工程化规范

所有用于生成代码的 Prompt 必须遵循版本管理、结构规范与评审流程。

## 触发条件

- 智能体编写/修改/使用 Prompt 时
- 智能体审核 Prompt 时

## 执行逻辑

### 命名规则

`[项目名]-[模块名]-[用途]-V版本号.md`

示例：`LifeCoach-UserService-登录接口-V1.0.md`

### 结构要求

Prompt 必须包含以下部分：

- **需求描述**
- **架构约束**
- **代码规范**
- **输出格式**
- **禁止项**
- **核心模块红色记录要求**（当涉及核心层/网关层/安全模块/架构代码时）

### 评审与使用

- Prompt 必须经**开发负责人 + 架构师**双审核
- 未审核的 Prompt 禁止用于生成代码
- Prompt 版本纳入 Git 管理，与生成代码版本关联
- 涉及核心模块或架构代码的 Prompt，必须关联《核心模块AI生成红色记录》

## 校验规则

不符合结构的 Prompt，智能体应自动标注缺失字段并拒绝生成代码。
涉及核心模块或架构代码但未关联《核心模块AI生成红色记录》时，智能体应拒绝生成并提示补齐红色记录。

## 参考文档

- 《AI代码生成开发流程规范文档-Prompt工程篇》

## 关联角色（矩阵反向）

**主要绑定**

- [DevLead](/zh/agents/standard/DevLead/)

**推荐关联**

- [Architect](/zh/agents/standard/Architect/)

## 在 Cursor 中使用本技能

1. `@` 引用：`docs/zh/skills/custom/common/prompt-versioning/index.md`
2. 或打开本页后按 checklist 执行（技能 3）

本站不执行模型推理。正文真源即本页 Markdown。

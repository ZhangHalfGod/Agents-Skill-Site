---
title: "AI 生成代码边界"
description: 本仓 docs 真源；直接编辑本页后 npm run generate
---

# AI 生成代码边界

AI 代码生成执行分级管控：普通模块可直接按流程生成，核心层/网关层/安全模块与架构代码允许由 AI 生成，但必须额外登记《核心模块AI生成红色记录》，并满足强化审查要求。

## 触发条件

- 智能体生成代码时
- 智能体审核 AI 生成代码时

## 执行逻辑

### 允许 AI 生成

- DTO 转换
- 工具类
- 日志封装
- 简单接口实现（非核心）
- 核心业务层代码（需红色记录）
- 网关层代码（需红色记录）
- 数据持久层核心逻辑（需红色记录）
- 安全认证模块代码（需红色记录）
- 架构层代码（需红色记录）

### 红色记录要求（核心模块）

- 生成核心层、网关层、安全模块、架构代码时，必须同步产出并维护《核心模块AI生成红色记录》
- 红色记录至少包含：模块名、变更范围、风险点、审查人、审查结论、关联 Prompt 版本

### 规范要求

- AI 生成代码必须遵循项目目录结构（如 controller / service / mapper / util）和命名规范
- 引入的第三方依赖必须在项目允许清单内

## 校验规则

生成核心层代码时，智能体不得拦截；但若未登记《核心模块AI生成红色记录》，应自动拦截并提示：「缺少核心模块AI生成红色记录，禁止继续提交/上线」。

## 参考文档

- 《AI代码生成开发流程规范文档-架构约束篇》

## 关联角色（矩阵反向）

**主要绑定**

- [ProductManager](/zh/agents/standard/ProductManager/)
- [Architect](/zh/agents/standard/Architect/)

**推荐关联**

- [SecurityEngineer](/zh/agents/standard/SecurityEngineer/)
- [UIDesigner](/zh/agents/standard/UIDesigner/)

## 在 Cursor 中使用本技能

1. `@` 引用：`docs/zh/skills/custom/common/ai-code-boundary/index.md`
2. 或打开本页后按 checklist 执行（技能 1）

本站不执行模型推理。正文真源即本页 Markdown。

- **浏览本页**：`@` 上方列出的路径。
- **走 MCP**：`get_skill` → `@` 返回的 **`source`**（本仓 `docs/zh/...`）。

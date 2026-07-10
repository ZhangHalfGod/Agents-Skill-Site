---
title: "全流程可追溯与合规"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
本页由 `npm run sync` 从 `standards/common/skills/custom/common/traceability-compliance/SKILL.md` 同步生成，**请勿手改**。本站不执行模型推理。
:::

# 全流程可追溯与合规

AI 生成代码必须满足可追溯、安全合规、版权合规要求。

## 触发条件

- 智能体提交 AI 生成代码入库时
- 智能体上线 AI 生成代码时

## 执行逻辑

### 提交规范

- 代码提交备注必须包含：`[AI生成] 模块名-Prompt版本-VX.X`

### 上线前必须完成

- 安全扫描（无高危漏洞）
- 版权检测（无协议冲突）
- 测试覆盖率 ≥ 80%

### 追溯与合规

- 留存 Prompt 版本 + 代码版本 + 审核人映射关系，满足审计要求
- 禁止 AI 生成恶意代码、硬编码敏感信息
- 涉及核心层/网关层/安全模块/架构代码时，必须关联《核心模块AI生成红色记录》

## 校验规则

未满足追溯/合规要求的代码，智能体应拒绝入库/上线，并输出整改清单。
核心模块或架构代码若缺失《核心模块AI生成红色记录》，视为不满足追溯要求，必须拒绝入库/上线。

## 参考文档

- 《AI代码生成开发流程规范文档-合规篇》
- 《行业安全规范清单（金融/医疗）》

## 关联角色（矩阵反向）

**主要绑定**

- [Architect](/agents/standard/Architect/)
- [DevLead](/agents/standard/DevLead/)
- [TestEngineer](/agents/standard/TestEngineer/)
- [SecurityEngineer](/agents/standard/SecurityEngineer/)
- [OpsEngineer](/agents/standard/OpsEngineer/)

**推荐关联**

- [NmosEngineer](/agents/standard/NmosEngineer/)

## 在 Cursor 中使用本技能

1. `@` 引用：`standards/common/skills/custom/common/traceability-compliance/SKILL.md`
2. 或 `@` skills README 后说「使用技能 2」

本站不执行模型推理。

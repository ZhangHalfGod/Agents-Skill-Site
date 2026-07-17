---
title: "全流程可追溯与合规"
description: 本仓 docs 真源；直接编辑本页后 npm run generate
---

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

- [Architect](/zh/agents/standard/Architect/)
- [DevLead](/zh/agents/standard/DevLead/)
- [TestEngineer](/zh/agents/standard/TestEngineer/)
- [SecurityEngineer](/zh/agents/standard/SecurityEngineer/)
- [OpsEngineer](/zh/agents/standard/OpsEngineer/)

**推荐关联**

- [NmosEngineer](/zh/agents/standard/NmosEngineer/)

## 在 Cursor 中使用本技能

1. `@` 引用：`docs/zh/skills/custom/common/traceability-compliance/index.md`
2. 或打开本页后按 checklist 执行（技能 2）

本站不执行模型推理。正文真源即本页 Markdown。

---
title: "瀑布/敏捷阶段门禁"
description: 本仓 docs 真源；直接编辑本页后 npm run generate
---

# 瀑布/敏捷阶段门禁

所有 AI 代码生成活动必须适配瀑布/敏捷模型，按阶段执行管控节点。  
**主文件保持短**：模式细则与部署验收见下方 `docs/`。

## 何时用

- 启动 AI 代码生成相关活动
- 输出需求 / 设计 / 测试文档
- 阶段出门或 PR 合并前

## 可执行清单（出门必勾）

- [ ] 当前阶段输入 / 输出 / 审核状态已标明
- [ ] 上一阶段未通过则**不**进入下一阶段
- [ ] 核心层 / 网关 / 安全 / 架构改动已附《核心模块AI生成红色记录》（或明确不适用）
- [ ] **本阶段 Lesson**：已写入 `docs/operations/<project>/lessons/`，或勾选「本阶段无新教训」
- [ ] （若涉及上线/部署）已按 [部署验收清单](./docs/deploy-verify.md) 验证：MCP health 与带 Host 的静态站探测**分开记证据**；勿用无 Host 的 `curl 127.0.0.1` 误判 404

## 拦截提示

- 未按阶段：`请完成上一阶段审核`
- 缺红色记录：`请补齐核心模块AI生成红色记录`
- 未处理 Lesson：`请写入 Lesson Card，或显式勾选本阶段无新教训`

## 对话触发句（记 Lesson）

```text
记一条 lesson：<一句话现象>。项目 <project-id>。按 operations Lesson Card 模板写入文件。
```

复制模板：`docs/operations/_template/lessons/_lesson-card.template.md`  
→ 落到：`docs/operations/<project-id>/lessons/YYYY-MM-DD-short-slug.md`

## 分层正文（按需 @）

| 层级 | 路径 | 何时打开 |
|------|------|----------|
| L2 本页 | `docs/skills/custom/common/stage-gate-flow/index.md` | 默认执行清单 |
| L3 模式细则 | [瀑布/敏捷说明](./docs/waterfall-agile-modes.md) | 需要模式细节时 |
| L3 部署验收 | [部署验收清单](./docs/deploy-verify.md) | 上线 / Nginx / MCP 验收时 |

运行时纪律：先 MCP `list_*` / `get_*`，再 `@` 本页；单任务 1 主 skill + 最多 2 辅 skill（见 `Doc/phase3/04-context-budget.md`）。

## 关联角色（矩阵反向）

**主要绑定**

- [ProductManager](/zh/agents/standard/ProductManager/)
- [Architect](/zh/agents/standard/Architect/)
- [DevLead](/zh/agents/standard/DevLead/)
- [TestEngineer](/zh/agents/standard/TestEngineer/)

**推荐关联**

- [OpsEngineer](/zh/agents/standard/OpsEngineer/)
- [NmosEngineer](/zh/agents/standard/NmosEngineer/)

## 在 Cursor 中使用本技能

1. `@` 引用：`docs/zh/skills/custom/common/stage-gate-flow/index.md`
2. 或打开本页后按 checklist 执行（技能 4）

本站不执行模型推理。正文真源即本页 Markdown。

# Playbook Pack — H1 (ProductManager)

> 摘录自 MCP get_source_text；用于 H1 执行时自我约束。

## 角色义务

- 拆解业务需求、界定 AI 代码生成的范围边界
- 输出《AI代码生成范围清单》，确保 AI 生成代码不偏离业务需求并具备完整追溯
- 将抽象需求转化为可执行任务，识别风险，建立团队共识
- 需求分析：穿透需求表象，锁定业务目标与预期成果；写清用户故事/验收标准（Given-When-Then 或等效）
- 场景洞察：理解完整业务链路；区分假设/已验证事实/待验证假设
- 范围界定：明确「AI 可生成」范围与分级管控；对范围蔓延有预案
- 非目标（Out of scope）明确，减少后续争议
- 识别关键干系人、成功标准与验收条件

## 出门清单（stage-gate-flow 绑定）

- [ ] 当前阶段输入/输出/审核状态已标明
- [ ] 上一阶段未通过则不进入下一阶段
- [ ] 核心层/网关/安全/架构改动已附《核心模块AI生成红色记录》（或明确不适用）
- [ ] 本阶段 Lesson：已写入 `docs/operations/<project>/lessons/`，或勾选「本阶段无新教训」

## 硬禁区（ai-code-boundary 绑定）

- 核心层/网关层/安全模块/架构代码需红色记录
- 未登记《核心模块AI生成红色记录》应自动拦截
- AI 生成代码必须遵循项目目录结构和命名规范
- 引入的第三方依赖必须在项目允许清单内

## 交付物模板

《AI代码生成范围清单》必须包含：

| 条目 | 说明 |
|------|------|
| 需求/功能点 | 可落地的功能点描述 |
| 业务目标/验收标准 | 可衡量的成功指标 |
| AI 可生成范围 | 包含普通模块与系统级核心模块 |
| 核心模块红色记录 | 核心层/网关层/安全模块时必填 |
| 优先级 | P0/P1/P2 |
| 责任人/交付节点 | 与阶段标识一致 |
| 非目标/假设 | 明确不做与待验证项 |

## Sources

- MCP health → `/var/www/agents-skill-site/Code/code/docs/public/manifest.json` (contentHash: 6029dcd3053d9df9)
- Agent ProductManager → `docs/zh/agents/standard/ProductManager/index.md` (contentHash: 393c53994d1bac10)
- Skill stage-gate-flow → `docs/zh/skills/custom/common/stage-gate-flow/index.md` (contentHash: 03778f2e80391568)
- Skill ai-code-boundary → `docs/zh/skills/custom/common/ai-code-boundary/index.md` (contentHash: f8e641bd8ab22698)

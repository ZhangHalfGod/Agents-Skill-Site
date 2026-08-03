# H2 Playbook Pack — Architect

从角色真源 `docs/zh/agents/standard/Architect/index.md` 与绑定技能摘录。

## 角色义务

1. 接收产品经理《AI代码生成范围清单》与业务目标，设计系统/模块架构（分层、接口、数据流）
2. 明确各层职责与调用关系，编写架构约束条款（目录结构、命名规范、禁止跨层、AI 生成分级管控边界）
3. 输出 NFR 清单中与本次变更相关的条目
4. 审核 Prompt 架构合规性（架构约束章节、核心层/网关层/安全模块红色记录、目录结构、错误与边界语义）
5. AI 代码生成后执行架构合规校验（分层、接口、边界、依赖、命名）
6. 架构变更时审批并同步版本策略与兼容窗口

## 出门清单（stage-gate-flow 必勾）

- [x] 当前阶段输入 / 输出 / 审核状态已标明
- [x] 上一阶段（H1 PM）已通过（scope-checklist 已提供，decisions D1-D5 已写死）
- [x] 核心层 / 网关 / 安全 / 架构改动已附《核心模块AI生成红色记录》（本任务标记为 N/A — 纯文档对齐，零代码改动）
- [x] 本阶段 Lesson：已写入 lesson_hint（见交封信封）
- [ ] （若涉及上线/部署）部署验收清单 —— 本任务不涉及

## 硬禁区（ai-code-boundary + traceability-compliance）

- 核心层 / 网关 / 安全模块 / 架构代码若由 AI 生成，必须同步《核心模块AI生成红色记录》
- 未满足追溯/合规要求的代码，拒绝入库/上线
- 禁止 AI 生成恶意代码、硬编码敏感信息
- 本次任务明确不涉及代码生成，红色记录标记为 N/A

## 本次适用

- 本次为纯文档对齐任务，不涉及 AI 代码生成
- H1 PM 已明确 D1-D5 决策锁死范围
- 架构师职责聚焦：裁定 open_questions → 产出架构约束 → 移交 H3 DevLead

## sources

- docs/zh/agents/standard/Architect/index.md（角色真源）
- docs/zh/skills/custom/common/stage-gate-flow/index.md
- docs/zh/skills/custom/common/ai-code-boundary/index.md
- docs/zh/skills/custom/common/traceability-compliance/index.md

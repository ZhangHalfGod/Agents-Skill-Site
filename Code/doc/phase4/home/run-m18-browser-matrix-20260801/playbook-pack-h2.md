# playbook-pack-h2.md — Architect 角色义务 / 出门清单 / 硬禁区

> 从角色说明书 `docs/zh/agents/standard/Architect/index.md` + 绑定技能提取。
> 阶段：H2（m18-browser-matrix）

## sources

| 资源 | 值 |
|------|-----|
| endpoint | agents-skill-remote |
| agent.id | Architect |
| agent.source | docs/zh/agents/standard/Architect/index.md |
| agent.contentHash | `0c7488c611693662` |
| skill.stage-gate-flow.source | docs/zh/skills/custom/common/stage-gate-flow/index.md |
| skill.stage-gate-flow.contentHash | `03778f2e80391568` |
| skill.ai-code-boundary.source | docs/zh/skills/custom/common/ai-code-boundary/index.md |
| skill.ai-code-boundary.contentHash | `f8e641bd8ab22698` |
| skill.traceability-compliance.source | docs/zh/skills/custom/common/traceability-compliance/index.md |
| skill.traceability-compliance.contentHash | `089ef19727c7f233` |
| mcp.health.contentHash | `6029dcd3053d9df9` |

## 角色义务（Architect）

1. **接收需求与架构设计**：基于 PM 的《AI代码生成范围清单》与业务目标，设计系统/模块架构（分层、接口、数据流）。明确各层职责与调用关系，编写架构约束条款。
2. **NFR 清单**：输出性能、可用性、安全、可观测性、合规 中与本次变更相关的条目，映射到实现与测试关注点。
3. **Prompt 架构合规审核**（本任务 N/A — 无 Prompt 生成）。若适用：审核 Prompt 是否包含架构约束章节、核心模块红色记录触发点、项目目录结构与依赖清单。
4. **架构合规校验**：检查分层/接口/边界/核心模块红色记录/依赖/错误语义。
5. **架构变更审批**：若有架构变更，更新架构约束与 Prompt 模板，知会测试与运维。

## 出门清单（stage-gate-flow）

- [x] 当前阶段输入 / 输出 / 审核状态已标明（H1 pm → H2 arch）
- [x] 上一阶段 H1 已通过（pm 交付 scope-list + 交接信封）
- [x] 核心模块红色记录：本任务纯文档回填，无代码变更 → **不适用**（显式勾选）
- [ ] 本阶段 Lesson 已写入（见交付物末尾）
- [x] 部署验收：不涉及上线/部署（纯文档）

## 硬禁区（ai-code-boundary + traceability-compliance）

| 禁区 | 本任务评估 |
|------|-----------|
| 核心层/网关层/安全模块/架构代码若未登记《核心模块AI生成红色记录》→ 禁止提交 | 不适用（无代码生成） |
| 第三方依赖必须在允许清单内 | 不适用（无新依赖） |
| 提交备注须含 `[AI生成] 模块名-Prompt版本-VX.X` | 不适用（H3 由 DevLead/TestEngineer 负责） |
| 禁止 AI 生成恶意代码、硬编码敏感信息 | ✅ 检查：交付物不含密钥/Token/.env |
| 涉及核心模块或架构代码缺失红色记录 → 拒绝入库 | 不适用（无代码变更） |
| MCP 失败 → 停跳上报，禁止臆造路径硬扛 | ✅ MCP health OK + agent/skill 均可解析 |
| 不越权产出其他角色的交付物 | ✅ 仅输出 arch-constraints kind |

## 本阶段角色边界

- ✅ 本角色产出：arch-constraints（架构约束与执行计划） + 交接信封
- ❌ 不产出：Prompt 终版（DevLead）、测试报告（TestEngineer）、安全扫描（SecurityEngineer）
- ❌ 不执行：浏览器实测（H3 DevLead/TestEngineer）

## ai-code-boundary 本任务适用性

本任务属于「纯文档回填，无代码变更」，按 `ai-code-boundary` 逻辑：
- AI 允许直接生成（文档类产出，非核心层/网关/安全模块代码）
- 不触发《核心模块AI生成红色记录》
- 但仍需满足可追溯要求：本次产出含 MCP 溯源 + 版本映射

## traceability-compliance 本任务适用性

本任务无代码提交/上线，但文档产出需满足：
- 可追溯：MCP 溯源文件 `mcp-resolve-h2.yaml` 已留存
- 安全：交付物全文不包含 DOUBAO_TTS_* / APP_ID / ACCESS_KEY / Token / .env
- 合规：UTF-8 编码，无版权冲突

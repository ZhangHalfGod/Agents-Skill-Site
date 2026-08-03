# playbook-pack-h1.md — ProductManager 角色契约摘录

> 摘录自 `docs/zh/agents/standard/ProductManager/index.md`（MCP get_source_text，contentHash: `393c53994d1bac10`）
> 绑定技能：`stage-gate-flow`（contentHash: `03778f2e80391568`）、`ai-code-boundary`（contentHash: `f8e641bd8ab22698`）

## 角色义务（本任务必须履行）

1. **需求分析**：穿透需求表象，锁定业务目标与预期成果；写清用户故事/验收标准（Given-When-Then 或等效）。
2. **范围界定**：明确「AI 可生成」范围与分级管控要求；对范围蔓延有预案。
3. **输出《AI代码生成范围清单》**：含业务目标、AI 可生成范围、分级管控、优先级、责任人、非目标/假设。
4. **阶段门禁**（stage-gate-flow）：当前阶段输入/输出/审核状态已标明；上一阶段未通过则不进入下一阶段。
5. **AI 生成边界**（ai-code-boundary）：核心/网关/安全/架构模块需登记《核心模块AI生成红色记录》；本任务不涉及此类代码生成，不适用。

## 出门清单（Go/No-Go）

- [ ] 每条 P0 均有可执行验收标准
- [ ] 核心/网关/安全相关条目已触发红色记录流程说明（本任务：不适用，仅文档产出）
- [ ] 非目标与范围边界已写明，避免隐性蔓延
- [ ] 当前阶段输入/输出/审核状态已标明
- [ ] 交付物 kind 正确（scope-list / 交接信封）
- [ ] 不越权产出其他角色交付物

## 硬禁区

- 不改业务代码、不改默认配置、不 git push、不 npm install/rebuild
- 禁止写任何 .env / Token / 原始音频路径进文档或消息
- 不调用 feishu_doc / feishu_drive（飞书双写由编排者 main 负责）
- MCP 失败 → 停跳上报，禁止臆造路径硬扛
- 不把本需求扩展成「重做 M18 功能」或「接入新 TTS 厂商」
- 不越权产出其他角色的交付物；跨角色需求转回编排者 main

## Sources（本任务引用的真源）

| # | 来源 | 用途 |
|---|------|------|
| 1 | `docs/zh/agents/standard/ProductManager/index.md` | 角色说明书 |
| 2 | `docs/zh/skills/custom/common/stage-gate-flow/index.md` | 阶段门禁清单 |
| 3 | `docs/zh/skills/custom/common/ai-code-boundary/index.md` | AI 代码边界规则 |
| 4 | `doc/方案C/方案C_M18_语音_mcp-gaode/测试与发布/README.md` | 矩阵结构、冒烟条目、进度约定 |
| 5 | `doc/方案C/方案C_M18_语音_mcp-gaode/执行进度.md` | 进度现状与验证记录 |
| 6 | `doc/方案C/方案C_M18_语音_mcp-gaode/README.md` | M18 总入口与代码锚点 |

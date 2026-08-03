# Playbook Pack · H2（Architect）

scheme: single-facade-mcp+hop-snapshot  
queried_via: agents-skill-remote  

## sources

- Agent `Architect` @ `docs/zh/agents/standard/Architect/index.md` (contentHash=0c7488c611693662)
- Skill `stage-gate-flow` @ `docs/zh/skills/custom/common/stage-gate-flow/index.md` (contentHash=03778f2e80391568)

## 角色义务（摘自 get_source_text · Architect）

1. 基于《AI代码生成范围清单》与业务目标，设计系统/模块架构（分层、接口、数据流）
2. 明确各层职责与调用关系，编写架构约束条款（目录结构、命名规范、禁止跨层、AI 生成分级管控边界）
3. 输出 NFR 清单（性能、可用性、安全、可观测性、合规）中与本次变更相关的条目
4. 审核 Prompt 架构合规性：是否含「架构约束」章节、核心模块红色记录、错误与边界语义
5. 执行《AI代码架构合规性检查表》：分层与职责、接口与契约、边界遵守、依赖与规范
6. 发现问题即输出整改项，拒绝不合规代码入库直至修复
7. 若涉及对外契约变更，同步版本策略与兼容窗口，知会测试与运维
8. 架构变更时审批 AI 生成代码的架构适配性，必要时更新架构约束与 Prompt 模板
9. 重大决策建议沉淀 ADR（架构决策记录）要点

## 出门清单（摘自 stage-gate-flow · H2 适用）

- [x] 当前阶段输入/输出/审核状态已标明（H1 范围清单已接收、复核完成）
- [x] 上一阶段（H1 PM）已通过——范围清单已产出、evidence 完备
- [x] 核心层/网关/安全/架构改动已附《核心模块AI生成红色记录》——本期仅文档修改，明确不适用（见约束 4.1）
- [x] 本阶段 Lesson：registry.js 中 system/docs implemented:true 但路由未实现 → 已写入 lesson_hint
- [ ] （若涉及上线/部署）——本期不涉及，勾选不适用
- [x] 交付物（h2-arch-constraints.md）已落盘 run-dir
- [x] mcp-resolve-h2.yaml 已落盘
- [x] playbook-pack-h2.md（本文件）已落盘
- [x] 文件落盘后自查存在（见 evidence）

## 硬禁区（Architect 角色 + 本期契约）

1. 禁止修改业务仓任何文件（H3 才允许改交付文档）
2. 禁止调用 feishu_doc / feishu_drive / 任何飞书工具（飞书双写由 main 做）
3. 禁止 npm install / rebuild / git push / 删除 run-dir 以外文件
4. 禁止写 key-token 进文件
5. 禁止改生成器/路由/测试/配置
6. 禁止接 Swagger UI
7. 禁止起服务（实测留给 H3/H4）
8. 禁止越权产出其他角色交付物
9. 禁止在消息稿中夹带 token/password/secret
10. 消息稿与交付物一律 UTF-8

## 给下一跳（DevLead / H3）的执行纪律

1. 修改面白名单即来自 `h2-arch-constraints.md` 第 2 节，精确到行号与目标措辞，直接执行无需再探
2. 修改前务必先 git status 确认工作区干净，再执行修改
3. 修改后验收时 grep extern-api 下所有 .md 确认「OpenAPI 未实现/规划中」已消除
4. registry.js 的 implemented:true 与路由缺失不一致不在本期修复——仅记录 lesson_hint
5. 不改 registry.js 的 system/docs 实现状态（即使 implemented 与事实矛盾）
6. 文档中保留「Swagger UI 另行规划」以区分「生成已实现」与「UI 未实现」

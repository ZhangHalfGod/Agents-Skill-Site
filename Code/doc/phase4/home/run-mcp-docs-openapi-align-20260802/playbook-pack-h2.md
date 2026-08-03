# Playbook Pack · H2（Architect）

scheme: single-facade-mcp+hop-snapshot  
queried_via: agents-skill-remote  

## sources

- Agent `Architect` @ `docs/zh/agents/standard/Architect/index.md` (contentHash=0c7488c611693662)
- Skill `stage-gate-flow` @ `docs/zh/skills/custom/common/stage-gate-flow/index.md` (contentHash=03778f2e80391568)

## 角色义务（摘自 get_source_text · Architect）

1. 基于《AI代码生成范围清单》与业务目标，设计系统/模块架构（分层、接口、数据流）
2. 明确各层职责与调用关系，编写架构约束条款
3. 在纯文档项目中，重点复核链接一致性（文档路径 ↔ 源码路由）、同源说明口径
4. 确保文档结构（章节编排）不破坏现有阅读流
5. 评估跨项目边界（mcp-gaode 3001 vs extern-api 3002 分属不同项目）
6. 发现问题即输出整改项，拒绝不合规内容入库

## 出门清单（摘自 stage-gate-flow · H2 适用）

- [x] 当前阶段输入/输出/审核状态已标明（H1 范围清单已接收、复核完成）
- [x] 上一阶段（H1 PM）已通过——范围清单已产出、evidence 完备
- [x] 核心层/网关/安全/架构改动——本期纯文档，勾选不适用
- [ ] 本阶段 Lesson：/api/docs 路由未实现但在文档中保留描述→记入 lesson_hint
- [ ] （若涉及上线/部署）——不涉及
- [x] 交付物（h2-arch-constraints.md）已落盘
- [x] mcp-resolve-h2.yaml 已落盘
- [x] playbook-pack-h2.md（本文件）已落盘
- [x] 文件落盘后自查存在

## 硬禁区（Architect 角色 + 本期契约）

1. 禁止修改业务仓任何文件（H3 才允许改 MCP接入文档.md）
2. 禁止调用 feishu_doc / feishu_drive / 任何飞书工具
3. 禁止 npm install / rebuild / git push / 删除 run-dir 以外文件
4. 禁止写 key-token 进文件
5. 禁止改源码（registry.js/openapiGenerator.js/v2Catalog.js/server/index.js）
6. 禁止新建文件（仅修改 MCP接入文档.md 一个文件）
7. 禁止改 mcp-gaode 侧文档
8. 禁止越权产出其他角色交付物
9. 消息稿与交付物一律 UTF-8

## 给下一跳（DevLead / H3）的执行纪律

1. MCP接入文档.md 三个修改点（§2.1 + §8 + §9）按本文精确措辞写入，不自由发挥
2. §9 端点索引表与同源说明措辞以 extern-api/README.md L95-96 为权威参考源
3. §2.1 补行采用"项 | 说明"格式，对齐现有表格风格
4. §8 新增 2 条索引，相对路径正确（../../../extern-api/...）
5. /api/docs 描述不加"已实现/未实现"判定，仅写"结构化文档（与 /v2/ 同源）"
6. H4 验收时须逐条 curl 核对 :3002 路径（/v2/、/api/openapi.json、/api/openapi.yaml），/api/docs 预期 404（已记 lesson）

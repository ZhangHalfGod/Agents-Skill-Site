# Playbook Pack · H1

scheme: single-facade-mcp+hop-snapshot
queried_via: agents-skill-remote

## sources

- Agent `ProductManager` @ `docs/zh/agents/standard/ProductManager/index.md` (contentHash=393c53994d1bac10)
- Skill `stage-gate-flow` @ `docs/zh/skills/custom/common/stage-gate-flow/index.md` (contentHash=—)
- Skill `ai-code-boundary` @ `docs/zh/skills/custom/common/ai-code-boundary/index.md` (contentHash=—)

## 角色义务（摘自 get_source_text · agent ProductManager）

1. 明确业务目标（SMART 原则），列出干系人与成功画像，写清非目标
2. 需求拆解：必需功能（P0/P1/P2 分层）、使用场景、技术边界、依赖与风险
3. 输出《AI代码生成范围清单》：需求/功能点、业务目标/验收标准、AI 可生成范围、核心模块红色记录、优先级、责任人/交付节点、非目标/假设
4. 涉及核心层/网关层/安全模块时必须单独登记红色记录——本期纯文档，不触发
5. 提交架构师审核，根据反馈修订
6. 验收阶段对照清单验证 AI 生成代码与业务需求一致性

## 出门清单（H1 交付前自查）

- [x] MCP health ok（contentHash=6029dcd3053d9df9）
- [x] 角色 source 已拉取（ProductManager, contentHash=393c53994d1bac10）
- [x] mcp-resolve-h1.yaml 已落盘
- [x] playbook-pack-h1.md 已落盘（角色义务 / 出门清单 / 硬禁区 / sources 列表）
- [x] 原位探查已完成（只读）：MCP接入文档.md 全文、extern-api/README.md 已对齐表述、extern-api/doc/重构api架构/README.md 同源说明、registry.js 同源验证、mcp-gaode/README.md 交叉检查
- [x] 确认 MCP接入文档.md 缺「API 发现与文档」章节（无 v2/OpenAPI/docs 索引）
- [x] 确认 extern-api 四个发现/文档端点：/v2/、/api/openapi.json、/api/openapi.yaml、/api/docs，同源于 registry.js
- [x] grep 方案C 下所有 .md：仅 M-3 发布说明有 /v2/ 引用（入口表一行），无其他矛盾
- [x] 范围清单已产出
- [x] 交接信封已产出
- [x] 每条 P0 均有可执行验收标准
- [x] 非目标与范围边界已写明

## 硬禁区（本期适用的红线）

1. 只改 MCP接入文档.md（纯文档），不改业务代码/路由/测试
2. 不新增文件
3. 不提交密钥（.env / Token）
4. 不 git push
5. 不 npm install / rebuild
6. 不起服务
7. 禁止 feishu_doc / feishu_drive

## 给下一跳的执行纪律

- H2 架构师复核：确认插入位置（新 §9 还是扩展现有段落）、同源说明措辞精度
- H3 仅在一处文件（MCP接入文档.md）追加新章节，不改动现有 8 节结构
- H4 核对：文档中 /v2/、/api/openapi.json 等链接与 :3002 实际路由一致
- mcp-gaode 侧由其自身项目独立处理，不纳入本期

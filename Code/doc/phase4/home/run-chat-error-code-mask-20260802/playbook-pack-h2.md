# Playbook Pack · H2（Architect）

scheme: single-facade-mcp+hop-snapshot  
queried_via: agents-skill-remote  

## sources

- Agent `Architect` @ `docs/zh/agents/standard/Architect/index.md` (contentHash=0c7488c611693662)
- Skill `stage-gate-flow` @ `docs/zh/skills/custom/common/stage-gate-flow/index.md` (contentHash=03778f2e80391568)
- Skill `ai-code-boundary` @ `docs/zh/skills/custom/common/ai-code-boundary/index.md` (contentHash=f8e641bd8ab22698)

## 角色义务（摘自 get_source_text · Architect）

1. 基于《AI代码生成范围清单》与业务目标，设计系统/模块架构（分层、接口、数据流）
2. 明确各层职责与调用关系，编写架构约束条款
3. 输出 NFR 清单中与本次变更相关的条目（数据泄露防护）
4. 审核 Prompt 架构合规性：含架构约束章节、红色记录、错误与边界语义
5. 执行架构合规性检查表
6. 对涉及数据泄露防护的改动评估安全影响
7. 发现问题即输出整改项，拒绝不合规代码入库

## 出门清单（摘自 stage-gate-flow · H2 适用）

- [x] 当前阶段输入/输出/审核状态已标明（H1 范围清单已接收、复核完成）
- [x] 上一阶段（H1 PM）已通过——范围清单已产出、evidence 完备
- [x] 核心层/网关/安全/架构改动已评估——本期为 service 层数据脱敏修复，经复核判定不触发红色记录（见交付物第 3 节）
- [ ] 本阶段 Lesson：本跳无新教训
- [ ] （若涉及上线/部署）——不涉及
- [x] 交付物（h2-arch-constraints.md）已落盘
- [x] mcp-resolve-h2.yaml 已落盘
- [x] playbook-pack-h2.md（本文件）已落盘
- [x] 文件落盘后自查存在

## 硬禁区（Architect 角色 + 本期契约）

1. 禁止修改业务仓任何文件（H3 才允许改）
2. 禁止调用 feishu_doc / feishu_drive / 任何飞书工具
3. 禁止 npm install / rebuild / git push / 删除 run-dir 以外文件
4. 禁止写 key-token 进文件
5. 禁止改 chatRoutes.js / travelQueryBridge.js / 前端代码
6. 禁止新增独立错误码系统
7. 禁止越权产出其他角色交付物
8. 消息稿与交付物一律 UTF-8

## 给下一跳（DevLead / H3）的执行纪律

1. `stripErr` 修改：在 `return { ...err, message: safeMsg }` 之前插入 `delete safe.code` 逻辑，而非在返回后操作
2. LEAK_PATTERNS 扩展：新增 QUOTA_/MCP_/ARK_ 前缀模式，与现有 AMAP_ 保持一致
3. Nested 路径：`clone.result.error` 的 `stripErr` 调用已覆盖 code 脱敏（共用同一函数），无需额外处理
4. 单测用例先写（TDD 顺序）：先写测试（期望 code 不存在），再改实现代码
5. 现有单测 L59 `expect(out.error.code).toBe('X')` 需要同步更新（'X' 不在 LEAK_PATTERNS 中所以保留，但确认语义一致）
6. chat-system-v1.md 加一行："不得在回复中复述 AMAP_、QUOTA_ 等内部错误码或原始 JSON 中的技术字段名"

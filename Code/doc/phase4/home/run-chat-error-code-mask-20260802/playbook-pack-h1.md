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
4. 涉及核心层/网关层/安全模块时必须单独登记红色记录
5. 提交架构师审核，根据反馈修订
6. 验收阶段对照清单验证 AI 生成代码与业务需求一致性

## 出门清单（H1 交付前自查）

- [x] MCP health ok（contentHash=6029dcd3053d9df9）
- [x] 角色 source 已拉取（ProductManager, contentHash=393c53994d1bac10）
- [x] mcp-resolve-h1.yaml 已落盘（endpoint / agent id / source / contentHash；无 token）
- [x] playbook-pack-h1.md 已落盘（角色义务 / 出门清单 / 硬禁区 / sources 列表）
- [x] 原位探查已完成（只读）：mcpToolUserMessages.js 全文、测试、chatRoutes.js 错误路径、travelQueryBridge.js 注入链路、mechQueryBridge.js、mcpAuditService.js、errorCodes.js、系统 prompt
- [x] 确认 sanitizeEnvelopeForLlm 当前只替换 error.message，不处理 error.code
- [x] 确认 user-visible 载体：LLM prompt 注入（主要路径）、直接响应、SSE 错误切换
- [x] 确认测试缺口：sanitizeEnvelopeForLlm 无 error.code 脱敏用例
- [x] 范围清单已产出（h1-pm.scope-checklist.md）
- [x] 交接信封已产出（YAML，四要素齐）
- [x] 每条 P0 均有可执行验收标准
- [x] 非目标与范围边界已写明

## 硬禁区（本期适用的红线）

1. 只改 sanitize 逻辑与对应单测，不改业务路由/LLM 调用/前端
2. 不新增对外 API/接口
3. 不提交密钥（.env / Token 不得泄露到任何产物）
4. 不 git push
5. 不 npm install / rebuild
6. 不起服务
7. 禁止 feishu_doc / feishu_drive（飞书双写由 main 负责）

## 给下一跳的执行纪律

- H2 架构师复核：确认 error.code 脱敏方案（完全删除 vs 替换为通用码）、LEAK_PATTERNS 是否需扩展匹配 error.code 格式
- H3 仅改 mcpToolUserMessages.js（sanitizeEnvelopeForLlm 函数）+ 对应单测（.test.js）
- 可选：system prompt 增加"不得回显内部错误码"指令
- H4 实测：构造 `{ success: false, error: { code: "AMAP_ERROR", message: "..." } }` 失败包络，验证用户可见回复不含 `AMAP_`
- 全链路禁止写 .env / Token；禁止 npm install

# Playbook Pack · H1

scheme: single-facade-mcp+hop-snapshot
queried_via: agents-skill-remote

## sources

- Agent `ProductManager` @ `docs/zh/agents/standard/ProductManager/index.md` (contentHash=393c53994d1bac10)
- Skill `stage-gate-flow` @ `docs/zh/skills/custom/common/stage-gate-flow/index.md` (contentHash=—)
- Skill `ai-code-boundary` @ `docs/zh/skills/custom/common/ai-code-boundary/index.md` (contentHash=—)

## 角色义务（摘自 get_source_text）

1. 明确业务目标（SMART）、成功画像、非目标
2. 需求拆解：P0/P1/P2 分层、使用场景、技术边界
3. 涉及核心层/网关层/安全模块必须登记红色记录——本期新增 Express 路由端点，属网关层
4. 输出《AI代码生成范围清单》并提交架构师审核

## 出门清单（H1 交付前自查）

- [x] MCP health ok（contentHash=6029dcd3053d9df9）
- [x] 角色 source 已拉取（ProductManager, contentHash=393c53994d1bac10）
- [x] mcp-resolve-h1.yaml 已落盘
- [x] playbook-pack-h1.md 已落盘
- [x] 原位探查：openapiRoutes.js、server/index.js CSP、openapiGenerator.js、node_modules（无 swagger-ui-dist）
- [x] 确认 openapiGenerator 不输出 tags（Swagger UI 将按路径分组）
- [x] 确认 CSP 限制：scriptSrc/styleSrc 仅 self + unsafe-inline，CDN 需放宽
- [x] 确认 /api/docs 与 /api/docs/ui 路径不冲突
- [x] 范围清单已产出、交接信封已产出

## 硬禁区

1. 只新增路由 + HTML，不改现有业务代码/生成器/其他路由
2. 不 npm install 新依赖
3. 不提交密钥、不 git push
4. 禁止 feishu_doc / feishu_drive

## 给下一跳

- H2 确认 UI 方案（自研极简 vs CDN）、CSP 策略、红色记录评估
- H3 在 openapiRoutes.js 加 1 个路由 + inline HTML 字符串


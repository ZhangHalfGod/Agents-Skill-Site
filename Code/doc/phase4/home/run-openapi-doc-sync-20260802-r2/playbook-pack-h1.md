# Playbook Pack · H1

scheme: single-facade-mcp+hop-snapshot
queried_via: agents-skill-remote

## sources

- Agent `ProductManager` @ `docs/zh/agents/standard/ProductManager/index.md` (contentHash=393c53994d1bac10)
- Skill `stage-gate-flow` @ `docs/zh/skills/custom/common/stage-gate-flow/index.md` (contentHash=—)
- Skill `ai-code-boundary` @ `docs/zh/skills/custom/common/ai-code-boundary/index.md` (contentHash=—)

## 角色义务（摘自 get_source_text · agent ProductManager，contentHash=393c53994d1bac10）

1. 明确业务目标（SMART 原则），列出干系人与成功画像，写清非目标
2. 需求拆解：必需功能（P0/P1/P2 分层）、使用场景（主/备选/异常）、技术边界、依赖与风险
3. 输出《AI代码生成范围清单》（需求/功能点、业务目标/验收标准、AI 可生成范围、核心模块红色记录、优先级、责任人/交付节点、非目标/假设）
4. 涉及核心层/网关层/安全模块时必须单独登记《核心模块AI生成红色记录》
5. 提交架构师审核，根据反馈修订
6. 验收阶段对照清单验证 AI 生成代码与业务需求一致性
7. 复盘：收集需求达成度数据，沉淀可复用方法论

## 出门清单（H1 交付前自查）

- [x] MCP health ok（contentHash=6029dcd3053d9df9）
- [x] 角色 source 已拉取（ProductManager, contentHash=393c53994d1bac10）
- [x] mcp-resolve-h1.yaml 已落盘（endpoint / agent id / source / contentHash；无 token）
- [x] playbook-pack-h1.md 已落盘（角色义务 / 出门清单 / 硬禁区 / sources 列表）
- [x] 原位探查已完成（只读），确认实现与文档矛盾的具体位置（2 处）
- [x] 源码阅读确认：openapiRoutes.js、openapiGenerator.js、server/index.js 挂载、测试、快照
- [x] grep 全量扫描：extern-api/*.md 仅 2 处矛盾；业务仓其余 .md 无矛盾
- [x] 范围清单已产出（h1-pm.scope-checklist.md），必备章节齐全
- [x] 交接信封已产出（YAML，四要素齐：from/to/project/stage + deliverable/decisions/gate）
- [x] 每条 P0 均有可执行验收标准
- [x] 非目标与范围边界已写明，避免隐性蔓延
- [x] 显式不做列表完整（9 条目）
- [x] 验收口径逐条映射用户验收条件（3 条）

## 硬禁区（本期适用的红线）

1. 只做文档对齐，不改业务代码（生成器、路由、测试均不动）
2. 不接 Swagger UI（明确排除）
3. 不起服务（实测留给 H3/H4）
4. 不提交密钥（.env / Token 不得泄露到任何产物）
5. 不 git push
6. 不 npm install / rebuild
7. 禁止 feishu_doc / feishu_drive（飞书双写由 main 负责）
8. 不改默认配置
9. 不 process poll 旧进程；防空转；单跳超时要上报不要死等
10. 不越权产出其他角色的交付物；跨角色需求转回编排者 main

## 给下一跳的执行纪律

- H2 架构师仅做合规复核（确认修改面仅 .md、确认不引入路由/生成器变更、确认 Swagger UI 排除声明清楚）；不改任何文件
- H3 仅做文本修改（M1 + M2 两条改动），不额外重构文档结构；措辞建议见 scope-checklist 2.2
- H4 验证改动用 git diff --stat 仅确认 .md 文件；起服务实测 openapi.json/yaml 返回 200
- 全链路禁止写 .env / Token；禁止 npm install；禁止 feishu 双写（main 做）

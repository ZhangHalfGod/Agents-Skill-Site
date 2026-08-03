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
3. 输出《AI代码生成范围清单》：需求/功能点、业务目标/验收标准、AI 可生成范围、核心模块红色记录、优先级、责任人/交付节点、非目标/假设
4. 涉及核心层/网关层/安全模块时必须单独登记《核心模块AI生成红色记录》——本期为安全校验加装（网关层），须触发红色记录
5. 提交架构师审核，根据反馈修订
6. 验收阶段对照清单验证 AI 生成代码与业务需求一致性
7. 复盘：收集需求达成度数据，沉淀可复用方法论

## 出门清单（H1 交付前自查）

- [x] MCP health ok（contentHash=6029dcd3053d9df9）
- [x] 角色 source 已拉取（ProductManager, contentHash=393c53994d1bac10）
- [x] mcp-resolve-h1.yaml 已落盘（endpoint / agent id / source / contentHash；无 token）
- [x] playbook-pack-h1.md 已落盘（角色义务 / 出门清单 / 硬禁区 / sources 列表）
- [x] 原位探查已完成（只读）：invoke-cursor-agent.ps1 全文、SKILL.md、README 等全部确认
- [x] 确认 invoke-cursor-agent.ps1 当前仅做 Test-Path（存在性校验），无 WorkDir 白名单
- [x] 确认 orchestration 侧存在一份独立副本（Agents-Skill-Site 下），同样无白名单
- [x] grep 全量业务仓 + orchestration：所有引用 invoke-cursor-agent / WorkDir 的文件已列出
- [x] 本机 git 仓库已枚举（Trae_Study 下 6 个业务仓），作为白名单默认候选集
- [x] 范围清单已产出（h1-pm.scope-checklist.md），必备章节齐全
- [x] 交接信封已产出（YAML，四要素齐）
- [x] 每条 P0 均有可执行验收标准
- [x] 核心/网关/安全相关条目已触发红色记录流程说明（WorkDir 白名单属于网关层安全校验）
- [x] 非目标与范围边界已写明
- [x] 显式不做列表完整

## 硬禁区（本期适用的红线）

1. 只改 invoke-cursor-agent.ps1（白名单逻辑），不改 Cursor 本身、不改其他业务仓逻辑
2. 不改 OpenClaw 配置 / channels / 路由
3. 不起服务；不 npm install/rebuild
4. 不提交密钥（.env / Token 不得泄露到任何产物）
5. 不 git push
6. 禁止 feishu_doc / feishu_drive（飞书双写由 main 负责）
7. 不改默认配置（白名单默认值不对齐到某特定机器的绝对路径）
8. 不越权产出其他角色的交付物

## 给下一跳的执行纪律

- H2 架构师复核：确认白名单方案（脚本内数组 + 可选环境变量覆盖）架构安全，评估是否需要正则/前缀匹配
- H3 仅在两份 invoke-cursor-agent.ps1 中插入白名单校验逻辑（共 ~10 行），同步更新 SKILL.md 文档
- H4 实测：白名单内路径跑通、白名单外路径被拒绝（FAIL 中文原因 + exit 1）
- 编排侧副本（orchestration/openclaw/）也必须同步加白名单（编排者派遣 H3 时也用它）
- 全链路禁止写 .env / Token；禁止 npm install；禁止 feishu 双写（main 做）

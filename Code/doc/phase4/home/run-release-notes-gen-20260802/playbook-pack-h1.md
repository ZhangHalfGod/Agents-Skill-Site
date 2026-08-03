# Playbook Pack · H1

scheme: single-facade-mcp+hop-snapshot
queried_via: agents-skill-remote

## sources

- Agent `ProductManager` @ `docs/zh/agents/standard/ProductManager/index.md` (contentHash=393c53994d1bac10)
- Skill `stage-gate-flow` @ `docs/zh/skills/custom/common/stage-gate-flow/index.md` (contentHash=—)
- Skill `ai-code-boundary` @ `docs/zh/skills/custom/common/ai-code-boundary/index.md` (contentHash=—)

## 角色义务（摘自 get_source_text）

1. 明确业务目标（SMART）、成功画像、非目标
2. 需求拆解：P0/P1/P2 分层、使用场景、技术边界、依赖与风险
3. 输出《AI代码生成范围清单》：功能点、验收标准、AI 可生成范围、红色记录、优先级
4. 提交架构师审核，验收阶段验证一致性

## 出门清单（H1 交付前自查）

- [x] MCP health ok（contentHash=6029dcd3053d9df9）
- [x] 角色 source 已拉取（ProductManager, contentHash=393c53994d1bac10）
- [x] mcp-resolve-h1.yaml 已落盘
- [x] playbook-pack-h1.md 已落盘
- [x] 原位探查：release-triplet-check.mjs、releaseContract.js、releaseContract.test.js、releaseRoutes.js、发布清单-模板.md、演练样例、版本三元组发布流程.md、现有 scripts/ 目录
- [x] 确认 manifest 响应结构（probe=false 时 mcp 段仅 configured/reachable，无密钥泄露）
- [x] 确认 scripts/ 下已有 .mjs 先例（release-triplet-check.mjs, governance-smoke.mjs）
- [x] 范围清单已产出、交接信封已产出

## 硬禁区

1. 只新增脚本，不改业务代码
2. 生成的 Markdown 输出不得含密钥/Token
3. 不 git push、不 npm install、不起服务
4. 禁止 feishu_doc / feishu_drive

## 给下一跳

- H2 确认输出结构（完全对齐模板 vs 自动生成轻量版）、probe 默认值、字段完整性校验策略
- H3 新增 scripts/release-notes-gen.mjs，参考 release-triplet-check.mjs 的 fetch 封装
- H4 起服务实测并核对输出字段与 manifest 一致

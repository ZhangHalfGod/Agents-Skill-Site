# Playbook Pack · H1

scheme: single-facade-mcp+hop-snapshot
queried_via: agents-skill-remote

## sources

- Agent `ProductManager` @ `docs/zh/agents/standard/ProductManager/index.md` (contentHash=393c53994d1bac10)
- Skill `stage-gate-flow` @ `docs/zh/skills/custom/common/stage-gate-flow/index.md` (contentHash=—)
- Skill `ai-code-boundary` @ `docs/zh/skills/custom/common/ai-code-boundary/index.md` (contentHash=—)

## 角色义务（摘自 get_source_text）

1. 明确业务目标（SMART），列出成功画像与非目标
2. 需求拆解：P0/P1/P2 分层、使用场景、技术边界、依赖与风险
3. 输出《AI代码生成范围清单》：功能点、验收标准、AI 可生成范围、红色记录、优先级
4. 提交架构师审核，根据反馈修订
5. 验收阶段对照清单验证实现一致性

## 出门清单（H1 交付前自查）

- [x] MCP health ok（contentHash=6029dcd3053d9df9）
- [x] 角色 source 已拉取（ProductManager, contentHash=393c53994d1bac10）
- [x] mcp-resolve-h1.yaml 已落盘
- [x] playbook-pack-h1.md 已落盘
- [x] 原位探查：doctor.ps1 全文、三个 probe 脚本、profile 结构、apply-profile.ps1、README
- [x] 确认 doctor.ps1 当前不跑 probe、无 PASS/WARN/FAIL、无退出码
- [x] 确认三个 probe 退出码约定（weather/tts: fail→1, routing→0 恒零）
- [x] 确认 profile 结构（bm/home 各有 weatherBackend/ttsEngine/capabilities）
- [x] 确认 doctor 调用方（仅 install 提示和 README 目录，无程序调用）
- [x] 范围清单已产出、交接信封已产出

## 硬禁区

1. 只改 doctor.ps1（扩展 probe 汇总），不改 probe 脚本本身
2. 不提交密钥
3. 不 git push
4. 不 npm install / rebuild
5. 不起服务、不跑 probe（外部 API 留给 H4）
6. 禁止 feishu_doc / feishu_drive

## 给下一跳

- H2 确认 profile 选择策略、WARN/FAIL 退出码
- H3 在 doctor.ps1 末尾新增 probe 汇总段（原前段不变）
- H4 在两台机器实测（bm + home）

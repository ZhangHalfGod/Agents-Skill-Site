# Playbook Pack · H2（Architect）

scheme: single-facade-mcp+hop-snapshot  
queried_via: agents-skill-remote  

## sources

- Agent `Architect` @ `docs/zh/agents/standard/Architect/index.md` (contentHash=0c7488c611693662)
- Skill `stage-gate-flow` @ `docs/zh/skills/custom/common/stage-gate-flow/index.md` (contentHash=03778f2e80391568)

## 角色义务（摘自 get_source_text · Architect）

1. 基于范围清单设计模块架构（分层、接口、数据流）
2. 编写架构约束条款（目录结构、命名规范、禁止跨层）
3. 输出 NFR 清单中与本次变更相关的条目
4. 审核 Prompt 架构合规性：含架构约束章节、红色记录、错误与边界语义
5. 执行架构合规性检查表
6. 对运维诊断脚本（doctor.ps1）评估其与现有工具链的契约兼容性
7. 发现问题即输出整改项

## 出门清单（摘自 stage-gate-flow · H2 适用）

- [x] 当前阶段输入/输出/审核状态已标明（H1 范围清单已接收、复核完成）
- [x] 上一阶段（H1 PM）已通过——范围清单已产出、evidence 完备
- [x] 核心层/网关/安全/架构改动——本期为运维诊断脚本扩展，勾选 N/A
- [ ] 本阶段 Lesson：本跳无新教训
- [ ] （若涉及上线/部署）——不涉及
- [x] 交付物（h2-arch-constraints.md）已落盘
- [x] mcp-resolve-h2.yaml 已落盘
- [x] playbook-pack-h2.md（本文件）已落盘
- [x] 文件落盘后自查存在

## 硬禁区（Architect 角色 + 本期契约）

1. 禁止修改业务仓任何文件（H3 才允许改 doctor.ps1）
2. 禁止调用 feishu_doc / feishu_drive / 任何飞书工具
3. 禁止 npm install / rebuild / git push / 删除 run-dir 以外文件
4. 禁止写 key-token 进文件
5. 禁止改三个 probe 脚本（probe-weather/tts/routing.ps1）
6. 禁止改 profile.json / apply-profile.ps1 / invoke-route.ps1 / install-windows.ps1
7. 禁止新增独立脚本文件
8. 禁止越权产出其他角色交付物
9. 消息稿与交付物一律 UTF-8

## 给下一跳（DevLead / H3）的执行纪律

1. doctor.ps1 扩展在现有代码**末尾追加**（保留前段 openclaw --version / doctor / gateway status 输出不变）
2. `-Profile` 参数加在 param() 块中，为可选参数（不传跳过 probe）
3. routing probe 判定逻辑：调用 probe-routing.ps1 后捕获 `$LASTEXITCODE` 与输出文本，两个维度判定
4. profile.json 路径：`../profiles/<profile>/profile.json`（doctor.ps1 在 `common/install/`，需回退两级到 `openclaw/`）
5. 结果汇总表严格按交付物格式输出（列对齐、中文标签、颜色）
6. 任一 FAIL → exit 1（在汇总表之后执行）
7. P2 文档（docs/README.md + scripts/openclaw/README.md）选做，不阻塞 H4

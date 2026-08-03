# Playbook Pack · H2（Architect）

scheme: single-facade-mcp+hop-snapshot  
queried_via: agents-skill-remote  

## sources

- Agent `Architect` @ `docs/zh/agents/standard/Architect/index.md` (contentHash=0c7488c611693662)
- Skill `stage-gate-flow` @ `docs/zh/skills/custom/common/stage-gate-flow/index.md` (contentHash=03778f2e80391568)
- Skill `ai-code-boundary` @ `docs/zh/skills/custom/common/ai-code-boundary/index.md` (contentHash=f8e641bd8ab22698)

## 角色义务（摘自 get_source_text · Architect）

1. 基于《AI代码生成范围清单》与业务目标，设计系统/模块架构（分层、接口、数据流）
2. 明确各层职责与调用关系，编写架构约束条款（目录结构、命名规范、禁止跨层、AI 生成分级管控边界）
3. 输出 NFR 清单（性能、可用性、安全、可观测性、合规）中与本次变更相关的条目
4. 审核 Prompt 架构合规性：是否含「架构约束」章节、核心模块红色记录、错误与边界语义
5. 执行《AI代码架构合规性检查表》：分层与职责、接口与契约、边界遵守、依赖与规范
6. 发现问题即输出整改项，拒绝不合规代码入库直至修复
7. 对核心层/网关层/安全模块的 AI 生成代码，要求登记《核心模块AI生成红色记录》
8. 重大决策建议沉淀 ADR（架构决策记录）要点

## 出门清单（摘自 stage-gate-flow · H2 适用）

- [x] 当前阶段输入/输出/审核状态已标明（H1 范围清单已接收、复核完成）
- [x] 上一阶段（H1 PM）已通过——范围清单已产出、evidence 完备
- [x] 核心层/网关/安全/架构改动已附《核心模块AI生成红色记录》——本期为网关层安全校验，红色记录已登记（见交付物第 3 节）
- [ ] 本阶段 Lesson：记入 h2-arch-constraints.md lesson_hint（本期无额外 lesson）
- [ ] （若涉及上线/部署）——本期不涉及，勾选不适用
- [x] 交付物（h2-arch-constraints.md）已落盘 run-dir
- [x] mcp-resolve-h2.yaml 已落盘
- [x] playbook-pack-h2.md（本文件）已落盘
- [x] 文件落盘后自查存在（见 evidence）

## 硬禁区（Architect 角色 + 本期契约）

1. 禁止修改业务仓任何文件（H3 才允许改）
2. 禁止调用 feishu_doc / feishu_drive / 任何飞书工具（飞书双写由 main 做）
3. 禁止 npm install / rebuild / git push / 删除 run-dir 以外文件
4. 禁止写 key-token 进文件
5. 禁止改 Cursor 本身 / 网关配置 / .env
6. 禁止扩大改业务仓逻辑（仅白名单校验，不染指路由/生成器/注册表）
7. 禁止越权产出其他角色交付物
8. 消息稿与交付物一律 UTF-8

## 给下一跳（DevLead / H3）的执行纪律

1. 两份脚本的白名单校验代码须结构一致（核心逻辑复用），但**插入位置不同**：
   - 业务仓副本：`Test-Path` 检查块（L18-L21）结束的 `}` 之后，`$agentCmd` 赋值（L23）之前
   - 编排副本：`Test-Path` 检查块（L17-L19）结束的 `}` 之后，`.env` 加载（L21）之前
2. 白名单默认值 6 仓绝对路径已定稿，H3 直接复制不修改
3. 白名单校验失败 → `Write-Output "FAIL: 工作目录不在白名单中: $WorkDir"` + `exit 1`
4. SKILL.md 新增段落含白名单说明与 WORKDIR_WHITELIST 环境变量用法
5. P1（configure-cursor-code.ps1）若生成与 invoke-cursor-agent.ps1 相关的 SKILL 模板，须同步更新白名单说明
6. P2（顶层 README、orchestrator-main 等）若引用 invoke-cursor-agent.ps1 行为，建议在对应段落注明白名单存在，但**非强制**

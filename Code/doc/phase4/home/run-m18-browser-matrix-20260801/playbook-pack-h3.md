# playbook-pack-h3.md — H3 跳界快照（合并 Pack，以 H2 为准 + DevLead 纪律）

> 组装：main（编排者）于放行后。合并来源：playbook-pack-h2.md（Architect，全量保留）+ DevLead 角色正文摘录（本次 MCP 自查补充，contentHash `1eafe9e82124f2b5`）。
> 本 Pack 已内嵌进 H3 Goal。**Cursor 禁止再调 Site MCP；禁止再读 Agents-Skill-Site `docs/zh/**` 说明书**。

## sources

| 资源 | 值 |
|------|-----|
| endpoint | agents-skill-remote |
| agent.arch.id | Architect |
| agent.arch.source | docs/zh/agents/standard/Architect/index.md |
| agent.arch.contentHash | `0c7488c611693662` |
| agent.devlead.id | DevLead |
| agent.devlead.source | docs/zh/agents/standard/DevLead/index.md |
| agent.devlead.contentHash | `1eafe9e82124f2b5` |
| skill.stage-gate-flow.contentHash | `03778f2e80391568` |
| skill.ai-code-boundary.contentHash | `f8e641bd8ab22698` |
| skill.traceability-compliance.contentHash | `089ef19727c7f233` |
| mcp.health.contentHash | `6029dcd3053d9df9` |

## 执行者角色义务（H3 dev 视角）

1. **按已审核约束执行，不自行扩范围**：只做实测 + 文档回填（C6 白名单 3 个文件），不改业务代码/默认配置/.env（mcp-gaode/.env 配 TTS 是唯一 H3 自主权，仅在需独立验证 mcp-gaode /chat 时用）。
2. **小步自审**：每完成一个文件回填即自查格式与一致性，最后统一交叉核对；不一次性大改。
3. **可追溯**：测试证据（截图/日志摘要）落进 `AI代码测试报告.md`；全文禁止出现 DOUBAO_TTS_* / APP_ID / ACCESS_KEY / Token / 原始 audioBase64。
4. **如实记录**：✅/❌/⏭ 必须带原因；❌ 或 ⏭ 不得用空勾掩盖；无法完成项写清阻塞。

## 硬禁区（H3 必须遵守）

- 不改业务代码、不改默认配置、不 git push、不提交任何变更（本地工作区改动仅限 C6 白名单 3 个文件）
- 不写任何 .env / Token / 密钥 / 原始音频进文档或消息
- 不调用 feishu_doc / feishu_drive（飞书双写由编排者 main 负责）
- 禁止再调 Site MCP（agents-skill-remote）；禁止再读 Agents-Skill-Site `docs/zh/**` 说明书
- npm install 仅限 mcp-gaode 前端依赖缺失时的环境准备；不 rebuild、不装新依赖
- 不把任务扩展成「重做 M18」或「接入新 TTS 厂商」
- 不越权产出其他角色交付物（测试报告属于本任务交付物，但架构/范围类文档不动）
- 输出正文 UTF-8

## 验收口径（H3 完成后 H4 独立复验）

1. README.md §1 矩阵：Win Chrome ASR/TTS 每格有状态+原因；Win Edge 有结果或 ⏭+原因；macOS 全 ⏭「本环境跳过（无 Mac 设备）」
2. AI代码测试报告.md 新建，矩阵与 README §1 逐格一致，含环境/步骤/证据/结论
3. README.md §2 冒烟 #1~#4 实测勾选或 ⏭+原因；#5~#7 标注已验不重测
4. 执行进度.md §4 追加实测行、§6 待办 #1 更新、§7 变更记录追加
5. 全文无密钥泄露；H4 只读核对，无需代码修改

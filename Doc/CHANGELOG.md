# CHANGELOG — All_URI

## 2026-07-31 — phase4：成本台账字段草案（DeepSeek / Cursor）

- **契约**：`Doc/phase4/08-cost-ledger-schema.md` — run-dir `cost-ledger.yaml` 字段（hops / quality / totals / recommendations）
- **现网锚定**：pm/arch=`deepseek-v4-pro`；ui/dev/test/sec/ops=`deepseek-v4-flash`；H3=`cursor/agent`（token vs subscription）
- **样例单价表**：`Code/orchestration/openclaw/cost/pricing.example.yaml`（实价 TBD；调档仅人闸建议）

## 2026-07-31 — phase4：M0 run-dir 飞书 presentation 交互卡

- **能力**：【新项目需求】先发 OpenClaw presentation 按钮卡选痕迹目录；支持预设 / `run_dir=` 自定义 / 首条内嵌跳过
- **脚本**：`build-run-dir-card.cjs`、`resolve-run-dir.cjs`、`run-dir-presets.yaml`
- **契约**：`Doc/phase4/07-run-dir-m0-card.md`；SOUL **v1.4**（M0 单独回合停）
- **说明**：飞书无本机文件选择器；自定义路径仍粘贴绝对路径（白名单校验）

## 2026-07-31 — fix: get_source_text DOCS_ROOT 从 MANIFEST_PATH 上溯两级

- **现象**：公网已暴露 `get_source_text`（10 tools），调用返回 NOT_FOUND；`docsRoot` 误为 `…/Code/code/docs`
- **根因**：`resolveDocsRoot()` 对 `…/docs/public/manifest.json` 只上跳一级；source 为 `docs/zh/...` 须相对 `Code/code`
- **修复**：上溯 `public → docs → code`；`env.production.example` 注明可选 `DOCS_ROOT`

## 2026-07-31 — docs：ECS 部署前 `git restore .` 原因备忘

- **定案**：索引 JSON 继续入库；部署机 `build`/`generate` 后工作区变脏为**预期**（时间戳/hash），下次更新前 `git restore .`，禁止在 ECS commit 这些产物
- **不采用**：把 `public/*.json` 改成不入库（会动 MCP/CI/本地 MANIFEST_PATH 契约）
- **落点**：`Code/doc/phase1/07-deploy.md` §4.2/§4.3；`Code/mcp-remote/deploy/README.md` 日常 pull 步骤补 restore

## 2026-07-31 — phase4：Single-Facade MCP + Hop Snapshot（SF-HS）

- **流程定名**：说明书唯一门面 = 公网 `agents-skill-remote`；派 Cursor 前冻 **Playbook Pack** 进 Goal（跳界快照）
- **MCP**：新增只读 `get_source_text`（`catalog-api` + stdio/HTTP 双端）；工具数 9→10；仍禁止写
- **契约**：`Doc/phase4/06-single-facade-hop-snapshot.md`；`04` 修订（只挂 Site MCP、公网主路径）；模板 `Code/orchestration/openclaw/templates/`
- **SOUL v1.3**：角色自查 MCP → resolve/pack 落盘 → H3 Goal 内嵌 Pack；禁本机 Site 说明书主路径
- **S0**：`SYSTEM-DIRECTION` 决策日志 2026-07-31-01
- **运维**：须将含 `get_source_text` 的 mcp-remote **部署到 ECS** 后，公网 probe 才有第 10 工具；OpenClaw `mcp add` 挂接见 04

## 2026-07-31 — phase4 补记：main SOUL v1.2 防空转 + 回合切割

- **SOUL v1.2**：H1+H2+M2 同一飞书回合必须停住；H3/H4 仅放行后新回合；禁无进度 `process poll`（最多 3 次 / 连续 2 次无输出即停）；子 agent 禁 `feishu_doc`；双写必须 folder_token 且失败不得假装完成；超时后续跑优先续 run-dir 勿重跑已完成跳
- **线上**：`~/.openclaw/workspace/SOUL.md` 流水线段已替换；仓内草稿 `orchestrator-main-soul.draft.md` 同步
- **背景**：2026-07-31 OpenAPI+Voice 编排轮因空转 poll 触达 900s embedded timeout，飞书只见 timeout、双写链接未稳定投递

## 2026-07-30 — phase4 补记：文档类交付形态 A（飞书 SoT + 本地镜像）

- **定案**：人对人 SoT = 飞书云文档；机器校验/H3 = run-dir 本地镜像（信封 `path` 仍必填且须存在）
- **SOUL v1.1**：流水线 H1/H2（及可行性分析）强制 `feishu_doc` 双写（create+write+链接）；编排者只发布已归档正文、不创作；云文档失败不阻断机器链路但必须上报
- **契约**：`02-orchestration-contracts.md` 原则与信封注释对齐形态 A；线上 `~/.openclaw/workspace/SOUL.md` 同步替换流水线段

## 2026-07-30 — phase4 补记：main 自编排 SOUL 定稿并部署（待飞书验）

- **定稿**：`Code/orchestration/prompts/orchestrator-main-soul.draft.md` → v1（条件触发【新项目需求】、简链 H1→H2→M2→H3→H4、M2 签名=代码跳唯一触发器、硬护栏）
- **线上部署**：追加到 `~/.openclaw/workspace/SOUL.md` 末尾；与已有「飞书云文档产出约定」去重（pipeline 段只补 owner_open_id / 禁自称未注册）
- **未验**：飞书发【新项目需求】自驱全链仍待跑；部署后建议新 session 或清 main 群 session 使 SOUL 生效

## 2026-07-30 — phase4 补记：main 飞书云文档能力打通（feishu_doc 五层门禁）

- **能力落地**：main agent 现可在飞书会话中调 `feishu_doc` 创建云文档并写入长 md（action=create → action=write → 回链接）；群聊链路 `owner_open_id` 自动授权发送者，CLI/群聊双冒烟 ✅；`feishu_drive`/`feishu_wiki`/`feishu_chat`/`feishu_app_scopes` 同批可用
- **五层门禁根因链**（agent 自述"工具未注册" → 逐层实证）：① 插件包 `@openclaw/feishu` 已装（`openclaw plugins list`）② `channels.feishu.tools.doc` 开关 ③ session 工具清单缓存（改配置需清 session）④ **全局 `tools.profile: "coding"` 白名单静默过滤插件工具**（wizard 默认产物；改 `"full"`；该域热加载不接管必须重启 gateway）⑤ 飞书应用 scope（`docx:document` 等 6 个 + **发布新版本**才生效）
- **沉淀**：raw Lesson `operations/openclaw-orchestration-pilot/lessons/2026-07-30-feishu-doc-five-layer-gates.md`（P2，待周一终审）；openclaw-ops 新增 L3 `docs/plugin-tool-gates.md`（五层门禁表 + CLI 冒烟先行 + 注册门槛实测法）+ 热加载例外坑双语同步；SOUL 草稿（orchestrator-main-soul.draft.md）补「长输出 → 飞书云文档」段
- **配置变更**（bm 机 `.openclaw/openclaw.json`，备份 `.bak-*` 三份）：`channels.feishu.tools` 显式五开、`tools.profile` coding→full、main 两个陈旧 session 已清；gateway 两次重启（`run --force`）
- **Gateway 服务化落地**：`openclaw gateway install` 创建 schtasks 计划任务「OpenClaw Gateway」（`gateway.vbs` 隐藏窗口 + 登录自启），替代裸终端 `run --force`；实证服务化后 `gateway start/stop/status/restart` 全可用（restart ~58s）——**修正 openclaw-ops 此前「restart 在 Windows 不可用」的表述**（真条件 = 未服务化时）；WMI 裸起会带可见 conhost 窗口，勿用
- **产出落盘约定落地**：共享文件夹「OpenClaw 产出」（`folder_token=MOLOfJVErlIgrOdVxSHcacD0nrf`）经「群聊协作者（可编辑）」授权 bot；约定写入线上 main SOUL.md（即时生效）+ 仓内 SOUL 草稿（防部署回退）；smoke 终验 `create 带 folder_token` 建文档落盘正确 ✅；运行时权限两层（scope 发布才生效 / 资源 ACL 加群聊最稳）补入 openclaw-ops L3；冒烟期两篇无 folder_token 的文档遗留应用根目录（可 `feishu_drive move` 补救，未动）

## 2026-07-30 — phase4 补记：端到端首跑完成（飞书进、代码出）

- **E2E 首跑**：mechassist-openapi（extern-api registry → OpenAPI 3.0）飞书需求 → H1 pm(pro) → H2 arch(pro)（机制 A，Cursor 侧按契约驱动）→ `invoke-cursor-agent.ps1` 代码跳（机制 B）→ 验收三条**独立复核**全过（端点 200 / `openapi=3.0.3` / 28 路径、快照可复现、全量 43 pass / 1 fail 为既有 vitest 冲突）；证据 `Code/doc/phase4/e2e-openapi/`（H1/H2 交付物 + 双信封 + Goal + 各跳原始输出）
- **代码跳产物**：extern-api 新增 `server/catalog/openapiGenerator.js`（核心层红色记录）/ `server/routes/openapiRoutes.js` / `server/test/openapi.test.js` + 首次快照，`server/index.js` +2 行；chatRoutes / registry / apiPaths / 存量测试零触碰；H2 四条 open_questions 全部裁决收口（PATH_FALLBACKS / servers 环境变量策略 / chat requestBody / x-discovery）
- **A/B 实证**：同需求盲跑，main(flash) 单兵版要改 chatRoutes 热路径且无信封；pm(pro)+契约版热路径零触碰、信封/证据/红色记录齐全——分档+契约的约束服从性优势有实据
- **工具新增**：`Code/orchestration/openclaw/invoke-openclaw-agent.cjs`（node spawn 数组传参，双杀 PS5.1 native argv 引号拆分 + stdout GBK 乱码；后续所有 `openclaw agent` 调起走它）；`invoke-cursor-agent.ps1` 补 WorkDir `.env` 加载（CURSOR_API_KEY 等，已有环境变量优先）
- **401 故障修复**：deepseek key 三层认证路径补齐（main 隔离 store + 默认 profile + 用户级 setx 持久化）；根因 = `DEEPSEEK_API_KEY` 仅终端会话临时设置未持久化；从 pm store 提取有效 key 直连 provider 验 200 后三处补齐
- **3 张 raw Lesson**：`operations/mechassist-openapi/lessons/`（PS5.1 argv/stdout 双坑 P2 / cursor-agent node ABI 翻转+残留进程占锁 P2 / 认证三层解剖 P1），待周一 digest 终审
- **边界诚实**：本次编排由 Cursor 侧人控编排器驱动；**main agent 自编排（SOUL 注入 + exec 派遣下一跳）未验证、已搁置**——`00` §8 验证状态已照此更新

## 2026-07-30 — phase4 补记：模型分档实例化（pm/arch → deepseek-v4-pro）

- **top 档落地**：`openclaw.json` 中 pm/arch 的 `model` 改为 `deepseek/deepseek-v4-pro`（1000k ctx），Gateway 热加载免重启（pm 冒烟 session Model 列实证）；同 provider 免重注 key；其余角色维持 flash
- **CLI 边界实证**：改模型正路 = 编辑 `openclaw.json`（CLI 无 update 子命令）；`gateway restart` 在 Windows 报 `Unknown signal: SIGUSR1`（Unix 服务化路径）——并入公共 skill `openclaw-ops` 已知坑（不记 Lesson、不进周推，用户定）
- 契约同步：`agents.example.yaml`（分档 + 改法注释）、`03` §6.5 实测记录
- **`setup-agents.ps1` 落地**：花名册一键重建/对齐（幂等；bm 实跑 7/7 零改动验证）；新机器流程 = 装 OpenClaw → clone → 跑脚本 → 给 key；顺手实证「PS 5.1 解析无 BOM `.ps1` 按 ANSI」并已并入 `powershell-utf8`（含中文脚本必须带 BOM）

## 2026-07-29 — phase4 补记：digest v3 定稿 + 首批 Lesson 终审闭环（skills 11→13）

- **digest v3 定稿**：`lesson-scan.mjs` 骨架补全（`extractTitle` 取卡内 H1 + 卡号/优先级/scope 行）；消息模板 v3 = 骨架原样转发 + agent 每条追加一句判决建议（试探性、不替人拍板）；第三次飞书实推版式确认
- **首批 3 张 raw 卡终审完成**（用户逐条拍板）：cron-error-diag → **merged**（新建 `common/openclaw-ops/`，cron error 三步排查法）；ps-utf8-cron → **merged**（新建 `common/powershell-utf8/`）；persona-injection → **rejected**（机制 A 已验证，注入路径作历史注脚；「同 session 中断续跑」半条抢救进 `Doc/phase4/03` §6.1）
- **新技能注册面**：SKILL_META / STANDARD_SKILLS / EXPECTED_SKILLS / en-skill-bodies / en-agent-bodies / 双语 skills 索引 / OpsEngineer 绑定（必显 +openclaw-ops、推荐 +powershell-utf8）；validate 数量断言改为跟随 EXPECTED_SKILLS 长度；generate/validate 绿（8 agents + **13 skills** + 10 rules）
- **记忆闭环首次完整跑通**：raw → 人工终审 → merged 入公共库；`npm run lessons:scan` 建议清单归零（raw 0 · merged 5 · rejected 1）

## 2026-07-29 — phase4（4A 落地 + 4B 契约与最小试点）

- **4A 跨项目记忆复用**：Lesson Card v2（`scope` / `seen_in_projects` / `promoted_to`）；`scripts/lesson-scan.mjs`（看板 + 聚类 + 升格建议；`--strict` 可阻断）；operations README 与 PR 模板挂钩；存量 3 条回填  
- **4B OpenClaw 编排总线契约**：`Doc/phase4/`（00～04）；`Code/orchestration/` 样例（agents / mcp.servers / 信封 / Prompt 模板）；运行时外置 OpenClaw 部署侧  
- **最小两跳试点**：bm Gateway（`deepseek/deepseek-v4-flash`）PM → Architect 一次跑通；证据 `Code/doc/phase4/pilot/`；试点 Lesson `openclaw-orchestration-pilot`（raw，`scope=common` 实战，人终审留项目内）  
- 试点期模型绑定：全部角色统一 `deepseek/deepseek-v4-flash`（用户后续自行分档）  
- S0 v0.5 · 决策 `2026-07-29-01`；分支 `feature/phase4-memory-orchestration`；遗留：机制 A（命名 agent / per-agent 模型）验证

## 2026-07-29 — phase4 补记：机制 A 验证通过 + 角色花名册落地

- **机制 A 实测通过**（bm，OpenClaw 2026.7.1-2）：`openclaw agents add` 命名 agent、per-agent `--model`、auth 逐 agent 隔离（`models auth --agent <id> paste-api-key`）、workspace `SOUL.md` persona（arch 冒烟自答角色与交付物 kind）  
- **花名册落地**：pm / arch / ui / dev / test / sec / ops 七个角色 agent 已建，统一 `deepseek/deepseek-v4-flash`（用户后续自行分档）  
- **q004/q005 定案**：cron 走 `openclaw cron add`；命令任务原生 `--command-argv` + `--command-cwd`（H2 的 cwd 坑由 flag 解决）；agent 消息任务 + `announce->feishu` 复用既有 brief 投递通道  
- weekly-lesson-digest 出现更简落地路径（cron agent 消息任务，免 webhook/新凭据），见 `Doc/phase4/03` §6.4  
- 文档回填：`03` §1/§3/§6、`04` mcp CLI、`agents.example.yaml` 去「待验证」、pilot meta
- **weekly-lesson-digest 已落地 bm**（同日傍晚）：形态 A cron agent 消息任务，周一 09:00 announce→feishu 简报群，2026-08-03 首跑；定义与运维进 `Code/orchestration/cron/`；期间 Gateway 掉线一次已 `gateway run --force` 恢复（brief 任务今晨 error 实为用户 qwen 免费额度耗尽，已切全局默认 deepseek 修复）；新 Lesson `2026-07-29-ps-getcontent-utf8-cron`（PS 5.1 编码坑）
- **digest 两次实推验证通过**（用户飞书群截图确认）：首推发现 agent 自行摘要漏条目 → `lesson-scan.mjs` 新增 `--format digest` 确定性文本出口，agent 改为原样转发（二推 3/3 条目，30s）；残留试验 session（ai-brief-1450/1500）手动清理（store 12→10，transcript 归档）；`cron get/run` 只认 UUID；新 Lesson `2026-07-29-cron-error-model-snapshot-diag`

## 2026-07-17 — phase3 B～D（迭代闭环）

- **阶段 B**：Lesson 出门检查 + 触发句；`.github/PULL_REQUEST_TEMPLATE.md` 治理沉淀勾选  
- **阶段 C**：`stage-gate-flow` 瘦身（主页清单 + `docs/` 长文）；引用 `04-context-budget`  
- **阶段 D**：`operations` 收尾清单 / 状态机；真实 Lesson `ecs-deploy-host404` merged → `deploy-verify.md`  
- 分支：`feature/phase3-loop`；E/F（MCP list_lessons / 多 Profile）未做  

## 2026-07-16 — sot-inplace（方案 B）

- **SoT 迁入本仓**：`Code/code/docs/**` 就地维护；废止外仓 `STANDARDS_ROOT` 日常 sync  
- S0 v0.4 · 决策 `2026-07-16-01`  
- `npm run generate`（`sync` 别名）只刷 manifest/侧栏  
- `docs/operations/` Lesson 模板 + 示例 `site-sot-inplace`  
- 去掉「请勿手改 / 同步自 standards」页头误导  
- **部署文档**：`07-deploy.md` / mcp-remote `deploy/README` 补 Host 探测、脏工作区、PM2 何时重启；主机用 `<PUBLIC_HOST>` 占位  



## 2026-07-14 — v1.5-a1

- **文档**：明确两仓 GitHub 关系  
  - SoT：[`ZhangHalfGod/agents-skill-standards`](https://github.com/ZhangHalfGod/agents-skill-standards)  
  - 本仓：[`ZhangHalfGod/Agents-Skill-Site`](https://github.com/ZhangHalfGod/Agents-Skill-Site)  
  - 写入 `Doc/README.md`、`Doc/phase3/00-context.md` §1  
- `.gitignore`：忽略本地 `Doc/debug.txt`

## 2026-07-14 — v1.5-a

- **三期阶段 A**：`standards/operations/`（SoT：`agents-skill-standards`）
  - README（禁止 raw 覆盖 common）+ `_template/lessons/_lesson-card.template.md`
  - 示例：`macair-phase3-bootstrap` + raw lesson `2026-07-14-phase3-docs-bootstrap`
- URI：`Doc/phase1/03-uri-registry.md` — `/operations` 标为三期源就绪（公网仍关）
- 下一步：阶段 B（stage-gate / PR 挂钩 + 触发句）

## 2026-07-14 — v1.5-plan

- **三期规划**：`Doc/phase3/` — 治理资产迭代闭环（Lesson Card → Skill 为主 / Agent / Rules）
- 交接上下文：`Doc/phase3/00-context.md`（新对话必读）
- 执行计划：`02-execution-plan.md`；operations/Lesson：`03`；上下文预算：`04`
- 实现笔记落点：`Code/doc/phase3/`

## 2026-07-11 — v1.4

- **远程索引**：`MANIFEST_URL` 可读 `http://8.163.18.183/agents-skill/manifest.json`；计划 `Doc/phase2/02-remote-manifest.md`
- 他人共用：`mcp/cursor-mcp.shared.json.example`（本机只跑 server，数据来自你的公网静态 JSON）
- 不在 ECS 新开 MCP 端口

## 2026-07-11 — v1.3

- **二期 MCP MVP**：`Code/code/mcp/server.mjs`（stdio 只读）；计划 `Doc/phase2/01-mcp-server-plan.md`
- Tools：health / list_agents / get_agent / list_skills / get_skill / list_rules / resolve_number / validate
- Cursor 样例：`mcp/cursor-mcp.json.example`；本机路径样例 `cursor-mcp.local.json`（gitignore）
- 下一步：Cursor 接通验收；可选 `02-cursor-usage` 使用剧本

## 2026-07-11 — v1.2

- **阶段 7 完成**：一期验收报告 `Code/doc/phase1/09-phase7-acceptance.md`；`npm run check:links` / `npm run accept`
- **operations**：确认二期再做，一期不上公网
- **二期规划**：[`Doc/phase2/00-cursor-mcp.md`](phase2/00-cursor-mcp.md) — Cursor + MCP 只读消费 manifest；骨架 `Code/code/mcp/catalog-api.mjs`
- **文档整理**：`Doc/phase1|phase2`、`Code/doc/phase1|phase2` 分目录
- 下一步：实现 MCP Server 并接入 Cursor（health / list_agents / get_agent）

## 2026-07-10 — v1.1

- **验收**：阶段 1.5（ECS 上线）与阶段 4（validate/health）正式验收通过
- **阶段 5**：Domains 四领域目录 + `ptp-nmos` 灰度；`site.config.json` / `ENABLE_DOMAINS` 可关域
- **阶段 6**：角色页 `RunGuide`（复制触发句 / 技能顺序 / 导出 md）+ 首页/Agents `QuickJump` 编号跳转
- 下一步：阶段 7 联调复盘，或继续 domains 扩域

## 2026-07-10 — v1.0

- **阶段 1.5 完成**：ECS 形态 α 上线，`http://8.163.18.183/agents-skill/` 可浏览
- **阶段 4 启动并落地**：`npm run validate` 门禁（失败阻断 build）；`/health/` 摘要；`08-release-checklist.md`
- sync：无 STANDARDS_ROOT 时仍 repo scan 刷新 manifest；服务器直接 `npm run build`
- 下一步：阶段 5 domains 灰度，或阶段 6 运行指引

## 2026-07-10 — v0.9

- **阶段 1.5**：部署笔记落地（形态 α：Nginx 静态 `/agents-skill/`）
- 文件：`Code/doc/07-deploy.md`、`Code/code/deploy/nginx-agents-skill.snippet.conf`
- 下一步：本人在 ECS 执行上线；或阶段 4 validate 门禁

## 2026-07-10 — v0.8

- **阶段 3**：Skills 1～11 正文 + Rules L0/L1/L2（10 条）只读挂载
- 技能↔角色双向可通；`npm run build` 通过
- 下一步：阶段 4 validate 门禁，或 1.5 ECS 部署

## 2026-07-10 — v0.7

- **阶段 2 Agents MVP**：八角色正文 + 6 附属文档 + 技能标签（矩阵）+ 运行指引
- 技能标签跳转：7 个技能占位页（阶段 3 换正文）
- `npm run sync` / `build` 通过
- 下一步：阶段 3 Skills/Rules，或 1.5 ECS 部署

## 2026-07-10 — v0.6

- **阶段 1.4 完成**：`npm run sync` 从 `standards/` 只读挂载 Architect 正文
- 文件：`Code/code/scripts/sync-standards.mjs`、`Code/doc/06-content-mount.md`
- 站点页：`/agents/standard/Architect`；最小 `manifest.json`
- 下一步：1.5 ECS 部署笔记，或阶段 2 补齐其余角色

## 2026-07-10 — v0.5

- **阶段 1.2 / 1.3 完成**：`Code/code/` VitePress 脚手架可 `dev` / `build`
- `base: /agents-skill/`；首页 + agents / skills / rules 占位页
- 本地验证：`npm run build` 成功（vitepress 1.6.4）
- 下一步：部署到 ECS（Nginx `/agents-skill/`）或阶段 2 接入角色正文

## 2026-07-10 — v0.4

- **ADR-001 采纳**：冻结系统架构与技术栈（VitePress + `/agents-skill/` + `127.0.0.1:3010`）
- 文件：`Code/doc/ADR-001-architecture-and-stack.md`
- GitHub 仓：`ZhangHalfGod/Agents-Skill-Site`（已 push）
- S0 决策 04；阶段 1.1 完成；下一步初始化 `Code/code/`

## 2026-07-10 — v0.3

- **阶段 0 完成**：工程文档与 URI/矩阵/S0 方向约束齐备；本人确认启动阶段 1
- **阶段 1 开始**：创建实现根目录 `All_URI/Code/`
  - `Code/doc/`：开发过程技术跟踪（服务器清单、脚手架细节、待执行命令）
  - `Code/code/`：网站源码占位（待服务器信息与技术栈确认后初始化）
- 部署基线登记：阿里云 Ubuntu 22.04 + PM2；已有 `mechassist-api` / `mcp-faq` / `mcp-gaode`
- 阻塞项：端口、域名/IP、Nginx、访问策略、技术栈确认（见 `Code/doc/01-server-inventory.md`）

## 2026-07-10 — v0.2

- 新增系统级活文档 [`SYSTEM-DIRECTION.md`](SYSTEM-DIRECTION.md)（S0）
- 固化：治理层 vs 执行层、禁止角色 md 写部署 URL、禁止用纯 MCP 替代文档站
- `README.md` 将 S0 置顶；决策只追加 §8，改方向必留痕

## 2026-07-10 — v0.1

- 新建 `Agents_Skill/All_URI/` 工程文档包（**尚未创建网站工程代码**）
- 交付：`README`、`00-context`、`01-requirements`、`02-architecture`、`03-uri-registry`、`04-progress-plan`、`05-agent-skill-matrix`
- 下一出门条件：人工评审通过后启动阶段 1（创建 site 脚手架）

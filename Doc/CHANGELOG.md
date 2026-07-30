# CHANGELOG — All_URI

## 2026-07-30 — phase4 补记：模型分档实例化（pm/arch → deepseek-v4-pro）

- **top 档落地**：`openclaw.json` 中 pm/arch 的 `model` 改为 `deepseek/deepseek-v4-pro`（1000k ctx），Gateway 热加载免重启（pm 冒烟 session Model 列实证）；同 provider 免重注 key；其余角色维持 flash
- **CLI 边界实证**：改模型正路 = 编辑 `openclaw.json`（CLI 无 update 子命令）；`gateway restart` 在 Windows 报 `Unknown signal: SIGUSR1`（Unix 服务化路径）——并入公共 skill `openclaw-ops` 已知坑（不记 Lesson、不进周推，用户定）
- 契约同步：`agents.example.yaml`（分档 + 改法注释）、`03` §6.5 实测记录

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

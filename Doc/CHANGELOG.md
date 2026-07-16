# CHANGELOG — All_URI

## 2026-07-16 — sot-inplace（方案 B）

- **SoT 迁入本仓**：`Code/code/docs/**` 就地维护；废止外仓 `STANDARDS_ROOT` 日常 sync  
- S0 v0.4 · 决策 `2026-07-16-01`  
- `npm run generate`（`sync` 别名）只刷 manifest/侧栏  
- `docs/operations/` Lesson 模板 + 示例 `site-sot-inplace`  
- 去掉「请勿手改 / 同步自 standards」页头误导  


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

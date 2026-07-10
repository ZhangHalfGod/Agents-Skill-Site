# CHANGELOG — All_URI

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

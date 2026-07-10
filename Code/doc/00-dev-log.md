# 00 — 开发日志

> 只追加，不删改历史条目。

## 2026-07-10（续 12）— 阶段 1.5 完成；阶段 4 门禁落地

- 1.5：公网 `http://8.163.18.183/agents-skill/` 已验收；进度/CHANGELOG 标完成。
- 4.1～4.4：`sync` repo scan 刷新 manifest；`validate-manifest.mjs` 失败阻断 build；`/health/` + health.json；`08-release-checklist.md`。
- `prebuild` = sync && validate；本地 validate OK（8+11+10）。

## 2026-07-10（续 11）— 服务器 `npm run build` 无需 SKIP_SYNC

- 无 `STANDARDS_ROOT` 时 sync 自动跳过并警告，不再 exit 1。
- `deploy.sh` / `07-deploy.md` 改为直接 `npm run build`。

## 2026-07-10（续 10）— 登记现网 Nginx 修改点

- 实体文件：`/etc/nginx/sites-available/mechassist`（`sites-enabled` 软链已启用）。
- 同 server：`root`→MechAssist dist；`/`、`/api/voice/`、`/api`、`/auth` 不动。
- 本站：在 `/auth` 后、`# Gaode Project` 前新增 `location /agents-skill/`。
- 已写入 `07-deploy.md` §5、`deploy/nginx-agents-skill.snippet.conf`、`01-server-inventory.md`。

## 2026-07-10（续 9）— 部署主路径改为「服务器 git pull + 编译」

- 主流程：本机 push → ECS `git pull` → `npm run build`（无 standards 自动跳过 sync）→ `dist` 软链 → Nginx alias。
- `sync-standards.mjs`：无 STANDARDS_ROOT 时自动跳过，服务器无需 `SKIP_SYNC=1`。
- 根目录增加 `deploy.sh`；`07-deploy.md` 已改写。

## 2026-07-10（续 8）— 阶段 1.5 部署笔记（形态 α）

- 选定生产形态 **α**：Nginx `alias` → `/var/www/agents-skill-site/dist/`，无 PM2、不占 3010。
- 新增：`Code/doc/07-deploy.md`、`Code/code/deploy/nginx-agents-skill.snippet.conf`、β 备选 `ecosystem.config.cjs`。
- （已废止为默认）本机 rsync dist；现以服务器 git 编译为主。
- ECS 实操由本人执行；验收 URL：`http://8.163.18.183/agents-skill/`。

## 2026-07-10（续 7）— 阶段 3：Skills + Rules 正文打通

- Skills 1～11：同步 `SKILL.md` 正文 + 矩阵反向角色列表；相对 `./reference/*.md` 改为源路径提示（避免死链/非法 HTML）。
- Rules：扫描同步 L0×3 + L1×3 + L2×4（共 10 条 `.mdc` → 站点 md）。
- 侧栏：`sidebar.skills.generated.json` / `sidebar.rules.generated.json`。
- `npm run build` **通过**。阶段 3.1～3.5 基本完成；下一步：阶段 4 scan/validate 门禁，或 1.5 部署。

## 2026-07-10（续 6）— 阶段 2：八角色 MVP 挂载

- `sync-standards.mjs` 扩展：标准 8 角色主文档 + 6 附属 docs + 矩阵技能标签 + Cursor 运行指引。
- 技能标签跳转：为引用到的 7 个技能生成占位页（阶段 3 再同步 SKILL.md 正文）。
- 侧栏由 `sidebar.agents.generated.json` 生成；`agents/index` 编号墙已通。
- `npm run build` **通过**（技能链接需尾斜杠 `/`）。
- 阶段 2.1～2.5 基本完成；下一步：阶段 3 Skills/Rules 正文，或 1.5 部署笔记。

## 2026-07-10（续 5）— 阶段 1.4 content 挂载打通

- 新增 `Code/code/scripts/sync-standards.mjs`：从 `Agents_Skill/standards` 只读同步到 VitePress docs。
- 首个挂载页：`/agents/standard/Architect` ← `Architect.md`；产出 `docs/public/manifest.json`。
- `package.json`：`npm run sync`；`predev` / `prebuild` 自动同步。
- `npm run build` **通过**；约定见 `Code/doc/06-content-mount.md`。
- 阶段 1.4 完成；下一步：1.5 部署笔记，或阶段 2 补齐其余 7 角色。

## 2026-07-10（续 4）— VitePress 脚手架初始化

- 在 `Code/code/` 创建 VitePress 工程：`package.json`、`docs/.vitepress/config.mts`（`base: /agents-skill/`）。
- 页面：首页 + `/agents/` `/skills/` `/rules/` 占位。
- `npm install` + `npm run build` **通过**（vitepress 1.6.4）。
- 本地：`npm run dev` → `http://localhost:5173/agents-skill/`；`npm run preview` → `127.0.0.1:3010/agents-skill/`。
- 阶段 1.2 / 1.3 完成；下一步：部署笔记（1.5）或阶段 2 接入 Architect 等角色正文。

## 2026-07-10（续 3）— ADR-001 冻结架构与技术栈

- 新增 `Code/doc/ADR-001-architecture-and-stack.md`：锁定 VitePress、治理站分层、部署参数。
- GitHub：`ZhangHalfGod/Agents-Skill-Site` 已存在；S0 决策 04 已记。
- 阶段 1.1 完成；**下一步**：在 `Code/code/` 初始化 VitePress（`base: /agents-skill/`）。
- 换栈须新 ADR，禁止静默更换。

## 2026-07-10（续 2）— 实机 IP / Node / 端口确认

- 公网 IP：`8.163.18.183`；**暂无域名**。
- Node：`v22.2.1`（更正笔误「22.22.1」）。
- `ss -lntp`：`127.0.0.1:3001`、`3002`、`3003`（三 Node）；Nginx `:80`；sshd `:22`；Tailscale 在跑。
- `3002` = `mechassist-api`；`3001`/`3003` = 两个 mcp（名↔端口可选再查）。
- 本站端口建议**锁定 `127.0.0.1:3010`**（避开 3001–3003）；对外拟 `http://8.163.18.183/agents-skill/`。
- **仍缺**：技术栈确认（推荐选 A VitePress）、Nginx 子路径方案口头确认。
- 下一步：你确认「选 A + /agents-skill/ + 3010」→ 初始化 `Code/code/`。

## 2026-07-10（续）— 从 MechAssist 文档回填服务器基线

- 已阅读：
  - `MechAssist-Fusion/extern-api/doc/FAQ/阿里云_Ubuntu22_部署步骤.md`
  - `MechAssist-Fusion/extern-api/doc/阿里云_ECS_安全修复清单.md`
  - FAQ 目录 README / 版本映射（发布原则可复用）
- 已回填 `01-server-inventory.md`：Nginx 已装、Node 22.x、`mechassist-api`→`127.0.0.1:3002`、公网仅 80/443、部署根 `/var/www`、git pull 惯例。
- 新增 `04-security-alignment.md`：本站必须本机监听、不新开安全组端口。
- 拟定本站：`agents-skill-site` + `127.0.0.1:3010` + Nginx `/agents-skill/`（待确认）。
- **仍缺**：公网 IP/域名、`mcp-faq`/`mcp-gaode` 端口、`node -v` 精确值、技术栈确认。
- 下一步：你跑精简命令（`03-commands-to-run.md`）并确认「选 A + 子路径方案」→ 初始化 `code/`。

## 2026-07-10

- 阶段 0 标记完成；阶段 1 启动。
- 创建 `All_URI/Code/{doc,code}` 目录结构。
- 已知运行时基线：阿里云 Ubuntu 22.04；PM2 管理；声称 Node `22.22.1`（待 `node -v` 核对）。
- 已有 PM2 进程：`mechassist-api`、`mcp-faq`、`mcp-gaode`；模块 `pm2-logrotate`。
- **阻塞**：等待服务器清单补全（见 `01-server-inventory.md` / `03-commands-to-run.md`）后再定端口与部署路径。
- 下一步：你回填服务器信息 → 确认技术栈（VitePress / Astro）→ 在 `code/` 初始化工程。

# 00 — 开发日志

> 只追加，不删改历史条目。

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

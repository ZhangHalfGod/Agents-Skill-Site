# Code/doc — 开发过程技术跟踪

本目录记录**实现期**技术细节，与 `All_URI/Doc/`（工程规划）分工如下：

| 区 | 职责 |
|----|------|
| `All_URI/Doc/` | 方向、需求、架构原则、URI、进度、矩阵（改得少） |
| `All_URI/Code/doc/` | 服务器实况、选型落地、命令输出摘要、部署步骤、踩坑（改得多） |

## 更新约定

1. 每天开发结束：在 `00-dev-log.md` 追加一条。  
2. 服务器信息变更：只改 `01-server-inventory.md`（**脱敏**，不写密码）。  
3. 阶段技术决策：写入对应 `02-phase*.md`，重大决策同步 S0 §8。  
4. 禁止提交：SSH 私钥、API Key、数据库口令、完整 `.env`。

## 文档索引

| 文件 | 用途 |
|------|------|
| [README.md](README.md) | 本说明 |
| [00-dev-log.md](00-dev-log.md) | 开发日志 |
| [01-server-inventory.md](01-server-inventory.md) | 服务器清单（MechAssist 文档已回填大部分） |
| [02-phase1-scaffold.md](02-phase1-scaffold.md) | 阶段 1 技术细节 |
| [03-commands-to-run.md](03-commands-to-run.md) | 精简复核命令 |
| [04-security-alignment.md](04-security-alignment.md) | 现网安全策略对齐 |
| **[ADR-001-architecture-and-stack.md](ADR-001-architecture-and-stack.md)** | **架构与技术栈冻结** |
| [05-local-dev-notes.md](05-local-dev-notes.md) | 本地 dev/build 与 Nginx 草案 |
| [06-content-mount.md](06-content-mount.md) | standards → docs 同步约定（1.4） |

## 与 PM2 现有进程共存原则

当前服务器已有（截图 + 部署文档）：

| name | 用途 | 约束 |
|------|------|------|
| `mechassist-api` | Extern_API 后端，`127.0.0.1:3002` | **不得占用 3002**；新站独立 PM2 名 |
| `mcp-faq` | MCP FAQ | 端口待 `ss` 确认；勿对公网暴露 |
| `mcp-gaode` | MCP 高德 | 同上 |
| `pm2-logrotate` | 日志轮转模块 | 保持启用 |

新站建议：PM2 名 `agents-skill-site`；本机端口 `3010`（待确认）；Nginx 反代，**不新开安全组端口**。

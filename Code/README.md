# Code — 网站实现工程根

> 对齐 S0：[`../Doc/SYSTEM-DIRECTION.md`](../Doc/SYSTEM-DIRECTION.md)  
> 阶段：**1 立项与脚手架（进行中）**  
> 部署目标：阿里云 Ubuntu 22.04 + PM2 + Node **v22.2.1**  
> **技术栈冻结**：[`doc/ADR-001-architecture-and-stack.md`](doc/ADR-001-architecture-and-stack.md)

## 目录约定

```text
All_URI/
  Doc/                 # 工程级规划（方向、需求、URI、进度）— 已有
  Code/
    doc/               # 开发过程技术细节（本目录持续更新）
    code/              # 网站源码（阶段 1 起在此搭建）
```

| 目录 | 放什么 | 不放什么 |
|------|--------|----------|
| `doc/` | 服务器清单、选型 ADR、踩坑、部署步骤、端口约定 | 密钥、口令、私钥 |
| `code/` | 可构建的网站工程 | `node_modules`、`.env` 真密钥（用 `.env.example`） |

## 文档索引（Code/doc）

| 文件 | 用途 |
|------|------|
| [README.md](doc/README.md) | doc 区说明与更新约定 |
| [00-dev-log.md](doc/00-dev-log.md) | 开发日志（按日追加） |
| [01-server-inventory.md](doc/01-server-inventory.md) | 服务器与运行时清单（已从 MechAssist 文档部分回填） |
| [02-phase1-scaffold.md](doc/02-phase1-scaffold.md) | 阶段 1 脚手架技术细节与待决项 |
| [03-commands-to-run.md](doc/03-commands-to-run.md) | 精简复核命令（补 mcp 端口等） |
| [04-security-alignment.md](doc/04-security-alignment.md) | 与现网 ECS 安全清单对齐的本站门禁 |
| **[ADR-001-architecture-and-stack.md](doc/ADR-001-architecture-and-stack.md)** | **系统架构 + 技术栈冻结（后续开发必遵）** |

## 当前状态

- **阶段 1～4 完成**（含 ECS 上线与 validate 门禁）。  
- 生产：`http://8.163.18.183/agents-skill/`（形态 α）。  
- 本地：`cd Code/code && npm run build`（prebuild = sync + validate）。  
- 下一步：阶段 5 domains，或阶段 6 运行指引。

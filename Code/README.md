# Code — 网站实现工程根

> 对齐 S0：[`../Doc/SYSTEM-DIRECTION.md`](../Doc/SYSTEM-DIRECTION.md)  
> 阶段：**1 立项与脚手架（进行中）**  
> 部署目标：阿里云 Ubuntu 22.04 + PM2 + Node（待核对版本）

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

## 当前阻塞

**服务器端口与 IP 已齐。** 仅差口头确认：技术栈（推荐 **选 A VitePress**）+ 是否采用 `http://8.163.18.183/agents-skill/` → `127.0.0.1:3010`。  
确认后立即在 `code/` 初始化脚手架（URL 只写 Code/doc，不写 standards 角色 md）。

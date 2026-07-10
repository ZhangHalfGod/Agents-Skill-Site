# CHANGELOG — All_URI

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

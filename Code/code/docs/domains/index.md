---
title: "Domains"
description: 领域增强灰度入口
---

# Domains

领域增强目录（对齐 `standards/domains/`）。**common 浏览不依赖本区**；关闭开关后本站其余分区仍可用。

| 领域 ID | 名称 | 说明 | 状态 |
|---------|------|------|:----:|
| `mcp` | MCP | 工具契约、服务实现与 capabilities / tools.call 一致性 | 占位 |
| `ai-dialog` | AI Dialog | 意图路由、上下文编排、对话安全与兜底 | 占位 |
| `ptp-nmos` | [PTP / NMOS](/domains/ptp-nmos/) | 广播级 PTP、NMOS IS-04/05 与 AES67/ST 2110 联调门禁 | **灰度中** |
| `high-concurrency` | High Concurrency | 容量、弹性、限流熔断与可观测性 | 占位 |

### 开关

- 配置：`Code/code/site.config.json` → `domains.enabled` / `domains.active`
- 环境变量：`ENABLE_DOMAINS=0` 可强制关闭（优先于配置）

当前：`enabled`；灰度：`ptp-nmos`

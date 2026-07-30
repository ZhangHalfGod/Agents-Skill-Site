---
title: "OpenClaw 运维排查"
description: 本仓 docs 真源；直接编辑本页后 npm run generate
---

# OpenClaw 运维排查

bm 部署（Gateway + 命名 agent + cron + 飞书渠道）的异常排查与常规运维。
**主文件保持短**：cron error 三步排查法见 `docs/cron-troubleshooting.md`。

## 何时用

- cron 任务状态 error / 投递失败
- `openclaw` CLI 报 Gateway 1006 / 连接失败
- agent 无响应、模型报错、session 异常

## 可执行清单

- [ ] 先 `openclaw health` + `openclaw doctor` 拿整体状态（勿凭猜）
- [ ] cron error：按 [三步排查法](./docs/cron-troubleshooting.md) 定位，先看 `lastError` 再动手
- [ ] Gateway 掉线（18789 无监听）：`openclaw gateway run --force` 拉起；反复掉线评估 `openclaw gateway install` 服务化
- [ ] 改配置后确认 `openclaw doctor` 无新增告警

## 已知坑（bm 实证）

- CLI 偶发 `1006 abnormal closure`：`openclaw agent` 有 embedded 回退自动完成；`cron get/health` 等无回退，**重试一次**即可，连续失败才查 Gateway
- `cron get/run/edit` 只认 job **UUID** 不认名字（`cron list` 第一列）
- 同 session 内 agent 中断后续跑有效（重发消息会继续而非重来，2026-07-29 试点实证）
- **`openclaw gateway restart` 在 Windows 报 `Unknown signal: SIGUSR1`**：restart 走 launchd/systemd/schtasks 服务化路径（Unix 设计），Windows 上不可用；要重启用 `gateway run --force`（2026-07-30 实证）
- 改 `openclaw.json`（如 `agents.list[].model`）**Gateway 热加载免重启**（2026-07-30 实证，pm 换 pro 后 session Model 列即变）
- Windows PowerShell 5.1 读仓内文本必须 `-Encoding UTF8`：见 [powershell-utf8](../powershell-utf8/index.md)

## 分层正文（按需 @）

| 层级 | 路径 | 何时打开 |
|------|------|----------|
| L2 本页 | `docs/zh/skills/custom/common/openclaw-ops/index.md` | 默认清单 |
| L3 cron 排查 | [cron error 三步排查法](./docs/cron-troubleshooting.md) | cron error / 投递异常时 |

## 关联角色（矩阵反向）

**主要绑定**

- [OpsEngineer](/zh/agents/standard/OpsEngineer/)

## 在 Cursor 中使用本技能

1. `@` 引用：`docs/zh/skills/custom/common/openclaw-ops/index.md`
2. 或打开本页后按 checklist 执行（技能 5）

本站不执行模型推理。正文真源即本页 Markdown。

- **浏览本页**：`@` 上方列出的路径。
- **走 MCP**：`get_skill` → `@` 返回的 **`source`**（本仓 `docs/zh/...`）。

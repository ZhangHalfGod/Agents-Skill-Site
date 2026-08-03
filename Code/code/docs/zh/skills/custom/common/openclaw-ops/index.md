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
- [ ] 插件工具"未注册"自述：按 [五层门禁排查](./docs/plugin-tool-gates.md) 逐层验，别信 agent 自述
- [ ] 认证 401 先分清"谁的路径"：`openclaw models status --check` → `auth list --agent X` → 直连 provider API 验 key 真伪，再决定重注或重启（见下方「认证三层解剖」）
- [ ] 调 `openclaw agent` 一律走 `Code/orchestration/openclaw/invoke-openclaw-agent.cjs`（PS 5.1 argv 引号拆分 + stdout 乱码双免疫）
- [ ] 代码跳收尾查残留 server 进程（cursor-agent node 路径特征明显），有则按 PID 清杀；无头 Cursor CLI 里**禁跑 `npm rebuild`/`npm install`**（会按它自带 node 翻转原生模块 ABI）
- [ ] 改配置后确认 `openclaw doctor` 无新增告警

## 已知坑（bm 实证）

- CLI 偶发 `1006 abnormal closure`：`openclaw agent` 有 embedded 回退自动完成；`cron get/health` 等无回退，**重试一次**即可，连续失败才查 Gateway
- `cron get/run/edit` 只认 job **UUID** 不认名字（`cron list` 第一列）
- 同 session 内 agent 中断后续跑有效（重发消息会继续而非重来，2026-07-29 试点实证）
- **`openclaw gateway restart` 在未服务化时于 Windows 报 `Unknown signal: SIGUSR1`**：restart 走服务化路径（launchd/systemd/schtasks），裸跑 `gateway run` 时 Windows 无信号可用；**正解 = `openclaw gateway install` 服务化**（schtasks 计划任务，`gateway.vbs` 隐藏窗口无 cmd 框 + 登录自启），装好后 `gateway start/stop/status/restart` 全部可用（2026-07-30 bm 实证，restart 约 58s 属正常）；服务化前临时重启用 `gateway run --force`
- 改 `openclaw.json`（如 `agents.list[].model`）**Gateway 热加载免重启**（2026-07-30 实证，pm 换 pro 后 session Model 列即变）；**例外：`tools.profile` 热加载不接管**（日志只 `evaluating reload` 无 applied），必须重启 gateway（同日实证）
- Windows PowerShell 5.1 读仓内文本必须 `-Encoding UTF8`：见 [powershell-utf8](../powershell-utf8/index.md)
- **API key 注入三件套**（缺一不可）：① `setx` 用户级环境变量持久化（防丢）② `openclaw models auth paste-api-key --provider X`（默认 profile，gateway/飞书路径）③ `--agent <每个agent> paste-api-key`（各隔离 store，含 main）。掩码相同 ≠ 值完好，`models status` 里的掩码只是显示
- 改 env 类修复**必须重启 gateway** 才生效（只继承启动时刻环境；Windows 裸跑用 `gateway run --force`）；profile/store 类修复可能热加载，先验后重启
- 发现面 / OpenAPI 契约生成**只认单一真源**（如 registry LAYERS），PATH_FALLBACKS 仅兜底安全网；新增/变更路由必须同步注册真源，parameters 对齐真实 handler（2026-07-31 实证）
- 文档跳 agent **禁止自行调 feishu 工具**（双写/发布是编排者职责）；信封校验不合格 → 同跳重派附拒收原因，同跳 2 次不合格 → 飞书上报人工

## 认证三层解剖（401 排障顺序）

| 路径 | 凭据来源 | 排查要点 |
|------|---------|---------|
| 角色 agent（pm/arch 等）CLI+会话 | 各自隔离 store（`paste-api-key --agent X`） | `auth list --agent X` |
| main CLI（`openclaw agent --agent main`） | main 隔离 store | 未注入报 "No API key found" |
| main 飞书（channel 会话） | gateway 进程环境变量 / 默认 profile | env 失效 → 401 |

401 诊断顺序：`models status --check`（effective 来源）→ `auth list --agent X`（store 有无）→ 直连 provider `/v1/models` 验 key 真伪 → 再决定重注或重启。

## 分层正文（按需 @）

| 层级 | 路径 | 何时打开 |
|------|------|----------|
| L2 本页 | `docs/zh/skills/custom/common/openclaw-ops/index.md` | 默认清单 |
| L3 cron 排查 | [cron error 三步排查法](./docs/cron-troubleshooting.md) | cron error / 投递异常时 |
| L3 插件工具排查 | [插件工具五层门禁](./docs/plugin-tool-gates.md) | agent 自述工具"未注册"时 |

## 关联角色（矩阵反向）

**主要绑定**

- [OpsEngineer](/zh/agents/standard/OpsEngineer/)

## 在 Cursor 中使用本技能

1. `@` 引用：`docs/zh/skills/custom/common/openclaw-ops/index.md`
2. 或打开本页后按 checklist 执行（技能 5）

本站不执行模型推理。正文真源即本页 Markdown。

- **浏览本页**：`@` 上方列出的路径。
- **走 MCP**：`get_skill` → `@` 返回的 **`source`**（本仓 `docs/zh/...`）。

# Doc/phase4 — 第四期：跨项目记忆复用 + OpenClaw 编排总线契约

> **状态**：4A 已落地（本分支 `feature/phase4-memory-orchestration`）· 4B 契约定稿、最小两跳试点已跑通（2026-07-29；遗留：机制 A 验证）  
> **前提**：三期 Lesson 闭环 ✅ · OpenClaw 双 Bot（bm/Home）V1～V4 ✅（见外部仓 `MechAssist-Fusion/doc/remote-agent-openclaw/`）  
> **原则**：先计划后改代码；服从 [`../SYSTEM-DIRECTION.md`](../SYSTEM-DIRECTION.md)；编排运行时**不在本仓网站内**  
> **来源**：[../当前亮点与后续发展.md](../当前亮点与后续发展.md) 优先级 ①②

## 新对话从哪读

| 顺序 | 文件 | 用途 |
|:----:|------|------|
| 1 | **[00-context.md](00-context.md)** | **交接上下文（必读）** |
| 2 | [01-cross-project-memory.md](01-cross-project-memory.md) | 4A 设计定稿：scope 字段 + lessons:scan |
| 3 | [02-orchestration-contracts.md](02-orchestration-contracts.md) | 会话交接契约（6 角色交付物 schema） |
| 4 | [03-openclaw-route-table.md](03-openclaw-route-table.md) | 角色路由表 / 模型分层 / 回退 |
| 5 | [04-tool-registration.md](04-tool-registration.md) | MCP 服务 → OpenClaw tool 注册映射 |
| 6 | **[05-lesson-memory-loop.md](05-lesson-memory-loop.md)** | **跨项目记忆复用闭环全流程 Runbook（已实战验证）** |
| 7 | **[06-single-facade-hop-snapshot.md](06-single-facade-hop-snapshot.md)** | **SF-HS：单门面 MCP + 跳界快照（H3 Goal 灌包）** |
| 8 | **[07-run-dir-m0-card.md](07-run-dir-m0-card.md)** | **M0：飞书 presentation 卡指定 run-dir** |
| 9 | **[08-cost-ledger-schema.md](08-cost-ledger-schema.md)** | **成本台账字段草案（DeepSeek / Cursor）** |
| 10 | **[09-feishu-promote-pipeline.md](09-feishu-promote-pipeline.md)** | **飞书「同意升格」整包流水线** |

## 本目录文件

| 文件 | 状态 |
|------|:----:|
| [00-context.md](00-context.md) | ✅ |
| [01-cross-project-memory.md](01-cross-project-memory.md) | ✅ |
| [02-orchestration-contracts.md](02-orchestration-contracts.md) | ✅ |
| [03-openclaw-route-table.md](03-openclaw-route-table.md) | ✅ |
| [04-tool-registration.md](04-tool-registration.md) | ✅ |
| [05-lesson-memory-loop.md](05-lesson-memory-loop.md) | ✅ |
| [06-single-facade-hop-snapshot.md](06-single-facade-hop-snapshot.md) | ✅ |
| [07-run-dir-m0-card.md](07-run-dir-m0-card.md) | ✅ |
| [08-cost-ledger-schema.md](08-cost-ledger-schema.md) | ✅ 契约+脚本 |
| [09-feishu-promote-pipeline.md](09-feishu-promote-pipeline.md) | ✅ 契约 |

## 配套落点

| 路径 | 说明 |
|------|------|
| [`../../Code/code/scripts/lesson-scan.mjs`](../../Code/code/scripts/lesson-scan.mjs) | 4A 扫描脚本（`npm run lessons:scan`） |
| [`../../Code/orchestration/`](../../Code/orchestration/README.md) | 4B OpenClaw 配置样例 + 交接 Prompt 模板（`*.example`，无密钥） |
| [`../guides/local-openclaw-runtime-deploy.md`](../guides/local-openclaw-runtime-deploy.md) | **新机器本机大脑+手脚部署清单**（根 README 已挂） |
| [`../../Code/doc/phase4/`](../../Code/doc/phase4/) | 实现笔记 / 试点证据（落地时按日追加） |

## 一句话定位

```text
三期：单项目 Lesson → 蒸馏回灌（已建成）
四期 4A：跨项目 Lesson 聚类 → 升格建议 → 人工终审合入 common（全流程见 05）
四期 4B：OpenClaw session routing = Agent 通信协议；契约进本仓，运行时在部署侧
```

上级入口：[../README.md](../README.md)

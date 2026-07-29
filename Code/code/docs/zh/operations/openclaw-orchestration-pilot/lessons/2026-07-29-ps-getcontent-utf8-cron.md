---
id: 2026-07-29-ps-getcontent-utf8-cron
project: openclaw-orchestration-pilot
date: 2026-07-29
audience: rule
audience_guess: rule
target_id: ""
priority: P2
status: raw
scope: common
seen_in_projects: [openclaw-orchestration-pilot]
promoted_to: ""
related_agents: [OpsEngineer]
related_skills: []
---

# Lesson：PowerShell 读 UTF-8 消息文件喂 OpenClaw cron 必须显式 `-Encoding UTF8`

## 现象

注册 `weekly-lesson-digest` cron 时，用 `Get-Content -Raw` 读 UTF-8 中文消息文件再传给 `openclaw cron add --message`，存入 job 的 payload 全部乱码（`銆愭瘡鍛ㄤ换鍔°€`…）。

## 根因

Windows PowerShell 5.1 的 `Get-Content` **不指定 -Encoding 时按系统 ANSI（中文机 = GBK）解码**，把 UTF-8 字节流错读成 GBK 字符串；再经 CLI 以 UTF-8 发出即双重错码。仓库所有 `.md` 均为 UTF-8（无 BOM），在此类机器上默认必踩。

## 修复

- 读取一律 `Get-Content -Raw -Encoding UTF8`（PowerShell 7+ 默认 UTF-8 无此坑，bm 为 5.1）
- 已用 `openclaw cron edit <id> --message` 修正存量 job；`Code/orchestration/cron/README.md` 注册命令已内置该参数

## 验证

`openclaw cron get <id>` 回显 payload.message 为正常中文；下次 `cron run` 实推时再终验飞书侧渲染。

## 适用范围

scope=common：凡在 Windows PowerShell 5.1 上把仓内文本（消息/Prompt/信封）读进变量再喂给 CLI/HTTP 的场景均适用，不限 OpenClaw。

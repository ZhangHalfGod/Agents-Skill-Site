---
title: "PowerShell UTF-8 读写约定"
description: 本仓 docs 真源；直接编辑本页后 npm run generate
---

# PowerShell UTF-8 读写约定

在 **Windows PowerShell 5.1** 上读写本仓文本（UTF-8 无 BOM）时的防乱码约定。
一句话：**显式指定编码，永远不依赖默认**。

## 何时用

- 用 `Get-Content` 把仓内 `.md`/配置读进变量，再喂给 CLI / HTTP / 其他进程
- 用 `Set-Content` / `Out-File` 写仓内文件
- 任何「终端里看着正常、落盘/发出后乱码」的疑似编码问题

## 可执行清单

- [ ] 读取：`Get-Content <path> -Raw -Encoding UTF8`（5.1 默认按系统 ANSI=GBK 解码，UTF-8 必乱）
- [ ] 写入仓内文件：**优先用编辑器 / agent 文件工具**，不用 PS 重定向（`>` 是 UTF-16LE，`Set-Content -Encoding utf8` 在 5.1 会带 BOM）
- [ ] 必须 PS 写时：`[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))`
- [ ] 排查顺序：先确认**文件真实字节**（勿信终端显示——PS 控制台显示 UTF-8 也常乱，文件本身可能是好的）

## 拦截提示

- 典型乱码样例：`銆愭瘡鍛ㄤ换鍔°€`（UTF-8 被按 GBK 读）→ `请检查读取端是否显式 -Encoding UTF8`
- 症状「命令行参数里的中文到目标系统变问号」→ 同上，先查读文件的环节

## 备注

- PowerShell 7+（pwsh）默认 UTF-8，无此坑；本约定针对 5.1（bm 实测环境）
- 来源 Lesson：`docs/operations/openclaw-orchestration-pilot/lessons/2026-07-29-ps-getcontent-utf8-cron.md`（merged）

## 在 Cursor 中使用本技能

1. `@` 引用：`docs/zh/skills/custom/common/powershell-utf8/index.md`
2. 或打开本页后按 checklist 执行

本站不执行模型推理。正文真源即本页 Markdown。

- **浏览本页**：`@` 上方列出的路径。
- **走 MCP**：`get_skill` → `@` 返回的 **`source`**（本仓 `docs/zh/...`）。

## 关联角色（矩阵反向）

**推荐关联**

- [OpsEngineer](/zh/agents/standard/OpsEngineer/)
- [DevLead](/zh/agents/standard/DevLead/)

## 在 Cursor 中使用本技能

1. `@` 引用：`docs/zh/skills/custom/common/powershell-utf8/index.md`
2. 或打开本页后按 checklist 执行（技能 6）

本站不执行模型推理。正文真源即本页 Markdown。

- **浏览本页**：`@` 上方列出的路径。
- **走 MCP**：`get_skill` → `@` 返回的 **`source`**（本仓 `docs/zh/...`）。

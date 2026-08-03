---
id: 2026-08-03-ai-vg-web-ui-h3-stale-process
project: ai-virtual-glasses-web-ui
date: 2026-08-03
audience: agent
audience_guess: agent
target_id: "main"
priority: P2
status: raw
scope: project           # project | domain | common
seen_in_projects: []
promoted_to: ""
related_agents: [main]
related_skills: []
---

## 现象

1. H3 代码跳派遣 `invoke-cursor-agent.ps1`（-TimeoutSec 1200）后，进程约 30 分钟无输出、疑似僵死；需要用户人工提示「跳过等待」才进入 H4。防空转规则（连续 2 次无增量即停）与超时意识需更严格执行。
2. `collect-cursor-usage.cjs --run-dir ...` 的 stdout 经 PowerShell `>` 重定向落盘成 UTF-16 LE + BOM，导致 `append-cost-hop.cjs --usage-json` 读入时 `JSON.parse` 报 `Unexpected token`。后改用 `[IO.File]::WriteAllText(..., UTF8Encoding($false))` 重写才通过。

## 期望

- 长任务派遣后：poll 连续 2 次无增量即上报「子进程卡住」，不无限等；用户提示跳过等待时立即执行「代码已落盘则直接 H4」续跑路径。
- 任何 node 脚本 stdout 落盘 JSON 一律用 node 写文件或 `[IO.File]::WriteAllText` + UTF8 无 BOM；禁止 PowerShell `>` 重定向（会写 UTF-16 BOM）。

## 当时上下文

- 角色：main（编排者）
- 技能：openclaw 编排流水线（H3/H4 跳）
- 摘要：H3 Cursor 实现 web/ monorepo 完成后进程僵死；成本台账 JSON 因 BOM 解析失败一次。

## 建议沉淀形态

- [ ] 新 skill
- [ ] 扩写已有 skill checklist（openclaw 编排流水线：JSON 落盘规范 + 长任务 poll 上限）
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule
- [x] 仅项目内保留，不升格

## 证据

- run-dir：`D:\trae_git\Agents-Skill-Site\Code\doc\phase4\run-ai-vg-web-ui-route1-20260803\`
- H3 进程 poll 2 次 (no new output) 后仍运行 30m；用户 15:27 消息要求跳过等待。
- `append-cost-hop.cjs` 首次报 `SyntaxError: Unexpected token`（UTF-16 BOM）；重写 UTF-8 后 hop_count 4 记账成功。

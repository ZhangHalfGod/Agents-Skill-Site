---
id: 2026-08-04-ai-vg-ws-push-h3-launch-ps-args
project: ai-virtual-glasses-web-ui
date: 2026-08-04
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

1. `h3-run-wrapper.ps1` 内 `node register-h3-watch.cjs ... 2>&1 | Out-Null` 之后读
   `$LASTEXITCODE` 不可靠（本次读到空值），导致 wrapper 误入容错分支——但真正致命的是下一步：
2. wrapper 里 `powershell ... -File invoke-cursor-agent.ps1 -Goal $goal` 直接传含双引号的 Goal
   字符串（h3-goal.md 内 `"python -m jetson.http.server --config config/jetson.json"` 这类内嵌引号），
   PowerShell 5.1 把命令行传给子 powershell.exe 时**双引号被吞/截断**，invoke-cursor-agent.ps1
   收到残缺参数 → 表现为 wrapper「静默 exit 0、无 RUN agent= 输出、raw 不落盘、无 cursor 进程」。
   直接诊断跑 invoke 报 `Missing an argument for parameter 'Goal'`。
3. 绕过方式：把 Goal 单行化后 `-replace '"', "'"`（内嵌双引号改单引号）再传参，H3 立即正常启动
   （`RUN agent=...`、chatId、480s 超时均可见）。

## 期望

- 启动 H3 时：Goal 参数先做 `-replace '"', "'"` 归一化（或改从临时文件读 Goal，避免命令行传参）；
  wrapper 的 register 步骤用 `cmd /c` 或 `&` 捕获真实退出码，不要 `2>&1 | Out-Null` 后读 $LASTEXITCODE。
- 判定 H3 是否真的启动：看 stdout 是否出现 `RUN agent=` + `chatId=`，且 h3-dev.raw.txt 有增量；
  仅凭 wrapper exit 0 不可信。

## 当时上下文

- 角色：main（编排者，H3 启动回合）
- 技能：openclaw 编排流水线（H3 wrapper → invoke-cursor-agent.ps1）
- 摘要：run-ws-push-20260804 首次 wrapper 静默失败（exit 0 但未启动 agent）；两次诊断后定位
  PS5.1 传参双引号问题，写 h3-runner2.ps1（Goal 双引号→单引号）后一次成功；H3 完成 commit
  `950dee7 [AI生成] WsPush-H3-V1.0`，H4 独立复验 PASS。

## 建议沉淀形式

- [ ] 扩写已有 skill checklist（code-via-cursor-cli / 流水线 H3 启动：Goal 传参双引号归一化 + 启动判定）
- [x] 仅项目内保留，不升格

## 证据

- 失败复现：`h3-run-wrapper.ps1`（run-ws-push-20260804）exit 0 但无 agent 输出；直接调 invoke 报
  `Missing an argument for parameter 'Goal'`
- 修复：`h3-runner2.ps1`（`$goal -replace '"', "'"`）→ `RUN agent=... chatId=0254b76c...` 正常启动
- H3 结果：commit `950dee7`、h4-closed.json verdict=PASS、运行时 12/12（426/101/JSON/REST 200）

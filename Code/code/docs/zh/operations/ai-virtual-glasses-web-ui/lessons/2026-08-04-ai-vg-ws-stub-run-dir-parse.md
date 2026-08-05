---
id: 2026-08-04-ai-vg-ws-stub-run-dir-parse
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

1. M0 门禁调用 `resolve-run-dir.cjs --from-text` 时，把用户消息的换行折成了空格传参，导致正则 `run_dir\s*=\s*(.+)$` 整行吞入后续范围说明，`--mkdir` 在 `docs/pipeline/` 下建出嵌套垃圾目录树（`run-ws-stub-20260804 范围：仅 debug-console 增加 \ws\status …`），并污染 `git status`。改用脚本官方 `--path` 模式（同样过 allowRoots 校验）后才得到正确 runDir；事后用 8.3 短名 `rmdir /s /q` 清理。
2. 用 PowerShell `2>&1 | Out-File -Encoding utf8` 捕获 `invoke-openclaw-agent.cjs`（node spawnSync 收尾输出）stdout，中文被按 GBK 解码成乱码落盘（h1-pm.raw.txt 整体 mojibake，信封需人工重建）。H2 起先设 `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` 再捕获，正常。
3. `collect-cursor-usage.cjs --run-dir` 只把结果 JSON 打印到 stdout，**不落盘** cursor-usage.json；`append-cost-hop.cjs --usage-json` 直接 ENOENT。需把 collect 的 stdout 写入 run-dir 再 append（subscription 模式 usage_found=false 仍可记账为 0）。

## 期望

- `--from-text` 传参必须保留原文换行（run_dir= 独立成行）；若消息被折叠成单行，改走 `--path <绝对路径>` 模式，不要手拼文本。
- 捕获 node 脚本中文 stdout：先 `[Console]::OutputEncoding = [System.Text.Encoding]::UTF8` 再 `| Out-File -Encoding utf8`；或直接用 node 写文件。
- collect-cursor-usage 后先落盘 cursor-usage.json（node/UTF-8 无 BOM）再 append-cost-hop。

## 当时上下文

- 角色：main（编排者）
- 技能：openclaw 编排流水线（M0/H1/H2/H3/H4 跳）
- 摘要：US08 WebSocket 状态 stub 全程（H1 pm → H2 arch → M2 放行 → H3 cursor commit 8106655 → H4 复验通过闭环）；M0 解析失误产生垃圾目录，H1 raw 乱码致信封重建。

## 建议沉淀形态

- [ ] 新 skill
- [ ] 扩写已有 skill checklist（openclaw 编排流水线：resolve-run-dir 传参规范 + stdout 捕获编码规范）
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule
- [x] 仅项目内保留，不升格

## 证据

- run-dir：`D:\trae_git\AI_Virtual_Glasses\docs\pipeline\run-ws-stub-20260804\`
- 首次 resolve 输出 runDir 含「范围：仅 debug-console…」；`--path` 模式返回正确 `D:\trae_git\AI_Virtual_Glasses\docs\pipeline\run-ws-stub-20260804`
- h1-pm.raw.txt 乱码（GBK 解码），h2-arch.raw.txt 正常（UTF8 解码预设后）
- collect-cursor-usage 输出 usage_found=false 且未写文件；手动写 cursor-usage.json 后 append 成功，hop_count 3、failed_hops 0

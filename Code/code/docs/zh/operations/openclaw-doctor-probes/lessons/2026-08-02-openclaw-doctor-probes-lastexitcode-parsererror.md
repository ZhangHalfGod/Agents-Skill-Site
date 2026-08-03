---
id: 2026-08-02-openclaw-doctor-probes-lastexitcode-parsererror
project: openclaw-doctor-probes
date: 2026-08-02
audience: skill
audience_guess: skill
target_id: ""
priority: P1
status: raw
scope: project
seen_in_projects: [openclaw-doctor-probes]
promoted_to: ""
related_agents: [Architect, DevLead]
related_skills: [openclaw-ops]
---

# Lesson：PS 调子脚本 ParserError 时 $LASTEXITCODE 仍为 0——汇总判定会误 PASS

## 现象

openclaw-doctor-probes 扩展 doctor.ps1 按 profile 汇总 weather/tts/routing 探测（PASS/WARN/FAIL 分项表，任一 FAIL → exit 1）。实测 bm 时 `probe-weather.ps1` 因既有中文编码 ParserError 未真正执行，但 `$LASTEXITCODE` 保持 0 → doctor 把 weather 记为 PASS 且 detail 为空。原因：PowerShell 调用子脚本若在解析期失败（ParserError），`&` 调用不会设置 `$LASTEXITCODE`（该变量只反映外部程序退出码），残留上一次值。

## 期望

- 汇总/编排层判定子脚本成败不能只信 `$LASTEXITCODE`：对 `&` 调用包 try/catch（ParserError 会抛），或校验输出非空/含预期成功标记
- 判定矩阵建议：exit≠0 → FAIL；输出含 FAIL:/Error → FAIL；输出为空且无成功标记 → WARN；否则 PASS
- 遇 probe 自身 ParserError（编码问题）→ 记入 lesson 并修 probe 文件编码（本 run 未改 probe，属白名单外，已记录）

## 当时上下文

- 角色：编排者（H4 独立复验：实跑 doctor -Profile bm 验证分项表与退出码）
- 技能：openclaw-ops
- 摘要：doctor.ps1 +param(-Profile bm|home) +probe summary 段（~70 行）；M3/M4 文档同步；diff 3 文件 +76/-2；H4：分项表三行 + 汇总行 ✅、tts FAIL → exit 1 ✅、无参数 exit 0 无 probe 段 ✅、UTF-8+BOM 字节级核实 ✅

## 编排侧踩坑（同 run 记录）

1. **git diff 中文乱码显示假象**：diff 显示 doctor.ps1 头部 `[AI生成]`→`[AI鐢熸垚]` 疑似双重编码损坏；node 字节级检查确认文件 UTF-8+BOM 完好（git diff 在 GBK 控制台下对 UTF-8 文件产生显示假象）。**建议**：中文文件疑似编码损坏时，用 node/hexdump 读字节核实，勿凭 git diff 显示定罪。
2. **feishu_doc write 两次 400**：把工具返回的截断 token（含 `…`）直接当 doc_token 传 → 400；必须用完整 document_id（完整 22 位）。**建议**：复制 token 时核对完整性，或用返回 JSON 的 document_id 字段原值。
3. **H2 信封内嵌文件第 5 次出现**：arch 回复仅摘要、交付物+信封在文件内；main 提取归档。**强烈建议**：编排流程正式允许双通道 + 固定提取规则（已连续 5 run 出现，别再当异常）。
4. **H4 无参数用例首次 60s 超时**：doctor 基础段调 openclaw doctor/gateway status 较慢；加长 240s 后 exit 0 ✅。**建议**：H4 对慢命令的用例给足超时（240s+）。

## 建议沉淀形态

- [ ] 新 skill
- [x] 扩写已有 skill checklist（openclaw-ops：PS 子脚本成败判定矩阵；git diff 乱码先用字节核实；feishu token 完整性）
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- H4 独立复验（main）：`doctor.ps1 -Profile bm` → `=== probe summary (profile: bm) ===` + weather/tts/routing 三行 + `Result: 1 PASS, 1 WARN, 1 FAIL` + EXIT=1（tts FAIL 触发非零）；无参数 → EXIT=0 且无 probe 段；代码核对 5/5（ValidateSet / FAIL→exit 1 / $LASTEXITCODE≥3 / if($Profile) / 无绝对路径）
- 编码核实（node 字节级）：BOM=efbbbf；`[AI生成]...脚手架-V1.0`、`Feishu: 帮我在...` 均正确；mojibake 标记 0
- git diff：3 文件 +76/-2（doctor.ps1 +75/-1 实为 param+probe 段，docs README +2/-1，README +1）
- 产物：run-openclaw-doctor-probes-20260802（三跳信封/mcp-resolve/playbook-pack/h3 报告+信封/h4-*.cjs/m2-gate-sign.yaml）
- 本 session 2026-08-02（run-openclaw-doctor-probes-20260802）

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：
- 变更摘要：

【H3 看门狗·自动 H4】check-h3-done 已判定 H3 完成，请**立即**执行独立复验（H4），**禁止重跑 H3**。

## 指针
- run-dir: {{RUN_DIR}}
- repo: {{REPO_ROOT}}
- work-dir: {{WORK_DIR}}
- check reason: {{CHECK_REASON}}
- hints: {{CHECK_HINTS}}

## 你必须做的（SOUL「独立复验 H4」）
1. 先读 `<run-dir>/h3-dev.raw.txt` 与 `h3-status.json`（若有）确认交付面
2. 用**系统 node**在 `{{WORK_DIR}}` 或 `{{REPO_ROOT}}` 跑全量测试（pnpm test / vue-tsc 等，按 scope）
3. curl 关键端点（若验收条目要求）
4. `git status` / `git diff` 核对改动 ∈ 范围清单
5. 全过 → 写 `<run-dir>/h4-verify.raw.txt` + `<run-dir>/h4-closed.json`（含 passedAt、摘要），更新 `h3-watch.json` 的 `status` 为 `closed`；飞书回报闭环（≤一屏 + 交付物路径）
6. 任一不过 → 带证据打回 H3 **一次**（附 run-dir）；再不过上报人工

## 硬护栏
- 禁止 `npm install/rebuild`、禁止 `git push`、禁止全杀 node
- 成本：`append-cost-hop` H4 若适用

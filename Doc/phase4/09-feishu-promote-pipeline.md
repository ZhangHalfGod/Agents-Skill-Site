# 09 — 飞书「同意升格」整包流水线

> **日期**：2026-08-03  
> **状态**：契约已定 · 仓内脚本/SOUL 草稿已落地；须同步线上 `~/.openclaw/workspace/SOUL.md`  
> **服从**：[`05-lesson-memory-loop.md`](05-lesson-memory-loop.md) · [`../SYSTEM-DIRECTION.md`](../SYSTEM-DIRECTION.md) 2026-08-03-01  
> **一句话**：人在飞书回固定触发句 → main 按 digest 判决建议整包合入 → `generate`/`validate` → **本机 commit `develop`** → **不 push**，飞书请人推送。

---

## 1. 已定决策

| 项 | 结论 |
|----|------|
| 深度 | 方案 A：整包采纳 digest「判决建议」，写/补 skill + 注册清单 |
| Git | 允许 `git add` + `git commit`（仅经白名单脚本）；**禁止 `git push`** |
| 无触发 | 扫描脚本与 cron **仍禁止**自动改正文 |

## 2. 触发与防误触

| 用户消息 | 行为 |
|----------|------|
| 整句或以之为句首：`同意升格` / `执行本周升格` / `执行升格` / `同意蒸馏`（别名） | **仅**进入升格流水线 |
| `放行` / `同意` / `OK` / `可以` / `继续`（H3） | **不**进升格 |
| 升格触发句 | **不**启动 H3 / Cursor invoke |

digest 无待升格条目 → 飞书回复「无可升格卡」后结束。

## 3. 流程

```text
飞书「同意升格」
  → lesson-scan --format digest
  → 逐条读卡 + 采纳判决建议（无建议默认 distilled + 骨架目标路径）
  → 写/补 skill 或 rejected 留档（见 §4）
  → 痕迹落 Code/doc/phase4/run-promote-YYYYMMDD/
  → cd Code/code && npm run generate && npm run validate && node scripts/lesson-scan.mjs --strict
  → node …/promote-commit.cjs（develop-only）
  → 飞书：摘要 + commit=<hash> + 请人 push
```

契约详情与 SOUL 步骤：[`Code/orchestration/prompts/orchestrator-main-soul.draft.md`](../../Code/orchestration/prompts/orchestrator-main-soul.draft.md)「升格流水线模式」。

## 4. 判决映射

| 判决建议 | 动作 |
|----------|------|
| `rejected` | 卡内写理由；`status: rejected` |
| `distilled` 且目标为既有 skill | **并入**该 skill checklist/正文 → `status: merged` + `promoted_to` |
| `merged` 且目标不存在 | 按 [`05`](05-lesson-memory-loop.md) §⑤ **新建**并走注册清单 → `merged` |
| 建议明确写「不改正文」 | 仅 `status: distilled`，不改正文 |

## 5. Git 边界（`promote-commit.cjs`）

- 仓根：Agents-Skill-Site；**必须**当前分支 `develop`
- 仅 stage 前缀：`Code/code/docs/`、`Code/code/scripts/`、`Code/doc/phase4/`、`Code/orchestration/`、`Doc/CHANGELOG.md`、`Doc/phase4/`、`Doc/SYSTEM-DIRECTION.md`（其它脏文件跳过不入 commit）
- commit 前缀：`chore(lessons): feishu-promote <YYYY-MM-DD>`
- **永不** `git push`；stdout：`commit=<hash>`

脚本：[`Code/orchestration/openclaw/promote-commit.cjs`](../../Code/orchestration/openclaw/promote-commit.cjs)

## 6. 部署侧（线上 SOUL）

本仓只更新 **草稿**。bm（及每台大脑）须把「升格流水线模式」段**追加/替换**进：

`~/.openclaw/workspace/SOUL.md`

未同步则飞书触发句不会按本契约执行。

## 7. 明确不做

- 自动 push / 自动开 PR  
- 飞书按钮卡（形态 B）  
- 无「同意升格」时的自动改正文  
- 改业务仓（MechAssist 等）

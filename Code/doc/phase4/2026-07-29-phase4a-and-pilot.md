# 2026-07-29 — 4A 落地 + 4B 最小两跳试点

> 分支：`feature/phase4-memory-orchestration`。执行：本机 Cursor + bm OpenClaw Gateway。

## 1. 4A 落地清单

| 项 | 落点 | 状态 |
|----|------|:----:|
| Lesson Card v2（scope / seen_in_projects / promoted_to） | `Code/code/docs/zh/operations/_template/lessons/_lesson-card.template.md` | ✅ |
| phase3 规范同步（模板 + 决策树跨项目分支） | `Doc/phase3/03-lesson-card-and-operations.md` §3/§5 | ✅ |
| 存量回填（3 条） | ecs-deploy-host404=common、stage-gate-exit-evidence=common、site-sot-inplace=project | ✅ |
| 扫描脚本 + npm script | `Code/code/scripts/lesson-scan.mjs`；`npm run lessons:scan` | ✅ |
| `--strict` 自检 | 坏卡（缺 scope / priority P9 / merged 无 promoted_to）→ exit 1 阻断 ✅；好卡全过 | ✅ |
| SOP 挂钩 | operations README（触发句/决策/收尾清单）+ PR 模板勾选项 | ✅ |

## 2. 4B 最小两跳试点（PM → Architect）

**环境**：bm Gateway `127.0.0.1:18789`（probe ok）；默认模型 `deepseek/deepseek-v4-flash`（已 configured + default）；试点需求 = `weekly-lesson-digest`（每周一 09:00 lessons:scan 升格建议摘要推飞书，即路由表 §5 的 Cron 扩展）。

| 跳 | 命令 | 耗时 | 产出 |
|----|------|------|------|
| 冒烟 | `openclaw agent --agent main --message "你好，请只回复：pong"` | ~20s | pong（模型 auth ok） |
| H1 | `openclaw agent --agent main --message <PM persona + 需求 + 契约>` | ~30s（首轮曾被中断，同 session 重发续跑成功） | [pilot/AI代码生成范围清单_weekly-lesson-digest.md](pilot/AI代码生成范围清单_weekly-lesson-digest.md)（125 行）+ H1 信封 |
| H2 | 同上（Architect persona + H1 交付物 + 决策/悬置） | ~97s | [pilot/架构约束与接口_weekly-lesson-digest.md](pilot/架构约束与接口_weekly-lesson-digest.md)（194 行）+ H2 信封 |

信封存档：[pilot/handoff-h1.envelope.yaml](pilot/handoff-h1.envelope.yaml) · [pilot/handoff-h2.envelope.yaml](pilot/handoff-h2.envelope.yaml)

**契约符合性**：两份交付物必备章节齐全；H1 悬置 q001~q003 → H2 全部收口（d005~d007）；信封必填字段完整，`gate.evidence` 具体可查。

## 3. 试点 Lesson 已走 4A 流程

- `operations/openclaw-orchestration-pilot/lessons/2026-07-29-main-agent-persona-injection.md`（raw，**scope=common 实战**）
- `npm run lessons:scan` 验证：看板 4 项目；该条进 stage-gate-flow 聚类并列入升格建议清单；`--strict` 4 条全合法
- 终审结论（本次人工）：**仅项目内保留**——卡片已勾选；待机制 A 验证 + 更多重复后再议升格。建议清单与人工结论可以不一致，这正是「扫描建议、人终审」的设计

## 4. 试点期模型绑定（用户决策）

全部角色（pm/arch/ui/dev/test/sec/ops/main）统一绑 `deepseek/deepseek-v4-flash`；意图分层（top/mid/econ）留 `model_tier` 字段，用户后续自行分档。已同步：`Code/orchestration/openclaw/agents.example.yaml`、`Doc/phase4/03` §2。

## 5. 遗留（下一轮）

| 项 | 归属 | 状态 |
|----|------|:----:|
| ~~机制 A 验证：命名 agent 注册、per-agent 模型绑定~~ | OpenClaw 部署侧 | ✅ 2026-07-29 下午实测通过（`Doc/phase4/03` §6；7 角色 agent 已建齐） |
| ~~q004/q005（Gateway Cron 注册入口、是否加 `lessons:digest` npm 别名）~~ | 同上 | ✅ 定案：`cron add`；`--command-argv`+`--command-cwd`；别名非必需 |
| ~~H2 的 lesson_hint（cron cwd 坑）~~ | 同上 | ✅ `--command-cwd` 原生解决 |
| 每周 lessons:scan 摘要推飞书（pilot 需求本身的实现） | ~~H3 立项~~ | ✅ 2026-07-29 以形态 A（cron agent 消息任务）落地 bm：周一 09:00，干跑验证；消息/运维见 `Code/orchestration/cron/`，形态选型见 `Doc/phase4/03` §6.4；2026-08-03 首跑待实推终验 |
| 信封 schema 机器校验（v1 为编排 Prompt 软校验） | 四期后续 | 待启动 |
| mcp 挂接字段级验证（`openclaw mcp add` 形态/auth） | OpenClaw 部署侧 | 待启动 |

# 05 — 跨项目记忆复用闭环全流程（Runbook）

> **状态**：✅ 已全链路实战验证（2026-07-29 首跑，skills 11→13）
> **一句话**：项目里记的每条 Lesson，自动进每周升格建议推送到飞书；人拍板后，common 级教训升格进公共 skill 库——下一次任何项目都能 `@` 到。
> **服从**：[`../SYSTEM-DIRECTION.md`](../SYSTEM-DIRECTION.md)（蒸馏靠人判断；MCP 只读；网站不是运行时）

## 全景

```text
项目工作踩坑
  └─ ① 记 Lesson Card（Code/code/docs/zh/operations/<project>/lessons/*.md，raw）
        └─ ② 扫描 npm run lessons:scan（聚类 + 升格建议清单）
              └─ ③ 每周一 09:00 OpenClaw cron → 飞书群【每周升格建议】
                    └─ ④ 人工终审（逐条拍板：merged / distilled / rejected）
                          └─ ⑤ 升格执行（merged → 新/更新公共 skill + 注册；rejected → 注理由+抢救）
                                └─ ⑥ 门禁收尾（generate / validate / scan --strict / commit / push）
                                      └─ 站点 + MCP manifest 自动反映 → 下个项目的 agent 可直接 @ 到
```

关键分工：**机器负责发现与提醒（②③），人负责判断（④），机器负责搬运与校验（⑤⑥）**。agent 在周推里给的「判决建议」只是草稿，不替人拍板。

---

## ① 记卡（任何项目、任何阶段）

- 模板：`Code/code/docs/zh/operations/_template/lessons/_lesson-card.template.md`
- 落点：`Code/code/docs/zh/operations/<project-id>/lessons/YYYY-MM-DD-short-slug.md`
- frontmatter 关键字段（v2）：
  - `status`：`raw → distilled → merged / rejected`
  - `scope`：`project | common`——common 才会进升格建议（拿不准先猜，终审再改）
  - `seen_in_projects`：多项目复现过的坑更有升格价值
  - `promoted_to`：merged 后回填目标文档路径（traceability 链）
- 正文必须含 H1 标题（`# Lesson：...`）——周推骨架靠它取标题（`extractTitle`）
- 出门检查：`stage-gate-flow` 清单已挂钩「本阶段 Lesson 已写入或勾选无新教训」

## ② 扫描（随时可跑）

```bash
cd Code/code
npm run lessons:scan                    # 看板 + 聚类 + 升格建议
npm run lessons:scan -- --strict        # frontmatter 校验，CI/PR 可阻断
npm run lessons:scan -- --format digest # 确定性周推骨架（cron 用）
```

- 建议规则：`status ∈ {raw, distilled}` 且 `scope = common` → 建议升格（目标按 audience 推断）
- PR 模板有对应勾选项（`.github/PULL_REQUEST_TEMPLATE.md`）

## ③ 每周推送（OpenClaw cron agent 消息任务）

- job：`weekly-lesson-digest`（bm；`cron get/run` 只认 UUID，见 `Code/orchestration/cron/README.md`）
- 节奏：周一 09:00；`--to <简报群> --announce --channel feishu`（复用既有投递通道，零新凭据）
- **v3 消息契约**（`Code/orchestration/cron/weekly-lesson-digest.message.md`）：
  1. agent 先跑 `npm run lessons:scan -- --format digest`（确定性文本，杜绝 LLM 摘要漏条目）
  2. 骨架**原样转发**，逐字不改
  3. 每条后追加一行「判决建议：merged/distilled/rejected — 一句话理由」（试探性草稿）
- 无建议时发空态消息（含 raw/distilled/merged 计数）——链路存活的信号
- 为什么不用 webhook 脚本：对比表见 [`03-openclaw-route-table.md`](03-openclaw-route-table.md) §6.4

## ④ 人工终审（飞书消息 → 逐条拍板）

- 审阅对象：仓里对应的 Lesson 卡全文（不是只看推送）
- 每张卡拍两个板：**判决** + （若 merged）**合入目标**
- 推荐模式：逐条细审——每卡给「正文要点 + 建议 + 理由」，人逐条确认（2026-07-29 首跑即此模式）
- agent 的判决建议可采纳也可推翻（首跑 3 条中 2 条被改为更积极的 merged）

## ⑤ 升格执行

### merged → 公共 skill 注册清单（照此逐项走）

1. 写文档：`Code/code/docs/zh/skills/custom/common/<slug>/index.md`（+ 需要时 `docs/<detail>.md`，页头注明来源 Lesson）
2. `scripts/sync-standards.mjs`：
   - `SKILL_META` 加条目（label / labelEn / uri）
   - `STANDARD_SKILLS` 加条目（index 顺插、后续序号顺移；summary / boundAgents / recommendedAgents）
   - 相关 agent 的 `skills` / `skillsRecommended` 绑定
3. `scripts/validate-manifest.mjs`：`EXPECTED_SKILLS` 加一行（数量断言已改为跟随列表长度，无需改数字）
4. `scripts/en-skill-bodies.mjs`：英文全文（缺了只 warn，但补齐）
5. `scripts/en-agent-bodies.mjs`：相关角色 EN 正文 Bound skills 加条目
6. 双语索引：`docs/zh/skills/index.md` + `docs/skills/index.md` 各加一行（序号顺移）
7. 角色 zh 页（手写 SoT）：必显/推荐 bullet + `RunGuide :skills` JSON
8. Lesson 卡回填：`status: merged` + `promoted_to: <目标路径>`

### distilled

卡留档（`status: distilled`），不建公共文档；出现在后续周推里继续提醒，直到 merged 或 rejected。

### rejected

- 卡内注明 rejected 理由（日期 + 为什么）
- **抢救检查**：与判决无关但仍成立的发现，挪进对应长效文档再拒（首跑实例：「同 session 中断续跑有效」挪进 `03` §6.1）

## ⑥ 门禁收尾

```bash
cd Code/code
npm run generate                        # 重刷 manifest / 侧栏 / EN 页（skills 计数随之更新）
npm run validate                        # 应 OK（agents=8 skills=N rules=10）
node scripts/lesson-scan.mjs --strict   # 卡 frontmatter 合法
git add -A && git commit && git push
```

- validate 会顺带刷新站点健康页（Skills 计数（期望 N））
- 部署：服务器 pull + build 后站点可见；MCP manifest 同源更新

## 首跑实例（2026-07-29）

| 卡 | 判决 | 落点 |
|----|------|------|
| `2026-07-29-cron-error-model-snapshot-diag` | merged | 新建 `common/openclaw-ops/`（cron error 三步排查法） |
| `2026-07-29-ps-getcontent-utf8-cron` | merged | 新建 `common/powershell-utf8/` |
| `2026-07-29-main-agent-persona-injection` | rejected | 机制 A 已验证取代注入路径；半条抢救进 `03` §6.1 |

结果：skills 11→13，建议清单归零（raw 0 · merged 5 · rejected 1），generate/validate/strict 全绿。

## 文件索引

| 路径 | 说明 |
|------|------|
| `Code/code/docs/zh/operations/_template/lessons/_lesson-card.template.md` | 卡模板（v2 字段） |
| `Code/code/scripts/lesson-scan.mjs` | 扫描 / 聚类 / 建议 / digest 出口 |
| `Code/orchestration/cron/` | 周推消息模板 + 注册运维说明（含 job UUID） |
| `Code/code/docs/zh/operations/README.md` | 状态机、scope 判断、升格操作步骤 |
| [`01-cross-project-memory.md`](01-cross-project-memory.md) | 4A 设计定稿（为什么这样设计） |

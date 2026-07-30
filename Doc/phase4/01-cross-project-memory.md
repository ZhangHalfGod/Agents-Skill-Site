# 01 — 跨项目记忆复用设计（4A 定稿）

> **文档级别**：四期设计（已落地，本文即定稿）  
> **日期**：2026-07-29  
> **实现**：[`../../Code/code/scripts/lesson-scan.mjs`](../../Code/code/scripts/lesson-scan.mjs) · `npm run lessons:scan`  
> **决策**：D1 = 规范 + 半自动扫描（见 [`00-context.md`](00-context.md) §2）

---

## 1. 问题与解法

三期 Lesson 按项目隔离：`operations/<project>/lessons/` 之间互不感知，同一教训（如「部署验收证据分层」已在 2 个项目各踩一次）靠人记性发现。4A 加三块：

1. **卡片字段**：raw 时人工初判「适用范围」，merged 时强制登记合入路径
2. **半自动扫描**：跨项目聚类 + 升格建议清单（只读）
3. **SOP 挂钩**：触发句、收尾清单、PR 模板把扫描变成习惯动作

## 2. Lesson Card v2 字段

模板：[`../../Code/code/docs/zh/operations/_template/lessons/_lesson-card.template.md`](../../Code/code/docs/zh/operations/_template/lessons/_lesson-card.template.md)

| 字段 | 取值 | 谁填 | 说明 |
|------|------|------|------|
| `scope` | `project` \| `domain` \| `common` | raw 时人初判；终审可改 | `common` = 适用于所有类似项目 |
| `seen_in_projects` | 项目 id 列表 | 人 / 扫描辅助 | 同一教训出现在哪些项目；聚类时核对回填 |
| `promoted_to` | 合入路径 | **status=merged 时必填** | 替代仅靠蒸馏笔记自由文本；`--strict` 强制 |

存量 3 条已回填：`ecs-deploy-host404`、`stage-gate-exit-evidence`（均 `scope: common` → `deploy-verify.md`）；`site-sot-inplace`（`scope: project` → S0 §8）。

## 3. 聚类规则（lesson-scan.mjs）

优先级从高到低，命中即归组：

| 级 | 键 | 说明 |
|---|----|------|
| 1 | `target_id` | 非空即按它归组（最可靠） |
| 2 | `related_skills[0]` | 无 target_id 时退到主技能 |
| 3 | slug 关键词 | 去日期/停词后，**跨项目**共享 ≥2 个关键词的列「相似提示」对，人工核对 |

组内 Lesson 来自 **≥2 个项目** → 标「跨项目 ⚠」。

## 4. 升格建议规则

进入建议清单的条件（仅 `raw` / `distilled` 参与）：

| 条件 | 建议原因 |
|------|----------|
| `scope=common` | 人工已判通用，等终审 |
| 所在聚类跨 ≥2 项目 | 重复踩坑，建议升格到 `docs/zh/skills/custom/common/<target_id 或主技能>/` |

`merged` 且 `scope=common` 的进「已升格」参考区，供检索不再当待办。

## 5. 使用与门禁

```powershell
cd Code/code
npm run lessons:scan                        # markdown 报告到 stdout（可重定向存 Code/doc/phase4/ 作证据）
node scripts/lesson-scan.mjs --strict       # 校验 frontmatter；违规 exit 1（可挂 CI/PR）
```

`--strict` 校验项：id/date/status/scope/priority/audience 枚举合法；`status=merged` 必须填 `promoted_to`。

挂钩位置（A3 已落）：

- 触发句：「记一条 lesson：…。适用范围 project|domain|common。…」
- operations README 收尾清单：新增「已跑 lessons:scan，跨项目重复项已标 scope 并终审」
- PR 模板「治理沉淀」：新增同款勾选项

## 6. 真实运行样例（2026-07-29 本仓）

```text
## 状态看板：3 项目各 1 merged，合计 3
## 聚类报告：stage-gate-flow（跨项目 ⚠）
  - [merged] ecs-deploy-host404/...nginx-host-false-404 — scope=common
  - [merged] stage-gate-exit-evidence/...mcp-health-not-host-curl — scope=common
## 升格建议清单：（本轮无——两条均已 merged）
```

存量两条同属 `stage-gate-flow` 聚类且都已升格，报告正确给出「无待终审」。

## 7. 终审流程（不变，仅多一步）

```text
lessons:scan 出建议 → 人核对（是否同一教训？目标路径对吗？）
  → Lesson raw → distilled → 改 skills/custom/common/** 正文
  → promoted_to 登记路径 → merged → npm run generate + validate → commit
```

**禁止**：用扫描结果直接改可复用正文；禁止给扫描脚本加写能力。

## 8. 已知边界与后续

| 边界 | 说明 |
|------|------|
| 跨仓不可见 | `MechAssist-Fusion/doc/iterations/**/lessons/` 有同类卡片（如 openclaw-feishu-v1 四条）；扫描暂只读本仓。后续可让脚本支持多根目录，或两仓各自扫描后人工对照 |
| 聚类是启发式 | target_id 规范填得越勤，聚类越准；slug 关键词只是提示，误判靠人工核对消化 |
| 无自动回填 | `seen_in_projects` 暂人工维护；若 Lesson 量上来，再考虑 `--write-seen`（须先过 S0 评审） |

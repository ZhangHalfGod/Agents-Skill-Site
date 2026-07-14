# 03 — Lesson Card 与 operations 约定

> **文档级别**：三期设计  
> **日期**：2026-07-14  
> **执行**：见 [`02-execution-plan.md`](02-execution-plan.md) 阶段 A/B/D

---

## 1. 为什么要 operations

S0：**模板与实例分离**——项目实例进 `operations/`，不回写污染 `common/`。

| 层 | 路径（建议） | 可变性 |
|----|--------------|--------|
| 模板 | `standards/common/**` | 慢变、可复用 |
| 领域 | `standards/domains/**` | 中变、域内复用 |
| 实例 | `standards/operations/<project-id>/**` | 快变、项目绑定 |

Lesson 属于**实例**；蒸馏后才升格到 common/domains。

> 实际目录以仓库现有 `standards/` 布局为准；若尚无 `operations/`，阶段 A 创建。站点公网挂载可仍默认关闭。

---

## 2. 目录建议

```text
standards/operations/
  README.md
  _template/
    lessons/
      _lesson-card.template.md
  <project-id>/
    meta.md                 # 可选：项目一句话、时间、负责人
    lessons/
      2026-07-14-short-slug.md
```

`project-id` 示例：`macair-phase3-bootstrap`、`bmwork-foo-service`。

---

## 3. Lesson Card 模板（复制用）

```markdown
---
id: 2026-07-14-short-slug
project: <project-id>
date: 2026-07-14
severity: skill | agent | rule | unknown
severity_guess: skill
target_id: ""          # 已知则填 skill/agent/rule id
severity: P2             # P0|P1|P2|P3
status: raw            # raw | distilled | merged | rejected
related_agents: []     # 可选
related_skills: []     # 可选
---

## 现象

（做了什么、哪里不对或重复劳动）

## 期望

（下次应怎样）

## 当时上下文

- 角色：
- 技能：
- 摘要：（禁止密钥、Token、内网密码）

## 建议沉淀形态

- [ ] 新 skill
- [ ] 扩写已有 skill checklist
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- PR / commit / issue：

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：
- 变更摘要：
```

---

## 4. 状态机

```text
raw ──蒸馏──► distilled ──合入 standards──► merged
                 │
                 └──评审否决──► rejected
```

| 状态 | 含义 | 谁改 |
|------|------|------|
| `raw` | 现场记录 | 任何人 / Agent 代写文件 |
| `distilled` | 已提炼可合入文案 | 人审 + 可协助起草 |
| `merged` | 已进 common/domains，并 sync | 须 Git commit |
| `rejected` | 不升格（一次性问题） | 人审 |

---

## 5. 升格决策树

```text
可复用 SOP / checklist？ ──是──► Skill（默认）
        │
        否：角色职责或绑定错了？ ──是──► Agent + 矩阵
        │
        否：重复违规且须强制？ ──是──► Rule L2（慎 L1；极慎 L0）
        │
        否──► rejected 或仅留 operations
```

占比提醒：优先 Skill；Agent 次之；Rules 最少。

---

## 6. 捕获触发

### 6.1 对话触发句（推荐）

```text
记一条 lesson：<一句话现象>。项目 <project-id>。按 operations Lesson Card 模板写入文件。
```

### 6.2 阶段门禁（建议文案）

```text
[ ] 本阶段已新增 Lesson Card，或勾选「本阶段无新教训」
```

### 6.3 PR 检查（建议文案）

```text
## 治理沉淀
- [ ] 无（一次性）
- [ ] 已写 operations/.../lessons/...
- [ ] 本 PR 已回灌 skill/agent/rule（说明路径）
```

---

## 7. 脱敏

Lesson / 蒸馏稿 **禁止**包含：

- MCP Token、云密钥、私钥  
- 未授权的客户数据  
- 可直接打到生产的内网地址 + 凭证组合  

公网站点若未来挂 operations，默认仅摘要或关闭。

---

## 8. 与 MCP 的关系

- 近期：Lesson **不**经 MCP 写入；Agent 写工作区文件即可。  
- 可选：只读 `list_lessons` 列出 frontmatter，便于收尾检索。  
- `get_skill` / `get_agent` 继续只返回索引；正文仍 `@` 磁盘文件。

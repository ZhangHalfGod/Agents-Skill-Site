# 00 — 第三期交接上下文（新对话必读）

> **文档级别**：三期交接（服从 S0）  
> **日期**：2026-07-14｜**修订**：2026-07-16（本仓 docs 就地 SoT）  
> **用途**：在本目录新开 Cursor 对话时，**先读本文件**，再读执行计划。  
> **上级**：[`README.md`](README.md) · S0 [`../SYSTEM-DIRECTION.md`](../SYSTEM-DIRECTION.md)

---

## 1. 仓库身份

| GitHub | 角色 |
|--------|------|
| **[`ZhangHalfGod/Agents-Skill-Site`](https://github.com/ZhangHalfGod/Agents-Skill-Site)**（本仓） | **发现站 + MCP + 治理正文 SoT**（`Code/code/docs/**`）+ 工程文档 |
| 个人 fork（例：`MacAirM4/Agents-Skill-Site`） | 私人迭代；`upstream` → 本仓 |
| 公司 fork（OrgFork，计划） | 组织变体；独立部署 / 独立 manifest |

### 1.1 真源与生成物（必读）

```text
Code/code/docs/**          ← SoT（直接改 Markdown）
  agents / skills / rules / domains / operations
         │
         │  npm run generate
         ▼
  public/manifest.json + sidebar.*.generated.json
         │
    ┌────┴────┐
    ▼         ▼
  网站      MCP（只读索引）
```

| 改什么 | 路径 | 备注 |
|--------|------|------|
| Agent / Skill / Rule 正文 | `Code/code/docs/**` | Git commit 本仓即可 |
| Lesson（项目实例） | `Code/code/docs/operations/<project>/lessons/` | 先 raw，再蒸馏升格 |
| 索引 / 侧栏 | `npm run generate` | **不**覆盖技能/规则正文 |
| 站点、MCP、Doc/phase* | 本仓 | 同仓维护 |

> **历史**：曾用外仓 `agents-skill-standards` + `STANDARDS_ROOT` sync。自 2026-07-16 起日常流程废止（S0 §8 `2026-07-16-01`）。

三期第一闭环：本仓跑通「Lesson → Skill 回灌」；通用沉淀再 PR 上游。

---

## 2. 一二期已完成什么

| 期 | 状态 | 要点 |
|----|:----:|------|
| **一期** | ✅ 验收 | VitePress 站、`manifest`、validate/health、domains 灰度（ptp-nmos）、运行指引 |
| **二期** | ✅ MVP | MCP 只读同源索引；stdio + **远程 HTTP MCP**（Nginx + Bearer Token） |

**公网（已部署）**

- 网站：`http://8.163.18.183/agents-skill/`
- MCP：`http://8.163.18.183/agents-skill-mcp/mcp`（需 Token）

手册：`Code/mcp-remote/CURSOR-SETUP.md` · 零克隆：`Doc/phase2/04-zero-clone-share.md`

---

## 3. 用户要解决的问题（三期动机）

1. **可迭代变量**：按项目 / 环境选择不同 catalog，并随项目完成回灌 agents · skills · rules。  
2. **迭代占比**：Skill 大头 → Agent 其次 → Rules 最少。  
3. **进行中有意识记录**：Lesson Card + 门禁挂钩。  
4. **上下文膨胀**：分层按需加载；压缩只用于对话/草稿，不替代 SoT。

---

## 4. 三期一句话目标

> 在**不破坏**「磁盘 Markdown = SoT、MCP 只读、治理≠执行」的前提下，打通：  
> **项目中记 Lesson → 收尾蒸馏进 Skill（主）→ 偶调 Agent 绑定 → 极少升 Rule**；  
> 实例层在 `docs/operations/`，升格进 `docs/skills|agents|rules`。

---

## 5. 硬约束（继承 S0，三期不可破）

- Source of Truth = 本仓 `Code/code/docs/**`；MCP / 网站消费 generate 后的索引。  
- **禁止** MCP 写回正文；写回永远走 Git。  
- **禁止**把项目实例直接污染 common 技能正文；先入 `operations/<project>/`，蒸馏后再升格。  
- **禁止**用「大模型总结」替代可追溯的 Markdown 回灌。  
- L0 极少改；领域/场景优先 L2；Skill 正文保持可执行、宜短。

---

## 6. 新对话建议开场动作

1. 读本文件 + [`02-execution-plan.md`](02-execution-plan.md)  
2. `git remote -v` 确认上游 / fork  
3. 改资产：直接改 `Code/code/docs/**` → `npm run generate` / validate；部署另议  
4. 需要沉淀时触发句：  
   `记一条 lesson：<现象>。项目 <project-id>。按 operations Lesson Card 模板写入文件。`  
5. 执行纪律：先 MCP `list_*` / `get_*`，再按需 `@` 正文（[`04-context-budget.md`](04-context-budget.md)）

---

## 7. 相关文档索引

| 文件 | 用途 |
|------|------|
| [`01-goals-and-scope.md`](01-goals-and-scope.md) | 目标与边界 |
| [`02-execution-plan.md`](02-execution-plan.md) | 阶段 A～F |
| [`03-lesson-card-and-operations.md`](03-lesson-card-and-operations.md) | Lesson 模板与升格树 |
| [`04-context-budget.md`](04-context-budget.md) | 上下文预算 |
| [`../../Code/code/docs/operations/README.md`](../../Code/code/docs/operations/README.md) | 本仓 operations 入口 |

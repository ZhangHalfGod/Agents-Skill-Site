# 01 — 三期目标与范围

> **文档级别**：三期规划（服从 S0）  
> **日期**：2026-07-14  
> **交接**：先读 [`00-context.md`](00-context.md)

---

## 1. 北极星（三期）

把「做完项目 → 经验消失」变成：

**可捕获、可蒸馏、可回灌、可按环境选择的治理资产迭代面**。

成功标准不是「又多几个 skill 文件」，而是：

- 项目进行中能稳定留下 Lesson Card  
- 收尾能明确：升 Skill / 改 Agent / 升 Rule / 丢弃  
- Agent 执行时仍按需加载，不因资产变多而上下文爆炸  
- MacAir / BMWork / 上游可用不同 Catalog Profile，互不污染

---

## 2. 范围内 / 范围外

### 做（In Scope）

| ID | 项 |
|----|-----|
| G1 | `operations/<project>/lessons/` 约定 + Lesson Card 模板 |
| G2 | 阶段门禁 / PR 模板挂钩「是否有 lesson」 |
| G3 | Skill / Agent 分层结构约定（主文件短 + docs 长） |
| G4 | 蒸馏与升格 SOP（raw → distilled → merged） |
| G5 | Catalog Profile 概念（多 fork / 多部署选用哪套索引） |
| G6 | （可选后置）MCP 只读扩展：`profile` / `list_lessons` |

### 不做（Out of Scope）

| 项 | 原因 |
|----|------|
| MCP 写 docs / SoT | 破坏审计；写回永远走 Git |
| 网站内 Agent 推理 | S0 永久非目标 |
| 自动把聊天全量压进 skill | 不可追溯、易含密钥 |
| 一次大爆炸重构全部 skill | 小步回灌 |
| 本三期强制部署 BMWork ECS | 文档先定边界；部署另开 |

---

## 3. 迭代占比（强制心智）

| 资产 | 目标占比 | 典型动作 |
|------|:--------:|----------|
| **Skill** | ~70% | 新 SKILL、补 checklist、外置案例 |
| **Agent** | ~20% | 职责澄清、矩阵绑定调整 |
| **Rules** | ~10% | 重复踩坑 ≥2 次再升 L2；L0 极少动 |

升格决策树见 [`03-lesson-card-and-operations.md`](03-lesson-card-and-operations.md)。

---

## 4. 「变量」模型

```text
Catalog Profile（环境变量 / MCP 条目）
  upstream  → 公网 ECS 已部署
  macair    → MacAirM4 fork（本机或私有 MCP）
  bmwork    → 公司 fork（待部署）

Project Overlay（实例，不污染 common）
  operations/<project-id>/
    lessons/*.md
    meta.yaml          # 可选：项目名、时间、关联 PR
```

Cursor 侧近期可用**多个 MCP server 名**区分 profile；统一 `profile` 参数属后置增强。

---

## 5. 多仓拓扑

```text
ZhangHalfGod/Agents-Skill-Site   ← 本目录本地仓（上游）
        │ deploy
        ▼
   ECS 网站 + agents-skill-remote
        │
   ┌────┴────┐
   ▼         ▼
MacAirM4   BMWork（计划）
 fork       fork
私人迭代    公司迭代
```

**回馈规则**：仅通用、脱敏后的 Skill/Rule 升上游；公司特有留 BMWork；个人习惯留 MacAir。

---

## 6. 依赖与前置

- 二期远程 MCP 可用（已验证）  
- `skill-creator` 等技能仍可通过 MCP `list_skills` 发现  
- URI / 矩阵变更仍走一期注册与 `05-agent-skill-matrix` 纪律  

---

## 7. 风险

| 风险 | 缓解 |
|------|------|
| Lesson 没人写 | 门禁「无教训须显式勾选」+ 对话触发句 |
| Skill 无限变长 | 主文件行数预算 + docs 外置（见 04） |
| fork 互相覆盖 | Profile 隔离 + 升上游走人审 PR |
| 误改 L0 | 升格 SOP 默认禁止；须单独决策日志 |

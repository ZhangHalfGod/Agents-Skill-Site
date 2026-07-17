# Operations — 项目实例与 Lesson

> **真源**：本目录（`Code/code/docs/operations/`）。  
> **原则**：模板与实例分离——项目 Lesson 先落这里，蒸馏后再升格进 `docs/agents|skills|rules`。  
> **公网**：默认**不**挂载本分区；本机 / Git 可读即可。

## 目录约定

```text
operations/
  README.md
  _template/lessons/
    _lesson-card.template.md
  <project-id>/
    meta.md
    lessons/
      YYYY-MM-DD-short-slug.md
```

## 对话触发句

```text
记一条 lesson：<一句话现象>。项目 <project-id>。按 operations Lesson Card 模板写入文件。
```

## 禁止

- **禁止**把 `status: raw` 的 Lesson 直接覆盖 `docs/skills|agents|rules` 正文  
- **禁止**写入密钥、Token、未脱敏客户数据  

## 状态机

```text
raw ──蒸馏──► distilled ──合入 docs/** ──► merged
                 │
                 └──评审否决──► rejected
```

| 状态 | 含义 |
|------|------|
| `raw` | 现场记录 |
| `distilled` | 已提炼可合入文案 |
| `merged` | 已进可复用正文，并 `npm run generate` |
| `rejected` | 不升格 |

## 升格决策（简）

1. 可复用 SOP / checklist？→ **Skill**（默认）  
2. 角色职责或绑定错了？→ **Agent** + 矩阵  
3. 重复违规且须强制？→ **Rule L2**（慎 L0）  
4. 否则 → `rejected` 或仅留 operations  

## 收尾清单（项目 / 周）

- [ ] 本阶段 Lesson：已写或显式「无新教训」  
- [ ] raw 中需升格的已标 `distilled`  
- [ ] 合入路径写进蒸馏笔记；Lesson → `merged` 或 `rejected`  
- [ ] 改过 skill/agent/rule → `cd Code/code && npm run generate && npm run validate`  
- [ ] PR 勾选「治理沉淀」（见 `.github/PULL_REQUEST_TEMPLATE.md`）  

## 升格操作步骤

1. Lesson：`raw` → `distilled`  
2. 改 `docs/skills/**` / `docs/agents/**` / `docs/rules/**`（及 `Doc/phase1/05-agent-skill-matrix.md`）  
3. Lesson 标 `merged`，写明合入路径  
4. `npm run generate && npm run validate`  
5. Git commit（本仓）  

约定详情（工程文档，非站点内链）：`Doc/phase3/03-lesson-card-and-operations.md`。

## 示例项目

| project-id | 说明 |
|------------|------|
| `site-sot-inplace` | SoT 迁入本仓 docs |
| `ecs-deploy-host404` | Nginx Host 假 404 / 部署验收 → 已 merged 进 stage-gate-flow |

# Operations — 项目实例与 Lesson

> **真源**：本目录（`Code/code/docs/operations/`）。  
> **原则**：模板与实例分离——项目 Lesson 先落这里，蒸馏后再升格进 `docs/agents|skills|rules`。  
> **公网**：默认不挂载本分区（见 URI 注册表）；本地可读即可。

## 目录约定

```text
operations/
  README.md                          # 本文件
  _template/lessons/
    _lesson-card.template.md         # 复制用模板
  <project-id>/
    meta.md                          # 可选：项目一句话
    lessons/
      YYYY-MM-DD-short-slug.md       # Lesson Card
```

## 禁止

- **禁止**把 `status: raw` 的 Lesson 直接覆盖 `docs/skills|agents|rules` 正文  
- **禁止**写入密钥、Token、未脱敏客户数据  

## 升格流程（本仓就地）

1. Lesson：`raw` → 蒸馏为 `distilled`  
2. 按决策树改对应 `docs/skills/**` / `docs/agents/**` / `docs/rules/**`（及矩阵 `Doc/phase1/05-agent-skill-matrix.md`）  
3. Lesson 标 `merged`，写明合入路径  
4. `cd Code/code && npm run generate && npm run validate`

约定详情：[`Doc/phase3/03-lesson-card-and-operations.md`](../../../../Doc/phase3/03-lesson-card-and-operations.md)。

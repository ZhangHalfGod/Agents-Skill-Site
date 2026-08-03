# AI代码生成范围清单（H1 — ProductManager）

**项目**：mcp-docs-openapi-align  
**短名**：mcp-docs-openapi-align  
**阶段**：H1（需求拆解 & 范围界定）  
**日期**：2026-08-02  
**产出者**：ProductManager（agent=pm）  
**业务仓**：MechAssist-Fusion（分支 feature/Home_window）  
**run_dir**：`Code/doc/phase4/home/run-mcp-docs-openapi-align-20260802`

---

## 1. 目标

MCP 接入文档（`doc/方案C/方案C_文档对齐/MCP接入文档.md`）补全 "API 发现与文档" 章节——列出 extern-api 的四个发现/文档端点，说明同源于 `registry.js`。纯文档，不改代码。

### 成功画像

| 维度 | 标准 |
|------|------|
| 覆盖完整 | 文档含 `/v2/`、`/api/openapi.json|yaml`、`/api/docs` 全部端点 |
| 同源说明 | 明确写出四者同源于 registry.js |
| 链接一致 | 端口 :3002 与路径与实际路由一致 |
| 纯文档 | H4 核对仅 .md 被修改 |

---

## 2. 范围条目

### 2.1 原位探查结论

#### MCP接入文档.md（175 行，8 节）——缺失清单

| 现有内容 | 缺失 |
|---------|------|
| §1 端口表：extern-api :3002 | 未提四个发现/文档端点 |
| §2.1 入口表：POST /api/chat/message 等 | 无 `/v2/`、`/api/openapi.*`、`/api/docs` |
| §8 文档索引：8 篇链接 | 缺 extern-api/README.md、重构api架构/README.md |
| §7 联调清单：6 步 | 未含验证 API 发现端点 |

#### extern-api 端点事实（已确认实现）

| 端点 | 端口 | 说明 | 同源 |
|------|------|------|------|
| `GET /v2/` | 3002 | 四层发现目录（auth/chat/business/admin/system） | registry.js → v2Catalog.js |
| `GET /api/openapi.json` | 3002 | OpenAPI 3.0.3，28 路径 | registry.js → openapiGenerator.js |
| `GET /api/openapi.yaml` | 3002 | 同上 YAML | 同上 |
| `GET /api/docs` | 3002 | 结构化文档 | registry.js |

**同源关系**：四者共享单一数据真源——`server/catalog/registry.js`（`LAYERS` + `shared/apiPaths.js`）。OpenAPI 由 `openapiGenerator.js` 动态生成；v2Catalog 由 `v2Catalog.js` 生成。

#### 参考来源（已对齐文档）

- `extern-api/README.md` L95-96（openapi-doc-sync 成果）：发现目录 /v2/、OpenAPI /api/openapi.json|yaml 已实现 3.0.3
- `extern-api/doc/重构api架构/README.md`：v2 四层映射表 + 同源说明

#### 交叉检查

- 方案C 下其余 .md：无矛盾（仅 M-3 发布说明有 /v2/ 引用，已正确）
- `mcp-gaode/README.md` L174-L184：另有独立的"OpenAPI 规划中"表述——属于 mcp-gaode 自身（端口 3001），**不纳入本期**

### 2.2 修改条目（P0）

| # | 文件 | 修改动作 |
|---|------|---------|
| M1 | `MCP接入文档.md` | **新增 §9 "API 发现与文档"**：端点索引表（4 行）+ 同源说明段落 |
| M2 | 同上 §2.1 | 入口表补 4 行发现/文档端点（标注"无需鉴权"） |
| M3 | 同上 §8 | 索引新增 2 条：extern-api/README.md、重构api架构/README.md |

### 2.3 建议新 §9 结构

- **9.1 发现入口**：表格列 `/v2/`、`/api/openapi.json`、`/api/openapi.yaml`、`/api/docs`，含端口、方法、鉴权（无需）、说明
- **9.2 同源说明**：四者共享单一数据真源——`registry.js`（LAYERS + API_PATHS）。新增 API 只需更新 registry

### 2.4 不修改（显式不做）

`mcp-gaode/README.md`（独立项目 3001 端口）、registry.js/openapiGenerator.js/v2Catalog.js（业务代码）、方案C 下其他 .md（无矛盾）、新增文件、git push

---

## 3. 验收口径

| 用户验收条件 | 核验方式 |
|------------|---------|
| "文档链接与 :3002 实际路径一致" | 逐条核对 `/v2/`（→ server/index.js L172）、`/api/openapi.json|yaml`（→ L177）、`/api/docs`（→ registry.js） |

---

## 4. 风险与回滚

表述不一致 → 以 extern-api/README.md 为权威源对齐。回滚：git checkout。

---

## 5. 开放问题（提交 H2）

1. 同源说明精度：统一说"registry 为单一真源"还是区分 OpenAPI 经 openapiGenerator 间接生成？
2. mcp-gaode 侧的 OpenAPI 计划文档（端口 3001）是否需另立项？——建议不纳入本期。
3. 新 §9 放 §2 之后（"如何发现 API"）还是文档末尾？
4. `/api/docs` 描述："结构化文档（与 /v2/ 同源）" vs "API 文档页面"？

---

## 6. Lesson Hint

纯文档追加，无预期 deep lesson。

---

*本清单由 ProductManager 根据原位探查（只读）与 MCP 角色真源产出，提交架构师（H2）复核。*

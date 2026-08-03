# 架构约束与执行计划（H2 — Architect）

**项目**：mcp-docs-openapi-align  
**阶段**：H2（架构合规复核）  
**日期**：2026-08-02  
**产出者**：Architect（agent=arch）  
**上一跳**：H1 PM 范围清单（`h1-pm.scope-checklist.md`）  
**业务仓**：MechAssist-Fusion（分支 feature/Home_window）  
**run_dir**：`Code/doc/phase4/home/run-mcp-docs-openapi-align-20260802`

---

## 1. 复核结论

H1 范围清单所有事实经本跳原位复核（只读），**全部确认**：

| 复核项 | H1 结论 | H2 复核 | 状态 |
|--------|---------|---------|------|
| MCP接入文档 175 行 8 节 | 缺失发现/文档端点 | 全文阅读确认：§1 端口表仅 3 组件 / §2.1 入口表仅 chat+manifest / §8 索引 6 条 | 一致 |
| `GET /v2/` 已挂载 | server/index.js L172 | 源码确认：`app.use('/v2', v2CatalogRouter)` | 一致 |
| `GET /api/openapi.*` 已挂载 | server/index.js L177 | 源码确认：`app.use('/api', apiLimiter, openapiRoutes)` | 一致 |
| `GET /api/docs` 在 registry | registry.js L255-L264 | 源码确认：system/docs implemented:true | 一致 |
| extern-api/README.md 措辞已对齐 | L95-96 已描述四端点 | 源码确认：含 /v2/、/api/openapi.*、/api/docs（其中 /api/docs 描述为"Swagger UI 页面另行规划"） | 一致 |
| 重构api架构/README.md 同源措辞 | L49-L53 已对齐 | 源码确认："已从 registry.js 动态生成 OpenAPI 3.0.3 规范" | 一致 |
| mcp-gaode 侧不纳入 | 排除 3001 端口 | 固守项目边界，不改 mcp-gaode/README.md | 裁定确认 |

---

## 2. 文档修改定稿

### 2.1 M1：新增 §9 "API 发现与文档"（插在 §8 之后）

**位置**：§8 文档索引表后，文档末尾 `*文档对齐首版 · 2026-06-03*` 之前。

**标题**：`## 9. API 发现与文档`

**§9.1 端点索引表**（4 行 × 6 列）：

| 端点 | 端口 | 方法 | 鉴权 | 说明 | 同源 |
|------|------|------|------|------|------|
| `GET /v2/` | 3002 | GET | 无需 | 四层发现目录（auth/chat/business/admin/system） | registry.js → v2Catalog.js |
| `GET /api/openapi.json` | 3002 | GET | 无需 | OpenAPI 3.0.3 规范（JSON，28 路径） | registry.js → openapiGenerator.js |
| `GET /api/openapi.yaml` | 3002 | GET | 无需 | OpenAPI 3.0.3 规范（YAML） | 同上 |
| `GET /api/docs` | 3002 | GET | 无需 | 结构化文档（与 /v2/ 同源） | registry.js |

**§9.2 同源说明段落**：

> 以上四个端点共享单一数据真源——`server/catalog/registry.js`（`LAYERS` + `shared/apiPaths.js`）。OpenAPI JSON/YAML 规范由 `openapiGenerator.js` 动态生成；v2 发现目录由 `v2Catalog.js` 路由提供。新增 API 只需更新 registry，发现目录与 OpenAPI 文档自动同步。

**措辞裁定**：[Q1] 主表述"registry.js 为单一数据真源"，区分二级生成路径（openapiGenerator / v2Catalog），与 extern-api/README.md L95-96 及 `doc/重构api架构/README.md` L49-L53 口径一致。

### 2.2 M2：§2.1 入口表补充（在"发布探测"行后追加 3 行）

| 项 | 说明 |
|------|------|
| 发现目录 | `GET /v2/`（四层：auth/chat/business/admin/system · 无需鉴权） |
| OpenAPI 规范 | `GET /api/openapi.json`、`GET /api/openapi.yaml`（3.0.3 · 无需鉴权） |
| 结构化文档 | `GET /api/docs`（与 /v2/ 同源 · 无需鉴权） |

**说明**：采用现有表格"项 | 说明"键值对格式，不新增独立子表格。均标注"无需鉴权"。

### 2.3 M3：§8 文档索引表新增 2 条（表末追加）

| 文档 | 路径 |
|------|------|
| extern-api README | [后端目录与 API 说明](../../../extern-api/README.md) |
| extern-api API 架构重构 | [v2 目录与同源设计](../../../extern-api/doc/重构api架构/README.md) |

**相对路径计算**：从 `doc/方案C/方案C_文档对齐/` 出发
- → `../../../extern-api/` = `extern-api/`
- → `../../../extern-api/doc/重构api架构/` = `extern-api/doc/重构api架构/`

### 2.4 §7 联调清单：补步骤 7（裁定：补充）

```
7. 验证 API 发现端点：`GET http://localhost:3002/v2/` → 返回四层目录；
   `GET http://localhost:3002/api/openapi.json` → 返回 OpenAPI 3.0.3 规范。
```

**裁定**：补充联调验证步骤，聚焦 `/v2/` 与 `/api/openapi.json` 两个核心发现端点（`/api/docs` 为同源结构化文档，实测 200，可选项）。

---

## 3. 链接一致性清单

### 3.1 本次写入的新 :3002 路径（H3 写入 + H4 核对）

| 路径 | 写入位置 | 期望响应 |
|------|---------|---------|
| `GET /v2/` | §2.1、§9 | 200 + JSON（四层目录） |
| `GET /api/openapi.json` | §2.1、§9 | 200 + JSON（OpenAPI 3.0.3） |
| `GET /api/openapi.yaml` | §2.1、§9 | 200 + YAML |
| `GET /api/docs` | §2.1、§9 | 200（结构化文档，与 /v2/ 同源；openapi-doc-sync H4 已实测确认） |
| §7 补 `/v2/` | §7 步骤 7 | 同上 /v2/ |
| §7 补 `/api/openapi.json` | §7 步骤 7 | 同上 |

### 3.2 文档中已有的 :3002 路径（H3 无需改，H4 顺手核对）

| 现有路径 | 位置 |
|---------|------|
| `POST /api/chat/message` | §2.1 |
| `GET /api/release/manifest` | §2.1、§4、§7 |

---

## 4. 修改面白名单

| # | 文件 | 修改内容 | 行号范围 |
|---|------|---------|---------|
| M1 | `MCP接入文档.md` | 新增 §9 "API 发现与文档"（~25 行） | §8 后、文档版权行前 |
| M2 | 同上 | §2.1 入口表补 3 行（发现目录 / OpenAPI / 结构化文档） | 发布探测行后 |
| M3 | 同上 | §8 索引表补 2 行（extern-api README × 2） | 表末 |
| M4 | 同上 | §7 联调清单补步骤 7 | 步骤 6 后 |

### 显式不做

| 禁止项 | 原因 |
|--------|------|
| 改 `mcp-gaode/README.md`（3001 端口） | 独立项目，其 OpenAPI 计划单独处理 |
| 改 `extern-api/` 下任何文件 | 源码不改 |
| 改方案C 下其他 .md | 无矛盾表述 |
| 新增文件 | H1 decisions |
| git push / npm / 飞书 | 硬约束 |

---

## 5. 验收口径

| 用户验收条件 | 架构映射 | 验收方式（H4） |
|------------|---------|--------------|
| 文档链接与 :3002 实际路径一致 | 新写入的 6 条 :3002 路径 | H4 起服务后逐条 curl 核对 /v2/、/api/openapi.json、/api/openapi.yaml、/api/docs → 均 200 |
| 四个端点全部覆盖 | §9 索引表 4 行 + §2.1 入口表 3 行 | H4 grep 文档 |
| 同源说明准确 | §9.2 段落 | H4 人工核对措辞 vs extern-api/README.md |
| H4 改动面仅 .md | git diff | 仅 MCP接入文档.md |

---

## 6. 风险与回滚

| 风险 | 等级 | 缓解 | 回滚 |
|------|------|------|------|
| `/api/docs` 实现状态描述 | 无（已实测 200，chatRoutes.js:828 经 toMountPath(API_PATHS.API_DOCS) 挂载） | 描述仅写"结构化文档（与 /v2/ 同源）"即可 | git checkout |
| §2.1 新增行打乱表格渲染 | 低 | 采用现有"项 \| 说明"键值对格式，不新增子表 | git checkout |
| 将来 /api/docs 实现后文档需修订 | 低 | 已在 lesson_hint 记录 | —— |
| 相对路径错误导致 §8 链接 404 | 低 | 已计算路径层级（`../../../extern-api/`），H4 点击验证 | git checkout |

---

## 7. H1 开放问题裁定

| # | H1 问题 | H2 裁定 | 理由 |
|---|---------|---------|------|
| Q1 | 同源说明精度："registry 为单一真源" vs 区分 openapiGenerator？ | **两者结合**。主表述"registry.js 为单一数据真源"，二级补充"OpenAPI 经 openapiGenerator 动态生成，v2 经 v2Catalog.js 路由提供"。与 extern-api/README.md 口径一致 | 既准确又简洁 |
| Q2 | mcp-gaode 侧是否纳入？ | **不纳入**。mcp-gaode（端口 3001）属独立项目，其 OpenAPI 计划表述独立处理。仅动 MCP接入文档.md（extern-api 3002 端口内容） | H1 建议一致 |
| Q3 | §9 放 §2 之后还是文档末尾？ | **文档末尾**（§8 之后）。§2 主题是"两种接入方式"（chat + 直连），§9 主题是"API 发现与文档发现"，为独立主题 | 不打断现有阅读流 |
| Q4 | `/api/docs` 描述措辞？ | **"结构化文档（与 /v2/ 同源）"**——与 extern-api/doc/重构api架构/README.md 一致。不加"已实现/未实现"判定，仅描述其架构角色 | 回避实现状态表态 |

---

*本文由 Architect 产出，基于 H1 范围清单原位复核、MCP接入文档全文阅读与源码路由交叉验证。提交 DevLead（H3）执行文档修改。*

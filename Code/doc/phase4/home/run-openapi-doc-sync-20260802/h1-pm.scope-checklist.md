# AI 代码生成范围清单 —— openapi-doc-sync (H1)

> 产品经理（ProductManager）产出 | 2026-08-02 | 预授权：M2 后自动放行 H3，全自动至 H4 闭环

## 0. 目标

**一句话目标**：消除 extern-api 文档中「OpenAPI 未实现 / 规划中」的过时表述，使文档与已实现端点 (`GET /api/openapi.json`、`GET /api/openapi.yaml`) 事实对齐。

**成功画像**：
- 文档不再包含「OpenAPI 未实现」「规划中」等矛盾表述
- 端点描述与实测一致
- 改动面仅限文档（`.md`），零业务代码变动

## 1. 干系人与 RACI（简化）

| 角色 | 职责 |
|------|------|
| ProductManager (pm) | 范围界定、验收标准（H1） |
| Architect (arch) | 架构合规审核（H2） |
| DevLead | 文档修改执行（H3） |
| TestEngineer | 验收核对（H4） |

## 2. 范围条目（精确到文件与动作）

### 2.1 修改（Modify）

| # | 文件路径（相对 extern-api/） | 动作 | 优先级 | 实测/核验 |
|---|----------------------------|------|--------|-----------|
| M1 | `README.md` 第 96 行 | 将 `**规划中，未实现**` 替换为已实现状态的表述，列明 `GET /api/openapi.json` 与 `GET /api/openapi.yaml` 两个端点 | P0 | ✅ 实测：HTTP 200，OpenAPI 3.0.3，28 paths |
| M2 | `doc/重构api架构/README.md` 第 53 行 | 将 `**后续规划（未实现）**` 改为 `**已实现**`，注明生成器位于 `server/catalog/openapiGenerator.js`，端点位于 `server/routes/openapiRoutes.js`，同时标注 `Swagger UI 前端仍在规划中`（若有需要） | P0 | ✅ 代码核验：`openapiGenerator.js`（295 行完整生成器）、`openapiRoutes.js`（60 行路由）、`openapi.test.js`（260 行测试） |

### 2.2 新增（Add）

无新增文件。本次纯文档对齐，不创建新文件。

### 2.3 扫描确认无需改动

| # | 文件 | 确认结论 |
|---|------|----------|
| S1 | `extern-api/` 下全部 `.md` / `.txt` / `.json` / `.html` | 全量扫描，仅上述 2 处含「OpenAPI 未实现」矛盾表述（`server/test/__snapshots__/openapi.snapshot.json` 中的 `x-note: voice routes 尚未实现` 不在此次范围，因其描述的是 voice routes 而非 OpenAPI 规范本身） |
| S2 | `server/catalog/openapiGenerator.js` | 生成器已完整实现（295 行纯函数，生成 OpenAPI 3.0.3 规范对象） |
| S3 | `server/routes/openapiRoutes.js` | 路由已挂载 `GET /api/openapi.json` + `GET /api/openapi.yaml`，无误 |
| S4 | `server/index.js` | `app.use('/api', apiLimiter, openapiRoutes)` 已正确挂载 |
| S5 | `server/test/openapi.test.js` | 260 行完整测试（结构校验、HTTP 200、快照匹配、YAML 输出），通过 |

## 3. 显式不做（Out of Scope）

- ❌ 不改 `server/` 下任何业务代码（生成器、路由、测试、中间件）
- ❌ 不改 `.env`、不修改数据库、不写任何密钥/Token
- ❌ 不新增 `GET /api/docs` 路由（若该路由不存在）
- ❌ 不接 Swagger UI 前端
- ❌ 不 git push、不 npm install/rebuild
- ❌ 不调飞书工具（飞书双写由 main 编排者负责）

## 4. 验收口径（逐条映射）

| 用户验收项 | 验收方式 | 对应范围 |
|-----------|----------|----------|
| 文档不再写「未实现」 | 全文搜索 `规划中|未实现|尚未实现` 在 OpenAPI 上下文中零命中 | M1, M2 |
| 端点描述与实测一致 | `GET /api/openapi.json` → 200, OpenAPI 3.0.3, 28 paths；`GET /api/openapi.yaml` → 200, application/yaml | M1 |
| H4 核对改动面仅文档 | `git diff` 仅含 `.md` 文件 | M1, M2 |

## 5. 约束引用

- 业务仓分支：`feature/Home_window`
- run_dir：`Code/doc/phase4/home/run-openapi-doc-sync-20260802`
- 预授权链：M2→H3→H4 自动放行
- 写入时保持 UTF-8（node 写，不用 PowerShell 重定向）

## 6. 风险与回滚

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| README 中 `GET /api/docs` 与 `GET /api/openapi.json` 概念混淆 | 中 | 低 | H3 修改时明确区分：`/api/docs`（若不存在）标注为「Swagger UI 前端仍在规划中」；`/api/openapi.json` / `.yaml` 标注为「已实现」 |
| 扫描遗漏 | 低 | 中 | 已对 `extern-api/` 下所有 `.md`/`.txt`/`.json`/`.html` 做全量关键词扫描，仅命中 2 处矛盾表述 |
| registry.js 中 `API_DOCS: implemented: true` 但无实际路由 | 确认存在 | 低 | 不在此次范围，作为 H1→H2 的 open_question 传递 |

## 7. 核心模块红色记录

**不适用。** 本次改动仅涉 Markdown 文档，不涉及核心层/网关层/安全模块/架构代码的 AI 生成。

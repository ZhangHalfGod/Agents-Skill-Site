# H3 文档对齐报告 — openapi-doc-sync

阶段 H3 | 角色 Dev | 日期 2026-08-02

## 1. 改动文件（仅 2 个 .md）

1. `extern-api/README.md`
2. `extern-api/doc/重构api架构/README.md`

## 2. 改前 / 改后对比

### 2.1 extern-api/README.md（约原 L95-96）

**改前：**

```markdown
- 发现目录：`http://localhost:<PORT>/v2/`（`<PORT>` 默认 3002）
- 结构化文档：`GET /api/docs`（OpenAPI 从 registry 生成：**规划中，未实现**）
```

**改后：**

```markdown
- 发现目录：`http://localhost:<PORT>/v2/`（`<PORT>` 默认 3002）
- OpenAPI 规范：`GET /api/openapi.json`（OpenAPI 3.0.3 JSON）与 `GET /api/openapi.yaml`（OpenAPI 3.0.3 YAML），由 `server/catalog/openapiGenerator.js` 从 registry LAYERS 自动生成
- Swagger UI 文档前端：`GET /api/docs`（**规划中，尚未实现前端渲染**）
```

### 2.2 extern-api/doc/重构api架构/README.md（约原 L50-53）

**改前：**

```markdown
- 结构化文档：`GET /api/docs`
- 发现目录：`GET /v2/`

**后续规划（未实现）**：从 `registry.js` 生成 OpenAPI 规范，供 Swagger UI 或 CI 契约校验使用。
```

**改后：**

```markdown
- OpenAPI 规范（已实现）：`GET /api/openapi.json` 与 `GET /api/openapi.yaml`（OpenAPI 3.0.3，28 paths），由 `server/catalog/openapiGenerator.js` 从 registry LAYERS 自动生成
- Swagger UI 文档前端（规划中）：`GET /api/docs`，用于渲染 OpenAPI 规范的交互式文档
- 发现目录：`GET /v2/`
```

## 3. 端点核对

- 本机探测：`localhost:3002/3099/3098` 上 `/api/openapi.json` 与 `/api/openapi.yaml` 均连接超时（服务未运行）。
- **引用 H1 实测**（`h1-handoff.yaml` gate.evidence）：
  - GET http://localhost:3099/api/openapi.json → HTTP 200, openapi 3.0.3, 28 paths, x-generator: mechassist-openapi
  - GET http://localhost:3098/api/openapi.yaml → HTTP 200, application/yaml, 452 lines, 3.0.3
- 只读代码确认：`openapiRoutes.js` 实现两路由；`server/index.js` `app.use('/api', apiLimiter, openapiRoutes)` 已挂载。

## 4. 全文扫描结论（extern-api/）

| 命中 | 判定 |
|------|------|
| README.md / 重构api架构 README 中 OpenAPI 规范端点 | 已标「已实现」，列出 json/yaml + 生成器路径 |
| 两处 `/api/docs`「规划中」 | 均加注前端/Swagger UI，不指规范本身 — 合规 |
| 重构api架构 L23/L37、README L89 提及 `/api/docs` | 注册表/目录同源说明，未宣称 OpenAPI 规范未实现 — 保留（C1 未要求改） |
| openapi.snapshot.json x-note「voice routes 尚未实现」 | D4 确认非 OpenAPI 规范范围 — 不改 |
| 其他 .md/.txt/.html 中「OpenAPI 未实现/规划中」 | **无残留矛盾表述** |

## 5. 自检（C1–C6）

- C1 只改 2 个 .md：PASS
- C1.1 未新增业务仓文件、未改 server/：PASS
- C2 区分规范端点 vs Swagger UI：PASS
- C3 README 按目标文本：PASS
- C4 重构api架构 README 按目标文本：PASS
- C5 端点：引用 H1 实测（本机未起服务）：PASS（注明）
- C6 无矛盾「OpenAPI 未实现」：PASS

## 6. 未做事项

- 未改 registry.js（误标已知，按 D1/registry_处置）
- 未 commit / push；未起测试服务；未写密钥

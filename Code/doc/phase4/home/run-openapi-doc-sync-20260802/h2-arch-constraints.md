# H2 架构约束 — openapi-doc-sync

阶段 H2 | 角色 Architect | 项目 MechAssist-Fusion / openapi-doc-sync

---

## 1. 架构结论

### 1.1 现状确认

经逐文件核查，OpenAPI 规范生成与暴露链路已完整实现：

| 组件 | 文件 | 状态 |
|------|------|------|
| 生成器 | `server/catalog/openapiGenerator.js`（295 行纯函数） | ✅ 已实现 |
| 路由 | `server/routes/openapiRoutes.js`（`/api/openapi.json` + `/api/openapi.yaml`） | ✅ 已实现 |
| 挂载 | `server/index.js:130` `app.use('/api', apiLimiter, openapiRoutes)` | ✅ 已挂载 |
| 测试 | `server/test/openapi.test.js`（260 行，含结构/HTTP/YAML/快照） | ✅ 通过 |
| 规范版本 | OpenAPI 3.0.3，28 paths，`x-generator: mechassist-openapi` | ✅ 合规 |

**但存在注册表/路由不一致**：

- `registry.js` system/docs 模块标记 `API_PATHS.API_DOCS`（即 `/api/docs`）`implemented: true`
- `server/routes/` 下**无任何路由处理 `/api/docs`**
- 实际可访问的 OpenAPI 端点是 `/api/openapi.json` 和 `/api/openapi.yaml`

| 端点 | 是否实现 | 实现位置 |
|------|----------|----------|
| `GET /api/openapi.json` | ✅ 已实现 | `server/routes/openapiRoutes.js:16` |
| `GET /api/openapi.yaml` | ✅ 已实现 | `server/routes/openapiRoutes.js:36` |
| `GET /api/docs` | ❌ 未实现 | 无路由（registry 误标 `implemented: true`） |

### 1.2 范围裁定

H1 PM decisions D1-D5 均有效。本次架构复核确认：

- D1（只改 .md）✅ 合规，无需越界
- D2（M1 修改）见下方实施约束
- D3（M2 修改）见下方实施约束
- D4（快照不在此范围）✅ 确认快照中的 x-note 描述的是 voice routes，非 OpenAPI 规范本身
- D5（红色记录不适用）✅ 确认：零代码改动，不触发红色记录

### 1.3 架构原则

- **文档必须反映运行时真相**：README 中描述的能力必须与 `server/index.js` 实际挂载的路由一致
- **registry.js `implemented` 不可信**：`implemented: true` ≠ 有对应 Express 路由；判定以 `server/routes/` 实际文件为准
- **单源原则**：`API_PATHS` 是路径定义单源；`LAYERS` 是元数据单源；二者须与路由实现对齐

---

## 2. 接口与数据流

本次为纯文档对齐，不涉及接口变更。现有接口不变：

```
GET /api/openapi.json  → openapiRoutes.js → openapiGenerator.js → LAYERS + API_PATHS → JSON
GET /api/openapi.yaml  → openapiRoutes.js → openapiGenerator.js → LAYERS + API_PATHS → YAML
```

---

## 3. 对 H1 开放问题的裁定

### Q1 裁定：必须在文档中区分「OpenAPI 规范」与「/api/docs」

**结论：接受 Q1 建议，强制区分。**

- `GET /api/openapi.json` 与 `GET /api/openapi.yaml`：OpenAPI 3.0.3 规范端点，**已实现**
- `GET /api/docs`：Swagger UI 或文档前端，**尚未实现**（无路由 handler）
- registry.js `system/docs.implemented: true` 属于**误标**，不应作为判断依据

**文档中必须使用精确的端点路径，不得笼统称"OpenAPI 已实现"。**

### Q2 裁定：README 不得将 `/api/docs` 描述为已实现

**结论：Q2 成立。**

- README.md 中 `GET /api/docs` 应替换为实际存在的端点 `GET /api/openapi.json` 与 `GET /api/openapi.yaml`
- 若需提及 `/api/docs`，必须加注「Swagger UI 前端尚未实现」
- 任何文档不得将 `/api/docs` 标为可用或已实现

---

## 4. 实施约束（H3 DevLead 精确指令）

### 4.1 文件 1：`extern-api/README.md`

**当前（行 94-97，经实测行号以实际偏移为准）**：

```markdown
- 发现目录：`http://localhost:<PORT>/v2/`（`<PORT>` 默认 3002）
- 结构化文档：`GET /api/docs`（OpenAPI 从 registry 生成：**规划中，未实现**）
```

**修改要求**：

```markdown
- 发现目录：`http://localhost:<PORT>/v2/`（`<PORT>` 默认 3002）
- OpenAPI 规范：`GET /api/openapi.json`（OpenAPI 3.0.3 JSON）与 `GET /api/openapi.yaml`（OpenAPI 3.0.3 YAML），由 `server/catalog/openapiGenerator.js` 从 registry LAYERS 自动生成
- Swagger UI 文档前端：`GET /api/docs`（**规划中，尚未实现前端渲染**）
```

**关键约束**：
- 必须同时列出 `/api/openapi.json` 和 `/api/openapi.yaml` 两个端点
- 必须标注生成器位置 `server/catalog/openapiGenerator.js`
- `/api/docs` 必须标记为「规划中，尚未实现前端渲染」

### 4.2 文件 2：`extern-api/doc/重构api架构/README.md`

**当前（行 49-53，经实测行号以实际偏移为准）**：

```markdown
- 结构化文档：`GET /api/docs`
- 发现目录：`GET /v2/`

**后续规划（未实现）**：从 `registry.js` 生成 OpenAPI 规范，供 Swagger UI 或 CI 契约校验使用。
```

**修改要求**：

```markdown
- OpenAPI 规范（已实现）：`GET /api/openapi.json` 与 `GET /api/openapi.yaml`（OpenAPI 3.0.3，28 paths），由 `server/catalog/openapiGenerator.js` 从 registry LAYERS 自动生成
- Swagger UI 文档前端（规划中）：`GET /api/docs`，用于渲染 OpenAPI 规范的交互式文档
- 发现目录：`GET /v2/`
```

**关键约束**：
- 必须标注「已实现」并列出实际端点
- 必须标注生成器文件路径 `server/catalog/openapiGenerator.js`
- 必须标注路由文件路径 `server/routes/openapiRoutes.js`

### 4.3 禁用动作清单（H3 DevLead 不得执行）

- ❌ 不得修改 `server/` 下任何文件（代码、路由、生成器、测试、中间件）
- ❌ 不得修改 `shared/apiPaths.js` 或 `server/catalog/registry.js`
- ❌ 不得新增任何文件
- ❌ 不得修改 `server/test/__snapshots__/openapi.snapshot.json`
- ❌ 不得新增或修改任何非 .md 文件
- ❌ 不得 `npm install`、`npm run build`、`npm test`
- ❌ 不得 git push

### 4.4 registry 不一致问题处置

- **本次不修 registry.js**（按 D1 原则，纯文档对齐）
- 将 registry `implemented` 与路由不一致问题写入 `lesson_hint`，交由后续迭代（建议在本次项目 operations 下写 Lesson Card）

---

## 5. 验收口径（逐条映射用户验收）

| # | 验收项 | 验证方式 | 通过标准 |
|---|--------|----------|----------|
| V1 | README.md 不再含「OpenAPI 未实现」矛盾表述 | `grep -n "未实现\|规划中" extern-api/README.md` | 仅 `/api/docs` 一行出现「规划中」（且指 Swagger UI，非 OpenAPI 规范） |
| V2 | README.md 列出 `/api/openapi.json` 和 `/api/openapi.yaml` | 目视 | 俩端点均出现 |
| V3 | 重构api架构/README.md 标「已实现」并注明生成器路径 | `grep -n "已实现" extern-api/doc/重构api架构/README.md` | 至少一行含 `openapiGenerator.js` 或 `openapiRoutes.js` |
| V4 | 重构api架构/README.md 不再含「未实现」针对 OpenAPI 规范生成 | `grep "后续规划.*未实现" extern-api/doc/重构api架构/README.md` | 零命中（或改写为仅指 /api/docs 前端） |
| V5 | extern-api/ 全量 .md 扫描无其他「OpenAPI 未实现」矛盾 | `Select-String -Path "extern-api\**\*.md" -Pattern "OpenAPI.*(未实现|规划中)"` | 零命中（已确认当前仅 2 处） |
| V6 | 无越界改动 | `git diff --stat -- '*.js' '*.json' '*.yaml' | 零输出（仅 .md 改动） |  |
| V7 | `/api/openapi.json` 正常响应 | `curl http://localhost:3099/api/openapi.json` | HTTP 200，`openapi: 3.0.3` |
| V8 | `/api/openapi.yaml` 正常响应 | `curl http://localhost:3098/api/openapi.yaml` | HTTP 200，Content-Type: application/yaml |

---

## 6. 风险与回滚

| 风险 | 影响 | 缓解 |
|------|------|------|
| registry.js `implemented` 字段普遍不一致 | 后续开发依赖 registry 做路由判断时出错 | 本次写入 lesson_hint；建议后续建立 registry-to-route 自动校验（CI 脚本） |
| `/api/docs` 未实现但文档中可能被读者误认为可用 | 用户体验困惑 | 文档中明确区分 OpenAPI 规范端点（已实现）与 Swagger UI 前端（未实现） |

**回滚方案**：本次仅修改 2 个 .md 文件，`git checkout -- extern-api/README.md extern-api/doc/重构api架构/README.md` 即可回滚。

---

## 7. 核心模块 AI 生成红色记录

**N/A** — 本次为零代码改动的纯文档对齐任务，不触发《核心模块AI生成红色记录》登记要求（H1 D5 已裁定）。

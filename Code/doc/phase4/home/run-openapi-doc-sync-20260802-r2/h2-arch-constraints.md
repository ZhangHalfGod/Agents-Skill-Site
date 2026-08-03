# 架构约束与执行计划（H2 — Architect）

**项目**：openapi-doc-sync  
**阶段**：H2（架构合规复核）  
**日期**：2026-08-02  
**产出者**：Architect（agent=arch）  
**上一跳**：H1 PM 范围清单（`h1-pm.scope-checklist.md`）  
**业务仓**：MechAssist-Fusion（分支 feature/Home_window）  
**run_dir**：`Code/doc/phase4/home/run-openapi-doc-sync-20260802-r2`

---

## 1. 复核结论

H1 范围清单经本跳原位复核（只读），**核心事实均确认无误**：

| 复核项 | H1 结论 | H2 复核 | 状态 |
|--------|---------|---------|------|
| `GET /api/openapi.json` 已实现 | ✅ openapiRoutes.js L16-L32 | 源码确认，路由完整 | 一致 |
| `GET /api/openapi.yaml` 已实现 | ✅ openapiRoutes.js L35-L57 | 源码确认，含 YAML 序列化 | 一致 |
| openapiGenerator.js 纯函数 | ✅ L293 起，~300 行 | 源码确认，generateOpenApiSpec() | 一致 |
| server/index.js L177 挂载 | ✅ `app.use('/api', apiLimiter, openapiRoutes)` | 源码确认 | 一致 |
| README.md L96「规划中，未实现」 | ❌ 需修改 | 原文：`**规划中，未实现**` | 一致 |
| 重构api架构/README.md L53「后续规划（未实现）」 | ❌ 需修改 | 原文：`**后续规划（未实现）**` | 一致 |
| extern-api 下其余 .md 无矛盾 | ✅ grep 全量确认 | 本跳独立 grep 复核 | 一致 |
| 业务仓其余 .md 无矛盾 | ✅ grep 全量确认 | 本跳独立 grep 复核 | 一致 |

**额外发现（r1 遗留线索复核）**：`server/catalog/registry.js` L255-L264 中 `system/docs` 模块 `implemented: true`，`API_PATHS.API_DOCS` 解析为 `/api/docs`——但 `server/routes/` 下**无 `/api/docs` 路由实现**（grep 全量 server/routes/*.js + server/index.js，无匹配）。此发现不纳入本期修改，仅写入 lesson_hint。

---

## 2. 架构约束 — 修改面白名单

本期变更面**仅 2 个 .md 文件，4 处文本替换**，供 H3 直接执行：

### M1：`extern-api/README.md` L96

**当前原文**（精确到行）：
```
- 结构化文档：`GET /api/docs`（OpenAPI 从 registry 生成：**规划中，未实现**）
```

**目标措辞**：
```
- 结构化文档：`GET /api/docs`（OpenAPI 规范：`GET /api/openapi.json` / `GET /api/openapi.yaml`（已实现，3.0.3，从 registry 自动生成）；Swagger UI 页面（`/api/docs`）另行规划）
```

### M2：`extern-api/doc/重构api架构/README.md` L49（可选修正）与 L53（主修改）

**L53 当前原文**（精确到行）：
```
**后续规划（未实现）**：从 `registry.js` 生成 OpenAPI 规范，供 Swagger UI 或 CI 契约校验使用。
```

**目标措辞**：
```
**已实现**：`GET /api/openapi.json` 与 `GET /api/openapi.yaml` 已从 `registry.js` 动态生成 OpenAPI 3.0.3 规范；Swagger UI 页面托管另行评估。
```

### M2b（可选）：`extern-api/doc/重构api架构/README.md` L49

**L49 当前原文**：
```
- 结构化文档：`GET /api/docs`
```

由于 `/api/docs` 路由未实现，此句保留不修改——不新增「已实现」误导，不删除规划信息。若 H3 觉得有必要同步修正为 `/api/openapi.*` 端点，**需经本跳同意**（见第 5 节裁定）。

### 措辞原则（H1 制定，H2 确认）

- `OpenAPI 规范生成` → **已实现**（`/api/openapi.json`、`/api/openapi.yaml`）
- `Swagger UI 页面 / API 文档浏览页（/api/docs）` → **未实现**，保留规划空间
- 不删除现有文档中的其他有效信息（如发布三元组、v2 目录）

---

## 3. 显式不做清单

| 禁止项 | 原因 | 来源 |
|--------|------|------|
| 修改 `server/routes/openapiRoutes.js` | 业务代码，已正确实现 | 用户需求 |
| 修改 `server/catalog/openapiGenerator.js` | 业务代码，已正确实现 | 用户需求 |
| 修改 `server/index.js` | 业务代码，路由已正确挂载 | 用户需求 |
| 修改 `server/test/openapi.test.js` | 测试代码，覆盖充分 | 用户需求 |
| 修改 `server/test/__snapshots__/openapi.snapshot.json` | 测试快照 | 用户需求 |
| 修改 `shared/apiPaths.js` | 路径常量，文档用 | 用户需求 |
| 修改 `server/catalog/registry.js` | 注册表，数据源（即使 implemented 与事实不一致） | 用户需求 + H1 decisions |
| 修改 extern-api 外任何文件 | 无矛盾表述 | 用户需求 |
| 修改 `extern-api/` 下其余 .md | grep 确认无矛盾 | H1/H2 复核 |
| Swagger UI 集成 | 用户明确排除 | 用户需求 |
| `/api/docs` 端点实现 | 不在本期范围 | 用户需求 |
| 新增任何文件 | 本期仅为修正 | H1 decisions |
| npm install / rebuild | 不构建不安装 | 用户需求 |
| git push | 用户明确排除 | 用户需求 |
| 飞书操作（doc/drive/wiki/bitable） | 飞书双写由 main 做 | H1 交接契约 |
| 起服务实测 | 实测留给 H3/H4 | H1 decisions |
| 写 token/key 进文件 | AGENTS.md 红线 | 用户需求 |

---

## 4. 验收口径

| 用户验收条件 | 映射到架构约束 | 验收方式（H3/H4 执行） |
|------------|--------------|---------------------|
| 「文档不再写未实现」 | M1、M2 目标措辞不含「未实现」；区分「生成已实现」vs「UI 另行规划」 | grep extern-api/\*.md：`OpenAPI`+`未实现` 或 `OpenAPI`+`规划中` **不应同时出现**在同一语义块 |
| 「端点描述与实测一致」 | M1 描述含 `/api/openapi.json`、`/api/openapi.yaml`、OpenAPI 3.0.3 | H3/H4 核对文档端点路径 vs 源码 openapiRoutes.js |
| 「H4 核对改动面仅文档」 | 白名单仅 2 个 .md 文件 | `git diff --stat` 仅显示 .md 文件；`git diff --cached`（若有）同理 |
| 「M2 后自动放行 H3」 | H2 产出本文即为放行信号 | 编排者执行 gate |

---

## 5. H1 open_questions 裁定

| # | H1 问题 | H2 裁定 | 理由 |
|---|---------|---------|------|
| Q1 | `/api/docs` 端点是否未来需要实现（Swagger UI / Redoc 托管页）？ | **建议后续独立规划，不在本期范围**。registry.js 中 `system/docs` 的 `implemented: true` 与路由缺失不一致，应单独评估是否实现 `/api/docs` 或修正 registry 的 implemented 字段。 | 本期仅做文档对齐，不改代码。`/api/docs` 与 OpenAPI 规范生成是两个独立事项：前者是 Swagger UI/Redoc 页面，后者是规范文件生成。本期不混入。 |
| Q2 | `doc/重构api架构/README.md` L49「结构化文档：GET /api/docs」是否需要修正为「OpenAPI 规范：GET /api/openapi.json」？ | **不修正**。L49 表述的是 `/api/docs`（文档浏览页，未实现），L53 表述的是 OpenAPI 规范生成（已实现）。修正 L53 即可——将「未实现」→「已实现」。若把 L49 也改成 `/api/openapi.json`，会丢失 `/api/docs` 的规划信息，且与 L53 修改形成冗余。 | 最小化改动原则；保留 `/api/docs` 作为独立规划项。 |
| Q3 | 是否需要在 README.md「后端目录」段新增独立条目描述 OpenAPI 端点？ | **不需要**。M1 修改已合并到 L96 行内——该行本来就描述「结构化文档 + OpenAPI」，改为描述已实现的 OpenAPI 端点即可，不新增独立条目以保持文档简洁。 | 最小化改动原则；L96 行已承载该语义。 |

---

## 6. 架构合规性检查

| 检查项 | 结论 | 备注 |
|--------|------|------|
| 分层与职责符合设计 | 通过 | 本期无代码变更，分层不变 |
| 无跨层调用或违规依赖 | 通过 | 仅 .md 修改，不涉及依赖 |
| 接口与契约一致 | 通过 | 文档修正后与源码实现一致 |
| 核心模块已完成红色记录 | **不适用** | 本期不改核心模块代码；registry.js implemented 不一致已记录 lesson_hint |
| 目录与命名符合规范 | 通过 | 不新增文件 |
| 依赖在允许清单内 | 通过 | 不安装/修改任何依赖 |
| 错误/超时/重试语义清晰 | 通过 | 不涉及运行时代码 |

---

## 7. 风险与回滚

| 风险 | 等级 | 缓解 | 回滚方式 |
|------|------|------|---------|
| M1/M2 措辞引发「OpenAPI 是否真的已实现」争议 | 低 | 措辞明确标注 3.0.3、端点路径、生成来源（registry.js） | git checkout 原文件 |
| `/api/docs` 未来实现后文档需再次修正 | 低 | M1 保留「Swagger UI 页面（`/api/docs`）另行规划」；M2 L49 不修改 | —— |
| L96 行长度增加（从 ~80 字扩到 ~120 字） | 低 | 仍在行内修改，不破坏 markdown 结构 | git checkout |
| registry.js `implemented: true` 与路由缺失后续引发混淆 | 中 | 已写入 lesson_hint，建议后续单独任务修正 registry 或实现路由 | 本期不改，后续单独任务回滚 |

---

## 8. Lesson Hint

- **registry.js system/docs implemented 不一致**：`server/catalog/registry.js` L255-L264 中 `system/docs` 模块声明 `implemented: true`（路径 `/api/docs`），但 `server/routes/` 下无对应路由实现，`server/index.js` 也未挂载 `/api/docs` 路由。这导致 `generateOpenApiSpec()` 生成的 OpenAPI 规范中会包含 `/api/docs` 端点描述（因为 openapiGenerator 仅按 `implemented !== false` 过滤），而实际无法访问此端点。**本期不改**，建议后续单独任务处理（修正 implemented 字段 或 实现路由）。
- 此 lesson 写入 `playbook-pack-h2.md` 的出门清单。

---

*本文由 Architect 产出，基于 H1 范围清单原位复核、源码只读探查与 MCP 角色自查。提交 DevLead（H3）执行文档修改。*

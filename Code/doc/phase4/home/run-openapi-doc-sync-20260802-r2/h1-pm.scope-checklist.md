# AI代码生成范围清单（H1 — ProductManager）

**项目**：openapi-doc-sync  
**短名**：openapi-doc-sync  
**阶段**：H1（需求拆解 & 范围界定）  
**日期**：2026-08-02  
**产出者**：ProductManager（agent=pm）  
**业务仓**：MechAssist-Fusion（分支 feature/Home_window）  
**run_dir**：`Code/doc/phase4/home/run-openapi-doc-sync-20260802-r2`

---

## 1. 目标

将 `extern-api` 目录下 OpenAPI 相关文档从"规划中/未实现"更新为"已实现"，与 `GET /api/openapi.json`、`GET /api/openapi.yaml` 两个已上线端点对齐。不改业务代码、不接 Swagger UI、不出红色记录。

### 成功画像

| 维度 | 标准 |
|------|------|
| 文档一致性 | extern-api 下所有 .md 文件中不再出现「OpenAPI 未实现 / 规划中」等与实现事实矛盾的表述 |
| 端点描述准确 | 文档中 OpenAPI 端点路径、格式、生成方式与实测一致（/api/openapi.json、/api/openapi.yaml） |
| 变更面 | H4 核对：仅 .md 文档被修改，无业务代码/路由/测试/配置变动 |
| 非目标 | 不改 openapiGenerator.js、不接 Swagger UI、不新增文件、不 git push |
| 业务指标 | 新开发者读文档后能直接访问 OpenAPI 端点，不再被误导为"未实现" |

---

## 2. 范围条目

### 2.1 原位探查结论（只读确认）

| 文件 / 端点 | 当前状态 | 证据 |
|------------|---------|------|
| `server/routes/openapiRoutes.js` | ✅ 已实现 `GET /api/openapi.json`（L16–L32）+ `/api/openapi.yaml`（L35–L57） | 源码阅读确认 |
| `server/catalog/openapiGenerator.js` | ✅ 已实现 `generateOpenApiSpec()`，从 registry LAYERS + API_PATHS 生成 OpenAPI 3.0.3 | 源码阅读确认（L293 起，~300 行纯函数） |
| `server/index.js` L177 | ✅ openapiRoutes 已挂载：`app.use('/api', apiLimiter, openapiRoutes)` | 源码阅读确认 |
| `server/test/openapi.test.js` | ✅ 含完整测试（结构验证、快照、YAML 往返，~260 行） | 源码阅读确认 |
| `server/test/__snapshots__/openapi.snapshot.json` | ✅ 快照文件存在，openapi=3.0.3 | 源码阅读确认 |
| `extern-api/README.md` L96 | ❌ 写"OpenAPI 从 registry 生成：**规划中，未实现**" | 源码阅读确认 |
| `extern-api/doc/重构api架构/README.md` L53 | ❌ 写"**后续规划（未实现）**：从 registry.js 生成 OpenAPI 规范" | 源码阅读确认 |
| extern-api 下其余 .md | ✅ 无矛盾表述 | grep 全量扫描确认 |
| 业务仓其余 .md（`doc/` 等，extern-api 外） | ✅ 无矛盾表述 | grep 全量扫描确认 |

### 2.2 修改条目（P0）

| # | 文件（相对业务仓 extern-api/） | 当前位置 | 当前表述 | 修改动作 | 优先级 | 核验方式 |
|---|----------------------------|---------|---------|---------|--------|---------|
| M1 | `README.md` | L96（"后端目录"段） | "结构化文档：`GET /api/docs`（OpenAPI 从 registry 生成：**规划中，未实现**）" | 替换为描述已实现端点。建议措辞："OpenAPI 3.0.3 规范：`GET /api/openapi.json` / `GET /api/openapi.yaml`（从 registry 自动生成）；Swagger UI 页面（`/api/docs`）另行规划。" | P0 | 代码核验 |
| M2 | `doc/重构api架构/README.md` | L53（"后续规划"段） | "**后续规划（未实现）**：从 `registry.js` 生成 OpenAPI 规范，供 Swagger UI 或 CI 契约校验使用。" | 改为"**已实现**：`GET /api/openapi.json` 与 `GET /api/openapi.yaml` 已从 `registry.js` 动态生成 OpenAPI 3.0.3 规范；Swagger UI 页面托管另行评估。" | P0 | 代码核验 |

**措辞原则**：
- 「OpenAPI 规范生成」→ 已实现（/api/openapi.json，/api/openapi.yaml）
- 「Swagger UI 页面 / API 文档浏览页（/api/docs）」→ 未实现，保留规划空间
- 不删除现有文档中的其他有用信息（如发布三元组、v2 目录）

### 2.3 不修改条目（显式不做）

| 文件 / 动作 | 原因 |
|------------|------|
| `server/routes/openapiRoutes.js` | 业务代码，已正确实现 |
| `server/catalog/openapiGenerator.js` | 业务代码，已正确实现 |
| `server/index.js` | 业务代码，路由已正确挂载 |
| `server/test/openapi.test.js` | 测试代码，覆盖充分 |
| `server/test/__snapshots__/openapi.snapshot.json` | 测试快照，不涉及文档描述 |
| `shared/apiPaths.js` | 路径常量，不涉及 OpenAPI 文档描述 |
| `server/catalog/registry.js` | 注册表，OpenAPI 的数据源，不涉及文档描述 |
| Swagger UI 集成 | 用户明确排除 |
| `.env` / `.env.example` | 含密钥/配置，禁止触碰 |
| `package.json` / `package-lock.json` | 不安装/不构建 |
| `extern-api/` 外其他 .md | 无矛盾表述，无需修改 |

### 2.4 新增条目

无。本期不新增任何文件。

---

## 3. 验收口径（逐条映射用户验收）

| 用户验收条件 | 映射到清单条目 | 验收方式 |
|------------|--------------|---------|
| "文档不再写「未实现」" | M1, M2 | grep extern-api 下所有 .md，「OpenAPI」「未实现」「规划中」不应同时出现在同一语义块中 |
| "端点描述与实测一致" | M1（新描述须包含 `/api/openapi.json`、`/api/openapi.yaml`，标注 OpenAPI 3.0.3） | H3/H4 阶段核对文档内容 vs 源码实现 |
| "H4 核对改动面仅文档" | 范围条目 2.2 仅列 2 个 .md 文件 | git diff --stat 仅显示 .md 文件 |
| "M2 后自动放行 H3" | `decisions` 中注明 | 编排者执行 gate |

---

## 4. 约束引用

| 约束 | 来源 |
|------|------|
| 只做文档对齐，不改业务代码 | 用户需求「不做：改生成器/路由/测试」 |
| 不接 Swagger UI | 用户需求「不做：接 Swagger UI」 |
| 不起服务（实测留给 H3/H4） | 用户需求 |
| 不提交密钥 | 用户需求 + AGENTS.md 红线 |
| 不 git push | 用户需求 |
| 不 npm install/rebuild | 用户需求 |
| 不 process poll 旧进程；防空转；超时上报 | 用户需求 |
| 禁止 feishu_doc/feishu_drive | H1 交接契约（飞书双写由 main 做） |
| 文件 UTF-8，优先 node 写 | H1 交接契约 |

---

## 5. 风险与回滚

| 风险 | 等级 | 缓解 |
|------|------|------|
| 改文档时误删有效信息（如 Swagger UI 规划标注） | 低 | M1、M2 修改处保留"Swagger UI 页面另行规划/评估"；不删除未来规划 |
| `/api/docs` 端点后续单独实现导致文档再次过时 | 低 | M1 修改处明确区分 `/api/openapi.*`（已实现）与 `/api/docs`（另行规划） |
| 文档表述精度争议（是否区分"生成"与"托管 UI"） | 低 | 两条修改均明确标注：生成=已实现，UI 托管=另行评估 |

回滚方式：git checkout 原文件即可，无破坏性变更。

---

## 6. 干系人

| 角色 | 职责 | 本期参与 |
|------|------|---------|
| ProductManager（pm） | H1 范围清单 | ✅ 本期 |
| 架构师（arch） | H2 架构合规复核 | ⏳ 待交接 |
| 开发负责人 | H3 文档修改执行 | ⏳ 待交接 |
| 编排者（main） | 飞书双写、gate 放行 | ⏳ 持续 |

---

## 7. 非目标 / 假设

| 项 | 说明 |
|----|------|
| 非目标：Swagger UI 集成 | 用户明确排除 |
| 非目标：`/api/docs` 端点实现 | 文档中提及但未实现，不在本期范围 |
| 非目标：openapiGenerator.js 修改 | 生成逻辑已正确，无需改动 |
| 非目标：测试用例修改 | 现有测试充分 |
| 非目标：起服务实测 | 本期仅只读探查；实测留给 H3/H4 |
| 假设：`GET /api/openapi.json` 和 `/api/openapi.yaml` 的返回值在文档修改期间不会发生代码变更 | 本期仅修改文档，代码不动。若代码侧有并发变更，需重新核对 |
| 假设：`/api/docs` 端点未来仍可能单独实现 | 文档修改时保留这一可能性说明 |

---

## 8. Lesson Hint（待 H4 补充）

本期为纯文档对齐任务，预期无 deep lesson。若有踩坑（如 grep 遗漏、文档间引用不一致等），H4 复盘时写入 `operations/mechassist-openapi/lessons/`。

---

*本清单由 ProductManager 根据原位探查（只读）与 MCP 角色真源产出，提交架构师（H2）复核。*

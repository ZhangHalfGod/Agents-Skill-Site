[h3-run-wrapper] WorkDir=E:\zhangchangWork\Work_Space\Trae_Study\MechAssist-Fusion node=C:\Users\Administrator\AppData\Local\cursor-agent\versions\2026.07.23-e383d2b\node.exe
## H3 文档对齐完成

Phase 0 基线：分支 `feature/Home_window`；目标两文件仍为「未实现」原样；无关改动（`debug.txt`、方案C 文档等）未触碰。已按 M1/M2 整行替换，M2b 未改；改动面仅 2 个 `.md`、各 1 行。

### 修改前后对照

**M1** `extern-api/README.md`（原 L96）
- 前：`- 结构化文档：`GET /api/docs`（OpenAPI 从 registry 生成：**规划中，未实现**）`
- 后：`- 结构化文档：`GET /api/docs`（OpenAPI 规范：`GET /api/openapi.json` / `GET /api/openapi.yaml`（已实现，3.0.3，从 registry 自动生成）；Swagger UI 页面（`/api/docs`）另行规划）`

**M2** `extern-api/doc/重构api架构/README.md`（原 L53）
- 前：`**后续规划（未实现）**：从 `registry.js` 生成 OpenAPI 规范，供 Swagger UI 或 CI 契约校验使用。`
- 后：`**已实现**：`GET /api/openapi.json` 与 `GET /api/openapi.yaml` 已从 `registry.js` 动态生成 OpenAPI 3.0.3 规范；Swagger UI 页面托管另行评估。`

**M2b**：`- 结构化文档：`GET /api/docs`` 保留原样（未改）。

### 自检
- grep `extern-api/**/*.md`：无「OpenAPI + 未实现/规划中」同语义块；目标措辞（`/api/openapi.json`、`/api/openapi.yaml`、`3.0.3`）已落地
- `git diff --stat`：`2 files changed, 2 insertions(+), 2 deletions(-)`，仅白名单两文件各一行

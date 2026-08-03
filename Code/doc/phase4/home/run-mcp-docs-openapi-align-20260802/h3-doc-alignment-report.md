[h3-run-wrapper] WorkDir=E:\zhangchangWork\Work_Space\Trae_Study\MechAssist-Fusion node=C:\Users\Administrator\AppData\Local\cursor-agent\versions\2026.07.23-e383d2b\node.exe
已完成。仅改 `doc/方案C/方案C_文档对齐/MCP接入文档.md`（175→199 行），四处增补如下。

## 改动说明

| 项 | 位置 | 内容 |
|----|------|------|
| M2 | §2.1 入口表 | 「发布探测」后追加：发现目录 / OpenAPI 规范 / 结构化文档 |
| M4 | §7 | 新增步骤 7（`/v2/` + `/api/openapi.json`，端口 3002） |
| M3 | §8 索引表末 | 追加 extern-api README、重构 api 架构两条链接（`../../../extern-api/...`） |
| M1 | 版权行前 | 新增 §9「API 发现与文档」 |

## 新 §9 全文

```markdown
## 9. API 发现与文档

### 9.1 端点索引

| 端点 | 端口 | 方法 | 鉴权 | 说明 | 同源 |
|------|------|------|------|------|------|
| `GET /v2/` | 3002 | GET | 无需 | 四层发现目录（auth/chat/business/admin/system） | registry.js → v2Catalog.js |
| `GET /api/openapi.json` | 3002 | GET | 无需 | OpenAPI 3.0.3 规范（JSON） | registry.js → openapiGenerator.js |
| `GET /api/openapi.yaml` | 3002 | GET | 无需 | OpenAPI 3.0.3 规范（YAML） | 同上 |
| `GET /api/docs` | 3002 | GET | 无需 | 结构化文档（与 /v2/ 同源） | registry.js |

### 9.2 同源说明

以上四个端点共享单一数据真源——`server/catalog/registry.js`（`LAYERS` + `shared/apiPaths.js`）。OpenAPI JSON/YAML 规范由 `openapiGenerator.js` 动态生成；v2 发现目录由 `v2Catalog.js` 路由提供。新增 API 只需更新 registry，发现目录与 OpenAPI 文档自动同步。
```

## 自检

- M1：§9 四行索引 + 同源段齐全；无「404/未实现/规划中」
- M2：§2.1 三行已追加，口径与 extern-api README L95-96 一致
- M3：§8 两条相对路径 `../../../extern-api/...` 正确
- M4：§7 步骤 7 路径为 `localhost:3002`
- 未 commit / push；未改其他文件

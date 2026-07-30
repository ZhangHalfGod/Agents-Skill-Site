交付物已落盘。下面是完整回复：

---

# H1 AI代码生成范围清单 — OpenAPI YAML 端点

> **项目**: MechAssist-Fusion / extern-api  
> **日期**: 2026-07-30  
> **阶段**: H1（需求跳→架构跳）  
> **产出者**: ProductManager  
> **父需求**: 在已有 `GET /api/openapi.json` 基础上新增 `GET /api/openapi.yaml`

---

## 1. 目标

在已有 `GET /api/openapi.json`（OpenAPI 3.0.3 JSON，含 `info.x-generator: "mechassist-openapi"`）基础上，新增 `GET /api/openapi.yaml`，返回**语义等价、同源的 YAML 格式** OpenAPI 规范，`Content-Type: application/yaml`。

**核心原则**：YAML 与 JSON 共享同一个 `generateOpenApiSpec()` 调用，仅序列化格式不同——不引入第二套生成逻辑。

---

## 2. 改动文件清单

### 2.1 修改文件

| # | 文件（相对 extern-api/） | 改动内容 | 行数估算 | 风险 |
|---|-------------------------|---------|---------|------|
| M1 | `server/routes/openapiRoutes.js` | ① 新增 `import yaml from 'js-yaml'`（已存在于 node_modules，零安装）；② 新增 `router.get('/openapi.yaml', ...)` — 调用同一 `generateOpenApiSpec()` 后 `res.type('application/yaml').send(yaml.dump(spec))` | +8 行（1 import + ~7 handler） | 极低（纯增量，不改现有路由） |
| M2 | `server/test/openapi.test.js` | 新增 YAML 相关测试用例：① `GET /api/openapi.yaml returns 200 with Content-Type yaml`；② `yaml parse back matches json spec in key fields (openapi / info.x-generator / paths keys)` | +~30 行 | 极低（新增 describe 块） |

### 2.2 不修改文件（显式确认）

| 文件 | 不修改理由 |
|------|----------|
| `server/catalog/openapiGenerator.js` | `generateOpenApiSpec()` 返回相同 JS 对象即可——JSON/YAML 序列化在路由层完成 |
| `server/catalog/registry.js` | 不受影响 |
| `shared/apiPaths.js` | 不受影响 |
| `server/routes/chatRoutes.js` | 热路径，禁止触碰 |
| `server/index.js` | 无需改动——`openapiRoutes` 已挂载在 `/api` |
| `server/test/` 下任何其他 `.test.js` | 存量测试零改动 |

### 2.3 依赖情况

| 依赖 | 状态 | 说明 |
|------|------|------|
| `js-yaml` | ✅ 已在 `node_modules`（非直接 dep，可用） | 其他包的传递依赖，已验证 `require('js-yaml')` 成功。不新增依赖，不跑 `npm install` |

---

## 3. 路由设计

```
GET /api/openapi.json   → res.json(spec)          ← 已有，不修改
GET /api/openapi.yaml   → yaml.dump(spec) .type()  ← 新增
```

两个路由共享同一个 `generateOpenApiSpec({ LAYERS, API_PATHS, ... })` 调用，确保语义等价。`js-yaml` 的 `dump()` 默认 `flowLevel: -1`（block style），适合人类阅读。

---

## 4. 非功能性约束

| 约束 | 说明 |
|------|------|
| **不改热路径** | `chatRoutes.js`、`registry.js`、`apiPaths.js`、`index.js` 均不受影响 |
| **不装包** | `js-yaml` 已在 node_modules，不跑 `npm install` / `npm rebuild` |
| **不 git push** | 仅本地改动 |
| **不引入新生成器** | `generateOpenApiSpec()` 不做任何修改 |
| **Content-Type** | `application/yaml`（非 `text/yaml`），与 OpenAPI 生态一致 |

---

## 5. 验收清单

| # | 条件 | 验收方式 |
|---|------|---------|
| ① | `GET /api/openapi.json` HTTP 200（存量不退化） | 自动化测试 |
| ② | `GET /api/openapi.yaml` HTTP 200，`Content-Type` 含 `yaml` | 自动化测试 + 手工 curl |
| ③ | YAML 解析回对象后，`openapi` === `"3.0.3"` | 自动化测试 |
| ④ | YAML 解析回对象后，`info["x-generator"]` === `"mechassist-openapi"` | 自动化测试 |
| ⑤ | YAML 对象的 `paths` 键集合 === JSON 对象的 `paths` 键集合（共 28 条路径） | 自动化测试 |
| ⑥ | `npm run test:server` 全部通过，存量 15 个测试文件无 regression | CI / 手工 |
| ⑦ | `git status` 改动文件 ⊆ `server/routes/openapiRoutes.js` + `server/test/openapi.test.js`（± 快照更新） | 手工检查 |

---

## 6. 对等性声明（JSON ↔ YAML 等价）

由于 YAML 是 JSON 的超集，且 `js-yaml.dump()` 不丢失 JS 对象信息，**只要 YAML 与 JSON 共享同一个 `generateOpenApiSpec()` 输出**，则语义等价天然成立。测试通过反向解析（`yaml.load()` 回 JS 对象）验证关键字段一致性即可。

等价性覆盖范围：
- `openapi` 版本号
- `info.title` / `info.version` / `info["x-generator"]`
- `paths` 键集合（28 条）
- `servers[0].url`
- `components.securitySchemes`

**不要求**逐字段深度对比——YAML 的换行/缩进不影响语义等价。

---

## 7. 风险与待定项

| 项 | 说明 |
|----|------|
| `js-yaml` 间接依赖 | 虽然当前可用，但非直接依赖——若上游移除或升级导致路径变化，可能不可用。缓解：测试中已断言 yaml 可 import；若未来失效，改用自实现简版 YAML serializer（JSON → YAML 纯字符串替换，成本极低） |
| 快照测试 | 现有 JSON 快照不受 YAML 端点影响——快照只跑在 JSON 生成测试上，不涉 YAML 序列化 |
| 无 YAML 快照 | 不引入 YAML 快照（避免维护两份等价快照）。YAML 正确性通过反向解析验证——只要解析回 JS 对象且关键字段一致即可 |

---

## 8. 门禁自检

- [x] 每条 P0 均有可执行验收标准（§5）
- [x] 核心/网关/安全相关——不适用（本次改动为普通模块，不触发红色记录）
- [x] 非目标与范围边界已写明（§2.2 明确不修改清单）
- [x] 当前阶段输入/输出/审核状态已标明
- [x] 本阶段无新教训

---

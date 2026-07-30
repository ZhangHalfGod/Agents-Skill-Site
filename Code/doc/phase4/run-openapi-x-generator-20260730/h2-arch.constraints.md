# 架构约束分析 — x-generator 扩展字段

> 项目：MechAssist-Fusion / extern-api  
> 文档 ID：h2-arch.constraints  
> 日期：2026-07-30  
> 对应 H1 决策摘要：只改 3 个文件，禁改热路径、禁 npm 操作、禁 git push

---

## 1. 模块依赖拓扑

### 1.1 当前调用链

```
openapiRoutes.js (GET /api/openapi.json handler)
  └─ 调用 generateOpenApiSpec({ LAYERS, API_PATHS, serviceName, serviceVersion, serverUrl })
       └─ 纯函数，返回 OpenAPI 3.0.3 规范 JSON
           └─ controller 做 res.json(spec)
```

### 1.2 受影响的模块（需要知道此变更）

| 模块 | 影响等级 | 说明 |
|------|----------|------|
| `openapiGenerator.js` | **直接改** | info 对象新增一行 `info['x-generator'] = 'mechassist-openapi'` |
| `openapi.test.js` | **新增测试** | 增加 2 条 it 块：单元测试验证 x-generator 值；集成测试验证 GET /api/openapi.json 包含该字段 |
| `__snapshots__/openapi.snapshot.json` | **自动更新** | 快照文件需重新生成以包含新字段（`--update-snapshots`） |

### 1.3 明确不受影响的模块

| 模块 | 不受影响的原因 |
|------|----------------|
| `registry.js` | 未修改 LAYERS、SERVICE_NAME、SERVICE_VERSION，不涉及 |
| `apiPaths.js` | 路径集合无变化 |
| `openapiRoutes.js` | 不修改 router，仅返回值内的 info 对象多一个字段，express res.json() 自然序列化 |
| `chatRoutes / chatService / ...` | 任何 handler 都不知道 x-generator |
| `index.js` | 应用入口不关心 OpenAPI spec 内容 |
| `middleware/auth.js` | 无影响，x-generator 只是 info 对象的一个字符串属性 |
| 任何热路径（request/response handler） | x-generator 仅在生成 spec 时设置一次，不参与运行时请求处理 |

### 1.4 拓扑图（ASCII）

```
                        ┌──────────────────────┐
                        │   openapiRoutes.js    │
                        │ (GET /api/openapi.json)│
                        └──────────┬───────────┘
                                   │ 调用
                                   ▼
                        ┌──────────────────────┐
                        │ openapiGenerator.js   │
                        │                       │
                        │ info = {              │
                        │   title,              │
                        │   version,            │
                        │   description,        │
                        │   x-generation-       │
                        │     warnings (cond),  │
                        │ ┌► x-generator      ◄─┐ ← 新增一行
                        │ │  (always)  }        │
                        └──────────────────────┘
                                   │ 返回
                                   ▼
 res.json(spec)  ──────→  HTTP 响应包含 x-generator

 测试层：
 ┌───────────────────────┐
 │ openapi.test.js        │
 │  ├ it "x-generator     │
 │  │    exists in info"  │ ← buildSpec() 直接测
 │  └ it "GET /api/       │
 │       openapi.json     │ ← 集成测，verify 返回含字段
 │       includes field"  │
 │ 快照: openapi.snapshot │ ← 自动更新
 │       .json            │
 └───────────────────────┘
```

---

## 2. 改点位置精确约束

### 2.1 物理位置

**文件**: `extern-api/server/catalog/openapiGenerator.js`  
**函数**: `generateOpenApiSpec` 尾部，info 对象构造完毕之后、return 之前。

### 2.2 精确行范围

```
约 L241  ┐
         │ const info = {
         │   title: serviceName,
         │   version: serviceVersion,
         │   description: '从 registry LAYERS 自动生成的 OpenAPI 规范'
         │ }
L247 (if)▼ if (generationWarnings.length) {
         │   info['x-generation-warnings'] = generationWarnings
         │ }
         │
         │ ══════ 新增插入点（L251 之后）══════
         │ info['x-generator'] = 'mechassist-openapi'
         │ ════════════════════════════════════
         │
         │ return {
         │   openapi: '3.0.3',
         │   info,        ← info 对象已经被修改
         │   ...
         │ }
         └─
```

### 2.3 行约束

- 必须写在 `if (generationWarnings.length) { ... }` 块**之后**
- 必须写在 `return { ... }` 语句**之前**
- 不允许修改 info 对象的构造方式（不要改为 `info['x-generator'] = ...` 后再字面量构造——使用现有 `info` 引用追加）

### 2.4 代码方案（唯一正确写法）

```js
// 在 generationWarnings 块之后，return 之前插入这一行：
info['x-generator'] = 'mechassist-openapi'
```

### 2.5 禁止的做法

- ❌ 在 info 字面量内部插入 `x-generator`（会分散注意力，增加未来合并冲突）
- ❌ 新建一个变量重新组装 info（不必要的间接层）
- ❌ 修改其他函数（expressToOpenApiPath、buildOperationFromLayer 等）
- ❌ 添加依赖项、第三方库、或自定义序列化器

---

## 3. 测试架构影响

### 3.1 现有测试结构概述

| Describe 块 | 方式 | 说明 |
|-------------|------|------|
| OpenAPI 3.0 structure is valid | `buildSpec()` | 单元测试，直接调用 `generateOpenApiSpec` |
| paths covers all API_PATHS entries | `buildSpec()` | 单元测试 |
| GET /api/openapi.json returns valid OpenAPI 3.0 | Express app + HTTP 请求 | 集成测试 |
| key endpoints method/auth/parameters | `buildSpec()` | 单元测试 |
| openapi.json matches snapshot | `buildSpec()` | 快照对比测试 |
| （新增）x-generator 单元测试 | `buildSpec()` | 单元测试，验证 info['x-generator'] |
| （新增）x-generator 集成测试 | HTTP 请求 | 集成测试，验证 GET /openapi.json 包含 |

### 3.2 安全的测试注入点

**测试 A — 单元测试（放在 "OpenAPI 3.0 structure is valid" 块内或新建块）**

```js
describe('OpenAPI info includes x-generator', () => {
  it('has x-generator = mechassist-openapi', () => {
    const spec = buildSpec()
    assert.equal(spec.info['x-generator'], 'mechassist-openapi')
  })
})
```

- **安全原因**：`buildSpec()` 已经是成熟的测试 helpers，传入参数固定，没有状态污染。
- **测试隔离**：这是纯数据断言，不会影响后续测试的全局状态。

**测试 B — 集成测试（放在 "GET /api/openapi.json returns valid OpenAPI 3.0" 块内或新建块）**

```js
it('response includes x-generator field in info', async () => {
  const app = express()
  app.use('/api', openapiRoutes)
  const { json } = await request(app, '/api/openapi.json')
  assert.equal(json.info['x-generator'], 'mechassist-openapi')
})
```

- **安全原因**：`request()` 每次创建独立的 `app.listen(0)` 服务器，端口随机、用完关闭，不与其他测试冲突。
- **注意**：此测试的 Express app 实例与 "returns HTTP 200 with openapi 3.0.3" 测试是**独立**的，没有共享状态。

### 3.3 快照更新影响

| 方面 | 分析 |
|------|------|
| **快照文件** | `extern-api/server/test/__snapshots__/openapi.snapshot.json` |
| **变更量** | info 对象增加一个 key-value，diff 为 +1 行 |
| **更新方式** | `npm run test:server -- --update-snapshots` 或 `$env:UPDATE_OPENAPI_SNAPSHOT=1` |
| **风险** | 极低。快照对比是精确 JSON 字符串匹配；新增字段只会增加快照内容，不会导致现有测试失败（除非 CI 流程会阻止快照变更）。TDD 模式下先更新快照再提交即可。 |
| **CI/CD 注意** | 确保 CI 中有 `--update-snapshots` 步骤或允许快照变更通过。 |

---

## 4. 接口契约

### 4.1 generateOpenApiSpec 入参（不变）

```typescript
interface GenerateOptions {
  LAYERS: Layer[]           // 必填，unchanged
  API_PATHS: Record<string, string>  // 必填，unchanged
  serviceName?: string      // 默认 "MechAssist AI Extern API"
  serviceVersion?: string   // 默认 "1.0.0"
  serverUrl?: string        // 默认 "http://localhost:{PORT}"
  pathFallbacks?: Record<string, PathFallback>  // 可选
}
```

**无变化**：此扩展不新增、不修改、不废弃任何入参。

### 4.2 generateOpenApiSpec 返回值（仅 info 对象变异）

```typescript
interface OpenApiSpec {
  openapi: '3.0.3'
  info: {
    title: string
    version: string
    description: string
    'x-generation-warnings'?: string[]       // 条件性存在，unchanged
    'x-generator': 'mechassist-openapi'      // ← 新增，总是存在
  }
  servers: Array<{ url: string }>
  paths: Record<string, PathItem>
  components: { securitySchemes: { bearerAuth: BearerScheme } }
}
```

| 返回值属性 | 变更 | 兼容性 |
|-----------|------|--------|
| `info.title` | 不变 | 完全向前兼容 |
| `info.version` | 不变 | 完全向前兼容 |
| `info.description` | 不变 | 完全向前兼容 |
| `info['x-generation-warnings']` | 不变 | 完全向前兼容 |
| `info['x-generator']` | **新增** | 🟢 向前兼容（符合 OpenAPI 规范：以 `x-` 前缀为扩展字段，不影响标准工具解析） |
| `paths` | 不变 | 完全向前兼容 |
| 其他顶层字段 | 不变 | 完全向前兼容 |

### 4.3 消费者兼容性分析

| 消费者类型 | 影响 | 说明 |
|-----------|------|------|
| **现有 REST 客户端** | **无影响** | x-generator 是额外字段，标准 OpenAPI 工具链（Swagger UI、Redoc、OpenAPI Generator）将 `x-*` 视为扩展、静默忽略或保留 |
| **前端代码** | 无影响 | 未读 info 字段 |
| **下游 API 网关** | 无影响 | 网关通常转发 JSON payload，不验证 info 字段模式 |
| **快照测试** | 需要更新 | 快照精确匹配，新增字段导致 assert.fail，需要 `--update-snapshots` |

---

## 5. 隐式依赖分析

### 5.1 x-generator 不触发任何隐含处理

此为**纯元数据标注**。以下是所有可能被误判为隐含逻辑的分析：

| 隐式处理路径 | 是否触发 | 理由 |
|-------------|---------|------|
| Router/middleware 链 | ❌ 不触发 | openapiRoutes.js 中 x-generator 只是返回 JSON 的一部分，router 不解析 info 内容 |
| Express 序列化拦截 | ❌ 不触发 | res.json() 对普通 JSON Object 与包含 `x-` 字段的对象序列化行为完全一致 |
| registry.js 读取 | ❌ 不触发 | generateOpenApiSpec 的入参不依赖 x-generator；registry 处于调用链上游 |
| chatRoutes handler 过滤 | ❌ 不触发 | chatRoutes 完全独立，且此变更不修改路由注册 |
| V2 发现入口（V2_ROOT） | ❌ 不触发 | V2_ROOT 是 path 下的端点定义，x-generator 属于 info 下的元数据，独立命名空间 |
| 权限校验 | ❌ 不触发 | x-generator 不参与 JWT/security 体系 |
| 日志/监控 | ❌ 不触发 | openapiRoutes 中没有基于 info 内容的日志逻辑 |
| 缓存/ETag | ❌ 不触发 | 响应体变更自然导致 ETag 变化，但这是 HTTP 缓存机制的预期行为，非隐含逻辑 |
| OpenAPI 规范校验 | ❌ 不触发 | 项目中无运行时 OpenAPI schema 校验器 |
| `x-generation-warnings` 耦合 | ❌ 不触发 | 两者虽在同一个 info 对象内，但生成时机和条件完全独立：x-generation-warnings 有条件生成，x-generator 总是生成 |

### 5.2 序列化保证

`info['x-generator'] = 'mechassist-openapi'` 在 `return` 之前写入 info 对象，然后整个 spec 对象通过 `JSON.stringify`（由 `res.json()` 内部调用）序列化。由于：

- `x-generator` 是合法的 JavaScript 属性键（含连字符需用方括号记法）
- 字符串值 `'mechassist-openapi'` 无特殊字符，JSON.stringify 直接输出
- 字段顺序：取决于 V8 对象属性顺序规则（数字键优先、字符串键按插入顺序），`x-generator` 将出现在 `x-generation-warnings`（如存在）之后

因此序列化输出稳定可预测，快照更新后不会因字段顺序变化导致反复失败。

### 5.3 运行时安全性

- x-generator 是纯字符串常量，不包含用户输入
- 不参与 eval、template literal、或任何动态代码执行
- 不触发任何异步 I/O 或网络请求

---

## 6. 变更操作清单

| 步骤 | 文件 | 操作 | 验证 |
|------|------|------|------|
| 1 | `openapiGenerator.js` | `info['x-generator'] = 'mechassist-openapi'` 插入一行 | 代码审查 |
| 2 | `openapi.test.js` | 新增 2 个 it 块（单元+集成） | `npm run test:server` 通过 |
| 3 | `openapi.snapshot.json` | `--update-snapshots` 自动更新 | git diff 确认只新增 x-generator 字段 |

### 建议提交 message

```
feat(extern-api): add x-generator to OpenAPI info block

- Insert info['x-generator'] = 'mechassist-openapi' in generateOpenApiSpec
- Add 2 test cases: unit (buildSpec) + integration (HTTP endpoint)
- Regenerate snapshot to include new field

H1 scope: 3 files only, no route/registry changes
```

---

## 附录 A：验证命令

```bash
# 单元+集成测试（含快照更新）
cd extern-api/server
npm run test:server -- --update-snapshots

# 验证快照 diff 仅含 x-generator
git diff extern-api/server/test/__snapshots__/openapi.snapshot.json

# 手动 curl 验证
curl http://localhost:3002/api/openapi.json | grep x-generator
# 应输出: "x-generator": "mechassist-openapi"
```

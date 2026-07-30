# 架构约束与接口 — Registry → OpenAPI 3.0

> **项目**: mechassist-openapi（MechAssist-Fusion / extern-api）  
> **阶段**: H2（架构跳 → 代码跳）  
> **产出者**: Architect  
> **日期**: 2026-07-30  
> **交付物 kind**: arch-constraints  
> **参照**: H1 scope-list（`AI代码生成范围清单_registry-openapi.md`）

---

## 1. 分层与模块职责

```
┌─────────────────────────────────────────────────┐
│  index.js  (Express app)                        │
│  ┌───────────────────────────────────────────┐  │
│  │  openapiRoutes.js  (HTTP 层)              │  │
│  │  GET /api/openapi.json → 调用生成器       │  │
│  └───────────────┬───────────────────────────┘  │
│                  │ import & call                 │
│  ┌───────────────▼───────────────────────────┐  │
│  │  openapiGenerator.js  (核心层 ★红色记录)  │  │
│  │  纯函数：{LAYERS, API_PATHS, config} →    │  │
│  │  OpenAPI 3.0.3 JSON 对象                  │  │
│  └───────────────┬───────────────────────────┘  │
│                  │ import (read-only)             │
│  ┌───────────────▼───────────────────────────┐  │
│  │  registry.js  (数据源)                    │  │
│  │  LAYERS / SERVICE_NAME / SERVICE_VERSION   │  │
│  │  API_PATHS (shared/apiPaths.js)            │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**职责边界：**

| 模块 | 层 | 职责 | 不允许 |
|------|-----|------|--------|
| `openapiGenerator.js` | 核心层 | 纯数据转换：LAYERS+API_PATHS→OpenAPI 3.0.3 对象 | 不 import Express；不读写文件系统；不访问 req/res；不修改 LAYERS |
| `openapiRoutes.js` | 路由层 | HTTP 端点：接收 GET 请求，调用生成器，返回 JSON | 不包含生成逻辑；不绕过生成器直接构造 OpenAPI |
| `index.js` | 组装层 | 挂载路由 `app.use('/api', apiLimiter, openapiRoutes)` | 不包含 OpenAPI 生成或路由逻辑 |

**依赖方向**：`index.js → openapiRoutes.js → openapiGenerator.js → registry.js + apiPaths.js`（单向，无环）

---

## 2. openapiGenerator.js 精确入参/出参签名

### 2.1 模块导出

```js
/**
 * 从 registry LAYERS + API_PATHS 生成 OpenAPI 3.0.3 规范对象
 *
 * @param {Object} options - 生成选项
 * @param {Array}  options.LAYERS - registry.js 的 LAYERS 数组（必填）
 * @param {Object} options.API_PATHS - shared/apiPaths.js 的 API_PATHS 映射（必填）
 * @param {string} options.serviceName - SERVICE_NAME（必填，默认 "MechAssist AI Extern API"）
 * @param {string} options.serviceVersion - SERVICE_VERSION（必填，默认 "1.0.0"）
 * @param {string} [options.serverUrl] - OpenAPI servers[].url（可选，默认 "http://localhost:{PORT}"）
 * @param {Object} [options.pathFallbacks] - LAYERS 未注册路径的元数据补充（可选，含默认值）
 * @returns {Object} OpenAPI 3.0.3 规范的纯 JSON 对象
 */
export function generateOpenApiSpec(options) {
  // ...
}
```

### 2.2 出参结构（顶层骨架）

```json
{
  "openapi": "3.0.3",
  "info": {
    "title": "<serviceName>",
    "version": "<serviceVersion>",
    "description": "从 registry LAYERS 自动生成的 OpenAPI 规范"
  },
  "servers": [
    { "url": "<serverUrl>" }
  ],
  "paths": {
    "/api/auth/register": { "post": { ... } },
    "/api/auth/login":    { "post": { ... } },
    ...
  },
  "components": {
    "securitySchemes": {
      "bearerAuth": { "type": "http", "scheme": "bearer", "bearerFormat": "JWT" }
    }
  }
}
```

### 2.3 调用示例

```js
import { LAYERS, SERVICE_NAME, SERVICE_VERSION } from '../catalog/registry.js'
import { API_PATHS } from '../../shared/apiPaths.js'
import { generateOpenApiSpec } from '../catalog/openapiGenerator.js'

const spec = generateOpenApiSpec({
  LAYERS,
  API_PATHS,
  serviceName: SERVICE_NAME,
  serviceVersion: SERVICE_VERSION,
  serverUrl: process.env.OPENAPI_SERVER_URL || `http://localhost:${process.env.PORT || 3002}`
})
```

---

## 3. LAYERS → OpenAPI 映射规则（定稿）

### 3.1 核心映射表

| LAYERS endpoint 字段 | OpenAPI 目标位置 | 映射规则 |
|----------------------|-----------------|---------|
| `path` | `paths.<path>` | 直接作为 OpenAPI paths key；`/api/...` 前缀原样保留 |
| `method` | `paths.<path>.<method>` | 小写化后作为 operation 对象 key（如 `"POST"` → `"post"`） |
| `description` | `operation.summary` | 直接映射 |
| `auth` (boolean) | `operation.security` | `true` → `[{ bearerAuth: [] }]`；`false`/缺省 → 不设置（公开端点） |
| `parameters` (object) | `operation.requestBody` | 仅当 method ∈ {POST, PUT, PATCH} 时映射为 requestBody；GET/DELETE 时不生成 requestBody（无请求体语义） |
| `parameters` 中标记 `(可选)` 的字段 | schema 内 | 从 required 数组中排除 |
| `implemented` | — | 不进入 OpenAPI；所有 API_PATHS 条目均生成（含未实现的） |

### 3.2 parameters → requestBody 推断策略

```
parameters: { email: 'string', password: 'string', name: 'string' }
       ↓
requestBody:
  required: true
  content:
    application/json:
      schema:
        type: object
        required: [email, password, name]
        properties:
          email:    { type: string }
          password: { type: string }
          name:     { type: string }
```

**类型映射速查：**

| LAYERS 参数值含 | OpenAPI type | 备注 |
|----------------|-------------|------|
| `'string'` 或 `'string (可选)'` | `"string"` | |
| `'number'` | `"number"` | |
| `'boolean'` | `"boolean"` | |
| `'array'` | `"array"` | items 默认 `{ type: "string" }` |
| `'object'` | `"object"` | |
| 其他 | `"string"` | 回退 |
| 含 `(可选)` 的子串 | 从 required 排除 | 示例：`'string (可选)'` |

**反向推断（GET/DELETE 的 parameters → query parameters）：**

当 method ∈ {GET, DELETE} 且 LAYERS endpoint 有 `parameters` 字段时，映射为 OpenAPI `operation.parameters`（query 参数数组），而非 requestBody。示例：

```
parameters: { probe: 'boolean (默认 true，传 false 跳过 MCP 探测)' }
       ↓
parameters:
  - name: probe
    in: query
    required: false
    schema: { type: boolean, default: true }
    description: 传 false 跳过 MCP 探测
```

### 3.3 auth → security 映射

| LAYERS auth 值 | OpenAPI security | 含义 |
|---------------|-----------------|------|
| `true` | `[{ bearerAuth: [] }]` | 需 Bearer JWT |
| `false` / 缺省 | 不设置 security 字段 | 公开端点（无鉴权） |

### 3.4 同一路径多 method 合并

同一 path 出现在多个 endpoints 中（如 `CHAT_CONVERSATION_BY_ID` 有 GET 和 DELETE 两个 method），合并到同一个 `paths.<path>` 对象下，不重复创建 path key：

```json
{
  "/api/chat/conversations/{id}": {
    "get": { "summary": "对话详情（含消息）", "security": [{ "bearerAuth": [] }] },
    "delete": { "summary": "删除对话", "security": [{ "bearerAuth": [] }] }
  }
}
```

---

## 4. Express :param → OpenAPI {param} 转换规则（定稿）

### 4.1 转换算法

```
输入: Express 风格路径字符串（如 "/api/repair-records/:id"）
输出: OpenAPI 风格路径字符串（如 "/api/repair-records/{id}"）

规则:
  1. 正则匹配 /:(\w+)/g → 替换为 /{paramName}/
  2. 所有 :param 出现的位置都会被替换
  3. 路径末尾的 :param 同样处理（如 "/api/faq/:id" → "/api/faq/{id}"）
  4. 转换在 paths 对象 key 级别进行——使用转换后的路径作为 OpenAPI paths key
  5. 同时在 operation.parameters 中为每个 {param} 生成 path parameter 条目
```

### 4.2 转换函数伪代码

```js
function expressToOpenApiPath(expressPath) {
  return expressPath.replace(/:(\w+)/g, '{$1}')
}
```

### 4.3 Path Parameter 自动生成

对每个转换出的 `{paramName}`，在对应的 operation 中自动追加 path parameter：

```json
{
  "parameters": [
    {
      "name": "id",
      "in": "path",
      "required": true,
      "schema": { "type": "string" }
    }
  ]
}
```

### 4.4 涉及路径清单

| API_PATHS Key | Express Path | OpenAPI Path |
|--------------|-------------|-------------|
| CHAT_CONVERSATION_BY_ID | `/api/chat/conversations/:id` | `/api/chat/conversations/{id}` |
| FAQ_BY_ID | `/api/faq/:id` | `/api/faq/{id}` |
| REPAIR_RECORD_BY_ID | `/api/repair-records/:id` | `/api/repair-records/{id}` |
| ADMIN_USER_BY_ID | `/api/admin/users/:id` | `/api/admin/users/{id}` |
| VOICE_TTS_DOWNLOAD | `/api/voice/tts/files/:fileName` | `/api/voice/tts/files/{fileName}` |

---

## 5. servers[].url 策略（定稿）

### 5.1 设计决策

**采用「环境变量覆盖 + 固定默认值」策略，不依赖 req 动态生成。**

### 5.2 规则

| 优先级 | 来源 | 示例值 | 适用场景 |
|--------|------|--------|---------|
| 1（最高） | 环境变量 `OPENAPI_SERVER_URL` | `https://api.example.com` | 生产 / 预发 / CI 契约校验 |
| 2（默认） | `http://localhost:${PORT}` | `http://localhost:3002` | 本地开发 / 快照测试 |

### 5.3 理由

1. **CI 可移植性**：固定 server URL 保证快照测试在任何环境下产出一致输出，不因 CI runner 的 hostname 变化而破裂。
2. **契约稳定性**：OpenAPI spec 作为 API 契约，server URL 应在部署时显式配置而非运行时推断——避免反向代理 / 多网卡环境下的歧义。
3. **简单性**：不需要在纯函数 `generateOpenApiSpec()` 中注入 req 对象，保持核心层无副作用。

### 5.4 实现要点

```js
// openapiRoutes.js
const serverUrl = process.env.OPENAPI_SERVER_URL
  || `http://localhost:${process.env.PORT || 3002}`

const spec = generateOpenApiSpec({
  LAYERS,
  API_PATHS,
  serviceName: SERVICE_NAME,
  serviceVersion: SERVICE_VERSION,
  serverUrl
})
```

动态获取当前请求 URL 的需求不在本跳范围——`GET /api/openapi.json` 返回的 `servers[].url` 仅来自环境变量或默认值。若未来需要客户端动态发现，由调用方自行替换。

---

## 6. 快照测试约定（定稿）

### 6.1 文件位置

```
server/test/__snapshots__/openapi.snapshot.json
```

### 6.2 生命周期

```
状态机:
  [快照文件不存在] ──(首次测试运行)──→ [写入快照] → 测试通过
  [快照文件存在]   ──(后续运行)────→ [对比当前输出 vs 快照]
    ├─ 一致 → 测试通过
    └─ 不一致 → 测试失败 + 输出 diff
```

### 6.3 更新时机

| 触发条件 | 动作 | 说明 |
|---------|------|------|
| 初始创建（首次运行） | 自动写入 | 无对比，直接通过 |
| registry LAYERS 增删端点 | 手动执行 `npm run test:server -- --update-snapshots` | 开发者需确认变更意图后更新 |
| API_PATHS 新增常量 | 同上 | 同上 |
| openapiGenerator.js 生成逻辑变更 | 同上 | 同上 |
| 纯重构（不改变输出） | 不应更新 | 快照应保持不变，作为回归保证 |

### 6.4 失败提示语

```
✖ openapi.json matches snapshot — 快照不匹配

OpenAPI 快照测试失败：当前生成的 OpenAPI 规范与快照不一致。

常见原因：
  1. registry.js 的 LAYERS 或 API_PATHS 发生变更（新增/修改/删除端点）
  2. openapiGenerator.js 的生成逻辑被修改
  3. SERVICE_NAME / SERVICE_VERSION 变更

修复方式：
  确认变更符合预期后，运行以下命令更新快照：
    npm run test:server -- --update-snapshots

如果变更并非预期，请回退 registry 或生成器改动。
```

### 6.5 快照内容约束

- 快照文件包含 `JSON.stringify(spec, null, 2)` 输出（pretty-print）
- 排除 `servers[].url` 中的环境变量差异——测试前将 `serverUrl` 固定为 `http://localhost:3002`
- 快照文件末尾保留换行符（`\n`）

---

## 7. 错误处理与边界行为（定稿）

### 7.1 空 LAYERS

```js
// 输入: LAYERS = []
// 行为: 仍生成完整 OpenAPI 骨架（openapi/info/servers/paths）
//       paths 仅包含 API_PATHS 条目，全部标记 x-registry-status: "inferred"
//       method=GET, auth=false, 无 parameters
// 不抛异常——空注册表是合法状态（新项目/初始化阶段）
```

### 7.2 API_PATHS 条目在 LAYERS 中无匹配

```js
// 输入: API_PATHS 包含 /api/voice/capabilities，但 LAYERS 中无此路径
// 行为: 生成 entry，标记 x-registry-status: "inferred"
//       method/description/auth 来自 pathFallbacks（见 §8.1 Q1 裁决）
//       pathFallbacks 也为空时，使用绝对保守默认：GET + noauth + description="<API_PATHS key>"
```

### 7.3 LAYERS endpoint 缺字段

| 缺失字段 | 回退行为 |
|---------|---------|
| `description` | 使用 `API_PATHS key` 作为 summary（如 `"FAQ_BY_ID"` → summary: "FAQ_BY_ID"） |
| `method` | **跳过该 endpoint**——method 为必需字段，无 method 的 entry 记录 `console.warn` 后跳过 |
| `path` | 同上——path 为必需字段 |
| `auth` | 缺省视为 `false`（公开端点——保守安全默认） |
| `parameters` | 不生成 requestBody / query parameters |
| `implemented` | 缺省视为 `true`（仅当 `implemented === false` 时跳过——保持与 registry 现有语义兼容） |

### 7.4 单条 endpoint 生成失败

```js
// 单条 endpoint 处理中的异常（如参数类型解析失败）不应阻止整个生成流程
// 行为: try/catch 包裹单条处理，失败时记录 console.error 并跳过该路径
//       收集失败路径名，作为 x-generation-warnings 数组附加到 info 对象
```

### 7.5 整体异常

```js
// LAYERS 传入 null/undefined → 抛出 TypeError（调用方错误）
// API_PATHS 传入 null/undefined → 同上
// 其他不可恢复异常 → 抛出，由 openapiRoutes.js 捕获并返回 500
```

### 7.6 响应结构（所有端点统一）

OpenAPI 中每条 operation 的 responses 至少包含：

```json
{
  "200": { "description": "成功" },
  "401": { "description": "未授权（需要有效 JWT）" },
  "500": { "description": "服务器内部错误" }
}
```

`401` 仅在 `auth: true` 的 operation 中出现。

---

## 8. H1 open_questions 裁决

### 8.1 Q1: voice/gateway 端点是否需要反向补注册到 registry？

**裁决：不反向注册到 registry LAYERS，改为在 openapiGenerator.js 内部定义 `PATH_FALLBACKS` 补充元数据。**

**理由：**

1. H1 决定明确「不修改 registry.js 的 LAYERS 结构」（决策不可推翻，尊重 H1）。
2. 实际审查源码发现：gateway×3 已实现路由（`gatewayRoutes.js`，全部 `GET`、无 auth、无参数），voice×3 当前无 Express 路由实现（仅有 service 层 `voiceTtsService.js`）。
3. 保守默认（method=GET, auth=false, no parameters）对 gateway 三条路径是准确的（已验证），对 voice 三条路径虽不完整但不会产生误导信息。
4. 通过 `PATH_FALLBACKS` 内部常量提供更精确的元数据，既不改 registry，又提升 OpenAPI 质量。

**PATH_FALLBACKS 定义（内嵌于 openapiGenerator.js）：**

```js
const PATH_FALLBACKS = {
  VOICE_CAPABILITIES: {
    method: 'GET',
    auth: false,
    summary: '获取语音合成能力列表（支持的声音与语言）',
    parameters: null,
    xRegistryStatus: 'inferred',
    xNote: 'voice routes 尚未实现 Express handler（仅 service 层存在）'
  },
  VOICE_TTS: {
    method: 'POST',
    auth: false,
    summary: '文本转语音合成',
    parameters: { text: 'string', voice: 'string (可选)', speed: 'number (可选)' },
    xRegistryStatus: 'inferred',
    xNote: 'voice routes 尚未实现 Express handler（仅 service 层存在）'
  },
  VOICE_TTS_DOWNLOAD: {
    method: 'GET',
    auth: false,
    summary: '下载已合成的语音文件',
    parameters: null,
    xRegistryStatus: 'inferred',
    xNote: 'voice routes 尚未实现 Express handler（仅 service 层存在）'
  },
  GATEWAY_PLANES: {
    method: 'GET',
    auth: false,
    summary: '获取所有网关平面列表',
    parameters: null,
    xRegistryStatus: 'inferred'
  },
  GATEWAY_CONTROL_PLANE: {
    method: 'GET',
    auth: false,
    summary: '获取控制面快照',
    parameters: null,
    xRegistryStatus: 'inferred'
  },
  GATEWAY_DATA_PLANE: {
    method: 'GET',
    auth: false,
    summary: '获取数据面快照',
    parameters: null,
    xRegistryStatus: 'inferred'
  },
  V2_ROOT: {
    method: 'GET',
    auth: false,
    summary: 'v2 服务发现目录根入口',
    parameters: null,
    xRegistryStatus: 'inferred',
    xDiscovery: true
  }
}
```

**合并优先级**：LAYERS 已注册 → 使用 LAYERS 数据；PATH_FALLBACKS 有匹配 → 使用 fallback；两者皆无 → 绝对保守默认（method=GET, auth=false, summary=API_PATHS key）。

### 8.2 Q2: servers[].url 动态生成还是固定占位？

**裁决：固定默认值 + 环境变量覆盖，不依赖 req 动态生成。**

详见 §5。此决策的理由已在 §5.3 中阐明，核心是 CI 可移植性与快照测试的确定性。

### 8.3 Q3: 是否需要为 chat 端点补充 requestBody schema？

**裁决：是。对 LAYERS 中有 `parameters` 的所有 POST/PUT/PATCH 端点（含 chat×2），生成 requestBody schema。**

**理由：**

1. LAYERS 已含结构化参数信息（如 `parameters: { messages: 'array', conversation_id: 'string (可选)' }`），不做 requestBody 是浪费已有元数据。
2. 映射规则已在 §3.2 定稿——不是"深度推断"而是"直接转换已有数据"。
3. 对于 `messages: 'array'`，生成 `{ type: "array", items: { type: "object" } }`——不下钻到具体 message 结构（属于 H2+ 范围），但至少告知消费者期望的是数组。
4. 不影响 H1「显式不做」条目——H1 的 X7 是「不对 voice/gateway 端点做深度参数推断」，chat 端点不在其列。

**边界**：仅当 LAYERS endpoint 有 `parameters` 字段且 method ∈ {POST, PUT, PATCH} 时生成 requestBody。不创造不存在的数据。

### 8.4 Q4: V2_ROOT 是否标注为 internal/x-discovery？

**裁决：标注 `x-discovery: true`，同时保留在 paths 中（不隐藏）。**

**理由：**

1. `/v2/` 作为目录根入口，确实是服务发现用途，标注 `x-discovery: true` 语义清晰。
2. 不加 `x-internal: true`——`x-internal` 暗示"不建议外部使用"，但 `/v2/` 目录是设计给 API 消费者做服务发现的，不是纯内部实现细节。
3. 在 `description` 中明确「v2 服务发现目录——供客户端动态发现 API 能力」。

---

## 9. 红色模块审查结论

### 9.1 H1 判定

| 模块 | 判定 | 触发条件 |
|------|------|---------|
| `server/catalog/openapiGenerator.js` | ★核心层，需红色记录 | "生成器定义了 API 契约的对外接口描述，下游 CI/Swagger 依赖其正确性" |

### 9.2 Architect 复审

**结论：同意。维持核心层红色记录判定。**

**强化理由：**

1. **契约定义权**：openapiGenerator.js 是项目 API 契约（OpenAPI 3.0.3）的唯一真源生成器。其输出直接影响所有 API 消费者（Swagger UI、CI 契约校验、openapi-generator SDK 生成）。一旦生成错误（如路径遗漏、参数类型错误、auth 误标），下游所有消费方同步受骗。
2. **数据聚合点**：生成器合并两个数据源（LAYERS + API_PATHS）并做参数转换，是唯一跨越这两套数据的模块——错误不可能被其他模块兜底。
3. **快照测试的锚点**：快照测试比较的是生成器输出。若生成器本身有 bug 且快照已错误生成，则错误被永久化——需要人工审查防止此情况。

**审查要求（传递至 H3 DevLead）：**

- `openapiGenerator.js` 的 PR 必须附《核心模块AI生成红色记录》
- DevLead 必须逐行审查（非 LLM 自审）
- 审查重点：路径参数转换（§4）、LAYERS→OpenAPI 参数类型映射（§3.2）、快照首次写入的正确性
- 以下 reviewer checklist 必须勾满：

| 检查项 | 是否通过 |
|--------|---------|
| 全部 28 条 API_PATHS 在 paths 中有对应条目 | |
| Express `:param` 全部转为 `{param}`（§4.4 清单逐一核对） | |
| auth 字段正确映射为 security（§3.3） | |
| POST/PUT/PATCH 端点的 parameters 正确映射为 requestBody（§3.2） | |
| GET 端点的 parameters 正确映射为 query parameters（§3.2） | |
| PATH_FALLBACKS 覆盖全部 7 条未注册路径 | |
| servers[].url 使用环境变量/默认值（§5） | |
| 快照输出稳定可复现（serverUrl 固定为 localhost:3002） | |

---

## 10. 技术选型与理由

| 决策 | 选项 | 理由 |
|------|------|------|
| 不引入 swagger-jsdoc | 自实现纯 JS 对象构建 | H1 决策，H2 确认——避免依赖膨胀、保持生成器透明可控 |
| OpenAPI 版本 | 3.0.3 | H1 决策——产业标准最广泛支持的版本，swagger-parser/openapi-generator 兼容性最好 |
| 构建产物 | JSON（非 YAML） | H1 决策——零构建步骤，JSON 可被 Node.js 原生处理 |
| 快照测试框架 | Node.js 内置 `node:assert` + `node:test` | 与项目现有测试栈一致（存量测试也用 node:test），不引入 jest |
| servers[].url | 环境变量覆盖 + 本地回退 | §5 决策——兼顾 CI 可移植性与部署灵活性 |
| 路径元数据补充 | PATH_FALLBACKS 内部常量 | §8.1 决策——不改 registry 的前提下提升 OpenAPI 质量 |

---

## 11. 与 L0（不生成 OpenAPI 裸奔状态）对照

| 维度 | L0（当前） | L2（本跳目标） |
|------|----------|--------------|
| API 契约可见性 | 仅 `/v2/` 目录 + `GET /api/docs` payload（非标准格式） | 标准 OpenAPI 3.0.3 JSON，可被工具链消费 |
| 测试覆盖 | 14 个存量测试文件，无 OpenAPI 相关 | +1 测试文件，含结构校验 + 覆盖逐条断言 + 快照 |
| 端点元数据 | LAYERS 仅覆盖 21/28 条路径 | OpenAPI 覆盖全部 28 条，7 条有 `x-registry-status: inferred` 标记 |
| 路由注册 | 无 openapi 路由 | +1 路由文件，index.js +2 行 |
| 依赖 | 0 新增 | 0 新增（严格遵循 H1 决策） |

---

## 12. 架构约束 checklist（出门自检）

- [x] 分层清晰：核心层（生成器）→ 路由层（HTTP）→ 组装层（index.js）
- [x] 接口模型到字段级：入参/出参签名、参数类型映射、路径转换规则均已定稿
- [x] 红色模块有判定理由：openapiGenerator.js — §9
- [x] NFR 映射：快照确定性（可复现）、错误隔离（单条失败不影响全量）、安全默认（缺省无 auth）
- [x] 依赖清单：0 新增三方包
- [x] H1 decisions 未推翻，H1 open_questions 全部收口
- [x] 本跳 open_questions 留给代码跳的已控到 0 条
- [x] 证据分层：已读 registry.js / apiPaths.js / index.js / gatewayRoutes.js + H1 交付物全文 + 角色说明书 + 交接契约

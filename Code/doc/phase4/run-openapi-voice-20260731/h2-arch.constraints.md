---

# 架构约束与接口 —— MechAssist-Fusion extern-api

> **deliverable.kind**: `arch-constraints`  
> **跳**: H2 | from: Architect | to: DevLead  
> **原始需求**: 发现面挂载 OpenAPI + Voice 进 registry（契约对齐）  
> **业务仓**: `D:\trae_git\MechAssist-Fusion\extern-api\`  
> **产出日期**: 2026-07-31  
> **上一跳信封**: `Code/doc/phase4/run-openapi-voice-20260731/h1-pm.scope-checklist.md`

---

## 1. 涉及模块依赖拓扑

### 1.1 数据流与真源总图

```
                  ┌─────────────────────────┐
                  │  registry.js / LAYERS   │ ◄── 真源（single source of truth）
                  │ （A1 在此加 voice 模块） │     所有发现面 / OpenAPI 生成均从此取数
                  └───┬───────────┬─────────┘
                      │           │
          ┌───────────▼──┐  ┌────▼──────────────────┐
          │ getApiDocs   │  │ collectLayerEndpoints  │
          │ Payload()    │  │ (openapiGenerator.js)  │
          │ (A2 加       │  │ 遍历 LAYERS 所有模块   │
          │  openapi     │  │ 所有端点，构建          │
          │  字段)        │  │ Map<path, endpoint[]>  │
          │              │  │ 只收录 implemented≠false│
          └──────┬───────┘  └────┬───────────────────┘
                 │               │
    ┌────────────▼──┐   ┌───────▼──────────────────┐
    │ /api/docs     │   │ generateOpenApiSpec()     │
    │ (chatRoutes)  │   │ 迭代 API_PATHS 每个 key:  │
    │ 返回 JSON:    │   │ ① byPath.get(expressPath) │
    │ { success:    │   │    → 有: buildOperation   │
    │   true,       │   │        FromLayer()        │
    │   data:       │   │    → 无: 查 PATH_FALLBACK │
    │   getApiDocs  │   │       → 有: buildOpFrom   │
    │   Payload() } │   │         Fallback()        │
    └───────────────┘   │       → 无: buildConserv  │
                        │         ativeOperation()   │
                        └────────┬───────────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │  openapiRoutes.js                    │
              │  GET /api/openapi.json               │
              │    → res.json(generateOpenApiSpec()) │
              │  GET /api/openapi.yaml               │
              │    → res.type('application/yaml')    │
              │       .send(dump(spec))              │
              └─────────────────────────────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │  v2Catalog.js                        │
              │  GET /v2/           → buildRootCatalog│
              │  GET /v2/:slug      → buildLayerCat  │
              │  GET /v2/:slug/:mod → buildModuleCat │
              │  全部依赖 findLayer / findModule     │
              │  → LAYERS 变更自动反映                │
              └─────────────────────────────────────┘
```

### 1.2 真源判定矩阵

| 数据项 | 真源 | 消费方 | 备注 |
|--------|------|--------|------|
| voice 端点描述/method/auth/parameters | `LAYERS` (A1) | `getApiDocsPayload()`, `collectLayerEndpoints()`, `v2Catalog` | 注册后优先于 PATH_FALLBACKS |
| voice 表达路径 → OpenAPI-path 映射 | `API_PATHS` | `generateOpenApiSpec()` 的迭代循环 | 不改 |
| voice Express handler 运行时逻辑 | `chatRoutes.js` L1104-L1215 | Express 运行时 | **禁改** |
| voice fallback 兜底元数据 | `PATH_FALLBACKS.VOICE_*` | `generateOpenApiSpec()` 仅在 byPath 未命中时走到 | LAYERS 注册后不会被命中 |
| OpenAPI 生成算法 | `generateOpenApiSpec()` 函数体 | `openapiRoutes.js` | **禁改** |
| /api/docs 发现面结构 | `getApiDocsPayload()` | chatRoutes `/api/docs` handler | 仅新增字段 |

### 1.3 关键控制流：voice 从 fallback 切到 LAYERS 的路径判据

`openapiGenerator.js` 中 `generateOpenApiSpec()` 的主循环（约 L220-L240）：

```javascript
for (const [key, expressPath] of Object.entries(API_PATHS)) {
  const layerEps = byPath.get(expressPath) || []   // ← collectLayerEndpoints 结果
  if (layerEps.length > 0) {
    // ← voice 进 LAYERS 后命中此分支
    for (const ep of layerEps) {
      const built = buildOperationFromLayer(ep, openApiPath, generationWarnings)
      if (built) paths[openApiPath][built.method] = built.operation
    }
    continue  // ← 关键：跳过 fallback 分支
  }
  const fb = fallbacks[key]  // ← voice 不在 LAYERS 时走到这里（当前状态）
  if (fb) {
    const built = buildOperationFromFallback(key, fb, openApiPath, generationWarnings)
    if (built) paths[openApiPath][built.method] = built.operation
    continue
  }
  // 保守模式兜底
  const built = buildConservativeOperation(key, openApiPath)
  paths[openApiPath][built.method] = built.operation
}
```

**结论**: voice 三端点写入 LAYERS 后，`byPath.get(expressPath)` 返回非空数组 → 进入 LAYERS 分支 → `continue` 跳过 fallback。PATH_FALLBACKS 中 voice 三键在运行时不被触及，仅作安全网保留，不会产生重复端点。

### 1.4 与 PATH_FALLBACKS 中其他键的隔离性

PATH_FALLBACKS 中 GATEWAY_PLANES / GATEWAY_CONTROL_PLANE / GATEWAY_DATA_PLANE / V2_ROOT 四个键与本次改动完全无关：它们不涉及 voice，不修改 LAYERS 中任何对应端点，不修改其 fallback 字段。本次只动 voice 三条。

---

## 2. 改点位置精确约束

### 2.1 A1 — registry.js LAYERS → chat 层 → 新增 voice 模块

**文件**: `server/catalog/registry.js`

**精确位置**: `LAYERS` 数组中 `chat` 层的 `modules` 数组内第 3 个元素（`system` 模块）之后、`modules` 闭合 `]` 之前。现行代码 chat 层 modules 含 `message`、`conversations`、`system` 三个模块。在 `system` 模块的 `]` 之后、chat 层 `modules` 的 `]` 之前插入第 4 个模块。

**上下文**（现有关闭层级）:
```javascript
      {                          // system 模块
        id: 'system',
        name: '系统状态',
        endpoints: [
          {
            description: '检查 AI 服务连通性',
            path: API_PATHS.SYSTEM_STATUS,
            method: 'GET',
            implemented: true,
            auth: true
          }
        ]
      }
      // ← 在此插入 voice 模块
    ]                            // ← chat 层 modules 闭合，不可动
```

**插入内容**:
```javascript
      {
        id: 'voice',
        name: '语音合成',
        endpoints: [
          {
            description: '获取语音合成能力列表（支持的声音与语言）',
            path: API_PATHS.VOICE_CAPABILITIES,
            method: 'GET',
            implemented: true,
            auth: true
          },
          {
            description: '文本转语音合成',
            path: API_PATHS.VOICE_TTS,
            method: 'POST',
            implemented: true,
            auth: true,
            parameters: {
              text: 'string',
              conversationId: 'string (可选)',
              messageId: 'string (可选)',
              save: 'boolean (可选，默认 true)'
            }
          },
          {
            description: '下载已合成的语音文件',
            path: API_PATHS.VOICE_TTS_DOWNLOAD,
            method: 'GET',
            implemented: true,
            auth: true
          }
        ]
      }
```

**字段 schema 对齐验证**（与现有 `chat/message` 模块逐字段对照）:

| 字段路径 | 现有模块示例（message） | voice 模块取值 | 对齐 |
|----------|------------------------|---------------|------|
| `id` | `'message'` | `'voice'` | ✅ 小写字母 |
| `name` | `'发送消息'` | `'语音合成'` | ✅ 中文可读 |
| `endpoints[]` | 数组 | 数组（3 项） | ✅ |
| `endpoints[].description` | `'非流式对话'` | 取自 PATH_FALLBACKS.summary | ✅ 动词开头 |
| `endpoints[].path` | `API_PATHS.CHAT_MESSAGE` | `API_PATHS.VOICE_*` | ✅ 使用 API_PATHS 常量 |
| `endpoints[].method` | `'POST'` | GET / POST / GET | ✅ 大写 |
| `endpoints[].implemented` | `true` | `true` | ✅ 三条 handler 均已实现 |
| `endpoints[].auth` | `true` | `true` | ✅ 与 authenticateToken 一致 |
| `endpoints[].parameters` | `{ messages, conversation_id }` (POST) | `{ text, conversationId, messageId, save }` (仅 POST) | ✅ 仅 POST 端点有 |

**VOICE_TTS parameters 字段来源**（裁决 open_question #3）:

`chatRoutes.js` L1135-L1138 实际解构:
```javascript
const body = req.body || {}
const { text, conversationId, messageId, save } = body
const shouldSave = save !== false
const out = await voiceTtsService.synthesize(text)
```

| 字段 | 类型 | 必填 | 来源代码行 | openapiGenerator 解析结果 |
|------|------|------|-----------|--------------------------|
| `text` | string | 是 | L1136（解构）L1138（synthesize 实参） | `schema.required = ['text']` |
| `conversationId` | string | 否 | L1136（解构）→ saveVoiceMp3 的文件命名 | `(可选)` → 不放入 required |
| `messageId` | string | 否 | L1136（解构）→ saveVoiceMp3 的文件命名 | `(可选)` → 不放入 required |
| `save` | boolean | 否（默认 true） | L1136-L1137（`shouldSave = save !== false`） | `(可选，默认 true)` → `schema.default = true`，不放入 required |

**禁止事项**:
- 不新增独立 layer（不创建 `slug: 'voice'` 的 LAYERS 条目），挂 chat 层
- parameters 不写 `voice` / `speed` ——这两个字段在 handler 和 voiceTtsService.synthesize() 中均不存在
- 不改 chat 层 message / conversations / system 三个现有模块

### 2.2 A2 — getApiDocsPayload() 顶层加 openapi 字段

**文件**: `server/catalog/registry.js`

**精确位置**: `getApiDocsPayload()` 函数返回对象内，`catalogRoot` 与 `layers` 之间。

**当前代码**:
```javascript
export function getApiDocsPayload() {
  return {
    version: SERVICE_VERSION,
    title: 'MechAssist Extern API 文档',
    description: '机械智能助手后端接口',
    catalogRoot: API_PATHS.V2_ROOT,
    layers: LAYERS.map((layer) => ({
      // ... 现有映射逻辑 ...
    }))
  }
}
```

**插入**: 在 `catalogRoot: API_PATHS.V2_ROOT,` 之后新增一行 `openapi:` 对象:
```javascript
    catalogRoot: API_PATHS.V2_ROOT,
    openapi: {
      json: '/api/openapi.json',
      yaml: '/api/openapi.yaml'
    },
    layers: LAYERS.map((layer) => ({
```

**禁止**: 不改函数签名、不改 `layers` 遍历逻辑、不修改 `SERVICE_VERSION` / `title` / `description`

**兼容性论证**: `/api/docs` 的实际 HTTP 响应是 `{ success: true, data: getApiDocsPayload() }`。`openapi` 在 `data` 对象内作为新增顶层字段——JSON 新增键不破坏已有键的解析，前端（及任何消费者）会忽略未知字段。此处不会导致 type narrowing 失败、不会导致 destructuring 失败、不会导致 schema validation 失败。

### 2.3 A3 — system/docs 加 openapi 端点（P1，可降级）

**文件**: `server/catalog/registry.js`

**精确位置**: LAYERS → `system` 层 → `docs` 模块 → `endpoints` 数组末尾，`API_DOCS` 端点之后。

**当前 docs 模块**:
```javascript
      {
        id: 'docs',
        name: 'API 文档',
        endpoints: [
          {
            description: '结构化 API 文档（与 /v2 目录同源）',
            path: API_PATHS.API_DOCS,
            method: 'GET',
            implemented: true,
            auth: false
          }
          // ← 在此插入
        ]
      },
```

**插入内容**:
```javascript
          {
            description: 'OpenAPI 3.0 JSON 规范',
            path: '/api/openapi.json',
            method: 'GET',
            implemented: true,
            auth: false
          },
          {
            description: 'OpenAPI 3.0 YAML 规范',
            path: '/api/openapi.yaml',
            method: 'GET',
            implemented: true,
            auth: false
          }
```

**path 为何用纯字符串**: `/api/openapi.json` 和 `/api/openapi.yaml` **不在 `API_PATHS` 常量中**，因为 `openapiRoutes.js` 使用 Express Router 内部挂载（`router.get('/openapi.json', ...)`），不走 `toMountPath(API_PATHS.*)` 模式。因此 path 必须用纯字符串。这不会影响 `generateOpenApiSpec()`——它只遍历 `API_PATHS` 的 key，不会为这些 path 生成 OpenAPI 条目（不影响验收③）。

**裁决（open_question #2）**: A2 顶层 `openapi` 字段已满足验收①（"路径或顶层字段任一即可"），A3 降为 P1——仅增强 `/v2/system/docs` 发现面。DevLead 可决定是否做。

### 2.4 M1-M3 — PATH_FALLBACKS voice 三键去 xNote

**文件**: `server/catalog/openapiGenerator.js`

**精确位置**: `PATH_FALLBACKS` 对象内三个键的 `xNote` 字段行（约 L21、L28、L35）。

**每键改动**（以 VOICE_TTS 为例）:

改前:
```javascript
  VOICE_TTS: {
    method: 'POST',
    auth: false,
    summary: '文本转语音合成',
    parameters: { text: 'string', voice: 'string (可选)', speed: 'number (可选)' },
    xRegistryStatus: 'inferred',
    xNote: 'voice routes 尚未实现 Express handler（仅 service 层存在）'
  },
```

改后:
```javascript
  VOICE_TTS: {
    method: 'POST',
    auth: false,
    summary: '文本转语音合成',
    parameters: { text: 'string', voice: 'string (可选)', speed: 'number (可选)' },
    xRegistryStatus: 'inferred'
  },
```

同理应用于 VOICE_CAPABILITIES 和 VOICE_TTS_DOWNLOAD——**仅删除 `xNote` 行，保留其余所有字段**（包括 `auth: false`、`parameters`、`xRegistryStatus`）。

**禁止**: 不改 method / auth / summary / parameters / xRegistryStatus 值；fallback 中 `auth: false` 与 LAYERS 中 `auth: true` 的不一致无影响（控制流走到 LAYERS 后不碰 fallback）。

### 2.5 M4 — PATH_FALLBACKS voice fallback 的处置策略

**裁决（open_question #1）**: **voice 三键在 PATH_FALLBACKS 中整体保留，仅去掉 xNote。不删除键，不改 xRegistryStatus。**

理由:
1. 运行时不会被引用：`byPath.get(expressPath)` 命中后 `continue`——此论据来自代码阅读 `openapiGenerator.js` L220-L229，不是推测
2. 零成本安全网：不占用 CPU / 不出现在输出 / 不产生重复条目
3. 删除的风险：若将来有人从 LAYERS 中误移除 voice 模块（如在重构中），删除 fallback 后 voice 路径会退化为 `buildConservativeOperation` 输出（丢失所有元数据：summary、parameters 等）——保留 fallback 优于丢失信息
4. 最小改动原则：不删除不产生问题的代码

### 2.6 M5 — openapi.test.js 断言适配

**文件**: `server/test/openapi.test.js`

**精确位置**: `describe('key endpoints method/auth/parameters')` 块内，测试用例 `'VOICE_TTS inferred post has requestBody from PATH_FALLBACKS'`（约 L184-L189）。

**改前**:
```javascript
  it('VOICE_TTS inferred post has requestBody from PATH_FALLBACKS', () => {
    const spec = buildSpec()
    const op = spec.paths['/api/voice/tts'].post
    assert.ok(op)
    assert.equal(op['x-registry-status'], 'inferred')
    assert.ok(op.requestBody)
  })
```

**改后**:
```javascript
  it('VOICE_TTS post from LAYERS has auth and requestBody', () => {
    const spec = buildSpec()
    const op = spec.paths['/api/voice/tts'].post
    assert.ok(op)
    assert.equal(op['x-registry-status'], undefined)
    assert.deepEqual(op.security, [{ bearerAuth: [] }])
    assert.ok(op.responses[401])
    assert.ok(op.requestBody)
    const schema = op.requestBody.content['application/json'].schema
    assert.ok(schema.properties.text)
    assert.ok(schema.required.includes('text'))
  })
```

**断言翻转明细**:

| 断言 | 改前值 | 改后值 | 根因 |
|------|--------|--------|------|
| `op['x-registry-status']` | `'inferred'` | `undefined` | `buildOperationFromLayer()` 不生成 x-registry-status |
| `op.security` | 不检查（undefined，fallback auth:false） | `[{ bearerAuth: [] }]` | A1 设 auth:true |
| `op.responses[401]` | 不检查（undefined） | 存在 `{ description: '未授权（需要有效 JWT）' }` | `buildResponses(true)` 生成 |
| `schema.required` | 不检查（旧参数全可选 → required=[] 或 absent） | `['text']` | `text` 不标 (可选) |
| `schema.properties.text` | 不检查 | 存在 | 添加到断言 |

**其他测试用例影响**:
- `'paths covers all API_PATHS entries'`（L61-L67）— 不受影响。voice 三条已在 `API_PATHS` 中，LAYERS 注册只改变端点元数据来源，不影响路径覆盖
- 其余所有测试 — 不受影响（改动不触及 auth/chat/business/admin/system 端点生成逻辑）

### 2.7 M6 — 快照更新策略

**文件**: `server/test/__snapshots__/openapi.snapshot.json`

**操作**: `npm run test:server -- --update-snapshots`

**预期 Diff 的路径级清单**:

| Path | 变更方向 | 内容 |
|------|----------|------|
| `/api/voice/capabilities` GET | 字段增强 | 新增 security、responses.401；去除 x-registry-status、x-note |
| `/api/voice/tts` POST | 字段替换 | 同上 + requestBody.schema.properties 从 `{ text, voice, speed }` 变为 `{ text, conversationId, messageId, save }`；新增 required: ["text"] |
| `/api/voice/tts/files/{fileName}` GET | 字段增强 | 新增 security、responses.401；去除 x-registry-status、x-note |
| `/api/openapi.json` GET | 可能出现 | 若 A3 的纯字符串 path 进入 PATH_FALLBACKS（手动添加），才会出现在 OpenAPI paths 中；取决于 DevLead 是否做 A3 |
| `/api/openapi.yaml` GET | 同上 | 同上 |

**不应出现的 Diff**:
- `info.x-generator` 应保持 `"mechassist-openapi"`
- `components.securitySchemes` 不变
- 所有 auth/chat（除 voice）/business/admin/system（除 docs）端点不变
- `servers[0].url` 不变
- `openapi` 顶层版本号保持 `"3.0.3"`

**快照更新流程**:
1. 完成 A1 + M1-M3 + M5 代码改动
2. `npm run test:server -- --update-snapshots`
3. `git diff server/test/__snapshots__/openapi.snapshot.json` 人工核查
4. 重新 `npm run test:server` 确认绿色

---

## 3. 测试架构影响

### 3.1 受影响测试用例全量枚举

**测试文件**: `server/test/openapi.test.js`

| describe | it | 影响 | 说明 |
|----------|-----|------|------|
| `OpenAPI 3.0 structure is valid` | `has openapi / info / paths with non-empty title and version` | ✅ 无影响 | 顶层结构不变 |
| `OpenAPI 3.0 structure is valid` | `info has x-generator field with correct value` | ✅ 无影响 | x-generator 保持不变 |
| `paths covers all API_PATHS entries` | `every API_PATHS value appears in paths` | ⚠️ 断言值需确认 | `API_PATHS` 共 28 个 key（含 voice 三条），数量断言不因 LAYERS 注册而变 |
| `GET /api/openapi.json returns valid OpenAPI 3.0` | `returns HTTP 200 with openapi 3.0.3` | ✅ 无影响 | 端到端测试 |
| `GET /api/openapi.json returns valid OpenAPI 3.0` | `response info.x-generator is mechassist-openapi` | ✅ 无影响 | 端到端测试 |
| `key endpoints method/auth/parameters` | `AUTH_REGISTER post is public with requestBody` | ✅ 无影响 | auth 层不变 |
| `key endpoints method/auth/parameters` | `AUTH_ME get requires bearerAuth` | ✅ 无影响 | auth 层不变 |
| `key endpoints method/auth/parameters` | `CHAT_CONVERSATION_BY_ID merges get/delete with path param` | ✅ 无影响 | chat 非 voice 端点不变 |
| `key endpoints method/auth/parameters` | `RELEASE_MANIFEST get maps probe to query parameter` | ✅ 无影响 | system 层不变 |
| `key endpoints method/auth/parameters` | `VOICE_TTS inferred post has requestBody from PATH_FALLBACKS` | 🔴 **需改** | 见 §2.6 完整改动 |
| `key endpoints method/auth/parameters` | `V2_ROOT is marked x-discovery` | ✅ 无影响 | V2_ROOT 不变 |
| `openapi.json matches snapshot` | `writes snapshot on first run, then compares` | ⚠️ 需更新快照 | 见 §2.7 |
| `GET /api/openapi.yaml returns valid YAML` | 三个子测试 | ✅ 无影响 | YAML 是 JSON 的序列化镜像 |
| `GET /api/openapi.yaml endpoint integration` | `endpoint returns parseable YAML` | ✅ 无影响 | 同上 |

### 3.2 快照更新影响面

**改变范围上限**: 仅 voice 三条路径 +（可选）openapi 两条路径在 paths 下的 operation 对象。不会改变 paths 中任何其他路径的 operation 对象。

**回滚方式**: `git checkout -- server/test/__snapshots__/openapi.snapshot.json`

---

## 4. 接口契约

### 4.1 getApiDocsPayload() 返回体变化与兼容性

**改前**:
```json
{
  "version": "1.0.0",
  "title": "MechAssist Extern API 文档",
  "description": "机械智能助手后端接口",
  "catalogRoot": "/v2/",
  "layers": [...]
}
```

**改后**:
```json
{
  "version": "1.0.0",
  "title": "MechAssist Extern API 文档",
  "description": "机械智能助手后端接口",
  "catalogRoot": "/v2/",
  "openapi": {
    "json": "/api/openapi.json",
    "yaml": "/api/openapi.yaml"
  },
  "layers": [...]
}
```

**兼容性分析**: 完全向后兼容。HTTP 响应为 `{ success: true, data: getApiDocsPayload() }`。新增 `data.openapi` 字段是 JSON 对象的新增键——不删除已有键、不改变已有键的类型、不改变已有键的值。消费者（前端或工具链）不会因新增键而解析失败。

### 4.2 generateOpenApiSpec() 输出中 voice 三条差异清单

voice 端点从 PATH_FALLBACKS 切换到 LAYERS 后，`/api/openapi.json` 中 voice 对应 operation 对象的差异：

| 属性路径 | 当前（fallback 源） | 改后（LAYERS 源） | 差异根因 |
|----------|---------------------|-------------------|----------|
| `paths["/api/voice/capabilities"].get.x-registry-status` | `"inferred"` | **不存在** | `buildOperationFromLayer()` 不生成 |
| `paths["/api/voice/capabilities"].get.x-note` | `"voice routes 尚未实现..."` | **不存在** | 同上；fallback 中已删除 |
| `paths["/api/voice/capabilities"].get.security` | 不存在（fallback auth:false） | `[{ bearerAuth: [] }]` | `buildOperationFromLayer()` 读 `ep.auth` |
| `paths["/api/voice/capabilities"].get.responses` | `{ 200, 500 }` | `{ 200, 401, 500 }` | `buildResponses(auth=true)` |
| `paths["/api/voice/tts"].post.x-registry-status` | `"inferred"` | **不存在** | 同上 |
| `paths["/api/voice/tts"].post.x-note` | `"voice routes 尚未实现..."` | **不存在** | 同上 |
| `paths["/api/voice/tts"].post.security` | 不存在 | `[{ bearerAuth: [] }]` | 同上 |
| `paths["/api/voice/tts"].post.responses` | `{ 200, 500 }` | `{ 200, 401, 500 }` | 同上 |
| `paths["/api/voice/tts"].post.requestBody.content["application/json"].schema.properties` | `{ text, voice, speed }` | `{ text, conversationId, messageId, save }` | LAYERS parameters 对齐真实 handler |
| `paths["/api/voice/tts"].post.requestBody.content["application/json"].schema.required` | `[]` 或不存在 | `["text"]` | `text` 不标 (可选) |
| `paths["/api/voice/tts/files/{fileName}"].get.x-registry-status` | `"inferred"` | **不存在** | 同 capabilities |
| `paths["/api/voice/tts/files/{fileName}"].get.x-note` | `"voice routes 尚未实现..."` | **不存在** | 同上 |
| `paths["/api/voice/tts/files/{fileName}"].get.security` | 不存在 | `[{ bearerAuth: [] }]` | 同上 |
| `paths["/api/voice/tts/files/{fileName}"].get.responses` | `{ 200, 500 }` | `{ 200, 401, 500 }` | 同上 |

**不变项**:
- `info.x-generator`: 保持 `"mechassist-openapi"`
- `info.title` / `info.version`: 保持 `"MechAssist AI Extern API"` / `"1.0.0"`
- `components.securitySchemes`: 保持 `{ bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } }`
- `servers[0].url`: 保持传入的 serverUrl

### 4.3 v2 发现目录变化

voice 进 LAYERS → `findLayer('chat')` 能查到 → `findModule('chat', 'voice')` 能查到 → `/v2/chat` 的 `Link[]` 中自动出现 `{ description: "语音合成", href: ".../v2/chat/voice", method: "GET" }` → `/v2/chat/voice` 返回 voice 三个端点的实现链接（href 为 `/api/voice/capabilities` 等实际路径）。v2Catalog.js 逻辑通用，无需任何改动。

---

## 5. 裁决 H1 三条 open_questions

### 5.1 Q1: PATH_FALLBACKS 中 voice 三键在 LAYERS 注册后是否需要完全删除？

**结论**: **保留，不移除，仅去 xNote。**

**理由**:

1. **控制流保证不重复** — `generateOpenApiSpec()` 中 `byPath.get(expressPath)` 在 voice 进 LAYERS 后返回非空数组，`continue` 跳过所有 fallback 代码路径。此结论来自代码阅读而非推测，改动的安全边界是已证实的。
2. **安全网价值** — 删除 fallback 后，若将来有人从 LAYERS 中误移除 voice 模块（常见于批量重构），voice 路径会退化为 `buildConservativeOperation()` 输出（仅 summary=key，无 parameters、无 security、无任何业务元数据），丢失信息远多于保留带清洗后元数据的 fallback。
3. **成本为零** — 不产生输出、不增运行时开销、键的定义不需要额外维护动作。
4. **最小改动原则** — 不删除不产生问题的代码。

### 5.2 Q2: A3（system/docs 下加 OpenAPI 端点）是否为必须？

**结论**: **非必须（可降为 P2 或放弃），建议做 P1。**

**理由**:

- 验收①原文是 "GET /api/docs 正文能发现 /api/openapi.json 与 /api/openapi.yaml（路径或顶层字段任一即可）"——A2 的 `openapi: { json, yaml }` 在 `/api/docs` 返回体中直接暴露路径，**满足"顶层字段"条件**。
- A3 的独立价值仅在 `/v2/system/docs` 下钻：使浏览 `/v2/` → `/v2/system/` → `/v2/system/docs` 的消费者也能发现 OpenAPI 入口。这属于发现面完整性的质量增强，不是验收必选项。
- **建议策略**: 若 DevLead 追求最小 diff，跳过 A3 完全合规；若愿意接受 6 行 JSON 的改动（A3 插入内容），可做 P1 顺手完善。

### 5.3 Q3: voice TTS POST 的 parameters 在 LAYERS 中应包含哪些字段？

**结论**: 包含 `text`（必填）、`conversationId`（可选）、`messageId`（可选）、`save`（可选，默认 true）。**不包含 `voice` / `speed`。**

**理由**（以 chatRoutes.js handler 为唯一真源）:

`chatRoutes.js` L1135-L1138 的 handler 代码:
```javascript
router.post(toMountPath(API_PATHS.VOICE_TTS), authenticateToken, async (req, res) => {
  const body = req.body || {}
  const { text, conversationId, messageId, save } = body
  const shouldSave = save !== false
  const out = await voiceTtsService.synthesize(text)
```

handler 之后仅通过 `voiceTtsService.synthesize(text)` 传入 text——`voiceTtsService.synthesize()` 签名为 `function synthesize(text)`，仅接受一个参数。`conversationId` / `messageId` / `save` 仅用于 `saveVoiceMp3(buf, { conversationId, messageId })` 的文件命名逻辑，不影响 TTS 合成本身。

PATH_FALLBACKS 中的 `voice` / `speed` 是过时残留——handler 中无任何引用，voiceTtsService 中无任何引用。这些字段在任何执行路径上都不被消费。

---

## 6. 确认无隐式依赖

### 6.1 auth:true 对全链路的影响分析

| 受影响模块 | 是否受影响 | 机制 | 验证方式 |
|-----------|-----------|------|----------|
| `generateOpenApiSpec()` | ✅ 是（预期内） | `buildOperationFromLayer()` 读 `ep.auth`，生成 `security: [{ bearerAuth: [] }]` + `responses.401` | 代码 L180-L184；M5 断言覆盖 |
| `getApiDocsPayload()` | ✅ 是（透传） | LAYERS 中 `e.auth` 透传到 `apis[].auth` 字段 | 代码 `getApiDocsPayload()` 的 spread 逻辑 |
| `v2Catalog` → `endpointsToLinks()` | ✅ 是（透传） | `e.auth ? { auth: true } : {}` | 代码 `registry.js` `endpointsToLinks()` |
| `openapiRoutes.js` | ❌ 否 | 纯函数调用 `generateOpenApiSpec()`，不管 endpoint 来源 | 代码 `openapiRoutes.js` L17-L30 |
| `chatRoutes.js` 运行时 | ❌ 否 | LAYERS 是数据声明，不影响 Express 中间件链 | voice handler 已有 authenticateToken，无需 registry 影响 |
| 前端 API 调用 | ❌ 否 | `/api/openapi.json` 和 `/api/openapi.yaml` 是公开端点，voice API 本身已有认证 | 消费者从 OpenAPI 读取 auth 要求，在调用时自行处理 |

**结论**: auth:true 的影响已完全覆盖且属于预期行为——使 OpenAPI 规范准确反映 voice 端点需要 JWT 认证的事实。

### 6.2 x-generator 保持

`openapiGenerator.js` L249: `info['x-generator'] = 'mechassist-openapi'` — 此赋值在 `generateOpenApiSpec()` 函数的返回语句中，与端点来源（LAYERS 或 fallback）完全无关。测试 `'info has x-generator field with correct value'` 继续通过。

### 6.3 无 router/middleware 隐含逻辑

| 检查项 | 结论 | 证据 |
|--------|------|------|
| voice handler 是否只在 chatRoutes.js | ✅ | `index.js` L92: `app.use('/api', apiLimiter, chatRoutes)` — 单一 mount 点 |
| openapiRoutes 是否独立于 LAYERS | ✅ | `index.js` L93: `app.use('/api', apiLimiter, openapiRoutes)` — 独立 mount |
| `generateOpenApiSpec` 是否有副作用 | ❌ | 纯函数，仅读取入参 + PATH_FALLBACKS 常量 |
| `getApiDocsPayload` 是否有副作用 | ❌ | 纯函数，仅读取 LAYERS |
| `collectLayerEndpoints` 是否有副作用 | ❌ | 纯函数，返回新建的 Map |
| LAYERS 变更是否影响 Express 路由 | ❌ | LAYERS 是数据声明，Express 路由通过 `router.get/post()` 独立注册 |

### 6.4 架构合规性检查表

| 检查项 | 结论 | 备注 |
|--------|------|------|
| 分层与职责符合设计 | ✅ 通过 | voice 挂 chat 层，与 Express 路由物理归属一致 |
| 无跨层调用或违规依赖 | ✅ 通过 | registry → openapiGenerator → v2Catalog 单向，无反向引用 |
| 接口与契约一致 | ✅ 通过 | parameters 对齐真实 handler 入参，auth 对齐 middleware |
| 目录与命名符合规范 | ✅ 通过 | voice 模块 id/name/description 与现有模块风格一致 |
| 依赖在允许清单内 | ✅ 通过 | 仅改白名单文件 registry.js / openapiGenerator.js / openapi.test.js |
| 错误/超时/重试语义清晰 | ✅ N/A | 非运行时改动，不引入新错误路径 |
| 不改热路径 | ✅ 通过 | chatRoutes.js / openapiRoutes.js / voiceTtsService.js 均不改 |
| LAYERS 为单一真源 | ✅ 通过 | voice 进 LAYERS → fallback 不再生效 |

---

## 7. 红色模块清单

| 模块 | 判定 | 理由 |
|------|------|------|
| `server/catalog/registry.js` LAYERS 数组 | 🟢 非红色 | 纯数据声明，无运行时逻辑；新增 voice 模块为 JSON 节点追加 |
| `server/catalog/registry.js` `getApiDocsPayload()` | 🟢 非红色 | 纯函数，仅新增一个顶层字段 |
| `server/catalog/openapiGenerator.js` `PATH_FALLBACKS` | 🟢 非红色 | 仅删除过时 xNote 字段；核心生成函数不变 |
| `server/catalog/openapiGenerator.js` `generateOpenApiSpec()` | 🟢 非红色 | 函数体不改；仅输入数据（LAYERS）变化驱动输出变化 |
| `server/routes/chatRoutes.js` | 🔴 **红色 — 禁改** | 热路径，voice handler 已正确实现 |
| `server/routes/openapiRoutes.js` | 🟢 非红色 | 现有实现正确，不改 |
| `shared/apiPaths.js` | 🔴 **红色 — 禁改** | API 路径常量，voice 三条已在 |

---

## 8. 实施顺序

```
Phase 1（P0，一次 commit）:
  1. server/catalog/registry.js      — A1（voice 模块进 LAYERS）
  2. server/catalog/registry.js      — A2（getApiDocsPayload 加 openapi 字段）
  3. server/catalog/openapiGenerator.js — M1+M2+M3（PATH_FALLBACKS 去 xNote）
  4. server/test/openapi.test.js     — M5（断言适配）
  5. npm run test:server -- --update-snapshots
  6. git diff 确认改动面仅含白名单文件
  7. npm run test:server 确认全绿

Phase 2（P1，可选）:
  8. server/catalog/registry.js      — A3（system/docs 加 openapi 端点）
  9. npm run test:server -- --update-snapshots（如 paths 有变化）
 10. npm run test:server
```

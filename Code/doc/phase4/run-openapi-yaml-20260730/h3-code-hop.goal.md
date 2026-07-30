【H3 代码跳 · DevLead】严格按已定稿架构实施 extern-api OpenAPI YAML 端点新增，禁止反问，直接执行。

## 必读定稿文档（先读再动手）

① D:\trae_git\Agents-Skill-Site\Code\doc\phase4\run-openapi-yaml-20260730\scope-list.md
② D:\trae_git\Agents-Skill-Site\Code\doc\phase4\run-openapi-yaml-20260730\arch-constraints.md

## 实施范围（相对你的工作目录 extern-api/）

### 1. server/routes/openapiRoutes.js（修改 | 核心改动文件）

现有 GET /api/openapi.json 路由。需做以下改动：

1）在顶部新增 import：
```js
import { dump } from 'js-yaml'
```

2）提取 serverUrl 计算为模块级工具函数复用：
```js
function resolveServerUrl() {
  return (
    process.env.OPENAPI_SERVER_URL ||
    `http://localhost:${process.env.PORT || 3002}`
  )
}
```

3）修改现有 JSON 路由中 serverUrl 赋值 → 改为调用 `resolveServerUrl()`

4）在 JSON 路由之后新增 YAML 路由：
```js
router.get('/openapi.yaml', (req, res) => {
  try {
    const spec = generateOpenApiSpec({
      LAYERS, API_PATHS,
      serviceName: SERVICE_NAME,
      serviceVersion: SERVICE_VERSION,
      serverUrl: resolveServerUrl()
    })
    const yamlStr = dump(spec, {
      noRefs: true,
      lineWidth: -1,
      noCompatMode: true,
      sortKeys: false
    })
    res.type('application/yaml').send(yamlStr)
  } catch (error) {
    console.error('openapi.yaml error:', error)
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: '生成 OpenAPI 规范失败' }
    })
  }
})
```

- YAML dump 选项说明：noRefs:true（禁止 $ref 别名引用）、lineWidth:-1（禁止自动折行，CI 友好）、noCompatMode:true（YAML 1.2 模式）、sortKeys:false（保持插入顺序）
- 错误响应与 JSON 路由完全一致（JSON 格式）

**不改动**：现有 JSON 路由的业务逻辑

### 2. server/test/openapi.test.js（修改 | +~40 行）

1）顶部新增 import：
```js
import { load as yamlLoad, dump } from 'js-yaml'
```

2）在 `request()` 函数中，resolve 对象新增 `headers` 字段：
```js
resolve({ status: res.statusCode, json, raw: body, headers: res.headers })
```

3）新增 describe 块 A：「GET /api/openapi.yaml returns valid YAML」
- it "returns HTTP 200 with Content-Type application/yaml" — 集成测试用 request(app)，断言 status===200 且 headers['content-type'] 含 application/yaml
- it "YAML payload is parseable by js-yaml" — 用 yamlLoad(dump(buildSpec())) 验证
- it "YAML output is semantically equivalent to JSON spec on key fields" — 用 yamlLoad() 反解析后逐条断言：openapi、info.title、info.version、info['x-generator']、servers[0].url、paths keys 数量与逐 key 存在、components.securitySchemes 深度相等

4）新增 describe 块 B：「GET /api/openapi.yaml endpoint integration」
- it "endpoint returns parseable YAML matching in-memory spec" — 集成测试，从端点获取 raw YAML，yamlLoad() 后断言 openapi==="3.0.3" 且 info['x-generator']==="mechassist-openapi"

### 3. 不改动的文件（确认清单）
- server/catalog/openapiGenerator.js — 零改动
- server/index.js — 零改动（YAML 路由挂在已有 openapiRoutes Router 上）
- server/catalog/registry.js — 零改动
- shared/apiPaths.js — 零改动
- server/routes/chatRoutes.js — 零改动
- 任何其他测试文件 — 零改动

## 验收（全部自验通过才可收尾）

① 先跑 baseline：`npm run test:server` 确认存量全绿，再动手
② 改完后全量 `npm run test:server` 全部通过（新增 + 存量全绿）
③ curl 验证两个端点：
   - `curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/openapi.json` → 200
   - `curl -s -o /dev/null -w "%{http_code}" http://localhost:3002/api/openapi.yaml` → 200
   - `curl -s http://localhost:3002/api/openapi.yaml | head -5` → YAML 格式可见
④ `git status` 改动文件仅限 `server/routes/openapiRoutes.js` + `server/test/openapi.test.js`（± 存量快照更新）

## 硬约束（不可违反）

- 禁跑 `npm install` / `npm rebuild`（js-yaml 已在 node_modules 传递依赖中）
- 禁改 `openapiGenerator.js` / `registry.js` / `apiPaths.js` / `index.js`
- 禁改任何未被本 Goal 列入修改范围的文件
- 禁 `git push`
- 测试用 `npm run test:server` 而非 `npm test`

## 回复格式

严格用三个标题：
- ## 当前进度
- ## 下一步计划
- ## 本次结果摘要（含改动文件清单 + 测试输出摘要 + git status）

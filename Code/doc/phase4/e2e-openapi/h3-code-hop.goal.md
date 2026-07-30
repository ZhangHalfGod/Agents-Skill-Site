【H3 代码跳 · DevLead】严格按已定稿架构实施 extern-api Registry→OpenAPI，禁止反问，直接执行。

必读两份定稿文档（先读再动手，违反其中 decisions 的产出无效）：
① D:\trae_git\Agents-Skill-Site\Code\doc\phase4\e2e-openapi\AI代码生成范围清单_registry-openapi.md
② D:\trae_git\Agents-Skill-Site\Code\doc\phase4\e2e-openapi\架构约束与接口_registry-openapi.md

实施范围（相对你的工作目录 extern-api/）：
- 新增 server/catalog/openapiGenerator.js（核心层：纯函数 generateOpenApiSpec(options)，入参/出参签名、LAYERS→OpenAPI 映射、PATH_FALLBACKS 内嵌常量、:param→{param} 转换、错误边界行为，全部按文档② §2-§8 定稿实现）
- 新增 server/routes/openapiRoutes.js（单路由 GET /api/openapi.json，调生成器，不加 authenticateToken）
- 新增 server/test/openapi.test.js（node:test：①openapi/info/paths 结构校验 ②paths 覆盖全部 28 条 API_PATHS 逐条断言 ③快照测试：首次写 server/test/__snapshots__/openapi.snapshot.json 后续对比，serverUrl 固定 http://localhost:3002 ④关键端点 method/auth/parameters 校验）
- 修改 server/index.js（仅 +2 行：import openapiRoutes 与 app.use('/api', apiLimiter, openapiRoutes)，不动其他任何行）

硬约束（decisions 不可推翻）：不修改 server/routes/chatRoutes.js / server/catalog/registry.js / shared/apiPaths.js / 任何存量测试文件；不安装新 npm 依赖；POST/PUT/PATCH 端点的 parameters 映射为 requestBody，GET/DELETE 的映射为 query parameters；auth=true→security:[{bearerAuth:[]}]，false/缺省→不设；servers[].url 用 OPENAPI_SERVER_URL 环境变量或默认 http://localhost:PORT。

验收（全部自验通过才可收尾）：
① 先跑 baseline：npm run test:server 确认存量全绿，再动手；
② 实施后启动服务，GET /api/openapi.json 返回 HTTP 200 且响应 openapi 字段为 "3.0.3"，paths 覆盖全部 28 条 API_PATHS；
③ 快照测试通过；
④ 再次全量 npm run test:server 保持全绿（新增+存量）。

openapiGenerator.js 属核心层红色记录模块：在结果摘要末尾附《核心模块AI生成红色记录》简表（模块名/变更范围/风险点/自审结论）。

回复严格用三个标题：## 当前进度 ## 下一步计划 ## 本次结果摘要（含改动文件清单 + 测试输出摘要 + 红色记录简表）。

【H3 代码跳 · DevLead】严格按已定稿架构实施 extern-api OpenAPI info 增加 x-generator，禁止反问，直接执行。

必读两份定稿文档（先读再动手，违反其中 decisions 的产出无效）：
① D:\trae_git\Agents-Skill-Site\Code\doc\phase4\run-openapi-x-generator-20260730\h1-pm.scope-checklist.md
② D:\trae_git\Agents-Skill-Site\Code\doc\phase4\run-openapi-x-generator-20260730\h2-arch.constraints.md

实施范围（相对你的工作目录 extern-api/）：
- 修改 server/catalog/openapiGenerator.js：在 generateOpenApiSpec 函数内，info 对象构造后、return 之前，增加一行 info['x-generator'] = 'mechassist-openapi'（必须放在 if (generationWarnings.length) { ... } 块之后）
- 修改 server/test/openapi.test.js：新增 2 条 it 块：
  ① 在 describe('OpenAPI 3.0 structure is valid') 内增加它：assert.equal(spec.info['x-generator'], 'mechassist-openapi')
  ② 在 describe('GET /api/openapi.json returns valid OpenAPI 3.0') 内增加它：assert.equal(json.info['x-generator'], 'mechassist-openapi')
- 更新快照：运行 npm run test:server -- --update-snapshots 更新 server/test/__snapshots__/openapi.snapshot.json

硬约束（decisions 不可推翻）：
- 不修改 server/routes/chatRoutes.js / server/catalog/registry.js / shared/apiPaths.js / server/index.js / server/routes/openapiRoutes.js / server/controllers/openapiController.js
- 不安装新 npm 依赖
- 不修改任何路由挂载点
- 禁跑 npm install / npm rebuild
- 禁 git push

验收（全部自验通过才可收尾）：
① 先跑 baseline：npm run test:server 确认存量全绿，再动手；
② 实施后再次 npm run test:server（含 --update-snapshots）保持全绿（新增+存量）；
③ spec.info['x-generator'] === 'mechassist-openapi'；
④ git status 改动面 ⊆ {server/catalog/openapiGenerator.js, server/test/openapi.test.js, server/test/__snapshots__/openapi.snapshot.json}

openapiGenerator.js 属核心层红色记录模块：在结果摘要末尾附《核心模块AI生成红色记录》简表（模块名/变更范围/风险点/自审结论）。

回复严格用三个标题：## 当前进度 ## 下一步计划 ## 本次结果摘要（含改动文件清单 + 测试输出摘要 + 红色记录简表）。

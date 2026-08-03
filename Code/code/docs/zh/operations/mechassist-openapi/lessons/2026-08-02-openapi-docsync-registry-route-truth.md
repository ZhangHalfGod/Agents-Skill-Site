---
id: 2026-08-02-openapi-docsync-registry-route-truth
project: mechassist-openapi
date: 2026-08-02
audience: skill
audience_guess: skill
target_id: ""
priority: P1
status: merged
scope: common
seen_in_projects: [mechassist-openapi]
promoted_to: docs/zh/skills/custom/common/openclaw-ops/docs/orchestration-pitfalls.md
related_agents: [ProductManager, Architect, DevLead]
related_skills: [openclaw-ops]
---

# Lesson：路由实现判据以实测为准——静态 grep 字面量会漏常量间接挂载（/api/docs 假阴性）

## 现象

openapi-doc-sync（r2）H2 arch 复核时 grep `server/routes/*.js` + `server/index.js` 找字面量 `/api/docs` 无匹配，据此断言「`system/docs` implemented:true 是 registry 误标、无路由实现、请求会 404」，并写入 lesson_hint 传给 H3。H4 独立复验起服务 curl 实测：`GET /api/docs` 返回 **200**（结构化文档 JSON，含 layers/modules/apis）。定位真实挂载点：`server/routes/chatRoutes.js:828` 用 `router.get(toMountPath(API_PATHS.API_DOCS), ...)` 挂载，`shared/apiPaths.js:32` 定义 `API_DOCS: '/api/docs'`——**字面量 grep 必然漏掉常量间接引用**。registry 的 implemented:true 与实际一致，H2 的「误标/404」结论为假阴性。

另：H4 实测的 openapi.json 中 `/api/docs` 与 `/api/voice/*` 等均按 registry 生成；voice 路径仍带 x-note「voice routes 尚未实现 Express handler（仅 service 层存在）」（与 07-31 旧 lesson 描述的状态不同，说明代码状态会变，lesson 需按最新实测校准）。

## 期望

- 判定「某路由是否实现」**以起服务实测为准**（curl 状态码 + 响应体），静态 grep 只能作线索，且必须沿常量链解析（API_PATHS.* + toMountPath）后再核对
- lesson_hint 在写「会 404 / 未实现」这类事实断言前，先起服务验证；推断与事实要分开标注，禁止把推断当事实传给下一跳
- 编排者 H4 对 lesson_hint 也要复验，不信 agent 自报（本次正是 H4 推翻 H2 结论）

## 当时上下文

- 角色：编排者（H1/H2 门禁 + H3 派遣 + H4 独立复验）
- 技能：openclaw-ops（known issue 候选：路由判据）
- 摘要：openapi-doc-sync 纯文档对齐（extern-api/README.md L96、doc/重构api架构/README.md L53 两处「未实现」→ 已实现端点描述）；H4 git diff 仅 2 .md 各 1 行 ∈ 白名单；grep extern-api 全量 .md 矛盾表述 0；/api/openapi.json 200 (8793B) + /api/openapi.yaml 200 (11387B) 均 openapi=3.0.3

## 编排侧踩坑（同 run 记录）

1. **H1 两次拒收**：pm agent 漏落盘 `mcp-resolve-h1.yaml`（第 1 次两文件都漏；第 2 次 playbook-pack-h1.md 落了但 yaml 仍漏，且 pack 内勾选「已落盘」与文件系统事实不符）→ 按回退边 2 次不合格上报人工，用户裁决豁免（选项 2：main 依信封 evidence 补写）。教训：子 agent 落盘后必须自查文件存在；编排者校验以文件系统为准，不信勾选/自报。
2. **H2 信封内嵌交付物文件**：arch 回复只有摘要、无 `---SPLIT---`+信封，但把完整交付物+信封写进了 h2-arch-constraints.md；main 从文件提取信封归档（内容完整，四要素齐，未拒收）。教训：文档跳输出契约应明确「信封必须在回复」或允许双通道；校验以产物完整为准。
3. **H3 派遣 PS 5.1 拆参**：`invoke-cursor-agent.ps1` 的 `Start-Process -ArgumentList` 把中文多行 Goal 拆碎 → cursor-agent.ps1 PSArgumentException；改用 m18 先例 wrapper（`versions/<ver>/node.exe index.js -p --trust --force --approve-mcps` 直调，`&` 传参保持单参）→ 47.8s 成功。教训：H3 派遣统一走版本目录直调 wrapper，禁止 Start-Process 传长中文 Goal。
4. **M1 措辞 nuance**：M1 目标措辞「Swagger UI 页面（/api/docs）另行规划」把 /api/docs 与 Swagger UI 混同（/api/docs 实为结构化文档端点，已实现且 200；Swagger UI 确实不存在）。文档已不再写 OpenAPI「未实现」，验收通过；该措辞 precision 问题作为遗留记录，未阻塞。

## 建议沉淀形态

- [ ] 新 skill
- [x] 扩写已有 skill checklist（openclaw-ops：路由实现判据以实测为准一条；编排契约加「落盘后自查」「H3 直调 wrapper」句）
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- H4（系统 node v22.22.0，临时实例 PID 23636，端口 3002，验后已关）：
  - GET /api/openapi.json → 200, 8793B, `{"openapi":"3.0.3","info":{"title":"MechAssist AI Extern API","version":"1.0.0","x-generator":"mechassist-openapi"},"servers":[{"url":"http://localhost:3002"}]...}`
  - GET /api/openapi.yaml → 200, 11387B, `openapi: 3.0.3`（YAML）
  - GET /api/docs → **200**（结构化文档 JSON：version/title/catalogRoot=/v2//layers[...]）→ 推翻 H2「404」断言
  - grep `server/` + `shared/`：`chatRoutes.js:828 router.get(toMountPath(API_PATHS.API_DOCS), ...)`；`apiPaths.js:32 API_DOCS:'/api/docs'`；`registry.js:260 path: API_PATHS.API_DOCS`
- git diff（业务仓）：仅 `extern-api/README.md`、`extern-api/doc/重构api架构/README.md` 各 1 行（M1/M2），M2b（L50 结构化文档行）未动；其余工作区改动为开跑前既有无关项（debug.txt、方案C 文档）
- grep extern-api 全量 .md（排除 node_modules）：OpenAPI+（未实现|规划中）同语义块 = 0
- 产物：run-openapi-doc-sync-20260802-r2（信封/mcp-resolve/playbook-pack/h3-doc-alignment-report/handoff-h3.envelope/evidence/）
- 本 session 2026-08-02（run-openapi-doc-sync-20260802-r2）

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：
- 变更摘要：

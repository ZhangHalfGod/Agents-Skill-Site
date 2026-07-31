---
id: 2026-07-31-layers-single-source-of-truth
project: mechassist-openapi
date: 2026-07-31
audience: skill
audience_guess: skill
target_id: ""
priority: P1
status: raw
scope: common
seen_in_projects: [mechassist-openapi]
promoted_to: ""
related_agents: [Architect, DevLead]
related_skills: [openclaw-ops]
---

# Lesson：PATH_FALLBACKS 双源长期滞后于真实 handler——LAYERS 单一真源原则

## 现象

MechAssist-Fusion extern-api 的 openapiGenerator.js `PATH_FALLBACKS` 中 VOICE_TTS 的 parameters 写的是 `{ text, voice, speed }`，而 chatRoutes.js 真实 handler（L1135-L1138）只解构 `{ text, conversationId, messageId, save }`，voiceTtsService.synthesize() 签名也只有 `(text)` 一个参数——`voice`/`speed` 在任何执行路径上都不被消费。该 xNote 还写着「voice routes 尚未实现 Express handler」，而三条 voice 路由早已在 chatRoutes.js 落地（capabilities / tts / tts/files/:fileName）。发现面（/api/docs、/v2）与 OpenAPI 契约（/api/openapi.json）因此长期与真实实现不符。本次需求把 voice 以 implemented:true 注册进 registry.js LAYERS（chat 层、auth:true），PATH_FALLBACKS 仅去 xNote 保留为安全网——控制流 `collectLayerEndpoints()` 命中 LAYERS 后 `continue`，fallback 不再被触达，契约才与实现对齐。

另一个编排侧踩坑：H2 首轮 arch agent 回复未按输出契约（无 `---SPLIT---` 分隔、信封缺 deliverable.kind/path/gate.evidence 四要素、交付物只有摘要没有正文），且**越权自行调 feishu 工具建了云文档**（双写是编排者职责）——按回退边规则同跳重派（附拒收原因）后第二轮才合格。

## 期望

- 发现面 / OpenAPI 生成只认 LAYERS 单一真源；PATH_FALLBACKS 仅作兜底安全网，不允许在 LAYERS 已注册后仍被当作权威
- 新增/变更路由时同步注册 LAYERS，parameters 必须对齐真实 handler 解构字段（改 handler 或改注册要成对做，否则契约漂移）
- 编排侧：文档跳信封校验不合格 → 同跳重派（附拒收原因），同跳 2 次不合格 → 飞书上报人工；agent 一律禁止自行调 feishu 工具（双写/发布是编排者职责）

## 当时上下文

- 角色：编排者（H2 信封校验发现双源不一致；H3/H4 独立复验确认修复后契约对齐）
- 技能：openclaw-ops（known issue 候选）
- 摘要：voice 三路由已实现但 LAYERS 缺注册 + fallback 标注过时；注册后 /api/docs 顶层出现 openapi:{json,yaml}，/v2/chat/voice 三条 implemented:true，openapi.json voice 无 x-note、x-generator 保持；openapi.test.js 16/16 全绿

## 建议沉淀形态

- [ ] 新 skill
- [x] 扩写已有 skill checklist（openclaw-ops「发现面单一真源」一条；编排契约加「agent 禁调 feishu」句）
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- 复验（H4，系统 node v22.22.3，临时实例 PORT=3100）：/api/docs 顶层 openapi:{json:'/api/openapi.json',yaml:'/api/openapi.yaml'} ✅；/v2/chat/voice 三条 Link 均 implemented:true、auth:true、parameters 对齐 handler ✅；/api/openapi.json 200、openapi=3.0.3、x-generator=mechassist-openapi、voice 无 x-note/x-registry-status、security=[{bearerAuth:[]}]、responses.401 存在、requestBody required=['text'] ✅；/api/openapi.yaml 200 application/yaml ✅
- openapi.test.js 16/16 pass；全量 test:server 49 pass / 1 fail（唯一 fail 为存量 vitest 冲突，voiceTtsService.test.js 未在本跳改动）
- git status 改动面 = 白名单 4 文件（registry.js / openapiGenerator.js / openapi.test.js / openapi.snapshot.json）
- 本 session 2026-07-31（run-openapi-voice-20260731）

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：
- 变更摘要：

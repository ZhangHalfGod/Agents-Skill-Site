---
id: 2026-07-30-feishu-doc-five-layer-gates
project: openclaw-orchestration-pilot
date: 2026-07-30
audience: skill
audience_guess: skill
target_id: ""
priority: P2
status: raw
scope: common
seen_in_projects: [openclaw-orchestration-pilot]
promoted_to: ""
related_agents: [OpsEngineer]
related_skills: [openclaw-ops]
---

# Lesson：agent 自述"feishu_doc 未注册"别信表象——插件工具可见性是五层独立门禁，逐层验

## 现象

让 main agent 用 `feishu_doc` 建飞书云文档，agent 反复自述"工具未在运行上下文注册"。按 agent 给的提示逐层排查，**连闯五层才真正打通**，每层修复后表象都一样（还是"未注册"），极易中途放弃或误判已修好：

| 层 | 门槛 | 本机状态与修法 |
|----|------|---------------|
| 1 | 插件包已安装：`@openclaw/feishu`（`~/.openclaw/npm/projects/openclaw-feishu-*`），`openclaw plugins list` 可见 enabled | ✅ 本机已装；缺失则 `openclaw plugins install` |
| 2 | `channels.feishu.tools.doc: true`（默认 true，显式写无害） | ✅ 显式写入 |
| 3 | **session 级工具清单缓存**：改配置后旧 session 仍按建 session 时的清单 | ❌→清 session（停 gateway → 删 sessions.json 条目+转录文件 → 重启） |
| 4 | **全局 `tools.profile: "coding"` = 核心编码工具白名单**（setup wizard 默认产物），插件工具被**静默过滤**；且该域**热加载不接管**（日志只有 `evaluating reload (tools.profile)`，下一条消息仍 `(coding)`） | ❌→改 `"full"` + **必须重启 gateway** |
| 5 | **飞书应用 API scope**：`docx:document` / `docx:document:readonly` / `docx:document.block:convert` / `drive:drive`(+`:readonly`) / `contact:contact.base:readonly`；加完**必须发布新版本**才生效 | ❌→开发者后台加 scope + 发布 |

## 期望

- agent 自述"工具未注册"时**不要当真**——它看不到注册失败的层数，只能看到最终工具列表。排查按 1→5 顺序走，别按 agent 建议的顺序
- 最快诊断信号：gateway 日志 `[agents/tool-policy] tool policy removed ... via tools.profile (coding)` 出现即第 4 层中枪
- 改完 `tools.profile` 别信热加载——日志只有 "evaluating" 没有 applied 记录的域，一律重启 gateway 再验
- **CLI 冒烟先行**：`invoke-openclaw-agent.cjs main <消息>` 可在不等用户的情况下验证工具是否注册（webchat 上下文同样受 profile 影响，profile 修好后 CLI 也有 feishu_doc）；但 `owner_open_id` 授权链路（建的文档自动授权给发送者）只能在飞书群里真发消息验证
- `feishu_app_scopes` 工具可让 agent 自查应用已授 scope 清单——第 5 层诊断不用翻后台
- 顺带的噪音：应用缺 `contact:contact.base:readonly` 时 gateway 日志反复刷 sender 名字解析 400（"ignoring stale permission scope error"），一并加上清净

## 当时上下文

- 角色：编排总线运维（bm 机），目标 = 让 main 能建飞书云文档写长 md
- 技能：openclaw-ops（建议升格时把「五层门禁表 + CLI 冒烟先行」写进该 skill）
- 摘要：14:34→15:05 共 31 分钟五连排，最终 CLI 冒烟 ✅（建文档+写入+回链接）+ 群聊真链路 ✅（owner_open_id 授权生效，用户可点开）

## 建议沉淀形态

- [ ] 新 skill
- [x] 扩写已有 skill checklist（openclaw-ops 增补「插件工具不可用五层排查」）
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- 冒烟消息与产物：`Code/doc/phase4/e2e-openapi/smoke2.message.md`、`smoke-feishu-doc.raw.txt`（失败期 webchat 回复留样）
- 注册门槛实测法：node 直接 import 插件 `dist/api.js`，用真实 openclaw.json 构造 fake api（registerTool 捕双参），调 `registerFeishuDocTools` 看是否注册/抛错——本次实测注册通过，把嫌疑直接逼到 profile 层
- profile 白名单定义：openclaw `dist/tool-catalog-*.js` 的 `CORE_TOOL_PROFILES`（coding = 核心工具 allowlist + bundle-mcp，full = `["*"]`）
- 配置备份：`.openclaw/openclaw.json.bak-feishu-tools` / `.bak-tool-profile` / `.bak-clear-0730`（sessions）

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：
- 变更摘要：

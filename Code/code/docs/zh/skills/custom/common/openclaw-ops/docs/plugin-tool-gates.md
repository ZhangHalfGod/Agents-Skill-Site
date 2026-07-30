# 插件工具"未注册"五层门禁排查

> 来源：2026-07-30 feishu_doc 不可用 31 分钟五连排（Lesson `2026-07-30-feishu-doc-five-layer-gates`）。

agent 自述"工具未在运行上下文注册"时，它**只能看到最终工具列表，看不到失败层数**——按它的建议排查会绕路。插件工具（feishu_doc 等）可见性 = 五层独立门禁，逐层验：

## 五层门禁（按序排查）

| # | 门槛 | 验证方法 | 修法 |
|---|------|---------|------|
| 1 | 插件包已安装且 enabled | `openclaw plugins list`（真身在 `~/.openclaw/npm/projects/openclaw-<插件>-*/`，不在 openclaw 核心包里） | `openclaw plugins install <spec>` |
| 2 | 渠道工具开关 | `channels.feishu.tools.doc` 等（默认 true） | 显式写 true |
| 3 | session 工具清单缓存 | 改配置后旧 session 仍用建 session 时的清单 | 停 gateway → 删 `~/.openclaw/agents/<id>/sessions/sessions.json` 条目+同前缀转录文件 → 重启 |
| 4 | **全局 `tools.profile`** | gateway 日志出现 `[agents/tool-policy] removed ... via tools.profile (coding)` 即中枪 | `"coding"` 是核心编码工具白名单（wizard 默认产物），插件工具被**静默过滤**；改 `"full"`（`allow: ["*"]`）后**必须重启 gateway**——该域热加载不接管（日志只 `evaluating reload` 无 applied） |
| 5 | 渠道应用 API scope | 让 agent 调 `feishu_app_scopes` 自查已授清单，或看 API 返回 400/99991672 | 开发者后台加 scope + **发布新版本**（飞书：不发布不生效） |

## 加速手段

- **CLI 冒烟先行**：`node Code/orchestration/openclaw/invoke-openclaw-agent.cjs main <消息文件> --timeout 120`，不等用户在飞书操作即可验证工具注册（webchat 上下文同样受 profile 影响）。但涉及发送者身份的链路（如 feishu_doc 的 `owner_open_id` 授权）只能在真实渠道里验
- **注册门槛实测**：node 直接 import 插件 `dist/api.js`，用真实 `openclaw.json` 构造 fake api（`registerTool` 捕获双参——名字可能在第二参 meta 里），调 `registerFeishuXxxTools` 看注册/抛错，一次定位是配置问题还是注册链问题
- profile 语义真源：openclaw `dist/tool-catalog-*.js` 的 `CORE_TOOL_PROFILES`（minimal/coding/messaging 都是核心工具 allowlist，只有 full 是 `*`）

## feishu_doc 打通基线（2026-07-30 实证）

- scope 清单（插件 SKILL.md 官方列出）：`docx:document`、`docx:document:readonly`、`docx:document.block:convert`、`drive:drive`(+`:readonly`)；另加 `contact:contact.base:readonly` 消除 sender 名字解析 400 噪音
- 群聊链路：bot 建文档后 `owner_open_id` 会把完全访问权限授给@它的用户——回链接后让用户点开确认

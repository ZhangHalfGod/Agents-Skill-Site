# 03 — OpenClaw 角色路由表（含模型分层与回退）

> **文档级别**：四期契约  
> **日期**：2026-07-29  
> **部署事实来源**：`MechAssist-Fusion/doc/remote-agent-openclaw/`（可执行文档 + 双Bot分工 + bm v1～v4 档案）  
> **标记约定**：✅=部署侧已验证的模式；**待验证**=文档未覆盖、试点时逐条确认

---

## 1. 可用的 OpenClaw 机制（部署侧现状）

| 机制 | 现状 | 出处 |
|------|:----:|------|
| Gateway 常驻（bm `:18789` loopback；Scheduled Task） | ✅ | 可执行文档 §版本栏 |
| `openclaw agent --agent <id> --message "..."` 单轮唤起 | ✅（现用 `main`） | 同上 V1～V4 |
| workspace skills（`SKILL.md` + `skills.entries.<name>.enabled`） | ✅（weather / local-tts-9880 / route-dispatch / code-via-cursor-cli / switch-dashscope-model） | scripts/openclaw/common/skills/ |
| 消息内路由解析（route-dispatch：「在 mac\|windows …」→ target） | ✅ V4 | bm/v4 档案 |
| MCP 挂接（`mcp.servers` 或等价） | ✅（Home 天气走 mcp-gaode） | 双Bot与模型分工 |
| 模型供应商注册与切换（DashScope / DeepSeek provider + `openclaw models set`） | ✅ | switch-dashscope-model skill；`deepseek-v4-flash` 已 configured 且为 bm 默认（2026-07-29 `models list`） |
| Cursor CLI headless 执行（`invoke-cursor-agent.ps1`：`--trust -f --approve-mcps --resume`） | ✅ V5 脚本就绪 | code-via-cursor-cli skill |
| Cron 定时任务：`openclaw cron add`（agent 消息任务 + `--command-argv/--command-cwd` 命令任务；`--agent/--model/--webhook`） | ✅（bm 现有 7 条 brief 任务实战） | 2026-07-29 本机实测（§6） |
| **多命名 agent**（`openclaw agents add <id> --model <m> --workspace <dir>`）+ workspace SOUL.md persona | ✅ 2026-07-29 实测：pm/arch/ui/dev/test/sec/ops 已建 | §6 |
| **per-agent 模型绑定**（注册 `--model`；运行 `--model` 覆盖；cron `--model`） | ✅ 同上 | §6 |
| per-agent auth 隔离（独立 auth store，须逐 agent `models auth --agent <id> paste-api-key`） | ✅ 同上 | §6 |
| 信封 JSON 的机器校验（schema 拒收） | **待验证**（v1 由编排 Prompt 软校验） | 四期新增 |

## 2. 路由表（主链路六跳）

> **试点期绑定（2026-07-29 用户决策）**：全部角色统一绑 `deepseek/deepseek-v4-flash`（bm 已 configured + default）；下表「意图层级」供用户后续自行分档绑定。

| 跳 | OpenClaw session | 意图层级 | 试点期实际绑定 | 唤起机制 | 失败回退 |
|----|------------------|:--------:|----------------|----------|----------|
| 入口 | `main`（编排者，收飞书/CLI 消息） | 中 | `deepseek/deepseek-v4-flash` | 渠道消息 | 人直接在 IDE 接力 |
| H1 | `pm`（ProductManager persona） | **顶级** | `deepseek/deepseek-v4-flash` | main 解析「走流水线」→ 唤起 pm | R3 / M1 |
| H2 | `arch`（Architect；可选并行 `ui`） | **顶级** | `deepseek/deepseek-v4-flash` | pm 交信封 → main 唤起 arch | R3 / M2 |
| H3 | `dev`（DevLead） | 中 | `deepseek/deepseek-v4-flash` | arch 信封 → dev；**代码产出走 Cursor CLI**（机制 B） | R1 / R3 |
| H4/H5 | `test`、`sec`（并行） | 中 | `deepseek/deepseek-v4-flash` | dev 信封广播 | R1 / R2 |
| H6 | `ops`（OpsEngineer） | 中 | `deepseek/deepseek-v4-flash` | 双报告齐 → ops；**M3 人工放行** | M3 |
| 文档类副线（简报、蒸馏草稿） | `main` 直答或 `docs` | 经济 | `deepseek/deepseek-v4-flash` | Cron / 收尾 | 人工 |

模型分层原则（亮点文档 §1.2）：核心决策（PM/架构）用顶级；执行类用中端；文档类用经济。**试点期统一 flash，后续分档由用户绑定**；四期不做自动调配（优先级③再做）。bm 已注册备选：`qwen/qwen3.7-max` 系、`qwen-oauth/*`、`deepseek/deepseek-v4-pro` 等。

## 3. 交接的两种唤起机制

### 机制 A：OpenClaw 内部多 agent 转交（✅ 2026-07-29 验证通过，详见 §6）

main 作为编排者，按路由表依次 `openclaw agent --agent <role>` 唤起角色 session，信封 YAML 作为 message 传入。已验证：命名 agent 注册、per-agent 模型/auth、workspace SOUL.md persona、`--session-key` 显式会话。

### 机制 B：每跳 spawn Cursor CLI headless（保底态，✅ 模式已验证）

复用 V5 模式：每跳 = 一次 `invoke-cursor-agent.ps1 -WorkDir <业务仓> -Goal "<角色 Prompt + 信封>"`。角色说明书用 `@` 路径写进 Goal（Cursor 侧共用本机 MCP/rules/模型）。适合 H3（代码产出）及一切需要改文件的跳。

**机制分工定案**：角色对话与信封流转走 A；需要改业务仓文件的跳（典型 H3）走 B；编排者 main 串两者。

## 4. 编排者（main）的软校验 Prompt 要点

v1 无机器 schema 校验时，main 的角色 Prompt 必须包含：

1. 收信封先查必填字段与 `deliverable.path` 存在性，缺则按 R3 拒收
2. 按路由表选下一跳，不跳级（H2 不过不能到 H3）
3. 每跳结束提示 `lesson_hint`；H6 必须落到「Lesson raw 或显式无新教训」
4. 模型切换只经 switch-dashscope-model 的既有路径，不私改 provider

完整模板：[`../../Code/orchestration/prompts/`](../../Code/orchestration/README.md)。

## 5. 定时任务复用

既有 Cron 简报体系（四类场景）扩展一条：**每周 lessons:scan 摘要**——在治理仓跑 `npm run lessons:scan`，把「升格建议清单」推飞书。人看到清单 → 走终审。这把 4A 的扫描接进了既有推送管道，零新基础设施。

**✅ 已落地并两次实推验证（2026-07-29，bm）**：`weekly-lesson-digest`（id `2e5ff3db-91f4-4fff-a8e5-bd0148b9689a`），每周一 09:00 Asia/Shanghai，agentTurn（thinking off，timeout 600s），announce → feishu 既有简报群，2026-08-03 首跑。消息文本与运维命令见 `Code/orchestration/cron/`。**摘要内容由 `lesson-scan.mjs --format digest` 确定性生成、agent 原样转发**（首推让 agent 自行提取时漏 1/3 条目，二推 3/3，30s）——LLM 摘要不可信，完整性归脚本。踩坑已记 Lesson：`2026-07-29-ps-getcontent-utf8-cron`、`2026-07-29-cron-error-model-snapshot-diag`。

## 6. 机制 A + Cron 本机实测记录（2026-07-29，bm，OpenClaw 2026.7.1-2）

### 6.1 命名 agent 全流程（全部实测通过）

| 步骤 | 命令 | 结果 |
|------|------|------|
| 注册 | `openclaw agents add pm --model deepseek/deepseek-v4-flash --workspace ~\.openclaw\workspace-pm --non-interactive` | 写 openclaw.json（自动 .bak）；建 workspace + sessions |
| persona | 写 workspace `SOUL.md`（角色真源 + 契约锚定 + 边界） | arch 冒烟问「你是谁/deliverable kind」→ 答「Architect / arch-constraints」✅ |
| auth | `<key> \| openclaw models auth --agent <id> paste-api-key --provider deepseek` | profile `deepseek:manual`；**auth 逐 agent 隔离，不继承 gateway env** |
| 唤起 | `openclaw agent --agent pm --message "..."` | ✅（偶发 Gateway 1006 → 自动回退 embedded 完成；编排者默认重试一次） |
| 花名册 | `openclaw agents list` | main + pm/arch/ui/dev/test/sec/ops 共 8 个，全部 flash |

bm 已按本文件 §2 建齐 7 个角色 agent（统一 flash），SOUL.md 已写入各 workspace（内容 = 本仓 `Code/orchestration/prompts/role-session.md` 的角色锚定精简版）。

### 6.2 q004 定案：Cron 注册入口

`openclaw cron add`（CLI 直管 Gateway）。bm 现有 7 条 `brief-*` 实战任务可参考：**agent 消息任务**（`--message` + `--session isolated` + `--channel feishu --to <群>` announce 投递）。任务级可指定 `--agent` / `--model` / `--fallbacks` / `--thinking`。

### 6.3 q005 定案：命令任务的 cwd 与形态

`cron add` 原生支持**命令任务**：`--command-argv '["node","scripts/lesson-digest.mjs"]'` + `--command-cwd 'D:\trae_git\Agents-Skill-Site\Code\code'` + `--command-env KEY=VALUE`。

- **argv 形态免 shell 转义**（`--command` 走 `sh -lc`，Windows 下不建议）
- **`--command-cwd` 直接解决 H2 lesson_hint 的 cwd 坑**，不需要 `cd /d`
- npm 别名（`lessons:digest`）非必需；加它仅为本地手动执行方便
- 另有 `--webhook <url>`（完成时 POST 结果）与 `--on-exit`（看守命令退出事件）可挖掘

### 6.4 weekly-lesson-digest 的落地形态：两种形态代价对比与选型

**发现经过**：试点 H2 的《架构约束》按「推送到指定飞书群」惯性设计了 webhook + 自建脚本；本机实测 `openclaw cron list` 发现 bm 已有 7 条 `brief-*` 定时简报任务（用户既有功能：定时消息收集→飞书），其形态是 **cron agent 消息任务 + announce 投递飞书群**——投递通道早已配好并在生产天天跑。webhook 那套（凭据、HTTP、重试）实为可省的新增复杂度。

**两种形态**：

- **A. cron agent 消息任务**：`cron 到点 → Gateway 起 agent session 喂 message → agent 干活（可跑工具/做判断）→ 最终文本回复 → OpenClaw 渠道系统 announce → 飞书群`
- **B. webhook 脚本**（原 H2 设计）：`cron 到点 → sh 跑 node lesson-digest.mjs → 脚本提取内容、拼 interactive-card JSON → 自己 HTTPS POST 飞书自定义机器人 webhook（凭据存 env）`

**代价对比**：

| 维度 | A. agent 消息任务 | B. webhook 脚本 |
|------|------------------|----------------|
| 投递通道 | **复用 OpenClaw 已配好的 channel**（brief 任务实战证明） | 脚本自建 POST，新 webhook URL 凭据进 env |
| 新增凭据/代码 | **零凭据、零投递代码** | 1 个凭据 + 提取/拼卡/POST/重试/日志全套 |
| 执行主体 | agent（有工具、可判断，如「本周无建议」则不打扰） | 纯脚本，逻辑写死，无 LLM |
| 失败重试 | job 层 + 编排者策略 | 脚本内自实现 |
| 消息样式 | agent 文本（朴素） | interactive card 富卡片（可分区/按钮） |
| 确定性 | 非确定（LLM 在环内，文案每次不同） | 确定性强 |
| 调试 | `openclaw cron run <id>` + session 记录可回放 | 看脚本日志文件 |
| 额外能力 | 可顺势回答追问（群内 @ 它） | 单向推送 |

**最大区别一句话**：投递通道归谁管——A 搭 OpenClaw 已验证的飞书渠道，B 由脚本自建投递。

**选型定案（2026-07-29）**：weekly-lesson-digest 取 **A**——内容本质是给人看的清单文本，不需要卡片交互，省凭据省投递代码收益更大；B 保留为「需要富卡片 / 无 agent 参与」场景的备选（届时凭据走 `LESSON_DIGEST_FEISHU_WEBHOOK` env，脚本设计仍按 H2《架构约束》执行）。

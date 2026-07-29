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
| Cron 定时任务（简报体系） | ✅（bm 已配试验） | 定时简报需求文档 |
| 多命名 agent（pm/arch/dev…）各自独立 persona 与模型绑定 | **待验证** | 部署侧文档未出现；试点首验项 |
| 信封 JSON 的机器校验（schema 拒收） | **待验证**（v1 可由编排 Prompt 软校验） | 四期新增 |

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

### 机制 A：OpenClaw 内部多 agent 转交（目标态，**待验证**）

main 作为编排者，按路由表依次 `agent --agent <role>` 唤起角色 session，信封 YAML 作为 message 传入。待验证项：

- 命名 agent 的注册方式（配置目录 / CLI / 面板）
- per-agent 模型绑定与 persona 注入位置
- session 间上下文隔离边界（信封是否为唯一桥梁）

### 机制 B：每跳 spawn Cursor CLI headless（保底态，✅ 模式已验证）

复用 V5 模式：每跳 = 一次 `invoke-cursor-agent.ps1 -WorkDir <业务仓> -Goal "<角色 Prompt + 信封>"`。角色说明书用 `@` 路径写进 Goal（Cursor 侧共用本机 MCP/rules/模型）。适合 H3（代码产出）及一切需要改文件的跳。

**v1 试点取 B 为主、A 探路**：先把「信封 + 路由表」跑稳，多 agent 注册验证后再切。

## 4. 编排者（main）的软校验 Prompt 要点

v1 无机器 schema 校验时，main 的角色 Prompt 必须包含：

1. 收信封先查必填字段与 `deliverable.path` 存在性，缺则按 R3 拒收
2. 按路由表选下一跳，不跳级（H2 不过不能到 H3）
3. 每跳结束提示 `lesson_hint`；H6 必须落到「Lesson raw 或显式无新教训」
4. 模型切换只经 switch-dashscope-model 的既有路径，不私改 provider

完整模板：[`../../Code/orchestration/prompts/`](../../Code/orchestration/README.md)。

## 5. 定时任务复用

既有 Cron 简报体系（四类场景）扩展一条：**每周 lessons:scan 摘要**——在治理仓跑 `npm run lessons:scan`，把「升格建议清单」推飞书。人看到清单 → 走终审。这把 4A 的扫描接进了既有推送管道，零新基础设施。

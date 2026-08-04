# 本机 OpenClaw 运行时部署（大脑 + 手脚）

> **给谁读**：人，或 Cursor / 其它 AI——请**按本文清单逐步执行**，不要只「把飞书机器人拉进群」就当部署完成。  
> **日期**：2026-07-31  
> **范围**：在新的 Windows / macOS 机器上，安装并接通与 bm 同构的 **OpenClaw 编排运行时**（本地大脑）与 **Cursor Agent 代码跳**（本地手脚）。  
> **本仓边界**：本文是契约与清单；**密钥、飞书 App Secret、真实 Bot 凭证不进 Git**。凭证由人提供或从已核准的私密渠道粘贴。

---

## 0. 一句话模型

| 隐喻 | 实际是什么 | 只加群够不够 |
|------|------------|:------------:|
| **话筒** | 飞书群 + 机器人应用 | 加群只接通话筒 |
| **大脑** | 本机 OpenClaw Gateway + 命名 agent + SOUL + DeepSeek | ❌ 必须本机装 |
| **说明书门面** | 公网 `agents-skill-remote` MCP（只读） | ❌ 须挂到本机 OpenClaw |
| **手脚（H3）** | 本机 Cursor Agent CLI + 业务仓工作区 | ❌ 代码跳才要 |

**错误理解**：新电脑 clone 本仓 → 群里加同一个机器人 → 自动能编排。  
**正确理解**：每台要跑编排的机器 = **独立 OpenClaw 实例**（通常对应**自己的**飞书 Bot，或明确共享策略）；群聊只是渠道。

现网对照：`bm`（Windows 编排机）与 `Home`（家里机）是**双 Bot / 双运行时**，不是一个 Bot 驱动所有机器。

---

## 1. AI 执行约定（读完再动手）

1. **先读完 §0～§2**，再按 §3 顺序执行；缺密钥就**停下来问人**，禁止编造 Token。  
2. **禁止**把 App Secret / API Key / MCP_TOKEN 写入本仓任何已跟踪文件或 commit。  
3. Windows 路径与 macOS 路径不同：所有 `D:\trae_git\...` 类硬编码在新机器上必须改成**本机绝对路径**。  
4. 分支：日常集成跟 [`Doc/git/branching.md`](../git/branching.md)——开发用 `develop`；ECS 发行跟 `main`。本机大脑跟哪条分支由人指定（默认建议 `develop` 跟编排契约，站点/MCP 公网仍以已部署的 `main` 为准）。  
5. 排障优先：[`openclaw-ops`](../../Code/code/docs/zh/skills/custom/common/openclaw-ops/index.md)（`openclaw health` / `doctor` / 插件五层门禁）。

---

## 2. 前置条件（人准备）

| # | 项 | 说明 |
|---|----|------|
| P1 | Node.js LTS | 建议与现网一致的大版本；原生模块（若业务仓有）注意 ABI |
| P2 | Git | 能 clone 本仓 + 业务仓（如 `MechAssist-Fusion`） |
| P3 | OpenClaw CLI | 按官方安装；`openclaw` 在 PATH 中 |
| P4 | DeepSeek API Key | 注入各角色 agent；不进 Git |
| P5 | 飞书企业自建应用 | **本机 Bot**：App ID / App Secret / 事件订阅指向**本机 Gateway**；与 bm Bot 一般不共用 |
| P6 | 公网 MCP | `agents-skill-remote` URL + Bearer `MCP_TOKEN`（与 ECS 部署一致） |
| P7 | （可选）Cursor Agent CLI | 仅当本机要跑 **H3 代码跳** |
| P8 | （可选）业务仓 | H3 写码目标仓；路径写入 run-dir / invoke 脚本 |

---

## 3. 部署步骤（按序）

### 3.1 Clone 本仓

```bash
git clone https://github.com/ZhangHalfGod/Agents-Skill-Site.git
cd Agents-Skill-Site
git fetch origin
git checkout develop   # 或人指定的分支
git pull
```

网站本地预览（**不是**大脑；可选）：见根 README「快速开始」→ `Code/code` 下 `npm ci && npm run dev`。

### 3.2 安装并确认 OpenClaw

```bash
openclaw --version
openclaw doctor
```

按 OpenClaw 文档完成首次初始化，使存在 `~/.openclaw/`（Windows：`%USERPROFILE%\.openclaw\`）。

### 3.3 接通飞书渠道（话筒 → 本机大脑）

1. 在飞书开放平台配置**本机对应**的应用事件 / 长连接，使消息打到**本机** Gateway（勿误配到 bm）。  
2. 凭证写入 OpenClaw 认可的本地配置或 `~/.openclaw/.env`（**勿提交**）。  
3. 将机器人拉进目标群——这是**最后一步渠道动作**，不是唯一步骤。  
4. 群聊发一条探活，确认本机 Gateway 收到并回复。

细则与插件门禁见 openclaw-ops；飞书云文档 folder_token 等运行约定见线上 `SOUL.md` / 仓内草稿，**勿把 token 抄进公共文档正文以外的新文件**（已有约定处沿用即可）。

### 3.4 建角色花名册（大脑皮层）

Windows（推荐直接跑）：

```powershell
cd <repo>\Code\orchestration\openclaw
$env:DEEPSEEK_API_KEY = 'sk-...'   # 仅当前会话；勿写入文件
.\setup-agents.ps1
# 可选：强制重写角色 SOUL
# .\setup-agents.ps1 -UpdatePersona
```

macOS / Linux：脚本为 PowerShell；可用 `pwsh` 执行同一脚本，或按 [`agents.example.yaml`](../../Code/orchestration/openclaw/agents.example.yaml) 手工 `openclaw agents add` 并对齐模型：

| agentId | 模型 |
|---------|------|
| `pm` / `arch` | `deepseek/deepseek-v4-pro` |
| `ui` / `dev` / `test` / `sec` / `ops` | `deepseek/deepseek-v4-flash` |

未设 `DEEPSEEK_API_KEY` 时按脚本末尾提示手动注 key。

### 3.5 挂接说明书 MCP（唯一门面）

契约：[`Doc/phase4/04-tool-registration.md`](../phase4/04-tool-registration.md) · SF-HS：[`06-single-facade-hop-snapshot.md`](../phase4/06-single-facade-hop-snapshot.md)

```bash
# Token 只放本地 env / --header
openclaw mcp add agents-skill-remote \
  --transport streamable-http \
  --url "http://<PUBLIC_HOST>/agents-skill-mcp/mcp" \
  --header "Authorization=Bearer <MCP_TOKEN>"

openclaw mcp probe
openclaw mcp list
```

期望：工具约 **10** 个（含 `get_source_text`）。health 绿 ≠ 流水线已验收。

### 3.6 编排者 SOUL / workspace（流水线人格）

**整份 workspace 快照（推荐新机器）**：[`Code/orchestration/openclaw/workspace-snapshot/`](../../Code/orchestration/openclaw/workspace-snapshot/README.md)  
内含 bm 脱敏后的 `SOUL.md`、`AGENTS.md`、`TOOLS.md`、`skills/*` 等。拷到本机 `~/.openclaw/workspace/` 后：替换 `REPLACE_WITH_FEISHU_FOLDER_TOKEN`、改绝对路径。

**仅补流水线段（已有人格时）**：

1. 打开仓内草稿：[`Code/orchestration/prompts/orchestrator-main-soul.draft.md`](../../Code/orchestration/prompts/orchestrator-main-soul.draft.md)  
2. **追加**到本机 `~/.openclaw/workspace/SOUL.md`，不要无脑覆盖日常人格段。草稿升版须同步线上 SOUL——见 [`Doc/phase4/09-feishu-promote-pipeline.md`](../phase4/09-feishu-promote-pipeline.md)。  
3. **全文替换** Windows 绝对路径为本机路径。  
4. 改完后可在 bm 跑 `workspace-snapshot/sync-from-live.cjs --machine bm` 回写仓内快照（会脱敏 folder_token）。

### 3.7 Gateway 常驻

```bash
# 建议服务化（Windows: schtasks；macOS: launchd）
openclaw gateway install
openclaw gateway status
openclaw health
```

未服务化时可用 `openclaw gateway run --force`；Windows 上勿依赖未服务化的 `gateway restart`（见 openclaw-ops 已知坑）。

### 3.8 手脚：Cursor H3（可选但推荐在「写码机」上做）

1. 安装并登录 Cursor Agent CLI（以官方为准）。  
2. Clone 业务仓；确认 `invoke-cursor-agent`（或等价包装）路径写进 SOUL / run-dir 脚本。  
3. 冒烟：对空 Goal 或已知小改动跑一次 invoke，确认 stdout/落盘非空。  
4. 记住 Lesson：agent 内 Node 与系统 Node 可能 ABI 不一致——H4 用**系统 node** 复验（见 operations lessons）。

### 3.9 run-dir / 业务路径

- 预设卡：[`Doc/phase4/07-run-dir-m0-card.md`](../phase4/07-run-dir-m0-card.md)  
- 本机改 [`Code/orchestration/openclaw/run-dir-presets.yaml`](../../Code/orchestration/openclaw/run-dir-presets.yaml) 中的绝对路径（或仅用飞书 `run_dir=` 自定义）。  
- 成本台账字段（后续）：[`Doc/phase4/08-cost-ledger-schema.md`](../phase4/08-cost-ledger-schema.md)

---

## 4. 验收清单（全部勾上才算「本机大脑就绪」）

- [ ] `openclaw health` / `doctor` 无阻塞级错误  
- [ ] `openclaw agents list` 含 pm/arch/ui/dev/test/sec/ops，模型与 §3.4 表一致  
- [ ] `openclaw mcp probe` 见 `agents-skill-remote`，含 `get_source_text`  
- [ ] 飞书群消息能打到**本机** Gateway 并回复（不是误打到 bm）  
- [ ] main `SOUL.md` 已含流水线段，且路径已改成本机  
- [ ] （若启用 H3）Cursor invoke 能在业务仓落盘  
- [ ] 最小文档跳：能 `invoke-openclaw-agent` 出 raw / 或已知「stdout 空但 run-dir 有文件」时按 Lesson 重建信封  

---

## 5. 与「只加群」对照

| 动作 | 结果 |
|------|------|
| 只把**已有 bm Bot**拉进新群 | 新群能指挥 **bm 那台机器**，不能让新电脑执行 |
| 在新电脑完成 §3 | 新电脑成为独立大脑；应用**自己的** Bot 进群后，指挥的是新电脑 |
| 两台同时在线、两个 Bot 同群 | 必须靠 @ / 路由约定分清目标机，避免双回复 |

---

## 6. 相关入口

| 文档 | 用途 |
|------|------|
| [`Doc/phase4/00-context.md`](../phase4/00-context.md) | 四期上下文：运行时不在网站内 |
| [`Doc/phase4/03-openclaw-route-table.md`](../phase4/03-openclaw-route-table.md) | 路由与模型分层 |
| [`Doc/phase4/04-tool-registration.md`](../phase4/04-tool-registration.md) | MCP 挂接 |
| [`Code/orchestration/README.md`](../../Code/orchestration/README.md) | 样例与 setup-agents |
| [`Code/code/deploy/README.md`](../../Code/code/deploy/README.md) | **服务器**静态站（不是本机大脑） |
| [`Code/mcp-remote/deploy/README.md`](../../Code/mcp-remote/deploy/README.md) | **服务器** MCP |
| 外部仓 `MechAssist-Fusion/doc/remote-agent-openclaw/` | 部署侧更细的飞书/渠道笔记（若可访问） |

---

## 7. 对 AI 的结束语

部署完成后，用一句话向用户汇报：`health`、agent 数量、mcp 工具数、飞书探活是否成功、SOUL 路径是否已改写、H3 是否启用。缺哪一项就列出**待人提供的密钥/Bot 配置**，不要假装完成。

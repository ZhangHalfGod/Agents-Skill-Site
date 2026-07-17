# SYSTEM-DIRECTION — 系统级行进方向约束（持续更新）

**Language / 语言:** [English summary](en/SYSTEM-DIRECTION.md) | [中文](SYSTEM-DIRECTION.md)

> **文档级别**：系统级（S0），高于 `00`～`05` 工程文档。  
> **效力**：本文件与下级文档冲突时，**以本文件为准**；下级文档应随后修订对齐。  
> **性质**：活文档（Living Doc）——每次重大决策、范围膨胀冲动、技术选型争议时必须回读并更新「决策日志」。  
> **当前版本**：v0.4｜**最近更新**：2026-07-16

---

## 0. 使用方式（强制）

| 时机 | 动作 |
|------|------|
| 启动任一新阶段（建站、加 MCP、接 domains…） | 先读本文件 §1～§3，确认未越界 |
| 想加「看起来很酷」的功能 | 先过 §3 硬约束与 §4 反模式；通不过则记录到决策日志并拒绝或降级 |
| 与市面方案（纯 MCP / OpenClaw / 短 Agent）对比纠结时 | 读 §2 分层模型，禁止用执行层替代治理层 |
| 变更本文件条款 | 走 §7 修订 SOP；更新版本号与决策日志；同步改 `CHANGELOG.md` |

**一句话**：本文件约束「往哪走、不能往哪走」；`04-progress-plan` 约束「何时走哪一步」；本仓 `Code/code/docs/zh/**`（中文全文）约束「资产长什么样」（英文 stub 在 `docs/**` root）。

---

## 1. 北极星（North Star）

把本仓 `Code/code/docs/**` 中的 agents · skills · rules · operations 升级为：

**可浏览、可检索、可按角色说明书触发、可按 Lesson 成长迭代的治理资产运行面**；

同时明确：

- **磁盘 Markdown 永远是 Source of Truth**（**就地**维护于本仓 `docs/**`；直接编辑，勿依赖外仓 sync）  
- **网站 = 发现与索引层**（呈现 + 标签跳转 + 运行指引；`npm run generate` 只刷 manifest/侧栏）  
- **Cursor / MCP = 执行层**（读说明书、调工具、改代码）  
- **两者组合，禁止互相替代**

成功不是「网页里跑出 Agent」，而是「任何人都能稳定找到该用哪个角色、哪份技能、哪条规则，并在 IDE 里正确触发」。

---

## 2. 分层模型（不可混淆）

```text
┌─────────────────────────────────────────────────────────┐
│  治理资产 SoT（本仓 Code/code/docs/**）                    │
│  agents / skills / rules / operations（Lesson）           │
└───────────────────────────┬─────────────────────────────┘
                            │ generate → manifest / 侧栏
┌───────────────────────────▼─────────────────────────────┐
│  发现层（本仓）                                            │
│  网站浏览 + URI 索引 + MCP 只读查询                         │
└───────────────────────────┬─────────────────────────────┘
                            │ 同一份 manifest / 矩阵
┌───────────────────────────▼─────────────────────────────┐
│  执行层（不在网站内实现推理）                               │
│  Cursor @文件 / 编号协议 /（可选）MCP tools               │
│  载体：IDE、脚本、外部运行时                                │
└─────────────────────────────────────────────────────────┘
```

| 层 | 允许做 | 禁止做 |
|----|--------|--------|
| 发现层（本仓） | 浏览、检索、URI 注册、标签映射、复制触发句、校验死链 | 模型推理、自动改业务代码、伪装成 Cursor Rules 注入 |
| 执行层 | 读说明书、调 MCP、生成/修改代码、跑测试 | 把组织知识只存在 tool 描述里、无文档可追溯 |

市面常见「短 Agent 描述 + MCP 干活」只覆盖执行层；本项目补的是发现/索引层，正文就在本仓 docs。**砍掉发现层、只留 MCP = 方向性失败。**

---

## 3. 硬约束（Must / Must Not）

### 3.1 Must（必须）

1. **Source of Truth**：角色/技能/规则/Lesson 正文维护在本仓 `Code/code/docs/**`；`npm run generate` 只生成 manifest/侧栏/目录索引，**不**从外仓覆盖正文。  
2. **外层分区稳定**：站点最外层固定 `agents` / `skills` / `rules`；`domains` / `operations` 后置灰度。  
3. **URI 先注册**：新页面路径必须先写入 `03-uri-registry.md`，再实现路由。  
4. **绑定用 ID 不用 URL**：Agent↔Skill 以技能目录 ID + `05-agent-skill-matrix.md`（及未来 manifest）为准。  
5. **链接由索引生成**：站点上的 `http(s)://…/agents/…` 由构建/配置生成，**禁止**写进 `standard/<Role>/*.md` 模板。  
6. **先 common 后 domains**：未完成标准八角色 + skills 1～11 + rules L0/L1/L2 打通前，不把 domains 当主路径。  
7. **阶段门禁**：`04-progress-plan` 阶段 0 评审通过前，不创建网站工程代码目录。  
8. **中文与安全**：对齐 L0（中文输出；禁止硬编码密钥；禁止后门与绕过鉴权）。  
9. **模板与实例分离**：项目实例进 `operations/`，不回写污染 `common/`。  
10. **可回退**：任何灰度（domains、MCP 门面）必须可开关关闭且不影响 common 浏览。

### 3.2 Must Not（禁止）

1. **禁止**在 `Architect.md` 等角色文档中写死 `http://ip/agents/...` 部署地址。  
2. **禁止**把网站做成「真 Agent 运行时 / 聊天执行引擎」。  
3. **禁止**用「直接上 MCP」替代文档站与矩阵（MCP 只能作为同一 SoT 的第二门面）。  
4. **禁止**跳过 URI 注册与矩阵，在前端手写散落路径。  
5. **禁止**为追市面热点一次性大重构目录（小步回灌，禁止大爆炸）。  
6. **禁止**让领域规则覆盖 L0 硬约束。  
7. **禁止**无决策日志的静默改方向（改北极星或硬约束必须留痕）。

---

## 4. 反模式清单（看到即停）

| 反模式 | 为何危险 | 正确替代 |
|--------|----------|----------|
| 角色 md 里贴生产 URL | 模板与部署耦合、换环境全挂 | manifest / 站点配置生成链接 |
| 「别做网站了，MCP 就行」 | 发现与审计能力丢失 | 网站治理 + MCP 可选执行门面 |
| 网页内嵌大模型改代码 | 范围爆炸、安全与追溯失控 | 复制 `@` 触发句到 Cursor |
| 先做 operations 浏览器 | 实例淹没模板，优先级颠倒 | 先 common MVP |
| 三处手写同一映射 | 必然漂移 | 只维护矩阵 → 生成 manifest → 多门面消费 |
| 技能别名不统一就上线 | 标签死链 | 别名表 + 校验门禁阻断发布 |

---

## 5. 行进优先级（当前有效）

> 变更本表须写入 §8 决策日志。

| 优先级 | 方向 | 状态 |
|:------:|------|:----:|
| P0 | All_URI 文档完备 + 方向约束（本文件） | **完成** |
| P0 | 阶段 0 评审通过 | **完成**（2026-07-10 确认启动阶段 1） |
| P1 | 网站脚手架 + Agents 八角色 + 标签跳转 | **基本完成**（技能正文阶段 3） |
| P1 | Skills 1～11 + Rules L0/L1/L2 打通、零死链 | **基本完成** |
| P2 | scan → validate → manifest 门禁 | **完成（已验收）** |
| P2 | 「运行指引」（复制 Cursor 触发句） | **完成** |
| P3 | Domains 灰度（建议先 ptp-nmos） | **完成**（ptp-nmos） |
| P3 | 可选：MCP 暴露同一 manifest（list/get/validate） | **MVP 已实现**（待 Cursor 接通勾选） |
| 明确不做 | 网站内模型推理、多租户账号、替代 Cursor | 永久非目标* |

\* 若未来要做执行引擎，必须**独立项目**，不得塞进本治理站；并先修订本文件北极星。

---

## 6. 与下级文档的关系

| 文档 | 职责 | 相对本文件 |
|------|------|------------|
| [phase1/00-context.md](phase1/00-context.md) | 背景与目标叙述 | 服从本文件硬约束 |
| [phase1/01-requirements.md](phase1/01-requirements.md) | 需求与验收 | 新增需求不得违反 §3 |
| [phase1/02-architecture.md](phase1/02-architecture.md) | 架构叙述（早期） | 服从本文件；**技术栈以 ADR-001 为准** |
| [phase1/03-uri-registry.md](phase1/03-uri-registry.md) | URI 注册 | 本文件强制「先注册后实现」 |
| [phase1/04-progress-plan.md](phase1/04-progress-plan.md) | 进度与里程碑 | 节奏可调；方向不可违背本文件 |
| [phase1/05-agent-skill-matrix.md](phase1/05-agent-skill-matrix.md) | 角色-技能权威映射 | 绑定关系的治理真源之一 |
| [phase2/00-cursor-mcp.md](phase2/00-cursor-mcp.md) | 二期 Cursor + MCP | 服从 §2 分层；MCP 不替网站 |
| [`../Code/doc/phase1/ADR-001-architecture-and-stack.md`](../Code/doc/phase1/ADR-001-architecture-and-stack.md) | **技术栈与部署冻结** | 实现层宪法；换栈须新 ADR + §8 |

**冲突裁决顺序**：`SYSTEM-DIRECTION` → **ADR-001** → L0 rules → 本目录 `01/02/03/05` → `04` 进度弹性调整。

---

## 7. 修订 SOP（持续更新机制）

### 7.1 何时必须更新本文件

- 增加/删除「永久非目标」  
- 调整 P0～P3 优先级或插入新主路径  
- 决定引入 MCP 门面、执行引擎、公网部署等  
- 发现硬约束无法执行（要改约束本身，而不是偷偷绕过）  
- 阶段门禁策略变更（例如允许提前建仓）

### 7.2 修订步骤

1. 在 §8 追加决策条目（日期、背景、选项、结论、影响文档）。  
2. 修改 §1～§5 对应条款；**版本号 +0.1**（破坏性转向则 +1.0）。  
3. 更新文首「最近更新」日期。  
4. 同步 `CHANGELOG.md` 一行摘要。  
5. 若影响 URI/矩阵/需求，打开对应 `03/05/01` 做对齐修订。  

### 7.3 版本语义

| 变更类型 | 版本 |
|----------|------|
| 措辞澄清、日志追加、无行为变化 | +0.0.1 或仅改日期（可记 patch） |
| 新增约束、调整优先级、增补反模式 | **+0.1** |
| 北极星或分层模型转向 | **+1.0**（需显式确认） |

---

## 8. 决策日志（只追加，不删改历史结论）

> 历史条目保持原样；若结论被推翻，新增条目并写明「废止/取代：YYYY-MM-DD-xx」。

### 2026-07-16-01｜本仓 docs 就地为 SoT（废止双仓日常 sync）

- **背景**：外仓 `standards/` + `STANDARDS_ROOT` sync 与三期成长性迭代摩擦；本仓亦不自带 standards。  
- **选项**：A) 维持双仓；B) 本仓 `docs/**` 就地真源 + generate 只刷索引；C) submodule/旁路仍双源。  
- **结论**：**选 B**（不执行「导出到 standards 布局」可选步骤）。  
- **约束落地**：§1 北极星、§2 分层、§3.1-1；`npm run generate`；`docs/operations/` Lesson。  
- **废止/取代**：日常「改外仓 → sync 覆盖本仓 docs」流程（历史条目中「独立仓 SoT」表述以本条为准）。  
- **影响**：README / phase3 `00-context` / ADR-001 / `sync-standards.mjs`。

### 2026-07-10-01｜确立治理站方向与分层

- **背景**：建设 agents/skills/rules 网站；纠结是否在角色 md 写网站 URL，以及是否不必做站、直接 MCP。  
- **选项**：A) 角色文档写死 URL；B) 只用 MCP；C) 文档站治理 + 矩阵生成链接 + 执行留在 Cursor/可选 MCP。  
- **结论**：**选 C**。  
- **约束落地**：§2 分层、§3.1-4/5、§3.2-1/2/3、§4 反模式表。  
- **影响**：`02-architecture`、`05-agent-skill-matrix` 继续有效；阶段 1 建站不改为「纯 MCP 项目」。

### 2026-07-10-02｜创建本系统级活文档

- **背景**：需要可持续更新的系统级文档约束行进方向，避免后续阶段漂移。  
- **结论**：新增 `SYSTEM-DIRECTION.md` 为 S0；下级文档冲突时以其为准。  
- **影响**：`README.md` 将本文件置顶；后续重大决策只追加 §8。

### 2026-07-10-03｜阶段 0 完成并启动阶段 1；工程落点改为 Code/

- **背景**：文档已齐；本人确认开始实现；提供阿里云 Ubuntu 22.04 + PM2 + Node 基线；已有 `mechassist-api`/`mcp-faq`/`mcp-gaode`。  
- **结论**：阶段 0 出门；阶段 1 开始。网站工程目录定为 `All_URI/Code/code/`，开发跟踪在 `All_URI/Code/doc/`（废止早期「`Agents_Skill/site/`」占位表述）。  
- **约束**：部署 URL/端口只进 `Code/doc`，不写 `standards` 角色 md；新站 PM2 进程与现有应用隔离。  
- **影响**：`Doc/CHANGELOG` v0.3；`04-progress-plan` 阶段状态更新；待服务器清单补全后再锁端口与初始化脚手架。

### 2026-07-10-04｜冻结技术栈与部署架构（ADR-001）；GitHub 仓已建

- **背景**：仓库 `ZhangHalfGod/Agents-Skill-Site` 已 push；需明确「系统架构 + 技术栈」以约束后续开发；此前仅有推荐未锁定。  
- **选项**：A VitePress / B Astro / C Express 静态。  
- **结论**：**锁定 A. VitePress**；部署锁定 `base=/agents-skill/`、`127.0.0.1:3010`（若用 serve）、公网 `http://8.163.18.183/agents-skill/`、目录 `/var/www/agents-skill-site`、PM2 名 `agents-skill-site`。  
- **约束落地**：新增 `Code/doc/ADR-001-architecture-and-stack.md`；后续换栈须新 ADR + 本日志。  
- **影响**：阶段 1.1 完成；可开始 `Code/code/` 脚手架初始化。

### 2026-07-11-03｜远程 Manifest：他人本机 MCP 读公网静态索引

- **背景**：Cursor 配置不应依赖本机仓库 docs；他人需共用同一份线上 agents 目录。  
- **结论**：支持 `MANIFEST_URL`；推荐指向 `http://8.163.18.183/agents-skill/manifest.json`；stdio 仍在各人本机，**不**在 ECS 暴露 MCP 端口。  
- **影响**：`02-remote-manifest.md`；共享配置 `cursor-mcp.shared.json.example`。

### 2026-07-11-02｜二期 MCP Server 实现计划通过并落地

- **背景**：按「先计划后改代码」推进 Cursor + MCP。  
- **结论**：新增 `Doc/phase2/01-mcp-server-plan.md`；实现 `mcp/server.mjs`（stdio、只读 8 tools）+ 扩展 `catalog-api.mjs`；Cursor 样例入库。  
- **约束**：只读 manifest；stderr 日志；不绑公网。  
- **影响**：`Code/code` 增加 `@modelcontextprotocol/sdk` 依赖；P3 MCP 进入可接通状态。

### 2026-07-11-01｜阶段 7 验收通过；启动二期 Cursor+MCP 规划

- **背景**：公网已含 Domains/运行指引；需一期关门并规划 MCP。  
- **结论**：阶段 7 完成（验收报告 + 死链 0）；operations 公网挂载延后二期；新增 `Doc/phase2/00-cursor-mcp.md`，MCP 只读同源 manifest，不替代网站。  
- **影响**：CHANGELOG v1.2；P3 MCP 项改为规划中；文档按 `phase1/` / `phase2/` 分目录；下一步实现 stdio MCP Server。

### 2026-07-10-06｜1.5/4 验收通过；阶段 5+6 落地

- **背景**：公网 Health OK；需 Domains 灰度与运行指引。  
- **结论**：正式验收 1.5 与 4；落地 `/domains`（ptp-nmos 灰度 + 开关）与 `RunGuide`/`QuickJump`。  
- **影响**：CHANGELOG v1.1；`site.config.json`；阶段 7 待联调复盘。

### 2026-07-10-05｜阶段 1.5 上线完成；阶段 4 门禁落地

- **背景**：ECS 公网已可访问 `/agents-skill/`；需 scan/validate 阻断错误发布。  
- **结论**：1.5 完成（形态 α）；新增 `validate-manifest.mjs`，`prebuild` = sync + validate；静态 `/health/` + `08-release-checklist.md`。  
- **影响**：`04-progress-plan` 阶段 1/4 完成；CHANGELOG v1.0；P2 门禁项完成。

---

## 9. 当前阶段检查清单（每次开工勾选）

- [ ] 已阅读本文件 §1～§3（本次会话/本周至少一次）  
- [ ] 本次任务未违反 §3.2  
- [ ] 若新增页面：已更新或计划更新 `03-uri-registry.md`  
- [ ] 若改角色-技能关系：已更新或计划更新 `05-agent-skill-matrix.md`  
- [ ] 若改方向/优先级：已追加 §8 决策日志  
- [ ] 未在 `docs/agents/**` 角色正文写入部署 URL  

---

## 10. 一句话纪律

**索引生成链接，模板不写 IP；治理与执行分家，MCP 补手不替脑；先注册再实现，先 common 再 domains；改方向必留日志。**

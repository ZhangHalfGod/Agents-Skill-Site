# 00 — 背景与目标

> **方向约束**：行进方向以 [`SYSTEM-DIRECTION.md`](SYSTEM-DIRECTION.md)（S0）为准；本文负责背景叙述，冲突时服从 S0。

## 1. 背景

本仓 `Code/code/docs/**` 承载可复制的治理包：

- `agents`：角色分工与协作边界（谁负责什么）
- `skills`：可复用做法与步骤模板（怎么做更稳）
- `rules`：硬约束与门禁（必须做 / 不能做）
- `domains`：领域增强（mcp / ai-dialog / ptp-nmos / high-concurrency）
- `operations`：项目 Lesson 实例，避免污染可复用正文

使用方式曾偏「IDE 内 `@` 文件 + 对话触发」，存在：

1. **触发不稳定**：同一任务在不同上下文下，技能/角色触发路径不一致  
2. **知识分散**：经验在聊天、笔记、临时文档中，难快速检索  
3. **边界混淆**：该写在 agents / skills / rules 哪一层不清晰  
4. **升级成本高**：目录、索引、说明书路径需同步维护  

本项目要做的是：**发现站 + MCP 索引 + 就地正文**；改 `docs/**` 后 `npm run generate` 刷新索引。

## 2. 输入参考（已阅读）

| 来源 | 可迁移点 |
|------|----------|
| `standards/README.md` | agents/skills/rules 分层；模板与实例分离；编号索引协议 |
| `self-implement-plan/00-plan.md` | 分阶段验收、传输/业务解耦思维、磁盘为 source of truth |
| `09-lut-lessons-transfer.md` | Web 回调不阻塞；轮询即可；HTTP 作 RPC 通道；进度可观测 |

## 3. 目标

1. **外层目录清晰**：站点最外层固定为 `agents` / `skills` / `rules`（及可选 `domains` / `operations`）  
2. **Agents 页可运行**：每个岗位角色展示技能标签、角色文档、相关技能说明书链接  
3. **角色对齐标准包**：人物与说明书锚定 `standards/common/agents/standard/` 下现有角色  
4. **URI 可注册、可追溯**：所有页面路径在 `All_URI` 注册，避免路径漂移  
5. **先文档后工程**：本阶段只交付工程文档与进度表，不创建网站代码仓库  

## 4. 非目标（本阶段明确不做）

- 不替代 Cursor / Claude 的实际 Agent 运行时（网站不做模型推理）  
- 不把 `operations` 需求实例写回 `common` 模板  
- 不做复杂账号体系与多租户  
- 不一次性覆盖所有领域域的深度交互（先 common/standard，再 domains）  

## 5. 成功判据（文档阶段）

- [x] `All_URI` 下具备完整工程文档入口  
- [ ] 评审通过：URI 注册表与角色-技能矩阵无遗漏标准角色  
- [ ] 评审通过：进度计划阶段划分可执行、验收可勾选  
- [ ] 明确下一阶段「创建网站工程」的启动条件  

## 6. 设计原则（从控制面经验迁移）

| 原则 | 在本站的含义 |
|------|----------------|
| 磁盘是 source of truth | Markdown 在本仓 `docs/**`；generate 刷索引；网站渲染同一树 |
| HTTP 是 RPC 通道 | 站点 API 只做目录/检索/元数据，不做重业务阻塞 |
| 主循环 + 状态机思维 | 内容同步用「扫描 → 校验 → 发布」状态机，而非手工改路径 |
| 通道与职责隔离 | agents / skills / rules 三通道互不覆盖；冲突以 rules 高优先级为准 |
| 先基线再灰度 | 先 common/standard 上线，再灰度 domains |

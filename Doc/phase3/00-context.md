# 00 — 第三期交接上下文（新对话必读）

> **文档级别**：三期交接（服从 S0）  
> **日期**：2026-07-14  
> **用途**：在本目录新开 Cursor 对话时，**先读本文件**，再读执行计划。  
> **上级**：[`README.md`](README.md) · S0 [`../SYSTEM-DIRECTION.md`](../SYSTEM-DIRECTION.md)

---

## 1. 本机路径与仓库身份（勿混淆）

| 本地路径 | GitHub | 角色 |
|----------|--------|------|
| **`/Users/zhanghalfgod/Public/Work/Agents-Skill-Site`**（本仓） | [`ZhangHalfGod/Agents-Skill-Site`](https://github.com/ZhangHalfGod/Agents-Skill-Site) | **发现站 + MCP + 工程文档**；公网 ECS 部署来源 |
| **`/Users/zhanghalfgod/Public/Work/agents-skill-standards`** | [`ZhangHalfGod/agents-skill-standards`](https://github.com/ZhangHalfGod/agents-skill-standards) | **治理资产 SoT**（`standards/`：agents · skills · rules · domains · **operations**） |
| `/Users/zhanghalfgod/Public/Work/MacAirM4/Agents-Skill-Site` | `MacAirM4/Agents-Skill-Site` | **个人 fork**；MacAir 私人开发；`upstream` → 本仓 |
| （尚未独立落盘/部署）BMWork | 公司层 fork（计划） | **组织变体**；公司 ECS 另部署 |

### 1.1 两仓关系（必读）

```text
agents-skill-standards          Agents-Skill-Site
  standards/**  ──npm run sync──►  Code/code/docs/**（只读派生）
  （Git 写回 SoT）                 manifest / 网站 / MCP 只读索引
```

| 改什么 | 去哪个仓 | 备注 |
|--------|----------|------|
| Agent / Skill / Rule / Lesson（operations） | **agents-skill-standards** | 磁盘 Markdown = SoT；单独 commit / push |
| 站点、MCP、Doc/phase*、URI 注册 | **Agents-Skill-Site**（本仓） | sync 时设 `STANDARDS_ROOT` 指向 standards 仓的 `standards/` |
| 本机默认同步探测 | — | `Code/code/scripts/sync-standards.mjs` 的 `ALT_STANDARDS` = `../../../agents-skill-standards/standards` |

三期**第一闭环**约定：先在本机把「Lesson → Skill 回灌」跑通；个人迭代可在 MacAir fork 试，通用沉淀再回灌上游。BMWork 部署后用独立 MCP，不与私人 fork 共用同一 manifest。

---

## 2. 一二期已完成什么

| 期 | 状态 | 要点 |
|----|:----:|------|
| **一期** | ✅ 验收 | VitePress 站、`manifest`、validate/health、domains 灰度（ptp-nmos）、运行指引 |
| **二期** | ✅ MVP | MCP 只读同源索引；stdio + **远程 HTTP MCP**（Nginx + Bearer Token） |

**公网（已部署）**

- 网站：`http://8.163.18.183/agents-skill/`
- MCP：`http://8.163.18.183/agents-skill-mcp/mcp`（需 Token）
- 探活：`http://8.163.18.183/agents-skill-mcp/healthz`

**Cursor 配远程 MCP（摘要）**

```json
"agents-skill-remote": {
  "url": "http://8.163.18.183/agents-skill-mcp/mcp",
  "headers": { "Authorization": "Bearer <TOKEN>" }
}
```

手册：`Code/mcp-remote/CURSOR-SETUP.md` · 零克隆：`Doc/phase2/04-zero-clone-share.md`

**2026-07-14 实测（agents-skill-remote）**

- `health`：`ok: true`；`dataSource` 指向 ECS 上 `manifest.json`
- 计数约：**8 agents / 11 skills / 10 rules**
- `list_*` / `get_*` 返回**索引元数据**（id、source、绑定），**不**把整份说明书塞进 tool 结果

---

## 3. 用户要解决的问题（三期动机）

二期已能让 Agent「查目录、组团队协作」。还缺：

1. **可迭代变量**：按项目 / 环境选择不同 catalog（上游 / MacAir / BMWork），并随项目完成回灌 agents · skills · rules。  
2. **迭代占比**：Skill 大头 → Agent 其次 → Rules 最少。  
3. **进行中有意识记录**：不能靠事后回忆；要有 Lesson Card + 门禁挂钩。  
4. **上下文膨胀**：不能靠「整库 @」；要分层按需加载（索引 → 卡片 → 正文），压缩只用于对话/草稿，不替代 SoT。

---

## 4. 三期一句话目标

> 在**不破坏**「磁盘 Markdown = SoT、MCP 只读、治理≠执行」的前提下，打通：  
> **项目中记 Lesson → 收尾蒸馏进 Skill（主）→ 偶调 Agent 绑定 → 极少升 Rule**；  
> 并用 **Catalog Profile + operations 实例层** 表达「变量」。

---

## 5. 硬约束（继承 S0，三期不可破）

- Source of Truth 仍是 `standards/`（及未来 `operations/` 实例）；MCP / 网站只读派生。  
- **禁止** MCP 写回 standards；写回永远走 Git。  
- **禁止**把项目实例直接污染 `common/`；先入 `operations/<project>/`，蒸馏后再升格。  
- **禁止**用「大模型总结」替代可追溯的 Markdown 回灌。  
- L0 极少改；领域/场景优先 L2；Skill 正文保持可执行、宜短。

---

## 6. 新对话建议开场动作

1. 读本文件 + [`02-execution-plan.md`](02-execution-plan.md)  
2. 确认当前工作区是上游还是 MacAir fork（看 `git remote -v`）；改 SoT 时确认打开的是 **agents-skill-standards**  
3. 若改资产：先改 standards 仓 → 本仓 `npm run sync` / validate；部署另议  
4. 默认**先落地 A～B**（operations + Lesson Card + Skill 分层约定），再谈 MCP `profile` / `list_lessons`

---

## 7. 相关文档索引

| 文件 | 用途 |
|------|------|
| [01-goals-and-scope.md](01-goals-and-scope.md) | 目标、范围、多 fork 拓扑、迭代占比 |
| [02-execution-plan.md](02-execution-plan.md) | 分步执行与验收 |
| [03-lesson-card-and-operations.md](03-lesson-card-and-operations.md) | Lesson / operations 约定与模板 |
| [04-context-budget.md](04-context-budget.md) | 上下文预算与分层加载 |
| [../phase2/README.md](../phase2/README.md) | 二期 MCP 已定案 |
| [../SYSTEM-DIRECTION.md](../SYSTEM-DIRECTION.md) | S0 方向约束 |

---

## 8. 决策摘要（来自 2026-07-14 方案讨论）

| 议题 | 结论 |
|------|------|
| 「变量」是什么 | Catalog Profile（哪套部署/fork）+ 项目 Overlay（operations/lessons） |
| 迭代主战场 | Skill ~70% / Agent ~20% / Rules ~10% |
| 记录方式 | Lesson Card（raw → distilled → merged\|rejected） |
| 上下文 | Progressive disclosure；MCP 保持索引轻量；Skill 主文件瘦身 + docs 外置 |
| MCP 写能力 | 三期仍不做写；可选只读 `list_lessons` / `profile` 后置 |
| 多环境 | 上游 ECS 已有；MacAir / BMWork 各自部署或本机 stdio，勿混 manifest |

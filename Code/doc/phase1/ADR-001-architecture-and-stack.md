# ADR-001 — 系统架构与技术栈冻结（约束后续开发）

> **状态**：Accepted（已采纳）  
> **日期**：2026-07-10  
> **效力**：本文件约束 `Code/code/` 及后续部署；与 `Doc/SYSTEM-DIRECTION.md`（S0）冲突时以 S0 为准，技术实现细节以本 ADR 为准。  
> **仓库**：https://github.com/ZhangHalfGod/Agents-Skill-Site  
> **变更本 ADR**：必须追加文末修订记录，并同步 S0 §8 决策日志。

---

## 1. 一句话架构

**磁盘上的 `standards/` Markdown 是 Source of Truth；本站是只读治理发现层（浏览 / 索引 / 运行指引）；Cursor（及可选 MCP）才是执行层。**

禁止把本站做成「网页内跑 Agent / 调模型改代码」的执行引擎。

---

## 2. 系统架构（冻结）

```text
浏览器
  │  http://8.163.18.183/agents-skill/   （无域名阶段；经 Nginx:80）
  ▼
Nginx（现网 mechassist 同机）
  │  location /agents-skill/  →  proxy/alias 到本站
  ▼
agents-skill-site（本仓库 Code/code 构建产物）
  │  开发：VitePress dev
  │  生产：静态 dist 或 127.0.0.1:3010 serve（仅本机）
  ▼
构建时扫描 / 拷贝（只读）
  ▼
Agents_Skill/standards/   ← 唯一内容真源
  common/agents | skills | rules
  （domains / operations 二期）
```

### 2.1 逻辑分层

| 层 | 职责 | 实现落点 |
|----|------|----------|
| 治理发现 | 角色/技能/规则浏览、标签跳转、复制 `@` 触发句 | 本站前端页面 |
| 索引契约 | URI 注册、角色-技能矩阵、manifest | `Doc/phase1/03`、`Doc/phase1/05`、构建生成物 |
| 内容真源 | 角色 md、SKILL.md、rules `.mdc` | `standards/`（本仓可 submodule/拷贝策略，见 §4） |
| 执行 | 读说明书、改代码、调工具 | Cursor / 可选 MCP（**不在本站进程内**） |
| 运行时宿主 | 进程、端口、反代、日志 | 阿里云 Ubuntu + PM2 + Nginx |

### 2.2 站点信息架构（外层固定）

| 路径（站点内，含 base） | 含义 |
|------------------------|------|
| `/`（即 `/agents-skill/`） | 首页总览 |
| `/agents/` | 标准角色目录 |
| `/skills/` | 技能目录 |
| `/rules/` | 规则 L0/L1/L2 |

完整 URI 以 `Doc/phase1/03-uri-registry.md` 为准；**先改注册表，再改路由**。

---

## 3. 技术栈（冻结）

| 类别 | 选定 | 版本约束 | 说明 |
|------|------|----------|------|
| 站点框架 | **VitePress** | 与 Node 22 兼容的当前稳定版 | 一期唯一 SSG；不并行上 Astro/Next |
| 语言 | Markdown + Vue（VitePress 主题/组件按需） | — | 正文以 MD 为主 |
| 运行时（构建/工具） | **Node.js** | **≥ 22.2.1**（现网 `v22.2.1`） | 与 ECS 对齐 |
| 包管理 | npm | 随 Node | lockfile 入库 |
| 进程管理（生产） | PM2 | 现网已有 | 名：`agents-skill-site` |
| 反向代理 | Nginx | 现网已有 | 子路径 `/agents-skill/` |
| 静态托管方式 | `vitepress build` 产物 + `serve` 或 Nginx `alias` | 二选一，优先简单可回滚 | 见 §5 |
| 可选检索/API | 一期不做独立 API 服务 | — | 二期再议 `/api/catalog` |

### 3.1 明确不采用（一期）

| 不采用 | 原因 |
|--------|------|
| Astro / Next / Nuxt 作主站 | 增加栈分裂；一期文档站 VitePress 足够 |
| 网站内嵌 LLM / Agent 运行时 | 违反 S0 非目标 |
| 安全组新开 3010 对公网 | 违反现网安全清单 |
| 在 `standards/**/agents/**/*.md` 写死公网 URL | 违反 S0 |
| 与 `mechassist-api` 同进程混部 | 隔离失败、回滚困难 |

### 3.2 换栈规则

若要废弃 VitePress：必须新开 ADR-00x、S0 §8 记决策、评估迁移成本；**禁止**静默换栈。

---

## 4. 内容与仓库边界

| 资产 | 位置 | 约定 |
|------|------|------|
| 工程规划 | `All_URI/Doc/` | 方向、需求、URI、进度、矩阵 |
| 实现跟踪 | `All_URI/Code/doc/` | 服务器、ADR、踩坑、部署 |
| 网站源码 | `All_URI/Code/code/` | 本 ADR 约束的 VitePress 工程 |
| 标准内容 | `Agents_Skill/standards/`（或构建时可达副本） | SoT；站点只读消费 |
| GitHub | `ZhangHalfGod/Agents-Skill-Site` | 当前推送根为 `All_URI` |

构建策略（一期默认）：

1. 开发机/CI：能读到 `standards` 相对路径（或配置 `STANDARDS_ROOT`）。  
2. `npm run build` 前可跑扫描脚本生成侧栏/manifest（阶段 4 强化门禁）。  
3. 服务器可只部署 `dist`，不必暴露整个 standards 树到公网磁盘（按发布方式定）。

---

## 5. 部署架构（冻结参数）

| 参数 | 冻结值 |
|------|--------|
| 公网 IP | `8.163.18.183`（暂无域名；HTTPS 后置） |
| 对外 URL | `http://8.163.18.183/agents-skill/` |
| VitePress `base` | **`/agents-skill/`**（必须与 Nginx location 一致） |
| 本机监听 | **`127.0.0.1:3010`**（若用 serve；若 Nginx 直接 alias dist 则可无 3010 进程） |
| 已占用勿碰 | `3001` / `3002` / `3003`（均 127.0.0.1） |
| 部署目录 | `/var/www/agents-skill-site` |
| PM2 名 | `agents-skill-site` |
| 安全组 | **不**为新站单独开放端口；公网仅 80（及未来 443） |

推荐生产形态（二选一，实现时写进 `Code/doc` 部署笔记）：

- **形态 α（更简单）**：Nginx `alias` 到 `dist/`，无 Node 常驻。  
- **形态 β（与现网 Node 习惯一致）**：PM2 跑 `serve -l tcp://127.0.0.1:3010`，Nginx `proxy_pass`。

一期默认倾向 **α**；若需热更新/统一 PM2 观测则用 **β**。

---

## 6. 后续开发硬约束清单（Checklist）

开发任一功能前自检：

- [ ] 未在角色/技能源 md 写入 `8.163.18.183` 或生产 URL  
- [ ] 新页面已登记 `Doc/phase1/03-uri-registry.md`  
- [ ] Agent↔Skill 绑定改动已更新 `Doc/phase1/05-agent-skill-matrix.md`  
- [ ] `base` 保持 `/agents-skill/`，本地预览用对应 base  
- [ ] 不引入第二套 SSG/全栈框架  
- [ ] 不实现聊天执行/模型推理  
- [ ] 生产监听仅本机或纯静态，不直出公网 Node 端口  
- [ ] 中文 UI/文档；无硬编码密钥  

阶段推进仍服从 `Doc/phase1/04-progress-plan.md`：先 Agents MVP，再 Skills/Rules，再 scan 门禁。

---

## 7. 与现有文档关系

| 文档 | 关系 |
|------|------|
| `Doc/SYSTEM-DIRECTION.md` | 方向宪法；本 ADR 是其技术落地 |
| `Doc/phase1/02-architecture.md` | 早期架构叙述；**栈选型以本 ADR §3 为准**（VitePress 已锁定） |
| `Code/doc/phase1/02-phase1-scaffold.md` | 阶段任务跟踪；服从本 ADR |
| `Code/doc/phase1/01-server-inventory.md` | 主机事实源；端口/IP 以 01 为准，部署参数与本 ADR §5 对齐 |
| `Code/doc/phase1/04-security-alignment.md` | 安全门禁；本 ADR 部署必须遵守 |

**冲突裁决**：S0 → 本 ADR → `01` 实机事实 → 进度表弹性。

---

## 8. 修订记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-07-10 | 1.0 | 初版采纳：锁定 VitePress + 治理站架构 + 部署参数；约束后续开发 |

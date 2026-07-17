# Agents Skill Site — AI 编码治理发现站

**Language / 语言:** [English](README.md) | [中文](README.zh-CN.md)

> **把 AI 编码治理从「口头约定、散落文档」升级为「可浏览、可检索、可按说明书触发的组织级资产运行面」。**

[![GitHub](https://img.shields.io/badge/GitHub-ZhangHalfGod%2FAgents--Skill--Site-blue?logo=github)](https://github.com/ZhangHalfGod/Agents-Skill-Site)
[![Build](https://github.com/ZhangHalfGod/Agents-Skill-Site/actions/workflows/build.yml/badge.svg)](https://github.com/ZhangHalfGod/Agents-Skill-Site/actions/workflows/build.yml)
[![VitePress](https://img.shields.io/badge/built%20with-VitePress-41b883?logo=vitepress)](https://vitepress.dev/)
[![MCP](https://img.shields.io/badge/MCP-Server-6366f1?logo=modelcontextprotocol)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> **本仓做什么**：VitePress 发现站 + MCP 索引 + **治理正文真源**。  
> **真源（中文全文）**：`Code/code/docs/zh/**`。英文站为 stub（`docs/**` root）。直接改 Markdown，再 `npm run generate`。  
> **站点语言**：英文默认 `/agents-skill/` · 中文 `/agents-skill/zh/`（顶栏切换）。  
> **工程文档英文精选**：[`Doc/en/README.md`](Doc/en/README.md)。  
> **不再依赖**：外仓 `standards/` + `STANDARDS_ROOT` sync（历史流程已废止）。

---

## 目录

- [流程 Demo：MCP → 干活 → 蒸馏 → 上传](#流程-demomcp--干活--蒸馏--上传)
- [背景：AI 编码工具的「治理真空」](#背景ai-编码工具的治理真空)
- [痛点：为什么团队协作总出问题](#痛点为什么团队协作总出问题)
- [本项目解决的问题](#本项目解决的问题)
- [双消费端架构总览](#双消费端架构总览)
- [快速开始](#快速开始)
- [使用场景](#使用场景)
- [目录结构](#目录结构)
- [常见问题](#常见问题)

---

## 流程 Demo：MCP → 干活 → 蒸馏 → 上传

端到端参考（目录名可换成你自己的项目，文内有虚构举例 + 本仓对照）：

**[Doc/guides/mcp-work-then-distill-demo.md](Doc/guides/mcp-work-then-distill-demo.md)**

```text
MCP 只读查索引 → @ source 正文干活/出门
  → 写 Lesson（文件，不经 MCP）→ 蒸馏进 skill/agent/rule
  → generate + validate → commit/push → 服务器 pull + build
```

要点：MCP **不写**正文；蒸馏与上传走 Git 与构建，无需为 MCP 单独实现写接口。

---

## 背景：AI 编码工具的「治理真空」

AI 编码工具（Cursor、Claude Code、Codex CLI 等）正在彻底改变开发方式。但大多数团队在使用 AI 编码时，都面临一个共同的困境：

```text
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  Cursor IDE  │    │  Claude Code  │   │  Codex CLI   │
│  Prompt 驱动  │    │  对话式协作    │   │  自动化脚本   │
└──────┬──────┘    └──────┬───────┘    └──────┬───────┘
       │                  │                   │
       │     ❌ 没有治理层                          │
       │                                          │
       ├── 角色定义在谁的脑子里？                    │
       ├── 技能经验散落在哪个 README 里？            │
       ├── 规则是口头约定还是写在了哪里？             │
       └── 新人来了怎么上手？                        │
```

市面上的 AI 编码生态主要覆盖了**执行层**（怎么用工具改代码），但几乎完全缺失了**治理层**（谁该做什么、怎么做、必须/禁止什么）。

**这个项目就是来填补这个空白的。**

---

## 痛点：为什么团队协作总出问题

### Pain 1：角色模糊
> "这个需求谁来拆？谁来审架构？测试要怎么配合 AI 生成？"

团队里没有统一的角色定义，每个人对 AI 编码协作的理解不一致，导致任务边界模糊、责任不清。

### Pain 2：技能零散
> "我们团队踩过这个坑，经验写在了老项目的 Wiki 里……但新来的同事不知道。"

最佳实践和经验教训散落在各处：有的在 Confluence、有的在聊天记录、有的在某个人的脑子里。没有统一的技能目录，更没有人知道"这个角色该用哪些技能"。

### Pain 3：规则隐性
> "数据库变更必须走审批——这是口头约定的，新人来了根本不知道。"

硬约束（不能写死密钥）、流程规则（必须经过架构审核）、场景规则（核心模块需要红色记录）——这些要么不存在，要么只存在于老员工的记忆里。

### Pain 4：没有迭代
> "上次踩的坑，这次又踩了一遍。"

团队经验无法沉淀和继承。换了人、换了项目、换了技术栈，一切从零开始。

### Pain 5：MCP 生态缺少组织层
> "市面上有上千个 MCP Server，但都是单一工具，没有谁告诉我这个角色应该用哪几个工具、按什么顺序、遵守什么规则。"

---

## 本项目解决的问题

### Solution 1：角色说明书——明确定义 AI 编码协作角色

预置 **8 个标准角色**，每个角色有完整的职责定义、工作流程、输出物清单、协作关系：

| 编号 | 角色 | 一句话职责 |
|:---:|------|-----------|
| 1 | 产品经理 | 需求拆解、范围界定、输出《AI代码生成范围清单》 |
| 2 | 架构师 | 架构合规、技术选型、核心模块审核 |
| 3 | 开发负责人 | 实现落地、代码质量、模块交付 |
| 4 | 测试工程师 | 测试策略、AI 生成代码验证、质量门禁 |
| 5 | 安全工程师 | 安全审计、漏洞扫描、合规检查 |
| 6 | 运维工程师 | 部署运维、CI/CD、监控告警 |
| 7 | UI 设计师 | 设计规范、组件库、视觉验收 |
| 8 | Nmos 工程师 | 音视频/NMOS 协议相关工程任务 |

> 这些角色是通用的起点。直接改本仓 `Code/code/docs/agents/**`，再 `npm run generate`。

### Solution 2：技能目录 + 矩阵绑定——知道该用什么、怎么用

**11 个预置技能**，涵盖软件开发全流程，并且通过绑定矩阵明确每个角色应该掌握哪些技能：

```text
技能目录（示例）               角色-技能绑定矩阵
┌──────────────────┐         ┌──────────────────────┐
│ stage-gate-flow  │◄────────┤ ProductManager       │
│  阶段门禁         │         │  ├─ stage-gate-flow  │
├──────────────────┤         │  └─ ai-code-boundary │
│ ai-code-boundary │◄────────┤                      │
│  AI 代码边界约束  │         │ Architect            │
├──────────────────┤         │  ├─ stage-gate-flow  │
│ mcp-builder      │◄────────┤  ├─ mcp-builder      │
│  MCP 服务构建器   │         │  └─ skill-creator   │
├──────────────────┤         └──────────────────────┘
│ skill-creator    │
│  技能创建器       │
└──────────────────┘
```

每次修改 `05-agent-skill-matrix.md`，网站和 MCP 自动同步——保证角色和技能的映射关系始终一致。

### Solution 3：分层规则体系——从硬约束到场景指南

| 层级 | 名称 | 例子 |
|:---:|------|------|
| **L0** | 硬约束（3 条） | Always respond in Chinese；禁止硬编码密钥；禁止后门 |
| **L1** | 流程规则（3 条） | 阶段门禁审核流程、变更审批流程 |
| **L2** | 场景规则（N 条） | MCP 最小契约约束、核心模块红色记录 |

L0 不可绕过，L1 明确流程，L2 按需激活。网页和 MCP 都能查到。

### Solution 4：双消费端——人用网页、AI 用 MCP

```
同一份数据源（manifest.json）
         │
    ┌────┴────┐
    ▼         ▼
静态网页      MCP 服务
(给人浏览)    (给 AI 查询)
    │         │
    ▼         ▼
浏览器访问    Cursor 调 tool
  → 看说明书    → 查绑定关系
  → 复制触发句   → 获 source 路径
```

- **人用网页**：VitePress 静态站点，快速浏览所有角色、技能、规则
- **AI 用 MCP**：Cursor/Claude Code 等 IDE 通过 MCP 协议查询索引，无需离开对话

### Solution 5：可继承、可迭代——Git 管理你的治理资产

```text
第一次 clone          六 个 月 后
┌────────────┐       ┌────────────────────┐
│ 8 角色      │       │ 10 角色（+2 自定义） │
│ 11 技能     │       │ 18 技能（+7 自定义） │
│ 通用规则    │       │ 公司特有规则         │
│ 基础矩阵    │       │ 精调矩阵             │
│ Git init    │       │ 127 次 commit        │
└────────────┘       └────────────────────┘
          ▲ 每一次修改都是 Git 历史 ▲
          ▲ 新人 clone 即得全部积淀 ▲
          ▲ 换项目不换治理体系      ▲
```

---

## 双消费端架构总览

```text
  Agents-Skill-Site（本仓）
  ┌─── SoT + 统一索引 ──────────────────────────────┐
  │  Code/code/docs/**  （agents / skills / rules）  │
  │  manifest.json · health.json · 侧栏生成物         │
  └─────────┬──────────────────────────┬────────────┘
            │                          │
            ▼                          ▼
     ┌──────────────┐           ┌──────────────┐
     │ 消费端 A      │           │ 消费端 B      │
     │ VitePress 站  │           │ MCP（只读）   │
     │ → dist/      │           │ stdio / HTTP │
     └──────────────┘           └──────┬───────┘
                                       ▼
                                 Cursor IDE（查索引 → @ source）
```

> 正文就在本仓 `docs/**`。改页后执行 `npm run generate`（或 `npm run sync` 别名）刷新 `manifest.json` 与侧栏；`npm run dev` / `build` 会自动跑 generate。

### 分层模型

```
┌─────────────────────────────────────────────────────────┐
│  治理资产 SoT（本仓 docs/**）                              │
│  agents / skills / rules / operations = 磁盘 Markdown    │
└───────────────────────────┬─────────────────────────────┘
                            │ generate（索引 / 侧栏）
┌───────────────────────────▼─────────────────────────────┐
│  发现层                                                    │
│  网站浏览 + manifest 索引 + MCP 只读查询                     │
└───────────────────────────┬─────────────────────────────┘
                            │ 同一份 manifest
┌───────────────────────────▼─────────────────────────────┐
│  执行层（不在网站内实现推理）                                 │
│  Cursor @文件 / MCP tools（只读）                           │
└─────────────────────────────────────────────────────────┘
```

> **核心原则**：网站 = 治理发现层；Cursor/MCP = 执行层。**禁止互相替代。** MCP 是索引服务员，不是角色说明书。

---

## 快速开始

### 本地预览网站

```bash
# 1. 克隆
git clone https://github.com/ZhangHalfGod/Agents-Skill-Site.git
cd Agents-Skill-Site/Code/code

# 2. 安装依赖
npm ci

# 3. 启动（自动 generate + validate）
npm run dev
# → 打开 http://localhost:5173/agents-skill/

# 改 docs 正文后也可单独：
# npm run generate
```

### 配置 Cursor MCP

> **Token 生成**：在服务器上执行 `openssl rand -hex 32`，输出的 64 字符十六进制字串就是你的 Bearer Token。  
> 复制这个值，替换下方配置中的 `<YOUR_TOKEN>`（包括尖括号一起替换）。  
> 如果服务器没有 `openssl`，也可以用 `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` 生成。

```json
// ~/.cursor/mcp.json 或项目 .cursor/mcp.json
{
  "mcpServers": {
    "agents-skill-remote": {
      "url": "http://YOUR_DEPLOYED_HOST/agents-skill-mcp/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_TOKEN>"
      }
    }
  }
}
```

如果还没有部署远程 MCP，也可以使用本地 stdio：

```json
{
  "mcpServers": {
    "agents-skill": {
      "command": "node",
      "args": ["/absolute/path/Agents-Skill-Site/Code/code/mcp/server.mjs"],
      "env": {
        "MANIFEST_URL": "http://YOUR_DEPLOYED_HOST/agents-skill/manifest.json"
      }
    }
  }
}
```

### 生产部署

```bash
# 1. 服务器上拉取代码
git pull origin main
cd Code/code
npm ci && npm run build

# 2. 配置 Nginx（见 deploy/nginx-agents-skill.snippet.conf）
#    alias 到 docs/.vitepress/dist/ 目录

# 3. 部署 MCP 远程服务（可选）
cd Code/mcp-remote
cp deploy/env.production.example .env   # 编辑 .env 填入 MCP_TOKEN
npm ci
pm2 start deploy/ecosystem.config.cjs
pm2 save
```

---

## 使用场景

### 场景一：团队 onboarding

> **新成员加入团队** → 打开网页浏览 8 个角色 → 理解 AI 编码协作分工 → 配置 Cursor MCP → 开始干活

新人不用问"这个该谁做"，不用等师傅教——网页上写得清清楚楚。

### 场景二：日常 Cursor 开发

> **在 Cursor 对话框里** → "用 agents-skill-remote 查 ProductManager 绑定了哪些技能" → 获得绑定关系 → 按角色执行任务

不需要离开 IDE，不需要翻文档，MCP 直接返回。

### 场景三：治理资产迭代

> **团队沉淀了新规范** → 写 Lesson（`docs/operations/.../lessons/`）→ 蒸馏后改 `docs/skills|agents|rules` → `npm run generate` → Git commit

每一次改进都记录在案，可追溯、可回退、可 review。端到端步骤见上方 [流程 Demo](#流程-demomcp--干活--蒸馏--上传)。

### 场景四：组织级标准化

> **多个团队统一治理框架** → 核心团队维护上游模板 → 各团队 fork 定制 → 定期同步上游改进

一套框架，N 个变体，统一术语，共享进化。

---

## 目录结构

```text
Agents-Skill-Site/                   # 本仓：发现站 + MCP + docs 真源
├── README.md                        # 默认英文
├── README.zh-CN.md                  # 中文（本页）
├── deploy.sh                        # ECS 部署脚本
│
├── Doc/                             # 工程文档（规划 / 架构 / 决策）
│   ├── SYSTEM-DIRECTION.md          #   S0 系统级约束（必读）
│   ├── CHANGELOG.md                 #   版本里程碑记录
│   ├── guides/                      #   跨项目流程 Demo（MCP→蒸馏→上传）
│   ├── phase1/                      #   一期规划（网站 MVP）
│   ├── phase2/                      #   二期规划（Cursor + MCP）
│   └── phase3/                      #   三期（迭代闭环）
│
├── Code/                            # 实现工程根
│   ├── doc/                         #   实现笔记 / ADR / 部署日志
│   ├── code/                        #   VitePress 网站 + stdio MCP
│   └── mcp-remote/                  #   远程 HTTP MCP 服务器
│
└── .gitignore
```

---

## Fork 开始你的定制版

> 适用场景：你想基于本项目为你的公司或团队建立私有定制版，长期独立管理并定期同步上游更新。

核心操作：

1. **Fork 本仓**：在 GitHub 上打开本仓库，点击右上角 **Fork**
2. **Clone**：`git clone https://github.com/你的用户名/Agents-Skill-Site.git`
3. **添加 upstream**：`git remote add upstream https://github.com/ZhangHalfGod/Agents-Skill-Site.git`
4. **定制治理正文**：直接改 `Code/code/docs/**`，然后：
   ```bash
   cd Code/code
   npm run generate
   ```
5. **同步上游**：`git fetch upstream && git merge upstream/main`

> 详细步骤见「[Git 操作指南](Doc/git/fork-and-upstream.md)」；三期 Lesson 见 [`Doc/phase3/00-context.md`](Doc/phase3/00-context.md)。

治理正文与站点框架同仓；合并上游时注意保留你对 `docs/**` 的定制。

---

## 常见问题

### 和市面上 MCP 服务有什么不同？

市面 MCP 服务提供的是**单点工具**（搜索新闻、查天气、读数据库），本项目提供的是**治理发现站 + 索引**——角色、技能、规则、矩阵在网页与 MCP 中可查；MCP 只是消费方式之一。**MCP 是索引服务员，不是角色说明书。**

### 正文在哪里改？

在本仓 **`Code/code/docs/**`**。改完后 `npm run generate`（`predev`/`prebuild` 也会跑）。MCP 读的是同一份 `manifest.json`。

### 必须用预置的 8 个角色吗？

不需要。在 `docs/agents/**` 删、改、增，并更新 `Doc/phase1/05-agent-skill-matrix.md` 与 `scripts/sync-standards.mjs` 登记表（若增新角色），再 `npm run generate`。

### 和 Cursor Rules / .cursorrules 什么关系？

本项目不替代 Cursor Rules。L0 可用 Cursor Rules 做运行时约束；本站提供定义、浏览与检索。**MCP 返回的 `source` 指向本仓 `docs/...`，在已打开本仓库的工作区里 `@` 即可。**

### 数据安全怎么保证？

- 所有 `.env` 文件都被 `.gitignore` 排除，**密钥不进 Git**
- MCP 服务只绑定 `127.0.0.1`（本机），通过 Nginx 反代 + Bearer Token 对公网
- 网站是纯静态文件，无后端数据库，无运行时推理
- Lesson / 正文禁止写入密钥与未脱敏数据（见 `docs/operations/README.md`）

### 部署需要什么？

- **网站**：任何静态文件服务器（Nginx、GitHub Pages、Vercel 都行）
- **远程 MCP**：一台 Node 22+ 服务器 + PM2（或 Docker）
- **最低开销**：只有静态网站时 Nginx alias 到 dist 即可

### 怎么加自定义技能？

1. 在 `docs/skills/custom/common/<id>/index.md` 写正文
2. 更新 `Doc/phase1/05-agent-skill-matrix.md` 与 generate 脚本登记表
3. `npm run generate` → 出现在网页和 MCP

### 三期 Lesson 怎么记？

复制 `docs/operations/_template/lessons/_lesson-card.template.md` 到 `docs/operations/<project>/lessons/`，蒸馏后直接改 `docs/skills|agents|rules`。

---

## 许可证

[MIT License](LICENSE) — 自由使用、修改、分发。欢迎 Star、Fork、PR。

---

<p align="center">
  <b>从「散落的口头约定」到「可浏览、可检索、可继承的治理资产」</b><br>
  <sub>— 今天是棵小苗，养十年就是棵大树 —</sub>
</p>

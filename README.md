# Agents Skill Site — AI 编码治理发现站

> **把 AI 编码治理从「口头约定、散落文档」升级为「可浏览、可检索、可按说明书触发的组织级资产运行面」。**

[![GitHub](https://img.shields.io/badge/GitHub-ZhangHalfGod%2FAgents--Skill--Site-blue?logo=github)](https://github.com/ZhangHalfGod/Agents-Skill-Site)
[![VitePress](https://img.shields.io/badge/built%20with-VitePress-41b883?logo=vitepress)](https://vitepress.dev/)
[![MCP](https://img.shields.io/badge/MCP-Server-6366f1?logo=modelcontextprotocol)](https://modelcontextprotocol.io/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## 📖 目录

- [背景：AI 编码工具的「治理真空」](#背景ai-编码工具的治理真空)
- [痛点：为什么团队协作总出问题](#痛点为什么团队协作总出问题)
- [本项目解决的问题](#本项目解决的问题)
- [双消费端架构总览](#双消费端架构总览)
- [快速开始](#快速开始)
- [使用场景](#使用场景)
- [目录结构](#目录结构)
- [常见问题](#常见问题)

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

> 💡 这些角色是通用的起点。你可以删掉不需要的角色、修改职责描述、增加自定义角色——`standards/` 里的 Markdown 就是你的源。

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
                    ┌─── 数据源 ────────────────────────────────────────┐
                    │                                                    │
 Source of Truth     │         manifest.json（统一索引）                   │
  standards/──sync──►│  ├─ agents[]    8 个标准角色                     │
  磁盘 Markdown 文件  │  ├─ skills[]    11 个技能                       │
  角色 · 技能 · 规则  │  ├─ rules[]    分层规则（L0/L1/L2）              │
                    │  ├─ domains[]  灰度域扩展                         │
                    │  └─ health.json    构建验证报告                   │
                    │         ▲              ▲                          │
                    └─────────┼──────────────┼──────────────────────────┘
                              │              │
    ┌─────────────────────────┤              │
    │                         │              │
    ▼                         │              │
┌──────────────────┐          │  ┌───────────▼──────────────┐
│  消费端 A        │          │  │  消费端 B                 │
│  静态网页        │          │  │  MCP 服务                 │
│  给人浏览        │          │  │  给 Cursor AI 调用        │
│                  │          │  │                          │
│  VitePress SSG   │          │  │  catalog-api.mjs          │
│  npm run build   │          │  │  统一只读工具层            │
│       → dist/    │          │  ├──────────────────────┤   │
│                  │          │  │  传输层（二选一）      │   │
│  Nginx / 静态服务 │          │  │  ┌────────┐ ┌──────┐ │   │
│  /agents-skill/  │          │  │  │ stdio  │ │ HTTP │ │   │
│                  │          │  │  │ 本地进程│ │ 远程  │ │   │
│                  │          │  │  └────────┘ └──┬───┘ │   │
└──────────────────┘          │  └────────────────┼─────┘   │
                              │                   │         │
                              │               Nginx 反代     │
                              │            /agents-skill-mcp/ │
                              └───────────────────┬───────────┘
                                                  │
                                            ┌─────▼─────┐
                                            │ Cursor IDE │
                                            │ AI Agent   │
                                            │ 通过 tool   │
                                            │ 查索引      │
                                            └───────────┘
```

### 分层模型

```
┌─────────────────────────────────────────────────────────┐
│  治理层（本项目）                                         │
│  agents 谁来做 │ skills 怎么做 │ rules 必须/禁止          │
│  载体：standards/ + 网站 + manifest 索引                  │
└───────────────────────────┬─────────────────────────────┘
                            │ 同一份 manifest
┌───────────────────────────▼─────────────────────────────┐
│  执行层（不在网站内实现推理）                               │
│  Cursor @文件 / 编号协议 / MCP tools（只读）               │
│  载体：IDE、脚本、外部运行时                                │
└─────────────────────────────────────────────────────────┘
```

> ⚠️ **核心原则**：网站 = 治理发现层；Cursor/MCP = 执行层。**禁止互相替代。** MCP 是索引服务员，不是角色说明书。

---

## 快速开始

### 🖥 本地预览网站

```bash
# 1. 克隆
git clone https://github.com/ZhangHalfGod/Agents-Skill-Site.git
cd Agents-Skill-Site/Code/code

# 2. 安装依赖
npm ci

# 3. 启动开发服务器（含数据同步 + 校验）
npm run dev
# → 打开 http://localhost:5173/agents-skill/
```

### 🛠 配置 Cursor MCP

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
      "args": ["/绝对路径/Agents-Skill-Site/Code/code/mcp/server.mjs"],
      "env": {
        "MANIFEST_URL": "http://YOUR_DEPLOYED_HOST/agents-skill/manifest.json"
      }
    }
  }
}
```

### 🐳 生产部署

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

> **团队沉淀了新规范** → 写一个 SKILL.md → 改矩阵映射 → `npm run sync` → 网页和 MCP 自动更新 → Git commit

每一次改进都记录在案，可追溯、可回退、可 review。

### 场景四：组织级标准化

> **多个团队统一治理框架** → 核心团队维护上游模板 → 各团队 fork 定制 → 定期同步上游改进

一套框架，N 个变体，统一术语，共享进化。

---

## 目录结构

```text
Agents-Skill-Site/
├── README.md                        # ← 现在看的这个文件
├── deploy.sh                        # ECS 部署脚本
│
├── Doc/                             # 工程文档（规划 / 架构 / 决策）
│   ├── SYSTEM-DIRECTION.md          #   S0 系统级约束（必读）
│   ├── CHANGELOG.md                 #   版本里程碑记录
│   ├── phase1/                      #   一期规划（网站 MVP）
│   └── phase2/                      #   二期规划（Cursor + MCP）
│
├── Code/                            # 实现工程根
│   ├── doc/                         #   实现笔记 / ADR / 部署日志
│   │   ├── phase1/
│   │   └── phase2/
│   │
│   ├── code/                        #   VitePress 网站 + stdio MCP
│   │   ├── docs/
│   │   │   ├── .vitepress/          #   VitePress 配置与主题
│   │   │   ├── agents/              #   角色页面（构建生成）
│   │   │   ├── skills/              #   技能页面（构建生成）
│   │   │   ├── rules/               #   规则页面
│   │   │   ├── domains/             #   域扩展页面
│   │   │   └── health/              #   健康检查页面
│   │   ├── mcp/
│   │   │   ├── server.mjs           #   stdio MCP 服务器入口
│   │   │   ├── catalog-api.mjs      #   统一只读工具层（核心库）
│   │   │   └── cursor-mcp.json.example
│   │   ├── scripts/
│   │   │   ├── sync-standards.mjs   #   数据同步（standards → docs）
│   │   │   ├── validate-manifest.mjs #  构建门禁校验
│   │   │   └── check-dead-links.mjs  #  内部链接检查
│   │   ├── deploy/                  #   Nginx 配置、PM2 配置
│   │   └── package.json
│   │
│   └── mcp-remote/                  #   远程 HTTP MCP 服务器
│       ├── src/
│       │   ├── server.mjs           #   Express + Streamable HTTP 入口
│       │   ├── auth.mjs             #   Bearer Token 鉴权
│       │   └── create-mcp.mjs       #   MCP 工具层（复用 catalog-api）
│       ├── deploy/                  #   PM2 / Nginx 配置
│       ├── CURSOR-SETUP.md          #   Cursor 配置指南
│       └── package.json
│
└── .gitignore
```

---

## 常见问题

### 和市面上 MCP 服务有什么不同？

市面 MCP 服务提供的是**单点工具**（搜索新闻、查天气、读数据库），本项目提供的是**治理框架**——定义了角色、技能、规则、矩阵，MCP 只是其中一种消费方式。**MCP 是索引服务员，不是角色说明书。**

### 必须用你们预置的 8 个角色吗？

不需要。`standards/` 里的 Markdown 是**你的源**。删、改、增，随心所欲。`npm run sync` 自动同步到网站和 MCP。

### 和 Cursor Rules / .cursorrules 什么关系？

本项目不替代 Cursor Rules。L0 规则可以用 Cursor Rules 实现运行时约束，但本站提供的是规则的定义、浏览、检索和管理。**MCP 返回 source 路径后，你可以在 IDE 中 `@` 对应的规则文件。**

### 数据安全怎么保证？

- 所有 `.env` 文件都被 `.gitignore` 排除，**密钥不进 Git**
- MCP 服务只绑定 `127.0.0.1`（本机），通过 Nginx 反代 + Bearer Token 对公网
- 网站是纯静态文件，无后端数据库，无运行时推理
- 你的 `standards/` 定制内容完全由你控制，开源版只提供通用模板

### 部署需要什么？

- **网站**：任何静态文件服务器（Nginx、GitHub Pages、Vercel 都行）
- **远程 MCP**：一台 Node 22+ 服务器 + PM2（或 Docker）
- **最低开销**：只有静态网站的话，连 Node 进程都不需要——Nginx alias 到 dist 目录即可

### 怎么加自定义技能？

1. 在 `standards/common/skills/custom/` 下创建 `SKILL.md`
2. 在 `05-agent-skill-matrix.md` 更新角色绑定
3. 运行 `npm run sync` → 自动出现在网页和 MCP 中

---

## 许可证

[MIT License](LICENSE) — 自由使用、修改、分发。欢迎 Star、Fork、PR。

---

<p align="center">
  <b>从「散落的口头约定」到「可浏览、可检索、可继承的治理资产」</b><br>
  <sub>— 今天是棵小苗，养十年就是棵大树 —</sub>
</p>

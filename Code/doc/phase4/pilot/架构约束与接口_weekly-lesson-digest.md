# 架构约束与接口：weekly-lesson-digest

> **阶段**：H2（设计 → 架构约束）  
> **来源**：Architect → DevLead  
> **项目标识**：`weekly-lesson-digest`  
> **文档版本**：v0.1  
> **前提条件**：已接收 H1 范围清单并完成悬置问题收口（详见下文 d005/d006/d007）

---

## 0. 已定决策收口

| 源决策 | 收口结论 | 说明 |
|--------|---------|------|
| d001 飞书推送机制 | 自定义机器人 Webhook（单 URL） | 采纳 PM 建议 |
| d002 lessons:scan 零侵入 | 不改脚本 + 不改输出格式 | 严格执行 |
| d003 调度机制 | OpenClaw Gateway 内置 Cron | 采纳 PM 建议 |
| d004 凭据配置 | 环境变量 `LESSON_DIGEST_FEISHU_WEBHOOK` | 采纳 PM 建议 |
| **d005（原 q001）** 飞书目标群 | **单 Webhook + env 可换** | 由环境变量承载，不引入多目标配置 |
| **d006（原 q002）** Home 机进程形态 | **假设：Gateway 常驻服务** | 标注为假设，未经实测验证 |
| **d007（原 q003）** 推送失败报警 | **日志 + 重试 1 次** | 放弃额外报警渠道，重试仍失败则写日志静默 |

---

## 1. 分层

### 1.1 全局分层图

```
┌──────────────────────────────────────────────────────────┐
│                    调度层 (Scheduler)                     │
│          OpenClaw Gateway Cron · 0 9 * * 1              │
│    职责：定时触发，不处理业务逻辑，不涉及 lessons:scan    │
└────────────────────────┬─────────────────────────────────┘
                         │ 执行 node scripts/lesson-digest.mjs
                         ▼
┌──────────────────────────────────────────────────────────┐
│               编排层 (Orchestrator)                       │
│              scripts/lesson-digest.mjs                   │
│    职责：编排全流程——调用扫描、解析输出、提取章节、推送   │
│    注：本层是本次需求唯一「AI 可生成」模块（普通模块）    │
└──────────┬─────────────────────────┬────────────────────┘
           │                         │
           ▼                         ▼
┌──────────────────┐    ┌──────────────────────────┐
│  扫描工具        │    │  飞书通道 (Channel)       │
│  lessons:scan    │    │  Feishu Webhook POST      │
│  (只读外部工具)   │    │  职责：将格式化消息送达   │
│  不可修改        │    │        飞书指定群聊       │
└──────────────────┘    └──────────────────────────┘
```

### 1.2 层间交互规则

| 交互 | 方式 | 约束 |
|------|------|------|
| 调度层 → 编排层 | `child_process.execFile` 启动 Node.js 脚本 | Gateway 自动管理进程生命周期 |
| 编排层 → 扫描工具 | `child_process.execFile('npm', ['run', 'lessons:scan'])` | 禁止修改 lessons:scan 或 package.json |
| 编排层 → 飞书通道 | `fetch(webhookUrl)` POST 原生 JSON | 仅使用 Node.js 内置 `fetch`（v18+），不引入 axios/request |
| 编排层 → 日志 | `console.log` / `console.error` → stdout/stderr | Gateway 统一捕获 |

### 1.3 目录结构

```
code/
├── scripts/
│   ├── lesson-scan.mjs         ← 既存，不动
│   └── lesson-digest.mjs       ← 本次新增（编排脚本）
├── package.json                ← 既存，不动（除非 lessons:digest 脚本被打包入口）
```

不新增 `/openclaw/`、不修改 `package.json`（除非显式需要 `npm run lessons:digest` 别名）。

---

## 2. 接口数据模型

### 2.1 编排脚本入口

| 字段 | 值 |
|------|-----|
| 路径 | `scripts/lesson-digest.mjs` |
| 调用方式 | `node scripts/lesson-digest.mjs` |
| 退出码 | `0` = 成功（含"无建议"场景）；`1` = 严重错误（lessons:scan 未找到等） |
| 依赖环境变量 | `LESSON_DIGEST_FEISHU_WEBHOOK`（必填） |

### 2.2 扫描调用接口

| 项目 | 说明 |
|------|------|
| 命令 | `npm run lessons:scan` |
| 工作目录 | `D:\trae_git\Agents-Skill-Site\Code\code`（通过 `cwd` 参数传入）|
| 超时 | 60 秒 |
| 输出 | stdout = Markdown 报告；stderr = 校验警告 |
| 退出语义 | `0` = 正常（含 frontmatter 警告）；`1` = strict 模式失败 |
| 零侵入承诺 | 不传 `--strict` 参数，不解析 stderr（仅记日志） |

### 2.3 飞书 Webhook 消息体

**场景 A：有建议**

```json
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": { "tag": "plain_text", "content": "📋 本周 Lesson 升格建议" }
    },
    "elements": [
      { "tag": "markdown", "content": "<原始表格 Markdown + 终审动作提示>" }
    ]
  }
}
```

**场景 B：无建议**

```json
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": { "tag": "plain_text", "content": "📋 本周 Lesson 升格建议" }
    },
    "elements": [
      { "tag": "markdown", "content": "本周无待终审的跨项目升格建议。" }
    ]
  }
}
```

**场景 C：扫描失败**

```json
{
  "msg_type": "interactive",
  "card": {
    "header": {
      "title": { "tag": "plain_text", "content": "⚠️ 本周 Lesson 扫描异常" }
    },
    "elements": [
      { "tag": "markdown", "content": "lessons:scan 执行失败（exit code: N），本周期跳过推送。\n详情请检查 Home 机 OpenClaw-Bot 日志。" }
    ]
  }
}
```

### 2.4 提取规则（Adapters）

```
输入：stdout (Markdown 全文)
提取算法：
  1. 在 stdout 中定位 "## 升格建议清单（供人工终审，勿自动合入）" 行
  2. 从此行之后开始收集内容
  3. 遇到下一个 "## "（二级标题）行 或 EOF 时停止
  4. 去除首尾空白
  5. 若提取内容为空 → 判定为"无建议"场景
  6. 若找不到该节标题行 → 判定为"无建议"场景（兼容旧版本输出）
输出：原始 Markdown 字符串（保留完整表格格式）
```

### 2.5 日志格式

| 事件 | stdout / stderr | 格式 |
|------|----------------|------|
| 扫描开始 | stdout | `[weekly-lesson-digest] scan started` |
| 扫描完成 | stdout | `[weekly-lesson-digest] scan completed (exit: 0)` |
| 提取完成 | stdout | `[weekly-lesson-digest] extracted N suggestions` |
| 推送成功 | stdout | `[weekly-lesson-digest] feishu push ok` |
| 扫描失败 | stderr | `[weekly-lesson-digest] scan failed (exit: <code>): <stderr>` |
| 推送失败 | stderr | `[weekly-lesson-digest] feishu push failed: <status> <body>` |
| 推送重试中 | stderr | `[weekly-lesson-digest] feishu push retrying in 30s...` |
| 推送最终失败 | stderr | `[weekly-lesson-digest] feishu push failed after retry: <status>` |

---

## 3. 技术选型与理由

| 选型 | 决策 | 理由 |
|------|------|------|
| 编排语言 | Node.js（ESM, `.mjs`） | 项目已是 Node.js 生态，lessons:scan 同语言；无需引入新运行时 |
| HTTP 客户端 | Node.js 内置 `fetch`（v18+） | 零依赖；Home 机 Node 版本 v22.22.3 ≥ 18，`fetch` 已全局可用 |
| Markdown 提取 | 纯字符串搜索 + 正则 | lessons:scan 输出格式稳定（固定标题文本 + 表格）；不需要引入 marked/unified 等解析器 |
| 飞书消息格式 | Interactive Card（msg_type=interactive） | Webhook 支持的富文本格式，可保留表格对齐；优于 text 格式 |
| 日志 | console.log/console.error | OpenClaw Gateway 自动捕获 stdout/stderr 做日志托管；零额外依赖 |
| 凭据管理 | 环境变量 | 跨平台、零配置存储；与 Gateway 配置体系兼容 |
| 版本管理 | 合入 `code/` 仓库 | 与 lessons:scan 同仓库，版本一致性保证；不增加新仓库 |

### 3.1 不作为（Anti-choices）

| 弃用选项 | 理由 |
|---------|------|
| Python / Go / Rust | 引入新运行时增加维护成本 |
| axios / needle / undici | Node `fetch` 已满足单 POST 调用；零依赖减少安全审计范围 |
| marked / unified / gray-matter | 仅提取一个 H2 节，正则足够；引入解析器反而增加复杂度与脆弱性 |
| dotenv | 仅 1 个环境变量，项目级 `.env` 加载由 Gateway 或启动器负责 |
| PM2 / NSSM | d006 假设 Gateway 常驻服务，脚本由 Gateway 进程启动，不在脚本侧管理进程 |
| 数据库 / 文件持久化 | 已由 H1 范围清单列为 Out of Scope |

---

## 4. 红色模块清单

### 4.1 红色记录触发检查

| 检查项 | 结论 |
|--------|------|
| 是否涉及核心层（业务核心逻辑）？ | **否** — 编排脚本是纯工具脚本，不包含业务核心逻辑 |
| 是否涉及网关层（流量/路由/限流）？ | **否** — 不修改任何网关配置 |
| 是否涉及安全模块（认证/鉴权/加密）？ | **否** — 仅透传 Webhook URL（由环境变量承载），不管理认证 |
| 是否涉及架构层（分层/引用/依赖方向）？ | **否** — 新增独立脚本，不改变现有分层与依赖方向 |
| 是否涉及数据持久层核心逻辑？ | **否** — 无持久化操作 |

**结论：本次不触发《核心模块AI生成红色记录》。**

### 4.2 理由说明

所有 P0/P1/P2 条目均被 H1 范围清单标记为「普通模块」。编排脚本 `lesson-digest.mjs` 仅负责调用外部命令 + 解析 stdout + HTTP POST，不触及项目核心域、网关配置、安全基础设施或持久层。

---

## 5. 与 L0 对照

### 5.1 范围覆盖

| L0（范围清单条目） | L2（本设计覆盖） | 状态 |
|-------------------|-----------------|------|
| P0-1 定时任务注册 | §1.1 调度层：Gateway Cron | ✅ 已覆盖 |
| P0-2 升格建议清单提取 | §2.4 提取规则 | ✅ 已覆盖 |
| P0-3 飞书消息推送 | §2.3 消息体契约 | ✅ 已覆盖 |
| P0-4 错误处理与静默降级 | §2.5 日志格式 + §2.3 场景 C | ✅ 已覆盖 |
| P1-5 手动重试命令 | 未设计（P1，DevLead 可自行决定是否纳入） | 🔲 延后 |
| P1-6 推送失败重试 | §2.5 重试日志格式（编排层内实现） | ✅ 已覆盖 |
| P2-7 前次扫描时间戳 | 未设计（P2，DevLead 可自行决策） | 🔲 延后 |

### 5.2 约束遵从

| H1 约束 | H2 落实 |
|---------|---------|
| lessons:scan 只读 | §1.2 层间规则：'禁止修改 lessons:scan 或 package.json' |
| 升格合入不走自动 | §2.3 场景 A 消息保留终审动作提示 |
| Asia/Shanghai 时间 | Gateway Cron 配置指定时区；脚本内部不涉时间计算 |
| 凭据不硬编码 | 环境变量 `LESSON_DIGEST_FEISHU_WEBHOOK`，§0 d004/d005 收口 |
| 配置外部化 | §2.1 仅通过环境变量传递配置 |

### 5.3 NFR 映射

| NFR | 关注点 | 实现 |
|-----|--------|------|
| 推送成功率 ≥ 95% | 重试机制 | P1-6：自动重试 1 次 |
| 延迟 ≤ 5 min | 执行效率 | lessons:scan 毫秒级完成 + HTTP POST < 1s，远低于阈值 |
| 内容正确性 | 提取准确性 | §2.4 提取规则 + 下阶段测试用例（空节/多表/无表边界） |
| 可观测性 | 日志审计 | §2.5 全链路日志格式，Gateway 托管 |

---

## 6. Prompt 架构约束条款（供 DevLead 嵌入 Prompt 模板）

以下条款供 DevLead 写入 `scripts/lesson-digest.mjs` 的 AI 生成 Prompt 头部：

```markdown
## 架构约束

### 目录与依赖
- 生成文件：scripts/lesson-digest.mjs（ESM, .mjs）
- 零新增依赖：仅使用 Node.js 内置 API（child_process, fetch, path）
- 禁止修改：scripts/lesson-scan.mjs、package.json 及任何既存文件

### 分层
- lesson-digest.mjs = 编排层，职责：调用扫描 → 提取 → 推送
- lessons:scan = 扫描工具层，只读调用，不可改
- Feishu = 通道层，仅做 POST 调用

### 接口契约
- 退出码：0=正常, 1=lessons:scan 无法启动等严重错误
- 飞书消息体格式：见 §2.3（interactive card）
- 提取规则：见 §2.4（H2 标题锚定）
- 日志格式：见 §2.5（[weekly-lesson-digest] 前缀）
- 超时：子进程 60s；HTTP 15s

### 错误语义
- lessons:scan exit ≠ 0 → 记日志，发"扫描异常"消息（§2.3 场景 C），退出码 0
- 飞书推送 4xx/5xx → 30s 后重试 1 次，仍失败记日志，退出码 0
- 未设置 LESSON_DIGEST_FEISHU_WEBHOOK → 写入 stderr 并 exit 1
- 所有异常不得静默吞掉（必须有日志行）
```

---

*本文档由 Architect 角色在 H2 阶段输出，提交 DevLead 进行 Prompt 编写与代码生成。*

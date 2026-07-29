# AI 代码生成范围清单：weekly-lesson-digest

> **阶段**：H1（需求 → 范围界定）  
> **来源**：ProductManager → Architect  
> **项目标识**：`weekly-lesson-digest`  
> **文档版本**：v0.1（初稿）

---

## 1. 目标

在 Home 机 OpenClaw-Bot 上挂载一条定时任务：

> 每周一 09:00（Asia/Shanghai），在 `D:\trae_git\Agents-Skill-Site\Code\code` 目录执行 `npm run lessons:scan`，自动从输出中提取「升格建议清单」一节，将摘要推送到飞书指定群聊。

**业务指标（SMART）**：

| 指标 | 口径 |
|------|------|
| 推送成功率 | ≥ 95%（任意连续 4 周）|
| 延迟 | 任务触发后 5 分钟内完成推送 |
| 内容正确性 | 推送内容与 `lessons:scan` 输出「升格建议清单」节的信息严格一致，无错漏、无截断 |
| 人工确认 | 本周有升格建议时，飞书消息包含完整表格 + 终审动作提示 |

---

## 2. 范围条目

### P0（必须交付）

| # | 功能点 | 验收标准（Given-When-Then） | AI 可生成范围 | 优先级 | AI 生成级别 |
|---|--------|---------------------------|--------------|--------|------------|
| 1 | **OpenClaw-Bot 定时任务注册**<br>在 Home 机 OpenClaw-Bot 上注册 cron 表达式 `0 9 * * 1` | Given 当前时间为周一 09:00<br>When 定时器触发<br>Then OpenClaw-Bot 在 D:\trae_git\Agents-Skill-Site\Code\code 目录启动 `npm run lessons:scan`，stdout 捕获完整输出 | 定时配置、进程启动、stdout 捕获 | P0 | 普通模块 |
| 2 | **「升格建议清单」节提取**<br>从 `lessons:scan` markdown stdout 中定位 `## 升格建议清单` 至下一个二级标题（`##`）或 EOF 之间的内容 | Given stdout 包含「升格建议清单」节<br>When 提取逻辑执行<br>Then 准确提取该节的表格（| Lesson | 项目 | 状态 | 建议原因 | 建议合入目标 |）及终审动作提示行<br>And 若无该节，推送一条「本周无待终审升格建议」 | 正则 / Markdown 解析提取 | P0 | 普通模块 |
| 3 | **飞书消息推送**<br>提取摘要通过飞书渠道送达指定群聊 | Given 存在有效飞书目标（群聊 Webhook URL 或 Bot Token）<br>When 提取完成<br>Then 飞书消息包含"📋 本周 Lesson 升格建议"标题 + 提取的摘要内容（表格行保留 Markdown）或"本周无待终审升格建议"<br>And 消息不包含无关调试信息、不超出飞书消息体长度上限 | Feishu webhook / 消息 API 调用 | P0 | 普通模块 |
| 4 | **错误处理与静默降级**<br>任务异常时记录日志，不中断后续执行 | Given lessons:scan 执行失败（exit ≠ 0 或 stdout 为空）<br>When 任务完成<br>Then 跳过推送，在 OpenClaw-Bot 日志中记录 `[weekly-lesson-digest] scan failed: <原因>`<br>And 不影响下次定时触发 | 异常捕获、日志记录 | P0 | 普通模块 |

### P1（重要但可延后）

| # | 功能点 | 验收标准 | AI 可生成范围 | 优先级 |
|---|--------|---------|--------------|--------|
| 5 | **手动重试命令**<br>OpenClaw-Bot 支持通过消息命令（如 `/lesson-digest retry`）手动触发一次扫描并推送 | Given Bot 在线<br>When 用户发送 `/lesson-digest retry`<br>Then 立即执行一次完整的 lessons:scan + 提取 + 推送流程 | Bot 命令路由、按需执行 | P1 |
| 6 | **推送失败重试**<br>飞书推送失败时自动重试 1 次，间隔 30 秒 | Given 首次飞书推送返回非 2xx<br>When 30 秒后<br>Then 再次尝试推送<br>And 仍失败则写入日志 `[weekly-lesson-digest] push failed after retry: <错误>` | 重试逻辑 | P1 |

### P2（可行但不急需）

| # | 功能点 | 验收标准 | AI 可生成范围 | 优先级 |
|---|--------|---------|--------------|--------|
| 7 | **推送内容中附上前次扫描时间戳** | 消息末尾追加 `🕐 上次扫描：<datetime>` | 时间戳存储与展示 | P2 |

---

## 3. 显式不做（Out of Scope）

| 条目 | 理由 |
|------|------|
| 修改 `lessons:scan` 脚本自身逻辑 | lessons:scan 是只读脚本，任何输出格式变更或内容修改均不在本次需求内 |
| 自动合入升格建议 | 纪律要求「升格合入永远走人工蒸馏终审」，本任务仅为通知 |
| 全文摘要 / AI 摘要生成 | 只需提取原生「升格建议清单」节，不做 NLP 或 LLM 摘要处理 |
| 多飞书群分发 | 仅推送至一个目标飞书群聊，不支持群列表动态配置 |
| 历史记录持久化 | 不建数据库或文件持久化历史推送记录（P2 时间戳标记仅用内存/日志） |
| 其他 Lessons 章节提取 | 不提取状态看板、聚类报告、已升格参考等其他章节 |
| 跨平台兼容（非 Home 机） | 仅针对 Home 机 Windows + OpenClaw-Bot 环境 |

---

## 4. 验收口径

### 4.1 自测验收清单

**环境预检**（架构师实施前确认）：

- [ ] Home 机已安装 Node.js ≥ 18，`npm run lessons:scan` 在对应目录可正常执行
- [ ] OpenClaw-Bot 实例运行正常，Gateway 配置可访问
- [ ] 已确定飞书目标（Webhook URL 或 Bot Token + Chat ID）

**功能验收**（测试工程师 / 产品负责人执行）：

- [ ] **周一 09:00**：定时任务触发，lessons:scan 执行，推断无副作用
- [ ] **推送内容验证**：飞书群收到的消息包含"📋 本周 Lesson 升格建议"标题 + 正确的表格行 + 终审动作提示
- [ ] **无建议场景**：若 lessons:scan 输出不含「升格建议清单」节（或为空），飞书推送"本周无待终审升格建议"
- [ ] **失败场景**：模拟 `npm run lessons:scan` 返回非 0 退出码，检查 OpenClaw-Bot 日志包含错误记录
- [ ] **P1 手动重试**（若有实现）：消息命令 `retry` 触发扫描并推送成功

### 4.2 Definition of Done

- [ ] 定时任务代码已部署并在 Home 机生效
- [ ] 一个完整周期（周一 09:00 触发）的飞书推送验证通过，截图归档
- [ ] 代码合入 `code/` 仓库对应模块（建议 `scripts/` 或 `openclaw/` 子目录）
- [ ] 错误场景至少覆盖：npm 脚本失败、飞书推送失败
- [ ] 日志输出清晰可排查

---

## 5. 约束引用

### 5.1 项目纪律

| 约束 | 来源 / 引用 |
|------|------------|
| `lessons:scan` 只读——不修改扫描数据及其输出格式 | `scripts/lesson-scan.mjs` L1-L4 注释：只读、纪律、人工终审 |
| 升格合入永远走人工蒸馏终审 | `scripts/lesson-scan.mjs` L4；输出"升格建议清单"尾部 `终审动作：按 operations README` |
| 时间表达统一使用 Asia/Shanghai | 项目惯例 |
| 飞书凭据不得硬编码于代码仓库 | 项目安全策略；用环境变量 `LESSON_DIGEST_FEISHU_WEBHOOK` / `LESSON_DIGEST_FEISHU_BOT_TOKEN` 注入 |

### 5.2 技术约束

| 约束 | 说明 |
|------|------|
| OpenClaw-Bot 定时调度 | 使用 OpenClaw Gateway Cron 机制 或 Windows Task Scheduler + 触发脚本（取决于架构师评估），优先复用 Gateway 内置 cron |
| 飞书目标机制 | 优先使用飞书自定义机器人 Webhook（零 OAuth 维护），次选 Bot API（需 Token + 租户权限） |
| 日志 | 统一写入 OpenClaw-Bot 日志体系或 `stdout/stderr` 被 Gateway 托管 |
| 配置外部化 | 所有环境依赖（飞书目标、工作目录路径）通过环境变量加载，不可写死 |

### 5.3 技能引用

| 技能 | 用途 |
|------|------|
| `stage-gate-flow` | 本清单所在 H1 阶段门禁；推动 H2（设计）前须架构师签署 |
| `ai-code-boundary` | 本清单界定 AI 可生成范围：表 1-3 的「AI 生成级别」列来源 |

---

*本文档由 ProductManager 角色在 H1 阶段输出，提交 Architect 审核。*

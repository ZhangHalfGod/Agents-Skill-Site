# 01 — 需求说明

## 1. 用户与场景

| 角色 | 典型场景 | 期望结果 |
|------|----------|----------|
| 个人维护者 | 打开站点找「架构师该用哪些技能」 | 进入 Architect 页，看到标签 + 文档 + 说明书链接 |
| 联调工程师 | 查 NmosEngineer 验收步骤 | 打开角色说明书，跳到绑定 skills |
| 新人 | 不懂 L0/L1/L2 | 在 rules 区按层级浏览硬约束 |
| 未来扩展 | 按领域过滤 ptp-nmos | domains 导航可见（二期） |

## 2. 功能需求

### F1 — 外层导航（P0）

站点最外层固定分区：

```text
/                 首页（总览 + 快速入口）
/agents           岗位角色目录
/skills           技能目录（custom / external）
/rules            规则目录（L0 / L1 / L2）
/domains          领域增强（二期可先占位）
/operations       需求归档入口（二期可先占位）
```

### F2 — Agents 角色页（P0）

每个标准角色页必须包含：

1. **角色元信息**：序号、名称、一句话职责（对齐 `common/agents/README.md`）  
2. **技能标签（Skill Tags）**：从角色文档「绑定技能」解析或维护映射表  
3. **角色文档正文**：渲染 `standard/<Role>/<Role>.md`  
4. **相关文档链接**：同目录附属文档（如 Architect 的架构约束文档）  
5. **技能说明书链接**：跳转到 `/skills/<module>` 对应 `SKILL.md` 渲染页  

标准角色清单（一期必须覆盖）：

| 序号 | 角色 ID | 源路径 |
|:----:|---------|--------|
| 1 | ProductManager | `standards/common/agents/standard/ProductManager/` |
| 2 | Architect | `standards/common/agents/standard/Architect/` |
| 3 | DevLead | `standards/common/agents/standard/DevLead/` |
| 4 | TestEngineer | `standards/common/agents/standard/TestEngineer/` |
| 5 | SecurityEngineer | `standards/common/agents/standard/SecurityEngineer/` |
| 6 | OpsEngineer | `standards/common/agents/standard/OpsEngineer/` |
| 7 | UIDesigner | `standards/common/agents/standard/UIDesigner/` |
| 8 | NmosEngineer | `standards/common/agents/standard/NmosEngineer/` |

### F3 — Skills 技能页（P0）

- 列表页：编号索引（对齐 `common/skills/README.md` 1～11）  
- 详情页：渲染 `SKILL.md`，展示来源（自定义 / 外部导入）  
- 反向关联：哪些 Agent 绑定了该技能  

### F4 — Rules 规则页（P0）

- 按 L0 / L1 / L2 分层列表  
- 详情页渲染 `.mdc`（正文 Markdown + frontmatter 元数据展示）  
- 标明应用方式语义：Always Apply / Apply Intelligently 等（说明性，不模拟 Cursor）  

### F5 — 检索与编号协议（P1）

- 全文检索标题与摘要  
- 支持「使用角色 N」「使用技能 N」语义的快捷跳转（与 README 协议一致）  

### F6 — 内容同步（P1）

- 从 `standards/` 扫描生成站点索引（manifest JSON）  
- 校验：角色目录存在、SKILL.md 存在、URI 注册表一致  
- 失败时阻断发布（门禁），不静默丢链  

### F7 — 「运行」指引（P1，轻量）

网站**不执行模型**，但提供「运行说明书」：

- 复制可粘贴到 Cursor 的触发句（如：`@.../Architect.md` + 一句话激活）  
- 展示绑定 skills 的读取顺序建议  
- 可选：导出「本次任务上下文清单」Markdown  

## 3. 非功能需求

| 编号 | 类别 | 要求 |
|------|------|------|
| NFR-1 | 性能 | 本地打开首页 < 2s；角色页 Markdown 渲染可接受延迟 |
| NFR-2 | 可维护 | 增删角色/技能只需改 `standards` + 更新 URI 注册表 |
| NFR-3 | 安全 | 禁止展示硬编码密钥；operations 敏感日志默认不挂公网 |
| NFR-4 | 可追溯 | 每次内容发布记录 standards 提交哈希 / 扫描时间 |
| NFR-5 | 中文 | 站点 UI 与文档默认中文（对齐 L0 语言约束） |
| NFR-6 | 离线 | 一期优先本地静态站或本地服务，不依赖外网 CDN 关键路径 |

## 4. 验收口径（网站一期上线时）

| 项 | 通过标准 |
|----|----------|
| 外层分区 | 首页可进入 agents / skills / rules |
| 8 角色全覆盖 | 每个角色页可打开，正文非空 |
| 技能标签 | 每个角色至少展示其绑定技能标签（可点击跳转） |
| 说明书链接 | 标签跳转到对应 `/skills/...` 且 SKILL.md 可渲染 |
| URI 一致 | 站点路径与 `03-uri-registry.md` 一致，无 404 |
| 规则分层 | L0/L1/L2 可浏览，至少各有 1 条可打开 |

## 5. 范围裁剪

| 一期（MVP · 已验收） | 二期（进行中规划） | 三期 |
|---------------------|-------------------|------|
| common agents/skills/rules 浏览 | **Cursor + MCP 只读 manifest**（见 [`../phase2/00-cursor-mcp.md`](../phase2/00-cursor-mcp.md)） | operations 需求包浏览器（脱敏/内网） |
| Domains 灰度（ptp-nmos）+ 运行指引 | domains 扩域 / 检索增强 | 「运行」与 Cursor 更深集成 |
| manifest + validate 门禁 | 监听 standards 热更新（可选） | 多项目 standards 切换 |

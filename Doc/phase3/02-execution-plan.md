# 02 — 三期执行计划

> **文档级别**：三期执行（服从 S0）  
> **日期**：2026-07-14  
> **交接**：[`00-context.md`](00-context.md) · 范围 [`01-goals-and-scope.md`](01-goals-and-scope.md)  
> **纪律**：每步改代码前先勾选本节；实现笔记写到 `Code/doc/phase3/`

---

## 0. 推荐工作区

| 步骤 | 建议仓 |
|------|--------|
| 写三期文档 / 定模板 | 本仓上游 |
| 试跑 Lesson → 改 docs → generate | 本仓或 MacAir fork |
| 个人长期迭代 | MacAir fork；通用再 PR 上游 |
| 公司资产 | BMWork（部署后） |

新对话请先 `git remote -v` 确认身份。

---

## 1. 阶段总览

| 阶段 | 名称 | 产出 | 优先级 |
|:----:|------|------|:------:|
| **A** | operations + Lesson 模板 | 目录约定、卡片模板、示例 1 条 | P0 |
| **B** | 捕获挂钩 | stage-gate / PR 检查项；对话触发句 | P0 |
| **C** | 上下文预算落地 | Skill/Agent 分层约定；抽 1～2 个 skill 示范瘦身 | P1 |
| **D** | 蒸馏 SOP | 周/项目收尾清单；升格决策树可执行 | P1 |
| **E** | MCP 只读增强（可选） | `list_lessons` 或 `profile` 设计 + 实现 | P2 |
| **F** | 多 Profile 部署说明 | MacAir / BMWork 配置样例（可不立刻部署） | P2 |

---

## 2. 阶段 A — operations + Lesson（P0）

### 动作

1. 本仓 `Code/code/docs/operations/README.md`  
2. `_template/lessons/_lesson-card.template.md`（对齐 [`03`](03-lesson-card-and-operations.md)）  
3. 示例项目（如 `site-sot-inplace/`）+ 至少 1 条 lesson  
4. 更新 `Doc/phase1/03-uri-registry.md`：`/operations` 指向本仓 docs  
5. **本期可不挂公网**；本地可读即可

### 验收

- [x] 模板可复制生成 card  
- [x] 示例 lesson frontmatter 合法  
- [x] README 写清：禁止 raw 直接覆盖可复用正文  

> 落地：2026-07-14（外仓）→ **2026-07-16 迁入本仓** `Code/code/docs/operations/`  

---

## 3. 阶段 B — 捕获挂钩（P0）

### 动作

1. 在 `stage-gate-flow`（或 L1 stage-gate 说明）增加出门检查项：  
   - 本阶段 Lesson：已写 / 明确无  
2. 仓库 PR 模板（若有 `.github/PULL_REQUEST_TEMPLATE.md`）增加「可复用沉淀」一节  
3. 在角色运行指引或 Doc 中固定触发句：  
   - 「记一条 lesson：…」→ 按模板写到 `operations/<project>/lessons/`  

### 验收

- [ ] 触发句写进文档，新对话可复述  
- [ ] 门禁检查项可见（文档或 skill 补丁）  

---

## 4. 阶段 C — 上下文预算（P1）

### 动作

1. 落文档约定：见 [`04-context-budget.md`](04-context-budget.md)  
2. 选 **1 个 custom skill**（建议 `stage-gate-flow` 或即将大改的）示范：  
   - `SKILL.md` 压到可执行骨架  
   - 长文移 `docs/`  
3. Agent 说明书：确认主文件只留职责+流程；细则在 `docs/`（已有结构则只补约定）  

### 验收

- [ ] 约定成文  
- [ ] 至少一个 skill 示范合并进仓  
- [ ] MCP `get_skill` 仍只返回索引（行为不变）  

---

## 5. 阶段 D — 蒸馏 SOP（P1）

### 动作

1. 写收尾清单（可放 `operations/README.md` 或本目录附录）  
2. 明确 status 流转：`raw → distilled → merged | rejected`  
3. 升格时：改 `docs/skills|agents|rules` → 更新矩阵（若绑 Agent）→ `npm run generate` → validate  

### 验收

- [ ] 用 2～3 张假想/真实 card 走通一次纸面演练  
- [ ] 至少 1 次真实 merged（可很小：skill 多 3 条 checklist）  

---

## 6. 阶段 E — MCP 只读增强（P2，可选）

### 候选

| Tool / 参数 | 说明 |
|-------------|------|
| `list_lessons` | 读 operations 下 frontmatter 摘要（仍只读） |
| `profile` | 多 MANIFEST_URL / 多根目录切换（设计优先于实现） |

### 约束

- 不实现 write tool  
- 先写 `Doc/phase3/05-mcp-lessons-plan.md`（实现前新建）再改 `mcp-remote`  

### 验收

- [ ] 有计划文档  
- [ ] 若实现：health 仍绿；关闭不影响网站  

---

## 7. 阶段 F — 多 Profile 说明（P2）

### 动作

1. 文档化三套 Cursor MCP 条目样例：`upstream` / `macair` / `bmwork`  
2. BMWork：部署清单引用二期 `CURSOR-SETUP` + 独立 Token  
3. MacAir：优先本机 stdio + 本地 manifest，或私有 HTTP  

### 验收

- [ ] 样例 JSON 进仓（example，无真实 Token）  

---

## 8. 默认执行顺序（新对话照做）

```text
A → B → C → D →（可选）E/F
```

当前文档任务完成后，**下一代码动作从 A 开始**。

---

## 9. 完成定义（三期关门）

- [ ] A～D 验收勾选完成  
- [ ] 至少 1 个 skill 因 lesson 回灌而变更（Git 可追溯）  
- [ ] 上下文约定被至少一次真实任务遵守（对话中先 list/get 再 @ 正文）  
- [ ] CHANGELOG 记一笔三期里程碑  
- [ ] 若改 S0 优先级：追加 `SYSTEM-DIRECTION` §8  

---

## 10. 实现笔记

落地时在 [`../../Code/doc/phase3/`](../../Code/doc/phase3/README.md) 按日追加，勿把部署密钥写进 Doc。

# 02 — 架构设计

## 1. 总体架构

```text
┌─────────────────────────────────────────────────────────┐
│  浏览器（PC）                                            │
│  导航：Agents | Skills | Rules | (Domains) | (Ops)      │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP（只读为主）
┌───────────────────────────▼─────────────────────────────┐
│  Agents-Skill 运行站（未来工程，本阶段不创建）              │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ 静态页面/SSR │  │ 索引 API     │  │ 同步校验门禁    │  │
│  │ Markdown渲染 │  │ /api/catalog │  │ scan→validate  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────┘  │
│         │                 │                    │          │
│         └────────────┬────┴────────────────────┘          │
│                      ▼                                    │
│              manifest.json（生成物）                       │
└──────────────────────┬──────────────────────────────────┘
                       │ 只读挂载 / 构建时拷贝
┌──────────────────────▼──────────────────────────────────┐
│  Source of Truth：Agents_Skill/standards/                 │
│  common/agents | common/skills | common/rules | domains   │
└─────────────────────────────────────────────────────────┘
```

**关键约束**：网站是呈现与索引层；**禁止**把业务实例写回 `common/` 模板。

## 2. 内容模型

### 2.1 三层资产

| 层 | 职责 | 站点表现 |
|----|------|----------|
| Agents | 谁来做、协作边界 | 角色卡 + 标签 + 说明书 |
| Skills | 怎么做、步骤模板 | SKILL.md 详情 + 反向角色列表 |
| Rules | 必须/禁止、门禁 | L0/L1/L2 分层详情 |

### 2.2 Agent 内容对象

```yaml
AgentPage:
  id: Architect                    # 目录名
  index: 2                         # README 编号
  title: 架构师
  summary: 一句话职责
  source_dir: standards/common/agents/standard/Architect/
  primary_doc: Architect.md
  related_docs:
    - 架构约束与接口数据模型.md
  skill_tags:                      # 技能标签（可点击）
    - id: stage-gate-flow
      label: 瀑布/敏捷阶段门禁
      href: /skills/custom/common/stage-gate-flow
    - id: ai-code-boundary
      label: AI 生成边界
      href: /skills/custom/common/ai-code-boundary
  run_hint:                        # 「运行」指引（非执行）
    cursor_at: "@standards/common/agents/standard/Architect/Architect.md"
    activation: "以架构师身份……"
```

### 2.3 Skill / Rule 对象（摘要）

- **Skill**：`id`、`index`、`origin(custom|external)`、`path`、`bound_agents[]`  
- **Rule**：`id`、`level(L0|L1|L2)`、`path`、`alwaysApply`、`summary`

## 3. 站点信息架构（外层目录）

```text
site/
  agents/
    index                  # 角色编号墙
    standard/
      ProductManager/
      Architect/
      DevLead/
      TestEngineer/
      SecurityEngineer/
      OpsEngineer/
      UIDesigner/
      NmosEngineer/
    domains/               # 二期
      <domain>/<role>/
  skills/
    index                  # 编号 1～11
    custom/common/<module>/
    external/<module>/
    domains/<domain>/<module>/   # 二期
  rules/
    index
    L0/<rule>/
    L1/<rule>/
    L2/<rule>/
    domains/<domain>/      # 二期
```

URI 细节见 [03-uri-registry.md](03-uri-registry.md)。

## 4. 技术选型建议（待立项时确认）

> 本阶段不定死栈，给出推荐与备选，立项时二选一。

| 方案 | 优点 | 风险 | 建议 |
|------|------|------|------|
| **A. 静态站点生成（SSG）** VitePress / Astro + MD | 简单、离线友好、与 Markdown 天然契合 | 动态检索弱 | **一期首选** |
| **B. Next.js / Nuxt 半静态** | API + 检索好扩展 | 复杂度高 | 二期若要强检索再上 |
| **C. 纯静态 HTML 手写** | 零依赖 | 维护成本高 | 不推荐 |

**一期推荐路径**：

1. 用脚本扫描 `standards/` → 生成 `manifest.json` + 侧栏数据  
2. SSG 渲染 Markdown / `.mdc`  
3. 本地 `npm run dev` 预览；可选 Nginx 静态托管  

对齐 LUT/控制面经验：**轮询/构建时扫描即可，不必上 WebSocket**；HTTP 只做目录与文档 RPC。

## 5. 同步与门禁状态机

```text
IDLE → SCAN → VALIDATE → BUILD → PUBLISH → IDLE
              │
              └─ FAIL → REPORT（阻断，不发布）
```

VALIDATE 检查项：

1. `03-uri-registry.md` 中每个 P0 URI 在源树有对应文件  
2. 角色页 skill_tags 指向的 skill 目录存在 `SKILL.md`  
3. agents/skills README 编号与 manifest 一致  

## 6. 与 OpenClaw / Cursor 的边界

| 组件 | 本站 | Cursor / 执行引擎 |
|------|------|-------------------|
| 治理资产浏览 | ✅ | 间接（@ 文件） |
| 模型推理执行 | ❌ | ✅ |
| 规则强制注入 | 仅说明 | Cursor Rules 生效 |
| 证据归档 | 可链到 operations | 实际写文件在仓库 |

组合建议（来自 standards README）：本站 = 治理层可视化；Cursor = 执行层。

## 7. 安全与脱敏

- 不渲染含密钥的样例；若 operations 挂载，默认仅本地  
- 对外演示包只含 `common/` 公开模板  
- 遵守 L0：中文输出、禁止后门与绕过鉴权逻辑（站点本身无鉴权绕过需求）

## 8. 目录落地（未来工程，非本阶段）

建议未来网站工程放在：

```text
Agents_Skill/
  All_URI/
    Doc/                   # 工程规划（已有）
    Code/
      doc/                 # 实现期技术跟踪（已有）
      code/                # SSG 工程根（阶段 1）
        package.json
        scripts/scan-standards.mjs
        public/manifest.json
```

立项已启动；路径以 `Code/code/` 为准（见 S0 决策 2026-07-10-03）。

# 05 — 标准角色 ↔ 技能标签 ↔ 说明书链接矩阵

> **权威约定**：角色文档里的历史技能别名，统一映射到当前 `standards/common/skills` 目录 ID。  
> 网站一期以**本矩阵**生成 Agent 页的 Skill Tags，避免因文档别名导致死链。

## 1. 别名 → 目录 ID 对照

| 角色文档中的写法 | 规范目录 ID | 站点 URI | skills 序号 |
|------------------|-------------|---------|:----------:|
| AI 生成代码边界约束（ai-code-boundary） | `ai-code-boundary` | `/skills/custom/common/ai-code-boundary` | 1 |
| 全流程可追溯与合规（ai-code-traceability） | `traceability-compliance` | `/skills/custom/common/traceability-compliance` | 2 |
| Prompt 工程化规范（prompt-engineering） | `prompt-versioning` | `/skills/custom/common/prompt-versioning` | 3 |
| 软件工程 - 瀑布 / 敏捷流程适配（se-waterfall-agile） | `stage-gate-flow` | `/skills/custom/common/stage-gate-flow` | 4 |
| （推荐）文档协作 | `doc-coauthoring` | `/skills/external/doc-coauthoring` | 5 |
| （推荐）MCP 构建 | `mcp-builder` | `/skills/external/mcp-builder` | 6 |
| （推荐）前端设计 | `frontend-design` | `/skills/external/frontend-design` | 7 |
| （推荐）Web 测试 | `webapp-testing` | `/skills/external/webapp-testing` | 8 |
| （领域）ptp-nmos 运维类 | domains 下技能 | `/skills/domains/ptp-nmos/...` | 二期 |

## 2. 标准角色矩阵（一期 P0）

| 序号 | 角色 ID | 技能标签（规范 ID） | 来源 | 角色说明书 | 技能说明书链接 |
|:----:|---------|---------------------|------|------------|----------------|
| 1 | ProductManager | `stage-gate-flow`, `ai-code-boundary` | 角色文档「绑定技能」 | `/agents/standard/ProductManager` | 序号 4、1 |
| 2 | Architect | `stage-gate-flow`, `ai-code-boundary`, `traceability-compliance` | 角色文档 | `/agents/standard/Architect` | 4、1、2 |
| 3 | DevLead | `stage-gate-flow`, `prompt-versioning`, `traceability-compliance` | 角色文档 | `/agents/standard/DevLead` | 4、3、2 |
| 4 | TestEngineer | `stage-gate-flow`, `traceability-compliance` | 角色文档 | `/agents/standard/TestEngineer` | 4、2 |
| 4+ | TestEngineer | `webapp-testing`（推荐标签） | 矩阵增强 | 同上 | 8 |
| 5 | SecurityEngineer | `traceability-compliance` | 角色文档 | `/agents/standard/SecurityEngineer` | 2 |
| 5+ | SecurityEngineer | `ai-code-boundary`（推荐） | 矩阵增强 | 同上 | 1 |
| 6 | OpsEngineer | `traceability-compliance` | 角色文档 | `/agents/standard/OpsEngineer` | 2 |
| 6+ | OpsEngineer | `stage-gate-flow`（推荐） | 矩阵增强 | 同上 | 4 |
| 7 | UIDesigner | `frontend-design`, `doc-coauthoring`（推荐） | 文档无显式绑定技能节，矩阵补齐 | `/agents/standard/UIDesigner` | 7、5 |
| 7+ | UIDesigner | `ai-code-boundary`（推荐） | 与设计边界相关 | 同上 | 1 |
| 8 | NmosEngineer | `stage-gate-flow`, `traceability-compliance`（推荐） | 文档指向旧 modules 路径，矩阵重锚 | `/agents/standard/NmosEngineer` | 4、2 |
| 8+ | NmosEngineer | domains `ptp-nmos` 技能（二期） | 领域增强 | 同上 | 二期 URI |

### 标签展示规则

1. **必显**：上表「来源 = 角色文档」的标签  
2. **可选显**：标注「推荐」的标签（UI 用次级样式）  
3. 点击标签 → 打开对应技能说明书页（`SKILL.md`）  
4. 角色页另提供「相关文档」区，链到同目录附属 md（见 URI 注册表）

## 3. 反向索引：技能 → 角色

| 技能 ID | 主要绑定角色（必显） | 推荐关联角色 |
|---------|----------------------|--------------|
| ai-code-boundary | ProductManager, Architect | SecurityEngineer, UIDesigner |
| traceability-compliance | Architect, DevLead, TestEngineer, SecurityEngineer, OpsEngineer | NmosEngineer |
| prompt-versioning | DevLead | Architect |
| stage-gate-flow | ProductManager, Architect, DevLead, TestEngineer | OpsEngineer, NmosEngineer |
| doc-coauthoring | — | ProductManager, UIDesigner, Architect |
| frontend-design | — | UIDesigner |
| webapp-testing | — | TestEngineer, UIDesigner |
| mcp-builder | — | （domains/mcp 角色，二期） |
| skill-creator | — | 标准库维护者（非角色页，可放首页） |
| Human | — | 全角色可选（文案质检） |
| web-artifacts-builder | — | UIDesigner（复杂产物时） |

## 4. 角色页「运行说明书」字段模板

每个 Agent 页底部固定区块（网站实现时用）：

```markdown
## 在 Cursor 中运行本角色

1. @ 引用：`standards/common/agents/standard/<Role>/<Role>.md`
2. （可选）再 @ 绑定技能的 SKILL.md，或说「使用技能 <序号>」并 @ skills README
3. 粘贴角色文档中的「一句话激活」（若有）
4. 按角色工作流程产出；涉及核心模块时遵守 L0 红色记录
```

示例（Architect）：

| 字段 | 值 |
|------|-----|
| cursor_at | `@standards/common/agents/standard/Architect/Architect.md` |
| skills_order | `stage-gate-flow` → `ai-code-boundary` → `traceability-compliance` |
| activation | 以架构师身份，基于当前范围清单给出分层与接口契约…… |

## 5. 已知缺口（阶段 0 登记，后续治理）

| 缺口 | 影响 | 建议处理阶段 |
|------|------|--------------|
| 角色文档技能别名与目录 ID 不一致 | 自动解析易错 | 阶段 2 用本矩阵；阶段 7 回灌改角色文档 |
| NmosEngineer 仍写 `common/skills/modules/...` | 旧路径失效 | 二期改链到 domains/ptp-nmos 或更新角色文档 |
| UIDesigner 无「绑定技能」节 | 标签需矩阵补齐 | 阶段 2 用推荐标签；后续补文档节 |
| 领域技能未进一期矩阵 | domains 不可点 | 阶段 5 |

## 6. 维护 SOP

1. 新增技能：先入 `standards/common/skills` + skills README 编号 → 更新 `03-uri-registry` → 更新本矩阵  
2. 新增角色：先入 `standard/<Role>/` + agents README 编号 → 更新 URI 与本矩阵  
3. 改绑定关系：优先改本矩阵（网站立即生效），再回头改角色 md「绑定技能」节保持一致  

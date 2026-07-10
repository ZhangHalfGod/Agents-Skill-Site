# 03 — 全站 URI / 目录注册表

> 约定：站点路径以 `/` 开头；源路径相对 `Agents_Skill/`。  
> 状态：`planned` = 已设计未实现；`ready` = 源文件已存在可挂载。

## 1. 外层分区

| 站点 URI | 名称 | 源锚点 | 优先级 | 状态 |
|----------|------|--------|:------:|:----:|
| `/` | 首页总览 | `All_URI/README.md`（说明）+ standards 摘要 | P0 | planned |
| `/agents` | Agents 目录 | `standards/common/agents/README.md` | P0 | ready* |
| `/skills` | Skills 目录 | `standards/common/skills/README.md` | P0 | ready* |
| `/rules` | Rules 目录 | `standards/common/rules/README.md` | P0 | ready* |
| `/domains` | 领域增强 | `standards/domains/README.md` | P2 | ready* |
| `/operations` | 需求归档 | `standards/operations/README.md` | P2 | ready* |

\* 源文件 ready，站点页 planned。

## 2. Agents — 标准治理团队

| 站点 URI | 角色 | 主文档源路径 | 附属文档（同目录） |
|----------|------|--------------|-------------------|
| `/agents/standard` | 标准团队索引 | `standards/common/agents/README.md` | — |
| `/agents/standard/ProductManager` | 产品经理 | `.../ProductManager/ProductManager.md` | `AI代码生成范围清单.md` |
| `/agents/standard/Architect` | 架构师 | `.../Architect/Architect.md` | `架构约束与接口数据模型.md` |
| `/agents/standard/DevLead` | 开发负责人 | `.../DevLead/DevLead.md` | `reference-notes.md` |
| `/agents/standard/TestEngineer` | 测试工程师 | `.../TestEngineer/TestEngineer.md` | `AI代码测试报告.md` |
| `/agents/standard/SecurityEngineer` | 安全工程师 | `.../SecurityEngineer/SecurityEngineer.md` | `AI代码安全报告.md` |
| `/agents/standard/OpsEngineer` | 运维工程师 | `.../OpsEngineer/OpsEngineer.md` | `版本映射与发布说明.md` |
| `/agents/standard/UIDesigner` | UI 设计师 | `.../UIDesigner/UIDesigner.md` | — |
| `/agents/standard/NmosEngineer` | NMOS 工程师 | `.../NmosEngineer/NmosEngineer.md` | — |

完整源前缀：`standards/common/agents/standard/`。

### 附属文档 URI 约定

```text
/agents/standard/<Role>/docs/<slug>
```

示例：

| 站点 URI | 源文件 |
|----------|--------|
| `/agents/standard/Architect/docs/architecture-constraints` | `Architect/架构约束与接口数据模型.md` |
| `/agents/standard/ProductManager/docs/ai-codegen-scope` | `ProductManager/AI代码生成范围清单.md` |
| `/agents/standard/DevLead/docs/reference-notes` | `DevLead/reference-notes.md` |
| `/agents/standard/TestEngineer/docs/ai-test-report` | `TestEngineer/AI代码测试报告.md` |
| `/agents/standard/SecurityEngineer/docs/ai-security-report` | `SecurityEngineer/AI代码安全报告.md` |
| `/agents/standard/OpsEngineer/docs/version-release` | `OpsEngineer/版本映射与发布说明.md` |

## 3. Agents — 领域角色（二期）

| 站点 URI | 源路径 |
|----------|--------|
| `/agents/domains/mcp/McpArchitect` | `standards/domains/mcp/agents/McpArchitect.md` |
| `/agents/domains/ai-dialog/DialogueArchitect` | `standards/domains/ai-dialog/agents/DialogueArchitect.md` |
| `/agents/domains/ptp-nmos/RealtimePtpEngineer` | `standards/domains/ptp-nmos/agents/` |
| `/agents/domains/ptp-nmos/NmosEngineer` | `standards/domains/ptp-nmos/agents/` |
| `/agents/domains/high-concurrency/HighConcurrencyEngineer` | `standards/domains/high-concurrency/agents/` |
| `/agents/domains/high-concurrency/ObservabilityEngineer` | `standards/domains/high-concurrency/agents/` |

> 二期扫描时以实际文件名为准，更新本表。

## 4. Skills — common 编号 1～11

| 序号 | 站点 URI | 源路径 |
|:----:|----------|--------|
| 1 | `/skills/custom/common/ai-code-boundary` | `standards/common/skills/custom/common/ai-code-boundary/SKILL.md` |
| 2 | `/skills/custom/common/traceability-compliance` | `standards/common/skills/custom/common/traceability-compliance/SKILL.md` |
| 3 | `/skills/custom/common/prompt-versioning` | `standards/common/skills/custom/common/prompt-versioning/SKILL.md` |
| 4 | `/skills/custom/common/stage-gate-flow` | `standards/common/skills/custom/common/stage-gate-flow/SKILL.md` |
| 5 | `/skills/external/doc-coauthoring` | `standards/common/skills/external/doc-coauthoring/SKILL.md` |
| 6 | `/skills/external/mcp-builder` | `standards/common/skills/external/mcp-builder/SKILL.md` |
| 7 | `/skills/external/frontend-design` | `standards/common/skills/external/frontend-design/SKILL.md` |
| 8 | `/skills/external/webapp-testing` | `standards/common/skills/external/webapp-testing/SKILL.md` |
| 9 | `/skills/external/web-artifacts-builder` | `standards/common/skills/external/web-artifacts-builder/SKILL.md` |
| 10 | `/skills/external/skill-creator` | `standards/common/skills/external/skill-creator/SKILL.md` |
| 11 | `/skills/external/Human` | `standards/common/skills/external/Human/SKILL.md` |

索引页：`/skills` ← `standards/common/skills/README.md`

## 5. Rules — L0 / L1 / L2

| 站点 URI 模式 | 源路径模式 |
|---------------|------------|
| `/rules` | `standards/common/rules/README.md` |
| `/rules/L0/<name>` | `standards/common/rules/L0/<name>.mdc` |
| `/rules/L1/<name>` | `standards/common/rules/L1/<name>.mdc` |
| `/rules/L2/<name>` | `standards/common/rules/L2/<name>.mdc` |
| `/rules/domains/<domain>/<name>` | `standards/domains/<domain>/rules/...`（二期） |

> 具体 `<name>` 以扫描 `standards/common/rules/**/*.mdc` 结果写入 manifest；本表只定模式。

## 6. API（未来工程，可选）

| 方法 | URI | 说明 |
|------|-----|------|
| GET | `/api/catalog` | 返回 manifest 全量索引 |
| GET | `/api/agents/:id` | 单角色元数据 + skill_tags |
| GET | `/api/skills/:id` | 单技能元数据 + bound_agents |
| GET | `/api/health`（二期）或站点 `/health/` | 扫描时间、contentHash、校验状态（一期静态页） |

对齐控制面经验：`/health` 可观测；构建期生成即可，运行时不必强依赖。

## 7. 快捷协议映射（编号跳转）

| 用户意图 | 站点行为 |
|----------|----------|
| 使用角色 2 | 跳转 `/agents/standard/Architect` |
| 使用技能 1 | 跳转 `/skills/custom/common/ai-code-boundary` |
| 使用角色 1,3 | 打开对比页或依次列出（二期） |

## 8. 变更规则

1. 新增角色/技能/规则：**先改 standards 源文件**，再更新本注册表，最后改站点路由。  
2. 禁止站点私自发明与源树不一致的路径。  
3. 中文文件名保留在源树；站点可用英文 slug，但必须在本表双向登记。  

# Rules

Cursor Rules 分层浏览（对齐 `standards/common/rules/`）。源文件为 `.mdc`，本站只读呈现。

### L0（硬约束）

| 规则 | 主题 | alwaysApply |
|------|------|:-----------:|
| [01-language-and-safety](/rules/L0/01-language-and-safety/) | 语言与安全 | 是 |
| [02-core-boundary](/rules/L0/02-core-boundary/) | 核心边界 | 是 |
| [03-traceability](/rules/L0/03-traceability/) | 可追溯性 | 是 |

### L1（流程与协作）

| 规则 | 主题 | alwaysApply |
|------|------|:-----------:|
| [01-stage-gate](/rules/L1/01-stage-gate/) | 六阶段门禁 | — |
| [02-prompt-review](/rules/L1/02-prompt-review/) | Prompt 评审 | — |
| [03-batch-and-cr](/rules/L1/03-batch-and-cr/) | 批量与 CR | — |

### L2（场景最低限度）

| 规则 | 主题 | alwaysApply |
|------|------|:-----------:|
| [concurrency-minimum-capacity](/rules/L2/concurrency-minimum-capacity/) | 并发与容量基线 | — |
| [dialog-minimum-safety](/rules/L2/dialog-minimum-safety/) | 对话最低安全 | — |
| [mcp-minimum-contract](/rules/L2/mcp-minimum-contract/) | MCP 最低契约 | — |
| [ptp-nmos-minimum-ops](/rules/L2/ptp-nmos-minimum-ops/) | PTP/NMOS 最低运维 | 是 |


领域规则（`domains/`）二期灰度。在 Cursor 中可 `@` 对应 `.mdc`。

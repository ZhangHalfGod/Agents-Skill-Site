# mechassist-openapi

> 四期 4B 端到端首跑：飞书需求 → OpenClaw 文档跳（pm/arch · pro）→ Cursor CLI 代码跳 → 独立验收（2026-07-30）。

| 项 | 值 |
|----|-----|
| 项目来源 | 用户飞书提需求：extern-api registry → 标准 OpenAPI 3.0 |
| 业务仓 | `D:\trae_git\MechAssist-Fusion`（子项目 `extern-api/`） |
| 证据 | `Code/doc/phase4/e2e-openapi/`（H1/H2 交付物、信封、Goal、原始输出） |
| 执行面 | 文档跳 = bm 机 OpenClaw 命名 agent（机制 A，Cursor 侧按契约驱动）；代码跳 = `invoke-cursor-agent.ps1`（机制 B） |
| 结论 | 首跑通过：验收三条（端点 200/3.0.3/28 路径、快照、存量不红 43/1）全部独立复核 ✅；main 自编排未验证（搁置） |

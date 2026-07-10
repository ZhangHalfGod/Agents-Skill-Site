---
title: "ptp-nmos · ptp-cutover-rollback-gate"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
同步自领域规则 `.mdc`：`standards/domains/ptp-nmos/rules/ptp-cutover-rollback-gate.mdc`。
:::

# ptp-nmos · ptp-cutover-rollback-gate

1. 任意时钟相关线上变更必须具备可执行回退方案，且在上线前完成演练。
2. 灰度放量必须分阶段执行，并定义每阶段通过/暂停/回退阈值。
3. 未完成 GM 切换与链路恢复验证，不得进行全量放量。
4. 变更结果需输出“版本-参数-证据-结论”映射，确保审计可追溯。


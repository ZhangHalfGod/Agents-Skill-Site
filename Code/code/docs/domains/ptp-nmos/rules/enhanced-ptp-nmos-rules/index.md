---
title: "ptp-nmos · enhanced-ptp-nmos-rules"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
同步自领域规则 `.mdc`：`standards/domains/ptp-nmos/rules/enhanced-ptp-nmos-rules.mdc`。
:::

# ptp-nmos · enhanced-ptp-nmos-rules

1. 涉及时钟参数变更时，必须记录变更前后收敛、偏移与抖动对比，并附 `Spec Ref` 与证据。
2. 多设备同步场景必须包含主备切换与故障恢复验证，未通过不得放行。
3. 迁移策略必须保留“一键回退”路径，并在灰度窗口验证可执行性。
4. 跨厂商联调必须完成 IS-04/05 互通回归，失败项必须给出阻断或豁免结论。
5. 上线结论必须可追溯到知识资产与规范锚点（knowledge + Spec Ref）。
6. 每个模块功能结论必须包含最小字段：`结论`、`现场证据`、`Spec Ref`、`Impl Ref`、`失败回退动作`。
7. 涉及 NMOS API 联调时，必须核验路径版本、尾斜杠行为和错误响应结构一致性。
8. `Spec Ref` 必须能在 `knowledge/spec-ref-index.md` 找到；找不到则视为门禁失败。


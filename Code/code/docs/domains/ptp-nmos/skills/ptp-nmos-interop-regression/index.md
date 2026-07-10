---
title: "ptp-nmos-interop-regression"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
本页由 `npm run sync` 从 `standards/domains/ptp-nmos/skills/ptp-nmos-interop-regression/SKILL.md` 同步生成，**请勿手改**。本站不执行模型推理。
:::

# ptp-nmos-interop-regression

## 适用场景
- 跨厂商联调、设备替换、版本升级前后对比。
- 上线前放行评估或故障后互通回归复验。
- 新增能力（如音频映射）引入后的一致性核查。

## 必读参考
1. `standards/domains/ptp-nmos/README.md`
2. `standards/domains/ptp-nmos/knowledge/interop/nmos-is0405-aes67-st2110-checklist.md`
3. `standards/domains/ptp-nmos/knowledge/interop/nmos-bm-node-regression-matrix-template.md`
4. `Important/04-NMOS/README.md`
5. `Important/03-PTP/README.md`

## 输入约定
- 设备能力矩阵与版本清单（厂商、固件、协议能力）。
- 互通检查清单与历史缺陷基线。
- 验收阈值：功能通过率、关键指标阈值、阻断条件。
- 测试窗口与回退窗口信息。

## 执行流程
1. **IS-04 验证**：资源发现、注册状态、查询一致性。
2. **IS-05 验证**：staged/active 状态机、建连/断连与参数变更链。
3. **IS-08 验证**（如适用）：音频映射行为与期望一致。
4. **媒体面验证**：AES67/ST2110 参数、时序与业务指标。
5. **PTP 稳定性验证**：切换与恢复窗口内的时钟收敛与业务连续性。
6. **API 一致性验证**：路径版本、尾斜杠、错误响应模型。
7. **结论判定**：失败项逐条给出阻断/豁免/限流放行结论。

## Spec/Impl 锚点（输出必填）
- Spec Ref: AMWA_IS_04-Discovery-资源发现
- Spec Ref: AMWA_IS_05-ConnectionManagement-连接管理
- Spec Ref: AMWA_IS_08-AudioMapping-音频映射（如适用）
- Spec Ref: AMWA_IS_04-APIs-PathVersionAndContentType
- Spec Ref: AMWA_IS_04-APIs-TrailingSlashBehaviour
- Spec Ref: AMWA_IS_04-APIs-ErrorResponseModel
- Spec Ref: AES67_ST2110-媒体参数与时序约束
- Spec Ref: Huawei-PTP管理消息-运维查询与状态核验
- Impl Ref: `standards/domains/ptp-nmos/knowledge/interop/*`
- Impl Ref: `Important/04-NMOS/*`、`Important/03-PTP/*`

## 输出模板
```md
### 回归范围
- 设备矩阵：
- 版本范围：
- 覆盖能力：

### 执行结果总览
- IS-04：
- IS-05：
- IS-08（如适用）：
- 媒体面与PTP：
- API 一致性：

### 失败项归因
- 失败项：
- 根因：
- 影响评估：
- 处置建议（阻断/豁免）：

### 放行建议
- 放行结论：
- 限制条件：
- 回退策略：
```

## 最低验收标准
- 核心路径全部通过或已形成明确的阻断/豁免决策。
- 每个失败项都有证据链、根因与处置建议。
- 回归报告可直接用于评审与上线门禁。


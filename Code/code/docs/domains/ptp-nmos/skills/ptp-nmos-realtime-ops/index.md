---
title: "ptp-nmos-realtime-ops"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
本页由 `npm run sync` 从 `standards/domains/ptp-nmos/skills/ptp-nmos-realtime-ops/SKILL.md` 同步生成，**请勿手改**。本站不执行模型推理。
:::

# ptp-nmos-realtime-ops

## 适用场景
- PTP domain/profile/delay mechanism/log interval 变更。
- NMOS IS-04/05/09 参数调整、注册发现异常、连接状态漂移。
- 联调窗口、灰度上线窗口、跨厂商联合值守。

## 目标
- 把“时钟面 + 控制面”运维动作固化为可复用流程。
- 每次操作都输出可审计证据：前置基线、过程记录、结果判定、回退方案。

## 读取顺序（先读再执行）
1. `standards/domains/ptp-nmos/README.md`
2. `standards/domains/ptp-nmos/knowledge/environment/ptp-nmos-environment-baseline.md`
3. `Important/03-PTP/README.md`
4. `Important/04-NMOS/README.md`

## 输入约定
- 当前配置快照：domain、profile、delay mechanism、log interval、关键 settings。
- 目标指标：offset、jitter、锁定时间、切换恢复时间。
- 设备矩阵：厂商/版本/能力差异（跨厂商场景必填）。
- 变更窗口：执行时间、观察窗口、回退触发条件。

## 执行流程
1. **建立基线**：采集变更前 offset/jitter、告警、主备状态、连接状态。
2. **校验前置条件**：对照环境基线确认网络、时钟源、QoS、组播前提。
3. **执行分阶段验证**：锁定 -> 收敛 -> 切换 -> 恢复，逐阶段留证据。
4. **校验 NMOS 侧一致性**：检查 IS-04 资源与 IS-05 staged/active 变更链，必要时补 IS-09 参数联动证据。
5. **输出灰度与回退**：明确放量节奏、观察指标、阻断阈值与一键回退动作。

## Spec/Impl 锚点（输出必填）
- Spec Ref: IEEE1588-BMCA-主时钟重选与状态切换
- Spec Ref: Huawei-PTP报文通用格式-Announce_Sync_FollowUp_Delay_*_Pdelay*
- Spec Ref: Huawei-PTP管理消息-Management消息与运维控制
- Spec Ref: AMWA_IS_04_IS_05-发现与连接一致性
- Spec Ref: AMWA_IS_09-SystemParameters-系统参数一致性
- Impl Ref: `standards/domains/ptp-nmos/knowledge/*`
- Impl Ref: `Important/03-PTP/*`、`Important/04-NMOS/*`

## 输出模板（直接复用）
```md
### 变更项
- 变更内容：
- 影响范围：

### 基线与结果
- 变更前指标：
- 变更后指标：
- 差异判断：

### 证据链
- 日志：
- 抓包/API 响应：
- 配置快照：

### 规范映射
- Spec Ref:
- Impl Ref:

### 灰度与回退
- 灰度步骤：
- 回退触发条件：
- 回退动作：
```

## 最低验收标准
- 关键指标达到目标阈值。
- 回退路径可执行且触发条件明确。
- 证据链完整并可追溯到 Spec Ref 与 Impl Ref。


---
title: "ptp-lock-drift-troubleshooting"
description: 本仓 docs 真源；直接编辑本页后 npm run generate
---

# ptp-lock-drift-troubleshooting

## 适用场景
- 失锁、频繁重收敛、offset/jitter 异常增大。
- GM 切换后长时间不稳定或业务指标抖动。
- 现场“偶发但高影响”时钟异常，需要沉淀复盘证据。

## 必读参考
1. `Important/03-PTP/README.md`
2. `Important/03-PTP/ptpd/ptpd_init函数解析/ptpd目录文件分工与四主线映射.md`
3. `Important/03-PTP/docs/BmServer-PTP模块实现逻辑与过程.md`
4. `standards/domains/ptp-nmos/knowledge/pitfalls/ptp-nmos-pitfalls.md`

## 输入约定
- 抓包样本：Announce/Sync/Follow_Up/Delay_*（必要时含 Pdelay_*）。
- 故障时间窗日志：失锁前、中、后至少各一段。
- 参数快照：domain、profile、delay mechanism、主备策略与关键阈值。
- 业务侧指标：丢帧、抖动、恢复时长（如有）。

## 排障流程（强制顺序）
1. **分层判因**：先判报文链路，再判状态机，再判伺服参数，避免一上来改参数。
2. **一致性检查**：核对 domain/profile/delay mechanism 与设备能力矩阵。
3. **状态机回放**：结合日志与抓包重建 GM 切换窗口时间线。
4. **实现链路对照**：按 `ptpd.c -> protocol.c -> dep/*` 映射确认故障落点。
5. **修复与预防**：给出最小修复动作、验证步骤、复发预防措施。

## Spec/Impl 锚点（输出必填）
- Spec Ref: IEEE1588-PortStateMachine-状态转换规则
- Spec Ref: Huawei-PTP报文通用格式-关键报文用途与顺序
- Spec Ref: SMPTE_ST_2059-Failover-广播级稳定性要求
- Impl Ref: `Important/03-PTP/docs/BmServer-PTP模块实现逻辑与过程.md`
- Impl Ref: `Important/03-PTP/ptpd/ptpd_init函数解析/ptpd目录文件分工与四主线映射.md`

## 输出模板
```md
### 故障概览
- 现象：
- 影响范围：
- 首次发现时间：

### 根因分析
- 报文链路结论：
- 状态机结论：
- 伺服参数结论：

### 证据链
- 抓包证据：
- 日志证据：
- 参数快照：

### 修复与验证
- 修复动作：
- 回归步骤：
- 回归结果：

### 预防动作
- 监控项新增/调整：
- 阈值与告警策略：
- 文档/坑位库更新：
```

## 最低验收标准
- 问题能稳定复现并被修复。
- 修复后通过回归验证，且无新增高风险副作用。
- 预防动作可执行并已纳入运维/测试闭环。


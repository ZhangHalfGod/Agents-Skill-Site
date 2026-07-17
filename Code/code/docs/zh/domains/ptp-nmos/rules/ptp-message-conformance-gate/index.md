---
title: "ptp-nmos · ptp-message-conformance-gate"
description: 本仓 docs 真源；直接编辑本页后 npm run generate
---

# ptp-nmos · ptp-message-conformance-gate

1. 进入联调与上线前，必须核验关键报文链完整性：Announce、Sync、Follow_Up、Delay_Req、Delay_Resp（按场景补 Pdelay*）。
2. 报文核验记录必须标注 `Spec Ref`（来源、报文类型、要点）与抓包证据。
3. 发现报文链断裂、顺序异常或参数不一致时，必须阻断上线并触发排障流程。
4. 涉及 Signaling 或 Management 消息的场景，必须保留管理面查询与操作审计记录。


---
title: "参考笔记"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
本页由 `npm run sync` 从 `standards/common/agents/standard/DevLead/reference-notes.md` 同步生成，**请勿手改**。本站不执行模型推理。
:::

# 参考笔记

本文件汇总标准包设计时参考的公开资料，作为模板结构依据，不替代项目内规范。
具体项目的联调策略、CR 检查点、风险点与回滚方案请写入：
`standards/operations/requests/<year>/<REQ-ID>/03-devlead-notes.md`

## MCP 工具契约
- MCP Tools 规范（tools/list、tools/call、input schema）
  - https://modelcontextprotocol.info/specification/2024-11-05/server/tools
- MCP Schema 参考
  - https://modelcontextprotocol.io/specification/draft/schema

## AI 对话编排
- 多智能体编排与路由实践参考
  - https://rasa.com/guides/the-enterprise-guide-to-ai-agent-orchestration
- 上下文管理实践综述
  - https://www.ai-agentsplus.com/blog/ai-context-window-management-techniques-2026-03-19

## PTP 运维与迁移
- Red Hat ptp4l 配置文档
  - https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/system_administrators_guide/ch-Configuring_PTP_Using_ptp4l
- linuxptp phc2sys 文档
  - https://linuxptp.nwtime.org/documentation/phc2sys/
- ptpd 实战笔记（博客）
  - https://www.cnblogs.com/dongc/p/12896527.html
- IBM AIX ptpd 守护程序文档
  - https://www.ibm.com/docs/zh/aix/7.3.0?topic=p-ptpd-daemon

## 高并发容量治理
- 限流、背压、熔断实践
  - https://dev.to/psavelis/rate-limiting-backpressure-circuit-breakers-the-resilience-arsenal-every-senior-backend-team-31j6
- 负载削峰与准入控制
  - https://oneuptime.com/blog/post/2026-01-30-build-load-shedding-strategies/view


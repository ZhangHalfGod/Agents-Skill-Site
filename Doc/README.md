# Doc — 工程文档入口

> **状态**：**一期（阶段 0～7）已验收**；**二期**：Cursor + MCP  
> **目标**：浏览 / 检索 / 按说明书触发 `agents` · `skills` · `rules`  
> **内容源**：`standards/`（磁盘 Markdown 为 Source of Truth）

## 先读（跨期）

| 级别 | 文件 | 用途 |
|:----:|------|------|
| **S0** | [SYSTEM-DIRECTION.md](SYSTEM-DIRECTION.md) | 行进方向活文档 |
| **日志** | [CHANGELOG.md](CHANGELOG.md) | 版本与里程碑摘要 |
| **ADR** | [../Code/doc/phase1/ADR-001-architecture-and-stack.md](../Code/doc/phase1/ADR-001-architecture-and-stack.md) | 技术栈冻结 |

## 按期目录

```text
Doc/
  SYSTEM-DIRECTION.md     # 跨期 S0
  CHANGELOG.md            # 跨期
  phase1/                 # 一期：建站 MVP（阶段 0～7）
  phase2/                 # 二期：Cursor + MCP
Code/doc/
  00-dev-log.md           # 跨期开发日志
  phase1/                 # 一期实现笔记（部署/验收/ADR）
  phase2/                 # 二期实现笔记
```

| 目录 | 说明 | 入口 |
|------|------|------|
| **[phase1/](phase1/)** | 需求、架构、URI、进度、矩阵 | [phase1/README.md](phase1/README.md) |
| **[phase2/](phase2/)** | Cursor + MCP 消费本站索引 | [phase2/README.md](phase2/README.md) |
| **实现跟踪** | [../Code/doc/](../Code/doc/README.md) | 同样按 phase1 / phase2 分放 |

## 一句话定位

网站 = 治理发现层；Cursor（及二期 MCP）= 执行层；**禁止**用 MCP 替代文档站。

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-11 | 文档按一期 / 二期分目录整理 |
| 2026-07-10 | 初稿至阶段 7；S0 / ADR-001 |

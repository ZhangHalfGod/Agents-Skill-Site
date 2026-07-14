# Doc — 工程文档入口

> **状态**：**一期**已验收；**二期** Cursor + MCP MVP；**三期**：治理资产迭代闭环（规划中）  
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
  phase3/                 # 三期：治理资产迭代闭环
Code/doc/
  00-dev-log.md           # 跨期开发日志
  phase1/                 # 一期实现笔记（部署/验收/ADR）
  phase2/                 # 二期实现笔记
  phase3/                 # 三期实现笔记
```

| 目录 | 说明 | 入口 |
|------|------|------|
| **[phase1/](phase1/)** | 需求、架构、URI、进度、矩阵 | [phase1/README.md](phase1/README.md) |
| **[phase2/](phase2/)** | Cursor + MCP 消费本站索引 | [phase2/README.md](phase2/README.md) |
| **[phase3/](phase3/)** | 迭代闭环：Lesson → Skill/Agent/Rules | [phase3/README.md](phase3/README.md)（新对话先读 [00-context](phase3/00-context.md)） |
| **[git/](git/)** | Git 操作：Fork、Upstream、分支合并 | [git/fork-and-upstream.md](git/fork-and-upstream.md) |
| **实现跟踪** | [../Code/doc/](../Code/doc/README.md) | 同样按 phase1 / phase2 / phase3 分放 |

## 运维记录

| 文件 | 用途 |
|------|------|
| [git/branch-merge-record.md](git/branch-merge-record.md) | 分支合并记录（feature → main）与执行命令

## 一句话定位

网站 = 治理发现层；Cursor（及二期 MCP）= 执行层；**禁止**用 MCP 替代文档站。  
三期 = 项目 Lesson 回灌 Skill/Agent/Rules；MCP 仍只读。

## 修订记录

| 日期 | 说明 |
|------|------|
| 2026-07-14 | 新增 phase3/ 交接与执行文档 |
| 2026-07-11 | 文档按一期 / 二期分目录整理 |
| 2026-07-10 | 初稿至阶段 7；S0 / ADR-001 |

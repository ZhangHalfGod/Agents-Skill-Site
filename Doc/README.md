# All_URI — Agents / Skills / Rules 运行站工程文档入口

> **状态**：**阶段 0 完成**；**阶段 1 进行中**（实现目录 `../Code/`）  
> **目标**：自建网站，用于浏览、检索、运行（按说明书触发）自有 `agents` / `skills` / `rules` 资产  
> **内容源**：`Agents_Skill/standards/`（以 `common/` 为基线，`domains/` 为增强）

## 系统级约束（最先读）

| 级别 | 文件 | 用途 |
|:----:|------|------|
| **S0** | **[SYSTEM-DIRECTION.md](SYSTEM-DIRECTION.md)** | **行进方向活文档**：北极星、硬约束、反模式、优先级、决策日志；与下级冲突时以它为准 |

开工前勾选：`SYSTEM-DIRECTION.md` §9。重大改向只追加其 §8，禁止静默漂移。

## 目录结构（当前）

```text
All_URI/
  Doc/     # 本目录：工程规划（方向/需求/URI/进度/矩阵）
  Code/
    doc/   # 开发过程技术细节、服务器清单、部署笔记
    code/  # 网站源码（阶段 1 起）
```

实现入口：[../Code/README.md](../Code/README.md)

## 文档清单

| 序号 | 文件 | 用途 |
|:----:|------|------|
| 00 | [00-context.md](00-context.md) | 背景、痛点、目标与非目标 |
| 01 | [01-requirements.md](01-requirements.md) | 功能/非功能需求与验收口径 |
| 02 | [02-architecture.md](02-architecture.md) | 站点架构、内容模型、技术选型建议 |
| 03 | [03-uri-registry.md](03-uri-registry.md) | 全站 URI / 目录映射注册表（本目录核心） |
| 04 | [04-progress-plan.md](04-progress-plan.md) | 分阶段实施计划与进度表 |
| 05 | [05-agent-skill-matrix.md](05-agent-skill-matrix.md) | 标准角色 ↔ 技能标签 ↔ 说明书链接矩阵 |

## 一句话定位

把 `standards` 从「仓库里的模板包」升级为「可浏览、可检索、可按角色说明书运行」的本地/内网站点；**磁盘上的 Markdown 仍是 source of truth**，网站是只读呈现 + 索引 + 触发指引层。

## 与现有资产的关系

```text
Agents_Skill/
  standards/          # 标准包（模板与领域增强，长期维护）
  All_URI/
    Doc/              # 工程规划
    Code/doc/         # 实现期技术跟踪
    Code/code/        # 网站工程（阶段 1）
```

- **Agents**：对应 `standards/common/agents/standard/*` 八大岗位角色 + 领域角色  
- **Skills**：对应 `standards/common/skills/{custom,external}/*` + `domains/*/skills`  
- **Rules**：对应 `standards/common/rules/{L0,L1,L2}` + `domains/*/rules`

## 当前阶段边界

| 做 | 不做 |
|----|------|
| 阶段 1 脚手架与 PM2 隔离部署设计 | 网站内模型推理 |
| 服务器清单收集与端口避让 | 角色 md 写死部署 URL |
| 本地/服务器静态站 | 与现有 mcp/api 进程混部 |

## 修订记录

| 日期 | 版本 | 说明 |
|------|------|------|
| 2026-07-10 | v0.1 | 初稿：工程文档 + 进度计划 + URI 注册表 |
| 2026-07-10 | v0.2 | 新增 S0 `SYSTEM-DIRECTION.md` 系统级行进方向约束（活文档） |
| 2026-07-10 | v0.3 | 阶段 0 完成；阶段 1 启动；创建 `Code/doc` + `Code/code` |

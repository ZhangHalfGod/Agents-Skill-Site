# 一期文档（阶段 0～7 · 已验收）

治理站 MVP：可浏览 agents / skills / rules，Domains 灰度，运行指引，validate 门禁，ECS 上线。

## 规划文档（本目录）

| 文件 | 用途 |
|------|------|
| [00-context.md](00-context.md) | 背景、痛点、目标与非目标 |
| [01-requirements.md](01-requirements.md) | 功能/非功能需求与验收口径 |
| [02-architecture.md](02-architecture.md) | 站点架构与内容模型 |
| [03-uri-registry.md](03-uri-registry.md) | URI / 目录映射注册表 |
| [04-progress-plan.md](04-progress-plan.md) | 分阶段进度表 |
| [05-agent-skill-matrix.md](05-agent-skill-matrix.md) | 角色 ↔ 技能矩阵 |

## 实现笔记（Code/doc/phase1）

| 文件 | 用途 |
|------|------|
| [ADR-001](../../Code/doc/phase1/ADR-001-architecture-and-stack.md) | VitePress + 部署参数冻结 |
| [01-server-inventory.md](../../Code/doc/phase1/01-server-inventory.md) | 服务器清单 |
| [07-deploy.md](../../Code/doc/phase1/07-deploy.md) | 生产部署（形态 α） |
| [08-release-checklist.md](../../Code/doc/phase1/08-release-checklist.md) | 发布检查清单 |
| [09-phase7-acceptance.md](../../Code/doc/phase1/09-phase7-acceptance.md) | 一期验收报告 |
| 其余 | scaffold / 安全对齐 / content mount / 本地笔记 |

## 与二期关系

一期交付物（网站 + `manifest.json`）是二期 MCP 的数据源。二期入口：[../phase2/](../phase2/README.md)。

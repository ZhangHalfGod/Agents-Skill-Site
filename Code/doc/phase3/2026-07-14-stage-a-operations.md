# 2026-07-14 — 阶段 A：operations + Lesson 模板

## 工作区身份

- 本仓：`Agents-Skill-Site` → `origin` = `ZhangHalfGod/Agents-Skill-Site`（上游）
- SoT：`/Users/zhanghalfgod/Public/Work/agents-skill-standards/standards`（`ALT_STANDARDS`）

## 落地文件（standards 仓）

| 路径 | 说明 |
|------|------|
| `standards/operations/README.md` | 约定 + **禁止 raw 覆盖 common** |
| `standards/operations/_template/lessons/_lesson-card.template.md` | 复制用模板 |
| `standards/operations/macair-phase3-bootstrap/meta.md` | 示例项目 |
| `standards/operations/macair-phase3-bootstrap/lessons/2026-07-14-phase3-docs-bootstrap.md` | 示例 raw lesson |
| `standards/README.md` | 目录说明补上 `operations/` |

## 本仓同步文档

| 路径 | 说明 |
|------|------|
| `Doc/phase1/03-uri-registry.md` | `/operations` → 三期源就绪（公网仍关）+ §8 预留 URI |
| `Doc/phase3/02-execution-plan.md` | 阶段 A 验收勾选 |
| `Doc/CHANGELOG.md` | v1.5-a |

## 验收

- [x] 模板可复制生成 card  
- [x] 示例 lesson frontmatter 合法（`status: raw` 等）  
- [x] README 写清：禁止 raw 直接覆盖 common  
- [x] 本期未挂公网  

## 备注

- `agents-skill-standards` 变更需在该仓单独 commit / push（与本仓分离）。  
- 本机 sync：`STANDARDS_ROOT=.../agents-skill-standards/standards`（operations 暂不同步进站点）。

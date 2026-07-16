# 2026-07-14 — 阶段 A：operations + Lesson 模板

> **2026-07-16 修订**：operations 已迁入本仓 `Code/code/docs/operations/`（不再依赖外仓 standards）。

## 工作区身份

- 本仓：`Agents-Skill-Site` → [`ZhangHalfGod/Agents-Skill-Site`](https://github.com/ZhangHalfGod/Agents-Skill-Site)  
- SoT：本仓 `Code/code/docs/**`（见 [`Doc/phase3/00-context.md`](../../../Doc/phase3/00-context.md) §1）

## 落地文件（本仓）

| 路径 | 说明 |
|------|------|
| `docs/operations/README.md` | 约定 + 禁止 raw 覆盖可复用正文 |
| `docs/operations/_template/lessons/_lesson-card.template.md` | 复制用模板 |
| `docs/operations/site-sot-inplace/` | 示例项目 + lesson |

## 本仓同步文档

| 路径 | 说明 |
|------|------|
| `Doc/phase1/03-uri-registry.md` | `/operations` → 本仓 docs |
| `Doc/phase3/02-execution-plan.md` | 阶段 A 验收勾选 |
| `Doc/CHANGELOG.md` | 记录 |

## 验收

- [x] 模板可复制生成 card  
- [x] 示例 lesson frontmatter 合法  
- [x] README 写清：禁止 raw 直接覆盖可复用正文  
- [x] 本期未挂公网  

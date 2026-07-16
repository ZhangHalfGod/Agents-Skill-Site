# 2026-07-16 — 本仓 docs 就地 SoT（方案 B）

## 决策

- S0：`Doc/SYSTEM-DIRECTION.md` §8 `2026-07-16-01`（v0.4）  
- 真源：`Code/code/docs/**`  
- 脚本：`npm run generate`（`sync` 为别名）；不再从 `STANDARDS_ROOT` 拷贝正文  
- 不做：导出到独立 standards 布局（用户明确跳过）

## 落地

| 项 | 路径 |
|----|------|
| generate 脚本 | `Code/code/scripts/sync-standards.mjs` |
| 去掉「请勿手改」 | `scripts/strip-sync-notices.mjs`（已跑） |
| operations | `Code/code/docs/operations/` |
| 示例 Lesson | `operations/site-sot-inplace/lessons/2026-07-16-sot-inplace-docs.md` |

## 验收

- [x] `npm run generate && npm run accept` 通过  
- [x] S0 / README / phase3 `00-context` 已对齐  

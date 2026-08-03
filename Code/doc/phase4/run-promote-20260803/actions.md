# 升格流水线 actions — 2026-08-03（feishu 授权「同意蒸馏」）

触发：飞书「同意蒸馏」×2；digest 7 条建议，全部 target=openclaw-ops。

## 判决与改动

| 卡 id | 判决 | 正文改动 | 卡状态 |
|-------|------|----------|--------|
| 2026-08-02-chat-error-code-mask-sanitize-field-matrix | merged（distilled→并入） | openclaw-ops/docs/orchestration-pitfalls.md「交付物与信封」「硬约束提醒」+ index.md checklist | raw→merged, scope→common, promoted_to=orchestration-pitfalls.md |
| 2026-08-02-mcp-docs-openapi-align-corrected-lesson-propagation | merged | orchestration-pitfalls.md「事实断言」「交付物与信封」 | 同上 |
| 2026-08-02-openapi-docsync-registry-route-truth | merged | orchestration-pitfalls.md「事实断言」「硬约束提醒」+ index.md 已知坑 | 同上 |
| 2026-08-02-openclaw-doctor-probes-lastexitcode-parsererror | merged | orchestration-pitfalls.md「子脚本判定」「编码与工具链」 | 同上 |
| 2026-08-02-release-notes-gen-manifest-generated-markdown | merged | orchestration-pitfalls.md「生成器与文档同步」 | 同上 |
| 2026-08-02-swagger-ui-lite-zero-dep-ui-grouping | merged | orchestration-pitfalls.md「生成器与文档同步」「编码与工具链」 | 同上 |
| 2026-08-02-workdir-whitelist-skill-template-dual-write | merged | orchestration-pitfalls.md「生成器与文档同步」「编码与工具链」 | 同上 |

## 改动文件

- 新增 `Code/code/docs/zh/skills/custom/common/openclaw-ops/docs/orchestration-pitfalls.md`（编排流水线高频坑，7 卡蒸馏合并）
- `Code/code/docs/zh/skills/custom/common/openclaw-ops/index.md`：checklist + 已知坑 + 分层正文各加指引
- 7 张 Lesson 卡：status/scope/promoted_to/蒸馏笔记

## 门禁

- [x] `npm run generate`
- [x] `npm run validate`
- [x] `node scripts/lesson-scan.mjs --strict`
- [x] `promote-commit.cjs --cards <7 id>`（本机 commit develop，不 push）

## 遗留

- 无 rejected 卡；无「不改正文」建议。

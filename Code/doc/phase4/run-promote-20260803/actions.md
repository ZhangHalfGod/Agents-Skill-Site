# actions.md — 2026-08-03 升格动作记录

## 判决汇总（全部采纳 digest 判决建议，均为「扩写既有 skill」→ merged）

| 卡 id | 判决 | 目标 | 动作 |
|-------|------|------|------|
| 2026-07-30-cursor-cli-node-abi-rebuild | merged | openclaw-ops/index.md | 可执行清单增「代码跳收尾查残留 server 进程」「无头 Cursor CLI 禁跑 npm rebuild/install」两条 |
| 2026-07-30-openclaw-auth-three-layers | merged | openclaw-ops/index.md | 首页增「认证三层解剖」表 + 401 诊断顺序 + 注入三件套 checklist |
| 2026-07-30-ps51-openclaw-cli-argv-stdout | merged | powershell-utf8/index.md | 增 native argv 引号拆分 + stdout 乱码两条 checklist + 来源 Lesson 标注 |
| 2026-07-31-layers-single-source-of-truth | merged | openclaw-ops/index.md | 已知坑增「发现面单一真源」「文档跳 agent 禁调 feishu」两条 |
| 2026-07-30-feishu-doc-five-layer-gates | merged | openclaw-ops/docs/plugin-tool-gates.md | 正文已就位（2026-07-30），仅标记 merged 闭环 |

## 改动文件

- docs/zh/skills/custom/common/openclaw-ops/index.md
- docs/zh/skills/custom/common/openclaw-ops/docs/plugin-tool-gates.md（既有，未改）
- docs/zh/skills/custom/common/powershell-utf8/index.md
- docs/zh/operations/mechassist-openapi/lessons/2026-07-30-cursor-cli-node-abi-rebuild.md
- docs/zh/operations/mechassist-openapi/lessons/2026-07-30-openclaw-auth-three-layers.md
- docs/zh/operations/mechassist-openapi/lessons/2026-07-30-ps51-openclaw-cli-argv-stdout.md
- docs/zh/operations/mechassist-openapi/lessons/2026-07-31-layers-single-source-of-truth.md
- docs/zh/operations/openclaw-orchestration-pilot/lessons/2026-07-30-feishu-doc-five-layer-gates.md

## 门禁（下一步）

cd Code/code && npm run generate && npm run validate && node scripts/lesson-scan.mjs --strict

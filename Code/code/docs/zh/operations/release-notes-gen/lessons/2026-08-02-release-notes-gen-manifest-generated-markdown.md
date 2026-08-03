---
id: 2026-08-02-release-notes-gen-manifest-generated-markdown
project: release-notes-gen
date: 2026-08-02
audience: skill
audience_guess: skill
target_id: ""
priority: P1
status: raw
scope: project
seen_in_projects: [release-notes-gen]
promoted_to: ""
related_agents: [ProductManager, Architect, DevLead]
related_skills: [openclaw-ops]
---

# Lesson：从 manifest 生成发布文档——无密钥默认、字段缺失降级、姐妹脚本复用

## 现象

release-notes-gen 新增 `scripts/release-notes-gen.mjs`：fetch `GET /api/release/manifest?probe=false` → 生成 7 节发布清单 Markdown（对齐 发布清单-模板.md）。关键设计：`RELEASE_PROBE` 默认 false（无外部请求、无密钥暴露）；缺字段用 `?.`+`?? '—'` 写 `—` 不崩溃；HTTP/解析/写入失败 exit 1；成功 exit 0。H4 实测 exit 0、输出文件 2408B、6 个字段与 manifest 逐项一致、密钥类 grep 零命中。

## 期望

- 生成类脚本遵循「默认最小暴露」：probe/探测类开关默认关闭，密钥类字段（KEY/TOKEN/SECRET/password/Bearer/内网 URL）显式列入输出禁项清单并在 H4 grep 验证
- 字段缺失降级为占位符（`—`）而非 FAIL——manifest 结构随版本演进，生成器应稳健；只有传输/解析/写入层失败才 exit 1
- 新脚本复用仓内姐妹脚本（release-triplet-check.mjs）的 env 命名、fetch 封装、exit 码约定，降低维护成本

## 当时上下文

- 角色：编排者（H4 独立复验：起服务 → 跑脚本 → 对比 manifest → grep 密钥）
- 技能：openclaw-ops
- 摘要：新增 scripts/release-notes-gen.mjs（~126 行）+ 版本三元组发布流程.md §2.2 引用；H4：exit 0、`Wrote: ...发布清单-20260802.md`、字段 6/6（promptVersion=chat-system-v1、registryVersion=1.0.0+1.0.0、commit=12456df、serviceVersion=1.0.0、gitSha=12456df、deployEnv=development）、密钥零命中

## 编排侧踩坑（同 run 记录）

1. **H2 信封内嵌文件第 6 次出现**：arch 回复仅摘要、完整交付物+信封在文件内；main 提取归档。**建议**：编排流程正式允许「文件内嵌 SPLIT + 回复摘要」双通道并固定提取规则（连续 6 run，必须改流程了）。
2. **H1 富文件覆盖（第 4 次）**：agent 落盘的 scope-checklist（9074B）比回复交付物（2264 chars）更完整；本 run 已改为「先比大小再决定保留谁」（split 到临时名 → 比较 → 保留大者）→ 之后不再发生。**建议**：固定该流程。
3. **feishu token 截断 400（第 2 次）**：两次把工具返回的截断 token 当 doc_token 传 → 400；必须用完整 document_id。**建议**：用完整 22 位 id，别用显示省略号。

## 建议沉淀形态

- [ ] 新 skill
- [x] 扩写已有 skill checklist（openclaw-ops：生成脚本默认最小暴露 + 字段缺失降级；split 先比大小；feishu token 完整性；信封双通道正式化）
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- H4 独立复验（main，系统 node v22.22.0，临时实例 PID 6028，端口 3002，验后已关）：
  - `node scripts/release-notes-gen.mjs` → exit 0，stdout `Wrote: ...\发布清单-20260802.md`
  - 输出文件 2408B；字段对比 6/6 与 `GET /api/release/manifest?probe=false` 一致
  - 无密钥 grep（API_KEY|TOKEN|SECRET|password|Bearer|MCP_*_BASE_URL|http://）→ 零命中
- git：新增 scripts/release-notes-gen.mjs（未跟踪）；版本三元组发布流程.md +2 行
- 产物：run-release-notes-gen-20260802（三跳信封/mcp-resolve/playbook-pack/h3 报告+信封/h4-*.cjs/m2-gate-sign.yaml）
- 本 session 2026-08-02（run-release-notes-gen-20260802）

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：
- 变更摘要：

# Playbook Pack · H2（Architect）

scheme: single-facade-mcp+hop-snapshot  
queried_via: agents-skill-remote  

## sources

- Agent `Architect` @ `docs/zh/agents/standard/Architect/index.md` (contentHash=0c7488c611693662)
- Skill `stage-gate-flow` @ `docs/zh/skills/custom/common/stage-gate-flow/index.md` (contentHash=03778f2e80391568)

## 角色义务（摘自 get_source_text · Architect）

1. 基于范围清单设计模块架构（分层、接口、数据流）
2. 编写架构约束条款（目录结构、命名规范、禁止跨层）
3. 对新脚本与现有姐妹脚本（release-triplet-check.mjs）的契约兼容性做交叉验证
4. 审核生成器输出结构是否对齐模板（发布清单-模板.md 7 节）
5. 评估无密钥保障（输出禁止含 Token/Key/URL）
6. 发现问题即输出整改项

## 出门清单（摘自 stage-gate-flow · H2 适用）

- [x] 当前阶段输入/输出/审核状态已标明
- [x] 上一阶段（H1 PM）已通过——范围清单已产出
- [x] 核心层/网关/安全/架构改动——新增运维脚本，勾选 N/A
- [ ] 本阶段 Lesson：本跳无新教训
- [ ] 部署验收——不涉及
- [x] 交付物（h2-arch-constraints.md）已落盘
- [x] mcp-resolve-h2.yaml 已落盘
- [x] playbook-pack-h2.md（本文件）已落盘
- [x] 文件落盘后自查存在

## 硬禁区（Architect 角色 + 本期契约）

1. 禁止修改业务仓任何文件（H3 才新增 .mjs 文件）
2. 禁止调用 feishu_doc / feishu_drive / 任何飞书工具
3. 禁止 npm install / rebuild / git push / 删除 run-dir 以外文件
4. 禁止写 key-token 进文件（含生成脚本输出！）
5. 禁止改 release-triplet-check.mjs / releaseContract.js / releaseRoutes.js
6. 禁止改 发布清单-模板.md
7. 禁止改 extern-api/ 业务代码
8. 禁止越权产出其他角色交付物
9. 消息稿与交付物一律 UTF-8

## 给下一跳（DevLead / H3）的执行纪律

1. 新增 .mjs 文件对齐 release-triplet-check.mjs 代码风格（函数签名、错误处理、env 变量）
2. 7 节输出按本文 mapping 映射，auto/fixed/placeholder 标注清晰
3. probe=false 默认（安全优先）；mcp/mcpMech 段仅打印 compatible/configured/reachable
4. 字段缺失用 `—`（破折号），不 throw/crash
5. fs.writeFileSync 前 `fs.existsSync` 检查 + `fs.mkdirSync({ recursive: true })`
6. 输出文件名 `发布清单-YYYYMMDD.md`（日期，例：20260802）
7. 生成成功后 exit 0 + `console.log("Wrote: <path>")`

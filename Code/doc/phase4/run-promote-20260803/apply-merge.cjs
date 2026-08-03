const fs = require('fs');
const base = 'E:/zhangchangWork/Work_Space/Trae_Study/Agents-Skill-Site/Code/code/docs/zh/operations/';
const target = 'docs/zh/skills/custom/common/openclaw-ops/docs/orchestration-pitfalls.md';
const cards = [
  ['chat-error-code-mask/lessons/2026-08-02-chat-error-code-mask-sanitize-field-matrix.md', '脱敏字段矩阵/H3 失败先查半成品重派/信封双通道 → orchestration-pitfalls「交付物与信封」「硬约束提醒」+ index checklist'],
  ['mcp-docs-openapi-align/lessons/2026-08-02-mcp-docs-openapi-align-corrected-lesson-propagation.md', 'lesson 修正版标注「推翻」/Goal 事实复核/billing 重试 1 次/split 比大小 → orchestration-pitfalls「事实断言」「交付物与信封」'],
  ['mechassist-openapi/lessons/2026-08-02-openapi-docsync-registry-route-truth.md', '路由判据以实测为准/落盘后自查/H3 直调 wrapper → orchestration-pitfalls「事实断言」「硬约束提醒」'],
  ['openclaw-doctor-probes/lessons/2026-08-02-openclaw-doctor-probes-lastexitcode-parsererror.md', 'PS 子脚本判定矩阵/git diff 乱码字节核实/feishu token 完整 id/H4 慢命令超时 → orchestration-pitfalls「子脚本判定」「编码与工具链」'],
  ['release-notes-gen/lessons/2026-08-02-release-notes-gen-manifest-generated-markdown.md', '生成脚本默认最小暴露/字段缺失降级/split 比大小/信封双通道 → orchestration-pitfalls「生成器与文档同步」'],
  ['swagger-ui-lite/lessons/2026-08-02-swagger-ui-lite-zero-dep-ui-grouping.md', 'UI 先查 CSP/依赖/分组映射兜底/网关端点红色记录/feishu token 原样复制 → orchestration-pitfalls「生成器与文档同步」「编码与工具链」'],
  ['workdir-whitelist/lessons/2026-08-02-workdir-whitelist-skill-template-dual-write.md', '生成器双写模板与副本/文档任务排查生成器/GBK 解码 → orchestration-pitfalls「生成器与文档同步」「编码与工具链」'],
];
for (const [rel, summary] of cards) {
  const p = base + rel;
  let s = fs.readFileSync(p, 'utf8');
  s = s.replace(/^status: raw$/m, 'status: merged');
  s = s.replace(/^scope: project$/m, 'scope: common');
  s = s.replace(/^promoted_to: ""$/m, 'promoted_to: ' + target);
  s = s.replace(/## 蒸馏笔记（status=distilled 后填）\n\n- 升格目标路径：\n- 变更摘要：/, '## 蒸馏笔记\n\n- 升格目标路径：' + target + '\n- 变更摘要：' + summary);
  fs.writeFileSync(p, s, 'utf8');
  console.log('OK ' + rel);
}

#!/usr/bin/env node
/** One-shot: patch live ~/.openclaw/workspace/SOUL.md for context-memory tiers (bm). */
'use strict';
const fs = require('fs');
const path = require('path');

const soul = path.join(
  process.env.USERPROFILE || process.env.HOME || '',
  '.openclaw',
  'workspace',
  'SOUL.md',
);
let t = fs.readFileSync(soul, 'utf8');

function sub(label, re, neu) {
  if (!re.test(t)) {
    console.error('BLOCK: missing ' + label);
    process.exit(2);
  }
  t = t.replace(re, neu);
}

sub(
  'jump-snapshot',
  /- \*\*跳界快照\*\*：放行后组装 H3 Goal 时，\*\*必须内嵌\*\*合并后的 Playbook Pack[\s\S]*?门禁摘要可写「说明书包已灌入 Goal」。/,
  `- **跳界快照（分层）**：放行后组装 H3 Goal 用模板 \`templates/h3.goal.tier.md\` + \`h3.goal.sf-hs.block.md\`：**L0** 任务摘要与硬禁区摘录 + **L0.5** 必读 L1 路径（scope/arch/ui/pack）；**禁止**把交付物全文（>8KB）粘进 Goal。写明：**禁止 Cursor 再调 Site MCP；禁止再读 Agents-Skill-Site \`docs/zh/**\` 说明书**。
- Pack / resolve **不进飞书全文**；门禁摘要可写「必读路径已写入 Goal」。

### 上下文内存分层（最高优先级 · 与 SF-HS 并列）

契约：\`Doc/phase4/02\` §1.1 · \`Doc/phase4/10\` §4。消息稿义务模板：\`templates/hop.message.tier.md\`。

- **L1**：交付物全文只写磁盘 \`*.deliverable.md\` / 约定文件名
- **L0.5**：信封 YAML、路径、hash——进最终回复与下一跳消息
- **L0**：短摘要 / 硬禁区——可进对话
- **禁止**：最终回复粘贴交付物全文；H2+ 消息稿粘贴完整上跳 YAML/正文`,
);

sub(
  'hop2',
  /2\. 写消息稿 `<run-dir>\/h<N>\.message\.md`：原始需求 \+ 上跳信封原文（不改写 decisions）\+ \*\*SF-HS 自查义务\*\* \+ 输出契约（交付物 → `---SPLIT---` → 信封 YAML；另落 mcp-resolve \+ playbook-pack）；消息稿中写明：\*\*子 agent 禁止调飞书工具\*\*/,
  '2. 写消息稿 `<run-dir>/h<N>.message.md`：按 `templates/hop.message.tier.md`——原始需求 + **上跳指针**（`prev_envelope_path` / `prev_deliverable_path`，**不**贴全文）+ SF-HS 义务 + 输出契约（**正文落盘**；最终回复 `---SPLIT---` **仅信封**）；写明：**子 agent 禁止调飞书工具**',
);

sub(
  'hop5',
  /5\. 归档：`node D:\\trae_git\\Agents-Skill-Site\\Code\\doc\\phase4\\e2e-openapi\\split-reply\.cjs <raw> <交付物路径> <信封路径>`（本地镜像必留，供信封校验与 H3）/,
  '5. 归档：优先确认 agent 已写交付物文件；若 raw 含 SPLIT 可用 `split-reply.cjs`；**raw 为空不拒收**——以磁盘为准',
);

sub(
  'hop6',
  /6\. 校验：信封四要素 \+ \*\*存在\*\* `mcp-resolve-h<N>\.yaml` 与非空 `playbook-pack-h<N>\.md`（含 sources）；缺则同跳拒收/,
  '6. 校验（磁盘为准）：信封四要素 + `deliverable.path` 存在且 **size>0** + 存在非空 `mcp-resolve-h<N>.yaml` 与 `playbook-pack-h<N>.md`（含 sources）；缺则同跳拒收',
);

sub(
  'h3-goal',
  /1\. 组装 Goal：定稿实施条目\/验收（尽量内联）\+ \*\*完整 Playbook Pack 块\*\*（模板 `templates\/h3\.goal\.sf-hs\.block\.md`）\+ 精确文件范围 \+ 硬约束 \+ 红色记录要求；参照既有 e2e Goal 规格，但\*\*说明书以 Pack 为准而非 Site 路径\*\*/,
  '1. 组装 Goal：按 `templates/h3.goal.tier.md`——**L0** 任务/验收 + **L0.5** 必读 L1 绝对路径（scope/arch/ui/pack）+ `h3.goal.sf-hs.block.md` 硬禁区摘录；**禁止**内嵌整份交付物正文。Cursor 自行 `read` L1。',
);

fs.writeFileSync(soul, t, 'utf8');
console.log('patched ' + soul);
console.log('has tier section', t.includes('### 上下文内存分层'));

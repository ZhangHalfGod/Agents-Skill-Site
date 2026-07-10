/**
 * standards → VitePress docs 只读同步。
 * SoT：Agents_Skill/standards；禁止回写。
 *
 * STANDARDS_ROOT：可选。默认 ../../../standards（相对 Code/code）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CODE_ROOT = path.resolve(__dirname, '..')
const DOCS_ROOT = path.join(CODE_ROOT, 'docs')
const MANIFEST_OUT = path.join(DOCS_ROOT, 'public', 'manifest.json')
const SIDEBAR_AGENTS = path.join(DOCS_ROOT, '.vitepress', 'sidebar.agents.generated.json')
const SIDEBAR_SKILLS = path.join(DOCS_ROOT, '.vitepress', 'sidebar.skills.generated.json')
const SIDEBAR_RULES = path.join(DOCS_ROOT, '.vitepress', 'sidebar.rules.generated.json')
const DEFAULT_STANDARDS = path.resolve(CODE_ROOT, '../../../standards')

/** @type {Record<string, { label: string, uri: string }>} */
const SKILL_META = {
  'ai-code-boundary': {
    label: 'AI 生成代码边界',
    uri: '/skills/custom/common/ai-code-boundary'
  },
  'traceability-compliance': {
    label: '全流程可追溯与合规',
    uri: '/skills/custom/common/traceability-compliance'
  },
  'prompt-versioning': {
    label: 'Prompt 工程化规范',
    uri: '/skills/custom/common/prompt-versioning'
  },
  'stage-gate-flow': {
    label: '瀑布/敏捷阶段门禁',
    uri: '/skills/custom/common/stage-gate-flow'
  },
  'doc-coauthoring': {
    label: '文档协作',
    uri: '/skills/external/doc-coauthoring'
  },
  'mcp-builder': { label: 'MCP 构建', uri: '/skills/external/mcp-builder' },
  'frontend-design': {
    label: '前端设计',
    uri: '/skills/external/frontend-design'
  },
  'webapp-testing': {
    label: 'Web 应用测试',
    uri: '/skills/external/webapp-testing'
  },
  'web-artifacts-builder': {
    label: 'Web 复杂产物构建',
    uri: '/skills/external/web-artifacts-builder'
  },
  'skill-creator': {
    label: 'Skill 创建与评估',
    uri: '/skills/external/skill-creator'
  },
  Human: { label: '去 AI 腔（Human）', uri: '/skills/external/Human' }
}

/** 标准八角色（Doc/03 + Doc/05） */
const STANDARD_AGENTS = [
  {
    index: 1,
    id: 'ProductManager',
    title: '产品经理（ProductManager）',
    summary: '需求边界、验收标准、范围清单与红色记录触发条件',
    skills: ['stage-gate-flow', 'ai-code-boundary'],
    skillsRecommended: ['doc-coauthoring'],
    relatedDocs: [
      {
        slug: 'ai-codegen-scope',
        title: 'AI 代码生成范围清单',
        sourceFile: 'AI代码生成范围清单.md'
      }
    ]
  },
  {
    index: 2,
    id: 'Architect',
    title: '架构师（Architect）',
    summary: '架构约束、接口与模型、Prompt 架构审核',
    skills: ['stage-gate-flow', 'ai-code-boundary', 'traceability-compliance'],
    skillsRecommended: [],
    relatedDocs: [
      {
        slug: 'architecture-constraints',
        title: '架构约束与接口数据模型',
        sourceFile: '架构约束与接口数据模型.md'
      }
    ]
  },
  {
    index: 3,
    id: 'DevLead',
    title: '开发负责人（DevLead）',
    summary: 'Prompt 终版、小批量生成、初审与 CR',
    skills: ['stage-gate-flow', 'prompt-versioning', 'traceability-compliance'],
    skillsRecommended: [],
    relatedDocs: [
      {
        slug: 'reference-notes',
        title: '参考笔记',
        sourceFile: 'reference-notes.md'
      }
    ]
  },
  {
    index: 4,
    id: 'TestEngineer',
    title: '测试工程师（TestEngineer）',
    summary: '测试设计与报告、上线门禁依据',
    skills: ['stage-gate-flow', 'traceability-compliance'],
    skillsRecommended: ['webapp-testing'],
    relatedDocs: [
      {
        slug: 'ai-test-report',
        title: 'AI 代码测试报告',
        sourceFile: 'AI代码测试报告.md'
      }
    ]
  },
  {
    index: 5,
    id: 'SecurityEngineer',
    title: '安全工程师（SecurityEngineer）',
    summary: '安全扫描、合规与整改闭环',
    skills: ['traceability-compliance'],
    skillsRecommended: ['ai-code-boundary'],
    relatedDocs: [
      {
        slug: 'ai-security-report',
        title: 'AI 代码安全报告',
        sourceFile: 'AI代码安全报告.md'
      }
    ]
  },
  {
    index: 6,
    id: 'OpsEngineer',
    title: '运维工程师（OpsEngineer）',
    summary: '版本映射、发布、灰度与回滚',
    skills: ['traceability-compliance'],
    skillsRecommended: ['stage-gate-flow'],
    relatedDocs: [
      {
        slug: 'version-release',
        title: '版本映射与发布说明',
        sourceFile: '版本映射与发布说明.md'
      }
    ]
  },
  {
    index: 7,
    id: 'UIDesigner',
    title: 'UI 设计师（UIDesigner）',
    summary: 'UI 规范、还原度与受控出图约束',
    skills: ['frontend-design', 'doc-coauthoring'],
    skillsRecommended: ['ai-code-boundary'],
    relatedDocs: []
  },
  {
    index: 8,
    id: 'NmosEngineer',
    title: '标准 NMOS 工程师（NmosEngineer）',
    summary: 'NMOS IS-04/IS-05 校验、Registry 注入验证、证据固化',
    skills: ['stage-gate-flow', 'traceability-compliance'],
    skillsRecommended: [],
    relatedDocs: []
  }
]

/** 技能 1～11（Doc/03 + Doc/05 反向索引） */
const STANDARD_SKILLS = [
  {
    index: 1,
    id: 'ai-code-boundary',
    origin: 'custom',
    sourceRel: 'common/skills/custom/common/ai-code-boundary/SKILL.md',
    sitePath: 'skills/custom/common/ai-code-boundary/index.md',
    summary: 'AI 生成边界与分级管控；核心模块需红色记录',
    boundAgents: ['ProductManager', 'Architect'],
    recommendedAgents: ['SecurityEngineer', 'UIDesigner']
  },
  {
    index: 2,
    id: 'traceability-compliance',
    origin: 'custom',
    sourceRel: 'common/skills/custom/common/traceability-compliance/SKILL.md',
    sitePath: 'skills/custom/common/traceability-compliance/index.md',
    summary: '入库/上线追溯与合规门禁',
    boundAgents: [
      'Architect',
      'DevLead',
      'TestEngineer',
      'SecurityEngineer',
      'OpsEngineer'
    ],
    recommendedAgents: ['NmosEngineer']
  },
  {
    index: 3,
    id: 'prompt-versioning',
    origin: 'custom',
    sourceRel: 'common/skills/custom/common/prompt-versioning/SKILL.md',
    sitePath: 'skills/custom/common/prompt-versioning/index.md',
    summary: 'Prompt 命名、结构、双审核与版本关联',
    boundAgents: ['DevLead'],
    recommendedAgents: ['Architect']
  },
  {
    index: 4,
    id: 'stage-gate-flow',
    origin: 'custom',
    sourceRel: 'common/skills/custom/common/stage-gate-flow/SKILL.md',
    sitePath: 'skills/custom/common/stage-gate-flow/index.md',
    summary: '瀑布/敏捷阶段门禁',
    boundAgents: ['ProductManager', 'Architect', 'DevLead', 'TestEngineer'],
    recommendedAgents: ['OpsEngineer', 'NmosEngineer']
  },
  {
    index: 5,
    id: 'doc-coauthoring',
    origin: 'external',
    sourceRel: 'common/skills/external/doc-coauthoring/SKILL.md',
    sitePath: 'skills/external/doc-coauthoring/index.md',
    summary: '文档协作与规格类产出',
    boundAgents: [],
    recommendedAgents: ['ProductManager', 'UIDesigner', 'Architect']
  },
  {
    index: 6,
    id: 'mcp-builder',
    origin: 'external',
    sourceRel: 'common/skills/external/mcp-builder/SKILL.md',
    sitePath: 'skills/external/mcp-builder/index.md',
    summary: 'MCP 工具/服务设计与契约',
    boundAgents: [],
    recommendedAgents: []
  },
  {
    index: 7,
    id: 'frontend-design',
    origin: 'external',
    sourceRel: 'common/skills/external/frontend-design/SKILL.md',
    sitePath: 'skills/external/frontend-design/index.md',
    summary: '前端界面设计与实现约束',
    boundAgents: [],
    recommendedAgents: ['UIDesigner']
  },
  {
    index: 8,
    id: 'webapp-testing',
    origin: 'external',
    sourceRel: 'common/skills/external/webapp-testing/SKILL.md',
    sitePath: 'skills/external/webapp-testing/index.md',
    summary: 'Web 应用测试流程与检查',
    boundAgents: [],
    recommendedAgents: ['TestEngineer', 'UIDesigner']
  },
  {
    index: 9,
    id: 'web-artifacts-builder',
    origin: 'external',
    sourceRel: 'common/skills/external/web-artifacts-builder/SKILL.md',
    sitePath: 'skills/external/web-artifacts-builder/index.md',
    summary: 'Web 复杂产物与多状态构建',
    boundAgents: [],
    recommendedAgents: ['UIDesigner']
  },
  {
    index: 10,
    id: 'skill-creator',
    origin: 'external',
    sourceRel: 'common/skills/external/skill-creator/SKILL.md',
    sitePath: 'skills/external/skill-creator/index.md',
    summary: '新建/迭代 Skill 的方法与评估',
    boundAgents: [],
    recommendedAgents: []
  },
  {
    index: 11,
    id: 'Human',
    origin: 'external',
    sourceRel: 'common/skills/external/Human/SKILL.md',
    sitePath: 'skills/external/Human/index.md',
    summary: '识别并去除 AI 腔，增强文本自然度',
    boundAgents: [],
    recommendedAgents: []
  }
]

const RULE_TITLES = {
  L0: {
    '01-language-and-safety': '语言与安全',
    '02-core-boundary': '核心边界',
    '03-traceability': '可追溯性'
  },
  L1: {
    '01-stage-gate': '六阶段门禁',
    '02-prompt-review': 'Prompt 评审',
    '03-batch-and-cr': '批量与 CR'
  },
  L2: {
    'dialog-minimum-safety': '对话最低安全',
    'mcp-minimum-contract': 'MCP 最低契约',
    'concurrency-minimum-capacity': '并发与容量基线',
    'ptp-nmos-minimum-ops': 'PTP/NMOS 最低运维'
  }
}

function resolveStandardsRoot() {
  const fromEnv = process.env.STANDARDS_ROOT
  if (fromEnv) return path.resolve(fromEnv)
  return DEFAULT_STANDARDS
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
}

function withSlash(uri) {
  return uri.endsWith('/') ? uri : `${uri}/`
}

function stripFrontmatter(raw) {
  const text = raw.replace(/^\uFEFF/, '')
  if (!text.startsWith('---\n') && !text.startsWith('---\r\n')) {
    return { meta: {}, body: text }
  }
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { meta: {}, body: text }
  const meta = {}
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (m) meta[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  return { meta, body: text.slice(match[0].length) }
}

function bodyWithoutLeadingH1(raw) {
  const { meta, body } = stripFrontmatter(raw)
  const lines = body.split(/\r?\n/)
  let i = 0
  while (i < lines.length && lines[i].trim() === '') i++
  let titleFromH1 = null
  if (i < lines.length && /^#\s+/.test(lines[i])) {
    titleFromH1 = lines[i].replace(/^#\s+/, '').trim()
    i++
    while (i < lines.length && lines[i].trim() === '') i++
  }
  return {
    meta,
    titleFromH1,
    body: lines.slice(i).join('\n').trimEnd() + '\n'
  }
}

function wrapPage({ title, sourceRel, body, extras = '', notice = '' }) {
  const safeTitle = title.replace(/"/g, '\\"')
  const tip =
    notice ||
    `本页由 \`npm run sync\` 从 \`${sourceRel}\` 同步生成，**请勿手改**。本站不执行模型推理。`
  return `---
title: "${safeTitle}"
description: 只读同步自 standards；请改源文件后执行 npm run sync
---

::: info Source of Truth
${tip}
:::

# ${title}

${body}
${extras}`
}

function syncMarkdown({
  standardsRoot,
  sourceRel,
  sitePath,
  title,
  extras = '',
  notice = '',
  rewriteRelativeRefs = false
}) {
  const src = path.join(standardsRoot, sourceRel)
  if (!fs.existsSync(src)) throw new Error(`源文件不存在: ${src}`)
  const raw = fs.readFileSync(src, 'utf8')
  const parsed = bodyWithoutLeadingH1(raw)
  let body = parsed.body
  // 技能包内相对 md（如 ./reference/foo.md）不单独挂载；改为源路径提示，避免死链
  if (rewriteRelativeRefs) {
    body = body.replace(/\[([^\]]+)\]\(\.\/([^)]+\.md)\)/g, (_, label, rel) => {
      const full = `standards/${path.dirname(sourceRel).replace(/\\/g, '/')}/${rel}`
      return `**${label}**（源文件 \`${full}\`，请在 Cursor 中 \`@\` 打开）`
    })
  }
  const out = path.join(DOCS_ROOT, sitePath)
  ensureDir(out)
  fs.writeFileSync(
    out,
    wrapPage({
      title: title || parsed.titleFromH1 || path.basename(sourceRel),
      sourceRel: `standards/${sourceRel.replace(/\\/g, '/')}`,
      body,
      extras,
      notice
    }),
    'utf8'
  )
  return {
    sourceRel,
    sitePath,
    bytes: fs.statSync(src).size,
    meta: parsed.meta,
    title: title || parsed.titleFromH1
  }
}

function skillLink(id) {
  const meta = SKILL_META[id]
  if (!meta) return `- \`${id}\``
  return `- [${meta.label}](${withSlash(meta.uri)})（\`${id}\`）`
}

function agentLink(id) {
  return `- [${id}](${withSlash(`/agents/standard/${id}`)})`
}

function buildAgentExtras(agent) {
  const parts = []
  parts.push('## 技能标签（矩阵）')
  parts.push('')
  parts.push('> 权威映射见 `Doc/05-agent-skill-matrix.md`。')
  parts.push('')
  if (agent.skills?.length) {
    parts.push('**必显**', '', ...agent.skills.map(skillLink), '')
  }
  if (agent.skillsRecommended?.length) {
    parts.push('**推荐**', '', ...agent.skillsRecommended.map(skillLink), '')
  }
  if (agent.relatedDocs?.length) {
    parts.push('## 相关文档', '')
    for (const d of agent.relatedDocs) {
      parts.push(
        `- [${d.title}](/agents/standard/${agent.id}/docs/${d.slug})`
      )
    }
    parts.push('')
  }
  parts.push(
    '## 在 Cursor 中运行本角色',
    '',
    `1. \`@\` 引用：\`standards/common/agents/standard/${agent.id}/${agent.id}.md\``,
    '2. （可选）再 `@` 绑定技能的 `SKILL.md`，或说「使用技能 <序号>」并 `@` skills README',
    '3. 粘贴角色文档中的「一句话激活」（若有）',
    '4. 按角色工作流程产出；涉及核心模块时遵守 L0 红色记录',
    '',
    '本站只提供说明书与索引，**不执行模型推理**。',
    ''
  )
  return parts.join('\n')
}

function buildSkillExtras(skill) {
  const parts = []
  parts.push('## 关联角色（矩阵反向）')
  parts.push('')
  if (skill.boundAgents?.length) {
    parts.push('**主要绑定**', '', ...skill.boundAgents.map(agentLink), '')
  }
  if (skill.recommendedAgents?.length) {
    parts.push(
      '**推荐关联**',
      '',
      ...skill.recommendedAgents.map(agentLink),
      ''
    )
  }
  if (!skill.boundAgents?.length && !skill.recommendedAgents?.length) {
    parts.push('_暂无标准角色强绑定（见矩阵或领域角色）。_', '')
  }
  parts.push(
    '## 在 Cursor 中使用本技能',
    '',
    `1. \`@\` 引用：\`standards/${skill.sourceRel.replace(/\\/g, '/')}\``,
    `2. 或 \`@\` skills README 后说「使用技能 ${skill.index}」`,
    '',
    '本站不执行模型推理。',
    ''
  )
  return parts.join('\n')
}

function writeAgentsIndex(agents) {
  const rows = agents
    .map(
      (a) =>
        `| ${a.index} | [${a.id}](${withSlash(`/agents/standard/${a.id}`)}) | ${a.summary} | **已同步** |`
    )
    .join('\n')
  const md = `# Agents

标准治理团队角色目录（对齐 \`standards/common/agents/standard/\`）。

| 序号 | 角色 | 一句话职责 | 状态 |
|:----:|------|------------|:----:|
${rows}

在 Cursor 中运行：\`@standards/common/agents/standard/<Role>/<Role>.md\`。
`
  fs.writeFileSync(path.join(DOCS_ROOT, 'agents', 'index.md'), md, 'utf8')
}

function writeSkillsIndex(skills) {
  const rows = skills
    .map((s) => {
      const uri = withSlash(SKILL_META[s.id].uri)
      const origin = s.origin === 'custom' ? '自定义' : '外部'
      return `| ${s.index} | ${origin} | [${s.id}](${uri}) | ${s.summary} | **已同步** |`
    })
    .join('\n')
  const md = `# Skills

通用技能目录（对齐 \`standards/common/skills/\` 编号 1～11）。

| 序号 | 来源 | 技能 | 一句话用途 | 状态 |
|:----:|:----:|------|------------|:----:|
${rows}

在 Cursor 中：\`@standards/common/skills/README.md\` 后说「使用技能 N」，或直接 \`@\` 对应 \`SKILL.md\`。
`
  fs.writeFileSync(path.join(DOCS_ROOT, 'skills', 'index.md'), md, 'utf8')
}

function writeRulesIndex(rules) {
  const byLevel = { L0: [], L1: [], L2: [] }
  for (const r of rules) byLevel[r.level].push(r)

  const section = (level, title) => {
    const rows = byLevel[level]
      .map(
        (r) =>
          `| [${r.name}](${withSlash(`/rules/${level}/${r.name}`)}) | ${r.title} | ${r.alwaysApply ? '是' : '—'} |`
      )
      .join('\n')
    return `### ${level}（${title}）

| 规则 | 主题 | alwaysApply |
|------|------|:-----------:|
${rows}
`
  }

  const md = `# Rules

Cursor Rules 分层浏览（对齐 \`standards/common/rules/\`）。源文件为 \`.mdc\`，本站只读呈现。

${section('L0', '硬约束')}
${section('L1', '流程与协作')}
${section('L2', '场景最低限度')}

领域规则（\`domains/\`）二期灰度。在 Cursor 中可 \`@\` 对应 \`.mdc\`。
`
  fs.writeFileSync(path.join(DOCS_ROOT, 'rules', 'index.md'), md, 'utf8')
}

function writeJson(filePath, data) {
  ensureDir(filePath)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function writeSidebars(agents, skills, rules) {
  writeJson(SIDEBAR_AGENTS, {
    '/agents/': [
      {
        text: 'Agents',
        items: [
          { text: '角色目录', link: '/agents/' },
          ...agents.map((a) => ({
            text: `${a.index}. ${a.id}`,
            link: withSlash(`/agents/standard/${a.id}`)
          }))
        ]
      }
    ]
  })

  writeJson(SIDEBAR_SKILLS, {
    '/skills/': [
      {
        text: 'Skills',
        items: [
          { text: '技能目录', link: '/skills/' },
          ...skills.map((s) => ({
            text: `${s.index}. ${s.id}`,
            link: withSlash(SKILL_META[s.id].uri)
          }))
        ]
      }
    ]
  })

  const ruleItems = [{ text: '规则目录', link: '/rules/' }]
  for (const level of ['L0', 'L1', 'L2']) {
    ruleItems.push({
      text: level,
      items: rules
        .filter((r) => r.level === level)
        .map((r) => ({
          text: r.name,
          link: withSlash(`/rules/${level}/${r.name}`)
        }))
    })
  }
  writeJson(SIDEBAR_RULES, {
    '/rules/': [{ text: 'Rules', items: ruleItems }]
  })
}

function discoverRules(standardsRoot) {
  const rules = []
  for (const level of ['L0', 'L1', 'L2']) {
    const dir = path.join(standardsRoot, 'common', 'rules', level)
    if (!fs.existsSync(dir)) continue
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.mdc'))) {
      const name = file.replace(/\.mdc$/, '')
      rules.push({
        level,
        name,
        title: RULE_TITLES[level]?.[name] || name,
        sourceRel: `common/rules/${level}/${file}`,
        sitePath: `rules/${level}/${name}/index.md`
      })
    }
  }
  return rules.sort((a, b) =>
    a.level === b.level
      ? a.name.localeCompare(b.name)
      : a.level.localeCompare(b.level)
  )
}

function writeManifest({
  standardsRoot,
  agents,
  relatedDocs,
  skills,
  rules
}) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    standardsRoot: standardsRoot.replace(/\\/g, '/'),
    note: 'agents + skills 1～11 + rules L0/L1/L2；阶段 4 加 validate 门禁',
    agents: agents.map((a) => ({
      index: a.index,
      id: a.id,
      title: a.title,
      summary: a.summary,
      siteUri: `/agents/standard/${a.id}`,
      source: `standards/common/agents/standard/${a.id}/${a.id}.md`,
      skills: a.skills,
      skillsRecommended: a.skillsRecommended
    })),
    relatedDocs,
    skills: skills.map((s) => ({
      index: s.index,
      id: s.id,
      origin: s.origin,
      siteUri: SKILL_META[s.id].uri,
      source: `standards/${s.sourceRel}`,
      boundAgents: s.boundAgents,
      recommendedAgents: s.recommendedAgents
    })),
    rules: rules.map((r) => ({
      level: r.level,
      name: r.name,
      title: r.title,
      siteUri: `/rules/${r.level}/${r.name}`,
      source: `standards/${r.sourceRel}`,
      alwaysApply: r.alwaysApply || false
    }))
  }
  writeJson(MANIFEST_OUT, manifest)
}

function main() {
  const standardsRoot = resolveStandardsRoot()
  const skipSync =
    process.env.SKIP_SYNC === '1' ||
    process.env.SKIP_SYNC === 'true'

  if (!fs.existsSync(standardsRoot)) {
    // 生产机常只 clone 本仓；docs 已入库时可跳过 sync 直接 build
    if (skipSync || fs.existsSync(path.join(DOCS_ROOT, 'agents', 'standard', 'Architect', 'index.md'))) {
      console.warn(
        `[sync-standards] STANDARDS_ROOT 不存在: ${standardsRoot}；跳过 sync，使用仓库内已有 docs（设 SKIP_SYNC=1 可显式跳过）`
      )
      return
    }
    console.error(`[sync-standards] STANDARDS_ROOT 不存在: ${standardsRoot}`)
    console.error(
      '[sync-standards] 请设置 STANDARDS_ROOT，或 clone standards 后重试；仅构建已入库 docs 时：SKIP_SYNC=1 npm run build'
    )
    process.exit(1)
  }
  if (skipSync) {
    console.warn('[sync-standards] SKIP_SYNC=1，跳过同步')
    return
  }
  console.log(`[sync-standards] standards = ${standardsRoot}`)

  const relatedDocs = []
  for (const agent of STANDARD_AGENTS) {
    syncMarkdown({
      standardsRoot,
      sourceRel: `common/agents/standard/${agent.id}/${agent.id}.md`,
      sitePath: `agents/standard/${agent.id}/index.md`,
      title: agent.title,
      extras: buildAgentExtras(agent)
    })
    console.log(`[sync-standards] OK agent ${agent.index}.${agent.id}`)
    for (const doc of agent.relatedDocs || []) {
      syncMarkdown({
        standardsRoot,
        sourceRel: `common/agents/standard/${agent.id}/${doc.sourceFile}`,
        sitePath: `agents/standard/${agent.id}/docs/${doc.slug}.md`,
        title: doc.title
      })
      relatedDocs.push({
        siteUri: `/agents/standard/${agent.id}/docs/${doc.slug}`,
        source: `standards/common/agents/standard/${agent.id}/${doc.sourceFile}`
      })
      console.log(`[sync-standards] OK   doc ${doc.slug}`)
    }
  }
  writeAgentsIndex(STANDARD_AGENTS)

  for (const skill of STANDARD_SKILLS) {
    const meta = SKILL_META[skill.id]
    const result = syncMarkdown({
      standardsRoot,
      sourceRel: skill.sourceRel,
      sitePath: skill.sitePath,
      title: meta.label,
      extras: buildSkillExtras(skill),
      rewriteRelativeRefs: true
    })
    console.log(`[sync-standards] OK skill ${skill.index}.${skill.id}`)
    void result
  }
  writeSkillsIndex(STANDARD_SKILLS)

  const rules = discoverRules(standardsRoot)
  for (const rule of rules) {
    const result = syncMarkdown({
      standardsRoot,
      sourceRel: rule.sourceRel,
      sitePath: rule.sitePath,
      title: `${rule.level} · ${rule.title}`,
      notice: `同步自 \`.mdc\`：\`standards/${rule.sourceRel}\`。本站只读呈现，不注入 Cursor Rules。`,
      extras: [
        '## 元数据',
        '',
        `- 层级：\`${rule.level}\``,
        `- 文件：\`${rule.name}.mdc\``,
        `- 源路径：\`standards/${rule.sourceRel}\``,
        ''
      ].join('\n')
    })
    rule.alwaysApply = String(result.meta.alwaysApply || '') === 'true'
    // rewrite extras with alwaysApply known
    syncMarkdown({
      standardsRoot,
      sourceRel: rule.sourceRel,
      sitePath: rule.sitePath,
      title: `${rule.level} · ${rule.title}`,
      notice: `同步自 \`.mdc\`：\`standards/${rule.sourceRel}\`。本站只读呈现，不注入 Cursor Rules。`,
      extras: [
        '## 元数据',
        '',
        `- 层级：\`${rule.level}\``,
        `- 文件：\`${rule.name}.mdc\``,
        `- alwaysApply：\`${rule.alwaysApply}\``,
        `- 源路径：\`standards/${rule.sourceRel}\``,
        '',
        '## 在 Cursor 中使用',
        '',
        `\`@standards/${rule.sourceRel}\``,
        ''
      ].join('\n')
    })
    console.log(`[sync-standards] OK rule ${rule.level}/${rule.name}`)
  }
  writeRulesIndex(rules)

  writeSidebars(STANDARD_AGENTS, STANDARD_SKILLS, rules)
  writeManifest({
    standardsRoot,
    agents: STANDARD_AGENTS,
    relatedDocs,
    skills: STANDARD_SKILLS,
    rules
  })

  console.log(
    `[sync-standards] 完成：${STANDARD_AGENTS.length} 角色 + ${relatedDocs.length} 附属 + ${STANDARD_SKILLS.length} 技能 + ${rules.length} 规则`
  )
}

main()

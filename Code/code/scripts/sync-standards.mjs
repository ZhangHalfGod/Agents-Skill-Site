/**
 * 本仓 docs → manifest / 侧栏 / 目录索引（generate）。
 * SoT（MCP / Cursor @）：Code/code/docs/zh/**（中文全文）。
 * 英文 VitePress root：docs/agents|skills/** 全文（en-*-bodies.mjs）；rules/domains 仍可为 stub。
 *
 * 历史：曾从外部 STANDARDS_ROOT 拷贝正文；2026-07-16 起废止该日常流程。
 * 2026-07-17：i18n — SoT 迁入 docs/zh；manifest.source = docs/zh/...
 * 2026-07-17：英文 Role/Skill 独立全文，不再 stub 跳转中文。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { AGENT_BODIES } from './en-agent-bodies.mjs'
import { SKILL_BODIES } from './en-skill-bodies.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CODE_ROOT = path.resolve(__dirname, '..')
const DOCS_ROOT = path.join(CODE_ROOT, 'docs')
/** 中文全文真源（VitePress locale zh） */
const SOT_ROOT = path.join(DOCS_ROOT, 'zh')
const CONTENT_ROOT = 'docs/zh'
const MANIFEST_OUT = path.join(DOCS_ROOT, 'public', 'manifest.json')
const SIDEBAR_AGENTS = path.join(DOCS_ROOT, '.vitepress', 'sidebar.agents.generated.json')
const SIDEBAR_SKILLS = path.join(DOCS_ROOT, '.vitepress', 'sidebar.skills.generated.json')
const SIDEBAR_RULES = path.join(DOCS_ROOT, '.vitepress', 'sidebar.rules.generated.json')
const SIDEBAR_DOMAINS = path.join(DOCS_ROOT, '.vitepress', 'sidebar.domains.generated.json')
const SIDEBAR_AGENTS_ZH = path.join(
  DOCS_ROOT,
  '.vitepress',
  'sidebar.agents.zh.generated.json'
)
const SIDEBAR_SKILLS_ZH = path.join(
  DOCS_ROOT,
  '.vitepress',
  'sidebar.skills.zh.generated.json'
)
const SIDEBAR_RULES_ZH = path.join(
  DOCS_ROOT,
  '.vitepress',
  'sidebar.rules.zh.generated.json'
)
const SIDEBAR_DOMAINS_ZH = path.join(
  DOCS_ROOT,
  '.vitepress',
  'sidebar.domains.zh.generated.json'
)
const SITE_CONFIG = path.join(CODE_ROOT, 'site.config.json')
const DEFAULT_STANDARDS = path.resolve(CODE_ROOT, '../../../standards')
const ALT_STANDARDS = path.resolve(
  CODE_ROOT,
  '../../../agents-skill-standards/standards'
)

/** @type {Record<string, { label: string, labelEn: string, uri: string }>} */
const SKILL_META = {
  'ai-code-boundary': {
    label: 'AI 生成代码边界',
    labelEn: 'AI code boundary',
    uri: '/skills/custom/common/ai-code-boundary'
  },
  'traceability-compliance': {
    label: '全流程可追溯与合规',
    labelEn: 'Traceability & compliance',
    uri: '/skills/custom/common/traceability-compliance'
  },
  'prompt-versioning': {
    label: 'Prompt 工程化规范',
    labelEn: 'Prompt versioning',
    uri: '/skills/custom/common/prompt-versioning'
  },
  'stage-gate-flow': {
    label: '瀑布/敏捷阶段门禁',
    labelEn: 'Stage-gate flow',
    uri: '/skills/custom/common/stage-gate-flow'
  },
  'doc-coauthoring': {
    label: '文档协作',
    labelEn: 'Doc co-authoring',
    uri: '/skills/external/doc-coauthoring'
  },
  'mcp-builder': {
    label: 'MCP 构建',
    labelEn: 'MCP builder',
    uri: '/skills/external/mcp-builder'
  },
  'frontend-design': {
    label: '前端设计',
    labelEn: 'Frontend design',
    uri: '/skills/external/frontend-design'
  },
  'webapp-testing': {
    label: 'Web 应用测试',
    labelEn: 'Webapp testing',
    uri: '/skills/external/webapp-testing'
  },
  'web-artifacts-builder': {
    label: 'Web 复杂产物构建',
    labelEn: 'Web artifacts builder',
    uri: '/skills/external/web-artifacts-builder'
  },
  'skill-creator': {
    label: 'Skill 创建与评估',
    labelEn: 'Skill creator',
    uri: '/skills/external/skill-creator'
  },
  Human: {
    label: '去 AI 腔（Human）',
    labelEn: 'Human tone',
    uri: '/skills/external/Human'
  }
}

/** 标准八角色（Doc/03 + Doc/05） */
const STANDARD_AGENTS = [
  {
    index: 1,
    id: 'ProductManager',
    title: '产品经理（ProductManager）',
    summary: '需求边界、验收标准、范围清单与红色记录触发条件',
    summaryEn:
      'Scope boundaries, acceptance criteria, codegen range list, and red-record triggers',
    skills: ['stage-gate-flow', 'ai-code-boundary'],
    skillsRecommended: ['doc-coauthoring'],
    relatedDocs: [
      {
        slug: 'ai-codegen-scope',
        title: 'AI 代码生成范围清单',
        titleEn: 'AI code-generation scope list',
        sourceFile: 'AI代码生成范围清单.md'
      }
    ]
  },
  {
    index: 2,
    id: 'Architect',
    title: '架构师（Architect）',
    summary: '架构约束、接口与模型、Prompt 架构审核',
    summaryEn:
      'Architecture constraints, interfaces and models, prompt architecture review',
    skills: ['stage-gate-flow', 'ai-code-boundary', 'traceability-compliance'],
    skillsRecommended: [],
    relatedDocs: [
      {
        slug: 'architecture-constraints',
        title: '架构约束与接口数据模型',
        titleEn: 'Architecture constraints and interface data model',
        sourceFile: '架构约束与接口数据模型.md'
      }
    ]
  },
  {
    index: 3,
    id: 'DevLead',
    title: '开发负责人（DevLead）',
    summary: 'Prompt 终版、小批量生成、初审与 CR',
    summaryEn:
      'Final prompts, small-batch generation, first-pass review and CR',
    skills: ['stage-gate-flow', 'prompt-versioning', 'traceability-compliance'],
    skillsRecommended: [],
    relatedDocs: [
      {
        slug: 'reference-notes',
        title: '参考笔记',
        titleEn: 'Reference notes',
        sourceFile: 'reference-notes.md'
      }
    ]
  },
  {
    index: 4,
    id: 'TestEngineer',
    title: '测试工程师（TestEngineer）',
    summary: '测试设计与报告、上线门禁依据',
    summaryEn: 'Test design and reports; release-gate evidence',
    skills: ['stage-gate-flow', 'traceability-compliance'],
    skillsRecommended: ['webapp-testing'],
    relatedDocs: [
      {
        slug: 'ai-test-report',
        title: 'AI 代码测试报告',
        titleEn: 'AI code test report',
        sourceFile: 'AI代码测试报告.md'
      }
    ]
  },
  {
    index: 5,
    id: 'SecurityEngineer',
    title: '安全工程师（SecurityEngineer）',
    summary: '安全扫描、合规与整改闭环',
    summaryEn: 'Security scanning, compliance, and remediation loop',
    skills: ['traceability-compliance'],
    skillsRecommended: ['ai-code-boundary'],
    relatedDocs: [
      {
        slug: 'ai-security-report',
        title: 'AI 代码安全报告',
        titleEn: 'AI code security report',
        sourceFile: 'AI代码安全报告.md'
      }
    ]
  },
  {
    index: 6,
    id: 'OpsEngineer',
    title: '运维工程师（OpsEngineer）',
    summary: '版本映射、发布、灰度与回滚',
    summaryEn: 'Version mapping, release, canary, and rollback',
    skills: ['traceability-compliance'],
    skillsRecommended: ['stage-gate-flow'],
    relatedDocs: [
      {
        slug: 'version-release',
        title: '版本映射与发布说明',
        titleEn: 'Version mapping and release notes',
        sourceFile: '版本映射与发布说明.md'
      }
    ]
  },
  {
    index: 7,
    id: 'UIDesigner',
    title: 'UI 设计师（UIDesigner）',
    summary: 'UI 规范、还原度与受控出图约束',
    summaryEn: 'UI specs, fidelity, and controlled asset generation',
    skills: ['frontend-design', 'doc-coauthoring'],
    skillsRecommended: ['ai-code-boundary'],
    relatedDocs: []
  },
  {
    index: 8,
    id: 'NmosEngineer',
    title: '标准 NMOS 工程师（NmosEngineer）',
    summary: 'NMOS IS-04/IS-05 校验、Registry 注入验证、证据固化',
    summaryEn:
      'NMOS IS-04/IS-05 checks, Registry injection verification, evidence freeze',
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
    summaryEn:
      'AI generation boundaries and tiered controls; red records for core modules',
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
    summaryEn: 'Traceability and compliance gates for merge and release',
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
    summaryEn: 'Prompt naming, structure, dual review, and version linkage',
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
    summaryEn: 'Waterfall / agile stage-gate exit checklist',
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
    summaryEn: 'Document co-authoring and spec-style outputs',
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
    summaryEn: 'MCP tool/service design and contracts',
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
    summaryEn: 'Frontend UI design and implementation constraints',
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
    summaryEn: 'Web app testing flow and checks',
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
    summaryEn: 'Complex web artifacts and multi-state builds',
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
    summaryEn: 'Method and evaluation for creating or iterating skills',
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
    summaryEn: 'Detect and remove AI-sounding tone; improve natural writing',
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

const RULE_TITLES_EN = {
  L0: {
    '01-language-and-safety': 'Language and safety',
    '02-core-boundary': 'Core boundary',
    '03-traceability': 'Traceability'
  },
  L1: {
    '01-stage-gate': 'Six-stage gates',
    '02-prompt-review': 'Prompt review',
    '03-batch-and-cr': 'Batch and CR'
  },
  L2: {
    'dialog-minimum-safety': 'Dialog minimum safety',
    'mcp-minimum-contract': 'MCP minimum contract',
    'concurrency-minimum-capacity': 'Concurrency and capacity baseline',
    'ptp-nmos-minimum-ops': 'PTP/NMOS minimum ops'
  }
}

function resolveStandardsRoot() {
  const fromEnv = process.env.STANDARDS_ROOT
  if (fromEnv) return path.resolve(fromEnv)
  if (fs.existsSync(DEFAULT_STANDARDS)) return DEFAULT_STANDARDS
  if (fs.existsSync(ALT_STANDARDS)) return ALT_STANDARDS
  return DEFAULT_STANDARDS
}

function loadSiteConfig() {
  try {
    return JSON.parse(fs.readFileSync(SITE_CONFIG, 'utf8'))
  } catch {
    return { domains: { enabled: false, active: [], catalog: [] } }
  }
}

function domainsEnabled() {
  if (process.env.ENABLE_DOMAINS === '0' || process.env.ENABLE_DOMAINS === 'false') {
    return false
  }
  if (process.env.ENABLE_DOMAINS === '1' || process.env.ENABLE_DOMAINS === 'true') {
    return true
  }
  return Boolean(loadSiteConfig().domains?.enabled)
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
  if (!fs.existsSync(src)) {
    console.warn(`[sync-standards] 跳过缺失源: ${src}`)
    return { meta: {}, skipped: true }
  }
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

function skillLink(id, locale = 'zh') {
  const meta = SKILL_META[id]
  if (!meta) return `- \`${id}\``
  const prefix = locale === 'en' ? '' : '/zh'
  const label = locale === 'en' ? meta.labelEn || meta.label : meta.label
  const sep = locale === 'en' ? ' — ' : '（'
  const end = locale === 'en' ? '' : '）'
  return `- [${label}](${withSlash(`${prefix}${meta.uri}`)})${sep}\`${id}\`${end}`
}

function agentLink(id, locale = 'zh') {
  const prefix = locale === 'en' ? '' : '/zh'
  return `- [${id}](${withSlash(`${prefix}/agents/standard/${id}`)})`
}

function buildAgentExtras(agent, locale = 'zh') {
  const parts = []
  if (locale === 'en') {
    parts.push('## Skill tags (matrix)', '')
    parts.push('> Authoritative mapping: `Doc/phase1/05-agent-skill-matrix.md`.', '')
    if (agent.skills?.length) {
      parts.push(
        '**Required**',
        '',
        ...agent.skills.map((id) => skillLink(id, 'en')),
        ''
      )
    }
    if (agent.skillsRecommended?.length) {
      parts.push(
        '**Recommended**',
        '',
        ...agent.skillsRecommended.map((id) => skillLink(id, 'en')),
        ''
      )
    }
    if (agent.relatedDocs?.length) {
      parts.push('## Related docs', '')
      for (const d of agent.relatedDocs) {
        const title = d.titleEn || d.title
        parts.push(
          `- [${title}](/agents/standard/${agent.id}/docs/${d.slug}) · [ZH](/zh/agents/standard/${agent.id}/docs/${d.slug})`
        )
      }
      parts.push('')
    }
    const ordered = [
      ...(agent.skills || []),
      ...(agent.skillsRecommended || [])
    ]
    const skillProps = ordered.map((id) => {
      const meta = SKILL_META[id]
      return {
        id,
        label: meta?.labelEn || meta?.label || id,
        uri: meta ? meta.uri : `/skills/${id}`
      }
    })
    const rolePath = `docs/agents/standard/${agent.id}/index.md`
    parts.push(
      '## Run this role in Cursor',
      '',
      `<RunGuide role-id="${agent.id}" role-path="${rolePath}" :skills='${JSON.stringify(skillProps)}' />`,
      '',
      'This site is documentation only — **no model inference**.',
      '',
      '- **Browse this page**: use **Copy Cursor trigger** above (`@` the English paths on this page).',
      '- **Via MCP**: `get_agent` / `get_skill` → `@` the returned **`source`** (`docs/zh/...` SoT). Do not mix with English-site paths.',
      ''
    )
    return parts.join('\n')
  }

  parts.push('## 技能标签（矩阵）')
  parts.push('')
  parts.push('> 权威映射见 `Doc/phase1/05-agent-skill-matrix.md`。')
  parts.push('')
  if (agent.skills?.length) {
    parts.push('**必显**', '', ...agent.skills.map((id) => skillLink(id)), '')
  }
  if (agent.skillsRecommended?.length) {
    parts.push(
      '**推荐**',
      '',
      ...agent.skillsRecommended.map((id) => skillLink(id)),
      ''
    )
  }
  if (agent.relatedDocs?.length) {
    parts.push('## 相关文档', '')
    for (const d of agent.relatedDocs) {
      parts.push(
        `- [${d.title}](/zh/agents/standard/${agent.id}/docs/${d.slug})`
      )
    }
    parts.push('')
  }

  const ordered = [...(agent.skills || []), ...(agent.skillsRecommended || [])]
  const skillProps = ordered.map((id) => {
    const meta = SKILL_META[id]
    return {
      id,
      label: meta?.label || id,
      uri: meta ? `/zh${meta.uri}` : `/zh/skills/${id}`
    }
  })
  const rolePath = `docs/zh/agents/standard/${agent.id}/index.md`
  parts.push(
    '## 在 Cursor 中运行本角色',
    '',
    `<RunGuide role-id="${agent.id}" role-path="${rolePath}" :skills='${JSON.stringify(skillProps)}' />`,
    '',
    '本站只提供说明书与索引，**不执行模型推理**。正文真源即本页 Markdown。',
    '',
    '- **浏览本页**：用上方「复制 Cursor 触发句」（`@` 页内路径）。',
    '- **走 MCP**：`get_agent` / `get_skill` → `@` 返回的 **`source`**（本仓 `docs/zh/...`）。',
    ''
  )
  return parts.join('\n')
}

function buildSkillExtras(skill, locale = 'zh') {
  const parts = []
  if (locale === 'en') {
    parts.push('## Related roles (matrix reverse)', '')
    if (skill.boundAgents?.length) {
      parts.push(
        '**Primary**',
        '',
        ...skill.boundAgents.map((id) => agentLink(id, 'en')),
        ''
      )
    }
    if (skill.recommendedAgents?.length) {
      parts.push(
        '**Recommended**',
        '',
        ...skill.recommendedAgents.map((id) => agentLink(id, 'en')),
        ''
      )
    }
    if (!skill.boundAgents?.length && !skill.recommendedAgents?.length) {
      parts.push('_No strong standard-role binding (see matrix or domain roles)._', '')
    }
    const docsPath = `docs/${skill.sitePath.replace(/\\/g, '/')}`
    parts.push(
      '## Use this skill in Cursor',
      '',
      `1. \`@\` reference: \`${docsPath}\``,
      `2. Or follow the checklist on this page (skill ${skill.index})`,
      '',
      'This site does not run model inference.',
      '',
      '- **Browse this page**: `@` the English path listed above.',
      '- **Via MCP**: `get_skill` → `@` the returned **`source`** (`docs/zh/...`).',
      ''
    )
    return parts.join('\n')
  }

  parts.push('## 关联角色（矩阵反向）')
  parts.push('')
  if (skill.boundAgents?.length) {
    parts.push(
      '**主要绑定**',
      '',
      ...skill.boundAgents.map((id) => agentLink(id)),
      ''
    )
  }
  if (skill.recommendedAgents?.length) {
    parts.push(
      '**推荐关联**',
      '',
      ...skill.recommendedAgents.map((id) => agentLink(id)),
      ''
    )
  }
  if (!skill.boundAgents?.length && !skill.recommendedAgents?.length) {
    parts.push('_暂无标准角色强绑定（见矩阵或领域角色）。_', '')
  }
  const docsPath = `docs/zh/${skill.sitePath.replace(/\\/g, '/')}`
  parts.push(
    '## 在 Cursor 中使用本技能',
    '',
    `1. \`@\` 引用：\`${docsPath}\``,
    `2. 或打开本页后按 checklist 执行（技能 ${skill.index}）`,
    '',
    '本站不执行模型推理。正文真源即本页 Markdown。',
    '',
    '- **浏览本页**：`@` 上方列出的路径。',
    '- **走 MCP**：`get_skill` → `@` 返回的 **`source`**（本仓 `docs/zh/...`）。',
    ''
  )
  return parts.join('\n')
}

function writeAgentsIndex(agents) {
  const rowsZh = agents
    .map(
      (a) =>
        `| ${a.index} | [${a.id}](${withSlash(`/zh/agents/standard/${a.id}`)}) | ${a.summary} | **就绪** |`
    )
    .join('\n')
  const mdZh = `# Agents

标准治理团队角色目录。真源：\`docs/zh/agents/standard/<Role>/\`（本仓就地维护）。

| 序号 | 角色 | 一句话职责 | 状态 |
|:----:|------|------------|:----:|
${rowsZh}

在 Cursor 中运行：\`@docs/zh/agents/standard/<Role>/index.md\`（相对 \`Code/code/\`）。

<QuickJump />
`
  fs.writeFileSync(path.join(SOT_ROOT, 'agents', 'index.md'), mdZh, 'utf8')

  const rowsEn = agents
    .map(
      (a) =>
        `| ${a.index} | [${a.id}](${withSlash(`/agents/standard/${a.id}`)}) | ${a.summaryEn || a.summary} | **ready** |`
    )
    .join('\n')
  const mdEn = `# Agents

Standard governance roles. English playbooks: \`docs/agents/standard/<Role>/\`. Chinese SoT (MCP): \`docs/zh/agents/standard/<Role>/\`.

| # | Role | Summary | Status |
|:----:|------|------------|:----:|
${rowsEn}

In Cursor (English site): \`@docs/agents/standard/<Role>/index.md\`. MCP \`source\` still points at \`docs/zh/...\`.

<QuickJump />
`
  fs.mkdirSync(path.join(DOCS_ROOT, 'agents'), { recursive: true })
  fs.writeFileSync(path.join(DOCS_ROOT, 'agents', 'index.md'), mdEn, 'utf8')
}

function writeSkillsIndex(skills) {
  const rowsZh = skills
    .map((s) => {
      const uri = withSlash(`/zh${SKILL_META[s.id].uri}`)
      const origin = s.origin === 'custom' ? '自定义' : '外部'
      return `| ${s.index} | ${origin} | [${s.id}](${uri}) | ${s.summary} | **就绪** |`
    })
    .join('\n')
  const mdZh = `# Skills

通用技能目录（编号 1～11）。真源：\`docs/zh/skills/**\`。

| 序号 | 来源 | 技能 | 一句话用途 | 状态 |
|:----:|:----:|------|------------|:----:|
${rowsZh}

在 Cursor 中：\`@\` 对应 \`docs/zh/skills/...\` 页面。
`
  fs.writeFileSync(path.join(SOT_ROOT, 'skills', 'index.md'), mdZh, 'utf8')

  const rowsEn = skills
    .map((s) => {
      const uri = withSlash(SKILL_META[s.id].uri)
      const origin = s.origin === 'custom' ? 'custom' : 'external'
      return `| ${s.index} | ${origin} | [${s.id}](${uri}) | ${s.summaryEn || s.summary} | **ready** |`
    })
    .join('\n')
  const mdEn = `# Skills

Skill catalog (1–11). English playbooks: \`docs/skills/**\`. Chinese SoT (MCP): \`docs/zh/skills/**\`.

| # | Origin | Skill | Summary | Status |
|:----:|:----:|------|------------|:----:|
${rowsEn}

In Cursor (English site): \`@docs/skills/...\`. MCP \`source\` still points at \`docs/zh/...\`.
`
  fs.mkdirSync(path.join(DOCS_ROOT, 'skills'), { recursive: true })
  fs.writeFileSync(path.join(DOCS_ROOT, 'skills', 'index.md'), mdEn, 'utf8')
}

function writeRulesIndex(rules) {
  const byLevel = { L0: [], L1: [], L2: [] }
  for (const r of rules) byLevel[r.level].push(r)

  const sectionZh = (level, title) => {
    const rows = byLevel[level]
      .map(
        (r) =>
          `| [${r.name}](${withSlash(`/zh/rules/${level}/${r.name}`)}) | ${r.title} | ${r.alwaysApply ? '是' : '—'} |`
      )
      .join('\n')
    return `### ${level}（${title}）

| 规则 | 主题 | alwaysApply |
|------|------|:-----------:|
${rows}
`
  }

  const mdZh = `# Rules

规则分层浏览。真源：\`docs/zh/rules/**\`。

${sectionZh('L0', '硬约束')}
${sectionZh('L1', '流程与协作')}
${sectionZh('L2', '场景最低限度')}

领域规则见 [Domains](/zh/domains/)。在 Cursor 中 \`@\` 对应 \`docs/zh/rules/...\`。
`
  fs.writeFileSync(path.join(SOT_ROOT, 'rules', 'index.md'), mdZh, 'utf8')

  const sectionEn = (level, title) => {
    const rows = byLevel[level]
      .map(
        (r) =>
          `| [${r.name}](${withSlash(`/rules/${level}/${r.name}`)}) | ${RULE_TITLES_EN[level]?.[r.name] || r.name} | [ZH](${withSlash(`/zh/rules/${level}/${r.name}`)}) |`
      )
      .join('\n')
    return `### ${level} (${title})

| Rule | Topic | Full (ZH) |
|------|------|:-----------:|
${rows}
`
  }

  const mdEn = `# Rules

Layered rules. Full Chinese SoT: \`docs/zh/rules/**\`.

${sectionEn('L0', 'Hard constraints')}
${sectionEn('L1', 'Process')}
${sectionEn('L2', 'Scenario')}

Domains: [Domains](/domains/) · Chinese: [Domains ZH](/zh/domains/).
`
  fs.mkdirSync(path.join(DOCS_ROOT, 'rules'), { recursive: true })
  fs.writeFileSync(path.join(DOCS_ROOT, 'rules', 'index.md'), mdEn, 'utf8')
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
          { text: 'Role catalog', link: '/agents/' },
          ...agents.map((a) => ({
            text: `${a.index}. ${a.id}`,
            link: withSlash(`/agents/standard/${a.id}`)
          }))
        ]
      }
    ]
  })
  writeJson(SIDEBAR_AGENTS_ZH, {
    '/zh/agents/': [
      {
        text: 'Agents',
        items: [
          { text: '角色目录', link: '/zh/agents/' },
          ...agents.map((a) => ({
            text: `${a.index}. ${a.id}`,
            link: withSlash(`/zh/agents/standard/${a.id}`)
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
          { text: 'Skill catalog', link: '/skills/' },
          ...skills.map((s) => ({
            text: `${s.index}. ${s.id}`,
            link: withSlash(SKILL_META[s.id].uri)
          }))
        ]
      }
    ]
  })
  writeJson(SIDEBAR_SKILLS_ZH, {
    '/zh/skills/': [
      {
        text: 'Skills',
        items: [
          { text: '技能目录', link: '/zh/skills/' },
          ...skills.map((s) => ({
            text: `${s.index}. ${s.id}`,
            link: withSlash(`/zh${SKILL_META[s.id].uri}`)
          }))
        ]
      }
    ]
  })

  const ruleItemsEn = [{ text: 'Rule catalog', link: '/rules/' }]
  const ruleItemsZh = [{ text: '规则目录', link: '/zh/rules/' }]
  for (const level of ['L0', 'L1', 'L2']) {
    ruleItemsEn.push({
      text: level,
      items: rules
        .filter((r) => r.level === level)
        .map((r) => ({
          text: r.name,
          link: withSlash(`/rules/${level}/${r.name}`)
        }))
    })
    ruleItemsZh.push({
      text: level,
      items: rules
        .filter((r) => r.level === level)
        .map((r) => ({
          text: r.name,
          link: withSlash(`/zh/rules/${level}/${r.name}`)
        }))
    })
  }
  writeJson(SIDEBAR_RULES, {
    '/rules/': [{ text: 'Rules', items: ruleItemsEn }]
  })
  writeJson(SIDEBAR_RULES_ZH, {
    '/zh/rules/': [{ text: 'Rules', items: ruleItemsZh }]
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

function discoverRulesFromDocs() {
  const rules = []
  for (const level of ['L0', 'L1', 'L2']) {
    const dir = path.join(SOT_ROOT, 'rules', level)
    if (!fs.existsSync(dir)) continue
    for (const name of fs.readdirSync(dir)) {
      const indexMd = path.join(dir, name, 'index.md')
      if (!fs.existsSync(indexMd)) continue
      const raw = fs.readFileSync(indexMd, 'utf8')
      const titleMatch = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m)
      const title = titleMatch
        ? titleMatch[1].replace(/^L[012]\s*·\s*/, '')
        : name
      rules.push({
        level,
        name,
        title,
        siteUri: `/rules/${level}/${name}`,
        sourceRel: `docs/zh/rules/${level}/${name}/index.md`,
        sitePath: `rules/${level}/${name}/index.md`,
        alwaysApply: /alwaysApply：`true`/.test(raw)
      })
    }
  }
  return rules.sort((a, b) =>
    a.level === b.level
      ? a.name.localeCompare(b.name)
      : a.level.localeCompare(b.level)
  )
}

function patchAgentRunGuides() {
  for (const agent of STANDARD_AGENTS) {
    for (const { root, locale, marker } of [
      { root: SOT_ROOT, locale: 'zh', marker: '## 技能标签（矩阵）' },
      { root: DOCS_ROOT, locale: 'en', marker: '## Skill tags (matrix)' }
    ]) {
      const out = path.join(root, 'agents', 'standard', agent.id, 'index.md')
      if (!fs.existsSync(out)) continue
      let raw = fs.readFileSync(out, 'utf8')
      const idx = raw.indexOf(marker)
      if (idx === -1) {
        raw = raw.trimEnd() + '\n\n' + buildAgentExtras(agent, locale)
      } else {
        raw = raw.slice(0, idx) + buildAgentExtras(agent, locale)
      }
      fs.writeFileSync(out, raw, 'utf8')
    }
  }
}

function writeDomainsPages(domainManifest) {
  const cfg = loadSiteConfig()
  const catalog = cfg.domains?.catalog || []
  const enabled = domainsEnabled()
  const active = new Set(cfg.domains?.active || [])

  fs.mkdirSync(path.join(SOT_ROOT, 'domains'), { recursive: true })
  fs.mkdirSync(path.join(DOCS_ROOT, 'domains'), { recursive: true })

  const rowsZh = catalog
    .map((d) => {
      const isActive = enabled && active.has(d.id)
      const link = isActive ? `[${d.title}](/zh/domains/${d.id}/)` : d.title
      const status = !enabled ? '总开关关闭' : isActive ? '**灰度中**' : '占位'
      return `| \`${d.id}\` | ${link} | ${d.summary} | ${status} |`
    })
    .join('\n')

  const mdZh = `---
title: "Domains"
description: 领域增强灰度入口
---

# Domains

领域增强目录。真源：\`docs/zh/domains/**\`。

| 领域 ID | 名称 | 说明 | 状态 |
|---------|------|------|:----:|
${rowsZh}

### 开关

- 配置：\`Code/code/site.config.json\` → \`domains.enabled\` / \`domains.active\`
- 环境变量：\`ENABLE_DOMAINS=0\` 可强制关闭

当前：\`${enabled ? 'enabled' : 'disabled'}\`；灰度：\`${[...active].join(', ') || '（无）'}\`
`
  fs.writeFileSync(path.join(SOT_ROOT, 'domains', 'index.md'), mdZh, 'utf8')

  const rowsEn = catalog
    .map((d) => {
      const isActive = enabled && active.has(d.id)
      const link = isActive
        ? `[${d.title}](/domains/${d.id}/)`
        : d.title
      const status = !enabled ? 'off' : isActive ? '**active**' : 'stub'
      return `| \`${d.id}\` | ${link} | ${d.summaryEn || d.summary} | ${status} |`
    })
    .join('\n')

  const mdEn = `---
title: "Domains"
description: Domain packs (gray release)
---

# Domains

Full Chinese content: [/zh/domains/](/zh/domains/).

| ID | Name | Summary | Status |
|---------|------|------|:----:|
${rowsEn}
`
  fs.writeFileSync(path.join(DOCS_ROOT, 'domains', 'index.md'), mdEn, 'utf8')

  const sidebarItemsEn = [{ text: 'Domain catalog', link: '/domains/' }]
  const sidebarItemsZh = [{ text: '领域目录', link: '/zh/domains/' }]
  if (enabled) {
    for (const d of catalog) {
      if (!active.has(d.id)) {
        const stubZh = path.join(SOT_ROOT, 'domains', d.id, 'index.md')
        const stubEn = path.join(DOCS_ROOT, 'domains', d.id, 'index.md')
        ensureDir(stubZh)
        ensureDir(stubEn)
        fs.writeFileSync(
          stubZh,
          `---\ntitle: "${d.title}"\n---\n\n# ${d.title}\n\n占位：尚未灰度。\n`,
          'utf8'
        )
        fs.writeFileSync(
          stubEn,
          `---\ntitle: "${d.title}"\n---\n\n# ${d.title}\n\nPlaceholder (not in gray release).\n\n[Chinese hub](/zh/domains/)\n`,
          'utf8'
        )
        continue
      }
      sidebarItemsEn.push({ text: d.title, link: withSlash(`/domains/${d.id}`) })
      sidebarItemsZh.push({
        text: d.title,
        link: withSlash(`/zh/domains/${d.id}`)
      })
      const dm = domainManifest?.[d.id]
      if (dm) {
        for (const a of dm.agents || []) {
          sidebarItemsEn.push({
            text: `Agent · ${a.id}`,
            link: withSlash(a.siteUri.replace(/^\/zh/, '') || a.siteUri)
          })
          sidebarItemsZh.push({
            text: `Agent · ${a.id}`,
            link: withSlash(
              a.siteUri.startsWith('/zh')
                ? a.siteUri
                : `/zh${a.siteUri}`
            )
          })
        }
      } else {
        // in-repo domain pages under zh
        sidebarItemsEn.push({
          text: `${d.title} (EN stub)`,
          link: withSlash(`/domains/${d.id}`)
        })
      }
    }
  }

  writeJson(SIDEBAR_DOMAINS, {
    '/domains/': [{ text: 'Domains', items: sidebarItemsEn }]
  })
  writeJson(SIDEBAR_DOMAINS_ZH, {
    '/zh/domains/': [{ text: 'Domains', items: sidebarItemsZh }]
  })
}

function syncDomainPtpNmos(standardsRoot) {
  const domainId = 'ptp-nmos'
  const base = path.join(standardsRoot, 'domains', domainId)
  if (!fs.existsSync(base)) {
    console.warn(`[sync-standards] 领域源不存在: ${base}`)
    return null
  }

  const agentsDir = path.join(base, 'agents')
  const skillsDir = path.join(base, 'skills')
  const rulesDir = path.join(base, 'rules')
  const agents = []
  const skills = []
  const rules = []

  if (fs.existsSync(agentsDir)) {
    for (const file of fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md'))) {
      const id = file.replace(/\.md$/, '')
      const sourceRel = `domains/${domainId}/agents/${file}`
      syncMarkdown({
        standardsRoot,
        sourceRel,
        sitePath: `domains/${domainId}/agents/${id}/index.md`,
        title: id,
        extras: [
          '## 在 Cursor 中运行',
          '',
          `\`@standards/${sourceRel}\``,
          '',
          `<RunGuide role-id="${id}" role-path="standards/${sourceRel}" :skills='[]' />`,
          ''
        ].join('\n')
      })
      agents.push({
        id,
        siteUri: `/domains/${domainId}/agents/${id}`,
        source: `standards/${sourceRel}`
      })
      console.log(`[sync-standards] OK domain agent ${domainId}/${id}`)
    }
  }

  if (fs.existsSync(skillsDir)) {
    for (const name of fs.readdirSync(skillsDir)) {
      const skillMd = path.join(skillsDir, name, 'SKILL.md')
      if (!fs.existsSync(skillMd)) continue
      const sourceRel = `domains/${domainId}/skills/${name}/SKILL.md`
      syncMarkdown({
        standardsRoot,
        sourceRel,
        sitePath: `domains/${domainId}/skills/${name}/index.md`,
        title: name,
        rewriteRelativeRefs: true
      })
      skills.push({
        id: name,
        siteUri: `/domains/${domainId}/skills/${name}`,
        source: `standards/${sourceRel}`
      })
      console.log(`[sync-standards] OK domain skill ${domainId}/${name}`)
    }
  }

  if (fs.existsSync(rulesDir)) {
    for (const file of fs.readdirSync(rulesDir).filter((f) => f.endsWith('.mdc'))) {
      const name = file.replace(/\.mdc$/, '')
      const sourceRel = `domains/${domainId}/rules/${file}`
      syncMarkdown({
        standardsRoot,
        sourceRel,
        sitePath: `domains/${domainId}/rules/${name}/index.md`,
        title: `${domainId} · ${name}`,
        notice: `同步自领域规则 \`.mdc\`：\`standards/${sourceRel}\`。`
      })
      rules.push({
        id: name,
        siteUri: `/domains/${domainId}/rules/${name}`,
        source: `standards/${sourceRel}`
      })
      console.log(`[sync-standards] OK domain rule ${domainId}/${name}`)
    }
  }

  const hub = `---
title: "PTP / NMOS"
description: 领域灰度：ptp-nmos
---

# PTP / NMOS

灰度领域（\`standards/domains/ptp-nmos/\`）。关闭 \`domains.enabled\` 或从 \`active\` 移除后，不影响 common。

## Agents

${agents.map((a) => `- [${a.id}](${withSlash(a.siteUri)})`).join('\n') || '_无_'}

## Skills

${skills.map((s) => `- [${s.id}](${withSlash(s.siteUri)})`).join('\n') || '_无_'}

## Rules

${rules.map((r) => `- [${r.id}](${withSlash(r.siteUri)})`).join('\n') || '_无_'}
`
  const hubPath = path.join(DOCS_ROOT, 'domains', domainId, 'index.md')
  ensureDir(hubPath)
  fs.writeFileSync(hubPath, hub, 'utf8')
  return { agents, skills, rules }
}

function syncDomains(standardsRoot) {
  const out = {}
  if (!domainsEnabled()) {
    writeDomainsPages(null)
    console.warn('[sync-standards] domains 总开关关闭；仅写目录占位')
    return out
  }
  const active = loadSiteConfig().domains?.active || []
  if (active.includes('ptp-nmos') && standardsRoot && fs.existsSync(standardsRoot)) {
    const m = syncDomainPtpNmos(standardsRoot)
    if (m) out['ptp-nmos'] = m
  } else if (active.includes('ptp-nmos')) {
    console.log('[generate] ptp-nmos 灰度开启；使用仓库内 docs/domains 页')
  }
  writeDomainsPages(out)
  return out
}

/** 扫描本仓 docs/zh，刷新 manifest / 双语言侧栏 / 目录；不覆盖技能/规则正文 */
function generateFromRepoDocs(reason) {
  console.log(`[generate] ${reason}；SoT = ${CONTENT_ROOT}/**`)
  if (process.env.STANDARDS_ROOT) {
    console.warn(
      '[generate] STANDARDS_ROOT 已忽略（本仓 docs/zh 为真源；不再从外仓拷贝正文）'
    )
  }
  if (!fs.existsSync(SOT_ROOT)) {
    console.error(`[generate] 缺少 SoT 目录: ${SOT_ROOT}`)
    process.exit(1)
  }
  const relatedDocs = []
  for (const agent of STANDARD_AGENTS) {
    for (const doc of agent.relatedDocs || []) {
      relatedDocs.push({
        siteUri: `/agents/standard/${agent.id}/docs/${doc.slug}`,
        source: `docs/zh/agents/standard/${agent.id}/docs/${doc.slug}.md`
      })
    }
  }
  const rules = discoverRulesFromDocs()
  const domains = syncDomains(null)
  writeManifest({
    contentRoot: CONTENT_ROOT,
    agents: STANDARD_AGENTS,
    relatedDocs,
    skills: STANDARD_SKILLS,
    rules,
    domains
  })
  writeSidebars(STANDARD_AGENTS, STANDARD_SKILLS, rules)
  writeAgentsIndex(STANDARD_AGENTS)
  writeSkillsIndex(STANDARD_SKILLS)
  writeRulesIndex(rules)
  writeEnglishPlaybooks(STANDARD_AGENTS, STANDARD_SKILLS)
  ensureEnglishStubs(STANDARD_AGENTS, rules, relatedDocs)
  patchAgentRunGuides()
  patchSkillCursorHints()
  console.log(
    `[generate] 完成：${STANDARD_AGENTS.length} agents + ${STANDARD_SKILLS.length} skills + ${rules.length} rules（SoT=${CONTENT_ROOT}；EN Role/Skill 全文）`
  )
}

/** 仅刷新技能页底部「在 Cursor 中使用」提示，不改正文 */
function patchSkillCursorHints() {
  for (const skill of STANDARD_SKILLS) {
    for (const { root, locale, marker } of [
      { root: SOT_ROOT, locale: 'zh', marker: '## 关联角色（矩阵反向）' },
      { root: DOCS_ROOT, locale: 'en', marker: '## Related roles (matrix reverse)' }
    ]) {
      const out = path.join(root, skill.sitePath)
      if (!fs.existsSync(out)) continue
      let raw = fs.readFileSync(out, 'utf8')
      const idx = raw.indexOf(marker)
      if (idx === -1) {
        raw = raw.trimEnd() + '\n\n' + buildSkillExtras(skill, locale)
      } else {
        raw = raw.slice(0, idx) + buildSkillExtras(skill, locale)
      }
      fs.writeFileSync(out, raw, 'utf8')
    }
  }
}

/** 写入英文 Role / Skill 全文（非 stub） */
function writeEnglishPlaybooks(agents, skills) {
  for (const a of agents) {
    const body = AGENT_BODIES[a.id]
    if (!body) {
      console.warn(`[generate] missing AGENT_BODIES[${a.id}]`)
      continue
    }
    const out = path.join(DOCS_ROOT, 'agents', 'standard', a.id, 'index.md')
    ensureDir(out)
    const desc = (a.summaryEn || a.summary || a.id).replace(/"/g, '\\"')
    const page = `---
title: "${a.id}"
description: "${desc}"
---

${body.trimEnd()}

${buildAgentExtras(a, 'en')}
`
    fs.writeFileSync(out, page, 'utf8')
  }

  for (const s of skills) {
    const body = SKILL_BODIES[s.id]
    if (!body) {
      console.warn(`[generate] missing SKILL_BODIES[${s.id}]`)
      continue
    }
    const out = path.join(DOCS_ROOT, s.sitePath)
    ensureDir(out)
    const desc = (s.summaryEn || s.summary || s.id).replace(/"/g, '\\"')
    const page = `---
title: "${s.id}"
description: "${desc}"
---

${body.trimEnd()}

${buildSkillExtras(s, 'en')}
`
    fs.writeFileSync(out, page, 'utf8')
  }
}

/** 英文 root stub：仅 rules / relatedDocs / domains（Role/Skill 已有全文） */
function ensureEnglishStubs(agents, rules, relatedDocs) {
  const writeStub = (relPath, title, zhLink, summary) => {
    const out = path.join(DOCS_ROOT, relPath)
    ensureDir(out)
    const body = `---
title: "${title}"
description: English stub — full playbook in Chinese locale
---

# ${title}

> **English stub.** Full content (Chinese SoT): [${zhLink}](${zhLink})

${summary || ''}

Edit the source of truth at \`docs/zh/${relPath.replace(/\\/g, '/')}\`.
`
    fs.writeFileSync(out, body, 'utf8')
  }

  for (const r of rules) {
    writeStub(
      `rules/${r.level}/${r.name}/index.md`,
      r.name,
      `/zh/rules/${r.level}/${r.name}/`,
      RULE_TITLES_EN[r.level]?.[r.name] || r.name
    )
  }
  for (const d of relatedDocs || []) {
    const fileRel = `${d.siteUri.replace(/^\//, '')}.md`
    const agentId = d.siteUri.split('/')[3]
    const agent = agents.find((a) => a.id === agentId)
    const docMeta = agent?.relatedDocs?.find((x) =>
      d.siteUri.endsWith(`/docs/${x.slug}`)
    )
    writeStub(
      fileRel,
      docMeta?.titleEn || path.basename(d.siteUri),
      `/zh${d.siteUri}`,
      docMeta?.titleEn || 'Related document stub.'
    )
  }

  if (fs.existsSync(path.join(SOT_ROOT, 'domains', 'ptp-nmos'))) {
    writeStub(
      'domains/ptp-nmos/index.md',
      'PTP / NMOS',
      '/zh/domains/ptp-nmos/',
      'Domain pack gray release.'
    )
  }
}

function writeManifest({
  contentRoot,
  agents,
  relatedDocs,
  skills,
  rules,
  domains = {}
}) {
  const manifest = {
    generatedAt: new Date().toISOString(),
    contentRoot: String(contentRoot || CONTENT_ROOT).replace(/\\/g, '/'),
    /** @deprecated 兼容旧校验/读端；等于 contentRoot */
    standardsRoot: String(contentRoot || CONTENT_ROOT).replace(/\\/g, '/'),
    note: 'SoT=本仓 docs/zh/**；英文 root 含 Role/Skill 全文；rules/domains 可为 stub；agents + skills 1～11 + rules；domains 灰度',
    domainsEnabled: domainsEnabled(),
    domainsActive: loadSiteConfig().domains?.active || [],
    agents: agents.map((a) => ({
      index: a.index,
      id: a.id,
      title: a.title,
      summary: a.summary,
      siteUri: `/agents/standard/${a.id}`,
      source: `docs/zh/agents/standard/${a.id}/index.md`,
      skills: a.skills,
      skillsRecommended: a.skillsRecommended
    })),
    relatedDocs,
    skills: skills.map((s) => ({
      index: s.index,
      id: s.id,
      origin: s.origin,
      siteUri: SKILL_META[s.id].uri,
      source: `docs/zh/${s.sitePath.replace(/\\/g, '/')}`,
      boundAgents: s.boundAgents,
      recommendedAgents: s.recommendedAgents
    })),
    rules: rules.map((r) => ({
      level: r.level,
      name: r.name,
      title: r.title,
      siteUri: `/rules/${r.level}/${r.name}`,
      source: r.sourceRel.startsWith('docs/')
        ? r.sourceRel
        : `docs/zh/${r.sitePath}`,
      alwaysApply: r.alwaysApply || false
    })),
    domains
  }
  writeJson(MANIFEST_OUT, manifest)
}

function main() {
  generateFromRepoDocs('本仓 docs/zh SoT + 英文 Role/Skill 全文')
}

main()

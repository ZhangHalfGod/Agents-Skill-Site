/**
 * 阶段 4 门禁：校验 manifest ↔ 站点页 ↔ URI/矩阵基线。
 * 失败 exit 1，阻断 npm run build。
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CODE_ROOT = path.resolve(__dirname, '..')
const DOCS_ROOT = path.join(CODE_ROOT, 'docs')
const MANIFEST = path.join(DOCS_ROOT, 'public', 'manifest.json')
const HEALTH = path.join(DOCS_ROOT, 'public', 'health.json')
const REPORT = path.join(DOCS_ROOT, 'public', 'validate-report.json')
const HEALTH_PAGE = path.join(DOCS_ROOT, 'health', 'index.md')

/** Doc/03 + Doc/05 一期基线（与 sync-standards 对齐） */
const EXPECTED_AGENTS = [
  'ProductManager',
  'Architect',
  'DevLead',
  'TestEngineer',
  'SecurityEngineer',
  'OpsEngineer',
  'UIDesigner',
  'NmosEngineer'
]

const EXPECTED_SKILLS = [
  { id: 'ai-code-boundary', siteUri: '/skills/custom/common/ai-code-boundary' },
  { id: 'traceability-compliance', siteUri: '/skills/custom/common/traceability-compliance' },
  { id: 'prompt-versioning', siteUri: '/skills/custom/common/prompt-versioning' },
  { id: 'stage-gate-flow', siteUri: '/skills/custom/common/stage-gate-flow' },
  { id: 'doc-coauthoring', siteUri: '/skills/external/doc-coauthoring' },
  { id: 'mcp-builder', siteUri: '/skills/external/mcp-builder' },
  { id: 'frontend-design', siteUri: '/skills/external/frontend-design' },
  { id: 'webapp-testing', siteUri: '/skills/external/webapp-testing' },
  { id: 'web-artifacts-builder', siteUri: '/skills/external/web-artifacts-builder' },
  { id: 'skill-creator', siteUri: '/skills/external/skill-creator' },
  { id: 'Human', siteUri: '/skills/external/Human' }
]

/** 矩阵必显技能（Doc/05 §2） */
const MATRIX_REQUIRED = {
  ProductManager: ['stage-gate-flow', 'ai-code-boundary'],
  Architect: ['stage-gate-flow', 'ai-code-boundary', 'traceability-compliance'],
  DevLead: ['stage-gate-flow', 'prompt-versioning', 'traceability-compliance'],
  TestEngineer: ['stage-gate-flow', 'traceability-compliance'],
  SecurityEngineer: ['traceability-compliance'],
  OpsEngineer: ['traceability-compliance'],
  UIDesigner: ['frontend-design', 'doc-coauthoring'],
  NmosEngineer: ['stage-gate-flow', 'traceability-compliance']
}

function siteUriToDocPath(siteUri) {
  const rel = siteUri.replace(/^\//, '')
  const asIndex = path.join(DOCS_ROOT, rel, 'index.md')
  const asMd = path.join(DOCS_ROOT, `${rel}.md`)
  if (fs.existsSync(asIndex)) return asIndex
  if (fs.existsSync(asMd)) return asMd
  return null
}

function fail(errors, msg) {
  errors.push(msg)
}

function contentHash(manifest) {
  const payload = JSON.stringify({
    agents: (manifest.agents || []).map((a) => [a.id, a.siteUri, a.skills]),
    skills: (manifest.skills || []).map((s) => [s.id, s.siteUri]),
    rules: (manifest.rules || []).map((r) => [r.level, r.name, r.siteUri])
  })
  return crypto.createHash('sha256').update(payload).digest('hex').slice(0, 16)
}

function writeHealthPage(health) {
  const dir = path.dirname(HEALTH_PAGE)
  fs.mkdirSync(dir, { recursive: true })
  const lines = [
    '---',
    'title: 构建健康摘要',
    'description: 阶段 4 扫描/校验摘要（构建时生成）',
    '---',
    '',
    '# 构建健康摘要',
    '',
    '> 由 `npm run validate` 生成。对应 URI 注册表可选 `/api/health`；一期用静态页。',
    '',
    '| 项 | 值 |',
    '|----|-----|',
    `| 状态 | **${health.ok ? 'OK' : 'FAIL'}** |`,
    `| 扫描/校验时间 | \`${health.validatedAt}\` |`,
    `| 内容哈希 | \`${health.contentHash}\` |`,
    `| Agents | ${health.counts.agents}（期望 8） |`,
    `| Skills | ${health.counts.skills}（期望 11） |`,
    `| Rules | ${health.counts.rules} |`,
    `| 错误数 | ${health.errorCount} |`,
    '',
    '原始数据：',
    '',
    '- [`/manifest.json`](/manifest.json)',
    '- [`/health.json`](/health.json)',
    '- [`/validate-report.json`](/validate-report.json)',
    ''
  ]
  if (health.errors?.length) {
    lines.push('## 错误', '')
    for (const e of health.errors) lines.push(`- ${e}`)
    lines.push('')
  }
  fs.writeFileSync(HEALTH_PAGE, lines.join('\n'), 'utf8')
}

function main() {
  const errors = []
  const warnings = []

  if (!fs.existsSync(MANIFEST)) {
    console.error(`[validate] 缺少 manifest: ${MANIFEST}`)
    console.error('[validate] 请先 npm run generate（或确保仓库内已有 docs/public/manifest.json）')
    process.exit(1)
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'))
  const agents = manifest.agents || []
  const skills = manifest.skills || []
  const rules = manifest.rules || []
  const relatedDocs = manifest.relatedDocs || []

  if (agents.length !== 8) fail(errors, `agents 数量 ${agents.length} ≠ 8`)
  if (skills.length !== 11) fail(errors, `skills 数量 ${skills.length} ≠ 11`)
  if (rules.length < 10) fail(errors, `rules 数量 ${rules.length} < 10（期望至少 L0×3+L1×3+L2×4）`)

  const agentIds = agents.map((a) => a.id)
  for (const id of EXPECTED_AGENTS) {
    if (!agentIds.includes(id)) fail(errors, `缺少 agent: ${id}`)
  }
  for (const a of agents) {
    if (!EXPECTED_AGENTS.includes(a.id)) fail(errors, `多余/未知 agent: ${a.id}`)
    const page = siteUriToDocPath(a.siteUri)
    if (!page) fail(errors, `agent 页缺失: ${a.siteUri}`)
    const required = MATRIX_REQUIRED[a.id] || []
    for (const sk of required) {
      if (!(a.skills || []).includes(sk)) {
        fail(errors, `矩阵必显技能缺失: ${a.id} → ${sk}`)
      }
    }
    for (const sk of [...(a.skills || []), ...(a.skillsRecommended || [])]) {
      if (!skills.some((s) => s.id === sk)) {
        fail(errors, `agent ${a.id} 引用未知技能: ${sk}`)
      }
    }
  }

  for (const exp of EXPECTED_SKILLS) {
    const s = skills.find((x) => x.id === exp.id)
    if (!s) {
      fail(errors, `缺少 skill: ${exp.id}`)
      continue
    }
    if (s.siteUri !== exp.siteUri) {
      fail(errors, `skill URI 不符: ${exp.id} 期望 ${exp.siteUri} 实际 ${s.siteUri}`)
    }
    const page = siteUriToDocPath(s.siteUri)
    if (!page) fail(errors, `skill 页缺失: ${s.siteUri}`)
  }

  for (const r of rules) {
    const page = siteUriToDocPath(r.siteUri)
    if (!page) fail(errors, `rule 页缺失: ${r.siteUri}`)
    if (!/^\/rules\/L[012]\//.test(r.siteUri)) {
      fail(errors, `rule URI 模式不符: ${r.siteUri}`)
    }
  }

  for (const d of relatedDocs) {
    const page = siteUriToDocPath(d.siteUri)
    if (!page) fail(errors, `附属文档页缺失: ${d.siteUri}`)
  }

  // 分区首页
  for (const uri of ['/agents', '/skills', '/rules']) {
    if (!siteUriToDocPath(uri)) fail(errors, `分区首页缺失: ${uri}`)
  }

  const hash = contentHash(manifest)
  const ok = errors.length === 0
  const validatedAt = new Date().toISOString()

  const health = {
    ok,
    validatedAt,
    contentHash: hash,
    generatedAt: manifest.generatedAt || null,
    standardsRoot: manifest.standardsRoot || null,
    counts: {
      agents: agents.length,
      skills: skills.length,
      rules: rules.length,
      relatedDocs: relatedDocs.length
    },
    errorCount: errors.length,
    warningCount: warnings.length,
    errors,
    warnings
  }

  const report = {
    ...health,
    expected: {
      agents: EXPECTED_AGENTS.length,
      skills: EXPECTED_SKILLS.length,
      rulesMin: 10
    }
  }

  fs.mkdirSync(path.dirname(HEALTH), { recursive: true })
  fs.writeFileSync(HEALTH, JSON.stringify(health, null, 2) + '\n', 'utf8')
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2) + '\n', 'utf8')

  // 回写 hash 到 manifest
  manifest.contentHash = hash
  manifest.validatedAt = validatedAt
  manifest.validateOk = ok
  manifest.note = 'SoT=本仓 docs/**；agents + skills 1～11 + rules；domains 灰度'
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n', 'utf8')

  writeHealthPage(health)

  if (!ok) {
    console.error('[validate] FAIL')
    for (const e of errors) console.error(`  - ${e}`)
    process.exit(1)
  }

  console.log(
    `[validate] OK agents=${agents.length} skills=${skills.length} rules=${rules.length} hash=${hash}`
  )
}

main()

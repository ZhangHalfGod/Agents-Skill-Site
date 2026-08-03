/**
 * 四期 4A：跨项目 Lesson 扫描（只读）。
 * 扫描 docs/zh/operations/<project>/lessons/*.md 的 frontmatter，输出：
 *   1. 状态看板（各项目 raw/distilled/merged/rejected 计数）
 *   2. 聚类报告（target_id / related_skills 归并 + slug 关键词相似提示）
 *   3. 升格建议清单（scope=common 或跨项目重复，供人工终审）
 * 用法：
 *   node scripts/lesson-scan.mjs           # markdown 报告到 stdout
 *   node scripts/lesson-scan.mjs --strict  # 校验 frontmatter 合法性，违规 exit 1
 *   node scripts/lesson-scan.mjs --format digest  # 确定性纯文本摘要（飞书推送用，agent 原样转发）
 * 纪律：只读、不改任何正文；升格合入永远走人工蒸馏终审。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const CODE_ROOT = path.resolve(__dirname, '..')
const OPERATIONS_ROOT = path.join(CODE_ROOT, 'docs', 'zh', 'operations')

const STRICT = process.argv.includes('--strict')

const STATUS_ENUM = ['raw', 'distilled', 'merged', 'rejected']
const SCOPE_ENUM = ['project', 'domain', 'common']
const PRIORITY_ENUM = ['P0', 'P1', 'P2', 'P3']
const AUDIENCE_ENUM = ['skill', 'agent', 'rule', 'unknown']
const STOPWORDS = new Set(['the', 'and', 'for', 'with', 'not', 'vs', 'into', 'from'])

/** 轻量 frontmatter 解析：支持标量、行内 [a, b]、块列表（- item） */
function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return null
  const data = {}
  let lastKey = null
  for (const rawLine of m[1].split(/\r?\n/)) {
    const line = rawLine.replace(/\s+#.*$/, '')
    if (!line.trim()) continue
    const listItem = line.match(/^\s+-\s+(.+)$/)
    if (listItem && lastKey) {
      if (!Array.isArray(data[lastKey])) data[lastKey] = []
      data[lastKey].push(stripQuotes(listItem[1].trim()))
      continue
    }
    const kv = line.match(/^([A-Za-z_][\w]*)\s*:\s*(.*)$/)
    if (!kv) continue
    const [, key, rawVal] = kv
    lastKey = key
    const val = rawVal.trim()
    if (val === '') {
      data[key] = ''
    } else if (val.startsWith('[') && val.endsWith(']')) {
      const inner = val.slice(1, -1).trim()
      data[key] = inner ? inner.split(',').map((s) => stripQuotes(s.trim())) : []
    } else {
      data[key] = stripQuotes(val)
    }
  }
  return data
}

function stripQuotes(s) {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
  }
  return s
}

/** 卡标题：frontmatter 之后首个一级标题，去 “Lesson：” 前缀 */
function extractTitle(text) {
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const m = body.match(/^#\s+(.+)$/m)
  return m ? m[1].trim().replace(/^Lesson[：:]\s*/, '') : ''
}

/** slug 关键词：去日期、去停词、长度 >= 3 */
function slugKeywords(id) {
  return String(id || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 3 && !/^\d+$/.test(t) && !STOPWORDS.has(t))
}

function collectLessons() {
  const lessons = []
  if (!fs.existsSync(OPERATIONS_ROOT)) return lessons
  for (const proj of fs.readdirSync(OPERATIONS_ROOT)) {
    if (proj.startsWith('_')) continue
    const lessonsDir = path.join(OPERATIONS_ROOT, proj, 'lessons')
    if (!fs.existsSync(lessonsDir) || !fs.statSync(lessonsDir).isDirectory()) continue
    for (const file of fs.readdirSync(lessonsDir)) {
      if (!file.endsWith('.md') || file.startsWith('_')) continue
      const full = path.join(lessonsDir, file)
      const text = fs.readFileSync(full, 'utf8')
      const fm = parseFrontmatter(text)
      if (!fm) {
        lessons.push({ project: proj, file: path.relative(CODE_ROOT, full), parseError: true })
        continue
      }
      lessons.push({
        project: proj,
        file: path.relative(CODE_ROOT, full).replace(/\\/g, '/'),
        id: fm.id || file.replace(/\.md$/, ''),
        title: extractTitle(text),
        date: fm.date || '',
        status: fm.status || '',
        scope: fm.scope || '',
        priority: fm.priority || '',
        audience: fm.audience || '',
        target_id: fm.target_id || '',
        promoted_to: fm.promoted_to || '',
        seen_in_projects: Array.isArray(fm.seen_in_projects) ? fm.seen_in_projects : [],
        related_skills: Array.isArray(fm.related_skills) ? fm.related_skills : [],
        related_agents: Array.isArray(fm.related_agents) ? fm.related_agents : []
      })
    }
  }
  return lessons
}

function validateLessons(lessons) {
  const errors = []
  for (const l of lessons) {
    if (l.parseError) {
      errors.push(`${l.project}/${l.file}: 缺少合法 frontmatter`)
      continue
    }
    const tag = `${l.project}/lessons/${l.id}`
    if (!l.id) errors.push(`${tag}: 缺 id`)
    if (!/^\d{4}-\d{2}-\d{2}/.test(l.date)) errors.push(`${tag}: date 非法或缺失`)
    if (!STATUS_ENUM.includes(l.status)) errors.push(`${tag}: status 非法（${l.status || '空'}）`)
    if (!SCOPE_ENUM.includes(l.scope)) errors.push(`${tag}: scope 非法或缺失（${l.scope || '空'}，须为 ${SCOPE_ENUM.join('|')}）`)
    if (l.priority && !PRIORITY_ENUM.includes(l.priority)) errors.push(`${tag}: priority 非法（${l.priority}）`)
    if (l.audience && !AUDIENCE_ENUM.includes(l.audience)) errors.push(`${tag}: audience 非法（${l.audience}）`)
    if (l.status === 'merged' && !l.promoted_to) errors.push(`${tag}: status=merged 但 promoted_to 为空`)
  }
  return errors
}

/** 聚类：target_id 优先，其次 related_skills[0]；返回 { key: lessons[] } */
function cluster(lessons) {
  const groups = new Map()
  for (const l of lessons) {
    if (l.parseError) continue
    const key = l.target_id || l.related_skills[0] || ''
    if (!key) continue
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(l)
  }
  return groups
}

/** 关键词相似对：跨项目且共享 >= 2 个 slug 关键词 */
function keywordPairs(lessons) {
  const pairs = []
  const kw = lessons.map((l) => new Set(slugKeywords(l.id)))
  for (let i = 0; i < lessons.length; i++) {
    for (let j = i + 1; j < lessons.length; j++) {
      if (lessons[i].project === lessons[j].project) continue
      const shared = [...kw[i]].filter((k) => kw[j].has(k))
      if (shared.length >= 2) pairs.push({ a: lessons[i], b: lessons[j], shared })
    }
  }
  return pairs
}

function projectsOf(list) {
  return [...new Set(list.map((l) => l.project))]
}

function suggestTarget(l) {
  const base = l.target_id || l.related_skills[0] || '<待定>'
  return `docs/zh/skills/custom/common/${base}/`
}

/** 升格建议：scope=common，或 target 跨项目重复；供报告与 digest 共用，避免两处逻辑漂移 */
function collectSuggestions(lessons) {
  const groups = cluster(lessons)
  const crossKeys = new Set(
    [...groups.entries()].filter(([, list]) => projectsOf(list).length >= 2).map(([k]) => k)
  )
  const suggestions = []
  for (const l of lessons) {
    if (l.parseError || !['raw', 'distilled'].includes(l.status)) continue
    const key = l.target_id || l.related_skills[0] || ''
    if (l.scope === 'common') {
      suggestions.push({ l, reason: 'scope=common' })
    } else if (key && crossKeys.has(key)) {
      suggestions.push({ l, reason: `跨项目重复（${key} 出现于 ${projectsOf(groups.get(key)).length} 个项目）` })
    }
  }
  return suggestions
}

function statusTotals(lessons) {
  const t = { raw: 0, distilled: 0, merged: 0, rejected: 0 }
  for (const l of lessons) if (t[l.status] !== undefined) t[l.status]++
  return t
}

/** 确定性摘要骨架：weekly-lesson-digest cron 用。agent 须逐行原样保留，只允许按条追加「判决建议」行 */
function renderDigest(lessons) {
  const d = new Date()
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  const suggestions = collectSuggestions(lessons)
  if (!suggestions.length) {
    const t = statusTotals(lessons)
    return `📋 本周无待终审升格建议（raw ${t.raw} · distilled ${t.distilled} · merged ${t.merged}）`
  }
  const lines = [`【每周升格建议】${today}`, '']
  suggestions.forEach(({ l, reason }, i) => {
    lines.push(`${i + 1}. 《${l.title || l.id}》`)
    lines.push(`   卡 \`${l.id}\`（${l.priority || 'P?'} · ${l.status} · scope=${l.scope || '?'} · ${l.project}）`)
    lines.push(`   建议升格至 \`${suggestTarget(l)}\`（原因：${reason}）`)
  })
  lines.push(
    '',
    '终审：飞书回复「同意升格」或「同意蒸馏」整包执行合入并本机 commit develop（不 push）；或逐条在仓内改。',
    '完整扫描：`npm run lessons:scan`（Code\\code 目录）· 契约：Doc/phase4/09-feishu-promote-pipeline.md',
  )
  return lines.join('\n')
}

function renderReport(lessons) {
  const lines = []
  const now = new Date().toISOString().slice(0, 10)
  lines.push(`# Lesson 扫描报告（${now}）`, '')
  lines.push('> 由 `npm run lessons:scan` 生成（只读）。升格合入须人工蒸馏终审。', '')

  // 1. 状态看板
  lines.push('## 状态看板', '')
  lines.push('| 项目 | raw | distilled | merged | rejected | 合计 |')
  lines.push('|------|----:|----------:|-------:|---------:|-----:|')
  const byProject = new Map()
  for (const l of lessons) {
    if (!byProject.has(l.project)) byProject.set(l.project, [])
    byProject.get(l.project).push(l)
  }
  const totals = { raw: 0, distilled: 0, merged: 0, rejected: 0 }
  for (const [proj, list] of [...byProject.entries()].sort()) {
    const c = { raw: 0, distilled: 0, merged: 0, rejected: 0 }
    for (const l of list) if (c[l.status] !== undefined) c[l.status]++
    for (const k of Object.keys(totals)) totals[k] += c[k]
    lines.push(`| ${proj} | ${c.raw} | ${c.distilled} | ${c.merged} | ${c.rejected} | ${list.length} |`)
  }
  lines.push(`| **合计** | **${totals.raw}** | **${totals.distilled}** | **${totals.merged}** | **${totals.rejected}** | **${lessons.length}** |`, '')

  // 2. 聚类报告
  lines.push('## 聚类报告（按 target_id / 主技能）', '')
  const groups = cluster(lessons)
  let anyCluster = false
  for (const [key, list] of [...groups.entries()].sort()) {
    const projs = projectsOf(list)
    const cross = projs.length >= 2
    if (cross) anyCluster = true
    lines.push(`### ${key}${cross ? '（跨项目 ⚠）' : ''}`, '')
    for (const l of list) {
      lines.push(`- [${l.status}] \`${l.project}/lessons/${l.id}\` — scope=${l.scope || '未填'}`)
    }
    lines.push('')
  }
  const pairs = keywordPairs(lessons.filter((l) => !l.parseError))
  if (pairs.length) {
    lines.push('### 关键词相似提示（跨项目，人工核对是否同一教训）', '')
    for (const p of pairs) {
      lines.push(`- \`${p.a.project}/${p.a.id}\` ↔ \`${p.b.project}/${p.b.id}\`（共享：${p.shared.join(', ')}）`)
    }
    lines.push('')
  }
  if (!anyCluster && !pairs.length) lines.push('（暂无跨项目聚类命中）', '')

  // 3. 升格建议清单
  lines.push('## 升格建议清单（供人工终审，勿自动合入）', '')
  const suggestions = collectSuggestions(lessons)
  if (suggestions.length) {
    lines.push('| Lesson | 项目 | 状态 | 建议原因 | 建议合入目标 |')
    lines.push('|--------|------|------|----------|--------------|')
    for (const { l, reason } of suggestions) {
      lines.push(`| ${l.id} | ${l.project} | ${l.status} | ${reason} | \`${suggestTarget(l)}\` |`)
    }
    lines.push('', '终审动作：按 operations README「升格操作步骤」走 distilled → 改正文 → merged → generate。')
  } else {
    lines.push('（本轮无待终审的跨项目升格建议）')
  }
  lines.push('')

  // 4. 已升格参考
  const mergedCommon = lessons.filter((l) => l.status === 'merged' && l.scope === 'common')
  if (mergedCommon.length) {
    lines.push('## 已升格（scope=common，供检索）', '')
    for (const l of mergedCommon) {
      lines.push(`- \`${l.project}/lessons/${l.id}\` → ${l.promoted_to || '（promoted_to 未填）'}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

function main() {
  const lessons = collectLessons()
  const errors = validateLessons(lessons)

  const fmtIdx = process.argv.indexOf('--format')
  if (fmtIdx >= 0 && process.argv[fmtIdx + 1] === 'digest') {
    process.stdout.write(renderDigest(lessons) + '\n')
    return
  }

  if (STRICT) {
    if (errors.length) {
      console.error('[lessons:scan] --strict FAIL')
      for (const e of errors) console.error(`  - ${e}`)
      process.exit(1)
    }
    console.log(`[lessons:scan] --strict OK（${lessons.length} 条 lesson frontmatter 合法）`)
    return
  }

  process.stdout.write(renderReport(lessons) + '\n')
  if (errors.length) {
    console.error(`[lessons:scan] 提示：${errors.length} 条 frontmatter 问题（npm run lessons:scan -- --strict 可阻断）`)
    for (const e of errors) console.error(`  - ${e}`)
  }
}

main()

/**
 * 阶段 7.2：扫描站点 docs 内链，报告死链。
 * 用法：node scripts/check-dead-links.mjs
 * 失败 exit 1（有死链时）。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(__dirname, '../docs')
const REPORT = path.join(DOCS_ROOT, 'public', 'dead-link-report.json')

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc
  for (const name of fs.readdirSync(dir)) {
    if (name === '.vitepress' || name === 'node_modules') continue
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p, acc)
    else if (/\.(md|mdc)$/i.test(name)) acc.push(p)
  }
  return acc
}

function resolveInternal(href, fromFile) {
  // strip hash/query
  let h = href.split('#')[0].split('?')[0]
  if (!h || h.startsWith('http') || h.startsWith('mailto:') || h.startsWith('#')) {
    return { skip: true }
  }
  // VitePress absolute site path
  if (h.startsWith('/')) {
    h = h.replace(/\/$/, '')
    const rel = h.slice(1)
    const candidates = [
      path.join(DOCS_ROOT, 'public', rel),
      path.join(DOCS_ROOT, rel, 'index.md'),
      path.join(DOCS_ROOT, `${rel}.md`),
      path.join(DOCS_ROOT, rel)
    ]
    return { candidates, href }
  }
  // relative
  const base = path.dirname(fromFile)
  const cleaned = h.replace(/\/$/, '')
  const candidates = [
    path.resolve(base, cleaned),
    path.resolve(base, cleaned + '.md'),
    path.resolve(base, cleaned, 'index.md')
  ]
  return { candidates, href }
}

function extractLinks(md) {
  const links = []
  const re = /\[([^\]]*)\]\(([^)]+)\)/g
  let m
  while ((m = re.exec(md))) {
    links.push(m[2].trim())
  }
  // bare <RunGuide ...> etc ignored
  return links
}

function main() {
  const files = walk(DOCS_ROOT)
  const dead = []
  let checked = 0

  for (const file of files) {
    const md = fs.readFileSync(file, 'utf8')
    for (const href of extractLinks(md)) {
      const r = resolveInternal(href, file)
      if (r.skip) continue
      checked++
      const ok = r.candidates.some((c) => fs.existsSync(c))
      if (!ok) {
        dead.push({
          file: path.relative(DOCS_ROOT, file).replace(/\\/g, '/'),
          href,
          tried: r.candidates.map((c) => path.relative(DOCS_ROOT, c).replace(/\\/g, '/'))
        })
      }
    }
  }

  const report = {
    scannedAt: new Date().toISOString(),
    files: files.length,
    linksChecked: checked,
    deadCount: dead.length,
    dead
  }
  fs.mkdirSync(path.dirname(REPORT), { recursive: true })
  fs.writeFileSync(REPORT, JSON.stringify(report, null, 2) + '\n', 'utf8')

  if (dead.length) {
    console.error(`[dead-links] FAIL ${dead.length} 条`)
    for (const d of dead.slice(0, 30)) {
      console.error(`  ${d.file} → ${d.href}`)
    }
    if (dead.length > 30) console.error(`  …另有 ${dead.length - 30} 条`)
    process.exit(1)
  }
  console.log(`[dead-links] OK files=${files.length} links=${checked}`)
}

main()

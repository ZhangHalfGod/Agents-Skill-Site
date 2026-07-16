/**
 * 一次性：去掉「同步自 standards / 请勿手改」误导文案。
 * SoT 已改为本仓 docs；正文可直接编辑。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DOCS_ROOT = path.resolve(__dirname, '../docs')

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walk(p, out)
    else if (name.endsWith('.md')) out.push(p)
  }
  return out
}

let changed = 0
for (const file of walk(DOCS_ROOT)) {
  let raw = fs.readFileSync(file, 'utf8')
  const before = raw

  raw = raw.replace(
    /description:\s*只读同步自 standards；请改源文件后执行 npm run sync\s*\n/,
    'description: 本仓 docs 真源；直接编辑本页后 npm run generate\n'
  )

  raw = raw.replace(
    /::: info Source of Truth\r?\n[\s\S]*?:::\r?\n\r?\n/g,
    ''
  )

  raw = raw.replace(
    /同步自 \`.mdc\`：`standards\/[^`]+`。本站只读呈现，不注入 Cursor Rules。\n?/g,
    '本站只读呈现规则正文，不注入 Cursor Rules。\n'
  )

  raw = raw.replace(
    /同步自领域规则 \`.mdc\`：`standards\/[^`]+`。\n?/g,
    '领域规则正文（本仓 docs 真源）。\n'
  )

  raw = raw.replace(/`@standards\/([^`]+)`/g, (_, rel) => {
    // best-effort map old standards paths → docs
    if (rel.includes('/agents/')) {
      const m = rel.match(/agents\/standard\/([^/]+)\//)
      if (m) return `\`@docs/agents/standard/${m[1]}/index.md\``
    }
    if (rel.includes('/skills/')) {
      const m = rel.match(/skills\/(.+)\/SKILL\.md$/)
      if (m) return `\`@docs/skills/${m[1]}/index.md\``
    }
    if (rel.includes('/rules/')) {
      const m = rel.match(/rules\/(L[012])\/([^/.]+)/)
      if (m) return `\`@docs/rules/${m[1]}/${m[2]}/index.md\``
    }
    return `\`@docs/…（原 standards/${rel}）\``
  })

  // metadata 源路径行
  raw = raw.replace(
    /- 源路径：`standards\/([^`]+)`/g,
    '- 真源：本页（`docs/…`）'
  )

  if (raw !== before) {
    fs.writeFileSync(file, raw, 'utf8')
    changed++
    console.log('[strip]', path.relative(DOCS_ROOT, file))
  }
}

console.log(`[strip] 更新 ${changed} 个文件`)

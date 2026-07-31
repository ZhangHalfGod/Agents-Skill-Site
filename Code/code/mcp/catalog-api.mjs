/**
 * 二期 catalog API — 只读消费 manifest（本地 PATH 或远程 URL）
 * 约束：Doc/phase2/01-mcp-server-plan.md、Doc/phase2/02-remote-manifest.md
 * 四期 SF-HS：getSourceText 只读返回 docs 正文（仍禁止写）
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = path.resolve(__dirname, '../docs/public')
const DEFAULT_MANIFEST = path.join(PUBLIC_DIR, 'manifest.json')
/** Code/code — source 形如 docs/zh/... 相对此根 */
const DEFAULT_DOCS_ROOT = path.resolve(__dirname, '..')
const DEFAULT_TTL_MS = 60_000
const DEFAULT_SOURCE_MAX_CHARS = 48_000

/** @type {{ manifest: object, loadedAt: number, source: string } | null} */
let cache = null

export function resolveManifestPath() {
  return process.env.MANIFEST_PATH
    ? path.resolve(process.env.MANIFEST_PATH)
    : DEFAULT_MANIFEST
}

export function resolveManifestUrl() {
  const u = process.env.MANIFEST_URL?.trim()
  return u || null
}

export function resolveCatalogBaseUrl() {
  if (process.env.CATALOG_BASE_URL?.trim()) {
    return process.env.CATALOG_BASE_URL.trim().replace(/\/$/, '')
  }
  const url = resolveManifestUrl()
  if (!url) return null
  try {
    const u = new URL(url)
    const parts = u.pathname.split('/').filter(Boolean)
    if (parts.length && parts[parts.length - 1].endsWith('.json')) {
      parts.pop()
    }
    u.pathname = '/' + parts.join('/')
    return u.toString().replace(/\/$/, '')
  } catch {
    return null
  }
}

/** 正文根目录：DOCS_ROOT > MANIFEST_PATH 推导（…/docs/public/manifest.json → …/code）> 默认 Code/code */
export function resolveDocsRoot() {
  if (process.env.DOCS_ROOT?.trim()) {
    return path.resolve(process.env.DOCS_ROOT.trim())
  }
  if (process.env.MANIFEST_PATH?.trim()) {
    // manifest 在 <codeRoot>/docs/public/；source 形如 docs/zh/...，相对 <codeRoot>
    const publicDir = path.dirname(path.resolve(process.env.MANIFEST_PATH))
    const docsDir = path.dirname(publicDir)
    return path.dirname(docsDir)
  }
  if (!resolveManifestUrl()) {
    return DEFAULT_DOCS_ROOT
  }
  return DEFAULT_DOCS_ROOT
}

/** 可选：无本地文件时按 CONTENT_BASE_URL + source 拉取（勿含密钥） */
export function resolveContentBaseUrl() {
  const u = process.env.CONTENT_BASE_URL?.trim()
  return u ? u.replace(/\/$/, '') : null
}

/**
 * @param {string} raw
 * @returns {{ ok: true, source: string } | { ok: false, error: string, message: string }}
 */
export function normalizeSourcePath(raw) {
  if (raw == null || String(raw).trim() === '') {
    return { ok: false, error: 'BAD_SOURCE', message: '需要 source 或可解析的 id' }
  }
  let s = String(raw).trim().replace(/\\/g, '/')
  if (s.startsWith('./')) s = s.slice(2)
  if (s.startsWith('/')) s = s.slice(1)
  if (s.includes('\0') || s.split('/').some((p) => p === '..')) {
    return { ok: false, error: 'BAD_SOURCE', message: 'source 含非法路径段' }
  }
  if (!/^docs\/(zh|en)\//.test(s)) {
    return {
      ok: false,
      error: 'BAD_SOURCE',
      message: 'source 必须在 docs/zh/ 或 docs/en/ 下'
    }
  }
  if (!s.endsWith('.md')) {
    return { ok: false, error: 'BAD_SOURCE', message: 'source 须为 .md 文件' }
  }
  return { ok: true, source: s }
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { Accept: 'text/plain, text/markdown, */*' },
    signal: AbortSignal.timeout(20_000)
  })
  if (!res.ok) {
    const err = new Error(`FETCH_FAIL: HTTP ${res.status} for ${url}`)
    err.code = 'FETCH_FAIL'
    throw err
  }
  return res.text()
}

function cacheTtlMs() {
  const n = Number(process.env.CACHE_TTL_MS)
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_TTL_MS
}

async function fetchJson(url) {
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15_000)
  })
  if (!res.ok) {
    const err = new Error(`FETCH_FAIL: HTTP ${res.status} for ${url}`)
    err.code = 'FETCH_FAIL'
    throw err
  }
  return res.json()
}

function readLocalJson(filePath) {
  if (!fs.existsSync(filePath)) return null
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

/**
 * 加载 manifest（优先 MANIFEST_URL，否则 MANIFEST_PATH）
 * @param {{ force?: boolean }} [opts]
 */
export async function loadManifest(opts = {}) {
  const force = Boolean(opts.force)
  const ttl = cacheTtlMs()
  if (
    !force &&
    cache &&
    (ttl === 0 || Date.now() - cache.loadedAt < ttl)
  ) {
    return cache.manifest
  }

  const url = resolveManifestUrl()
  if (url) {
    try {
      const manifest = await fetchJson(url)
      cache = { manifest, loadedAt: Date.now(), source: url }
      return manifest
    } catch (e) {
      if (cache?.manifest) {
        console.error(
          `[catalog-api] fetch failed, using stale cache: ${e.message}`
        )
        return cache.manifest
      }
      throw e
    }
  }

  const p = resolveManifestPath()
  if (!fs.existsSync(p)) {
    const err = new Error(
      `NO_MANIFEST: 未设置 MANIFEST_URL，且本地不存在 ${p}`
    )
    err.code = 'NO_MANIFEST'
    throw err
  }
  const manifest = JSON.parse(fs.readFileSync(p, 'utf8'))
  cache = { manifest, loadedAt: Date.now(), source: p }
  return manifest
}

async function loadSiblingJson(name) {
  const base = resolveCatalogBaseUrl()
  if (base) {
    try {
      return await fetchJson(`${base}/${name}`)
    } catch {
      return null
    }
  }
  const dir = path.dirname(resolveManifestPath())
  return readLocalJson(path.join(dir, name))
}

function sourceLabel() {
  return cache?.source || resolveManifestUrl() || resolveManifestPath()
}

/** @param {object} m */
export function createCatalogApi(m) {
  const api = {
    async refresh() {
      await loadManifest({ force: true })
      return api.health()
    },

    health() {
      return (async () => {
        const manifest = m || (await loadManifest())
        const healthFile = await loadSiblingJson('health.json')
        return {
          ok: healthFile?.ok ?? manifest.validateOk !== false,
          contentHash: healthFile?.contentHash || manifest.contentHash || null,
          validatedAt: healthFile?.validatedAt || manifest.validatedAt || null,
          generatedAt: manifest.generatedAt || null,
          standardsRoot: manifest.standardsRoot || null,
          domainsEnabled: manifest.domainsEnabled ?? null,
          counts: healthFile?.counts || {
            agents: (manifest.agents || []).length,
            skills: (manifest.skills || []).length,
            rules: (manifest.rules || []).length,
            relatedDocs: (manifest.relatedDocs || []).length
          },
          dataSource: sourceLabel(),
          mode: resolveManifestUrl() ? 'remote' : 'local'
        }
      })()
    },

    listAgents({ scope = 'standard' } = {}) {
      return (async () => {
        const manifest = m || (await loadManifest())
        const standard = (manifest.agents || []).map((a) => ({
          index: a.index,
          id: a.id,
          title: a.title,
          summary: a.summary,
          siteUri: a.siteUri,
          source: a.source,
          scope: 'standard'
        }))
        if (scope === 'standard') return standard

        const domainAgents = []
        for (const [domainId, pack] of Object.entries(manifest.domains || {})) {
          for (const a of pack.agents || []) {
            domainAgents.push({
              id: a.id,
              siteUri: a.siteUri,
              source: a.source,
              scope: 'domain',
              domain: domainId
            })
          }
        }
        if (scope === 'domain') return domainAgents
        return [...standard, ...domainAgents]
      })()
    },

    getAgent({ id, index } = {}) {
      return (async () => {
        if (id == null && index == null) {
          return { error: 'BAD_KIND', message: '需要 id 或 index' }
        }
        const manifest = m || (await loadManifest())
        const agents = manifest.agents || []
        const a =
          (id && agents.find((x) => x.id === id)) ||
          (index != null && agents.find((x) => x.index === Number(index)))
        if (!a) return { error: 'NOT_FOUND', id, index }
        return {
          index: a.index,
          id: a.id,
          title: a.title,
          summary: a.summary,
          siteUri: a.siteUri,
          source: a.source,
          skills: a.skills || [],
          skillsRecommended: a.skillsRecommended || []
        }
      })()
    },

    listSkills({ include_domain = false } = {}) {
      return (async () => {
        const manifest = m || (await loadManifest())
        const common = (manifest.skills || []).map((s) => ({
          index: s.index,
          id: s.id,
          origin: s.origin,
          siteUri: s.siteUri,
          source: s.source,
          boundAgents: s.boundAgents || [],
          recommendedAgents: s.recommendedAgents || [],
          scope: 'common'
        }))
        if (!include_domain) return common
        const domainSkills = []
        for (const [domainId, pack] of Object.entries(manifest.domains || {})) {
          for (const s of pack.skills || []) {
            domainSkills.push({
              id: s.id,
              siteUri: s.siteUri,
              source: s.source,
              scope: 'domain',
              domain: domainId
            })
          }
        }
        return [...common, ...domainSkills]
      })()
    },

    getSkill({ id, index } = {}) {
      return (async () => {
        if (id == null && index == null) {
          return { error: 'BAD_KIND', message: '需要 id 或 index' }
        }
        const manifest = m || (await loadManifest())
        const skills = manifest.skills || []
        const s =
          (id && skills.find((x) => x.id === id)) ||
          (index != null && skills.find((x) => x.index === Number(index)))
        if (!s) return { error: 'NOT_FOUND', id, index }
        return s
      })()
    },

    /**
     * 只读返回 SoT 正文（Single-Facade MCP）。
     * 入参：source，或 kind+id（agent|skill|rule）解析 source。
     */
    getSourceText({ source, kind, id, maxChars } = {}) {
      return (async () => {
        let resolved = source
        let resolvedVia = source ? 'source' : null
        if (!resolved && id && kind) {
          const k = String(kind).toLowerCase()
          if (k === 'agent' || k === 'role') {
            const a = await api.getAgent({ id })
            if (a.error) return a
            resolved = a.source
            resolvedVia = `agent:${a.id}`
          } else if (k === 'skill') {
            const s = await api.getSkill({ id })
            if (s.error) return s
            resolved = s.source
            resolvedVia = `skill:${s.id}`
          } else if (k === 'rule') {
            const rules = await api.listRules({})
            const r = (rules || []).find(
              (x) => x.name === id || x.title === id || x.source?.endsWith(`/${id}`)
            )
            if (!r) return { error: 'NOT_FOUND', kind: 'rule', id }
            resolved = r.source
            resolvedVia = `rule:${r.name || id}`
          } else {
            return {
              error: 'BAD_KIND',
              message: 'kind 须为 agent|skill|rule（或直接传 source）'
            }
          }
        }

        const norm = normalizeSourcePath(resolved)
        if (!norm.ok) return { error: norm.error, message: norm.message }

        const capRaw = Number(maxChars)
        const cap =
          Number.isFinite(capRaw) && capRaw > 0
            ? Math.min(Math.floor(capRaw), 200_000)
            : Number(process.env.SOURCE_MAX_CHARS) > 0
              ? Math.min(Number(process.env.SOURCE_MAX_CHARS), 200_000)
              : DEFAULT_SOURCE_MAX_CHARS

        const docsRoot = resolveDocsRoot()
        const abs = path.resolve(docsRoot, ...norm.source.split('/'))
        const rootResolved = path.resolve(docsRoot)
        const relToRoot = path.relative(rootResolved, abs)
        if (
          !relToRoot ||
          relToRoot.startsWith('..') ||
          path.isAbsolute(relToRoot)
        ) {
          return { error: 'BAD_SOURCE', message: 'source 越界' }
        }

        let text = null
        let dataOrigin = null
        if (fs.existsSync(abs) && fs.statSync(abs).isFile()) {
          text = fs.readFileSync(abs, 'utf8')
          dataOrigin = `file:${abs}`
        } else {
          const base = resolveContentBaseUrl()
          if (base) {
            try {
              text = await fetchText(`${base}/${norm.source}`)
              dataOrigin = `url:${base}/${norm.source}`
            } catch (e) {
              return {
                error: 'NOT_FOUND',
                message: `本地无文件且 CONTENT_BASE_URL 拉取失败: ${e.message}`,
                source: norm.source
              }
            }
          } else {
            return {
              error: 'NOT_FOUND',
              message:
                '正文文件不存在；部署侧请保证 DOCS_ROOT 含 docs/**，或设 CONTENT_BASE_URL',
              source: norm.source,
              docsRoot
            }
          }
        }

        const hash = crypto.createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 16)
        const truncated = text.length > cap
        const outText = truncated ? text.slice(0, cap) : text
        return {
          ok: true,
          source: norm.source,
          resolvedVia,
          chars: outText.length,
          totalChars: text.length,
          truncated,
          maxChars: cap,
          contentHash: hash,
          dataOrigin,
          text: outText
        }
      })()
    },

    listRules({ level } = {}) {
      return (async () => {
        const manifest = m || (await loadManifest())
        let rules = manifest.rules || []
        if (level) {
          const lv = String(level).toUpperCase()
          rules = rules.filter((r) => r.level === lv)
        }
        return rules.map((r) => ({
          level: r.level,
          name: r.name,
          title: r.title,
          siteUri: r.siteUri,
          source: r.source,
          alwaysApply: r.alwaysApply || false
        }))
      })()
    },

    resolveNumber({ kind, n } = {}) {
      return (async () => {
        const num = Number(n)
        if (!Number.isFinite(num)) {
          return { error: 'BAD_KIND', message: 'n 必须是数字' }
        }
        const k = String(kind || '').toLowerCase()
        if (k === 'role' || k === 'agent') {
          const a = await api.getAgent({ index: num })
          if (a.error) return a
          return { kind: 'role', n: num, ...a }
        }
        if (k === 'skill') {
          const s = await api.getSkill({ index: num })
          if (s.error) return s
          return {
            kind: 'skill',
            n: num,
            id: s.id,
            siteUri: s.siteUri,
            source: s.source
          }
        }
        return { error: 'BAD_KIND', message: 'kind 须为 role|skill' }
      })()
    },

    validate() {
      return (async () => {
        const manifest = m || (await loadManifest({ force: true }))
        const report = await loadSiblingJson('validate-report.json')
        const health = await loadSiblingJson('health.json')
        if (report) {
          return {
            ok: report.ok === true,
            source: 'validate-report.json',
            dataSource: sourceLabel(),
            contentHash: report.contentHash,
            validatedAt: report.validatedAt,
            counts: report.counts,
            errorCount: report.errorCount,
            errors: report.errors || []
          }
        }
        if (health) {
          return {
            ok: health.ok === true,
            source: 'health.json',
            dataSource: sourceLabel(),
            contentHash: health.contentHash,
            validatedAt: health.validatedAt,
            counts: health.counts,
            errorCount: health.errorCount || 0,
            errors: health.errors || []
          }
        }
        const agents = (manifest.agents || []).length
        const skills = (manifest.skills || []).length
        const rules = (manifest.rules || []).length
        const ok = agents === 8 && skills === 11 && rules >= 10
        return {
          ok,
          source: 'manifest-lightweight',
          dataSource: sourceLabel(),
          contentHash: manifest.contentHash || null,
          counts: { agents, skills, rules },
          errorCount: ok ? 0 : 1,
          errors: ok
            ? []
            : [
                `轻量检查失败：agents=${agents} skills=${skills} rules=${rules}（期望 8/11/≥10）`
              ],
          code: ok ? undefined : 'VALIDATE_FAIL'
        }
      })()
    }
  }

  return api
}

const isMain =
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
  const api = createCatalogApi()
  const cmd = process.argv[2] || 'health'
  try {
    let out
    if (cmd === 'health') out = await api.health()
    else if (cmd === 'refresh') out = await api.refresh()
    else if (cmd === 'list_agents')
      out = await api.listAgents({ scope: process.argv[3] || 'standard' })
    else if (cmd === 'get_agent')
      out = await api.getAgent({ id: process.argv[3] || 'Architect' })
    else if (cmd === 'list_skills') out = await api.listSkills()
    else if (cmd === 'get_skill')
      out = await api.getSkill({
        id: process.argv[3],
        index: process.argv[3] ? undefined : 1
      })
    else if (cmd === 'list_rules')
      out = await api.listRules({ level: process.argv[3] })
    else if (cmd === 'resolve_number')
      out = await api.resolveNumber({
        kind: process.argv[3] || 'role',
        n: process.argv[4] || 2
      })
    else if (cmd === 'validate') out = await api.validate()
    else if (cmd === 'get_source_text') {
      const a3 = process.argv[3]
      if (a3 && String(a3).replace(/\\/g, '/').startsWith('docs/')) {
        out = await api.getSourceText({
          source: a3,
          maxChars: process.argv[4] ? Number(process.argv[4]) : undefined
        })
      } else {
        out = await api.getSourceText({
          kind: a3,
          id: process.argv[4],
          maxChars: process.argv[5] ? Number(process.argv[5]) : undefined
        })
      }
    }
    else {
      console.error(
        'usage: node mcp/catalog-api.mjs health|refresh|list_agents|get_agent|get_source_text|…'
      )
      process.exit(1)
    }
    console.log(JSON.stringify(out, null, 2))
  } catch (e) {
    console.error(e.message || e)
    process.exit(1)
  }
}

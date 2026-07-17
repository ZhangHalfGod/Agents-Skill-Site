import { defineConfig } from 'vitepress'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/**
 * ADR-001：base 必须与 Nginx location /agents-skill/ 一致。
 * i18n：root = English，zh = 简体中文（docs/zh SoT）。
 * 侧栏 JSON 由 npm run generate 生成。
 */
const __dirname = dirname(fileURLToPath(import.meta.url))
const SITE_CONFIG = join(__dirname, '../../site.config.json')

function loadSidebar(name, fallbackKey, fallbackItems) {
  try {
    return JSON.parse(readFileSync(join(__dirname, name), 'utf8'))
  } catch {
    return { [fallbackKey]: fallbackItems }
  }
}

function domainsNavEnabled() {
  if (process.env.ENABLE_DOMAINS === '0' || process.env.ENABLE_DOMAINS === 'false') {
    return false
  }
  try {
    const cfg = JSON.parse(readFileSync(SITE_CONFIG, 'utf8'))
    return Boolean(cfg.domains?.enabled)
  } catch {
    return false
  }
}

const agentsSidebar = loadSidebar('sidebar.agents.generated.json', '/agents/', [
  { text: 'Agents', items: [{ text: 'Role catalog', link: '/agents/' }] }
])
const skillsSidebar = loadSidebar('sidebar.skills.generated.json', '/skills/', [
  { text: 'Skills', items: [{ text: 'Skill catalog', link: '/skills/' }] }
])
const rulesSidebar = loadSidebar('sidebar.rules.generated.json', '/rules/', [
  { text: 'Rules', items: [{ text: 'Rule catalog', link: '/rules/' }] }
])
const domainsSidebar = loadSidebar('sidebar.domains.generated.json', '/domains/', [
  { text: 'Domains', items: [{ text: 'Domain catalog', link: '/domains/' }] }
])

const agentsSidebarZh = loadSidebar(
  'sidebar.agents.zh.generated.json',
  '/zh/agents/',
  [{ text: 'Agents', items: [{ text: '角色目录', link: '/zh/agents/' }] }]
)
const skillsSidebarZh = loadSidebar(
  'sidebar.skills.zh.generated.json',
  '/zh/skills/',
  [{ text: 'Skills', items: [{ text: '技能目录', link: '/zh/skills/' }] }]
)
const rulesSidebarZh = loadSidebar(
  'sidebar.rules.zh.generated.json',
  '/zh/rules/',
  [{ text: 'Rules', items: [{ text: '规则目录', link: '/zh/rules/' }] }]
)
const domainsSidebarZh = loadSidebar(
  'sidebar.domains.zh.generated.json',
  '/zh/domains/',
  [{ text: 'Domains', items: [{ text: '领域目录', link: '/zh/domains/' }] }]
)

const showDomains = domainsNavEnabled()

const sharedTheme = {
  socialLinks: [
    { icon: 'github', link: 'https://github.com/ZhangHalfGod/Agents-Skill-Site' }
  ],
  search: { provider: 'local' as const }
}

export default defineConfig({
  title: 'Agents Skill Site',
  description: 'Governance discovery for agents / skills / rules',
  base: '/agents-skill/',
  cleanUrls: true,
  themeConfig: {
    ...sharedTheme
  },
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'Agents Skill Site',
      description: 'Governance discovery for agents / skills / rules',
      themeConfig: {
        ...sharedTheme,
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Agents', link: '/agents/' },
          { text: 'Skills', link: '/skills/' },
          { text: 'Rules', link: '/rules/' },
          ...(showDomains ? [{ text: 'Domains', link: '/domains/' }] : []),
          { text: 'Health', link: '/health/' }
        ],
        sidebar: {
          ...agentsSidebar,
          ...skillsSidebar,
          ...rulesSidebar,
          ...(showDomains ? domainsSidebar : {})
        },
        outline: { label: 'On this page' },
        docFooter: { prev: 'Previous', next: 'Next' }
      }
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      title: 'Agents Skill Site',
      description: 'Agents / Skills / Rules 治理发现站',
      themeConfig: {
        ...sharedTheme,
        nav: [
          { text: '首页', link: '/zh/' },
          { text: 'Agents', link: '/zh/agents/' },
          { text: 'Skills', link: '/zh/skills/' },
          { text: 'Rules', link: '/zh/rules/' },
          ...(showDomains ? [{ text: 'Domains', link: '/zh/domains/' }] : []),
          { text: 'Health', link: '/zh/health/' }
        ],
        sidebar: {
          ...agentsSidebarZh,
          ...skillsSidebarZh,
          ...rulesSidebarZh,
          ...(showDomains ? domainsSidebarZh : {})
        },
        outline: { label: '本页目录' },
        docFooter: { prev: '上一页', next: '下一页' }
      }
    }
  }
})

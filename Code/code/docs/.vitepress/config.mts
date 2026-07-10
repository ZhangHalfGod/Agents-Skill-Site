import { defineConfig } from 'vitepress'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

/**
 * ADR-001：base 必须与 Nginx location /agents-skill/ 一致。
 * 侧栏 JSON 由 npm run sync 生成。
 */
const __dirname = dirname(fileURLToPath(import.meta.url))

function loadSidebar(name, fallbackKey, fallbackItems) {
  try {
    return JSON.parse(readFileSync(join(__dirname, name), 'utf8'))
  } catch {
    return { [fallbackKey]: fallbackItems }
  }
}

const agentsSidebar = loadSidebar('sidebar.agents.generated.json', '/agents/', [
  { text: 'Agents', items: [{ text: '角色目录', link: '/agents/' }] }
])
const skillsSidebar = loadSidebar('sidebar.skills.generated.json', '/skills/', [
  { text: 'Skills', items: [{ text: '技能目录', link: '/skills/' }] }
])
const rulesSidebar = loadSidebar('sidebar.rules.generated.json', '/rules/', [
  { text: 'Rules', items: [{ text: '规则目录', link: '/rules/' }] }
])

export default defineConfig({
  title: 'Agents Skill Site',
  description: 'Agents / Skills / Rules 治理发现站',
  lang: 'zh-CN',
  base: '/agents-skill/',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: 'Agents', link: '/agents/' },
      { text: 'Skills', link: '/skills/' },
      { text: 'Rules', link: '/rules/' }
    ],
    sidebar: {
      ...agentsSidebar,
      ...skillsSidebar,
      ...rulesSidebar
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ZhangHalfGod/Agents-Skill-Site' }
    ],
    outline: { label: '本页目录' },
    docFooter: { prev: '上一页', next: '下一页' },
    search: { provider: 'local' }
  }
})

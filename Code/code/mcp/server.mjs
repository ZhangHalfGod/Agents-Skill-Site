/**
 * Agents Skill Site — MCP stdio server（只读）
 * 计划：Doc/phase2/01-mcp-server-plan.md、Doc/phase2/02-remote-manifest.md
 *
 * 数据：MANIFEST_URL（推荐，服务器静态索引）或 MANIFEST_PATH（本地）
 * 日志仅 stderr。
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { createCatalogApi, loadManifest, resolveManifestUrl } from './catalog-api.mjs'

function jsonContent(data) {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    isError: Boolean(data?.error)
  }
}

async function createServer() {
  await loadManifest({ force: true })
  const api = createCatalogApi()
  const mode = resolveManifestUrl() ? 'remote' : 'local'
  console.error(`[agents-skill-mcp] data mode=${mode}`)

  const server = new McpServer({
    name: 'agents-skill',
    version: '0.3.0'
  })

  server.tool(
    'health',
    '索引健康摘要。远程模式下 dataSource 为 MANIFEST_URL。只读。',
    {},
    async () => jsonContent(await api.health())
  )

  server.tool(
    'refresh_catalog',
    '强制重新拉取 manifest（远程 URL 或本地文件）。只读。',
    {},
    async () => jsonContent(await api.refresh())
  )

  server.tool(
    'list_agents',
    '列出角色。scope=standard|domain|all。返回 id/source。只读。',
    {
      scope: z.enum(['standard', 'domain', 'all']).optional()
    },
    async ({ scope }) =>
      jsonContent(await api.listAgents({ scope: scope || 'standard' }))
  )

  server.tool(
    'get_agent',
    '按 id 或 index 取角色详情与技能。用返回的 source 在 Cursor 中 @ 文件。只读。',
    {
      id: z.string().optional(),
      index: z.number().int().optional()
    },
    async ({ id, index }) => jsonContent(await api.getAgent({ id, index }))
  )

  server.tool(
    'list_skills',
    '列出技能；include_domain 可含领域技能。只读。',
    {
      include_domain: z.boolean().optional()
    },
    async ({ include_domain }) =>
      jsonContent(await api.listSkills({ include_domain: Boolean(include_domain) }))
  )

  server.tool(
    'get_skill',
    '按 id 或 index 取技能详情。只读。',
    {
      id: z.string().optional(),
      index: z.number().int().optional()
    },
    async ({ id, index }) => jsonContent(await api.getSkill({ id, index }))
  )

  server.tool(
    'list_rules',
    '列出规则；可选 L0/L1/L2。只读。',
    {
      level: z.enum(['L0', 'L1', 'L2']).optional()
    },
    async ({ level }) => jsonContent(await api.listRules({ level }))
  )

  server.tool(
    'resolve_number',
    '编号协议：kind=role|skill 与 n。只读。',
    {
      kind: z.enum(['role', 'skill', 'agent']),
      n: z.number().int()
    },
    async ({ kind, n }) => jsonContent(await api.resolveNumber({ kind, n }))
  )

  server.tool(
    'validate',
    '校验报告摘要（远程同目录 validate-report/health，或轻量计数）。只读。',
    {},
    async () => jsonContent(await api.validate())
  )

  return server
}

async function main() {
  const server = await createServer()
  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error('[agents-skill-mcp] stdio ready (read-only catalog)')
}

main().catch((err) => {
  console.error('[agents-skill-mcp] fatal', err)
  process.exit(1)
})

/**
 * 与 Code/code/mcp/server.mjs 对齐的只读 tools（传输层无关）
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import {
  createCatalogApi,
  loadManifest,
  resolveManifestUrl
} from '../../code/mcp/catalog-api.mjs'

function jsonContent(data) {
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
    isError: Boolean(data?.error)
  }
}

/** 每个会话新建一个 McpServer（对齐 SDK Streamable HTTP 示例） */
export async function createAgentsSkillMcpServer() {
  await loadManifest({ force: false })
  const api = createCatalogApi()
  const mode = resolveManifestUrl() ? 'remote' : 'local'

  const server = new McpServer({
    name: 'agents-skill-remote',
    version: '0.1.0'
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

  return { server, mode }
}

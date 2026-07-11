/**
 * R1 冒烟：healthz → 401 → MCP initialize + list_agents + tools/call health
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js'

const BASE = process.env.SMOKE_BASE || 'http://127.0.0.1:3921'
const TOKEN = process.env.MCP_TOKEN || 'change-me-local-token'

function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

async function main() {
  const hz = await fetch(`${BASE}/healthz`)
  assert(hz.ok, `healthz failed: ${hz.status}`)
  const hzBody = await hz.json()
  assert(hzBody.ok === true, 'healthz.ok !== true')
  console.log('OK healthz', hzBody)

  const unauth = await fetch(`${BASE}/mcp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: { name: 'smoke', version: '0' }
      }
    })
  })
  assert(unauth.status === 401, `expected 401 without token, got ${unauth.status}`)
  console.log('OK 401 without token')

  const url = new URL(`${BASE}/mcp`)
  const transport = new StreamableHTTPClientTransport(url, {
    requestInit: {
      headers: { Authorization: `Bearer ${TOKEN}` }
    }
  })
  const client = new Client({ name: 'smoke', version: '0.1.0' })
  await client.connect(transport)

  const tools = await client.listTools()
  const names = (tools.tools || []).map((t) => t.name).sort()
  const required = [
    'health',
    'refresh_catalog',
    'list_agents',
    'get_agent',
    'list_skills',
    'get_skill',
    'list_rules',
    'resolve_number',
    'validate'
  ]
  for (const n of required) {
    assert(names.includes(n), `missing tool ${n}; have ${names.join(',')}`)
  }
  console.log('OK tools', names.join(', '))

  const health = await client.callTool({ name: 'health', arguments: {} })
  const text = health.content?.[0]?.text || ''
  const parsed = JSON.parse(text)
  assert(parsed.ok !== false || parsed.counts, `health payload unexpected: ${text}`)
  console.log('OK call health', {
    mode: parsed.mode,
    agents: parsed.counts?.agents,
    dataSource: parsed.dataSource
  })

  const agents = await client.callTool({
    name: 'list_agents',
    arguments: { scope: 'standard' }
  })
  const agentList = JSON.parse(agents.content?.[0]?.text || '[]')
  assert(Array.isArray(agentList) && agentList.length >= 1, 'list_agents empty')
  console.log('OK list_agents count=', agentList.length)

  await client.close()
  console.log('SMOKE PASS')
}

main().catch((e) => {
  console.error('SMOKE FAIL', e)
  process.exit(1)
})

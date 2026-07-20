/**
 * Agents Skill Site — 远程 MCP（Streamable HTTP + Bearer Token）
 * 计划：Doc/phase2/03-remote-mcp-http.md（R1）
 *
 * 绑定：仅 127.0.0.1（默认端口 3921）
 * 探活：GET /healthz（无鉴权）
 * MCP：POST|GET|DELETE /mcp（需 Authorization: Bearer）
 */
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js'
import { requireBearerToken, resolveRequiredToken } from './auth.mjs'
import { createAgentsSkillMcpServer } from './create-mcp.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

function loadDotEnv() {
  const p = path.join(ROOT, '.env')
  if (!fs.existsSync(p)) return
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const i = t.indexOf('=')
    if (i <= 0) continue
    const key = t.slice(0, i).trim()
    let val = t.slice(i + 1).trim()
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = val
  }
}

loadDotEnv()

const HOST = process.env.HOST?.trim() || '127.0.0.1'
const PORT = Number(process.env.PORT || 3921)

if (HOST !== '127.0.0.1' && HOST !== 'localhost' && HOST !== '::1') {
  console.error(
    `[mcp-remote] refused bind host=${HOST}; only 127.0.0.1/localhost/::1 allowed (plan §3)`
  )
  process.exit(1)
}

if (PORT === 3001 || PORT === 3002 || PORT === 3003) {
  console.error(
    `[mcp-remote] port ${PORT} commonly used by other apps on shared hosts; refuse`
  )
  process.exit(1)
}

const token = resolveRequiredToken()

/** @type {Record<string, StreamableHTTPServerTransport>} */
const transports = {}

/** 逗号分隔；设了则覆盖默认 localhost Host 校验（Nginx 未改写 Host 时用） */
const allowedHosts = (process.env.ALLOWED_HOSTS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

const app = allowedHosts.length
  ? createMcpExpressApp({
      host: HOST,
      allowedHosts: [...new Set([...allowedHosts, '127.0.0.1', 'localhost'])]
    })
  : createMcpExpressApp({ host: HOST })

app.get('/healthz', (_req, res) => {
  res.json({
    ok: true,
    service: 'agents-skill-mcp-remote',
    bind: `${HOST}:${PORT}`,
    mcpPath: '/mcp'
  })
})

const auth = requireBearerToken(token)

async function mcpPostHandler(req, res) {
  const sessionId = req.headers['mcp-session-id']
  try {
    let transport
    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId]
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          transports[sid] = transport
          console.error(`[mcp-remote] session initialized ${sid}`)
        }
      })
      transport.onclose = () => {
        const sid = transport.sessionId
        if (sid && transports[sid]) {
          delete transports[sid]
          console.error(`[mcp-remote] session closed ${sid}`)
        }
      }
      const { server, mode } = await createAgentsSkillMcpServer()
      console.error(`[mcp-remote] new session data mode=${mode}`)
      await server.connect(transport)
      await transport.handleRequest(req, res, req.body)
      return
    } else {
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided'
        },
        id: null
      })
      return
    }
    await transport.handleRequest(req, res, req.body)
  } catch (error) {
    console.error('[mcp-remote] POST error', error)
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null
      })
    }
  }
}

async function mcpSessionHandler(req, res) {
  const sessionId = req.headers['mcp-session-id']
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send('Invalid or missing session ID')
    return
  }
  try {
    await transports[sessionId].handleRequest(req, res)
  } catch (error) {
    console.error(`[mcp-remote] ${req.method} error`, error)
    if (!res.headersSent) res.status(500).send('Error processing request')
  }
}

app.post('/mcp', auth, mcpPostHandler)
app.get('/mcp', auth, mcpSessionHandler)
app.delete('/mcp', auth, mcpSessionHandler)

const server = app.listen(PORT, HOST, () => {
  console.error(
    `[mcp-remote] listening http://${HOST}:${PORT}/mcp (Bearer required; /healthz open)`
  )
})

async function shutdown() {
  console.error('[mcp-remote] shutting down…')
  for (const sid of Object.keys(transports)) {
    try {
      await transports[sid].close()
    } catch {
      /* ignore */
    }
    delete transports[sid]
  }
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(0), 2000).unref()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

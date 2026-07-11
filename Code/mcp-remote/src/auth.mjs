/**
 * Bearer Token 鉴权（应用层必选）
 * 计划：Doc/phase2/03-remote-mcp-http.md §4.4
 */
import crypto from 'node:crypto'

function timingSafeEqualString(a, b) {
  const ba = Buffer.from(String(a))
  const bb = Buffer.from(String(b))
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

export function resolveRequiredToken() {
  const token = process.env.MCP_TOKEN?.trim()
  if (!token) {
    const err = new Error(
      'MCP_TOKEN is required. Set env or copy .env.example → .env (do not commit secrets).'
    )
    err.code = 'NO_TOKEN'
    throw err
  }
  return token
}

/**
 * Express middleware：校验 Authorization: Bearer <token>
 * 失败 401，不进入 MCP（不泄漏 tools）。
 */
export function requireBearerToken(expectedToken) {
  return function bearerAuth(req, res, next) {
    const header = req.headers.authorization || ''
    const m = /^Bearer\s+(.+)$/i.exec(header)
    if (!m || !timingSafeEqualString(m[1].trim(), expectedToken)) {
      res.setHeader('WWW-Authenticate', 'Bearer')
      res.status(401).json({
        error: 'unauthorized',
        message: 'Invalid or missing Bearer token'
      })
      return
    }
    next()
  }
}

/**
 * PM2：agents-skill-mcp-remote
 * Bind 127.0.0.1:3921 only; do not collide with other apps on the host.
 *
 * Server:
 *   cd /var/www/agents-skill-site/Code/mcp-remote
 *   cp deploy/env.production.example .env   # set MCP_TOKEN; never commit .env
 *   npm ci
 *   pm2 start deploy/ecosystem.config.cjs
 *   pm2 save
 *
 * Logs: PM2 defaults. Do not put secrets in this file.
 */
module.exports = {
  apps: [
    {
      name: 'agents-skill-mcp-remote',
      cwd: '/var/www/agents-skill-site/Code/mcp-remote',
      script: 'src/server.mjs',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 20,
      min_uptime: '5s',
      // 密钥与路径放 .env（cwd 下）；此处仅非敏感默认
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: '3921'
      }
    }
  ]
}

/**
 * PM2：agents-skill-mcp-remote
 * 与现网 mcp-faq / mcp-gaode / mechassist-api 并列；勿改它们的端口与配置。
 *
 * 服务器：
 *   cd /var/www/agents-skill-site/Code/mcp-remote
 *   cp deploy/env.production.example .env   # 填 MCP_TOKEN，勿提交
 *   npm ci
 *   pm2 start deploy/ecosystem.config.cjs
 *   pm2 save
 *
 * 日志目录由 PM2 默认管理；勿把密钥写入本文件。
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

/**
 * 形态 β 备选：PM2 托管静态服务。
 * 一期默认用形态 α（纯 Nginx alias），一般不需要本文件。
 *
 * 用法（ECS 上 dist 已就位后）：
 *   pm2 start deploy/ecosystem.config.cjs
 *   pm2 save
 */
module.exports = {
  apps: [
    {
      name: 'agents-skill-site',
      cwd: '/var/www/agents-skill-site',
      script: 'npx',
      args: 'serve -l tcp://127.0.0.1:3010 dist',
      env: {
        NODE_ENV: 'production'
      },
      max_restarts: 10,
      min_uptime: '5s'
    }
  ]
}

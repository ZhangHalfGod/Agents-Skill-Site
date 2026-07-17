# 部署验收清单（回灌自 Lesson）

> 来源 Lesson：  
> - `docs/operations/ecs-deploy-host404/lessons/2026-07-17-nginx-host-false-404.md`（merged）  
> - `docs/operations/stage-gate-exit-evidence/lessons/2026-07-17-mcp-health-not-host-curl.md`（merged）

## 证据分层（出门时分开勾）

| 证据 | 能证明 | 不能证明 |
|------|--------|----------|
| Cursor 侧 `agents-skill-remote` / `health` 绿 | MCP 索引可读、同源 manifest | 静态站 Nginx、带 Host 的 HTTP 200 |
| ECS 上带 Host 的静态站 + `manifest.json` curl | 站点与索引经 Nginx 可达 | — |
| ECS 上带 Host 的 `/agents-skill-mcp/healthz` | MCP HTTP 探活 | 静态站页面内容 |

本机**无 SSH** 时：MCP health 可记「部分证据」；静态站 Host 探测标「待 ECS 补跑」，**勿默认部署项全绿**。  
仍禁止无 Host 的 `curl 127.0.0.1` 误判 404。

## 静态站 / manifest

1. 服务器跟 **`main`**；`git pull` 前若有 generate 脏文件：`git restore .`（勿在部署机提交产物）
2. `cd Code/code && npm ci && npm run build`
3. 确认产物存在：
   - `docs/.vitepress/dist/index.html`
   - `docs/public/manifest.json`
4. 经 Nginx 探测时**必须**带 Host（与 `server_name` 一致）：

```bash
curl -sS -o /dev/null -w '%{http_code}\n' \
  -H 'Host: <PUBLIC_HOST>' http://127.0.0.1/agents-skill/
# 期望 200；无 Host 常进 default → 假 404
```

5. 抽查索引：`curl -sS -H 'Host: <PUBLIC_HOST>' http://127.0.0.1/agents-skill/manifest.json | head`

## 远程 MCP

- 索引同源：`MANIFEST_PATH` → `docs/public/manifest.json`（build/generate 已更新）
- **仅改 docs/manifest**：通常不必 `pm2 restart`（约 60s 缓存）；立刻生效再 `pm2 restart agents-skill-mcp-remote`
- **改了 mcp-remote 代码/依赖**：`npm ci` + restart
- 探活：`curl -sS -H 'Host: <PUBLIC_HOST>' http://127.0.0.1/agents-skill-mcp/healthz`

## 构建注意

- 站点 `docs/**` 内不要相对链接到仓库外的 `Doc/`（VitePress 会死链中断 build）
- 工程文档用纯文本路径提及即可

详情：`Code/doc/phase1/07-deploy.md`（占位符 `<PUBLIC_HOST>`）。

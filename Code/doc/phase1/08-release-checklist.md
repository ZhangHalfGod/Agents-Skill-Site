# 08 — 发布检查清单（阶段 4.4）

> 对齐 OpsEngineer「可灰度、可验证、可回滚」与 `04-security-alignment.md`。  
> 每次上线前勾选；未勾满不放行公网。

## A. 构建与门禁

- [ ] 本机或 CI：`cd Code/code && npm run sync`（有 standards 时）
- [ ] `npm run validate` **通过**（或 `npm run build` 内已跑 validate）
- [ ] `docs/public/manifest.json` 含 8 agents + 11 skills
- [ ] `/health/` 页或 `health.json` 显示 `ok: true` 与 contentHash
- [ ] 未在 `docs/agents/**` 等正文写入公网 IP / 部署 URL

## B. Git 与服务器

- [ ] 变更已 `git push` 到 `main`（或约定发布分支）
- [ ] ECS：`cd /var/www/agents-skill-site && git pull`
- [ ] ECS：`cd Code/code && npm ci && npm run build`
- [ ] 确认 `Code/code/docs/.vitepress/dist/index.html` 存在（方案 B：无软链）
- [ ] Nginx `location /agents-skill/` 的 `alias` 指向上述 `.vitepress/dist/`（若尚未改过则改一次并 reload）

## C. Nginx / 安全

- [ ] 配置仍在 `/etc/nginx/sites-available/mechassist` 的 `location /agents-skill/`
- [ ] `nginx -t` 通过；用 `nginx -s reload`（本机无 `nginx.service`）
- [ ] 安全组未新开本站端口；3010 不对公网
- [ ] `ss -lntp`：3001–3003 仍为本机；未误伤 mechassist-api / mcp

## D. 验收

- [ ] `curl -I -H 'Host: <PUBLIC_HOST>' http://127.0.0.1/agents-skill/` → 200（或直接 curl 公网/域名）
- [ ] 公网：`http://<PUBLIC_HOST>/agents-skill/` 首页可开；`manifest.json` 可读
- [ ] 抽查：`/agents/`、`/skills/`、`/rules/`、`/health/`
- [ ] 抽查一角色页技能标签可跳转
- [ ] `pm2 list` 无异常（形态 α 不要求有 `agents-skill-site` 进程）

## E. 回滚预案（书面确认）

- [ ] 回滚触发条件已明确（如首页 5xx、大面积 404、错挂到 MechAssist）
- [ ] 回滚步骤可执行：`git checkout <好 commit>` → `npm run build`（方案 B 无软链；必要时恢复 nginx 旧 alias）
- [ ] 预计可在 5 分钟内恢复

## 放行签名

| 项 | 填写 |
|----|------|
| 日期 | |
| 操作人 | |
| contentHash | （来自 `/health/`） |
| 结论 | 放行 / 暂缓 |

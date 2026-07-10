# 07 — 生产部署笔记（阶段 1.5）

> **主流程**：本机 `git push` → 服务器 `git pull` → 服务器 `npm ci && npm run build` → Nginx 指到 `dist`  
> **形态**：α（Nginx `alias` 静态托管，**无** Node 常驻 / **无** PM2）  
> **冻结参数**：ADR-001 §5、`01-server-inventory.md`  
> **验收**：`http://8.163.18.183/agents-skill/` 可开；不占用 3001–3003；不改现有 PM2

## 1. 锁定参数

| 项 | 值 |
|----|-----|
| GitHub | `git@github.com:ZhangHalfGod/Agents-Skill-Site.git` |
| 服务器目录 | `/var/www/agents-skill-site`（整仓 clone） |
| 构建目录 | `/var/www/agents-skill-site/Code/code` |
| 构建产物 | `Code/code/docs/.vitepress/dist/` |
| Nginx 静态根（稳定路径） | `/var/www/agents-skill-site/dist` → 软链到上述产物 |
| 对外 URL | `http://8.163.18.183/agents-skill/` |
| 已占用勿碰 | `127.0.0.1:3001/3002/3003`；PM2：`mechassist-api` / `mcp-*` |

## 2. 本机：提交并推送

在开发机（有 standards 时先 sync 再 push，保证 docs 入库）：

```bash
cd /Users/zhanghalfgod/Public/Work/Agents-Skill-Site/Code/code
# 可选：export STANDARDS_ROOT=/Users/zhanghalfgod/Public/Work/agents-skill-standards/standards
npm run sync
cd /Users/zhanghalfgod/Public/Work/Agents-Skill-Site
git add -A
git status
git commit -m "..."   # 按需
git push origin main
```

服务器用 **Deploy Key / 已配置的 SSH key** 拉私有仓；若暂用 HTTPS + PAT 亦可。

## 3. 服务器：首次部署

你当前已在 `/var/www`，现有 `MechAssist-Fusion` 等，**新建并列目录**，勿混进 MechAssist。

```bash
cd /var/www

# 首次（目录尚不存在时）
git clone git@github.com:ZhangHalfGod/Agents-Skill-Site.git agents-skill-site
cd agents-skill-site/Code/code

# Node 需 ≥ 22.2.1（现网已是 v22.2.1）
node -v
npm ci

# 本仓通常已含 sync 后的 docs；无 standards 树时跳过 sync：
SKIP_SYNC=1 npm run build

# 稳定路径给 Nginx（每次发布可重跑）
ln -sfn /var/www/agents-skill-site/Code/code/docs/.vitepress/dist \
        /var/www/agents-skill-site/dist
ls -la /var/www/agents-skill-site/dist/index.html
```

若希望服务器上也从 standards 再同步一遍，另 clone 内容仓并指定根目录：

```bash
# 可选
cd /var/www
git clone <你的-standards-仓库-URL> agents-skill-standards
cd /var/www/agents-skill-site/Code/code
export STANDARDS_ROOT=/var/www/agents-skill-standards/standards
npm run build
```

## 4. 服务器：日常更新（你要的主路径）

```bash
cd /var/www/agents-skill-site
git pull origin main

cd Code/code
npm ci                    # lock 有变时再跑；无变可省略
SKIP_SYNC=1 npm run build
# 若已配 STANDARDS_ROOT，可改为：npm run build

ln -sfn /var/www/agents-skill-site/Code/code/docs/.vitepress/dist \
        /var/www/agents-skill-site/dist

# 纯静态，一般无需 reload Nginx；改过 nginx 配置才需要
```

一键脚本备忘（可自行存为 `/var/www/agents-skill-site/deploy.sh`）：

```bash
#!/usr/bin/env bash
set -euo pipefail
cd /var/www/agents-skill-site
git pull origin main
cd Code/code
npm ci
SKIP_SYNC=1 npm run build
ln -sfn "$(pwd)/docs/.vitepress/dist" /var/www/agents-skill-site/dist
echo "OK → http://8.163.18.183/agents-skill/"
```

## 5. Nginx（只加 location）

在现网 `listen 80` 的 **同一个** `server { }` 内追加（勿新建抢 80 的 server）：

```nginx
    location /agents-skill/ {
        alias /var/www/agents-skill-site/dist/;
        index index.html;
        try_files $uri $uri/ /agents-skill/index.html;
    }
```

片段文件：`Code/code/deploy/nginx-agents-skill.snippet.conf`

```bash
sudo nginx -t && sudo systemctl reload nginx
```

## 6. 验证

```bash
curl -I http://127.0.0.1/agents-skill/
curl -I http://8.163.18.183/agents-skill/
pm2 list    # 形态 α：不应出现 agents-skill-site
ss -lntp | egrep '3001|3002|3003|3010|80'
```

浏览器：`http://8.163.18.183/agents-skill/`，再抽查 `/agents/`、`/skills/`、`/rules/`。

## 7. 回滚

```bash
cd /var/www/agents-skill-site
git log --oneline -5
git checkout <上一好用的 commit>
cd Code/code && SKIP_SYNC=1 npm run build
ln -sfn /var/www/agents-skill-site/Code/code/docs/.vitepress/dist \
        /var/www/agents-skill-site/dist
```

或保留 `dist.bak.*` 目录后整目录换回。

## 8. 安全勾选

- [ ] 未新开安全组端口  
- [ ] 未改 3001–3003 / 现有 PM2  
- [ ] `nginx -t` 通过后再 reload  
- [ ] 未把公网 IP 写入 `standards/**` 角色 md  

## 附录 — 形态 β（可选）

见仓库 `Code/code/deploy/ecosystem.config.cjs`；一期默认 **α**，不启 PM2。

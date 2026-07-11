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

# 本仓通常已含 sync 后的 docs；无 standards 树时 sync 会自动跳过：
npm run build

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
npm run build             # 无 STANDARDS_ROOT 时自动跳过 sync

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
npm run build
ln -sfn "$(pwd)/docs/.vitepress/dist" /var/www/agents-skill-site/dist
echo "OK → http://8.163.18.183/agents-skill/"
```
## 5. Nginx 现网实况与修改位置（2026-07-10 登记）

### 5.1 文件位置

| 项 | 路径 |
|----|------|
| 实体配置（**编辑这个**） | `/etc/nginx/sites-available/mechassist` |
| 启用软链 | `/etc/nginx/sites-enabled/mechassist` → 上述文件 |
| 同目录另有 | `default`（也已启用；**本站不改 default**） |
| 仓库片段备忘 | `Code/code/deploy/nginx-agents-skill.snippet.conf`（静态站） |
| 远程 MCP 片段 | `Code/mcp-remote/deploy/nginx-agents-skill-mcp.snippet.conf`（R2；`/agents-skill-mcp/`） |

```bash
ls -la /etc/nginx/sites-enabled/
# mechassist -> /etc/nginx/sites-available/mechassist
# default    -> /etc/nginx/sites-available/default

nano /etc/nginx/sites-available/mechassist
```

### 5.2 现网 `mechassist` 结构摘要（改前）

同一 `server` 块（`listen 80`）大致为：

| 指令 / location | 作用 | 本站是否改动 |
|-----------------|------|:------------:|
| `listen 80` | HTTP | 否 |
| `server_name 8.163.18.183` | 公网 IP | 否 |
| `root /var/www/MechAssist-Fusion/extern-api/dist` | MechAssist 前端 | 否 |
| `location /` | SPA `try_files` → MechAssist | 否 |
| `location /api/voice/` | 反代 `127.0.0.1:3002`（长超时） | 否 |
| `location /api` | 反代 `127.0.0.1:3002` | 否 |
| `location /auth` | 反代 `127.0.0.1:3002/api/auth` | 否 |
| `# Gaode Project` 及后续 | 高德相关（若有） | 否 |
| **`location /agents-skill/`** | **本站静态 alias** | **新增** |

共存示意：

```text
http://8.163.18.183:80  （sites-available/mechassist）
  ├─ /                 → MechAssist-Fusion/extern-api/dist
  ├─ /api/voice/       → 127.0.0.1:3002
  ├─ /api              → 127.0.0.1:3002
  ├─ /auth             → 127.0.0.1:3002/api/auth
  └─ /agents-skill/    → /var/www/agents-skill-site/dist/   ← 新增
```

### 5.3 插入位置（推荐）

在 **`location /auth { ... }` 整块结束之后**、**`# Gaode Project` 注释之前**插入（与 MechAssist / 高德块分开，便于回滚）。

也可插在 `location /` 之后；前缀匹配下 `/agents-skill/` 不会被 `/` 抢走。**不要**新建第二个 `listen 80` 的 `server`。

插入内容：

```nginx
    # --- agents-skill-site（形态 α；勿改 3001–3003）---
    location /agents-skill/ {
        alias /var/www/agents-skill-site/dist/;
        index index.html;
        try_files $uri $uri/ /agents-skill/index.html;
    }
```

注意：`alias` 路径末尾的 `/` 必须保留，与 `location /agents-skill/` 配对。

### 5.4 改完校验

本机 **没有** `nginx.service`（`systemctl reload nginx` 会报 Unit not found）。进程在跑时用：

```bash
nginx -t
nginx -s reload
# 或：service nginx reload
```

不要用：`systemctl reload nginx`。

```bash
curl -I http://127.0.0.1/agents-skill/
# 期望 200（或带尾斜杠的跳转）；不应是 MechAssist 首页
ls -la /var/www/agents-skill-site/dist/index.html   # 构建产物须存在
```

回滚本站：删掉上述 `location /agents-skill/` 块 → `nginx -t` → `nginx -s reload`；MechAssist 其它 location 保持不动。
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
cd Code/code && npm run build
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

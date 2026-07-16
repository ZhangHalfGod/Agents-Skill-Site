# 07 — 生产部署笔记（阶段 1.5）

> **主流程**：本机 `git push origin main` → 服务器 `git pull` → `npm ci && npm run build` → Nginx `alias` 构建目录  
> **形态**：α（Nginx 静态托管；**网站无** PM2）  
> **方案 B**：`alias` 直指 `Code/code/docs/.vitepress/dist/`（无 `/dist` 软链）  
> **SoT（2026-07-16）**：正文在本仓 `docs/**`；`build` 前自动 `generate` 刷 `manifest.json`  
> **冻结参数**：ADR-001 §5、`01-server-inventory.md`（主机名 / IP 以库存为准，本文用占位符）  
> **验收**：`http://<PUBLIC_HOST>/agents-skill/` 可开；不占用 3001–3003；不改现有 MechAssist PM2

下文用占位符：

| 占位符 | 含义 |
|--------|------|
| `<PUBLIC_HOST>` | Nginx `server_name`（公网 IP 或域名；**勿**写进角色/技能正文） |
| `/var/www/agents-skill-site` | 服务器上本仓 clone 根 |

---

## 1. 锁定参数

| 项 | 值 |
|----|-----|
| GitHub | `git@github.com:ZhangHalfGod/Agents-Skill-Site.git` |
| 部署分支 | **`main`**（服务器勿长期停在 feature 分支） |
| 服务器目录 | `/var/www/agents-skill-site` |
| 构建目录 | `…/Code/code` |
| 构建产物 / Nginx alias | `…/Code/code/docs/.vitepress/dist/` |
| 索引（MCP 常用） | `…/Code/code/docs/public/manifest.json` |
| 对外 URL | `http://<PUBLIC_HOST>/agents-skill/` |
| 已占用勿碰 | `127.0.0.1:3001/3002/3003`；PM2：`mechassist-api` / `mcp-faq` / `mcp-gaode` |

---

## 2. 本机：提交并推送

```bash
cd <本机仓库>/Code/code
npm run generate    # 别名：npm run sync；刷 manifest / 侧栏
npm run validate    # 可选
cd ../..
git add -A
git status
git commit -m "..."   # 按需
git push origin main
```

服务器用 Deploy Key / SSH key 拉仓。

**VitePress 注意**：站点 `docs/**` 内不要用相对路径链到仓库外的 `Doc/`（会判死链导致 `npm run build` 失败）。工程文档用纯文本路径提及即可。

---

## 3. 服务器：首次部署

与 MechAssist 等并列，**勿混进**其它项目目录。

```bash
cd /var/www
git clone git@github.com:ZhangHalfGod/Agents-Skill-Site.git agents-skill-site
cd agents-skill-site
git checkout main
cd Code/code

node -v   # 需 ≥ 22.2.1
npm ci
npm run build

ls -la docs/.vitepress/dist/index.html
ls -la docs/public/manifest.json
```

配置 Nginx `location /agents-skill/`（见 §5）后 reload。

---

## 4. 服务器：日常更新

### 4.1 推荐路径（跟 main）

```bash
cd /var/www/agents-skill-site
git checkout main
git pull origin main

cd Code/code
npm ci              # lock 无变更可省略
npm run build       # prebuild = generate + validate

ls -la docs/.vitepress/dist/index.html
```

或仓库根：`bash deploy.sh`。

**网站**：无 PM2，一般**不必** `nginx -s reload`（只换了 dist 内容）。  
**远程 MCP**：见 [`../../mcp-remote/deploy/README.md`](../../mcp-remote/deploy/README.md)；仅更新索引时通常**不必**重启（有缓存）；想立刻生效可 `pm2 restart agents-skill-mcp-remote`。

### 4.2 工作区有脏文件、切不了分支

服务器上跑过 `build`/`generate` 后，常出现未提交改动（`manifest.json`、角色页矩阵段、`health.json` 等），会挡住 `git checkout` / `git pull`。

**部署机不要提交这些产物**，直接丢掉再切分支：

```bash
cd /var/www/agents-skill-site
git restore .
# 旧 git：git checkout -- .
rm -rf dist   # 若存在未跟踪的根目录 dist
git checkout main
git pull origin main
```

然后按 §4.1 重新 `npm run build`。

### 4.3 一键脚本备忘

```bash
#!/usr/bin/env bash
set -euo pipefail
cd /var/www/agents-skill-site
git pull origin main
cd Code/code
npm ci
npm run build
test -f docs/.vitepress/dist/index.html
echo "OK → http://<PUBLIC_HOST>/agents-skill/"
```

---

## 5. Nginx

### 5.1 文件位置

| 项 | 路径 |
|----|------|
| 实体配置（编辑这个） | `/etc/nginx/sites-available/mechassist` |
| 启用软链 | `/etc/nginx/sites-enabled/mechassist` |
| 另有 | `default`（**本站不改**） |
| 静态站片段 | `Code/code/deploy/nginx-agents-skill.snippet.conf` |
| 远程 MCP 片段 | `Code/mcp-remote/deploy/nginx-agents-skill-mcp.snippet.conf` |

### 5.2 结构摘要

同一 `server`（`listen 80`）内大致：

| location | 作用 |
|----------|------|
| `/` 等 | MechAssist / 其它业务（勿改） |
| **`/agents-skill/`** | 本站静态 `alias` → `.vitepress/dist/` |
| **`/agents-skill-mcp/`** | 远程 MCP 反代（见 mcp-remote 文档） |

```text
http://<PUBLIC_HOST>:80
  ├─ /                  → MechAssist …
  ├─ /agents-skill/     → …/docs/.vitepress/dist/
  └─ /agents-skill-mcp/ → 127.0.0.1:3921
```

`server_name` 一般为 `<PUBLIC_HOST>`。因此用 `127.0.0.1` 探测时**必须**带 Host（见 §6），否则会落到 `default` 站点 → **假 404**。

### 5.3 静态站 location（方案 B）

```nginx
    # --- agents-skill-site（形态 α / 方案 B；勿改 3001–3003）---
    location /agents-skill/ {
        alias /var/www/agents-skill-site/Code/code/docs/.vitepress/dist/;
        index index.html;
        try_files $uri $uri/ /agents-skill/index.html;
    }
```

`alias` 与 `location` 末尾 `/` 必须配对。改完：

```bash
nginx -t
nginx -s reload
# 或：service nginx reload
# 不要用：systemctl reload nginx（现网可能无该 unit）
```

---

## 6. 验收与排障

### 6.1 产物是否存在

```bash
ls -la /var/www/agents-skill-site/Code/code/docs/.vitepress/dist/index.html
ls -la /var/www/agents-skill-site/Code/code/docs/public/manifest.json
```

### 6.2 经 Nginx 探测（务必带 Host）

```bash
# 错误示范：常进 default → 404，不能据此判站挂了
# curl -sS http://127.0.0.1/agents-skill/

# 正确：与 server_name 一致
curl -sS -o /dev/null -w '%{http_code}\n' \
  -H 'Host: <PUBLIC_HOST>' http://127.0.0.1/agents-skill/
# 期望 200

curl -sS -H 'Host: <PUBLIC_HOST>' \
  http://127.0.0.1/agents-skill/manifest.json | head -c 300
# 期望 JSON；含 contentRoot/docs 或 note 中 SoT 说明

# 或直接打公网 / 域名（浏览器同）
curl -sS -o /dev/null -w '%{http_code}\n' http://<PUBLIC_HOST>/agents-skill/
```

### 6.3 Nginx / 进程

```bash
grep -n 'agents-skill' /etc/nginx/sites-available/mechassist
pm2 list    # 形态 α：网站进程可不存在；远程 MCP 见 agents-skill-mcp-remote
ss -lntp | egrep '3001|3002|3003|3921|80'
```

### 6.4 排障对照

| 现象 | 常见原因 | 处理 |
|------|----------|------|
| `curl 127.0.0.1/…` → 404，带 Host → 200 | 未带 `Host` | 用 §6.2 |
| 带 Host 仍 404，且无 dist | build 失败 | 看 VitePress 死链等日志，修后 rebuild |
| 带 Host 仍 404，有 dist | location 缺失/路径错 | 查 §5，改完 reload |
| build 报 dead link 指向 `Doc/…` | 站点 md 链到仓外 | 改为纯文本路径，勿相对链接 |
| checkout/pull 被本地改动挡住 | 服务器 generate 脏文件 | §4.2 `git restore .` |

浏览器：`http://<PUBLIC_HOST>/agents-skill/`，抽查 `/agents/`、`/skills/`、`/rules/`。

---

## 7. 回滚

```bash
cd /var/www/agents-skill-site
git log --oneline -5
git checkout <上一好用的 commit>
cd Code/code && npm run build
ls -la docs/.vitepress/dist/index.html
```

---

## 8. 安全勾选

- [ ] 未新开安全组端口  
- [ ] 未改 3001–3003 / 现有 MechAssist 相关 PM2  
- [ ] `nginx -t` 通过后再 reload  
- [ ] 未把 `<PUBLIC_HOST>` / 部署 URL 写入 `docs/agents/**` 等正文  
- [ ] 服务器 `.env`（MCP Token）未进 Git  

---

## 附录 — 形态 β（可选）

见 `Code/code/deploy/ecosystem.config.cjs`；一期默认 **α**，网站不启 PM2。

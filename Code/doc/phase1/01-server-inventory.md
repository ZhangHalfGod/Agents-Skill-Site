# 01 — 服务器与运行时清单

> **脱敏**：不要粘贴密码、私钥、Token。可用 `***` 占位。  
> 状态：`[ ]` 待填｜`[x]` 已确认｜`[~]` 文档推断  
> **信息来源**：MechAssist 部署/安全文档、PM2 截图、`node -v` / `ss -lntp` 实机截图（2026-07-10）

## 1. 已确认基线

| 项 | 值 | 确认 | 来源 |
|----|-----|:----:|------|
| 云厂商 / OS | 阿里云 ECS，Ubuntu 22.04 LTS | [x] | 部署文档 |
| 公网 IP | **`8.163.18.183`** | [x] | 本人提供 |
| 域名 | **暂无**（未购买） | [x] | 本人提供 |
| 主机名（截图） | `iZ7xva3ki6uz7x412fcdqpZ` 一类 | [x] | 终端提示符 |
| 进程管理 | PM2（fork）+ `pm2-logrotate` | [x] | 截图 |
| Node 精确版本 | **`v22.2.1`**（更正此前笔误 22.22.1） | [x] | `node -v` 截图 |
| Nginx 站点配置 | **`/etc/nginx/sites-available/mechassist`**（enabled 软链） | [x] | 2026-07-10 实机 |
| 本站 Nginx location | **`location /agents-skill/`** 插入于 `/auth` 后、Gaode 注释前 | [x] | 见 `07-deploy.md` §5 |
| 对外入口 | `http://8.163.18.183/`（80） | [x] | IP + Nginx |
| HTTPS / 443 | 暂无域名，Let's Encrypt 后置 | [x] | 无域名 |
| 已有 PM2 应用 | `mechassist-api`, `mcp-faq`, `mcp-gaode` | [x] | 早前 PM2 截图 |
| 本机 Node 端口 | **`127.0.0.1:3001` / `3002` / `3003`** | [x] | `ss -lntp` |
| 主站后端 | `mechassist-api` → **`127.0.0.1:3002`** | [x] | 部署文档 + ss |
| mcp 两进程端口 | **`3001` 与 `3003`**（名↔端口待 `pm2 jlist` 一一对应） | [~] | ss 三端口 + 三应用 |
| SSH | `sshd` 监听 22（IPv4/IPv6） | [x] | `ss` |
| Tailscale | 已安装（如 `100.68.154.14` 等） | [x] | `ss`；可选内网访问 |
| 安全组（文档） | 公网宜仅 80/443；Node 端口不对公网 | [x] | 安全清单 |
| 部署根惯例 | `/var/www/...` | [x] | 部署文档 |

## 2. 部署与选型（已按 ADR-001 锁定）

| 项 | 冻结值 |
|----|--------|
| 技术栈 | **VitePress**（见 ADR-001） |
| 本站 URL | `http://8.163.18.183/agents-skill/` |
| 本机端口 | `3010`（形态 β；形态 α 可无常驻 Node） |
| 部署目录 | `/var/www/agents-skill-site` |
| PM2 名 | `agents-skill-site` |
| mcp 名↔3001/3003 | 可选复核 |

### 快速确认区（历史；已由 ADR-001 采纳）

| 项 | 值 |
|----|-----|
| 技术栈 | A VitePress ✅ |
| 本站 URL | `http://8.163.18.183/agents-skill/` ✅ |
| 本机端口 | 3010 ✅ |
| 部署目录 | `/var/www/agents-skill-site` ✅ |
| 上线方式 | git pull（默认） |

## 3. 命令输出摘要（已登记）

```text
node -v
v22.2.1

ss -lntp（摘要）:
  127.0.0.1:3001  node
  127.0.0.1:3002  node   ← mechassist-api（文档约定）
  127.0.0.1:3003  node
  0.0.0.0:80 / [::]:80  nginx
  *:22  sshd
  Tailscale 相关监听存在
```

可选补跑（仅映射 mcp 名↔端口）：

```bash
pm2 jlist | python3 -c "import json,sys
for a in json.load(sys.stdin):
 e=a.get('pm2_env',{}); print(a.get('name'),'PORT=',e.get('PORT') or e.get('port'),'cwd=',e.get('pm_cwd'))"
```

## 4. 端口登记表（唯一端口真源）

| 服务 | 绑定地址 | 端口 | 安全组对公网 | 备注 |
|------|----------|------|:------------:|------|
| Nginx | `0.0.0.0` / `::` | **80** | 是 | 当前对外 HTTP |
| Nginx | — | 443 | 预留 | 购域名后再上证书 |
| Node 应用 A | `127.0.0.1` | **3001** | 否 | mcp-faq 或 mcp-gaode |
| mechassist-api | `127.0.0.1` | **3002** | 否 | Extern_API 后端 |
| Node 应用 B | `127.0.0.1` | **3003** | 否 | 另一个 mcp |
| **agents-skill-site** | **`127.0.0.1`** | **`3010`（锁定建议）** | **否** | 本站；Nginx 反代 |
| SSH | `*` | 22 | 按现网策略 | 勿对全网开放 |
| Tailscale | 见 ss | — | — | 可选私网访问 |

> **原则**：新站不新开安全组端口；只听 `127.0.0.1:3010`；公网只走 `http://8.163.18.183/agents-skill/`（经 Nginx）。

## 5. 安全提醒

- 公网 IP 已记入本文，**禁止**写入 `standards/common/agents/standard/**/*.md`。  
- 无域名阶段用 HTTP；有敏感操作时优先经 Tailscale 或后续上 HTTPS。  
- 保持 3001–3003、3010 均不对公网直连。

## 6. 本站部署参数（ADR-001 已锁定）

| 项 | 值 | 状态 |
|----|-----|:----:|
| 代码目录 | `/var/www/agents-skill-site` | 已锁 |
| PM2 名 | `agents-skill-site` | 已锁 |
| 本机端口 | `3010`（形态 β） | 已锁 |
| 对外 URL | `http://8.163.18.183/agents-skill/` | 已锁 |
| Nginx | `location /agents-skill/` 写入 **`sites-available/mechassist`** | 已锁；插入点见 `07-deploy.md` §5 |
| 技术栈 | VitePress | 已锁 |

详见 [`ADR-001-architecture-and-stack.md`](ADR-001-architecture-and-stack.md)。下一步：初始化 `Code/code/`。

# 03 — 远程 MCP（URL / HTTP）系统架构

> **状态**：Accepted（实现约束；本分支 `feature/remote-mcp-http` 专用）  
> **日期**：2026-07-11  
> **暴露面（已确认）**：公网 Nginx `:80` + Bearer Token（非 Tailscale-only）  
> **上级**：[`00-cursor-mcp.md`](00-cursor-mcp.md)、[`01-mcp-server-plan.md`](01-mcp-server-plan.md)、[`02-remote-manifest.md`](02-remote-manifest.md)  
> **代码落点**：[`../../Code/mcp-remote/`](../../Code/mcp-remote/README.md)（**独立目录**，不与 stdio `Code/code/mcp/` 混写）  
> **改代码前必读**：本文件。架构变更须先改本文再写代码。

---

## 1. 目标与非目标

### 1.1 目标

1. Cursor（或其他 MCP 客户端）**只配置一个 URL**，即可调用与现有 stdio MCP **同一套只读 tools**。  
2. 他人**不必**克隆本仓、不必本机跑 `node mcp/server.mjs`。  
3. 与一期静态站、二期 stdio MCP **长期共存**；关闭远程 MCP 不影响网站与本地 stdio。

```text
他人的 Cursor
  └─ MCP type: url / http
        └─ https?://<host>/agents-skill-mcp/   （Nginx 反代）
              └─ 127.0.0.1:<localPort>         （本仓 Code/mcp-remote 进程）
                    └─ 读已发布 manifest（磁盘或同机静态路径）
```

### 1.2 非目标（本阶段明确不做）

| 不做 | 原因 |
|------|------|
| 在网页内跑 Agent / 推理 | S0：站 ≠ 运行时 |
| 写 standards / 远程写接口 | 只读治理 |
| 新开安全组公网端口 | 与一期部署约束一致 |
| 替换或删除 `Code/code/mcp/` stdio | 本地开发与离线兜底仍需要 |
| 把公网 URL 写进 `standards/` 角色 md | ADR / S0 禁区 |
| 与 mechassist 业务端口 3001–3003 抢端口 | 运维隔离 |

---

## 2. 与既有能力的关系

| 能力 | 路径 | 传输 | 客户端是否要本仓 |
|------|------|------|------------------|
| 静态站 | `Code/code/` → `/agents-skill/` | HTTP 静态 | 否 |
| stdio MCP + 远程数据 | `Code/code/mcp/` + `MANIFEST_URL` | stdio | **要**（跑 server.mjs） |
| **远程 MCP（本计划）** | `Code/mcp-remote/` | **HTTP(S) MCP** | **否**（只配 URL） |

- **数据同源**：仍以发布后的 `manifest.json`（及 health / validate-report）为索引；SoT 仍是磁盘 `standards/`。  
- **工具契约同源**：tool 名、参数、返回字段优先对齐 [`01-mcp-server-plan.md`](01-mcp-server-plan.md)；允许抽共享 catalog 模块，但 **HTTP 入口只放在 `mcp-remote/`**。  
- **02 文档不废**：`MANIFEST_URL` 方案继续服务「本机 stdio + 远程数据」；本计划解决「连进程也不要本机跑」。

---

## 3. 硬约束（实现必须遵守）

- [ ] **只读**：禁止任何写 standards / 写仓库 / 远程写 tool  
- [ ] **不新开安全组端口**：对外只走现有 Nginx `:80`（或后续同机 TLS）；进程只 listen `127.0.0.1`  
- [ ] **不占用** mechassist `3001–3003`；本地端口选未占用段（建议默认 `127.0.0.1:3921`，可用环境变量覆盖）  
- [ ] **Nginx 变更**：只在现有 `mechassist` server 块增加 `location`；变更后 `nginx -t` + `nginx -s reload`（**不用** `systemctl reload nginx`）  
- [ ] **鉴权默认开启**：至少 Bearer Token（或等价 Header）；无 Token 的公开 MCP **禁止**作为默认上线形态  
- [ ] **Token 不进 Git**：示例用 `.example`；生产用环境变量 / 服务器本地文件  
- [ ] **关闭 MCP 不影响网站**：远程进程挂了，`/agents-skill/` 静态站仍可用  
- [ ] **角色 md 不写死 MCP URL**  
- [ ] **分支纪律**：远程 MCP 功能实现与联调只在 `feature/remote-mcp-http`（或其后继 PR 分支）进行；合入 main 前计划状态改为 Accepted 并完成验收勾选  

---

## 4. 推荐架构（默认方案）

### 4.1 组件

```text
┌─────────────┐     URL MCP      ┌──────────────┐    proxy     ┌─────────────────┐
│ Cursor 等   │ ───────────────► │ Nginx :80    │ ───────────► │ mcp-remote      │
│ 客户端      │  Authorization   │ /agents-skill │  127.0.0.1   │ Node 进程       │
└─────────────┘     : Bearer     │   -mcp/      │              │ Streamable HTTP │
                                 └──────────────┘              └────────┬────────┘
                                                                        │
                                                                        ▼
                                                               manifest.json 等
                                                               （发布目录或 URL）
```

### 4.2 路径与端口约定

| 项 | 约定 |
|----|------|
| 公网（或内网）入口 | `http://<host>/agents-skill-mcp/`（末尾斜杠策略在实现笔记写死一种） |
| 上游 | `http://127.0.0.1:3921/` |
| 进程绑定 | **仅** `127.0.0.1`，禁止 `0.0.0.0` 直接暴露 |
| 静态站 | 仍为 `/agents-skill/`，互不覆盖 |

### 4.3 传输协议

- 优先实现 Cursor 当前支持的 **Streamable HTTP**（或文档要求的 URL MCP 形态）；若 SDK/客户端差异，在实现笔记记录实测版本。  
- 与 stdio 共用 **tools 列表与语义**；传输层差异封装在 `mcp-remote` 内，不泄漏到 tool 契约。

### 4.4 鉴权

| 层 | 行为 |
|----|------|
| Nginx（可选） | 可先做 `auth_request` / 简单 header 校验；或仅反代，鉴权放应用 |
| 应用（必选） | 校验 `Authorization: Bearer <token>`；失败返回 401，不泄漏 tool 列表 |
| Token 分发 | 运维口头/密钥渠道；文档只写「如何配置」，不写真实值 |

### 4.5 备选：Tailscale-only

若团队决定 **公网完全不暴露 MCP location**：

- Nginx `location` 仅 listen Tailscale IP，或进程只绑 Tailscale 地址；  
- Cursor 侧 URL 使用 Tailscale 主机名；  
- **仍遵守**「不新开安全组端口」；  
- 默认文档仍以 §4.1 为准，Tailscale 作为部署变体写在实现笔记，不另起协议。

---

## 5. 目录与模块边界

```text
Code/mcp-remote/                 # 本功能唯一实现根（本分支主战场）
  README.md                      # 指向本计划 + 本地/服务器运行说明
  package.json                   # 独立依赖；勿强行塞进 VitePress package
  src/                           # HTTP MCP 入口、鉴权、路由
  shared/ 或依赖 ../code/mcp/    # 允许复用 catalog；禁止反向污染站点构建
  deploy/                        # Nginx location 片段、systemd/pm2 示例（无密钥）
  cursor-mcp.url.json.example    # 仅 URL 的 Cursor 配置样例

Code/code/mcp/                   # 保持 stdio；本分支非必要不改
Doc/phase2/03-remote-mcp-http.md # 本文件（架构约束）
Code/doc/phase2/03-remote-mcp-http.md  # 实现笔记（有代码后再写）
```

**边界规则**：

1. VitePress `npm run build` **不得**依赖 `mcp-remote` 启动。  
2. `mcp-remote` **不得**在构建期改写 `standards/`。  
3. 共享逻辑若抽取，优先「mcp-remote 依赖只读模块」，避免站点包体积与 Node 版本被 MCP SDK 绑架。

---

## 6. 配置契约（客户端）

他人 Cursor 最小配置形态（示例，非最终字段名以 Cursor 版本文档为准）：

```json
{
  "mcpServers": {
    "agents-skill-remote": {
      "url": "http://<host>/agents-skill-mcp/",
      "headers": {
        "Authorization": "Bearer <TOKEN>"
      }
    }
  }
}
```

- **禁止**在共享文档中提交真实 Token。  
- 与现有 `cursor-mcp*.json.example`（stdio）并列说明：选 URL **或** stdio，不必双开同一逻辑服务。

---

## 7. 运维与发布

| 步骤 | 要求 |
|------|------|
| 进程 | systemd user / pm2 / nohup 择一；文档写清；**不要**占用 mechassist 那套端口约定 |
| 发布 | 服务器 `git pull` 本分支合入后的代码 → 安装 `mcp-remote` 依赖 → 重启进程 → reload Nginx |
| 健康 | 提供非 tool 的 HTTP 探活（如 `/agents-skill-mcp/healthz`），供运维检查；可无鉴权或单独弱鉴权（实现时二选一写死） |
| 回滚 | 去掉 Nginx location + 停进程即可；静态站零影响 |

与现有「生成物弄脏 working tree」问题：`mcp-remote` 日志与 pid 文件放服务器本地路径，**不**写入仓库跟踪文件。

---

## 8. 分阶段实现（本分支内）

| 阶段 | 内容 | 出口 |
|------|------|------|
| **R0** | 本计划 Accepted；目录脚手架就位 | ✅ 本文 Accepted；暴露面已确认为公网 Nginx + Token |
| **R1** | 本地 `127.0.0.1` Streamable HTTP + Token；tools 对齐 stdio | ✅ `npm run smoke` PASS；Cursor IDE 待人工勾选 |
| **R2** | Nginx location 片段 + 服务器部署说明 | ✅ 片段/PM2/文档已落 `Code/mcp-remote/deploy/`；ECS 粘贴与 pm2 start 待人工 |
| **R3** | 他人零克隆验收；实现笔记勾选；PR → main | 文档与样例齐全 |

每阶段改代码前：若架构有变，先改本文件再写代码。

---

## 9. 验收标准（合入前）

- [ ] Cursor 仅配置 URL + Token，**无本仓**，可 `list_agents` / `get_skill` / `validate` 等与 stdio 对等的只读能力  
- [ ] 错误 Token → 401；无写类 tool  
- [ ] 停掉 `mcp-remote` 进程后，`/agents-skill/` 仍 200  
- [ ] 未新开安全组端口；进程未绑 `0.0.0.0` 对公网  
- [ ] `Code/mcp-remote/` 有 README + example；密钥未进 Git  
- [ ] `Code/doc/phase2/03-remote-mcp-http.md` 实现笔记与验收勾选完成  

---

## 10. 已确认项

| 项 | 决定 |
|----|------|
| 暴露面 | **公网 Nginx `:80` + Bearer Token**（2026-07-11 确认；Tailscale-only 仅作备选变体，不改默认） |
| 本地端口 | `3921`（可用环境变量覆盖） |
| 探活 | `healthz` 无鉴权（实现时写死） |
| 进程管理 | **PM2** 名 `agents-skill-mcp-remote`（2026-07-11 R2；与现网 mcp-* 并列，不改既有进程） |

变更须改本表并留一行说明，再动后续代码。

---

## 11. 相关链接

- S0：[`../SYSTEM-DIRECTION.md`](../SYSTEM-DIRECTION.md)  
- stdio 计划：[`01-mcp-server-plan.md`](01-mcp-server-plan.md)  
- 远程数据（非远程进程）：[`02-remote-manifest.md`](02-remote-manifest.md)  
- 一期部署：[`../../Code/doc/phase1/07-deploy.md`](../../Code/doc/phase1/07-deploy.md)  
- 实现目录：[`../../Code/mcp-remote/`](../../Code/mcp-remote/README.md)  
- 功能分支：`feature/remote-mcp-http`

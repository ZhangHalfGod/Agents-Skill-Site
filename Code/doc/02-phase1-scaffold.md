# 02 — 阶段 1 脚手架技术细节

## 1. 目标（对齐 Doc/04 阶段 1）

| ID | 任务 | 状态 |
|----|------|:----:|
| 1.0 | Code/doc + Code/code 目录 | 完成 |
| 1.0b | 从 MechAssist 部署/安全文档 + 实机截图回填服务器清单 | **基本完成** |
| 1.1 | 确认技术栈并落档 | 待你确认 |
| 1.2 | 在 `Code/code/` 创建可 `dev` 的空工程 | 未开始 |
| 1.3 | 外层导航：agents / skills / rules 空页 | 未开始 |
| 1.4 | content 挂载方式（读 `standards/`） | 未开始 |
| 1.5 | PM2 + Nginx 草案（与现网共存） | 端口已可锁定 3010；待确认子路径 |

## 2. 技术栈候选（待决）

| 方案 | 适配点 | 与现网契合 |
|------|--------|------------|
| **A. VitePress** | Markdown 文档站成熟 | `build` → 静态；Nginx 直接 `root` 或反代 `serve` |
| **B. Astro** | 更灵活 | 同上 |
| **C. 纯 Express 静态** | 与 `mechassist-api` 最像 | 多一个 Node 进程，维护成本高 |

**推荐默认：A. VitePress。** 回复「选 A」后初始化 `code/`。

## 3. 与现网共存部署草图（实机已确认）

```text
公网 http://8.163.18.183:80 → Nginx
                ├─ /          → Extern_API/dist（静态）
                ├─ /api,/auth → 127.0.0.1:3002（mechassist-api）
                ├─ （已有）    → 127.0.0.1:3001 / 3003（mcp-*）
                └─（拟）/agents-skill/ → 127.0.0.1:3010（agents-skill-site）
```

约束：

- 已占用：`3001`、`3002`、`3003`（均 `127.0.0.1`）。  
- 本站锁定：**`127.0.0.1:3010`**；**不**新开安全组端口。  
- 无域名：对外用 `http://8.163.18.183/agents-skill/`；HTTPS 后置。  
- PM2 名：`agents-skill-site`。

## 4. content 挂载（预决策）

| 方式 | 说明 | 倾向 |
|------|------|------|
| 构建时扫描/拷贝 `Agents_Skill/standards` | 发布包自包含 | 一期推荐 |
| 运行时读服务器绝对路径 | 需服务器有完整树 | 二期可选 |

## 5. 待决清单

- [x] Nginx + PM2 + Node `v22.2.1`  
- [x] 公网 IP `8.163.18.183`；无域名  
- [x] 本机端口 3001/3002/3003；本站建议 3010  
- [ ] 技术栈 A/B/C  
- [ ] 确认 Nginx `/agents-skill/` + 部署目录  
- [ ] （可选）mcp 名↔3001/3003 映射  

## 6. 可复用的现网运维命令（参考）

| 操作 | 现网命令 | 本站类比 |
|------|----------|----------|
| 看日志 | `pm2 logs mechassist-api` | `pm2 logs agents-skill-site` |
| 重启 | `pm2 restart mechassist-api` | `pm2 restart agents-skill-site` |
| 重载 Nginx | `sudo systemctl reload nginx` | 同左 |
| 健康检查 | `curl http://127.0.0.1:3002/health` | `curl http://127.0.0.1:3010/`（拟定） |
| 公网验证 | `curl http://8.163.18.183/` | `curl http://8.163.18.183/agents-skill/`（上线后） |

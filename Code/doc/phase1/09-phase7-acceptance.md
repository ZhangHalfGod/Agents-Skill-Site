# 09 — 阶段 7 一期验收报告

> 日期：2026-07-11  
> 对照：[`Doc/phase1/01-requirements.md`](../../../Doc/phase1/01-requirements.md) §4  
> 公网：`http://8.163.18.183/agents-skill/`（含 Domains / 运行指引 / Health）

## 7.1 需求验收勾选

| 项 | 通过标准 | 结果 |
|----|----------|:----:|
| 外层分区 | 首页可进入 agents / skills / rules | ✅ |
| 8 角色全覆盖 | 每角色页可开、正文非空 | ✅ |
| 技能标签 | 每角色有绑定标签且可点 | ✅ |
| 说明书链接 | 标签 → `/skills/...` SKILL 可渲染 | ✅ |
| URI 一致 | 与 `03-uri-registry` 一致；validate 门禁 | ✅ |
| 规则分层 | L0/L1/L2 可浏览且各有条目 | ✅ |

补充（阶段 5/6，超出 §4 基线但已上线）：

| 项 | 结果 |
|----|:----:|
| Domains 四领域目录 + ptp-nmos 灰度 | ✅ |
| RunGuide（复制触发句 / 技能顺序 / 导出 md） | ✅ |
| QuickJump（使用角色/技能 N） | ✅ |
| `/health/` validate OK | ✅ |

## 7.2 死链扫描

```bash
cd Code/code && npm run check:links
```

- 报告：`docs/public/dead-link-report.json`
- 出门条件：`deadCount === 0`

（本机执行结果以报告文件为准；发布前必跑。）

## 7.3 复盘摘要

### 做得对的

1. **治理 / 执行分家**：网站只索引，Cursor 才执行（S0）。  
2. **manifest + validate 门禁**：错误发布可阻断。  
3. **形态 α 静态托管**：不与 PM2 业务进程抢端口。  
4. **Domains 可开关**：`site.config.json` / `ENABLE_DOMAINS`，关域不影响 common。  
5. **运行指引组件化**：复制 / 导出比纯 Markdown 步骤更可用。

### 踩坑与稳定做法（可回灌）

| 坑 | 稳定做法 |
|----|----------|
| 服务器 `git pull` 被 health/manifest 本地改动挡住 | pull 前 `git checkout --` 生成物，或 `reset --hard` |
| 无 `nginx.service` | 用 `nginx -s reload` |
| 子路径站不能改 `root` | 用 `location /agents-skill/` + `alias` |
| 服务器无 standards | sync 自动 repo scan；正文靠本机 sync 后入库 |
| common 缺 NmosEngineer 源 | sync 跳过缺失源 + `patchAgentRunGuides` 保运行指引 |

### 回灌建议

- 运维类：发布检查清单已在 `08-release-checklist.md`（对齐 OpsEngineer）。  
- 技能：可将「子路径静态站 + validate 门禁」摘要写入 `traceability-compliance` 或运维笔记（二期回灌 standards，不在本仓改 SoT）。

## 7.4 operations 入口（二期范围确认）

| 结论 | 说明 |
|------|------|
| **一期不做** operations 公网浏览 | 避免实例淹没模板；敏感日志不上公网（NFR-3） |
| **二期可选** | 仅本地 / Tailscale 只读挂载 `standards/operations/`；须单独开关 |
| 占位 | 站点可不建 `/operations` 路由，直至二期 ADR |

二期主规划：[`Doc/phase2/00-cursor-mcp.md`](../../../Doc/phase2/00-cursor-mcp.md)。

## 签字

| 项 | 值 |
|----|-----|
| 验收人 | |
| 日期 | 2026-07-11 |
| 结论 | **一期 MVP 验收通过**；进入二期规划（Cursor + MCP） |

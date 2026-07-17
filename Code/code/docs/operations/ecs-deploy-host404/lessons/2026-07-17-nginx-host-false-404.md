---
id: 2026-07-17-nginx-host-false-404
project: ecs-deploy-host404
date: 2026-07-17
audience: skill
audience_guess: skill
target_id: stage-gate-flow
priority: P1
status: merged
related_agents: [OpsEngineer]
related_skills: [stage-gate-flow]
---

## 现象

服务器 `git pull` / `npm run build` 后，用 `curl http://127.0.0.1/agents-skill/` 与 `/agents-skill-mcp/healthz` 得到 Nginx **404**，误以为站点或 MCP 挂了。  
另：在 `feature/*` 上跑 build 产生脏 `manifest.json` 等，挡住 `git checkout main`。

## 期望

- 验收时使用 `-H 'Host: <PUBLIC_HOST>'` 或直接访问公网/域名  
- 部署机不提交 generate 产物；切分支前 `git restore .`  
- 门禁/技能里写清部署验收步骤，避免重复踩坑

## 当时上下文

- 角色：运维 / 站点维护  
- 技能：stage-gate-flow（出门验收）  
- 摘要：dist 与 manifest 实际已生成；Nginx location 存在；带 Host 后 200 / healthz ok

## 建议沉淀形态

- [x] 扩写已有 skill checklist（部署验收）  
- [ ] 新 skill  
- [ ] 改 agent 职责或矩阵绑定  
- [ ] 升 L2 rule  
- [ ] 仅项目内保留，不升格  

## 证据

- 部署文档：`Code/doc/phase1/07-deploy.md` §6  
- MCP 部署：`Code/mcp-remote/deploy/README.md`  

## 蒸馏笔记

- 升格目标路径：`docs/skills/custom/common/stage-gate-flow/docs/deploy-verify.md` + 主页清单引用  
- 变更摘要：Host 探测、脏工作区、PM2 何时重启；禁止无 Host 误判  

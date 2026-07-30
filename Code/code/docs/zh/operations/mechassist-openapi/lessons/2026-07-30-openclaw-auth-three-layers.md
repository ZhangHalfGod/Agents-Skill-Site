---
id: 2026-07-30-openclaw-auth-three-layers
project: mechassist-openapi
date: 2026-07-30
audience: skill
audience_guess: skill
target_id: ""
priority: P1
status: raw
scope: common
seen_in_projects: [mechassist-openapi]
promoted_to: ""
related_agents: [OpsEngineer]
related_skills: [openclaw-ops]
---

# Lesson：OpenClaw 认证三层解剖——401 先分清是"谁的路径"，key 必须持久化 + 双写

## 现象

端到端首跑中途飞书侧 main 报 `Authentication failed (HTTP 401)`。排查发现三条认证路径状态各异：

| 路径 | 凭据来源 | 当时状态 |
|------|---------|---------|
| 角色 agent（pm/arch 等）CLI + 会话 | 各自隔离 store（`paste-api-key --agent X` 注入） | ✅ 健康（pm ping 通） |
| main CLI（`openclaw agent --agent main`） | main 隔离 store | ❌ 从未注入，"No API key found" |
| main 飞书（channel 会话） | gateway 进程环境变量 / 默认 profile | ❌ 401（env 里的值失效或损坏） |

根因：`DEEPSEEK_API_KEY` 当初只在某个终端会话 `$env:` 临时设置，**从未持久化**（用户/机器级环境变量均不存在）；gateway 进程全靠那次会话的环境存活，值出问题后飞书路径整个 401。而角色 agent 因昨天逐一 paste 进隔离 store，完全免疫。

## 期望

- API key 注入标准动作（三件套，缺一不可）：① `setx` 用户级环境变量持久化（防丢）② `openclaw models auth paste-api-key --provider X`（默认 profile，gateway/飞书路径）③ `openclaw models auth --agent <每个 agent> paste-api-key`（各隔离 store，含 main）
- 401 诊断顺序：`openclaw models status --check`（看 effective 来源）→ `auth list --agent X`（看 store 有没有）→ 直连 provider API 验 key 真伪（curl `/v1/models`）→ 再决定重注还是重启 gateway
- 改 env 类修复必须重启 gateway 才生效（gateway 只继承启动时刻的环境；Windows 用 `gateway run --force`，`restart` 子命令报 SIGUSR1）；profile/store 类修复可能热加载，先验后重启
- 掩码相同 ≠ 值完好：`models status` 里 gateway env 的掩码尾号与健康 store 的 key 尾号一致，但行为不同——掩码只是显示，别当证据

## 当时上下文

- 角色：编排总线运维（bm 机，端到端首跑中途故障）
- 技能：openclaw-ops（建议升格时把「三层解剖表 + 三件套」写进该 skill 首页）
- 摘要：误判方向（"没调到 pro 模型"）→ 实测为 provider 认证失效；修复后 CLI/飞书两路径均恢复，流程续跑完成

## 建议沉淀形态

- [ ] 新 skill
- [x] 扩写已有 skill checklist（openclaw-ops 首页「认证三层解剖」+ 注入三件套；setup-agents.ps1 注释对齐三件套口径）
- [ ] 改 agent 职责或矩阵绑定
- [ ] 升 L2 rule（须说明重复次数）
- [ ] 仅项目内保留，不升格

## 证据

- 修复过程：2026-07-30 本 session（models status 显示 effective=env；GetEnvironmentVariable User/Machine 均为 null；从 pm store 提取有效 key 直连 deepseek API 验 200；三处补齐后 main CLI ping 通、飞书恢复）
- `Code/orchestration/openclaw/setup-agents.ps1`（现只覆盖角色 agent store，未含 main 与默认 profile——待补齐口径）

## 蒸馏笔记（status=distilled 后填）

- 升格目标路径：
- 变更摘要：

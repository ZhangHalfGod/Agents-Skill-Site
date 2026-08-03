# Home · 本地脚本

> 本目录放 **Home 机**常用编排/运维入口；通用实现仍可在 `Code/orchestration/openclaw/`。

| 脚本 | 说明 |
|------|------|
| [`register-cron.cmd`](register-cron.cmd) | 跳转到 `../cron/register-weekly-lesson-digest.ps1`（需传 `-FeishuTo`） |
| [`run-cron-now.cmd`](run-cron-now.cmd) | 立即触发周推（需先有 `../cron/job-id.txt`） |
| [`setup-home-agents.cmd`](setup-home-agents.cmd) | 调用仓内 `setup-agents.ps1`（七角色） |
| [`invoke-cursor-agent.cmd`](invoke-cursor-agent.cmd) | 调用仓内 Home 版 `invoke-cursor-agent.ps1` |

路径根：`E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site`

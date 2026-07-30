# orchestration — OpenClaw 编排总线配置样例

> **四期 4B**：契约文档在 [`../../Doc/phase4/`](../../Doc/phase4/README.md)（先读 `03-openclaw-route-table.md`）。  
> **边界**：本目录只有 `*.example` 样例与 Prompt 模板，**无密钥、无真实部署配置**；真实配置留部署侧（`MechAssist-Fusion/scripts/openclaw/` + `~/.openclaw/`）。  
> **运行时**：编排会话跑在 OpenClaw 部署侧；本仓网站不含任何会话执行代码（S0 §3.2-2）。

## 目录

```text
orchestration/
  README.md                        ← 本文件
  openclaw/
    agents.example.yaml            ← 命名 agent + 模型分层（含分档实例化与改模型正路注释）
    mcp.servers.example.yaml       ← MCP 服务挂接样例（对应 Doc/phase4/04）
    setup-agents.ps1               ← 花名册一键重建/对齐脚本（幂等，无密钥；详见头注释）
  envelopes/
    handoff.example.yaml           ← 交接信封实例（H1：PM → Architect）
  prompts/
    orchestrator-main.md           ← 编排者 main 软校验 Prompt 模板
    role-session.md                ← 角色 session 通用 Prompt 模板
```

## 使用顺序（试点 B3）

0. （新机器）跑 `openclaw/setup-agents.ps1` 一键建花名册；设 `$env:DEEPSEEK_API_KEY` 可自动注 key
1. 部署侧对照 `openclaw/*.example.yaml` 写真实配置（键名待验证项见 `Doc/phase4/03` §1）
2. 编排者 session 载入 `prompts/orchestrator-main.md`；角色 session 载入 `prompts/role-session.md`
3. 每跳交接按 `envelopes/handoff.example.yaml` 格式提交信封
4. 跑通最小两跳（PM → Architect）后，证据与 Lesson 落 `Code/doc/phase4/` 与 `operations/`

## 禁止

- 提交真实 Token / App Secret / 内网地址+凭证组合
- 把样例键名当成已验证事实——标注「待验证」的键名以部署侧实测为准
- 在本目录放任何会话执行代码（这里是契约与模板，不是运行时）

# OpenClaw workspace 快照（入库）

> **用途**：把各机 `~/.openclaw/workspace/` 里**可共享的配置文档**存进本仓，便于 Home/bm 对照与恢复。  
> **不是**运行时真源：Gateway 仍读本机 `%USERPROFILE%\.openclaw\workspace\`。  
> **密钥**：`folder_token` / API Key / App Secret **不得**以真值入库；快照内用占位符。

## 目录

```text
workspace-snapshot/
  README.md                 ← 本说明
  sync-from-live.cjs        ← 从本机 workspace 拉取并脱敏
  bm/                       ← bm 机快照（2026-08-04 起）
    SOUL.md                 ← 含流水线编排段（folder_token 已占位）
    AGENTS.md / TOOLS.md / USER.md / IDENTITY.md / HEARTBEAT.md
    skills/*/SKILL.md       ← workspace 级技能说明
```

## 与仓内其它文件的关系

| 路径 | 角色 |
|------|------|
| `prompts/orchestrator-main-soul.draft.md` | **流水线段草稿**（增量补丁源） |
| `workspace-snapshot/bm/SOUL.md` | bm **整份**线上 SOUL 快照（人格 + 飞书约定 + 流水线） |
| 本机 `~/.openclaw/workspace/SOUL.md` | **现网生效**真源 |

改流程：优先改草稿 → 合并进本机 SOUL → 再跑 `sync-from-live.cjs` 回写快照。

## 不入库（刻意排除）

| 路径 | 原因 |
|------|------|
| `memory/*.md` | 日常会话日记，偏私密/噪声 |
| `SOUL.md.bak-*` | 历史备份，体积大 |
| `tmp/` | 临时 |
| `.git/`（workspace 内嵌） | 与 Site 仓无关 |
| `openclaw.json` / `.env` | 凭证；永不进本目录 |

## 从本机刷新快照（bm）

```powershell
node D:\trae_git\Agents-Skill-Site\Code\orchestration\openclaw\workspace-snapshot\sync-from-live.cjs --machine bm
git -C D:\trae_git\Agents-Skill-Site status
# 在 feature/bm 上 commit
```

## 恢复到新机器（Home 等）

1. 按 [`Doc/guides/local-openclaw-runtime-deploy.md`](../../../Doc/guides/local-openclaw-runtime-deploy.md) 装好 OpenClaw。  
2. 将 `bm/`（或日后的 `home/`）中文件拷到 `%USERPROFILE%\.openclaw\workspace\`（**不要**覆盖你已有的私密 `memory/`，除非你明确要）。  
3. 把 `SOUL.md` 里的 `REPLACE_WITH_FEISHU_FOLDER_TOKEN` 改成**本机/本租户**文件夹 token。  
4. 将绝对路径 `D:\trae_git\...` 改成新机器路径。  
5. `openclaw gateway` 重启或新开会话后抽查流水线段是否存在。

Home 专用差异大时：另建 `workspace-snapshot/home/`，规则相同。

# Home · weekly-lesson-digest（本地定时任务）

> **机器**：Home Windows  
> **契约同源**：`Doc/phase4/05-lesson-memory-loop.md`、`Doc/phase4/03` §6.4  
> **bm 对照**：[`../../bm/cron/`](../../bm/cron/)（bm 已注册 job UUID 见该目录 README）

## 调度

| 项 | 值 |
|----|-----|
| 名称 | `weekly-lesson-digest` |
| Cron | `0 9 * * 1`（每周一 09:00） |
| TZ | `Asia/Shanghai` |
| Agent | `main`（isolated） |
| 投递 | `--announce --channel feishu --to <Home 飞书群 target>` |

## 文件

| 文件 | 说明 |
|------|------|
| [`weekly-lesson-digest.message.md`](weekly-lesson-digest.message.md) | Home 路径版消息（`E:\zhangchangWork\...`） |
| [`register-weekly-lesson-digest.ps1`](register-weekly-lesson-digest.ps1) | 注册 cron（须 UTF-8 读消息） |
| [`run-weekly-lesson-digest-now.ps1`](run-weekly-lesson-digest-now.ps1) | 手动 `cron run`（会真实推群） |

## 注册前准备

1. Gateway 在跑：`openclaw gateway status`  
2. 已有飞书群 target（与 brief 类任务相同格式，常见 `chat:oc_...` / 群 ID）  
3. 本机 Node 可执行 `lesson-scan.mjs`（建议 Node 22）

```powershell
cd E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site\Code\doc\phase4\home\cron
.\register-weekly-lesson-digest.ps1 -FeishuTo "<你的飞书群 target>"
```

注册后把打印的 **job UUID** 写回本目录 README「本机 job」表。

## 本机 job（已注册）

| 项 | 值 |
|----|-----|
| job 名 | `weekly-lesson-digest` |
| UUID | `ec865222-6f22-4190-b8d8-3731299dd2e7`（亦见 `job-id.txt`） |
| 飞书群 | `oc_0758b539866be364e892ba02b7927558` |
| 首次注册日 | 2026-08-02 |
| 调度 | 每周一 09:00 Asia/Shanghai（`0 9 * * 1`） |

> `cron get/run/edit` **只认 UUID**，不认名字。

## 运维速查

```powershell
openclaw cron list
openclaw cron get <uuid>
openclaw cron run <uuid>    # 真实推群
openclaw cron disable <uuid>
openclaw cron enable <uuid>
```

# bm/cron — OpenClaw 定时任务定义（四期 4B · bm）

> 自 `Code/orchestration/cron/` 迁入。Home 版见 [`../../home/cron/`](../../home/cron/)。  
> 本目录只放**任务定义与注册说明**，不放凭据；实际 job 存于 OpenClaw Gateway（`openclaw cron list` 查看）。

## weekly-lesson-digest（每周升格建议推送）

- **形态**：cron agent 消息任务（形态 A，选型见 `Doc/phase4/03-openclaw-route-table.md` §6.4）
- **调度**：每周一 09:00 Asia/Shanghai（`0 9 * * 1`）
- **agent**：`main`（isolated session）；**投递**：announce → feishu 既有简报群（复用 brief-* 任务通道）
- **消息文本**：[`weekly-lesson-digest.message.md`](weekly-lesson-digest.message.md)（改文案改这个文件，然后 edit job）

### 注册（bm 已执行 2026-07-29）

```powershell
# ⚠ 必须 -Encoding UTF8：Windows PowerShell 5.1 默认按 ANSI(GBK) 解码，UTF-8 中文消息会乱码（Lesson 2026-07-29-ps-getcontent-utf8-cron）
$msg = Get-Content "D:\trae_git\Agents-Skill-Site\Code\doc\phase4\bm\cron\weekly-lesson-digest.message.md" -Raw -Encoding UTF8
openclaw cron add weekly-lesson-digest --cron "0 9 * * 1" --tz Asia/Shanghai `
  --agent main --session isolated --message $msg --thinking off --timeout-seconds 600 `
  --announce --channel feishu --to "<feishu 群 target，同 brief-* 任务>" --exact
```

（bm 实际注册 id = `2e5ff3db-91f4-4fff-a8e5-bd0148b9689a`，2026-08-03 09:00 首跑。）

### 运维

| 操作 | 命令 |
|------|------|
| 手动触发一次（会真实推群） | `openclaw cron run 2e5ff3db-91f4-4fff-a8e5-bd0148b9689a` |
| 查看状态/投递结果 | `openclaw cron get 2e5ff3db-91f4-4fff-a8e5-bd0148b9689a`（看 `state.lastRunStatus` / `lastDeliveryStatus`） |
| 改文案 | 改 message 文件后 `openclaw cron edit <id> --message $msg` |
| 暂停 / 恢复 | `openclaw cron disable|enable <id>` |
| 运行历史 | `openclaw cron runs <id>` |
| 删除 | `openclaw cron rm <id>` |

> ⚠ `cron get/run` 只认 **UUID 不认 job 名**（`invalid cron.run params: id not found`）；上表 id = bm 实际注册值。

### 注意

- **确定性契约（v3 细化）**：摘要【骨架】由 `lesson-scan.mjs --format digest` 确定性生成，agent 必须逐行原样保留（完整性归脚本）；允许 agent 读卡后每条**追加一行「判决建议」**（建议性，标注「终审在人」），追加失败只降级为纯骨架、不会丢条目。第一版让 agent 自己提取时漏了 1/3 条目——LLM 摘要不可信。改骨架格式 = 改脚本 `renderDigest`；改判决自由度 = 改消息文本第 3 条
- agent 消息任务经 Gateway 执行；bm 观测到偶发 1006 断连（详见 `Doc/phase4/03` §6.1），agent 有 embedded 回退，cron 调度侧失败会在 `cron runs` 留 error，可手动 `cron run` 补发
- 升级形态 B（webhook 富卡片）时：凭据走 `LESSON_DIGEST_FEISHU_WEBHOOK` env（只写 `~/.openclaw/.env`，不进仓），脚本设计见试点《架构约束与接口》

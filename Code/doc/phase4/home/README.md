# Code/doc/phase4/home — Home 机落地

> 本机（Home Windows）流水线试跑产物、本地 cron、快捷脚本。  
> bm 产物见 [`../bm/`](../bm/)。

## 提示词模板（从根 README 跳转）

- 总入口：[Doc/guides/openclaw-feishu-pipeline-prompts.md](../../../../Doc/guides/openclaw-feishu-pipeline-prompts.md)
- 当前全流水例子：[run-openapi-doc-sync-20260802/feishu-prompts.md](run-openapi-doc-sync-20260802/feishu-prompts.md)（含**预授权全自动至 Lesson**）
- 手机候选需求（关键词+整段话术）：[mobile-feishu-candidates-20260802.md](mobile-feishu-candidates-20260802.md)

## 目录

| 路径 | 说明 |
|------|------|
| [`run-m18-browser-matrix-20260801/`](run-m18-browser-matrix-20260801/) | M18 浏览器矩阵 H1–H4 试跑证据 |
| [`run-openapi-doc-sync-20260802/`](run-openapi-doc-sync-20260802/) | openapi-doc-sync 全流水试跑 |
| [`cron/`](cron/) | `weekly-lesson-digest` 消息模板 + 注册/触发脚本（Home 路径） |
| [`scripts/`](scripts/) | `.cmd` 入口（注册 cron、setup-agents、invoke-cursor-agent） |

## 下次 run-dir

`run-dir-presets.yaml` 的 `phase4` 根已指向本目录：新项目会落在  
`Code/doc/phase4/home/run-<shortName>-<YYYYMMDD>/`。

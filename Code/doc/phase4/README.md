# Code/doc/phase4 — 四期实现笔记 / 试跑证据

> 工程规划（SoT）：[`Doc/phase4/`](../../../Doc/phase4/README.md)。  
> **按机器分目录**：避免 Home / bm 产物混放。

## 分册

| 目录 | 机器 | 内容 |
|------|------|------|
| [`home/`](home/) | Home Windows | M18 矩阵试跑；**本地 cron + cmd 脚本** |
| [`bm/`](bm/) | bm Windows | pilot / e2e-openapi / 各 openapi run-dir；bm cron 定义 |

## 索引（历史）

| 日期 | 笔记 | 内容 |
|------|------|------|
| 2026-07-29 | [bm/2026-07-29-phase4a-and-pilot.md](bm/2026-07-29-phase4a-and-pilot.md) | 4A 落地 + 4B 最小两跳试点 |
| 2026-08-01 | [home/run-m18-browser-matrix-20260801/](home/run-m18-browser-matrix-20260801/) | Home M18 浏览器矩阵流水线 |

## cron 落点

| 机器 | 路径 |
|------|------|
| Home | [`home/cron/`](home/cron/) |
| bm | [`bm/cron/`](bm/cron/)（原 `Code/orchestration/cron/`，已迁入） |

`Code/orchestration/cron/README.md` 仅保留跳转说明。

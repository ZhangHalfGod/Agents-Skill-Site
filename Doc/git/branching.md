# 分支约定（Agents-Skill-Site）

> **日期**：2026-07-31  
> **模型**：`main` 长久发行 · `develop` 集成 · `feature/*` 特性开发

## 分支角色

| 分支 | 用途 | 谁往里合 |
|------|------|----------|
| **`main`** | 长久发行 / 可部署到 ECS 的稳定线 | 仅从 `develop`（或 hotfix）经 PR / 发版合入 |
| **`develop`** | 日常集成、待发版内容 | `feature/*` PR |
| **`feature/<短名>`** | 单特性开发 | 从 `develop` 拉出，合回 `develop` |

历史分支如 `feature/phase4-memory-orchestration` 仍可保留；**新工作一律从 `develop` 开 `feature/...`。**

## 日常命令

```bash
# 开新特性
git fetch origin
git checkout develop
git pull origin develop
git checkout -b feature/my-topic

# 开发… commit…
git push -u origin feature/my-topic
# 开 PR：feature/my-topic → develop

# 发版（develop 稳定后）
# 开 PR：develop → main，或本地 merge 后 push main
# ECS 跟 main（或发版 tag）pull + build
```

## 注意

- 勿在 `main` 上直接堆功能 commit；热修可用 `hotfix/*` → `main`，再回灌 `develop`。  
- Lesson / docs / MCP 部署仍以 **`main` 发行结果** 为准（ECS pull）。  
- 本地未合入的 `feature/*` 不要当线上真源。

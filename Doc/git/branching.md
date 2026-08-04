# 分支约定（Agents-Skill-Site）

> **日期**：2026-08-04（双机并行段补丁）  
> **模型**：`main` 长久发行 · `develop` 集成 · `feature/*` 特性开发  
> **双机**：`bm` / `Home` 各开自己的 `feature/*`，互不直接改对方分支；合回都走 `feature → develop`。

## 分支角色

| 分支 | 用途 | 谁往里合 |
|------|------|----------|
| **`main`** | 长久发行 / 可部署到 ECS 的稳定线 | 仅从 `develop`（或 hotfix）经 PR / 发版合入 |
| **`develop`** | 日常集成、待发版内容 | `feature/*` PR |
| **`feature/<短名>`** | 单特性开发 | 从 `develop` 拉出，合回 `develop` |

历史分支如 `feature/phase4-memory-orchestration` 仍可保留；**新工作一律从 `develop` 开 `feature/...`。**

## 双机并行（bm ↔ Home）

| 机器 | 分支 | 规则 |
|------|------|------|
| **Home** | `feature/home` | 只碰本分支；证据优先 `Code/doc/phase4/home/` |
| **bm** | `feature/bm` | 只碰本分支；证据优先 `Code/doc/phase4/bm/`（或暂留旧 phase4 路径，**勿写进 `home/`**） |

**隔离**

- 两边都从**当时最新** `origin/develop` 拉出；**不要**长期停在裸 `develop` 上直接改。  
- **互不** `checkout` / `push` / 改对方的 `feature/*`。  
- 合入顺序：哪边先稳就先 PR → `develop`；另一边合之前先 `git pull origin develop` 再 rebase/merge，避免互相覆盖。  
- **OpenClaw**：两机各自 SOUL / Bot / Gateway。`promote-commit` 默认只在 `develop` 上跑；在 `feature/*` 上升格改人工 `git commit`。  
- **ECS**：继续跟 `main`。`feature/home` / `feature/bm` 都不是部署真源；合进 `develop` 后再发版合 `main`。

**bm 开分支**

```bash
git fetch origin
git checkout develop
git pull origin develop
git checkout -b feature/bm
# 只在 feature/bm 上开发 / commit
git push -u origin feature/bm
```

**Home**：`feature/home` 可稍后 `push -u` 或直接 PR → `develop`。bm 开 `feature/bm` **不依赖** Home 是否已合入；若 Home 已先合进 `develop`，bm 拉 `develop` 时会带上那些 Lesson。

**本地 `main` 对齐（任一侧分叉时）**

有用内容已在各自 `feature/*`（或 salvage 标签）后，可：

```bash
git checkout main
git fetch origin
git reset --hard origin/main
```

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

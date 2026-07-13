# 分支合并记录：feature/remote-mcp-http → main

> **日期**：2026-07-13  
> **操作人**：Reasonix  
> **状态**：已完成

---

## 背景

`feature/remote-mcp-http` 分支开发并验收完成后，需要将其合并回 `main` 作为最新的稳定基线。该分支包含：

- 远程 HTTP MCP 服务器（`Code/mcp-remote/`）
- Stdio MCP 服务器（`Code/code/mcp/`）
- 统一只读工具层（`catalog-api.mjs`）
- 文档重构（`Doc/` 按 phase1/phase2 分目录）
- README 重写与敏感信息脱敏
- 部署配置与 Nginx 配置

---

## 分支关系

合并前的提交拓扑：

```text
main:      ...---dabaa6c（停留在"阶段 4"验收状态）
                           \
feature/remote-mcp-http:    dabaa6c---3900a68---547cd99---3e70321---d192b55
                               ↑                                            ↑
                           merge base（main 的指针位置）               feature 最新提交
```

`main` 是 `feature/remote-mcp-http` 的直接祖先，没有分叉——适合 **fast-forward（快进）** 合并。

---

## 执行命令

### 在本机（或主开发机）

```bash
# 1. 切到 main 分支
git checkout main

# 2. 快进合并（main 指针直接移到 feature 的位置）
git merge feature/remote-mcp-http

# 3. 推送更新到远程
git push origin main

# 4. 删除本地 feature 分支
git branch -d feature/remote-mcp-http

# 5. 删除远程 feature 分支
git push origin --delete feature/remote-mcp-http
```

### 在其他机器（服务器、同事电脑）

```bash
# 1. 拉取远程最新信息（同时清理已删除的远程分支引用）
git fetch --prune

# 2. 切到 main（如果本地没有 main，会自动基于 origin/main 创建）
git checkout main

# 3. 拉取最新代码
git pull origin main

# 4. （可选）删除本地残留的 feature 分支
git branch -d feature/remote-mcp-http
```

---

## merge 输出摘要

```
Updating dabaa6c..d192b55
Fast-forward

 69 files changed, 5632 insertions(+), 244 deletions(-)
```

变更统计：

| 类型 | 数量 |
|------|:----:|
| 新增文件 | 47 |
| 修改文件 | 13 |
| 移动/重命名 | 9 |
| 删除文件 | 0 |
| **总计** | **69** |

### 主要变更

| 类别 | 文件 | 说明 |
|------|------|------|
| **MCP 远程服务** | `Code/mcp-remote/`（19 个文件） | 远程 HTTP MCP 服务器，Streamable HTTP + Bearer Token |
| **MCP 本地服务** | `Code/code/mcp/`（5 个文件） | Stdio MCP 服务器，`catalog-api.mjs` 统一工具层 |
| **文档重构** | `Doc/phase1/`、`Doc/phase2/` | 按阶段分目录组织工程文档 |
| **实现笔记** | `Code/doc/phase1/`、`Code/doc/phase2/` | 实现笔记、ADR、部署日志按阶段归档 |
| **README** | `README.md`（根目录新增） | 项目主页，含背景、痛点、解决方案、架构图 |
| **脱敏处理** | 6 个配置文件 | 公网 IP → `YOUR_DEPLOYED_HOST`，Token 占位符 |
| **部署配置** | `deploy.sh`、Nginx snippet | 部署脚本与 Nginx 配置模板 |

---

## 分支清理后状态

```text
main:  d192b55 feat:Add open enable（最新）
       │
       ├── 3e70321 docs: R3 zero-clone guide, Cursor setup, and Nginx scheme B
       ├── 547cd99 finish R2
       ├── 3900a68 R1：smoke remote mcp for agents 鉴权
       └── dabaa6c just 联调验收与复盘回
               └── ... 更早的提交

分支: 只有 main
远程: 只有 origin/main
```

---

## 后续维护说明

| 场景 | 做法 |
|------|------|
| 新功能开发 | 从 `main` 创建新分支：`git checkout -b feat/xxx` |
| 紧急修复 | 从 `main` 创建：`git checkout -b fix/xxx` |
| 部署 | 在 main 上 `bash deploy.sh`（自动 git pull + npm run build） |
| 同步上游模板 | `git pull upstream main`（如果配置了 upstream 远程） |

---

## 参考

- [Git 官方文档 - 分支与合并](https://git-scm.com/book/zh/v2/Git-%E5%88%86%E6%94%AF-%E5%88%86%E6%94%AF%E7%9A%84%E6%96%B0%E5%BB%BA%E4%B8%8E%E5%90%88%E5%B9%B6)
- 项目 S0 约束：[SYSTEM-DIRECTION.md](SYSTEM-DIRECTION.md)

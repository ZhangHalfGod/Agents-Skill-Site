# Fork 与 Upstream 操作指南

> **本文档说明如何 fork 本仓库、添加上游跟踪、同步上游更新，以及推送自己的定制内容。**
> 适用场景：你想基于 `Agents-Skill-Site` 为你的公司或团队建立私有定制版本。

---

## 目录

- [什么是 Fork](#什么是-fork)
- [什么是 Upstream](#什么是-upstream)
- [完整操作流程](#完整操作流程)
- [同步上游更新](#同步上游更新)
- [常见问题](#常见问题)

---

## 什么是 Fork

Fork（分叉）是在 GitHub 上复制一个仓库到你自己的账号下。fork 后的仓库完全属于你，你可以任意修改、推送、部署，不会影响原仓库。

```
原仓库（上游）
ZhangHalfGod/Agents-Skill-Site
       │
       │  点击 GitHub 右上角的 Fork 按钮
       ▼
你的 Fork（origin）
你的用户名/Agents-Skill-Site
```

## 什么是 Upstream

`upstream` 是 Git 中一个**远程仓库的别名**（类似 `origin`），指向原仓库。加上 upstream 后，你可以方便地拉取原仓库的最新更新。

| 别名 | 指向 | 权限 |
|------|------|:----:|
| `origin` | 你的 fork（`你的用户名/Agents-Skill-Site`） | 读写 |
| `upstream` | 原仓库（`ZhangHalfGod/Agents-Skill-Site`） | 只读 |

> `upstream` 只是你本地 Git 的一个配置，**不影响原仓库**。原仓库不知道也不关心你是否加了 upstream。

---

## 完整操作流程

### 第一步：Fork（GitHub 网页操作）

1. 打开 `https://github.com/ZhangHalfGod/Agents-Skill-Site`
2. 点击右上角的 **Fork** 按钮
3. 在弹出页面中：
   - **Owner**：选你的个人账号或公司组织
   - **Repository name**：可以改名（如 `Agents-Skill-Site-Company`）
   - ✅ **Copy the `main` branch only** — 只复制 main
4. 点击 **Create fork**

### 第二步：克隆到本地

```bash
# 克隆你的 fork（不是原仓库）
git clone https://github.com/你的用户名/Agents-Skill-Site.git
cd Agents-Skill-Site
```

### 第三步：添加上游仓库

```bash
git remote add upstream https://github.com/ZhangHalfGod/Agents-Skill-Site.git
```

验证添加结果：

```bash
git remote -v
# 输出示例：
# origin    https://github.com/你的用户名/Agents-Skill-Site.git (fetch)
# origin    https://github.com/你的用户名/Agents-Skill-Site.git (push)
# upstream  https://github.com/ZhangHalfGod/Agents-Skill-Site.git (fetch)
# upstream  https://github.com/ZhangHalfGod/Agents-Skill-Site.git (push)
```

> 注意：即使 upstream 显示有 `(push)`，你实际上没有写入权限，push 会被拒绝。

### 第四步：开始定制

```bash
cd Code/code
npm ci
npm run dev       # 启动本地预览
```

修改 `standards/` 下的文件，然后运行 `npm run sync` 同步到网站和 MCP。

### 第五步：推送你的定制

```bash
git add -A
git commit -m "feat: 定制公司角色定义和技能"
git push origin main
```

---

## 同步上游更新

当原仓库有更新时（框架改进、bug 修复、新功能），你可以拉取合并到你的 fork。

### 标准流程

```bash
# 1. 拉取上游最新代码
git fetch upstream

# 2. 切到 main 分支
git checkout main

# 3. 将上游的更新合并到你的本地 main
git merge upstream/main

# 4. 推送到你的 fork
git push origin main
```

### 处理冲突

如果上游和你的定制修改了同一个文件，Git 会产生冲突。常见冲突场景：

| 场景 | 冲突概率 | 说明 |
|------|:--------:|------|
| `Code/` 目录 | 低 | 上游改进框架，你的定制一般不动这里 |
| `Doc/` 目录 | 低 | 工程文档，你的定制通常新增而非修改 |
| `README.md` | 中 | 你改了项目介绍，上游也可能更新 |
| `standards/` | **无** | 上游是通用模板，你是公司真实内容，**完全不相交** |

解决冲突：

```bash
# 冲突时会提示哪些文件有冲突
# 手动编辑这些文件，保留你要的内容
git add <已解决的文件>
git commit -m "merge: 合并上游更新"
git push origin main
```

### 查看上游有哪些更新

```bash
# 查看上游比你的 fork 多了哪些 commit
git log HEAD..upstream/main --oneline

# 查看 upstream 的所有分支
git branch -r
```

---

## 常见问题

### 加 upstream 会影响到原仓库吗？

**完全不会。** `upstream` 只是你本地 Git 的一个远程地址配置，所有操作（fetch、merge）都在你的本地和你的 fork 之间进行。原仓库没有任何感知。

### 没有 upstream 能拉取更新吗？

能。不用 `git fetch upstream`，直接用完整 URL：

```bash
git pull https://github.com/ZhangHalfGod/Agents-Skill-Site.git main
```

只是每次都要打一长串地址，`upstream` 是省事的别名。

### 我想把我定制的技能贡献回原仓库怎么办？

1. 确保你的改动只涉及通用层（不包含公司敏感信息）
2. 在你的 fork 上创建一个新分支
3. 提交 Pull Request（PR）到原仓库
4. 原仓库维护者 review 后合并

具体操作：

```bash
git checkout -b feat/my-useful-skill
# ... 修改通用技能 ...
git push origin feat/my-useful-skill
```

然后去 GitHub 你的 fork 页面，点击 **Contribute → Open Pull Request**。

### 我只想用网站，不想 fork 怎么办？

可以直接部署。不需要 fork，也不需要 clone 整个仓库：

```bash
# 在服务器上
git clone https://github.com/ZhangHalfGod/Agents-Skill-Site.git
cd Agents-Skill-Site/Code/code
npm ci && npm run build
# 配置 Nginx alias 到 dist/ 目录
```

这样你得到的是原版通用模板。如果你不需要定制角色和技能，这种方式更简单。

---

## 参考

- [GitHub 官方文档 - Fork 仓库](https://docs.github.com/zh/get-started/quickstart/fork-a-repo)
- [Git 官方文档 - 远程仓库](https://git-scm.com/book/zh/v2/Git-%E5%9F%BA%E7%A1%80-%E8%BF%9C%E7%A8%8B%E4%BB%93%E5%BA%93%E7%9A%84%E4%BD%BF%E7%94%A8)
- [分支合并记录](branch-merge-record.md)

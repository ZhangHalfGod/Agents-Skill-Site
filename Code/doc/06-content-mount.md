# 06 — content 挂载约定（阶段 1.4 / 2 / 3）

> 对齐 ADR-001 §4、`Doc/02-architecture.md`、`Doc/05-agent-skill-matrix.md`。

## 1. 原则

| 项 | 约定 |
|----|------|
| Source of Truth | `Agents_Skill/standards/**` |
| 站点页 | `Code/code/docs/**` 同步派生页 |
| 方向 | **只读拷贝**；禁止回写 standards |
| 部署 URL | **禁止**写入 standards 角色/技能 md |
| 内部链接 | 目录型页面需尾斜杠 |
| 技能包相对链接 | `./reference/*.md` 改为源路径提示（不挂载附属 HTML 风险文件） |

## 2. 命令

```bash
cd Code/code
npm run sync
npm run dev
npm run build
```

`STANDARDS_ROOT` 可选；默认 `../../../standards`。

## 3. 当前范围

| 分区 | 内容 | 状态 |
|------|------|:----:|
| Agents | 8 角色 + 6 附属 docs + 标签 + 运行指引 | **已通** |
| Skills | 1～11 `SKILL.md` + 反向角色 | **已通** |
| Rules | L0×3 + L1×3 + L2×4（`.mdc`） | **已通** |

产物：`manifest.json`、三份 `sidebar.*.generated.json`。

## 4. 下一步

- 阶段 4：`scan` → `validate`（URI/矩阵对账，失败阻断 build）
- 1.5：ECS Nginx/PM2 部署笔记

## 5. 验收

- [x] 1.4 Architect  
- [x] 阶段 2 八角色  
- [x] 阶段 3 Skills+Rules；`npm run build` 通过  

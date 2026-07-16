# 06 — content 约定（本仓 docs 就地 SoT）

> 对齐 ADR-001 §4、`Doc/phase1/02-architecture.md`、S0 `2026-07-16-01`。

## 1. 原则

| 项 | 约定 |
|----|------|
| Source of Truth | 本仓 `Code/code/docs/**` |
| 索引生成 | `npm run generate` → `manifest.json` + 侧栏 + 目录页 |
| 方向 | **禁止**用外仓拷贝覆盖正文；`STANDARDS_ROOT` 已忽略 |
| 部署 URL | **禁止**写入角色/技能正文 |
| 内部链接 | 目录型页面需尾斜杠 |

## 2. 命令

```bash
cd Code/code
npm run generate   # 别名：npm run sync
npm run dev
npm run build
```

## 3. 当前范围

| 分区 | 内容 | 状态 |
|------|------|:----:|
| Agents | 8 角色 + 附属 docs + 标签 + 运行指引 | **就绪** |
| Skills | 1～11 + 反向角色 | **就绪** |
| Rules | L0×3 + L1×3 + L2×4 | **就绪** |
| Operations | Lesson 模板 + 示例项目 | **本仓就绪**（公网可关） |

## 4. 验收

- [x] generate 不依赖外仓  
- [x] validate / 死链检查通过  

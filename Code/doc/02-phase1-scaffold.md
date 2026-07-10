# 02 — 阶段 1 脚手架技术细节

> **技术栈已冻结**：见 [`ADR-001-architecture-and-stack.md`](ADR-001-architecture-and-stack.md)（VitePress + `/agents-skill/` + 3010）。

## 1. 目标（对齐 Doc/04 阶段 1）

| ID | 任务 | 状态 |
|----|------|:----:|
| 1.0 | Code/doc + Code/code 目录 | 完成 |
| 1.0b | 服务器清单回填 | 完成 |
| 1.1 | 确认技术栈并落档 | **完成**（ADR-001） |
| 1.2 | 在 `Code/code/` 创建可 `dev` 的 VitePress 工程 | **完成**（build 通过） |
| 1.3 | 外层导航：agents / skills / rules 空页 | **完成** |
| 1.4 | content 挂载方式（读 `standards/`） | **完成**（Architect + sync 脚本） |
| 1.5 | PM2 + Nginx（α alias 或 β serve:3010） | 参数已锁；待部署 |

## 2. 技术栈（已锁定，勿再选）

| 项 | 值 |
|----|-----|
| 框架 | **VitePress** |
| Node | ≥ v22.2.1（现网 v22.2.1） |
| base | `/agents-skill/` |
| 生产 URL | `http://8.163.18.183/agents-skill/` |
| 本机端口（形态 β） | `127.0.0.1:3010` |
| PM2 | `agents-skill-site` |
| 目录 | `/var/www/agents-skill-site` |

换栈 → 新开 ADR，禁止静默更换。

## 3. 与现网共存

```text
公网 http://8.163.18.183:80 → Nginx
                ├─ /          → Extern_API/dist
                ├─ /api       → 127.0.0.1:3002
                ├─ （mcp）    → 127.0.0.1:3001 / 3003
                └─ /agents-skill/ → dist alias 或 127.0.0.1:3010
```

## 4. content 挂载

一期：构建时扫描/拷贝 `standards`；详见 ADR-001 §4。

## 5. 待决清单

- [x] 技术栈 VitePress  
- [x] IP / 端口 / base  
- [x] 初始化 `Code/code/` VitePress  
- [x] 空页 agents/skills/rules  
- [x] 扫描接入 standards（1.4：Architect 样例）  
- [x] 阶段 2：八角色全量同步  
- [ ] 生产形态选 α 或 β 并写部署笔记  

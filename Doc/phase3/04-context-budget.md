# 04 — 上下文预算与分层加载

> **文档级别**：三期设计  
> **日期**：2026-07-14  
> **问题**：agents / skills / rules 变多后，对话上下文是否过长？压不压？

---

## 1. 结论（先读）

| 做法 | 是否采用 |
|------|:--------:|
| 对治理 SoT 做「模糊摘要压缩」替代原文 | ❌ |
| MCP 继续只返回索引；正文按需 `@` | ✅ |
| Skill/Agent **分层**（短主文件 + docs） | ✅ |
| 每任务限制激活 skill 数量 | ✅ |
| 压缩**对话轨迹 / raw lesson** | ✅ 可选 |

一句话：**分层按需加载，不压缩真源。**

---

## 2. 三级加载模型

```text
L0  MCP list_* / get_* / health     轻（已具备）
        │ 选定 id
L1  技能/角色「卡片层」             短（YAML + 何时用 + 步骤大纲）
        │ 真正执行
L2  SKILL.md / Role.md 可执行正文   中（建议有行数预算）
        │ 查证 / 案例
L3  docs/、历史 lessons、长参考     重（默认不进上下文）
```

二期 MCP 已落在 L0。三期补的是 **L1/L2 文件纪律** + **执行层提示词纪律**。

---

## 3. 文件级预算（建议，可调）

| 文件 | 建议上限 | 超出时 |
|------|----------|--------|
| `SKILL.md` | 约 80～120 行 | 外置到 `docs/reference.md`、`docs/examples/` |
| Agent 主 md | 职责 + 流程骨架为主 | 细则进 `docs/` |
| Lesson raw | 尽量一屏内 | 蒸馏时再展开 |
| Rules L0 | 保持短硬 | 不塞案例 |

预算是**工程约定**，不是编译器强制；阶段 C 用 1～2 个 skill 示范即可。

---

## 4. 运行时纪律（给协作 Agent）

1. 先 `list_agents` / `list_skills` / `get_agent`，**禁止**一上来 `@` 全部 `docs/` 正文。  
2. 单任务：**1 个主 skill + 最多 2 个辅 skill**。  
3. Rules：L0 always；L1 按阶段；L2 按域名/标签按需。  
4. 跨会话只携带：`profile` + 角色 id + skill id 列表 + 当前 project-id；不携带上轮全文。  
5. 需要细节时再 `@` L2/L3 路径（用 MCP 返回的 `source`）。

可把上述 1～4 写进某条 L2 或 DevLead 运行指引（阶段 B/C）。

---

## 5. 何时才「压缩」

适合：

- 多轮聊天要交接时：产出一页「状态摘要」  
- 多张 raw lesson 收尾：蒸馏成 distilled 短文  

不适合：

- 把 11+ 个 skill 压成一段自然语言当唯一依据  
- 压缩后删掉磁盘 SoT  

---

## 6. 资产变多后的检索策略

```text
人：网站搜索 / 浏览
AI：MCP list → get → @ source
项目：operations/<id>/lessons 按 status 过滤
```

勿用「把 manifest 全贴进 system prompt」替代 MCP。

---

## 7. 与迭代占比的关系

Skill 迭代最多 → **最需要**短主文件 + docs，否则上下文最先爆。  
Agent 其次 → 控制绑定数量，避免一角色绑十几个必读 skill。  
Rules 最少 → alwaysApply 保持克制（现有 L0 已 always；L2 勿滥 always）。

---

## 8. 验收（阶段 C）

- [x] 本文约定被引用进 phase3 README / 执行计划  
- [x] 至少一个 skill 完成瘦身示范（`stage-gate-flow`）  
- [x] 示范约定写进 skill 主页（先 MCP 再按需 `@`）；实现笔记见 `Code/doc/phase3/`

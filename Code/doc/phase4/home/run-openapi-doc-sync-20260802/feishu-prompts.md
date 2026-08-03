# 飞书全流水试跑话术（openapi-doc-sync）

> **推荐：模板 A 一条发完**（含预授权）→ 机器跑到 H4 + 尝试写 Lesson。  
> 总模板索引：[Doc/guides/openclaw-feishu-pipeline-prompts.md](../../../../../Doc/guides/openclaw-feishu-pipeline-prompts.md)  
> 先 `/new`，再 @ 机器人。Gateway 保持运行。

---

## 模板 A · 全自动（需求 + run_dir 后不用管）

```text
@OpenClaw-Bot 【新项目需求】openapi-doc-sync

短名：openapi-doc-sync
业务仓：MechAssist-Fusion（分支 feature/Home_window）
run_dir=E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site\Code\doc\phase4\home\run-openapi-doc-sync-20260802

预授权：M2 后自动放行 H3，全自动至 H4 闭环并尝试写 Lesson。

目标：
OpenAPI 已实现（GET /api/openapi.json、/api/openapi.yaml），文档仍写「规划中/未实现」。只做文档对齐，不改业务代码。

范围：
1. 核对端点（可起后端时实测 json/yaml）
2. 修正至少：extern-api/README.md、extern-api/doc/重构api架构/README.md
3. 扫 extern-api 下矛盾的「OpenAPI 未实现」表述并改掉
4. 产物与证据落本 run_dir；飞书双写由 main 做

不做：改生成器/路由/测试；接 Swagger UI；提交密钥；git push

验收：文档不再写「未实现」；端点描述与实测一致；H4 核对改动面仅文档。

约束：不要 process poll 旧进程；防空转。
有 lesson_hint 或踩坑 → 写 operations/mechassist-openapi/lessons/（或合适 project）raw 卡。
```

---

## 模板 B · 保守两回合（可选）

仅当你想人工看完 H2 再动刀时用。首条**不要**写预授权；M2 后再发：

```text
@OpenClaw-Bot 放行 H3

run_dir 仍为：
E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site\Code\doc\phase4\home\run-openapi-doc-sync-20260802

做完 H3 后立刻 H4，闭环汇报；可写 Lesson。
```

---

## 走通标志

| 环节 | 信号 |
|------|------|
| H1/H2 | 本 run_dir 有清单/约束 + 信封 |
| H3 | Fusion 两处文档已改 |
| H4 | 群里通过/带缺陷放行 |
| Lesson | `Code/code/docs/zh/operations/.../lessons/` 出现 raw 卡（有踩坑时） |

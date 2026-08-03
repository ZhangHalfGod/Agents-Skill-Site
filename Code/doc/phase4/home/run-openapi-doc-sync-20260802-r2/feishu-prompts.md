# openapi-doc-sync · 从头全流水（r2）

> 已重置：Fusion 文档改回「未实现」；群 session 已清空；新 run_dir。  
> `contextTokens=1000000`。先 `/new` 再发下面整段。

```text
@OpenClaw-Bot 【新项目需求】openapi-doc-sync

短名：openapi-doc-sync
业务仓：MechAssist-Fusion（分支 feature/Home_window）
run_dir=E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site\Code\doc\phase4\home\run-openapi-doc-sync-20260802-r2

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

约束：不要 process poll 旧进程；防空转；单跳超时要上报不要死等。
有 lesson_hint 或踩坑 → 写 operations/mechassist-openapi/lessons/（raw）。
```

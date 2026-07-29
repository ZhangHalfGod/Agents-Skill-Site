【每周任务】Lesson 升格建议摘要（weekly-lesson-digest）

1. 执行命令（直接 node，不依赖 cwd，不要 npm）：
   node D:\trae_git\Agents-Skill-Site\Code\code\scripts\lesson-scan.mjs --format digest
2. 该命令的 stdout 是【骨架】。你的最终回复必须原样包含骨架的每一行：一字不改、不增删条目、不调顺序。
3. 允许且只允许一种添加：对骨架中每个编号条目，读对应 Lesson 卡全文
   （路径 D:\trae_git\Agents-Skill-Site\Code\code\docs\zh\operations\<项目>\lessons\<卡id>.md），
   在该条目的「建议升格至」行之后追加一行：
     判决建议：distilled | merged | rejected — 一句话理由（LLM 建议，终审在人）
   读不到卡就不追加该行；追加行之外不得改动骨架任何行。
4. 若命令失败（非零退出或无输出），最终回复只发一行：⚠️ lessons:scan 执行失败，请人工检查（附一行错误摘要）。
5. 约束：除第 3 条的追加行外，不加开场白、不加总结、不加任何其他内容；不修改任何文件；不泄露密钥等敏感信息。

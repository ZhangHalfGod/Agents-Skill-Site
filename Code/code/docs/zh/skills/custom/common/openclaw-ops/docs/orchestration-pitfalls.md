# 编排流水线高频坑（H1–H4 实证）

> 来源：2026-08-02 七个 run 的 Lesson 蒸馏合入（chat-error-code-mask / mcp-docs-openapi-align / openapi-doc-sync-r2 / openclaw-doctor-probes / release-notes-gen / swagger-ui-lite / workdir-whitelist）。

编排（main 拆需求 → pm/arch 文档跳 → 签名 → cursor 代码跳 → 独立复验）中反复踩到的高频坑，按主题合并为 checklist。**只信文件系统与实测，不信 agent 自报/勾选。**

## 交付物与信封（H1/H2）

- [ ] **信封双通道正式化**（连续 7 run 100% 出现）：arch/pm 回复常只有摘要，完整交付物+信封写进文件。固定规则：交付物落盘 + 信封进回复，或允许「文件内嵌 SPLIT + 回复摘要」双通道并固定提取规则；校验以产物完整为准（四要素齐即可），别当异常处理
- [ ] **split 不覆盖富文件**：split-reply 输出到临时名 → 与 agent 既有落盘文件比大小 → 保留更完整者（agent 落盘常比回复交付物大数倍）；或改拆分目标文件名为 `-reply` 后缀
- [ ] **落盘后自查**：子 agent 必须确认文件真实存在（pack 内勾选「已落盘」与文件系统不符是常事）；编排者校验以文件系统为准

## 事实断言（路由/结论/lesson_hint）

- [ ] **路由实现判据以实测为准**：静态 grep 字面量会漏常量间接挂载（`router.get(toMountPath(API_PATHS.API_DOCS))` 场景下 grep `/api/docs` 无匹配 → 假阴性「404/未实现」）。先起服务 curl 状态码+响应体；grep 只作线索，须沿常量链（API_PATHS.* + toMountPath）核对后再下结论
- [ ] **lesson 修正版显式标注「推翻 xx 结论」**：只写正确结论不够，下游 agent 检索不到「旧说法是错的」，错误结论会跨 run 复现；推断与事实分开标注，禁止把推断当事实传给下一跳
- [ ] **Goal 组装时事实复核**：对涉及历史结论的约束做一次复核（必要时起服务 curl），不以 agent 转述为准；H4 对 lesson_hint 也要复验（本次正是 H4 推翻 H2 结论）
- [ ] lesson_hint 写「会 404 / 未实现」类事实断言前，先起服务验证

## 子脚本/进程成败判定（H4 与汇总层）

- [ ] **PS 调子脚本成败不能只信 `$LASTEXITCODE`**：子脚本 ParserError 时 `&` 调用不设置该变量（残留上次值 0）→ 误 PASS。对 `&` 调用包 try/catch，或校验输出非空/含预期成功标记
- [ ] 判定矩阵：exit≠0 → FAIL；输出含 `FAIL:`/`Error` → FAIL；输出为空且无成功标记 → WARN；否则 PASS
- [ ] **H4 慢命令给足超时**（openclaw doctor/gateway status 可达 60s+，用 240s）
- [ ] H3 派遣失败先查 `git status` 有无半成品：无则直接重派（ECONNRESET 等瞬时错误），不必走拒收流程；billing/瞬时错误重试 1 次再上报人工

## 编码与工具链

- [ ] **git diff 中文乱码 ≠ 文件损坏**：GBK 控制台对 UTF-8 文件产生显示假象。疑似编码损坏用 node/hexdump 读字节核实（BOM=efbbbf、内容逐段比对），勿凭 diff 显示定罪
- [ ] **PS 5.1 中文输出经管道被 node 捕获成 GBK 乱码**：校验脚本捕获子进程中文输出用 `TextDecoder('gbk')` 解码或读文件比对；脚本文件本身 UTF-8 正确（控制台/管道编码分离）
- [ ] 写消息稿/交付物文件一律 UTF-8，用 node 写，不用 PowerShell 重定向（防 GBK）
- [ ] **feishu_doc token 用完整 document_id 原样复制**：工具返回的截断 token（含 `…`/空格）直接传 → 400；从 create 返回 JSON 的 `document_id` 字段原值取，禁止手打/缩写（已 3 次手滑）

## 生成器与文档同步

- [ ] **生成器产出文档 + 静态副本并存时必须双写**：只改静态 SKILL.md 不改生成器模板，下次 configure/install 会把改动抹掉（workdir-whitelist 实证：configure-cursor-code.ps1 重新生成覆盖仓内 SKILL.md）
- [ ] 文档同步类任务的范围清单显式排查生成器（configure/install/template 脚本），不能只扫 .md
- [ ] 生成类脚本「默认最小暴露」：probe/探测开关默认关；密钥类字段（KEY/TOKEN/SECRET/password/Bearer/内网 URL）显式列入输出禁项并在 H4 grep 验证；字段缺失降级为占位符（`—`）而非 FAIL，只有传输/解析/写入层失败才 exit 1；复用仓内姐妹脚本的 env/fetch/exit 约定
- [ ] UI 托管类需求先查 CSP 与依赖现状再选型（CDN 需放宽 CSP；'unsafe-inline' 已存在则自研 inline 零改动）；分组映射对未列路径段「按原样显示」兜底；网关层新增端点（即使纯静态）也走红色记录：H2 登记 → H3 五项自检 → H4 实测

## 硬约束提醒（并入 Goal）

- [ ] 脱敏/清洗函数先列「字段矩阵」再实现：message/code/url/headers/嵌套 result 每个敏感字段的脱敏行为（脱敏/删除/保留）+ 单测覆盖 top-level 与 nested 两条路径；内部错误码前缀是演进枚举 → 集中维护（LEAK_PATTERNS）并定期补录
- [ ] H3 派遣统一走版本目录直调 wrapper（`&` 传参保持单参），禁止 `Start-Process -ArgumentList` 传中文多行 Goal（PS 5.1 拆碎 → PSArgumentException）

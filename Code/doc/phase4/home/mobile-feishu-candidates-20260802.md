# 手机飞书 · Fusion 候选需求（2026-08-02）

> 用法：群里 `/new` → `@机器人` → 复制下方某条「整段」发出。  
> 模板总入口：[Doc/guides/openclaw-feishu-pipeline-prompts.md](../../../Doc/guides/openclaw-feishu-pipeline-prompts.md)  
> 公共头：业务仓 + 预授权 + run_dir 按短名改日期目录即可。

**公共前缀（每条都带）：**

```text
业务仓：MechAssist-Fusion（分支 feature/Home_window）
预授权：M2 后自动放行 H3，全自动至 H4 闭环并尝试写 Lesson。
```

`run_dir` 建议：

```text
E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site\Code\doc\phase4\home\run-<短名>-20260802
```

---

## 关键词速查

| 关键词（短名） | 规模 | 一句话 |
|----------------|------|--------|
| `workdir-whitelist` | 小·代码 | invoke-cursor WorkDir 白名单 |
| `chat-error-code-mask` | 小·代码 | 聊天失败不暴露 AMAP_ 等内部码 |
| `openclaw-doctor-probes` | 小·代码 | doctor 一键探测 V2–V5 |
| `mcp-docs-openapi-align` | 小·文档 | MCP 接入文档补 OpenAPI/v2 链接 |
| `release-notes-gen` | 小·代码 | manifest → 发布清单 Markdown |
| `swagger-ui-lite` | 中·代码 | /api/docs/ui 轻量 Swagger |
| `home-weather-gaode` | 中·代码 | Home 天气走高德 MCP |
| `m18-matrix-docs` | 小·文档 | M18 矩阵/发布说明文档收口 |

下午手机优先建议顺序：**workdir-whitelist → chat-error-code-mask → mcp-docs-openapi-align → openclaw-doctor-probes**。

---

## 1) workdir-whitelist

```text
@OpenClaw-Bot 【新项目需求】workdir-whitelist

短名：workdir-whitelist
业务仓：MechAssist-Fusion（分支 feature/Home_window）
run_dir=E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site\Code\doc\phase4\home\run-workdir-whitelist-20260802

预授权：M2 后自动放行 H3，全自动至 H4 闭环并尝试写 Lesson。

目标：给 invoke-cursor-agent.ps1 加 WorkDir 白名单；非法路径 FAIL 中文原因；同步 SKILL/文档。
不做：改 Cursor 本身、扩大改业务仓逻辑。
验收：白名单内可跑；白名单外拒绝且不启动 agent。
```

## 2) chat-error-code-mask

```text
@OpenClaw-Bot 【新项目需求】chat-error-code-mask

短名：chat-error-code-mask
业务仓：MechAssist-Fusion（分支 feature/Home_window）
run_dir=E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site\Code\doc\phase4\home\run-chat-error-code-mask-20260802

预授权：M2 后自动放行 H3，全自动至 H4 闭环并尝试写 Lesson。

目标：聊天工具失败时不向用户暴露 AMAP_/QUOTA_ 等内部 error.code；改 sanitize + prompt + 单测。
验收：注入含 AMAP_ERROR 的失败场景，用户可见回复不含该字符串。
```

## 3) mcp-docs-openapi-align

```text
@OpenClaw-Bot 【新项目需求】mcp-docs-openapi-align

短名：mcp-docs-openapi-align
业务仓：MechAssist-Fusion（分支 feature/Home_window）
run_dir=E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site\Code\doc\phase4\home\run-mcp-docs-openapi-align-20260802

预授权：M2 后自动放行 H3，全自动至 H4 闭环并尝试写 Lesson。

目标：MCP 接入文档补 OpenAPI/v2/docs 索引与同源说明；纯文档。
验收：文档链接与 :3002 实际路径一致。
```

## 4) openclaw-doctor-probes

```text
@OpenClaw-Bot 【新项目需求】openclaw-doctor-probes

短名：openclaw-doctor-probes
业务仓：MechAssist-Fusion（分支 feature/Home_window）
run_dir=E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site\Code\doc\phase4\home\run-openclaw-doctor-probes-20260802

预授权：M2 后自动放行 H3，全自动至 H4 闭环并尝试写 Lesson。

目标：扩展 doctor.ps1，按 profile 汇总 weather/tts/routing 探测 PASS/WARN/FAIL。
验收：单命令输出分项表；失败非零退出。
```

## 5) release-notes-gen

```text
@OpenClaw-Bot 【新项目需求】release-notes-gen

短名：release-notes-gen
业务仓：MechAssist-Fusion（分支 feature/Home_window）
run_dir=E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site\Code\doc\phase4\home\run-release-notes-gen-20260802

预授权：M2 后自动放行 H3，全自动至 H4 闭环并尝试写 Lesson。

目标：从 GET /api/release/manifest 生成发布清单 Markdown（无密钥）。
验收：脚本 exit 0，字段与 manifest 一致。
```

## 6) swagger-ui-lite（稍大，时间够再跑）

```text
@OpenClaw-Bot 【新项目需求】swagger-ui-lite

短名：swagger-ui-lite
业务仓：MechAssist-Fusion（分支 feature/Home_window）
run_dir=E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site\Code\doc\phase4\home\run-swagger-ui-lite-20260802

预授权：M2 后自动放行 H3，全自动至 H4 闭环并尝试写 Lesson。

目标：托管轻量 Swagger UI（如 /api/docs/ui）加载 openapi.json；不改业务 API。
验收：浏览器可浏览主要 tag。
```

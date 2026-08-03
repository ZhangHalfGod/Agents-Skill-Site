# 架构约束与执行计划（H2 — Architect）

**项目**：release-notes-gen  
**阶段**：H2（架构合规复核）  
**日期**：2026-08-02  
**产出者**：Architect（agent=arch）  
**业务仓**：MechAssist-Fusion（分支 feature/Home_window）  
**run_dir**：`Code/doc/phase4/home/run-release-notes-gen-20260802`

---

## 1. 复核结论

H1 范围清单事实经本跳原位复核，**全部确认**：

| 复核项 | H1 结论 | H2 复核 | 状态 |
|--------|---------|---------|------|
| release-triplet-check.mjs 可复用模式 | fetch 封装、env 约定、exit 码 | 源码确认：`EXTERN_API_URL`、`RELEASE_PROBE`、probe 语义 | 一致 |
| manifest 响应结构 | 含 releaseTriplet/deployEnv/gitSha/mcp/mcpMech | 源码确认 releaseContract.js L114-L144：共 12 顶层字段 | 一致 |
| probe 参数语义 | ?probe=false → mcp 仅 configured/reachable | releaseRoutes.js L13-L15 源码确认 | 一致 |
| 模板 7 节结构 | 一元信息 / 二三元组 / 三检查 / 四部署 / 五回滚 / 六链接 / 七备注 | 发布清单-模板.md 全文确认 | 一致 |
| 无密钥保障 | manifest 不含 Token/Key/密码 | releaseContract.js 确认：仅 compatible/reachable/configured 布尔值 | 一致 |
| .mjs 先例 | governance-smoke.mjs + release-triplet-check.mjs | 确认 scripts/ 下 .mjs 先例 | 一致 |

---

## 2. 生成器定稿

### 2.1 脚本元信息

| 维度 | 值 |
|------|-----|
| 文件 | `scripts/release-notes-gen.mjs`（**新增**） |
| 语言 | ESM（`.mjs`，对齐 release-triplet-check.mjs） |
| 姐妹脚本 | `scripts/release-triplet-check.mjs` — 复用 fetch 模式、env 命名、exit 码约定 |

### 2.2 环境变量与默认值

| 变量 | 默认 | 说明 |
|------|------|------|
| `EXTERN_API_URL` | `http://127.0.0.1:3002` | extern-api 根地址（自动去尾斜杠） |
| `RELEASE_OUTPUT_DIR` | `doc/方案C/方案C_MVP_M1-M4_对接/M-4_版本契约与发布联动/` | 输出目录（脚本 `fs.mkdirSync` 自动创建） |
| `RELEASE_PROBE` | `false` | 是否探测 MCP（`?probe=true`）**默认 false — 安全优先无外部请求** |
| `--output <path>` | `发布清单-YYYYMMDD.md`（日期命名） | CLI arg 覆盖输出路径 |

### 2.3 7 节输出结构及标注

| 节 | 标注 | 来源 | 说明 |
|----|------|------|------|
| §一 元信息 | $(auto)$ / $(manual)$ | $d.deployEnv$ + $d.buildTime$ + $d.gitSha$ + $d.serviceVersion$ | 日期/操作人/关联需求留空（placeholder） |
| §二 发布三元组 | $(auto)$ | $d.releaseTriplet$ + $d.mcp$ + $d.mcpMech$ + $d.deployEnv$ | 6 行表，字段映射见 §2.4 |
| §三 发布前检查 | $(placeholder)$ | — | 写入模板固定清单文本（npm test、manifest 验证等），待人工勾选 |
| §四 部署顺序 | $(fixed)$ | — | 5 步固定建议文本（复制自模板） |
| §五 回滚 | $(fixed)$ | — | 4 步固定回滚文本（复制自模板） |
| §六 发布后验证链接 | $(auto)$ / $(manual)$ | base URL 推导 | auto: `/health`、`/api/release/manifest`、`/capabilities`；manual: 前端地址留空 |
| §七 备注 | $(placeholder)$ | — | 留空 |

### 2.4 字段→Markdown 映射（§二 6 行表）

| 行 | 组件列 | 版本标识列 | Git commit 列 |
|----|--------|-----------|--------------|
| 1 | extern-api · Prompt | `d.releaseTriplet.promptVersion` | `d.releaseTriplet.commit` |
| 2 | extern-api · 注册表 | `d.releaseTriplet.registryVersion` | — |
| 3 | extern-api · 服务 | `d.serviceVersion` | `d.gitSha` |
| 4 | mcp-gaode · capabilities | `d.mcp?.capabilitiesVersion` or `—` | probe=true → 含 version；probe=false → `—` |
| 5 | mcp-faq · capabilities | `d.mcpMech?.capabilitiesVersion` or `—` | 同上 |
| 6 | extern · deployEnv | `d.deployEnv` | — |

### 2.5 probe 默认与 MCP 段输出

**`RELEASE_PROBE=false`（默认）**：
- `d.mcp` / `d.mcpMech` 段仅含 `{ domain, compatible: false, reachable: false, baseUrlConfigured: bool }`
- 行 4/5 的 capabilitiesVersion 写 `—`（不可用）
- **无 HTTP 请求发往 MCP Server，零泄露风险**

**`RELEASE_PROBE=true`**：
- mcp 段含完整 `capabilitiesVersion` + `gitSha` + `missingTools`
- 行 4/5 可自动填充 capabilitiesVersion
- **注意事项**：不打印 `baseUrl` 字段（即使 manifest 含此值）。仅打印 `compatible/reachable/configured/capabilitiesVersion`

### 2.6 无密钥保障清单

**输出 Markdown 中禁止出现的字段/模式**（脚本需主动过滤或确认 manifest 不含）：

| 禁项 | 原因 | 防护 |
|------|------|------|
| `MCP_GAODE_BASE_URL` / `MCP_FAQ_BASE_URL` | 内网 URL | probe=false 时 mcp 段不含此字段 |
| `API_KEY` / `TOKEN` / `SECRET` / `password` | 密钥 | manifest 不含（releaseContract 验证） |
| `Bearer` + 字符串 | Token | manifest 不含验证：0 命中 |
| 完整 `http://` URL（含 host） | 内网暴露 | probe=false → 无 URL；probe=true → mcp 段仅布尔+版本号 |
| 脚本 `console.log` | 标准输出泄露 | 脚本仅写文件，`console.log` 仅输出 "Wrote: <path>" |

### 2.7 退出码约定

| 场景 | Exit |
|------|------|
| 生成成功（manifest 200 + Markdown 写入成功） | 0 |
| 网络不可达 / HTTP 非 200 | 1 |
| manifest 解析失败（非 JSON） | 1 |
| 文件写入失败（权限/路径） | 1 |
| 字段缺失（如 releaseTriplet 不存在） | **0 但标注 MISS** — 缺字段写 `—` 不崩溃 |

**裁定**[Q3]：字段缺失照写 `—`，不崩溃。manifest 结构可能随版本演进，缺失不应阻断生成。但 `data` 为 null 或 HTTP 失败 → exit 1。

---

## 3. 修改面白名单

### P0（强制）

| # | 文件 | 动作 |
|---|------|------|
| M1 | `scripts/release-notes-gen.mjs` | **新增**（~120 行，fetch → parse → 7 段 Markdown → writeFile → exit 0/1） |

### P2（推荐）

| # | 文件 | 动作 |
|---|------|------|
| M2 | `doc/方案C/方案C_协议与治理/版本三元组发布流程.md` | §2.2 补充 `node scripts/release-notes-gen.mjs` 生成发布清单 |

### 显式不做

| 禁止项 | 原因 |
|--------|------|
| 改 `release-triplet-check.mjs` | 独立脚本，不同功能 |
| 改 `releaseContract.js` / `releaseRoutes.js` | 业务代码 |
| 改 `发布清单-模板.md` | 保留为人工对照模板 |
| 改 `extern-api/` 业务逻辑 | 不改代码 |
| npm / git push / 飞书 | 硬约束 |

---

## 4. 红色记录评估

| 维度 | 结论 |
|------|------|
| 模块 | `release-notes-gen.mjs` — 运维工具脚本 |
| 层级 | 运维工具层（非网关/安全/核心业务） |
| ai-code-boundary | DTO/工具类 → **N/A** |

---

## 5. 验收口径

| 用户验收条件 | 架构映射 | 验收方式（H4） |
|------------|---------|--------------|
| "脚本 exit 0" | 生成成功 → exit 0 | H4：`node scripts/release-notes-gen.mjs` → `echo $?` → 0 |
| "字段与 manifest 一致" | 6 行表 mapping（§2.4） | H4：逐字段 grep 对比 JSON vs MD |
| 无密钥 | 6 禁项（§2.6） | H4：`grep -i "KEY\|TOKEN\|API_KEY\|SECRET\|password\|MCP_.*_URL" 发布清单-*.md` → 零命中 |
| 输出文件存在 | fs.writeFileSync | H4：`ls 发布清单-*.md` → 存在且非空 |
| probe=false 无外部请求 | — | H4：断网 `node scripts/release-notes-gen.mjs` → exit 0（因 manifest 无 mcp 依赖） |

---

## 6. 风险与回滚

| 风险 | 等级 | 缓解 | 回滚 |
|------|------|------|------|
| 输出目录不存在 | 低 | `fs.mkdirSync({ recursive: true })` | 删除 .mjs |
| manifest 未来新增/改名字段 | 低 | `?.` 可选链 + 缺字段写 `—` | 更新 mapping |
| probe=true 时输出 MCP URL | 低 | 默认 false；true 时显式过滤 baseUrl 字段 | 删除 .mjs |
| 与 release-triplet-check.mjs 风格不一致 | 低 | 同目录 .mjs，相同 ES 模块模式，相同 env 约定 | 对齐后重新生成 |

---

## 7. H1 开放问题裁定

| # | H1 问题 | H2 裁定 | 理由 |
|---|---------|---------|------|
| Q1 | 输出结构：完全对齐模板 vs 轻量摘要？ | **完全对齐 7 节**，标注 $(auto)$/$(fixed)$/$(placeholder)$ 区分。auto=5 节部分填充，fixed=2 节固定文本，placeholder=人工填写 | 与模板语义一致，人工补充即可投入使用 |
| Q2 | probe 默认 false vs true？ | **false**（`RELEASE_PROBE !== 'true'` 才启用） | "无密钥"安全优先；需要完整 capabilities 扫码时手动 `RELEASE_PROBE=true` |
| Q3 | 字段缺失：FAIL vs `—`？ | **照写 `—`** | manifest 结构可能随版本演进，缺失不应阻断；`data` 为 null 或 HTTP 失败才 exit 1 |
| Q4 | 文件命名：日期 vs SHA？ | **`发布清单-YYYYMMDD.md`**（纯日期） | 与模板命名约定一致；gitSha 在文件内容 §一 可见 |
| Q5 | 流程文档同步？ | **P2 推荐**（更新版本三元组发布流程.md §2.2 引用新脚本），不阻塞 H4 | 新增工具应写入流程文档 |

---

*本文由 Architect 产出，基于 H1 范围清单、release-triplet-check.mjs 姐妹脚本交叉验证、manifest 结构源码确认与模板 7 节对齐。提交 DevLead（H3）编写 release-notes-gen.mjs。*

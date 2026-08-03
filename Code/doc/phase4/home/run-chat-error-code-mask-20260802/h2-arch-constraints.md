# 架构约束与执行计划（H2 — Architect）

**项目**：chat-error-code-mask  
**阶段**：H2（架构合规复核）  
**日期**：2026-08-02  
**产出者**：Architect（agent=arch）  
**上一跳**：H1 PM 范围清单（`h1-pm.scope-checklist.md`）  
**业务仓**：MechAssist-Fusion（分支 feature/Home_window）  
**run_dir**：`Code/doc/phase4/home/run-chat-error-code-mask-20260802`

---

## 1. 复核结论

H1 范围清单核心事实经本跳原位源码复核，**全部确认**：

| 复核项 | H1 结论 | H2 复核 | 状态 |
|--------|---------|---------|------|
| `stripErr` 保留 error.code | ❌ 漏洞 | L103-L112 确认：`return { ...err, message: safeMsg }` — spread 拷贝所有属性，code 原样保留 | 一致 |
| `LEAK_PATTERNS` 含 AMAP_ | ✓ | L15 确认：`/AMAP_[A-Z0-9_]+\b/i` | 一致 |
| `LEAK_PATTERNS` 不含 QUOTA_/MCP_*/ARK_* 通用前缀 | ❌ 缺口 | L12-L19 全量复核：仅 `MCP_GAODE_BASE_URL`、`ARK_API_KEY` 特例，无通用前缀 | H1 未全量标识 |
| 调用链 `summarizeMcpEnvelopeForLlm` | travelQueryBridge.js L76 | 源码确认：`sanitizeEnvelopeForLlm` → `compactValueForLlm` → JSON 注入 LLM prompt | 一致 |
| 三路径用户可见载体 | 主路径有漏洞 | 独立复核：LLM 路径有漏洞 ✓；直接响应 ✓；HTTP 错误 ✓ | 一致 |
| 单测无 error.code 脱敏 | ❌ 缺失 | 测试文件含 1 条 sanitize 用例（L56-L63），但仅验证 message 脱敏，`expect(out.error.code).toBe('X')` 未验证 code 安全 | 一致 |

---

## 2. 脱敏方案定稿

### 2.1 核心修改（M1）：`stripErr` 函数（L103-L112）

**当前代码**：
```js
const stripErr = (err) => {
  if (!err || typeof err !== 'object') return err
  const msg = err.message != null ? String(err.message) : ''
  const safeMsg = buildUserVisibleFailureLine({
    phase: 'tool_business', globalToolName, rawMessage: msg
  })
  return { ...err, message: safeMsg }
}
```

**修改后**：
```js
const stripErr = (err) => {
  if (!err || typeof err !== 'object') return err
  const msg = err.message != null ? String(err.message) : ''
  const safeMsg = buildUserVisibleFailureLine({
    phase: 'tool_business', globalToolName, rawMessage: msg
  })
  const safe = { ...err, message: safeMsg }
  // M-3 脱敏：删除内部 error.code，防止 LLM 复述
  if (safe.code != null && isUnsafeForUserDisplay(safe.code)) {
    delete safe.code
  }
  return safe
}
```

**语义**：`code` 为 `null`/`undefined` → 保留原样；`code` 不匹配 LEAK_PATTERNS → 保留；`code` 匹配 → **删除**（不替换为通用值，避免 LLM 将其作为有效信息）。

### 2.2 两条路径全覆盖

| 路径 | 当前 `sanitizeEnvelopeForLlm` | 修复后 |
|------|------------------------------|--------|
| Top-level `envelope.error.code` | L115 `clone.error = stripErr(clone.error)` → code 泄露 | stripErr 内 delete code → 安全 |
| Nested `result.error.code` | L120-L125 `clone.result = { ...inner, error: stripErr(inner.error) }` → code 泄露 | 同 stripErr → 安全 |

两条路径共用同一 `stripErr` 函数，**一处修改，两路受益**。

### 2.3 `LEAK_PATTERNS` 扩展（M1b）

当前 LEAK_PATTERNS（L12-L19）需扩充，新增 QUOTA_/MCP_/ARK_ 通用前缀：

```js
const LEAK_PATTERNS = [
  /https?:\/\//i,
  /\b127\.0\.0\.1\b/,
  /localhost/i,
  /\bAMAP_[A-Z0-9_]+\b/i,     // 已有
  /Bearer\s+\S+/i,
  /\/tools\/call/i,
  /MCP_GAODE_BASE_URL/i,       // 已有
  /infocode/i,
  /ARK_API_KEY/i,              // 已有
  /^QUOTA_[A-Z0-9_]+\b/i,      // 新增：配额错误码
  /^MCP_[A-Z0-9_]+\b/i,        // 新增：MCP 协议错误码
  /^ARK_[A-Z0-9_]+\b/i         // 新增：ARK API 错误码
]
```

**裁定理由**：chatRoutes.js 中 QUOTA_EXCEEDED 走 sendError（安全），但 MCP 工具响应可能携带 QUOTA_/MCP_/ARK_ 前缀 code。当前仅匹配 AMAP_ 和两个特例（MCP_GAODE_BASE_URL、ARK_API_KEY），缺口明显。前缀精确匹配 `^` 避免误杀业务 code。

### 2.4 调用链确认（无需改）

`travelQueryBridge.js` 中所有 `sanitizeEnvelopeForLlm` 调用点均通过 `stripErr` 修复间接受益：
- L76：`summarizeMcpEnvelopeForLlm` → 注入 LLM prompt
- L220：`formatTravelToolPayloadForUser` → 用户可见
- L354：MCP 工具调用总结 → LLM prompt

无需修改调用方，M1 修复即全覆盖。

---

## 3. 红色记录评估

| 评估维度 | 结论 |
|---------|------|
| **变更模块** | `server/services/mcpToolUserMessages.js` — 数据脱敏工具函数（Service 层） |
| **安全属性** | 数据泄露防护（阻止内部 error.code 经 LLM 泄露到用户） |
| **ai-code-boundary 判定** | Service 层脱敏工具 ≠ 网关层/安全认证模块。`stripErr` 属于数据清洗工具，非安全认证代码 |
| **红色记录** | **N/A — 不触发**。H1 判定一致。若后续脱敏范围扩展至安全认证令牌（如 API Key 脱敏），需重新评估 |

**边界警示**：脱敏属数据泄露防护，与安全紧密相关。虽不登记正式红色记录，但 H4 验收时须验证 `error.code` 确已删除（非仅替换），且不引入新的泄露向量（如 code 移到别的字段）。

---

## 4. 修改面白名单

### P0（强制）

| # | 文件 | 行号 | 变更 |
|---|------|------|------|
| M1a | `server/services/mcpToolUserMessages.js` | L103-L112 | `stripErr` 内 `return` 前增加 `if (safe.code...isUnsafe...delete safe.code)` |
| M1b | 同上 | L12-L19 | `LEAK_PATTERNS` 数组末追加 QUOTA_/MCP_/ARK_ 三条前缀正则 |
| M2 | `server/services/mcpToolUserMessages.test.js` | 新增 | 见 §5 单测用例清单 |

### P2（推荐）

| # | 文件 | 变更 |
|---|------|------|
| M3 | `server/prompts/chat-system-v1.md` | 新增一行："不得在回复中复述 AMAP_、QUOTA_、MCP_ 等内部错误码或原始 JSON 中的技术字段名" |

### P2（不阻塞本期）

| # | 文件 | 原因 |
|---|------|------|
| M4 | `server/services/mcpAuditService.js` L15 `sanitizeErrorSummary` | 仅处理 `errorMessage` 字符串，不涉及 error.code，无需改动 |

### 显式不做

| 禁止项 | 原因 |
|--------|------|
| 改 `chatRoutes.js` | QUOTA 走 sendError（安全路径） |
| 改 `travelQueryBridge.js` | 调用方无需变更 |
| 改 `errorCodes.js` | 业务码定义正确 |
| 改前端/网关/.env | 不涉及 |
| npm install / rebuild / git push | 硬约束 |

---

## 5. 单测用例清单（M2，≥3 条）

| # | 用例 | Given | Then |
|---|------|-------|------|
| T1 | top-level error.code=`AMAP_ERR` 被删除 | `{success:false, error:{code:"AMAP_ERR", message:"http://"}}` | `out.error.code` 不存在，`err.message` 已脱敏 |
| T2 | nested result.error.code=`QUOTA_EXCEEDED` 被删除 | `{success:true, result:{success:false, error:{code:"QUOTA_EXCEEDED"}}}` | `out.result.error.code` 不存在 |
| T3 | 正常 code=`VALIDATION_ERROR` 保留 | `{success:false, error:{code:"VALIDATION_ERROR"}}` | `out.error.code === "VALIDATION_ERROR"` |
| T4 | code 为空/null 不做操作 | `{success:false, error:{code:null, message:"..."}}` | `out.error.code === null` |

**注意**：现有用例 L59 `expect(out.error.code).toBe('X')` — `'X'` 不匹配任何 LEAK_PATTERN，code 保留，断言不变。H3 执行时确认即可无需修改。

---

## 6. 验收口径

| 用户验收条件 | 架构映射 | 验收方式 |
|------------|---------|---------|
| 注入 AMAP_ERROR → 用户回复不含 | stripErr delete AMAP_ code + M3 prompt 加固 | H4：构造 `{code:"AMAP_ERROR"}` 包络 → sanitize → grep `AMAP_` 无匹配 |
| error.code 不泄漏 | LEAK_PATTERNS 覆盖 AMAP_/QUOTA_/MCP_/ARK_ | H4：四种前缀各一条 case |
| nested 路径同样生效 | stripErr 共用 → result.error.code 一并脱敏 | H4：T2 |
| 单测覆盖 ≥2 条 | T1-T4 | H4：vitest pass |
| H4 改动面仅 1 源 + 1 测试 | M1+M2 仅 2 文件 | H4：git diff --stat |

---

## 7. 风险与回滚

| 风险 | 等级 | 缓解 | 回滚 |
|------|------|------|------|
| 脱敏过激误删友好 code（如 VALIDATION_ERROR） | 低 | LEAK_PATTERNS 用 `^` 前缀锚定 + 大写字母约束，仅匹配内部前缀 | git checkout + 扩展 LEAK_PATTERNS 黑名单 |
| 新增 LEAK_PATTERNS 误匹配合法字符串 | 低 | 前缀 `^` 锚定 + `[A-Z0-9_]+` 仅匹配大写常量风格 code | git checkout |
| LLM 仍从 message 推断 code 含义 | 低 | M3 prompt 加固为第二道防线 | —— |
| 现有单测断言破坏 | 无 | `'X'` 不匹配，T1-T4 为纯新增 | —— |

---

## 8. H1 开放问题裁定

| # | H1 问题 | H2 裁定 | 理由 |
|---|---------|---------|------|
| Q1 | 内部 error.code 完整清单？AMAP_/QUOTA_/MCP_/ARK_ 还需哪些？ | **全部加入**。LEAK_PATTERNS 新增 `^QUOTA_`、`^MCP_`、`^ARK_` 三条前缀正则。QUOTA_EXCEEDED 当前走 sendError（安全），但 MCP 工具响应可携带任意 code，防御宜宽不宜窄 | 源码探查确认无 AMAP_ 外已知泄露，但 3 条新增为防御纵深 |
| Q2 | LEAK_PATTERNS 是否扩展 key=value 格式匹配？ | **不需要**。`isUnsafeForUserDisplay(err.code)` 直接对 code 字符串值做检测，不涉 key=value 格式。现有 `AMAP_[A-Z0-9_]+` 即匹配裸字符串 | code 独立字段，非嵌套 JSON |
| Q3 | `mcpAuditService.sanitizeErrorSummary` 是否同步加强？ | **不加强**。该函数仅处理 `errorMessage` 字符串（L41 `sanitizeErrorSummary(p.errorMessage)`），不接触 error.code。若未来发现审计日志含 code 泄露，另开单独任务 | 改动面最小化 |

---

*本文由 Architect 产出，基于 H1 范围清单原位复核、源码全链路追踪与 MCP 角色自查。提交 DevLead（H3）执行代码修改。*

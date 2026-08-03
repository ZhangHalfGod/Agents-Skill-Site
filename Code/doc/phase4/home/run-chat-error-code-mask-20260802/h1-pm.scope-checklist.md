# AI代码生成范围清单（H1 — ProductManager）

**项目**：chat-error-code-mask  
**短名**：chat-error-code-mask  
**阶段**：H1（需求拆解 & 范围界定）  
**日期**：2026-08-02  
**产出者**：ProductManager（agent=pm）  
**业务仓**：MechAssist-Fusion（分支 feature/Home_window）  
**run_dir**：`Code/doc/phase4/home/run-chat-error-code-mask-20260802`

---

## 1. 目标

聊天工具调用失败时，阻止内部 error.code（如 `AMAP_*`）泄露到用户可见回复中。修改 `sanitizeEnvelopeForLlm` 使其同时脱敏 error.code，补充对应单测。

### 成功画像

| 维度 | 标准 |
|------|------|
| 脱敏完整性 | 注入含 `AMAP_ERROR` 的失败包络后，用户可见回复不含 `AMAP_` |
| error.code 不泄漏 | `sanitizeEnvelopeForLlm` 对 error.code 做同等脱敏（不仅处理 error.message） |
| 单测覆盖 | 新增 ≥2 条 error.code 脱敏用例 |

---

## 2. 范围条目

### 2.1 原位探查：核心漏洞

```
MCP 调用成功但返回 { success: false, error: { code: "AMAP_ERR", ... } } 时：
  → sanitizeEnvelopeForLlm() 替换 error.message ✓
  → 但 error.code 原样保留 ❌ ← 核心漏洞
  → summarizeMcpEnvelopeForLlm() → JSON.stringify → 注入 LLM prompt
  → LLM 可能复述 AMAP_ERR 到用户可见回复
```

#### 关键文件

| 文件 | 关键行 | 问题 |
|------|--------|------|
| `mcpToolUserMessages.js` | L98–L115 `stripErr` 返回 `{ ...err, message: safeMsg }` | error.code 原样保留 |
| 同上 | L12–L19 `LEAK_PATTERNS` 已含 `AMAP_[A-Z0-9_]+` | 未被用于检测 error.code |
| `mcpToolUserMessages.test.js` | — | 无 error.code 脱敏用例 |
| `travelQueryBridge.js` | L258–277 bridge catch 创建本地 envelope 无 code，但 MCP 返回的含 code envelope 原样传入 | MCP 返回的 code 可能经 `formatTravelToolPayloadForUser` 的 JSON.stringify 泄露 |
| `chatRoutes.js` | L536 `console.error` 打印 code | 仅服务端日志，非用户面 |

#### 用户可见载体（三条路径全部排查）

| 路径 | 是否安全 | 说明 |
|------|---------|------|
| LLM 生成回复（主） | ❌ 有漏洞 | `sanitizeEnvelopeForLlm` → `summarizeMcpEnvelopeForLlm` → JSON 注入 messages → LLM 可见 code |
| 直接响应（无 LLM） | ✓ | `formatTravelToolPayloadForUser` → `buildUserVisibleFailureLine` 已安全 |
| HTTP 错误响应体 | ✓ | `sendError` 已映射中文文案 |

### 2.2 修改条目（P0）

| # | 文件 | 修改动作 |
|---|------|---------|
| M1 | `server/services/mcpToolUserMessages.js` L98–L115 | `stripErr` 中增加 error.code 脱敏：`if (err.code && isUnsafeForUserDisplay(err.code)) delete cloneError.code`。同时处理 `clone.result.error.code`（nested 路径） |
| M2 | `server/services/mcpToolUserMessages.test.js` | 新增用例：① top-level error.code=`AMAP_ERR` 被删除；② nested result.error.code=`QUOTA_EXCEEDED` 被脱敏；③ 正常 code 保留 |

### 2.3 修改条目（P1/P2）

| # | 文件 | 优先级 |
|---|------|--------|
| M3 | `server/prompts/chat-system-v1.md` — 增加"不得复述内部错误码"指令 | P2 |
| M4 | `server/services/mcpAuditService.js` — `sanitizeErrorSummary` 加强 | P2 |

### 2.4 脱敏行为决策（提交 H2）

| 决策项 | 建议 |
|--------|------|
| 脱敏方式 | 删除 error.code（`delete`），非替换 |
| 匹配规则 | 复用 `isUnsafeForUserDisplay()`（已含 AMAP_ 模式） |
| nested 路径 | 同步处理 `clone.result.error.code` |

### 2.5 不修改（显式不做）

chatRoutes.js（路由已安全）、errorCodes.js（业务码正确）、travelQueryBridge.js/mechQueryBridge.js 意图识别、前端代码、新增独立错误码系统、git push / npm install

---

## 3. 验收口径

| 用户验收条件 | Given-When-Then | 条目 |
|------------|-----------------|------|
| "注入含 AMAP_ERROR 的失败场景，用户可见回复不含该字符串" | Given `{success:false, error:{code:"AMAP_ERROR"}}` → sanitize → error.code 不存在 | M1, M2 |
| nested 路径同样生效 | Given result.error.code=`"AMAP_ERR"` → sanitize → code 已脱敏 | M1, M2 |
| 正常 code 保留 | Given code=`"VALIDATION_ERROR"` → sanitize → code 保留 | M2 |

---

## 4. 风险与回滚

脱敏过激误删友好 code → 复用 `isUnsafeForUserDisplay`（仅匹配内部模式）；LLM 仍可能推断 → M3 可选加固。回滚：git checkout。

---

## 5. 开放问题（提交 H2）

1. **内部 error.code 完整清单？** `AMAP_*` 已覆盖；`QUOTA_*`、`MCP_*`、`ARK_*` 是否需加入？
2. **脱敏方式：删除 vs 替换为 `TOOL_ERROR`？** 建议删除。
3. **`mcpAuditService` 审计日志是否同步加强？** 建议但不阻塞本期。

---

*本清单由 ProductManager 根据原位探查（只读）与 MCP 角色真源产出，提交架构师（H2）复核。*

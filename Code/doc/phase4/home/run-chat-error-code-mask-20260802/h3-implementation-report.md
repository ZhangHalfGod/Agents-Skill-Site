[h3-run-wrapper] WorkDir=E:\zhangchangWork\Work_Space\Trae_Study\MechAssist-Fusion node=C:\Users\Administrator\AppData\Local\cursor-agent\versions\2026.07.23-e383d2b\node.exe
## H3 实现报告 — chat-error-code-mask

聊天工具失败时的内部 `error.code` 已在 `stripErr` 中按 `LEAK_PATTERNS` **删除**（非替换）；prompt 增加禁止复述指令；目标单测 **10/10 通过**。

### 改动摘要

| 文件 | 变更 |
|------|------|
| `mcpToolUserMessages.js` | **M1b** `LEAK_PATTERNS` 末尾追加 `QUOTA_` / `MCP_` / `ARK_` 三条前缀正则；**M1a** `stripErr` 在写回前对不安全 `code` 执行 `delete` |
| `mcpToolUserMessages.test.js` | **M2** 新增 T1–T4（top-level AMAP 删除、nested QUOTA 删除、VALIDATION 保留、null 保留） |
| `chat-system-v1.md` | **M3** 输出约束段新增「不得复述 AMAP_/QUOTA_/MCP_ 等内部错误码」一行 |

### Diff 摘要

- `mcpToolUserMessages.js`：+10 / −2（patterns + stripErr delete）
- `mcpToolUserMessages.test.js`：+48（T1–T4）
- `chat-system-v1.md`：+1

### 单测结果

```
npx vitest run server/services/mcpToolUserMessages.test.js
✓ 10 tests passed (含原有 6 + T1–T4)，Duration ~1.25s
```

### 自检

1. code 为 **delete**，未替换为占位符  
2. 未把 code 挪到其他字段  
3. 原有 LEAK_PATTERNS 全部保留，仅末尾追加三条  
4. 现有 `code: 'X'` 断言未改，仍通过

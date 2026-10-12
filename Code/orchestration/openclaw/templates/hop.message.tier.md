# 文档跳消息稿义务（上下文分层）

写入 `<run-dir>/hN.message.md` 时遵守：

## 上跳输入（L0.5）

- **禁止**粘贴完整上跳 handoff YAML 或交付物正文。  
- 使用：

```text
## 上一跳指针
prev_envelope_path: <ABS>/handoff-h<N-1>.envelope.yaml
prev_deliverable_path: <ABS>/<file>.md
prev_content_hash: <可选 sha256 前 12 位>
（请 read 上述文件；decisions 不可静默推翻）
```

H1 无上一跳则写「（无 — H1 首跳）」。

## 输出契约（L1 落盘 + L0.5 回复）

1. 经 MCP：`health` → `get_agent` → `get_skill` → `get_source_text`；落盘 `mcp-resolve-hN.yaml` + `playbook-pack-hN.md`。  
2. **交付物全文**只写入约定路径（如 `h1-scope-list.md` / `*-deliverable.md`），UTF-8。  
3. **最终回复**格式：

```text
（可选三行摘要）
---SPLIT---
<handoff YAML only；deliverable.path 指向已写文件>
```

4. **禁止**在最终回复中重复粘贴交付物全文。  
5. **禁止**调用飞书工具（双写仅 main）。

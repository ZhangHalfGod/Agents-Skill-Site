[h3-run-wrapper] WorkDir=E:\zhangchangWork\Work_Space\Trae_Study\MechAssist-Fusion node=C:\Users\Administrator\AppData\Local\cursor-agent\versions\2026.07.23-e383d2b\node.exe
## H3 交付 — release-notes-gen

新增 `scripts/release-notes-gen.mjs`（~126 行，风格对齐 `release-triplet-check.mjs`）：`fetch` → 校验 → 拼 7 节 Markdown → `writeFileSync` → `Wrote: <path>` / exit 1。

**关键实现**
- 环境：`EXTERN_API_URL`（去尾 `/`）、`RELEASE_OUTPUT_DIR`（`mkdirSync recursive`）、`RELEASE_PROBE` 仅 `=== 'true'` 才 `probe=true`，默认 `false`
- CLI：`--output=<path>` 覆盖；默认 `发布清单-YYYYMMDD.md`（本地日）
- 失败路径：网络 / HTTP≠200 / JSON 解析 / `data==null` / 写入 → 中文错误 → exit 1
- 字段：`?.` + `?? '—'`；路径型验证链接，**不写完整 URL / baseUrl / 密钥类字样**；stdout 仅 `Wrote:` 与错误

**M2**：在 `版本三元组发布流程.md` §2.2 增加 `node scripts/release-notes-gen.mjs` 一行。

**自检**：`node --check` 通过；脚本内无 `API_KEY`/`TOKEN`/`SECRET`/`password`/`Bearer`/`MCP_*_BASE_URL`/`baseUrl`；未起服务、未打 manifest（留给 H4）。

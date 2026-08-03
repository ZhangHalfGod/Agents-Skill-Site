[h3-run-wrapper] WorkDir=E:\zhangchangWork\Work_Space\Trae_Study\MechAssist-Fusion node=C:\Users\Administrator\AppData\Local\cursor-agent\versions\2026.07.23-e383d2b\node.exe
## H3 交付：swagger-ui-lite

### 改了什么

1. **`extern-api/server/routes/openapiRoutes.js`**（改）
   - 顶部增加 `fileURLToPath` / `dirname` / `join` 与 `__dirname`
   - 在 `/openapi.yaml` 之后、`export default` 之前新增 `GET /docs/ui`：固定 `sendFile` 到 `../views/swagger-ui.html`，设 `Cache-Control: no-cache`、`X-Content-Type-Options: nosniff`
   - `/openapi.json`、`/openapi.yaml` 逻辑未动

2. **`extern-api/server/views/swagger-ui.html`**（新建，~153 行）
   - 纯静态：无 CDN、无密钥/Token/URL 值输出
   - `fetch('/api/openapi.json')` → 按路径第二段分组 → 中文组名映射 → 方法排序表（徽章 + path + summary）
   - 失败显示 `#error`；渲染经 `escapeHtml`

### HTML 结构

`h1` + 说明行 → `#error` → `#content`；inline `<style>`（徽章色）+ inline `<script>`（分组/排序/防注入）。

### 自检（红色记录五项）

| # | 项 | 结果 |
|---|---|---|
| ① | 路由仅 `sendFile` 固定路径，无目录遍历 | ✅ `join(__dirname,'..','views','swagger-ui.html')` |
| ② | HTML 无用户输入注入点 | ✅ 仅消费 openapi.json，值经 `escapeHtml` |
| ③ | 页面无密钥/URL 输出 | ✅ 只渲染 method/path/summary |
| ④ | `/openapi.json\|yaml` 行为未动 | ✅ 仅追加路由 |
| ⑤ | views 目录与文件已创建 | ✅ `extern-api/server/views/swagger-ui.html` |

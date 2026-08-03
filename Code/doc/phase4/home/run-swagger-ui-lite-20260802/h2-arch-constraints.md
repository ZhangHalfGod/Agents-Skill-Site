# 架构约束与执行计划（H2 — Architect）

**项目**：swagger-ui-lite  
**阶段**：H2  
**日期**：2026-08-02  
**产出者**：Architect（agent=arch）  
**业务仓**：MechAssist-Fusion（branch feature/Home_window）  
**run_dir**：`Code/doc/phase4/home/run-swagger-ui-lite-20260802`

---

## 1. 复核结论

| 复核项 | H1 结论 | H2 复核 | 状态 |
|--------|---------|---------|------|
| CSP scriptSrc 含 `unsafe-inline` | ✓ inline 脚本兼容 | server/index.js L80-L89 源码确认 | 一致 |
| CSP 无 CDN 域 | CDN 方案需 CSP 变更 | connectSrc 仅 self+localhost+火山引擎+豆包——确实无 CDN | 一致 |
| openapiRoutes.js 现有两路由 | `/openapi.json` + `/openapi.yaml` | 源码确认，导出 router | 一致 |
| /api 挂载 + apiLimiter | 新路由自动继承 | L177 确认：`app.use('/api', apiLimiter, openapiRoutes)` | 一致 |
| openapiGenerator 无 tags | 分组逻辑在 UI 侧 | 源码确认 generateOpenApiSpec 无 tags 输出 | 一致 |
| registry LAYERS 5 组 | auth/chat/business/admin/system | 源码确认 slug 与 name 映射 | 一致 |

---

## 2. UI 方案定稿

### 2.1 方案选型

| 裁定 | 理由 |
|------|------|
| **P0：自研极简 HTML**（独立文件） | 零依赖、CSP 无需改、`scriptSrc 'unsafe-inline'` 已就绪 |
| CDN swagger-ui → P2 不纳入本期 | 需放宽 CSP（新 CDN 域 + connectSrc）→ 独立评估 |

### 2.2 HTML 文件路径

- **文件**：`extern-api/server/views/swagger-ui.html`（新建目录 `server/views/`）
- **路由**：`res.sendFile()` 方式，Content-Type 自动为 `text/html`
- **ES module __dirname**：`openapiRoutes.js` 在 `server/routes/` → `join(__dirname, '..', 'views', 'swagger-ui.html')`

### 2.3 分组映射表（7 组）

| 路径段 (segment[1]) | 显示名 | 覆盖路径 |
|---------------------|--------|---------|
| auth | 认证 | `/api/auth/register`、`/api/auth/login`、`/api/auth/me`、`/api/auth/change-password`、`/api/auth/refresh` |
| chat | 对话 | `/api/chat/message`、`/api/chat/message/stream`、`/api/chat/sessions` 等 |
| faq | FAQ | `/api/faq/search`、`/api/faq/:id` |
| `repair-records` | 维修记录 | `/api/repair-records/`、`/api/repair-records/:id` |
| admin | 管理 | `/api/admin/users`、`/api/admin/users/:id` |
| release | 发布 | `/api/release/manifest` |
| 其他（health/v2/openapi.json/docs） | 系统 | `/health`、`/v2/`、`/api/openapi.json`、`/api/openapi.yaml`、`/api/docs` |

**≥5 组** → 实际产出 6-7 组（含"系统"汇总组），满足验收标准。

### 2.4 方法徽章配色

| 方法 | 背景色 | 文字色 |
|------|--------|--------|
| GET | `#49cc90` | white |
| POST | `#61affe` | white |
| PUT | `#fca130` | white |
| DELETE | `#f93e3e` | white |
| PATCH | `#9b59b6` | white |
| 其他 | `#999` | white |

### 2.5 加载失败降级

```html
<div id="error" style="display:none; color:red; padding:1rem; background:#fff3f3; border:1px solid #f93e3e;">
  ⚠ 加载失败：无法获取 OpenAPI 规范。请确认 extern-api 已启动（:3002）。
</div>
```

`fetch` 的 `.catch()` 和 response 非 200 时显示此错误块。

---

## 3. 路由实现要点

### 3.1 插入位置

`openapiRoutes.js` 末尾，`export default router` 之前。在 `/openapi.yaml` 路由后新增。

### 3.2 路由代码（伪代码）

```js
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
const __dirname = dirname(fileURLToPath(import.meta.url))

router.get('/docs/ui', (req, res) => {
  res.set('Cache-Control', 'no-cache')
  res.set('X-Content-Type-Options', 'nosniff')
  try {
    const htmlPath = join(__dirname, '..', 'views', 'swagger-ui.html')
    res.sendFile(htmlPath)
  } catch (err) {
    res.status(500).type('text/plain').send('swagger-ui.html not found')
  }
})
```

### 3.3 安全约束

| 约束 | 实现 |
|------|------|
| 无用户输入注入 | HTML 纯静态，无 query param/dynamic content |
| 不输出密钥 | 页面仅 fetch 同源 `/api/openapi.json`（manifest 不含 key） |
| CSP 兼容 | inline `<style>` + `<script>` → 已白名单 `'unsafe-inline'` |
| 继承限流 | `/api` 挂载点已有 `apiLimiter` |
| 无目录遍历 | `res.sendFile` 使用 `join(__dirname, '..', 'views', 'swagger-ui.html')` 固定路径 |

---

## 4. 红色记录登记

`GET /api/docs/ui` 为网关层（Express router）**新增端点**，触发 ai-code-boundary 红色记录。

| 字段 | 值 |
|------|-----|
| **模块名** | `openapiRoutes.js` — `GET /api/docs/ui`（网关层端点新增） |
| **变更范围** | 新增路由 15 行 + `server/views/swagger-ui.html` ~130 行 |
| **风险点** | (1) 新端点暴露完整 API 路径清单（信息泄露面扩大，但客户群为内部开发者）；(2) CSP 依赖 `unsafe-inline`——若未来收紧需同步变更；(3) `res.sendFile` 路径穿越风险（已固定路径缓解） |
| **审查人** | Architect (H2) + DevLead (H3) + TestEngineer (H4) |
| **审查结论** | H2：方案通过——自研 HTML + 独立文件 + 同源 fetch + 无注入面；H3 待代码复核；H4 待浏览器实测 |
| **关联 Prompt** | swagger-ui-lite H1 scope-checklist |

---

## 5. 修改面白名单

### P0

| # | 文件 | 动作 |
|---|------|------|
| M1 | `server/routes/openapiRoutes.js` | 新增 `router.get('/docs/ui', ...)` + ES module __dirname 推导（~15 行） |
| M2 | `server/views/swagger-ui.html` | **新建文件**（~130 行）——静态 HTML 含 `<style>` + `<script>` 分组渲染逻辑 |

### 显式不做

| 禁止项 | 原因 |
|--------|------|
| 改 `openapiGenerator.js` 加 tags | 本期不改生成器 |
| 改 `server/index.js` CSP | 自研方案无需放宽 |
| 改现有 `/api/*` 路由 | 不改业务 |
| npm install | 零依赖 |
| CDN swagger-ui | P2 不纳入 |

---

## 6. 验收口径

| 用户验收条件 | 架构映射 | H4 验证方式 |
|------------|---------|-----------|
| 浏览器可浏览主要 tag | 7 组分组 + 方法徽章 | `curl -s http://localhost:3002/api/docs/ui` → 200 + text/html；页面含 `<h2>` 分组标题 ≥5 个 |
| 不改业务 API | 旧路由不变 | `curl /api/openapi.json` → 200 无变化 |
| CSP 无拦截 | inline 兼容 | 浏览器 Console 无 CSP violation |
| 零依赖 | 不 npm install | `git diff --stat` 仅 2 文件 |
| 分组 ≥5 组 | auth/chat/faq/repair-records/admin 必定存在 | HTML 源码含 Group 对象 ≥5 key |

---

## 7. 风险与回滚

| 风险 | 缓解 | 回滚 |
|------|------|------|
| `server/views/` 目录不存在导致 sendFile 500 | H3 创建文件时同时建目录；路由 try/catch 返回 500 text | git checkout + 删除 views/ |
| 未来缩紧 CSP（去掉 unsafe-inline）→ UI 不可用 | 独立 HTML 文件可被改造为外部脚本 | 修改 CSP 或 CDN 方案 |
| openapi.json 路径变更导致 fetch 404 | HTML 内 fetch 路径硬编码 `/api/openapi.json`，与旧路由一致 | 更新 HTML |

---

*本文由 Architect 产出。红色记录已登记。提交 DevLead（H3）。*

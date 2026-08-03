# AI代码生成范围清单（H1 — ProductManager）

**项目**：swagger-ui-lite  
**短名**：swagger-ui-lite  
**阶段**：H1  
**日期**：2026-08-02  
**产出者**：ProductManager（agent=pm）  
**业务仓**：MechAssist-Fusion（分支 feature/Home_window）  
**run_dir**：`Code/doc/phase4/home/run-swagger-ui-lite-20260802`

---

## 1. 目标

新增 `GET /api/docs/ui` 路由，返回轻量 HTML 页面，加载 `GET /api/openapi.json` 并以路径分组渲染 API 列表，供浏览器浏览。不改业务 API、不装新依赖。

### 成功画像

| 维度 | 标准 |
|------|------|
| 浏览器可浏览主要 tag | 访问 `http://localhost:3002/api/docs/ui` → 页面展示按 auth/chat/business/admin/system 分组的路径列表，含方法徽章与摘要 |
| 不改业务 | 现有 `/api/*` 行为不变；openapiGenerator 不改 |
| 零依赖 | 不 npm install，不引用 node_modules 中的第三方库 |
| CSP 兼容 | 不触发浏览器 CSP 拦截（纯 inline HTML + 同源 fetch） |

---

## 2. 范围条目

### 2.1 原位探查结论

#### 关键确认

| 检查项 | 结论 | 影响 |
|--------|------|------|
| `openapiGenerator.js` tags | **无** tags 输出 | Swagger UI 无 tag 分组 → 需按路径前缀模拟分组 |
| `node_modules/swagger-ui-dist` | **不存在** | CDN 是唯一引入完整 swagger-ui 的方式 |
| CSP（server/index.js L80-L89） | `scriptSrc: "'self'", "'unsafe-inline'"`，`styleSrc` 同；**无 CDN 域** | CDN swagger-ui 会触发 CSP 拦截 → 需放宽或自研 |
| `/api/docs` 已有路由 | chatRoutes 内结构化文档端点 | `/api/docs/ui` 不与 `/api/docs` 冲突 |
| openapiRoutes.js 现有路由 | `GET /api/openapi.json` + `GET /api/openapi.yaml` | 新路由加入此 router 最合适 |
| 路由挂载 | `server/index.js L177: app.use('/api', apiLimiter, openapiRoutes)` | 新 UI 路由自动继承限流 |

#### 生成器 paths 结构（示例）

```json
{ "/api/auth/register": { "post": { "summary": "用户注册" } },
  "/api/auth/login": { "post": { ... } },
  "/api/chat/message": { "post": { ... } },
  "/api/chat/message/stream": { "post": { ... } },
  "/api/faq/search": { "get": { ... } },
  "/api/admin/users": { "get": { ... } }, ...
}
```

→ 按 `/api/<prefix>/` 分组即可得到 auth/chat/business(含 faq+repair)/admin/system 等"tag-like"分组。

### 2.2 UI 方案对比（提交 H2 决策）

| 方案 | 优势 | 劣势 | 建议 |
|------|------|------|------|
| **A：自研极简 HTML**（推荐） | 零依赖、离线可用、CSP 无需改动、HTML inline 嵌入路由 | 非标准 swagger-ui 外观、无 "Try it out" 交互 | **P0** |
| B：CDN swagger-ui-dist | 标准 swagger-ui 完整功能、Try it out、tags 支持 | 需放宽 CSP（cdn.jsdelivr.net/unpkg.com）、外部 CDN 依赖、openapiGenerator 无 tags | P2（如需要） |

### 2.3 修改条目（P0 — 方案 A）

| # | 文件 | 修改动作 | 核验 |
|---|------|---------|------|
| M1 | `server/routes/openapiRoutes.js` | ① 新增 `router.get('/docs/ui', ...)` 路由；② 返回 Content-Type `text/html; charset=utf-8`；③ HTML 为内联模板字符串（~120 行），含：`<style>`（分组列表样式、方法徽章 GET=绿 POST=蓝 DELETE=红）、`<script>`（fetch `/api/openapi.json` → 按路径第一段分组 → 渲染 `<table>`）、`<body>` 容器 | 浏览器访问 `/api/docs/ui` 显示分组列表 |
| M2 | 同上 HTML 内容 | 分组逻辑：提取路径第二段（`/api/<group>/...`）作为分组名，映射中文名：auth→认证, chat→对话, faq→FAQ, repair-records→维修, admin→管理, system→系统, release→发布。同组内按 HTTP 方法排序 | 页面含 5-7 个分组，每组含多条路径 |

### 2.4 建议 HTML 结构（方案 A）

```html
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>MechAssist API</title>
<style>
  body { font-family: system-ui; max-width: 800px; margin: 2rem auto; }
  .group { margin: 1.5rem 0; }
  .group h2 { border-bottom: 1px solid #ddd; padding-bottom: 0.3rem; }
  .badge { display:inline-block; padding:2px 8px; border-radius:4px; color:#fff; font-size:12px; font-weight:700; margin-right:8px; }
  .badge.get { background:#49cc90; } .badge.post { background:#61affe; }
  .badge.put { background:#fca130; } .badge.delete { background:#f93e3e; }
  .path { font-family: monospace; } .summary { color:#666; margin-left: 1rem; }
  tr { line-height: 2; }
</style></head>
<body>
<h1>MechAssist API</h1><p>从 <code>GET /api/openapi.json</code> 自动生成</p>
<div id="app">加载中…</div>
<script>
fetch('/api/openapi.json').then(r=>r.json()).then(spec=>{
  const groups={};
  for(const [p,ops] of Object.entries(spec.paths)){
    const seg=p.split('/').filter(Boolean);
    const g=seg[1]||'other';
    if(!groups[g])groups[g]=[];
    for(const [m,o] of Object.entries(ops)){
      groups[g].push({method:m.toUpperCase(), path:p, summary:o.summary||'—'});
    }
  }
  const labels={auth:'认证',chat:'对话',faq:'FAQ','repair-records':'维修',admin:'管理',system:'系统',release:'发布'};
  let html='';
  for(const [g,items] of Object.entries(groups)){
    html+='<div class="group"><h2>'+ (labels[g]||g) +'</h2><table>';
    for(const it of items){
      html+='<tr><td><span class="badge '+it.method.toLowerCase()+'">'+it.method+'</span></td><td class="path">'+it.path+'</td><td class="summary">'+it.summary+'</td></tr>';
    }
    html+='</table></div>';
  }
  document.getElementById('app').innerHTML=html;
});
</script></body></html>
```

### 2.5 改动面评估

| 维度 | 改动 |
|------|------|
| 文件数 | 仅 `server/routes/openapiRoutes.js`（+1 路由，~130 行 HTML 字符串） |
| 新增依赖 | 无（不 npm install） |
| 中间件影响 | 无（复用现有 `/api` 挂载，继承 apiLimiter；CSP/helmet/cors 无需改动——inline 脚本/style 已在 `'unsafe-inline'` 白名单） |
| 业务影响 | 无（现有 `/api/openapi.json|yaml` 行为不变） |
| 测试影响 | P2：可选新增测试验证 `/api/docs/ui` 返回 200 + text/html |

### 2.6 不修改（显式不做）

| 文件 / 动作 | 原因 |
|------------|------|
| `openapiGenerator.js`（加 tags） | 不改生成器；分组逻辑在 UI 侧 |
| `server/index.js`（CSP） | 自研方案无需放宽 CSP |
| 现有 `/api/*` 业务路由 | 不改 |
| npm install swagger-ui-dist | 不装新依赖 |
| CDN 集成（swagger-ui-dist） | P2 可选 |
| git push | 禁止 |

---

## 3. 验收口径

| 用户验收条件 | Given-When-Then | 条目 |
|------------|-----------------|------|
| "浏览器可浏览主要 tag" | Given extern-api :3002 运行，When 浏览器访问 `/api/docs/ui`，Then 页面展示按 auth/chat/faq/admin/system 分组的路径列表，含方法徽章和摘要 | M1, M2 |
| 不改业务 API | Given `/api/chat/message` 正常，When 新增路由后，Then 现有端点行为不变 | 不改 |
| CSP 无拦截 | Given 浏览器开发者工具 Console，When 访问 `/api/docs/ui`，Then 无 CSP violation | M1 |

---

## 4. 约束引用

| 约束 | 来源 |
|------|------|
| 只新增路由+HTML，不改业务 API | 用户需求 |
| 不 npm install | 用户需求 |
| 不提交密钥 | AGENTS.md |
| 不 git push | 用户需求 |

---

## 5. 风险与回滚

| 风险 | 缓解 |
|------|------|
| 方案 A 分组逻辑与未来 openapiGenerator 加入 tags 不一致 | 标注"按路径前缀自动分组"，与 tags 无关 |
| 新增路由端点可能受攻击 | 复用 apiLimiter；HTML 不含用户输入 |
| html 字符串过长影响 openapiRoutes.js 可读性 | 评估是否抽成 `server/views/swagger-ui.html` 独立文件（H2 裁定） |

回滚：删除新增的 `router.get('/docs/ui', ...)` 路由即可。

---

## 6. 红色记录（网关层）

| 条目 | 说明 |
|------|------|
| 登记理由 | `GET /api/docs/ui` 为 Express 网关层**新增端点**，属 AI 生成代码作用于网关层，触发红色记录 |
| 审查要求 | H2 架构师确认路由路径、HTML 方案、CSP 兼容性后放行 H3；H4 浏览器实测 |
| --red-record-- | `server/routes/openapiRoutes.js` 新增 `/docs/ui` 路由（AI 生成），属网关层端点新增。 |

---

## 7. 开放问题（提交 H2）

1. **方案选型：自研极简 vs CDN swagger-ui？** 建议 P0 自研（零依赖、CSP 无需改）；P2 可选 CDN swagger-ui（需放宽 CSP 到 cdn.jsdelivr.net + connectSrc 允许对外 fetch openapi.json）。
2. **HTML 内联 vs 独立文件？** 建议独立文件 `server/views/swagger-ui.html`，路由用 `res.sendFile()`，可读性好。但需确认 Express static 路径不与其他冲突。
3. **是否需要同时修改 openapiGenerator 加 tags？** openapiGenerator.js 可按 LAYERS slug 自动生成 tags，Swagger UI 更好看。但本期"不改生成器"，P2 考虑。
4. **红色记录触发？** 是——网关层新增端点，已登记。

---

*本清单由 ProductManager 产出，提交架构师（H2）复核。*

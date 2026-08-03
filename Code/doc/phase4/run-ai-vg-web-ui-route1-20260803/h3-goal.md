# H3 Goal — AI Virtual Glasses Web/UI 调试控制台（P0 代码实现）

## 0. 任务一句话

在 `D:\trae_git\AI_Virtual_Glasses` 下新建 `web/` monorepo，实现 P0 调试控制台（Vue3 + Vite + TS，零 UI 组件库），满足 H1 范围清单 US01–US05 的 Given-When-Then 验收口径，并遵守下述架构约束与 UI 规范（均已定稿，禁止再找说明书）。

## 1. 文件范围（精确）

- **只允许在 `D:\trae_git\AI_Virtual_Glasses\web\` 下新建/修改文件**（目录尚不存在，由你创建）。
- **禁止改动**：`jetson/`、`pico/`、`tools/`、`config/`、`00-plan.md`、`01-http-debug-surface.md`、`02-handover.md`、`README.md`、`docs/`（含 `docs/pipeline/` 三份规范，只读参考）。
- 禁止改动 `D:\trae_git\Agents-Skill-Site\` 任何内容；禁止改动 100G_gateway 仓。
- 禁止 `git add/commit/push`（提交由编排者统一走 promote-commit）。

## 2. 定稿实施条目（H2 架构为准，全部必须落地）

### 2.1 Monorepo 结构（严格按此落文件）

```text
web/
├── pnpm-workspace.yaml          # packages: ['apps/*', 'packages/*']
├── package.json                 # root scripts: dev / build / lint / test
├── tsconfig.base.json
├── .env.development             # VITE_API_BASE=http://127.0.0.1:8090
├── .env.production              # VITE_API_BASE=http://<jetson-ip>:8080
├── .env.rk3588                  # VITE_API_BASE=/glasses
├── README.md                    # 本地启动说明（pnpm install / pnpm dev / pnpm build / pnpm test）
│
├── apps/
│   └── debug-console/           # P0 唯一 app
│       ├── package.json
│       ├── vite.config.ts       # Vite proxy（/v2 /health /api /ws → 127.0.0.1:8090）
│       ├── index.html
│       └── src/
│           ├── main.ts / App.vue
│           ├── router/index.ts
│           ├── views/DebugConsolePage.vue   # 4 Tab: 概览/手势/API发现/控制（Tab 状态切换为主，hash 锚点双兼容）
│           ├── components/StatusCard.vue / HandCanvas.vue / ControlPanel.vue / ApiLinkList.vue / MockBadge.vue / ImuGauge.vue(P1 stub) / SlamPanel.vue(P1 stub) / WsStatus.vue(P1 stub)
│           └── composables/useHealth.ts / useGesture.ts / useV2Discovery.ts / useControl.ts / useMockBadge.ts
│
├── packages/
│   ├── api-client/              # Infrastructure 层：src/index.ts、client.ts（VITE_API_BASE 唯一持有人，fetch + AbortController）、endpoints.ts、mock/{index,health,gesture,v2,control}.mock.ts、ws.ts(P1 stub)
│   ├── domain/                  # Domain 层：src/types/{health,gesture,v2,control,imu,slam,ws}.ts + src/repository/{IHealthRepository,IGestureRepository,IV2Repository,IControlRepository,IStatusRepository}.ts
│   └── ui-kit/                  # src/{index.ts,BaseCard.vue,ErrorDisplay.vue,LoadingSpinner.vue,JsonViewer.vue}
```

### 2.2 分层依赖（违反即验收不通过）

- Presentation（views/components）→ Application（composables）→ Domain（types + repository 接口）← Infrastructure（api-client）
- **Application 层不得 import fetch / axios / VITE_API_BASE**，只调 Domain Repository 接口
- **Infrastructure（api-client）是唯一持有 VITE_API_BASE 的模块**
- 所有 API 类型（HealthResponse/GestureResponse/V2DiscoveryResponse/ControlRequest/ControlResponse/ApiError）从 `@ai-vg/domain` 导入；禁止组件/composables 中手写 `any` 响应

### 2.3 接口契约（字段级，以 H2 §四 为准）

- `GET /v2`：`{title, base, links:[{href, method: 'GET'|'POST'|'WS', description}]}`，页面加载一次性获取，缓存 links[] 驱动导航；不可达时用硬编码 fallback 端点列表
- `GET /health`：`{cpu_temp, mem_used_mb, mem_total_mb, gesture_fps, imu_fps, slam_fps, uptime_sec, _meta?:{isMock?}}`，5s 轮询，5s 超时
- `GET /api/v1/gesture`：`{pinch, landmarks:[{x,y,z}], _meta?:{isMock?}}`（21 点），1s 轮询，3s 超时
- `POST /api/v1/control`：body `{pinch_threshold?: number, [k:string]: unknown}`，响应 `{success, applied, message?, _meta?}`；错误 `{error, detail?, _meta?}`；5s 超时
- 统一错误模型 `FetchResult<T>`：`{ok:true,data,isMock} | {ok:false,error,httpStatus?,isMock,detail?}`；超时=408「请求超时」、网络不可达、JSON 解析失败三类错误文案
- P1 类型预留（只建类型与 stub，不做功能）：imu.ts / slam.ts / ws.ts + IStatusRepository（P0 实现 MockStatusRepository：subscribe 返回空回调、getConnectionState 恒 'disconnected'）

### 2.4 Mock 透明（US05）

- api-client 解析响应后检查 `_meta?.isMock === true` 注入 `isMock`；`VITE_MOCK_MODE=force` 时全部走前端 mock interceptor
- mock 数据与真实字段一致：`health.uptime` 用 `Date.now()-startTime` 实时计算；`gesture.landmarks` 返回静态 21 点手型
- 业务组件**禁止**写「如果是 mock 就显示 X 否则 Y」条件分支——统一用 isMock 属性/MockBadge 驱动
- MockBadge：fixed 顶部橙色底（#f97316）白字 "MOCK"，任一数据源 mock 即常驻，全部 live 消失

### 2.5 依赖白名单

- 仅允许：vue、vue-router、pinia(可选)、vite、vitest、typescript、eslint、prettier、@vitejs/plugin-vue、@ai-vg/*（workspace 内部包）
- 禁止：UI 组件库（Element Plus / Ant Design Vue / Naive 等）、axios、Socket.IO、tailwind、webfont

## 3. UI 视觉与组件约束（H2b 规范，出图参考已生成：`D:\trae_git\AI_Virtual_Glasses\doc\assets\ui-gen\DebugConsole\DebugConsole-7a72028f7ec0.png`）

- **深色主路径**：body 与内容区 `#05070a → #0a1018` 微渐变；禁止 body 强制浅底
- 顶栏 AppShell：玻璃底 `rgba(11,15,20,.85)` + `border: 1px solid rgba(255,255,255,.10)` + `backdrop-filter: blur(12px)`；品牌色 `#1677FF` 仅选中态/主按钮
- 4 Tab：概览 Overview / 手势 Gesture / API 发现 Discovery / 控制 Control；Tab 栏「弱底+描边+选中高亮」
- **浅色内容岛**：JSON 原文/长表单用 `rgba(248,250,252,.92)` 半透明卡，文字 `#0f172a`，16px 圆角 + 深阴影（`0 8px 24px rgba(0,0,0,.45)`）
- Design Tokens 用 CSS 自定义属性交付（`:root` 变量），Prompt 引用 token 名禁魔法值：色板/字号阶梯(11/12/13/14/16/20/24px)/间距(4/8/12/16/24/32px)/圆角(8/12/16px)/阴影；等宽字体用于数值与 JSON
- 6 组件 × 5 状态（default/loading/error/empty/mock）：
  - StatusCard：数值 16px 加粗等宽，fps<5 warning 色，error 显示「不可用」不白屏，脚标 [live]/[mock]
  - HandCanvas：Canvas 2D 画 21 点骨架连线 + 掌心，无相机画面；pinch=true → 绿色 PINCH + 拇指食指关键点放大 + success 描边；false → 灰色 OPEN；计数 21/21 或 0/21
  - ControlPanel：滑块+数值输入双向绑定（0.00–1.00 步进 0.01），Apply 防连点 3s 超时，响应区 HTTP 状态码+JSON+时间戳，2xx 绿/非 2xx 红（不显示堆栈），恢复默认=重置 0.05 并立即 Apply 一次
  - ApiLinkList：method 徽标 GET 蓝/POST 绿/WS 紫 + href 等宽 + 描述 + 目标 Tab；未知端点新窗口打开
  - MockBadge / ImuGauge(SlamPanel/WsStatus P1 空态「P1 待接入」)
- 轮询：health 5s / gesture 1s；失败退避 5→10→30s 封顶，恢复回正常间隔；`document.hidden` 暂停全部轮询；AbortController 超时
- a11y：`:focus-visible` 焦点环、状态不只靠颜色（PINCH 带图标+文字）、键盘可操作滑块、动画尊重 `prefers-reduced-motion`

## 4. 硬约束（违反即停，逐条必须遵守）

1. **禁跑 `npm install` / `npm rebuild`**：如需安装依赖用 `pnpm install`（纯 JS 依赖，非原生模块场景；若遇到原生模块 ABI 问题，**不要自行修复**，在结果摘要中上报）
2. **禁止再调用 agents-skill-remote / 任何 Site MCP；禁止读取 Agents-Skill-Site 仓内 `docs/zh/**` 说明书**——本 Goal 已内联全部所需规范，直接执行
3. 禁止写任何 key/token/密码进代码、注释、README 或提交信息
4. 禁止 import openclaw SDK；禁止引入相机/串口/设备 API（WebUSB / Web Serial）
5. 禁止改动 100G_gateway Nginx 配置；禁止改动 jetson/、pico/ 代码
6. 错误文案禁止输出堆栈/内部端点细节
7. 中文注释；组件命名 PascalCase `.vue`，composable 命名 `use*.ts`
8. 禁止 `git add/commit/push`；禁止删除 run-dir 或仓库内既有文件

## 5. Playbook Pack（跳界快照 · 强制遵守）

scheme: single-facade-mcp+hop-snapshot
via: agents-skill-remote（OpenClaw 文档跳已拉取；下列为摘录正文，非路径提示）

**禁止**：再调 agents-skill-remote / 任何 Site MCP；再要求读取 Agents-Skill-Site 仓内 `docs/zh/**` 说明书。
**允许**：按本 Pack + 上方定稿要点，仅在 WorkDir 业务仓改代码与跑测试。

### DevLead 角色义务（开发负责人，本跳执行身份）
- 小批量生成、人工把关；代码自审：语法/风格/架构分层、AI 典型偷懒模式（空 catch、假测试、未使用变量掩盖逻辑缺失）
- 命名规范、目录与依赖符合规范；安全与敏感信息无硬编码
- 提交备注规范示例（本跳不 commit，仅留痕意识）：`[AI生成] Web-UI调试控制台-P0-V1.0`
- 关联 Prompt 版本 ↔ 代码版本 ↔ 审核人（由编排者统一记账）

### 出门清单（本阶段）
- [ ] P0 五条用户故事对应组件/页面全部落地（US01–US05）
- [ ] 分层依赖方向正确：Application 不 import fetch/VITE_API_BASE；api-client 唯一持有 base URL
- [ ] 接口类型全部来自 @ai-vg/domain，无 any 响应
- [ ] Mock 透明：isMock 统一驱动 MockBadge，业务组件无 mock/live 条件分支
- [ ] 轮询间隔/退避/隐藏暂停符合 §2.5 与 §3
- [ ] 构建可跑通（pnpm install + pnpm build 至少报出可修复的清单；如因环境无法装依赖，如实说明卡点）
- [ ] 核心层/网关/安全——明确不适用（纯前端普通模块，无红色记录）
- [ ] 本阶段无新教训需记录

### 硬禁区
- 不写密钥/Token 进任何产出
- 不改核心引擎/网关/安全代码（本范围无）
- 不越过编排者直接找上下游；不私自提交 git

（机器镜像：`<run-dir>/playbook-pack-h1.md` + `playbook-pack-h2.md` + `playbook-pack-h2b.md` + `mcp-resolve-h1/h2/h2b.yaml` + 本 Goal `h3-goal.md`；DevLead 纪律经 `get_source_text docs/zh/agents/standard/DevLead/index.md` contentHash `1eafe9e82124f2b5` 补摘）

## 6. 验收口径（H4 复验将逐条核对）

1. `web/` monorepo 结构完整（apps/debug-console + packages/{api-client,domain,ui-kit} + pnpm-workspace.yaml + 3 个 .env）
2. `pnpm build`（或 tsc -b）通过 / 或报告具体阻塞点
3. 起 dev server 后 `GET /v2`、`GET /health`、`GET /api/v1/gesture`、`POST /api/v1/control` 在 mock 模式下返回字段级正确的 JSON
4. 浏览器页面含 4 Tab、MockBadge（mock 时橙色常驻）、深色画布 + 浅色内容岛、pinch 高亮
5. `git status` 改动面 ∈ `web/`（越界即打回）

## 7. 回复格式（必须严格三标题）

用简体中文，最后严格以这三个标题输出：
## 当前进度
## 下一步计划
## 本次结果摘要

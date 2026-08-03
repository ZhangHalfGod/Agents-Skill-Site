# AI代码生成范围清单 — Web/UI 层（AI Virtual Glasses）

> **文档编号**：H1-SCOPE-WEB-UI-20260803  
> **项目**：`ai-virtual-glasses-web-ui`  
> **阶段**：requirements  
> **上一跳**：无（H1 首跳）  
> **下一跳**：Architect（H2 ∥ UIDesigner H2b）  
> **落盘路径**：`docs/pipeline/run-web-ui-20260803/AI代码生成范围清单_Web-UI.md`  
> **治理仓快照**：`Agents-Skill-Site/Code/doc/phase4/run-ai-vg-web-ui-route1-20260803/mcp-resolve-h1.yaml` + `playbook-pack-h1.md`

---

## 一、业务目标

为 **AI Virtual Glasses** 分体式 AR 原型项目交付 **Web/UI 调试控制台**，使开发者可在 PC 浏览器上实时查看设备健康状态、手势数据、IMU 姿态、SLAM 位姿，并通过热更新接口调试参数——**无需穿戴头显即可开发和验证后端 API**。

| 维度 | 指标 |
|------|------|
| 成功标准 | PC 浏览器打开 `http://<board-ip>:8080`（或 `/glasses/`）可查看 health/gesture/v2 数据 |
| 可度量 | 每个 API 端点均有对应 UI 可视化模块；Mock 模式数据格式与真实数据一致 |
| 干系人 | 开发者（自用）、架构师（复核接口契约）、后续演示者（P2 AR 壳） |

---

## 二、显式非目标（Out of Scope）

| # | 非目标 | 原因 / 责任方 |
|---|--------|--------------|
| OS1 | 相机驱动（V4L2 / GStreamer / CSI） | 板端 C 侧；不在前端 |
| OS2 | UART 帧协议（Pico ↔ Jetson） | Pico 固件 / jetson/transport/ |
| OS3 | MediaPipe Hands / TensorRT 推理 | jetson/gesture/ 模块 |
| OS4 | SLAM（ORB-SLAM3 / VINS-Mono） | jetson/slam/ 模块 |
| OS5 | Pico 固件开发 | pico/ 目录 |
| OS6 | OpenClaw 编排部署到眼镜板 | 02-handover D6 |
| OS7 | 修改 100G_gateway Nginx 生产配置 | 临测仅文档参考，不改 BM 现网 |
| OS8 | BM 固件升级通道 / 8088 业务迁移 | 与眼镜项目无关 |
| OS9 | 端侧大模型实时推理 | 00-plan 性能预算禁止 |
| OS10 | WebSocket 实时推送（完整实现） | P1 留 stub；P0 不做 |
| OS11 | AR 交互壳（浮动面板+手势碰撞） | P2 预留，不在 P0 交付范围 |

---

## 三、用户故事与优先级

### P0 — 调试控制台（核心交付，无硬件即可开发验证）

| ID | 用户故事 | 优先级 |
|----|---------|:------:|
| US01 | **设备健康仪表盘**：作为开发者，我可以打开调试控制台首页，看到设备健康状态（CPU 温度、内存占用、各模块帧率），以便快速判断系统是否有异常 | P0 |
| US02 | **API 发现导航**：作为开发者，我可以在页面上浏览 /v2 返回的 API 链接列表，点击跳转到对应模块，而不需要手动拼 URL | P0 |
| US03 | **手势数据可视化**：作为开发者，我可以查看到当前手势识别结果——捏合状态（pinch true/false）和 21 个 landmarks 坐标的抽象绘制（HandCanvas），以便验证手势算法输出 | P0 |
| US04 | **参数热更新控制面板**：作为开发者，我可以在调试控制台中修改调试参数（如 pinch_threshold、UI 布局配置），并看到 POST /api/v1/control 的请求/响应结果 | P0 |
| US05 | **Mock 模式标识**：作为开发者，在无真实硬件（相机/IMU/头显不在家）时，我可以通过 MockBadge 和 mock 数据开发前端，界面明确标识当前为 mock 状态 | P0 |

### P1 — 扩展监控（真实硬件接入后交付）

| ID | 用户故事 | 优先级 |
|----|---------|:------:|
| US06 | **IMU 姿态监控**：作为开发者，我可以查看 IMU 六轴原始数据或欧拉角/四元数显示（仪表盘或数值面板），以便调试头追融合 | P1 |
| US07 | **SLAM 位姿监控**：作为开发者，可以查看 SLAM 当前位姿（x/y/z + 旋转）和跟踪状态（初始化/跟踪/丢失），以便验证虚实配准 | P1 |
| US08 | **WebSocket 实时推送（stub）**：作为开发者，前端预留 WebSocket 连接 UI 和状态指示，后续对接 /ws/status 后无需改 UI 架构 | P1 |

### P2 — AR 交互壳（演示/原型验证）

| ID | 用户故事 | 优先级 |
|----|---------|:------:|
| US09 | **AR 浮动面板模拟**：作为演示者，可以在调试控制台切换到 AR 壳视图，看到虚拟按钮悬浮（用 mock 手势和 mock IMU 数据驱动面板高亮/跟随），以便向他人展示最终交互形态 | P2 |

---

## 四、P0 验收标准（Given-When-Then）

### US01 设备健康仪表盘

**Given** 调试控制台已加载，API base URL 已配置（默认 `http://127.0.0.1:8090` 或 `/glasses/`）  
**When** 页面加载完成或手动点击「刷新」  
**Then**
- `/health` 数据以卡片形式展示：CPU 温度（°C）、内存使用（MB / 总量）、各模块帧率（gesture_fps、imu_fps、slam_fps）
- 若 API 返回 200，数据显示为实际数值
- 若 API 返回错误/超时，卡片显示错误状态（error / "不可用"），不白屏
- 标注当前数据来源（mock / live），与 US05 MockBadge 联动

### US02 API 发现导航

**Given** 开发者在调试控制台首页  
**When** 点击「API 发现」Tab 或面板  
**Then**
- 调用 `GET /v2` 获取 links 数组
- 页面渲染为可点击的端点列表（method + href + description）
- 点击某个端点（如 /api/v1/gesture）跳转到对应模块视图
- 若 `/v2` 不可达，显示友好错误提示「API 发现页暂不可用」

### US03 手势数据可视化

**Given** 开发者在手势调试面板  
**When** 页面加载或自动轮询  
**Then**
- 调用 `GET /api/v1/gesture`
- HandCanvas 组件用 landmarks 数组（21 点 [x,y,z]）绘制简化手部骨架连线（手指关节 + 掌心）
- Pinch 状态以布尔标签醒目展示（pinch: true → 绿色 "PINCH"；false → 灰色 "OPEN"）
- landmarks 数量显示为 "21/21" 或 "0/21 (无数据)"
- 若 API 不可用，显示 "手势数据暂无"

### US04 参数热更新控制面板

**Given** 开发者在控制面板 Tab  
**When** 修改 pinch_threshold 滑块或输入框，点击「Apply」  
**Then**
- 发送 `POST /api/v1/control`，body `{"pinch_threshold": 0.05}`
- 响应区域展示 HTTP 状态码 + 响应体 JSON
- 成功：绿色提示；失败/超时：红色错误信息
- 提供「恢复默认」按钮

### US05 Mock 模式标识

**Given** 调试控制台已加载  
**When** API 响应中包含 mock 标记字段（或前端配置为 mock 模式）  
**Then**
- 页面顶部固定栏显示 MockBadge（橙色底 "MOCK" 标签或等效标识）
- 各数据卡片标注 "[mock]" 前缀
- MockBadge 始终可见（fixed），提示开发者当前非真实硬件数据
- 切换为 live 模式后 MockBadge 消失

---

## 五、AI 可生成范围

### 5.1 分级判定

| 模块 | 层级 | 是否可 AI 生成 | 红色记录 |
|------|------|:---:|:---:|
| `web/apps/debug-console/` — 页面、组件、路由 | 展示层 | ✅ 普通流程 | 否 |
| `web/packages/api-client/` — fetch 封装、类型定义 | 基础设施层 | ✅ 普通流程 | 否 |
| `web/packages/domain/` — 数据模型、Mock 策略 | 领域层 | ✅ 普通流程 | 否 |
| `web/packages/ui-kit/` — 共享组件库 | 展示层 | ✅ 普通流程 | 否 |
| `web/README.md` — 本地启动文档 | 文档 | ✅ 普通流程 | 否 |
| Nginx `/glasses/` 反代配置 | 网关 | ⚠️ **仅文档参考** — 不改 100G_gateway | **不触发** |

### 5.2 红色记录判定说明

本次 Web/UI 范围为 **纯前端普通模块**，不涉及：
- 核心业务引擎（手势推理/SLAM 在板端 C/Python）
- 网关层改动（Nginx 反代仅文档建议，不修改 BM `bm_agent.conf`）
- 安全认证模块（调试面无需鉴权）
- 架构层自有代码生成（Architect 将产出架构约束文档，由 H2 判定其是否需要红色记录）

**结论：本次 H1 范围清单无触发《核心模块AI生成红色记录》的条目。**

---

## 六、与现有 API 端点映射表

| 端点 | 方法 | P0/P1/P2 | UI 组件 | 数据流 |
|------|------|:---:|---------|--------|
| `/v2` | GET | P0 | `ApiLinkList` | 页面加载一次性获取 → 渲染导航 |
| `/health` | GET | P0 | `StatusCard` | 轮询（5s）→ 卡片刷新 |
| `/api/v1/gesture` | GET | P0 | `HandCanvas` | 轮询（1s）→ landmarks 重绘 |
| `/api/v1/imu` | GET | P1 | `ImuGauge` | 轮询（200ms）→ 仪表盘更新 |
| `/api/v1/slam` | GET | P1 | `SlamPanel` | 轮询（1s）→ 位姿展示 |
| `/api/v1/control` | POST | P0 | `ControlPanel` | 用户操作 → 请求/响应展示 |
| `/ws/status` | WS | P1 | `WsStatus` (stub) | P0 留连接桩；P1 对接 |

**Mock 数据约定**：
- Mock 模式下各 GET 端点返回固定假数据，结构与真实 JSON 字段一致
- `health.uptime` 用 `Date.now() - startTime` 计算（mock 也模拟真实计时）
- `gesture.landmarks` 返回一套静态手型（21 点）供 HandCanvas 绑定

---

## 七、约束引用

| 约束 | 来源 | 说明 |
|------|------|------|
| 终态 Jetson :8080；RK3588 临测 /glasses/ 或 :8090 | `02-handover.md` D1–D3 | 前端环境变量 `VITE_API_BASE` 可切换 |
| 前端自研，不复用 BM `/usr/BM/web/www` | `02-handover.md` D4 | 独立 `web/` monorepo |
| 运行时零 OpenClaw 依赖 | `02-handover.md` D6 | 不 import openclaw SDK |
| 性能预算 | `00-plan.md` §性能预算 | 前端不引入大模型推理；页面 < 1MB gzip |
| Nginx 仅文档参考，不改 BM 配置 | `01-http-debug-surface.md` §3 | Architect 可列配置片段；DevLead 不执行 |
| `/v2` 发现页驱动路由 | `01-http-debug-surface.md` §5 | api-client 首调 /v2 获取完整端点列表 |
| Mock 与真数据透明 | `http-runbook.md` | 数据格式一致，前端不感知数据来源 |

---

## 八、风险与假设

### 8.1 风险

| 风险 | 概率 | 影响 | 缓解 |
|------|:---:|------|------|
| 无真实硬件（相机/IMU/头显不在家） | 已确认 | P1/P2 功能无法端到端验证 | P0 全部 mock 可独立验收；MockBadge 明确标识 |
| RK3588 临测板 IP 不稳定或不在局域网 | 中 | 无法验证 `/glasses/` 路径下的反代 | 提供 `http://127.0.0.1:8090` 本地回退；前端不依赖特定 IP |
| API 形状变更（Jetson 接入后字段调整） | 低 | api-client 类型定义需同步 | 前后端版本 co-version 约束（Architect 定义） |
| CORS 问题（RK3588 Nginx 未配 CORS 头） | 中 | 浏览器跨域拦截 | Architect 在 H2 明确 CORS 策略；开发阶段可 Vite proxy |
| WebSocket 后续对接改 UI 架构 | 低 | P1 WS stub 设计不当需重构 | stub 以 hook/interface 抽象，对接时只换实现 |

### 8.2 假设

| 假设 | 验证方式 | 状态 |
|------|---------|:---:|
| glasses-debug API 形状与 `01-http-debug-surface.md` §1 一致 | 已验收：http-runbook 冒烟通过 | ✅ 已验证 |
| 前端开发者有 Node.js 20+ + npm/pnpm 环境 | 开工前确认 | 🔄 待验证 |
| RK3588 临测板 Nginx 可加 `/glasses/` location（不改现网） | 需板端操作人确认 | 🔄 待验证 |
| Pico/IMU/相机到货前即可完成 P0 交付 | US01–US05 不依赖硬件 | ✅ 已确认 |
| Jetson Nano 到货后只改 `VITE_API_BASE`，不重写 API 调用 | API 契约稳定 | 🔄 待 Arch 复核 |

---

## 九、RACI 简表（建议）

| 角色 | 职责 | RACI |
|------|------|:---:|
| ProductManager | 范围界定、验收标准 | A/R |
| Architect | 架构分层、技术选型、接口契约 | A/R |
| UIDesigner | UI 规范、组件清单、设计 tokens | R |
| DevLead | 代码实现、CR | R |
| 板端操作人（人） | RK3588 Nginx 配置 | C |
| 开发调试者 | 使用调试控制台验证 API | I |

---

## 十、附录：交付物文件路径

| 文件 | 路径 |
|------|------|
| 范围清单（本文件） | `D:\trae_git\AI_Virtual_Glasses\docs\pipeline\run-web-ui-20260803\AI代码生成范围清单_Web-UI.md` |
| MCP 解析快照 | `D:\trae_git\Agents-Skill-Site\Code\doc\phase4\run-ai-vg-web-ui-route1-20260803\mcp-resolve-h1.yaml` |
| Playbook 速查 | `D:\trae_git\Agents-Skill-Site\Code\doc\phase4\run-ai-vg-web-ui-route1-20260803\playbook-pack-h1.md` |

---

## 十一、阶段门禁自查（stage-gate-flow）

- [x] 当前阶段输入 / 输出 / 审核状态已标明（H1 requirements → H2 design）
- [x] 上一阶段未通过则不进入下一阶段（首跳，不适用）
- [x] 核心层 / 网关 / 安全 / 架构改动——**明确不适用**（纯 Web 前端普通模块；Nginx 仅文档参考不改动）
- [x] 本阶段 Lesson：**本阶段无新教训**
- [ ] 部署验收：不适用（H1 无部署）

---

## 十二、交付物自检（ProductManager 角色）

- [x] 每条 P0 均有可执行验收标准（§四 Given-When-Then）
- [x] 核心/网关/安全相关条目已触发红色记录流程说明（§五 明确不触发）
- [x] 非目标与范围边界已写明（§二 11 项显式非目标）

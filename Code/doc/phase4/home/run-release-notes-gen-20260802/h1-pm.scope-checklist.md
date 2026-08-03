# AI代码生成范围清单（H1 — ProductManager）

**项目**：release-notes-gen  
**短名**：release-notes-gen  
**阶段**：H1（需求拆解 & 范围界定）  
**日期**：2026-08-02  
**产出者**：ProductManager（agent=pm）  
**业务仓**：MechAssist-Fusion（分支 feature/Home_window）  
**run_dir**：`Code/doc/phase4/home/run-release-notes-gen-20260802`

---

## 1. 目标

从 `GET /api/release/manifest`（extern-api :3002）生成发布清单 Markdown，对齐 `发布清单-模板.md` 结构。脚本 exit 0 表示成功，输出文件不含密钥/Token。

### 成功画像

| 维度 | 标准 |
|------|------|
| 脚本 exit 0 | `node scripts/release-notes-gen.mjs` 成功生成 Markdown 文件 → exit 0；连接失败/HTTP 错误 → exit 1 |
| 字段与 manifest 一致 | 生成的 Markdown 中 releaseTriplet、deployEnv、gitSha、mcp* 等字段与 manifest JSON 对应字段逐项一致 |
| 无密钥 | 输出 Markdown 文件与标准输出均不含 Token/Key/完整 URL 等敏感信息（默认 probe=false） |
| 可复用 | 作为 `release-triplet-check.mjs` 的姐妹脚本，调用方式与环境变量一致 |

---

## 2. 范围条目

### 2.1 原位探查结论

#### 已有参考脚本

| 文件 | 说明 | 可复用 |
|------|------|--------|
| `scripts/release-triplet-check.mjs` | 发布三元组检查：fetch manifest → 打印 triplet/MCP 信息 → exit 0/1。环境变量 `EXTERN_API_URL`、`RELEASE_PROBE` | fetch 封装模式、参数设计、exit 码约定 |
| `scripts/governance-smoke.mjs` | 治理冒烟测试 | .mjs 先例 |

#### Manifest 响应结构（releaseContract.js + releaseRoutes.js）

```json
{ "success": true, "data": {
  "service": "...", "serviceVersion": "...", "deployEnv": "development|staging|production",
  "gitSha": "...", "releaseTag": "...", "buildTime": "...",
  "releaseTriplet": { "promptVersion": "...", "registryVersion": "...", "commit": "..." },
  "registry": { "version": "...", "globalTools": ["..."] },
  "mcp": { "domain": "travel", "compatible": bool, "reachable": bool, "baseUrlConfigured": bool, "capabilitiesVersion": "...", ... },
  "mcpMech": { "domain": "mech", ... },
  "gatewayPlanes": { "control": {...}, "data": {...} },
  "releaseValidation": { "ok": bool, "errors": [...] }
} }
```

**probe 开关**：`?probe=false` → mcp/mcpMech 仅含 `configured/reachable=false`（无外部请求）；`?probe=true` → 含完整 capabilities 对比信息。

#### 无密钥分析

- manifest 响应中 **不含** 任何 API Key、Token、密码
- `mcp[.Mech].error` 字段在 MCP 不可达时仅含 `"BASE_URL 未配置"` / `"拉取 capabilities 超时"` / HTTP 状态码等——不泄露 `MCP_*_BASE_URL` 实际值
- `release-triplet-check.mjs` 已遵循同样的无密钥策略（只打印 `mcp.compatible/reachable/configured`）
- **建议默认 probe=false**，避免网络请求暴露 URL 到 Markdown

#### 模板结构（发布清单-模板.md 7 节）

| 节 | 内容 | 可自动生成 |
|----|------|-----------|
| 一、元信息 | 发布日期、操作人、环境、关联需求 | 自动填充 deployEnv + buildTime；其余留空 |
| 二、发布三元组 | 6 行表（Prompt/注册表/服务/MCP versions） | 全自动（从 releaseTriplet + mcp/mcpMech） |
| 三、发布前检查 | 测试通过、manifest 验证、capabilities | 留空（需人工跑测试） |
| 四、部署顺序 | 5 步建议 | 写入固定模板文本 |
| 五、回滚 | 4 步 | 写入固定模板文本 |
| 六、发布后验证链接 | URL 表 | 部分自动（base 可推导，MCP URL 不确定→留空） |
| 七、备注 | 自由文本 | 留空 |

### 2.2 修改条目（P0）

| # | 文件 | 修改动作 | 核验方式 |
|---|------|---------|---------|
| M1 | **新增** `scripts/release-notes-gen.mjs` | 新建 .mjs 脚本：① 环境变量 `EXTERN_API_URL`（默认 `http://127.0.0.1:3002`）、`RELEASE_OUTPUT_DIR`（默认 `doc/方案C/方案C_MVP_M1-M4_对接/M-4_版本契约与发布联动/`）、`RELEASE_PROBE`（默认 `false`）；② `fetch()` 获取 manifest；③ 从 `json.data` 提取字段，生成 Markdown 字符串；④ `fs.writeFileSync` 写到 `发布清单-YYYYMMDD.md`；⑤ 任一错误 → exit 1 | `node scripts/release-notes-gen.mjs` → exit 0，输出文件存在且字段正确 |

### 2.3 Markdown 输出结构（P0，纳入 M1）

```markdown
# 方案 C 发布清单 — YYYY-MM-DD（自动生成）

> 由 `scripts/release-notes-gen.mjs` 从 `GET /api/release/manifest` 生成。

## 一、元信息
（auto: deployEnv, buildTime, gitSha; manual: 操作人、关联需求）

## 二、发布三元组
（auto: 6 行表——promptVersion, registryVersion, commit, travel/mcp capabilities, mech/mcpMech capabilities, deployEnv）

## 三、发布前检查
（placeholder: 测试、manifest、capabilities 清单）

## 四、部署顺序
（fixed: 5 步建议文本）

## 五、回滚
（fixed: 4 步回滚文本）

## 六、发布后验证链接
（auto: /health, /api/release/manifest, /capabilities; manual: 前端地址）

## 七、备注
（placeholder）
```

### 2.4 脚本参数设计

| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `EXTERN_API_URL` | env | `http://127.0.0.1:3002` | extern-api 根地址 |
| `RELEASE_OUTPUT_DIR` | env | `doc/方案C/…/M-4_版本契约与发布联动/` | 输出目录 |
| `RELEASE_PROBE` | env | `false` | 是否探测 MCP（`?probe=true`）。默认 false 以确保无密钥、无外部依赖 |
| `--output <path>` | CLI arg | — | 覆盖输出路径 |

### 2.5 脚本骨架（参考 release-triplet-check.mjs）

```js
#!/usr/bin/env node
// release-notes-gen.mjs — 从 manifest 生成发布清单 Markdown
const base = (process.env.EXTERN_API_URL || 'http://127.0.0.1:3002').replace(/\/+$/, '')
const probe = process.env.RELEASE_PROBE === 'true'
const outDir = process.env.RELEASE_OUTPUT_DIR || 'doc/方案C/.../M-4_版本契约与发布联动/'
const outPath = process.argv.find(a => a.startsWith('--output='))?.split('=')[1]
  || `${outDir}/发布清单-${new Date().toISOString().slice(0,10).replace(/-/g,'')}.md`

async function main() {
  const res = await fetch(`${base}/api/release/manifest${probe ? '?probe=true' : '?probe=false'}`)
  // ... parse, generate markdown, write file, exit 0
}
main()
```

### 2.6 不修改（显式不做）

| 文件 / 动作 | 原因 |
|------------|------|
| `release-triplet-check.mjs` | 独立脚本，功能不同 |
| `releaseContract.js` / `releaseRoutes.js` | 业务代码，不改 |
| `发布清单-模板.md` | 模板文件，保留供人工对照 |
| `版本三元组发布流程.md` | 流程文档，可在 H3 后评估是否引用新脚本（P2） |
| `extern-api/` 业务逻辑 | 不改 |
| git push / npm install | 禁止 |

### 2.7 P2 条目（可选）

| # | 修改动作 |
|---|---------|
| M2 | `doc/方案C/方案C_协议与治理/版本三元组发布流程.md` §2.2 补充 `node scripts/release-notes-gen.mjs` 生成发布清单 |

---

## 3. 验收口径

| 用户验收条件 | Given-When-Then | 条目 |
|------------|-----------------|------|
| "脚本 exit 0" | Given extern-api 在 3002 运行，When `node scripts/release-notes-gen.mjs`，Then exit 0 且输出文件产生 | M1 |
| "字段与 manifest 一致" | Given 生成 Markdown，When 逐字段对比 `GET /api/release/manifest?probe=false` JSON，Then releaseTriplet、gitSha、deployEnv、mcp* 全部一致 | M1 |
| 无密钥 | Given 生成 Markdown，When grep `KEY\|TOKEN\|API_KEY\|SECRET\|password`，Then 零命中 | M1 |

---

## 4. 风险与回滚

| 风险 | 缓解 |
|------|------|
| 网络不可达导致 exit 1 | 输出 clear 错误信息，不吞异常 |
| 输出目录不存在 | 脚本需 `fs.mkdirSync` 创建（或 exit 1 提示） |
| manifest 字段缺失（如新版本去掉了某字段） | 用 `?.` 可选链，缺字段写 `—` 而非崩溃 |
| probe=true 时输出 MCP URL | 默认 probe=false；若用户设 probe=true ，mcp 段仅打印 capabilitiesVersion/compatible，不打印 baseUrl |

回滚：删除新增的 .mjs 文件即可。

---

## 5. 开放问题（提交 H2）

1. **输出结构与模板的关系**：完全对齐 `发布清单-模板.md` 的 7 节（自动生成 + 占位符）还是生成轻量摘要版（仅 §二 三元组 + §六 验证链接）？建议完全对齐但标注 auto/manual 区别。
2. **probe 默认值**：`false`（不探测 MCP，安全无外部请求）还是 `true`？建议 `false`——"无密钥"安全优先，需要 probe 信息时手动 `RELEASE_PROBE=true`。
3. **字段完整性校验**：manifest 中某字段缺失时，生成器是 FAIL（exit 1）还是照写 `—`？建议照写 `—`，因为 manifest 结构可能随版本演进。
4. **输出文件命名**：`发布清单-YYYYMMDD.md`（按日期）还是 `发布清单-<commit SHA>.md`？建议日期（与模板命名约定一致）。
5. **是否同步更新版本三元组发布流程.md**？建议 P2 做。

---

*本清单由 ProductManager 产出，提交架构师（H2）复核。*

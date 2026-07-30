# 范围清单：OpenAPI info 增加 x-generator 标识

- **项目**: MechAssist-Fusion / extern-api
- **版本**: 1.0.0
- **PM 日期**: 2026-07-30
- **状态**: ✅ 范围已冻结

---

## 1. 精确变更清单（文件级 + 改点级）

### 1.1 核心逻辑 — `server/catalog/openapiGenerator.js`

| 改点 | 位置 | 变更内容 | 行号参考 |
|------|------|----------|----------|
| **A1** | `generateOpenApiSpec` 函数内，`info` 对象构造处 | 在已有字段后增加一行 `info['x-generator'] = 'mechassist-openapi'` | 约 245 行 `const info = {...}` 之后 |

**精确上下文**（当前位置）：

```js
const info = {
  title: serviceName,
  version: serviceVersion,
  description: '从 registry LAYERS 自动生成的 OpenAPI 规范'
}
if (generationWarnings.length) {
  info['x-generation-warnings'] = generationWarnings
}
```

**改为**：

```js
const info = {
  title: serviceName,
  version: serviceVersion,
  description: '从 registry LAYERS 自动生成的 OpenAPI 规范'
}
info['x-generator'] = 'mechassist-openapi'
if (generationWarnings.length) {
  info['x-generation-warnings'] = generationWarnings
}
```

**理由**：将 `x-generator` 提升到 `if (generationWarnings...)` 之前，确保无论是否有 warnings 该字段始终存在。

### 1.2 测试 — `server/test/openapi.test.js`

| 改点 | 位置 | 变更内容 | 行号参考 |
|------|------|----------|----------|
| **B1** | `describe('OpenAPI 3.0 structure is valid')` 内 | 新增 `it('info has x-generator field')` 测试用例 | 置于 `has openapi / info / paths` 之后 |
| **B2** | `describe('GET /api/openapi.json returns valid OpenAPI 3.0')` 内 | 新增对 `json.info['x-generator']` 的断言 | 置于 `returns HTTP 200` 之后 |

### 1.3 快照 — `server/test/__snapshots__/openapi.snapshot.json`

| 改点 | 位置 | 变更内容 | 行号参考 |
|------|------|----------|----------|
| **C1** | `info` 对象内，`"description"` 之后 | 新增行 `"x-generator": "mechassist-openapi"` | 第 6 行末尾 |

**操作方式**：运行 `npm run test:server -- --update-snapshots` 自动更新，或手动插入该行。推荐自动更新。

### 1.4 涉及文件汇总

```
M (1) server/catalog/openapiGenerator.js       # 1 行新增
M (2) server/test/openapi.test.js              # 2 条新 it 块
M (3) server/test/__snapshots__/openapi.snapshot.json  # 1 行新增（自动更新）
```

**禁止改动的文件**（白名单验证）：`chatRoutes.js`, `registry.js`, `apiPaths.js`, `index.js`, `openapiRoutes.js`, `openapiController.js` 等任何路由/注册/挂载代码。

---

## 2. 每条变更的影响评估

### A1 — `info['x-generator'] = 'mechassist-openapi'`

| 维度 | 评估 |
|------|------|
| **存量行为影响** | **无**。OpenAPI 规范中 `x-*` 为扩展字段，不改变语义。所有存量解析器/客户端忽略未知 `x-*` 字段。 |
| **响应体变化** | 新增 `info.x-generator` 字段，响应体增大约 40 字节。 |
| **路由/中间件** | 无影响。生成器是纯函数，无副作用。 |
| **消费者兼容性** | 完全向后兼容。 |

### B1、B2 — 新增测试断言

| 维度 | 评估 |
|------|------|
| **存量测试** | 无影响。新 it 块是独立的。 |
| **测试执行顺序** | 无影响。node:test 按 describe 块顺序执行，新 it 插在已有块内。 |
| **快照测试** | 快照会因 `x-generator` 新增而失败，需更新快照。由 C1 解决。 |

### C1 — 快照更新

| 维度 | 评估 |
|------|------|
| **快照匹配** | 快照写入 `x-generator` 字段，与生成器输出对齐。 |
| **未来回滚** | 快照回滚只需删除该行即可。 |
| **CI 影响** | 首次 run 快照失败 → 开发者运行更新命令 → 成功。推荐在本次 PR 中一并更新快照，避免 CI 拦截。 |

---

## 3. 测试计划

### 3.1 新增测试用例

#### 用例 T1：`info has x-generator field`（单元级）

```js
it('info has x-generator field with correct value', () => {
  const spec = buildSpec()
  assert.equal(spec.info['x-generator'], 'mechassist-openapi')
})
```

- **位置**：放在 `describe('OpenAPI 3.0 structure is valid')` 内，紧随 `has openapi / info / paths` 之后。  
- **理由**：这是结构有效性断言的一部分，验证 info 对象的完整性。  
- **覆盖**：spec 对象的 info.x-generator 存在且值精确匹配。

#### 用例 T2：`GET /api/openapi.json returns x-generator`（集成级）

```js
it('response info.x-generator is mechassist-openapi', async () => {
  const app = express()
  app.use('/api', openapiRoutes)
  const { status, json } = await request(app, '/api/openapi.json')
  assert.equal(status, 200)
  assert.equal(json.info['x-generator'], 'mechassist-openapi')
})
```

- **位置**：放在 `describe('GET /api/openapi.json returns valid OpenAPI 3.0')` 内，紧随 `returns HTTP 200` 之后。  
- **理由**：端到端验证路由响应中包含该字段。  
- **覆盖**：路由挂载、JSON 序列化、info 字段传递的完整性。

### 3.2 存量测试不受影响清单

以下存量测试**无需**修改，验证不受影响：

| 测试 | 理由 |
|------|------|
| `has openapi / info / paths` | 仍然通过，info 对象仍然存在且含 title/version |
| `every API_PATHS value appears in paths` | paths 构造逻辑未改 |
| `returns HTTP 200 with openapi 3.0.3` | 路由逻辑未改 |
| `AUTH_REGISTER post is public` | paths 内容未改 |
| `AUTH_ME get requires bearerAuth` | 同 |
| `CHAT_CONVERSATION_BY_ID merges get/delete` | 同 |
| `RELEASE_MANIFEST get maps probe` | 同 |
| `VOICE_TTS inferred post` | 同 |
| `V2_ROOT is marked x-discovery` | 同 |
| `writes snapshot on first run, then compares` | **快照需更新**（C1） |

### 3.3 快照更新策略

| 步骤 | 操作 |
|------|------|
| 1 | 完成 openapiGenerator.js 和 openapi.test.js 的改动 |
| 2 | 运行 `npm run test:server -- --update-snapshots` |
| 3 | 确认快照文件已更新，`x-generator` 出现在 info 内 |
| 4 | 运行完整测试套件，确认无新增失败 |
| 5 | 验证 `git diff __snapshots__/openapi.snapshot.json` 仅包含 `x-generator` 行 |

---

## 4. 风险点与回滚方案

### R1：快照测试在 CI 中失败

| 项目 | 内容 |
|------|------|
| **触发条件** | 快照未更新就提 PR |
| **概率** | 中（如果开发者只测了单条用例，未跑完整套件） |
| **缓解** | 本 PM 文档显式要求跑 `--update-snapshots`；CI 配置中可写 npm script 链式 |
| **回滚** | 删除 `__snapshots__/openapi.snapshot.json` 中新增的 `x-generator` 行，或运行 `git checkout` 该文件 |

### R2：误改禁止文件

| 项目 | 内容 |
|------|------|
| **触发条件** | 开发者在实施中改了 `chatRoutes.js`, `registry.js`, `apiPaths.js`, `index.js` |
| **概率** | 低（本范围明确禁止） |
| **缓解** | PR review 时检查 `git diff --stat`；本 PM 文档作为 review checklist 依据 |
| **回滚** | `git checkout -- <误改文件>` |

### R3：`x-generator` 值拼写错误

| 项目 | 内容 |
|------|------|
| **触发条件** | 常量值写错，如 `'mechassist-open'`（漏了 `api`） |
| **概率** | 低（测试 T1 会捕获） |
| **缓解** | 测试 T1 断言精确字符串 `'mechassist-openapi'` |
| **回滚** | 修正字符并重跑测试 |

### R4：silly mistake — info 对象构造时覆盖已有字段

| 项目 | 内容 |
|------|------|
| **触发条件** | 误写 `info.x-generator` 导致覆盖了 `info` 对象引用 |
| **概率** | 极低（建议写法为 `info['x-generator']`，不会覆盖） |
| **缓解** | 存量测试 `has openapi / info / paths` 会验证 info 完整性 |
| **回滚** | git checkout openapiGenerator.js |

### 安全网

```
# 回滚完整操作（如果需要）
git checkout -- server/catalog/openapiGenerator.js
git checkout -- server/test/openapi.test.js
git checkout -- server/test/__snapshots__/openapi.snapshot.json
git diff --stat   # 确认无改动
```

---

## 5. 工作分解（建议的 Commit 顺序）

### Commit 1/3 — 核心逻辑

```
chore(openapi): add x-generator marker to info object
```

**改动**：`server/catalog/openapiGenerator.js`

```diff
 const info = {
   title: serviceName,
   version: serviceVersion,
   description: '从 registry LAYERS 自动生成的 OpenAPI 规范'
 }
+info['x-generator'] = 'mechassist-openapi'
 if (generationWarnings.length) {
```

**验证**：`node -e "import('./server/catalog/openapiGenerator.js')"`（至少确认 import 不报错）

### Commit 2/3 — 测试与快照

```
test(openapi): assert info.x-generator field; update snapshot
```

**改动**：
- `server/test/openapi.test.js`（2 条新 it 块）
- `server/test/__snapshots__/openapi.snapshot.json`（自动更新）

**验证**：

```bash
cd D:\trae_git\MechAssist-Fusion\extern-api
npm run test:server -- --update-snapshots
# 确认输出：全部 passed，包括快照测试
```

### Commit 3/3 — 最终验证

```
chore: final verification — git status subset check
```

**无代码改动**，仅 `git status` 确认改动文件 ⊆ 白名单：

```bash
git status --short
# 输出应仅为：
#  M server/catalog/openapiGenerator.js
#  M server/test/openapi.test.js
#  M server/test/__snapshots__/openapi.snapshot.json
```

---

## 附录 A：验收条件对照表

| # | 验收条件 | 验证方式 | 对应改点 |
|---|----------|----------|----------|
| ① | `GET /api/openapi.json` → 200 + openapi=3.0.3 + info.x-generator === "mechassist-openapi" | 集成测试 B2；手动 curl 验证 | A1 + B2 |
| ② | 相关测试通过；存量测试不新增失败 | `npm run test:server` 全部 passed | B1 + B2 + C1 |
| ③ | `git status` 改动面 ⊆ 允许文件 | Commit 3/3 的 `git status` 检查 | A1 + B1 + B2 + C1 |

## 附录 B：实施后最终 `info` 对象形态

```json
{
  "title": "MechAssist AI Extern API",
  "version": "1.0.0",
  "description": "从 registry LAYERS 自动生成的 OpenAPI 规范",
  "x-generator": "mechassist-openapi"
}
```

当有 generationWarnings 时追加 `"x-generation-warnings": [...]`。

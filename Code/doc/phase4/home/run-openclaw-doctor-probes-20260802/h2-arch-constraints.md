# 架构约束与执行计划（H2 — Architect）

**项目**：openclaw-doctor-probes  
**阶段**：H2（架构合规复核）  
**日期**：2026-08-02  
**产出者**：Architect（agent=arch）  
**上一跳**：H1 PM 范围清单（`h1-pm.scope-checklist.md`）  
**业务仓**：MechAssist-Fusion（分支 feature/Home_window）  
**run_dir**：`Code/doc/phase4/home/run-openclaw-doctor-probes-20260802`

---

## 1. 复核结论

H1 范围清单事实经本跳原位复核（只读），**全部确认**：

| 复核项 | H1 结论 | H2 复核 | 状态 |
|--------|---------|---------|------|
| doctor.ps1 无 probe | 仅 openclaw 诊断 + 手动提示 | 源码确认：55 行，末尾提示"手动运行 probe" | 一致 |
| probe-weather 契约 | exit 0=OK, 1=FAIL | 源码确认：wttr.in HTTPS → JSON 解析 → exit 0/1 | 一致 |
| probe-tts 契约 | exit 0=OK, 1=FAIL | 源码确认：:9880 health + /v1/tts → exit 0/1 | 一致 |
| probe-routing 恒 exit 0 | 恒 0，输出含 "exit=2" | 源码确认 L15：`exit 0`；L12-13 调用 invoke-route "在 mac 执行：ping" 后 $LASTEXITCODE 丢弃 | 一致 |
| profile.json capabilities | bm/home 均含 weather/tts/routing | 源码确认：两 profile 的 `capabilities` 数组一致 | 一致 |
| profile.json 额外字段 | weatherBackend/ttsEngine | bm: wttr.in/system-speech；home: mcp-gaode/cosyvoice | doctor 可读来丰富输出 |

---

## 2. doctor.ps1 扩展定稿

### 2.1 `-Profile` 参数语义

```
[ValidateSet("bm","home")][string]$Profile
```

- **单选**，一次只测一个 profile
- 不传 → 跳过整个 probe 段，保持旧行为（向后兼容）
- 不做 `-AllProfiles`（两个 profile 共用同一 probe 脚本根，结果仅 engine 标签差异）

### 2.2 分项表输出格式

```
=== probe summary (profile: bm) ===
weather  PASS   wttr.in: Guangzhou 28°C
tts      PASS   :9880 system-speech
routing  WARN   mac node offline (expected)

Result: 2 PASS, 1 WARN, 0 FAIL — exit 0
```

**规范**：
- 表头蓝底（Cyan），结果行按状态着色（Green PASS / Yellow WARN / Red FAIL）
- 每行列宽对齐：`{label,-10} {status,-6} {detail}`
- detail 列从 profile.json 读取（`weatherBackend`、`ttsEngine`）或从 probe 输出解析

### 2.3 PASS/WARN/FAIL 判定矩阵

| 能力 | PASS 条件 | WARN 条件 | FAIL 条件 |
|------|----------|----------|----------|
| weather | probe exit 0 | — | probe exit ≠ 0 |
| tts | probe exit 0 | — | probe exit ≠ 0 |
| routing | exit 0且输出无"节点离线"/"exit=2" | exit 0且输出含"节点离线"或"exit=2" | exit ≠ 0（Test-OpenClawRoute 失败） |

**routing 判定逻辑（伪代码）**：

```powershell
$routingOut = & ..\routing\probe-routing.ps1 2>&1 | Out-String
$routingCode = $LASTEXITCODE
if ($routingCode -ne 0) { $routingStatus = "FAIL" }
elseif ($routingOut -match "节点离线|exit=2.*offline") { $routingStatus = "WARN" }
else { $routingStatus = "PASS" }
```

**裁定**：保持调用 `probe-routing.ps1`（不改 probe），捕获 `$LASTEXITCODE` + 输出文本双维度判定。不直接调 `invoke-route.ps1`——避免 doctor 耦合 routing 内部实现。

### 2.4 退出码约定

| 场景 | Exit Code |
|------|-----------|
| 全部 PASS | 0 |
| PASS + WARN，无 FAIL | 0（WARN 不计） |
| 任一 FAIL | 1 |

**裁定**[Q2]：仅 FAIL 触发非零退出。WARN 是预期行为（Mac 离线在 bm 环境属正常），不应阻断流水线。

### 2.5 profile.json 缺失降级

```powershell
$profilePath = "..\profiles\$Profile\profile.json"
if (-not (Test-Path $profilePath)) {
  Write-Host "WARN: profile.json not found: $profilePath" -ForegroundColor Yellow
  exit 0  # 不阻断，跳过 probe
}
```

### 2.6 不做项裁定

| 决策项 | 裁定 | 理由 |
|--------|------|------|
| -DryRun | **不做** | doctor 本职就是诊断；probe 已有超时参数，网络失败→FAIL 是合理信号 |
| coding probe | **不加入** | 无独立 probe 脚本（仅 configure + invoke）；coding 对网络/服务无依赖，诊断价值低 |
| 遍历双 profile | **不做** | -Profile 单选；有需要时用户跑两次即可 |

### 2.7 插入位置（修改面）

在 doctor.ps1 末尾 **`Write-Host "Cursor code (V5):"` 段之后**作为最后一段逻辑，结构为：

1. `param()` 块新增 `$Profile` 参数
2. 文件末尾追加 probe 汇总逻辑（`if ($Profile) { ... }`）

---

## 3. 修改面白名单

### P0（强制）

| # | 文件 | 变更 | 行号指引 |
|---|------|------|---------|
| M1 | `scripts/openclaw/common/install/doctor.ps1` | `param()` 块新增 `[ValidateSet("bm","home")][string]$Profile` 参数 | param 块末尾 |
| M2 | 同上 | 文件末尾追加 probe 汇总逻辑（~50 行）：读 profile.json → 跑 probe → 输出表 → exit | 文件末尾（"Cursor code" 段后） |

### P2（推荐）

| # | 文件 | 变更 |
|---|------|------|
| M3 | `scripts/openclaw/common/docs/README.md` | L3 更新 doctor 描述为"version + doctor + gateway status + profile probes" |
| M4 | `scripts/openclaw/README.md` | V1 段补充 "-Profile bm\|home" 用法示例 |

### 显式不做

| 禁止项 | 原因 |
|--------|------|
| 改 probe-weather/tts/routing.ps1 | 独立脚本，契约不变 |
| 改 profile.json / apply-profile.ps1 | 配置逻辑与诊断无关 |
| 改 invoke-route.ps1 / Test-OpenClawRoute.ps1 | 不改 routing 内部 |
| 改 install-windows.ps1 | 仅提示文本，不变 |
| 新增独立脚本文件 | 最小化改动范围 |
| coding probe | 无独立 probe 脚本 |

---

## 4. 红色记录评估

| 维度 | 结论 |
|------|------|
| 模块 | `doctor.ps1` — 运维诊断脚本 |
| 层级 | 运维工具层（非网关/安全/核心业务） |
| ai-code-boundary 判定 | DTO/工具类/简单接口 → **无需红色记录** |
| 最终 | **N/A** |

---

## 5. 验收口径

| 用户验收条件 | 架构映射 | 验收方式（H4） |
|------------|---------|--------------|
| "单命令输出分项表" | M2 输出格式含 weather/tts/routing 三行 PASS/WARN/FAIL | H4：`doctor.ps1 -Profile bm` → 屏幕含 fēn xiàng biǎo |
| "失败非零退出" | 任一 FAIL → exit 1 | H4：停止 :9880 → doctor.ps1 → `$LASTEXITCODE -eq 1` |
| 不传 -Profile 保持旧行为 | `if ($Profile)` 保护 | H4：`doctor.ps1`（无参数）→ 输出与旧版一致 |
| WARN 不触发非零退出 | routing WARN → totalFail=0 → exit 0 | H4：bm 环境（Mac 离线预期）→ exit 0 |

---

## 6. 风险与回滚

| 风险 | 等级 | 缓解 | 回滚 |
|------|------|------|------|
| probe 发外部网络请求（wttr.in）→ 网络不可用时误报 FAIL | 低 | probe 脚本自带 TimeoutSec；FAIL 描述含具体原因 | git checkout |
| profile.json 路径错误（doctor 在 common/install/ → 回退两级到 openclaw/） | 低 | Test-Path 前置检查 + WARN 降级 | git checkout + 修正路径 |
| routing 输出格式变化导致 WARN 判定失效 | 低 | 正则匹配两个关键词（"节点离线"+"exit=2"），容错性较高 | 更新正则 |
| doctor 执行时间变长（weather probe 需 25s） | 中 | timeout 已有默认值；用户可用 Ctrl+C 中断 | —— |

---

## 7. H1 开放问题裁定

| # | H1 问题 | H2 裁定 | 理由 |
|---|---------|---------|------|
| Q1 | -Profile 单选 vs 遍历？ | **单选** bm\|home。不传跳过。不做 -AllProfiles | 双 profile 共用 probe 脚本根，结果仅 engine 标签差异；有需要跑两次 |
| Q2 | WARN 是否触发非零退出？ | **不触发**。仅 FAIL → exit 1 | WARN 是预期行为（Mac 离线），不应阻断流水线 |
| Q3 | 是否加 -DryRun？ | **不加** | doctor 本职是诊断；probe 已有超时，网络失败→FAIL 合理 |
| Q4 | routing 恒 exit 0？ | **调用 probe-routing.ps1，双维度判定**（exit code + 输出文本）。不直接调 invoke-route.ps1 | 不改 probe 脚本；输出含 "exit=2"+"节点离线" 可区分 WARN |
| Q5 | coding probe 是否加入？ | **不加入** | 无独立 probe 脚本；coding 对网络/服务无依赖，诊断价值低 |

---

*本文由 Architect 产出，基于 H1 范围清单原位复核、三 probe 源码契约验证与双 profile 结构分析。提交 DevLead（H3）执行 doctor.ps1 修改。*

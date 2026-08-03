# AI代码生成范围清单（H1 — ProductManager）

**项目**：openclaw-doctor-probes  
**短名**：openclaw-doctor-probes  
**阶段**：H1（需求拆解 & 范围界定）  
**日期**：2026-08-02  
**产出者**：ProductManager（agent=pm）  
**业务仓**：MechAssist-Fusion（分支 feature/Home_window）  
**run_dir**：`Code/doc/phase4/home/run-openclaw-doctor-probes-20260802`

---

## 1. 目标

扩展 `doctor.ps1`，在其现有 OpenClaw 基础诊断输出后，按 profile 汇总 weather/tts/routing 三个探测结果，以 PASS/WARN/FAIL 分项表输出。任一 FAIL 时非零退出。

### 成功画像

| 维度 | 标准 |
|------|------|
| 单命令输出分项表 | 执行 `doctor.ps1 [-Profile bm|home]` 后，在基础诊断下方输出 weather/tts/routing 的 PASS/WARN/FAIL 汇总表 |
| 失败非零退出 | 至少一个 probe 结果为 FAIL 时，`$LASTEXITCODE` 非零 |
| 向后兼容 | 不传 `-Profile` 时跳过 probe 汇总，行为与旧版一致 |
| 不改 probe 脚本 | doctor.ps1 调用现有 probe 脚本，不改 probe 内部逻辑 |

---

## 2. 范围条目

### 2.1 原位探查结论

#### doctor.ps1 现状

- `$ErrorActionPreference = "Continue"` — 不会因子命令失败而中断
- 执行流程：`openclaw --version` → `openclaw doctor` → `openclaw gateway status` → 打印帮助提示
- **不调用任何 probe 脚本**
- **无 PASS/WARN/FAIL 输出**
- **退出码恒为 0**（或 openclaw 自身退出码）
- 末尾提示文字建议用户"手动运行" probe 脚本

#### 三个 probe 脚本契约

| 脚本 | 参数 | 依赖 | 退出码 | 输出格式 |
|------|------|------|--------|---------|
| `weather/probe-weather.ps1` | `-City`（默认 Guangzhou）、`-TimeoutSec` | wttr.in HTTPS | 0 = OK, 1 = FAIL | 文本，失败含 `FAIL:` 行 |
| `tts/probe-tts.ps1` | `-BaseUrl`（默认 :9880）、`-Text`、`-ApiKey` | :9880 HTTP | 0 = OK, 1 = FAIL | 文本，失败含 `FAIL:` 行 |
| `routing/probe-routing.ps1` | 无参数 | `Test-OpenClawRoute.ps1` + `invoke-route.ps1` | **恒 0**（Mac 离线时也 exit 0——预期行为） | 文本 |

**关键发现**：`probe-routing.ps1` 退出码恒 0，无法单靠 `$LASTEXITCODE` 判断 PASS/FAIL。需解析输出内容（"节点离线"、"exit=2"等）或直接调 `invoke-route.ps1` 并检查其退出码。

#### Profile 结构

| Profile | weatherBackend | ttsEngine | capabilities |
|---------|---------------|-----------|-------------|
| `bm` | wttr.in | system-speech | weather, tts, routing, coding, model-switch |
| `home` | mcp-gaode | cosyvoice | 同上 |

`apply-profile.ps1` 通过 `$meta.capabilities` 数组决定启用哪些能力。doctor 应复用此逻辑——读取 profile 结构来确定跑哪些 probe。

#### Doctor 调用方

| 位置 | 引用方式 | 影响 |
|------|---------|------|
| `install/install-windows.ps1` L28 | `Write-Host "Optional: openclaw doctor"` 提示 | 不解析输出，不改 |
| `README.md` L14 | 目录结构标注 `install/ ← V1 安装 / doctor` | 不改 |
| `common/docs/README.md` L3 | `install/doctor.ps1 | version + doctor + gateway status` | **需更新描述**（P2） |
| `profiles/README.md` | 引用 `doctor.ps1` | **需更新**（P2） |

无其他脚本程序化调用 doctor，改动安全。

### 2.2 修改条目（P0）

| # | 文件 | 修改动作 | 核验方式 |
|---|------|---------|---------|
| M1 | `scripts/openclaw/common/install/doctor.ps1` | ① 新增 `-Profile` 参数（`[ValidateSet("bm","home")][string]$Profile`），可选（不传则跳过 probe，保持原行为）；② 保留现有前段输出不变；③ 末尾新增 probe 汇总段：读取 `profiles/<profile>/profile.json` 的 `capabilities`，对 weather/tts/routing 依次调用 `..\<area>\probe-<area>.ps1`，捕获 `$LASTEXITCODE`；④ 输出 PASS/WARN/FAIL 汇总表；⑤ 任一 FAIL → exit 1 | 手跑 `doctor.ps1 -Profile bm`，观察输出 |
| M2 | 同上 | 定义 PASS/WARN/FAIL 判定：PASS = probe exit 0；FAIL = probe exit ≠ 0；WARN = routing probe 恒 exit 0 → 解析输出含"节点离线"/"exit=2"判定 | 单测/实测验证 |

### 2.3 建议输出格式

```
=== probe summary (profile: bm) ===
weather  PASS   wttr.in: Guangzhou 28°C
tts      PASS   :9880 system-speech
routing  WARN   mac node offline (expected)

Result: 2 PASS, 1 WARN, 0 FAIL
```

### 2.4 退出码约定（提交 H2 决策）

| 方案 | 行为 | 建议 |
|------|------|------|
| A | 任一 FAIL → exit 1，全部 PASS/WARN → exit 0 | **推荐**（用户要求"失败非零退出"） |
| B | 全部 fail → exit 1，部分 fail → exit 2 | 更细粒度，但过度设计 |

### 2.5 修改条目（P2）

| # | 文件 | 修改动作 |
|---|------|---------|
| M3 | `common/docs/README.md` L3 | 更新 doctor.ps1 说明："version + doctor + gateway status + profile probes" |
| M4 | `scripts/openclaw/README.md` | V1 段补充 "-Profile bm|home" 用法 |

### 2.6 不修改（显式不做）

| 文件 / 动作 | 原因 |
|------------|------|
| `weather/probe-weather.ps1` | 独立脚本，契约不变 |
| `tts/probe-tts.ps1` | 同上 |
| `routing/probe-routing.ps1` | 同上（退出码恒 0 是其自身设计） |
| `apply-profile.ps1` | 配置写入脚本，与诊断无关 |
| `install/install-windows.ps1` | 仅提示文本 |
| 新增独立脚本 | 范围最小化，仅扩展 doctor.ps1 |
| git push / npm install | 禁止 |

---

## 3. 验收口径

| 用户验收条件 | Given-When-Then | 条目 |
|------------|-----------------|------|
| "单命令输出分项表" | Given `doctor.ps1 -Profile bm`，When 执行，Then 在基础诊断下方输出 weather/tts/routing 三行 PASS/WARN/FAIL 表 | M1 |
| "失败非零退出" | Given TTS probe 失败（:9880 未启动），When `doctor.ps1 -Profile bm`，Then exit 1 | M1, M2 |
| 不传 Profile 保持原行为 | Given `doctor.ps1` 无参数，When 执行，Then 输出与旧版一致，不跑 probe | M1 |
| 向后兼容调用方 | Given install-windows.ps1 提示 "Optional: openclaw doctor"，When 执行，Then 行为不变 | 不改 install |

---

## 4. 风险与回滚

| 风险 | 缓解 |
|------|------|
| probe 脚本发外部网络请求（wttr.in），网络不可用时误报 FAIL | H2 考虑加超时参数或 network probe 前置检查 |
| routing probe 恒 exit 0 → 误判为 PASS | 解析输出字符串作为 WARN 判定（见 M2），H2 确认是否接受 |
| profile.json 缺失或格式变化导致 doctor 崩溃 | 检查 `Test-Path`，不存在则跳过 probe 段并输出 WARN |

回滚：git checkout doctor.ps1 即可。

---

## 5. 开放问题（提交 H2）

1. **"按 profile 汇总"语义**：`-Profile bm|home` 指定单个 profile 逐一跑？还是 `-AllProfiles` 遍历 bm+home？建议默认传 `-Profile` 参数，不传则跳过（兼容旧行为）。
2. **WARN 与 FAIL 退出码区分**：全部 PASS/WARN → exit 0；任一 FAIL → exit 1（方案 A）。还是 WARN 也算非零？建议仅 FAIL 触发非零。
3. **是否调真实 probe（外部 API 依赖）**：各 probe 脚本本身会发外部请求（wttr.in），doctor 仅做编排调用。H2 确认是否需加 `-DryRun` 参数做纯结构探测。
4. **routing probe 恒 exit 0 问题**：是否在 doctor 内直接调用 `invoke-route.ps1` 而非 `probe-routing.ps1` 来捕获真实退出码？还是保持调 probe 脚本、解析输出判定？
5. **是否需要测 coding（V5）probe**？当前三个 probe 是 weather/tts/routing。coding 无独立 probe 脚本（只有 configure-cursor-code.ps1）。是否新增 coding probe？

---

*本清单由 ProductManager 产出，提交架构师（H2）复核。*

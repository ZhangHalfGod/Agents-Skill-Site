[h3-run-wrapper] WorkDir=E:\zhangchangWork\Work_Space\Trae_Study\MechAssist-Fusion node=C:\Users\Administrator\AppData\Local\cursor-agent\versions\2026.07.23-e383d2b\node.exe
H3 已落地：`doctor.ps1` 增加 `-Profile` 与 probe 汇总；两处 README 已同步。实测 `bm`：weather PASS / tts FAIL / routing WARN → exit 1。

## 改动说明

### M1+M2 `scripts/openclaw/common/install/doctor.ps1`
- 顶部新增 `param([ValidateSet('bm','home')][string]$Profile)`
- Cursor V5 提示段后追加 `# --- probe summary (per profile) ---`：读 `profiles\<Profile>\profile.json`，按 capabilities 调用 weather/tts/routing probe，输出着色分项表；`$totalFail -gt 0` → `exit 1`
- UTF-8 BOM 已保留（`EF BB BF`）
- 路径一律 `$PSScriptRoot` 推导，无绝对路径硬编码

### M3 `scripts/openclaw/common/docs/README.md`
- doctor 行改为：`version + doctor + gateway status + profile probes（`-Profile bm|home` 可选）`

### M4 `scripts/openclaw/README.md`
- BM 快速开始增加：`.\install\doctor.ps1 -Profile bm`

### 关键逻辑（probe 汇总）

```72:138:scripts/openclaw/common/install/doctor.ps1
# --- probe summary (per profile) ---
if ($Profile) {
  $root = Join-Path $PSScriptRoot '..\..'          # scripts/openclaw/
  ...
  # weather / tts：$LASTEXITCODE 立即捕获；routing：exit≠0→FAIL，节点离线|exit=2→WARN，否则 PASS
  ...
  if ($totalFail -gt 0) { exit 1 }
}
```

### 自检
| 项 | 结果 |
|---|---|
| ① 无硬编码绝对路径 | PASS（`$PSScriptRoot` + `Join-Path`） |
| ② `$LASTEXITCODE` 立即捕获 | PASS（weather/tts/routing 各一次） |
| ③ FAIL→exit 1 | PASS（实测 tts FAIL → `EXIT=1`） |
| ④ 无 `-Profile` 不跑 probe 段 | PASS（整段包在 `if ($Profile)`） |

### 实测摘要（`doctor.ps1 -Profile bm`）
```
=== probe summary (profile: bm) ===
weather    PASS   wttr.in: 
tts        FAIL   
routing    WARN   mac node offline (expected)
Result: 1 PASS, 1 WARN, 1 FAIL
EXIT=1
```
备注：本机 `probe-weather.ps1` 出现既有 ParserError（中文编码，**未改 probe**）；`$LASTEXITCODE` 未置非零导致 weather 记为 PASS 且温度行为空——属 probe 契约侧现象，不在本次白名单。tts FAIL 因 :9880 health OK 但 TTS 500（未起完整 TTS，符合「不起 TTS」约束）。routing WARN 符合 bm 无 Mac 预期。

未改 probe 脚本；未 commit/push；未 npm install。

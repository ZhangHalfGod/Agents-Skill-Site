[h3-run-wrapper] WorkDir=E:\zhangchangWork\Work_Space\Trae_Study\MechAssist-Fusion node=C:\Users\Administrator\AppData\Local\cursor-agent\versions\2026.07.23-e383d2b\node.exe
## H3a 交付：workdir-whitelist（业务仓）

在 `Test-Path` 存在性检查之后、`$agentCmd` 赋值之前插入 WorkDir 白名单；同步 SKILL；P1 因 `configure-cursor-code.ps1` 会嵌入/覆盖 SKILL 模板，已一并加白名单说明。

### 改了什么

| 文件 | 变更 |
|------|------|
| `scripts/openclaw/common/coding/invoke-cursor-agent.ps1` | L22–L42：白名单校验（6 仓 + `WORKDIR_WHITELIST`）；路径用单引号字符串（原片段无引号在 PS 中不安全） |
| `scripts/openclaw/common/skills/code-via-cursor-cli/SKILL.md` | `## Rules` 下新增 `### WorkDir 白名单` |
| `scripts/openclaw/common/coding/configure-cursor-code.ps1` | 嵌入 `$skillMd` 的 Rules 同步白名单小节 |

### 自检（红色记录五项）

1. **6 仓路径**：与需求一致（MechAssist-Fusion / Agents-Skill-Site / MCP_Gaode_Map / Life-Coach-AI / AI_People_System / openclaw_trae_cursor）
2. **精确比较**：`$wd -notin $normalized`，两侧均 `GetFullPath`
3. **FAIL 文案 + exit 1**：`FAIL: 工作目录不在白名单中: $WorkDir`
4. **FAIL 后不启动 agent**：插入点在 `$agentCmd` / `Resolve-ChatId` / `Start-Process` 之前；拒测仅输出 FAIL，无 `RUN agent=`
5. **环境变量追加**：`;` 分割 → Trim → 非空且 `Test-Path` 后 `+=`

**运行证据**：白名单外 TEMP 目录 → `DENY_EXIT=1`；白名单内本仓 → 未命中白名单拒绝并进入 agent（自检 TimeoutSec=5 超时属预期，证明已过白名单）。

### P1 结论

**已同步**。`configure-cursor-code.ps1` 会生成并写回 workspace/仓内 `SKILL.md`，含 WorkDir 用法；不同步会导致下次 configure 覆盖掉 M3 说明。

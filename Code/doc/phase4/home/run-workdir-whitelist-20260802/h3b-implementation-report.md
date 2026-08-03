[h3-run-wrapper] WorkDir=E:\zhangchangWork\Work_Space\Trae_Study\Agents-Skill-Site node=C:\Users\Administrator\AppData\Local\cursor-agent\versions\2026.07.23-e383d2b\node.exe
## H3b 交付：workdir-whitelist（编排仓 M2）

已在编排侧 `Code/orchestration/openclaw/invoke-cursor-agent.ps1` 加入与业务仓副本一致的 WorkDir 白名单校验。**仅改此文件**；未 commit/push。

**插入位置**：`Test-Path` 存在性检查之后、Goal 读文件 / `.env` 加载之前（约 L26–L45）。因本副本参数区原先无归一化，白名单块开头补了 `$WorkDir = [IO.Path]::GetFullPath($WorkDir)`。路径字符串加引号，与业务仓 `MechAssist-Fusion/.../invoke-cursor-agent.ps1` 一致；文件保留 UTF-8 BOM（`EF-BB-BF`）。

**自检（红色记录五项）**
1. 白名单 6 仓路径与业务仓一致  
2. 比较前对 `$WorkDir` / roots 做 `GetFullPath`  
3. 使用 `-notin` 精确全路径比较  
4. 非法路径输出 `FAIL: 工作目录不在白名单中: ...` 并 `exit 1`  
5. 拒绝冒烟：`WorkDir=E:\...\Trae_Study` → 立即 FAIL、`EXIT=1`，未进入 `.env` / `cursor-agent`；白名单内路径逻辑 `ALLOW`

# 07 — M0 run-dir 门禁（飞书 presentation 交互卡）

> **文档级别**：四期流程  
> **日期**：2026-07-31  
> **依赖**：OpenClaw Feishu 插件支持 Message Presentation（buttons → 飞书交互卡）  
> **配置**：[`../../Code/orchestration/openclaw/run-dir-presets.yaml`](../../Code/orchestration/openclaw/run-dir-presets.yaml)

---

## 1. 目标

【新项目需求】进入后**先确认痕迹目录（run-dir）**，再开 H1。  
用飞书 **presentation 按钮卡**（富文本/交互卡），不依赖 cron。

## 2. 流程

```text
【新项目需求】[+ 可选 run_dir=...]
  ├─ 首条已含合法 run_dir= → 跳过 M0，直接 H1
  └─ 否则 → 发 M0 卡片 → 等用户：
        · 点按钮 run_dir_choice=default | preset:<id>
        · 或回复 run_dir=<绝对路径> / 「默认」
     → resolve-run-dir.cjs 校验白名单 → mkdir → 进入 H1
```

M0 **结束本回合**（与 M2 同纪律），等下一轮用户消息。

## 3. 脚本

| 脚本 | 作用 |
|------|------|
| `build-run-dir-card.cjs` | 生成 presentation JSON；`--send --target oc_…` 直发飞书 |
| `resolve-run-dir.cjs` | 解析按钮/文本 → 绝对路径；`--mkdir` 建目录 |

```bash
# 预览卡片 JSON
node Code/orchestration/openclaw/build-run-dir-card.cjs --shortname demo --print

# 解析默认路径
node Code/orchestration/openclaw/resolve-run-dir.cjs --shortname demo --choice default --mkdir
```

## 4. 预设策略（2026-08-03）

- **卡片按钮**：暂时只开放 `phase4`（`Code/doc/phase4/run-<短名>-<日期>`）  
- **已去掉** `MechAssist doc` 等其它根目录按钮；需要时再作为扩展加回 `presets`  
- **业务仓痕迹**：首条内嵌或另发 `run_dir=<绝对路径>`（须在 `allowRoots` 下，如 `D:\trae_git\AI_Virtual_Glasses\docs\pipeline\...`）

## 5. 安全

- 最终路径必须在 `run-dir-presets.yaml` 的 `allowRoots` 下  
- 禁止 `..`  
- Token / 密钥不得写入 run-dir 文件名或卡片

## 6. 与「真·文件选择器」

飞书**不能**打开本机资源管理器；自定义路径仍靠粘贴 `run_dir=`。  
按钮解决的是**预设一键**，不是任意浏览磁盘。

# 03 — 命令与确认（归档）

实机与选型已齐；日常只需按 ADR-001 开发。

## 已确认

| 项 | 值 |
|----|-----|
| node | v22.2.1 |
| 公网 IP | 8.163.18.183（无域名） |
| 本机 Node | 127.0.0.1:3001 / 3002 / 3003 |
| 技术栈 | **VitePress（ADR-001）** |
| 本站 | `/agents-skill/` → 3010 或 dist alias |

## 可选（mcp 名↔端口）

```bash
pm2 jlist | python3 -c "import json,sys
for a in json.load(sys.stdin):
 e=a.get('pm2_env',{}); print(a.get('name'),'PORT=',e.get('PORT') or e.get('port'),'cwd=',e.get('pm_cwd'))"
```

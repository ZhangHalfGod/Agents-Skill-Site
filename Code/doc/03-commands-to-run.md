# 03 — 请在服务器执行的命令（精简版）

> 公网 IP、Node 版本、3001–3003 已由实机截图确认。以下仅**可选**（映射 mcp 名↔端口）。

## 可选

```bash
pm2 jlist | python3 -c "import json,sys
for a in json.load(sys.stdin):
 e=a.get('pm2_env',{}); print(a.get('name'),'PORT=',e.get('PORT') or e.get('port'),'cwd=',e.get('pm_cwd'))"
ss -lntp | grep 3010 || echo "3010 free"
```

## 已确认（无需再跑）

| 项 | 值 |
|----|-----|
| node | v22.2.1 |
| 公网 IP | 8.163.18.183（无域名） |
| 本机 Node | 127.0.0.1:3001 / 3002 / 3003 |
| Nginx | :80 |
| 本站建议 | 127.0.0.1:3010 + `/agents-skill/` |

## 请口头确认

1. **选 A（VitePress）**？  
2. 采用 `http://8.163.18.183/agents-skill/` → `127.0.0.1:3010`？  
3. 部署目录 `/var/www/agents-skill-site` + PM2 名 `agents-skill-site` OK？  

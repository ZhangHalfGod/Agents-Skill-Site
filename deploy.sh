#!/usr/bin/env bash
# 在 ECS 上：/var/www/agents-skill-site/deploy.sh
# 用法：bash deploy.sh
# 方案 B：Nginx 直接 alias 构建目录，无需 ln -sfn dist
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
CODE="$ROOT/Code/code"
DIST="$CODE/docs/.vitepress/dist"

cd "$ROOT"
git pull origin main

cd "$CODE"
npm ci
npm run build

test -f "$DIST/index.html"
echo "OK → 部署完成，访问 http://<PUBLIC_HOST>/agents-skill/"
echo "Nginx alias → $DIST/"
echo "验收请带 Host：curl -H 'Host: <PUBLIC_HOST>' http://127.0.0.1/agents-skill/"
ls -la "$DIST/index.html"

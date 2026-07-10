#!/usr/bin/env bash
# 在 ECS 上：/var/www/agents-skill-site/deploy.sh
# 用法：bash deploy.sh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
CODE="$ROOT/Code/code"

cd "$ROOT"
git pull origin main

cd "$CODE"
npm ci
SKIP_SYNC=1 npm run build

ln -sfn "$CODE/docs/.vitepress/dist" "$ROOT/dist"
echo "OK → http://8.163.18.183/agents-skill/"
ls -la "$ROOT/dist/index.html"

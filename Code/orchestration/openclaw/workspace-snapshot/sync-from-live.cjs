#!/usr/bin/env node
/**
 * sync-from-live.cjs — 从本机 ~/.openclaw/workspace 拉取可共享文件到仓库快照（脱敏）
 *
 *   node sync-from-live.cjs --machine bm
 *   node sync-from-live.cjs --machine home --src "C:\\Users\\...\\.openclaw\\workspace"
 *
 * 排除：memory/、*.bak*、tmp/、.git、*.json（含 state）
 * 脱敏：folder_token = <id> → REPLACE_WITH_FEISHU_FOLDER_TOKEN
 */
'use strict';

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const out = { machine: 'bm', src: '' };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--machine') out.machine = argv[++i] || 'bm';
    else if (argv[i] === '--src') out.src = argv[++i] || '';
  }
  return out;
}

function redact(text) {
  return text
    .replace(/folder_token\s*=\s*[A-Za-z0-9_-]{8,}/g, 'folder_token = REPLACE_WITH_FEISHU_FOLDER_TOKEN')
    .replace(/\bMOLOf[A-Za-z0-9_-]+\b/g, 'REPLACE_WITH_FEISHU_FOLDER_TOKEN');
}

function copyFileRedacted(from, to) {
  const raw = fs.readFileSync(from, 'utf8');
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.writeFileSync(to, redact(raw), 'utf8');
}

function main() {
  const args = parseArgs(process.argv);
  const home = process.env.USERPROFILE || process.env.HOME || '';
  const src = args.src || path.join(home, '.openclaw', 'workspace');
  const dst = path.join(__dirname, args.machine);

  if (!fs.existsSync(src)) {
    console.error('source workspace missing: ' + src);
    process.exit(2);
  }

  const rootFiles = [
    'SOUL.md',
    'AGENTS.md',
    'TOOLS.md',
    'USER.md',
    'IDENTITY.md',
    'HEARTBEAT.md',
  ];

  fs.mkdirSync(dst, { recursive: true });
  for (const f of rootFiles) {
    const p = path.join(src, f);
    if (!fs.existsSync(p)) {
      console.warn('skip missing ' + f);
      continue;
    }
    copyFileRedacted(p, path.join(dst, f));
    console.log('ok ' + f);
  }

  const skillsSrc = path.join(src, 'skills');
  if (fs.existsSync(skillsSrc)) {
    for (const ent of fs.readdirSync(skillsSrc, { withFileTypes: true })) {
      if (!ent.isDirectory()) continue;
      const skillMd = path.join(skillsSrc, ent.name, 'SKILL.md');
      if (!fs.existsSync(skillMd)) continue;
      copyFileRedacted(skillMd, path.join(dst, 'skills', ent.name, 'SKILL.md'));
      console.log('ok skills/' + ent.name + '/SKILL.md');
    }
  }

  const soul = fs.readFileSync(path.join(dst, 'SOUL.md'), 'utf8');
  if (/folder_token\s*=\s*(?!REPLACE_WITH_FEISHU_FOLDER_TOKEN)[A-Za-z0-9_-]{8,}/.test(soul)) {
    console.error('REFUSE: SOUL.md still contains a non-placeholder folder_token');
    process.exit(3);
  }
  console.log('done → ' + dst);
}

main();

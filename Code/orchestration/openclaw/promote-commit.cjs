#!/usr/bin/env node
/**
 * promote-commit.cjs — 飞书升格流水线专用：本机 commit develop，永不 push
 *
 * 用法:
 *   node promote-commit.cjs --cards id1,id2
 *   node promote-commit.cjs --dry-run --cards id1
 *
 * 成功 stdout 含: commit=<hash>
 * 失败非零退出 + stderr 说明
 */
'use strict';

const { execFileSync } = require('child_process');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..');

const ALLOW_PREFIXES = [
  'Code/code/docs/',
  'Code/code/scripts/',
  'Code/doc/phase4/',
  'Code/orchestration/',
  'Doc/CHANGELOG.md',
  'Doc/phase4/',
  'Doc/SYSTEM-DIRECTION.md',
];

function parseArgs(argv) {
  const out = { cards: [], dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--dry-run') out.dryRun = true;
    else if (a === '--cards') {
      const v = argv[++i] || '';
      out.cards = v.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
    } else if (a.startsWith('--cards=')) {
      out.cards = a.slice('--cards='.length).split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
    }
  }
  return out;
}

function git(args, opts = {}) {
  const out = execFileSync('git', args, {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    ...opts,
  });
  // Do not trimStart — porcelain lines may begin with a space status char (e.g. " M path")
  return out.replace(/\s+$/, '');
}

function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

function isAllowed(rel) {
  const p = normalizePath(rel);
  return ALLOW_PREFIXES.some((pref) => p === pref.replace(/\/$/, '') || p.startsWith(pref));
}

function main() {
  const { cards, dryRun } = parseArgs(process.argv);

  let branch;
  try {
    branch = git(['rev-parse', '--abbrev-ref', 'HEAD']);
  } catch (e) {
    console.error('promote-commit: not a git repo or git missing');
    process.exit(2);
  }
  if (branch !== 'develop') {
    console.error(`promote-commit: must be on develop (current: ${branch})`);
    process.exit(2);
  }

  let status;
  try {
    status = git(['status', '--porcelain']);
  } catch (e) {
    console.error('promote-commit: git status failed', e.stderr || e.message);
    process.exit(2);
  }

  if (!status) {
    console.error('promote-commit: nothing to commit (working tree clean)');
    process.exit(2);
  }

  const lines = status.split(/\r?\n/).filter(Boolean);
  const toAdd = [];
  const blocked = [];

  for (const line of lines) {
    // porcelain v1: two status chars, space, then path (rename: "old -> new")
    const m = line.match(/^(.{2}) (.*)$/);
    if (!m) continue;
    let rel = m[2];
    if (rel.startsWith('"') && rel.endsWith('"')) {
      rel = rel.slice(1, -1).replace(/\\([\\"ntr])/g, (_, c) => ({ '\\': '\\', '"': '"', n: '\n', t: '\t', r: '\r' }[c] || c));
    }
    if (rel.includes(' -> ')) rel = rel.split(' -> ').pop();
    rel = normalizePath(rel);
    if (isAllowed(rel)) toAdd.push(rel);
    else blocked.push(rel);
  }

  if (!toAdd.length) {
    console.error('promote-commit: no allowed paths to commit');
    if (blocked.length) {
      console.error('dirty outside allowlist (left unstaged):\n' + blocked.map((p) => '  ' + p).join('\n'));
    }
    process.exit(2);
  }

  if (blocked.length) {
    console.error('promote-commit: note — leaving unstaged (not in allowlist):');
    console.error(blocked.map((p) => '  ' + p).join('\n'));
  }

  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const cardLine = cards.length ? cards.join(', ') : '(see actions.md)';
  const message = [
    `chore(lessons): feishu-promote ${today}`,
    '',
    `Cards: ${cardLine}`,
    '',
    'Feishu-authorized promote; no push.',
  ].join('\n');

  if (dryRun) {
    console.log('dry-run: would add:');
    toAdd.forEach((p) => console.log('  ' + p));
    console.log('message:\n' + message);
    process.exit(0);
  }

  try {
    git(['add', '--', ...toAdd]);
    git(['commit', '-m', message]);
  } catch (e) {
    console.error('promote-commit: git add/commit failed');
    console.error(String(e.stderr || e.message || e));
    process.exit(2);
  }

  const hash = git(['rev-parse', 'HEAD']);
  console.log(`commit=${hash}`);
  console.log('branch=develop');
  console.log('push=skipped (forbidden by promote pipeline)');
  console.log(`files=${toAdd.length}`);
}

main();

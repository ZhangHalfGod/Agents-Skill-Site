#!/usr/bin/env node
/**
 * register-h3-watch.cjs — H3 启动时登记看门狗（供 poll-h3-watch.cjs 每 2 分钟扫描）
 *
 *   node register-h3-watch.cjs --run-dir <run-dir> --work-dir <path> [--repo-root <path>]
 *   node register-h3-watch.cjs --discover [--max-age-hours 72]
 *   node register-h3-watch.cjs --bootstrap   # 仅刷新已有 h3-watch.json（status=watching）
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ORCH = path.resolve(__dirname);
const PRESETS = path.join(ORCH, 'run-dir-presets.yaml');

function parseArgs(argv) {
  const out = {
    runDir: '',
    workDir: '',
    repoRoot: '',
    bootstrap: false,
    rootsFile: PRESETS,
    maxAgeHours: 72,
    discover: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run-dir') out.runDir = path.resolve(argv[++i] || '');
    else if (a === '--work-dir') out.workDir = path.resolve(argv[++i] || '');
    else if (a === '--repo-root') out.repoRoot = path.resolve(argv[++i] || '');
    else if (a === '--bootstrap') out.bootstrap = true;
    else if (a === '--discover') out.discover = true;
    else if (a === '--max-age-hours') out.maxAgeHours = Number(argv[++i]) || 72;
    else if (a === '--roots-file') out.rootsFile = path.resolve(argv[++i] || PRESETS);
  }
  return out;
}

function loadAllowRoots(rootsFile) {
  const roots = [];
  if (!fs.existsSync(rootsFile)) return roots;
  for (const line of fs.readFileSync(rootsFile, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*-\s*["']([^"']+)["']/);
    if (m) roots.push(m[1].replace(/\\\\/g, '\\'));
  }
  return roots;
}

function writeWatch(runDir, workDir, repoRoot) {
  const watchPath = path.join(runDir, 'h3-watch.json');
  let prev = {};
  if (fs.existsSync(watchPath)) {
    try {
      prev = JSON.parse(fs.readFileSync(watchPath, 'utf8'));
    } catch {
      prev = {};
    }
  }
  if (prev.status === 'closed' || prev.h4TriggeredAt) {
    return { watchPath, skipped: true, reason: prev.status === 'closed' ? 'closed' : 'h4_already_triggered', watch: prev };
  }
  const watch = {
    status: 'watching',
    runDir,
    workDir,
    repoRoot: repoRoot || workDir,
    startedAt: prev.startedAt || new Date().toISOString(),
    registeredAt: new Date().toISOString(),
    h4TriggeredAt: prev.h4TriggeredAt || null,
    pollVersion: 1,
  };
  fs.writeFileSync(watchPath, JSON.stringify(watch, null, 2) + '\n', 'utf8');
  return { watchPath, skipped: false, watch };
}

function listExistingWatching(allowRoots) {
  const dirs = [];
  function walk(dir, depth) {
    if (depth > 8) return;
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    const watchPath = path.join(dir, 'h3-watch.json');
    if (fs.existsSync(watchPath)) {
      try {
        const w = JSON.parse(fs.readFileSync(watchPath, 'utf8'));
        if (w.status === 'watching' && !w.h4TriggeredAt) dirs.push(path.resolve(dir));
      } catch {
        /* ignore */
      }
    }
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      if (ent.name === 'node_modules' || ent.name === '.git') continue;
      walk(path.join(dir, ent.name), depth + 1);
    }
  }
  for (const root of allowRoots) {
    if (fs.existsSync(root)) walk(root, 0);
  }
  return [...new Set(dirs)];
}

function discoverRunDirs(allowRoots, maxAgeMs) {
  const found = [];
  const now = Date.now();
  for (const root of allowRoots) {
    if (!fs.existsSync(root)) continue;
    walkDiscover(root, 0, found, now, maxAgeMs);
  }
  return [...new Set(found.map((p) => path.resolve(p)))];
}

function walkDiscover(dir, depth, out, now, maxAgeMs) {
  if (depth > 8) return;
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  const base = path.basename(dir);
  if (/^run-/.test(base)) {
    if (fs.existsSync(path.join(dir, 'h4-closed.json'))) return;
    const hasH3 =
      fs.existsSync(path.join(dir, 'h3-goal.md')) || fs.existsSync(path.join(dir, 'h3-dev.raw.txt'));
    if (!hasH3) return;
    try {
      const st = fs.statSync(dir);
      if (maxAgeMs > 0 && now - st.mtimeMs > maxAgeMs) return;
    } catch {
      return;
    }
    out.push(dir);
    return;
  }
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    if (ent.name === 'node_modules' || ent.name === '.git') continue;
    walkDiscover(path.join(dir, ent.name), depth + 1, out, now, maxAgeMs);
  }
}

function inferWorkDir(runDir) {
  const wrapper = path.join(runDir, 'h3-run-wrapper.ps1');
  if (fs.existsSync(wrapper)) {
    const text = fs.readFileSync(wrapper, 'utf8');
    const m = text.match(/\$workDir\s*=\s*['"]([^'"]+)['"]/);
    if (m) return path.resolve(m[1]);
    const w = text.match(/-WorkDir\s+['"]([^'"]+)['"]/);
    if (w) return path.resolve(w[1]);
    const r = text.match(/\$repoRoot\s*=\s*['"]([^'"]+)['"]/);
    if (r) return path.resolve(r[1]);
  }
  const goal = path.join(runDir, 'h3-goal.md');
  if (fs.existsSync(goal)) {
    const gm = fs.readFileSync(goal, 'utf8').match(/WorkDir[:\s]+([A-Za-z]:\\[^\s\r\n]+)/i);
    if (gm) return path.resolve(gm[1]);
  }
  return runDir;
}

function inferRepoRoot(workDir) {
  if (fs.existsSync(path.join(workDir, '.git'))) return workDir;
  const parent = path.dirname(workDir);
  if (fs.existsSync(path.join(parent, '.git'))) return parent;
  return workDir;
}

function main() {
  const args = parseArgs(process.argv);

  if (args.bootstrap || args.discover) {
    const roots = loadAllowRoots(args.rootsFile);
    const runDirs = args.discover
      ? discoverRunDirs(roots, args.maxAgeHours * 3600 * 1000)
      : listExistingWatching(roots);
    const results = [];
    for (const runDir of runDirs) {
      const workDir = inferWorkDir(runDir);
      const repoRoot = inferRepoRoot(workDir);
      results.push({ runDir, ...writeWatch(runDir, workDir, repoRoot) });
    }
    process.stdout.write(
      JSON.stringify(
        { ok: true, mode: args.discover ? 'discover' : 'bootstrap', count: results.length, results },
        null,
        2,
      ) + '\n',
    );
    return;
  }

  if (!args.runDir) {
    console.error('usage: node register-h3-watch.cjs --run-dir <path> [--work-dir <path>] [--repo-root <path>]');
    console.error('       node register-h3-watch.cjs --discover [--max-age-hours 72]');
    console.error('       node register-h3-watch.cjs --bootstrap');
    process.exit(2);
  }
  const workDir = args.workDir ? path.resolve(args.workDir) : inferWorkDir(args.runDir);
  const repoRoot = args.repoRoot ? path.resolve(args.repoRoot) : inferRepoRoot(workDir);
  const result = writeWatch(args.runDir, workDir, repoRoot);
  process.stdout.write(JSON.stringify({ ok: true, ...result }, null, 2) + '\n');
}

main();

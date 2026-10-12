#!/usr/bin/env node
/**
 * poll-h3-watch.cjs — H3 看门狗：未启动则 auto-start → done 则 trigger H4
 *
 *   node poll-h3-watch.cjs --once [--auto-start-h3] [--trigger-h4] [--quiet]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const ORCH = path.resolve(__dirname);
const CHECK = path.join(ORCH, 'check-h3-done.cjs');
const START_H3 = path.join(ORCH, 'start-h3-from-run-dir.cjs');
const PRESETS = path.join(ORCH, 'run-dir-presets.yaml');
const H4_TEMPLATE = path.join(ORCH, 'templates', 'h4-trigger.message.md');
const ANNOUNCE = path.join(ORCH, 'announce-pipeline-feishu.cjs');
const OPENCLAW_MJS = 'C:/nvm4w/nodejs/node_modules/openclaw/openclaw.mjs';

function announce(runDir, kind) {
  const r = spawnSync(process.execPath, [ANNOUNCE, '--run-dir', runDir, '--kind', kind], {
    encoding: 'utf8',
    windowsHide: true,
  });
  let body = null;
  try {
    body = JSON.parse((r.stdout || '').trim());
  } catch {
    body = { ok: false, raw: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
  }
  return { exitCode: r.status, body };
}

function listClosedNeedingAnnounce(allowRoots) {
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
    const closedPath = path.join(dir, 'h4-closed.json');
    if (fs.existsSync(watchPath) && fs.existsSync(closedPath)) {
      try {
        const w = JSON.parse(fs.readFileSync(watchPath, 'utf8'));
        if (!w.feishuClosedAnnouncedAt) dirs.push(path.resolve(dir));
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
  return dirs;
}

function parseArgs(argv) {
  const out = { once: false, triggerH4: false, autoStartH3: false, quiet: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--once') out.once = true;
    else if (argv[i] === '--trigger-h4') out.triggerH4 = true;
    else if (argv[i] === '--auto-start-h3') out.autoStartH3 = true;
    else if (argv[i] === '--quiet') out.quiet = true;
  }
  return out;
}

function loadAllowRoots() {
  const roots = [];
  if (!fs.existsSync(PRESETS)) return roots;
  for (const line of fs.readFileSync(PRESETS, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*-\s*["']([^"']+)["']/);
    if (m) roots.push(m[1].replace(/\\\\/g, '\\'));
  }
  return roots;
}

function listWatchingRunDirs(allowRoots) {
  const dirs = new Set();
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
        if (w.status === 'watching' && !w.h4TriggeredAt) dirs.add(path.resolve(dir));
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
  return [...dirs];
}

function runCheck(runDir, repoRoot) {
  const args = [CHECK, '--run-dir', runDir, '--work-dir', repoRoot, '--expect-commit'];
  const r = spawnSync(process.execPath, args, { encoding: 'utf8' });
  let check = null;
  try {
    check = JSON.parse((r.stdout || '').trim());
  } catch {
    check = { done: false, reason: 'parse_error', raw: (r.stdout || '').trim() };
  }
  return { exitCode: r.status, check };
}

function isPidAlive(pid) {
  const n = Number(pid);
  if (!n || n <= 0) return false;
  try {
    process.kill(n, 0);
    return true;
  } catch {
    return false;
  }
}

function needsAutoStart(runDir, check) {
  if (check.done) return false;
  const wrapper = path.join(runDir, 'h3-run-wrapper.ps1');
  const goal = path.join(runDir, 'h3-goal.md');
  if (!fs.existsSync(wrapper) || !fs.existsSync(goal)) return false;
  const startMeta = path.join(runDir, 'h3-start.json');
  if (fs.existsSync(startMeta)) {
    try {
      const s = JSON.parse(fs.readFileSync(startMeta, 'utf8'));
      if (s.wrapperPid && isPidAlive(s.wrapperPid)) return false; // 已在跑，勿反复 Start-Process
    } catch {
      /* ignore */
    }
  }
  const raw = path.join(runDir, 'h3-dev.raw.txt');
  if (fs.existsSync(raw)) {
    const body = fs.readFileSync(raw, 'utf8');
    if (/##\s*本次结果摘要/.test(body) || /##\s*当前进度/.test(body)) return false;
  }
  return true;
}

function autoStartH3(runDir) {
  const r = spawnSync(process.execPath, [START_H3, '--run-dir', runDir, '--detach'], {
    encoding: 'utf8',
  });
  let body = null;
  try {
    body = JSON.parse((r.stdout || '').trim());
  } catch {
    body = { ok: false, raw: (r.stdout || '').trim() };
  }
  return { exitCode: r.status, body };
}

function renderH4Message(runDir, check, watch) {
  const tpl = fs.readFileSync(H4_TEMPLATE, 'utf8');
  const hints = (check.hints || []).join('; ');
  return tpl
    .replace(/\{\{RUN_DIR\}\}/g, runDir)
    .replace(/\{\{REPO_ROOT\}\}/g, watch.repoRoot || watch.workDir)
    .replace(/\{\{WORK_DIR\}\}/g, watch.workDir)
    .replace(/\{\{CHECK_REASON\}\}/g, check.reason || '')
    .replace(/\{\{CHECK_HINTS\}\}/g, hints);
}

function triggerH4(runDir, check, watch) {
  const watchPath = path.join(runDir, 'h3-watch.json');
  const now = new Date().toISOString();
  watch.status = 'h4_pending';
  watch.h4TriggeredAt = now;
  watch.lastCheck = check;
  fs.writeFileSync(watchPath, JSON.stringify(watch, null, 2) + '\n', 'utf8');

  const msgPath = path.join(runDir, 'h4-trigger.message.md');
  fs.writeFileSync(msgPath, renderH4Message(runDir, check, watch), 'utf8');

  const child = spawn(
    process.execPath,
    [OPENCLAW_MJS, 'agent', '--agent', 'main', '--message-file', msgPath, '--deliver'],
    { detached: true, stdio: 'ignore', windowsHide: true },
  );
  child.unref();
  // 不等 LLM：立刻飞书短播报，避免「H4 在跑但群里无声」
  const feishu = announce(runDir, 'h4_triggered');
  return {
    msgPath,
    agentSpawned: true,
    agentPid: child.pid || null,
    feishu,
  };
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.once) {
    console.error(
      'usage: node poll-h3-watch.cjs --once [--auto-start-h3] [--trigger-h4] [--quiet]',
    );
    process.exit(2);
  }

  const allowRoots = loadAllowRoots();
  const runDirs = listWatchingRunDirs(allowRoots);
  const checked = [];
  const h3Starts = [];
  const triggers = [];
  const announces = [];

  // H4 已闭环但飞书未播报（LLM --deliver 超时常见）→ 确定性补发
  for (const runDir of listClosedNeedingAnnounce(allowRoots)) {
    announces.push({ runDir, kind: 'h4_closed', ...announce(runDir, 'h4_closed') });
  }

  for (const runDir of runDirs) {
    const watchPath = path.join(runDir, 'h3-watch.json');
    const watch = JSON.parse(fs.readFileSync(watchPath, 'utf8'));
    const repoRoot = watch.repoRoot || watch.workDir || runDir;

    const { exitCode, check } = runCheck(runDir, repoRoot);

    if (args.autoStartH3 && needsAutoStart(runDir, check)) {
      const start = autoStartH3(runDir);
      h3Starts.push({ runDir, ...start });
      if (start.body?.action === 'started') {
        announces.push({ runDir, kind: 'h3_started', ...announce(runDir, 'h3_started') });
      }
      checked.push({
        runDir,
        exitCode: 0,
        done: false,
        reason: 'h3_auto_started',
        hints: start.body ? [start.body.action || ''] : [],
      });
      continue;
    }

    const row = { runDir, exitCode, done: !!check.done, reason: check.reason, hints: check.hints || [] };
    checked.push(row);

    if (!check.done) continue;

    if (args.triggerH4) {
      triggers.push({ ...row, ...triggerH4(runDir, check, watch) });
    } else {
      triggers.push({ ...row, trigger: 'skipped_no_flag' });
    }
  }

  const out = {
    at: new Date().toISOString(),
    checked,
    h3Starts,
    triggers,
    announces,
    watchCount: runDirs.length,
  };

  const hadAction =
    triggers.length > 0 ||
    announces.some((a) => a.body?.ok) ||
    h3Starts.some((s) => s.body?.action === 'started');

  if (args.quiet && !hadAction) {
    process.stdout.write('NO_REPLY\n');
    process.exit(0);
  }

  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  process.exit(0);
}

main();

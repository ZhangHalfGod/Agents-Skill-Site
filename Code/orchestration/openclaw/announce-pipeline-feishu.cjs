#!/usr/bin/env node
/**
 * announce-pipeline-feishu.cjs — 确定性飞书播报（不经 main LLM）
 *
 *   node announce-pipeline-feishu.cjs --run-dir <path> [--kind h3_started|h4_triggered|h4_closed|custom] [--text "..."]
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ORCH = path.resolve(__dirname);
const CFG = path.join(ORCH, 'pipeline-feishu.json');
const OPENCLAW_MJS = 'C:/nvm4w/nodejs/node_modules/openclaw/openclaw.mjs';

function parseArgs(argv) {
  const out = { runDir: '', kind: 'custom', text: '', dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--run-dir') out.runDir = path.resolve(argv[++i] || '');
    else if (argv[i] === '--kind') out.kind = argv[++i] || 'custom';
    else if (argv[i] === '--text') out.text = argv[++i] || '';
    else if (argv[i] === '--dry-run') out.dryRun = true;
  }
  return out;
}

function loadCfg() {
  try {
    return JSON.parse(fs.readFileSync(CFG, 'utf8'));
  } catch {
    return null;
  }
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function buildText(kind, runDir, custom) {
  if (custom) return custom;
  const base = path.basename(runDir);
  const closed = readJson(path.join(runDir, 'h4-closed.json'));
  const watch = readJson(path.join(runDir, 'h3-watch.json'));
  const start = readJson(path.join(runDir, 'h3-start.json'));

  if (kind === 'h3_started') {
    return [
      `✅ H3 已后台启动（看门狗，非 LLM）`,
      `run: ${base}`,
      `pid: ${start?.wrapperPid || watch?.h3WrapperPid || '?'}`,
      `raw: ${path.join(runDir, 'h3-dev.raw.txt')}`,
      `完成以 check-h3-done 为准；done 后自动进 H4。`,
    ].join('\n');
  }
  if (kind === 'h4_triggered') {
    return [
      `⏩ H3 已完成 → 已触发 H4（看门狗）`,
      `run: ${base}`,
      `hints: ${(watch?.lastCheck?.hints || []).join('; ') || '—'}`,
      `禁止重跑 H3。飞书闭环将在 H4 写完 h4-closed 后再报（确定性播报）。`,
    ].join('\n');
  }
  if (kind === 'h4_closed') {
    return [
      `✅ H4 闭环 ${closed?.verdict || 'DONE'}（确定性播报）`,
      `run: ${base}`,
      `commit: ${closed?.h3CommitMsg || closed?.h3CommitMessage || closed?.h3Commit || '—'}`,
      `摘要: ${closed?.summary || '见 h4-closed.json'}`,
      `本地: ${runDir}`,
    ].join('\n');
  }
  return custom || `pipeline update: ${base}`;
}

function sendFeishu(channel, target, message) {
  const r = spawnSync(
    process.execPath,
    [
      OPENCLAW_MJS,
      'message',
      'send',
      '--channel',
      channel,
      '--target',
      target,
      '--message',
      message,
      '--json',
    ],
    { encoding: 'utf8', windowsHide: true, maxBuffer: 4 * 1024 * 1024 },
  );
  return {
    ok: r.status === 0,
    exitCode: r.status,
    stdout: (r.stdout || '').trim().slice(0, 1500),
    stderr: (r.stderr || '').trim().slice(0, 1500),
  };
}

function main() {
  const args = parseArgs(process.argv);
  const cfg = loadCfg();
  if (!cfg?.channel || !cfg?.target) {
    console.error('missing pipeline-feishu.json channel/target');
    process.exit(2);
  }
  if (!args.runDir && args.kind !== 'custom') {
    console.error('usage: node announce-pipeline-feishu.cjs --run-dir <path> --kind h4_closed');
    process.exit(2);
  }

  const text = buildText(args.kind, args.runDir, args.text);
  if (args.dryRun) {
    process.stdout.write(JSON.stringify({ ok: true, dryRun: true, text, cfg }, null, 2) + '\n');
    process.exit(0);
  }

  const sent = sendFeishu(cfg.channel, cfg.target, text);

  if (args.runDir && sent.ok) {
    const watchPath = path.join(args.runDir, 'h3-watch.json');
    const watch = readJson(watchPath) || {};
    const key =
      args.kind === 'h4_closed'
        ? 'feishuClosedAnnouncedAt'
        : args.kind === 'h4_triggered'
          ? 'feishuH4TriggeredAnnouncedAt'
          : args.kind === 'h3_started'
            ? 'feishuH3StartedAnnouncedAt'
            : null;
    if (key) {
      watch[key] = new Date().toISOString();
      fs.writeFileSync(watchPath, JSON.stringify(watch, null, 2) + '\n', 'utf8');
    }
  }

  process.stdout.write(JSON.stringify({ ok: sent.ok, kind: args.kind, text, ...sent }, null, 2) + '\n');
  process.exit(sent.ok ? 0 : 1);
}

main();

#!/usr/bin/env node
/**
 * handle-pipeline-nudge.cjs — 续跑 / 催 H3（零 LLM 决策，stdout 可直接贴飞书）
 *
 *   node handle-pipeline-nudge.cjs --run-dir <path>
 *   node handle-pipeline-nudge.cjs --from-text "H3 未启动 run-ws-push-20260804 ..."
 *
 * 逻辑：check-h3-done → 未完成则 start-h3 → 已完成且无 h4-closed 则提示可 H4
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ORCH = path.resolve(__dirname);
const CHECK = path.join(ORCH, 'check-h3-done.cjs');
const START = path.join(ORCH, 'start-h3-from-run-dir.cjs');

function parseArgs(argv) {
  const out = { runDir: '', fromText: '', workDir: '', repoRoot: '', start: true };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run-dir') out.runDir = path.resolve(argv[++i] || '');
    else if (a === '--from-text') out.fromText = argv[++i] || '';
    else if (a === '--work-dir') out.workDir = path.resolve(argv[++i] || '');
    else if (a === '--repo-root') out.repoRoot = path.resolve(argv[++i] || '');
    else if (a === '--no-start') out.start = false;
  }
  return out;
}

function extractRunDir(text) {
  const m1 = text.match(/run_dir\s*=\s*(D:[^\s\r\n]+)/i);
  if (m1) return path.resolve(m1[1]);
  const m2 = text.match(/(D:\\trae_git\\[^\s\r\n]*\\run-[a-z0-9_-]+)/i);
  if (m2) return path.resolve(m2[1]);
  const m3 = text.match(/run-([a-z0-9_-]+-\d{8})/i);
  if (m3) {
    const guess = path.join('D:\\trae_git\\AI_Virtual_Glasses\\docs\\pipeline', m3[0]);
    if (fs.existsSync(guess)) return path.resolve(guess);
  }
  return '';
}

function runNode(script, scriptArgs) {
  const r = spawnSync(process.execPath, [script, ...scriptArgs], { encoding: 'utf8' });
  let json = null;
  try {
    json = JSON.parse((r.stdout || '').trim());
  } catch {
    json = { raw: (r.stdout || '').trim(), stderr: (r.stderr || '').trim() };
  }
  return { exitCode: r.status, json };
}

function inferRepo(runDir, workDir, repoRoot) {
  if (repoRoot) return repoRoot;
  const watch = readJson(path.join(runDir, 'h3-watch.json'));
  if (watch?.repoRoot) return watch.repoRoot;
  if (workDir) return workDir;
  return runDir;
}

function readJson(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  } catch {
    return null;
  }
}

function linesForFeishu(result) {
  const L = [];
  L.push('## 流水线续跑（脚本判定，非 LLM 臆测）');
  L.push(`run-dir: ${result.runDir}`);
  L.push(`阶段: ${result.phase}`);
  if (result.h3Commit) L.push(`H3 commit: ${result.h3Commit}`);
  if (result.h4Verdict) L.push(`H4: ${result.h4Verdict}`);
  if (result.action) L.push(`动作: ${result.action}`);
  if (result.detail) L.push(`详情: ${result.detail}`);
  if (result.next) L.push(`下一步: ${result.next}`);
  return L.join('\n');
}

function main() {
  const args = parseArgs(process.argv);
  let runDir = args.runDir;
  if (!runDir && args.fromText) runDir = extractRunDir(args.fromText);
  if (!runDir) {
    console.error('usage: node handle-pipeline-nudge.cjs --run-dir <path> [--work-dir] [--repo-root]');
    console.error('       node handle-pipeline-nudge.cjs --from-text "<用户原文>"');
    process.exit(2);
  }

  const repoRoot = inferRepo(runDir, args.workDir, args.repoRoot);
  const h4Closed = path.join(runDir, 'h4-closed.json');
  const watch = readJson(path.join(runDir, 'h3-watch.json'));

  const checkR = runNode(CHECK, ['--run-dir', runDir, '--work-dir', repoRoot, '--expect-commit']);
  const check = checkR.json || { done: false };

  const result = { runDir, repoRoot, phase: 'unknown', action: 'none' };

  if (fs.existsSync(h4Closed)) {
    const closed = readJson(h4Closed);
    result.phase = 'closed';
    result.h4Verdict = closed?.verdict || 'closed';
    result.h3Commit = closed?.h3CommitMessage || closed?.h3Commit || '';
    result.next = '无需操作；本 run 已闭环。';
  } else if (check.done) {
    result.phase = 'h3_done_h4_pending';
    result.action = 'notify_h4';
    result.detail = check.reason;
    result.next = '请 main 按 SOUL 执行 H4，或等 cron --trigger-h4。禁止重跑 H3。';
    if (check.hints) result.hints = check.hints;
  } else if (args.start && fs.existsSync(path.join(runDir, 'h3-run-wrapper.ps1'))) {
    const startR = runNode(START, ['--run-dir', runDir, '--detach']);
    const body = startR.json || {};
    result.phase = 'h3_starting';
    result.action = body.action || 'start';
    result.detail = JSON.stringify(body);
    result.next = '等待 h3-dev.raw.txt / check-h3-done；cron 每 2min 自动 H4。';
  } else {
    result.phase = 'h3_not_ready';
    result.next = '缺少 wrapper 或 check 未过；需人工补 h3-goal.md + h3-run-wrapper.ps1';
  }

  if (watch?.status) result.watchStatus = watch.status;

  const feishu = linesForFeishu(result);
  process.stdout.write(feishu + '\n\n---JSON---\n' + JSON.stringify(result, null, 2) + '\n');
  process.exit(result.phase === 'closed' ? 0 : check.done ? 0 : 0);
}

main();

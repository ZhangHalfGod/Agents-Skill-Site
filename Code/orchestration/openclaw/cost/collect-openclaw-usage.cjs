#!/usr/bin/env node
/**
 * collect-openclaw-usage.cjs — 从 ~/.openclaw/agents/<id>/sessions/*.trajectory.jsonl
 * 汇总 model.completed 的 usage（input / output / cacheRead）
 *
 * 用法:
 *   node collect-openclaw-usage.cjs --agent pm --since 2026-08-03T02:00:00.000Z
 *   node collect-openclaw-usage.cjs --agent main --latest
 *   node collect-openclaw-usage.cjs --trajectory <path>
 *
 * stdout: JSON { ok, provider, model_id, tokens, events, session_id, source }
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { openclawHome, normalizeModelId } = require('./cost-lib.cjs');

function parseArgs(argv) {
  const out = { agent: '', since: null, latest: false, trajectory: '', sessionId: '' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--agent') out.agent = argv[++i] || '';
    else if (a === '--since') out.since = argv[++i] || null;
    else if (a === '--latest') out.latest = true;
    else if (a === '--trajectory') out.trajectory = argv[++i] || '';
    else if (a === '--session-id') out.sessionId = argv[++i] || '';
  }
  return out;
}

function listTrajectories(agentId) {
  const dir = path.join(openclawHome(), 'agents', agentId, 'sessions');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((n) => n.endsWith('.trajectory.jsonl'))
    .map((n) => {
      const p = path.join(dir, n);
      const st = fs.statSync(p);
      return { path: p, mtimeMs: st.mtimeMs };
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs);
}

function readEvents(filePath, sinceMs, sessionId) {
  const text = fs.readFileSync(filePath, 'utf8');
  const events = [];
  for (const line of text.split(/\n/)) {
    if (!line.trim()) continue;
    let o;
    try {
      o = JSON.parse(line);
    } catch {
      continue;
    }
    if (o.type !== 'model.completed') continue;
    if (sessionId && o.sessionId !== sessionId) continue;
    const ts = o.ts ? Date.parse(o.ts) : 0;
    if (sinceMs && ts && ts < sinceMs) continue;
    const usage = (o.data && o.data.usage) || {};
    events.push({
      ts: o.ts,
      sessionId: o.sessionId,
      runId: o.runId,
      provider: o.provider || 'deepseek',
      modelId: o.modelId || '',
      usage: {
        input: Number(usage.input || 0),
        output: Number(usage.output || 0),
        cached_input: Number(usage.cacheRead || usage.cached_input || 0),
        reasoning: Number(usage.reasoningTokens || 0),
        total: Number(usage.total || 0),
      },
    });
  }
  return events;
}

function main() {
  const args = parseArgs(process.argv);
  let files = [];
  if (args.trajectory) {
    files = [{ path: args.trajectory, mtimeMs: 0 }];
  } else if (args.agent) {
    files = listTrajectories(args.agent);
    if (args.latest && files.length) files = [files[0]];
  } else {
    console.error('usage: --agent <id> [--since ISO|--latest] | --trajectory <path>');
    process.exit(2);
  }

  if (!files.length) {
    process.stdout.write(
      JSON.stringify({ ok: false, error: 'no_trajectory', message: 'no trajectory files' }) + '\n',
    );
    process.exit(2);
  }

  const sinceMs = args.since ? Date.parse(args.since) : null;
  let events = [];
  for (const f of files) {
    events = events.concat(readEvents(f.path, sinceMs, args.sessionId));
  }
  events.sort((a, b) => Date.parse(a.ts || 0) - Date.parse(b.ts || 0));

  if (!events.length) {
    process.stdout.write(
      JSON.stringify({
        ok: false,
        error: 'no_usage',
        message: 'no model.completed events in window',
        scanned: files.map((f) => f.path),
      }) + '\n',
    );
    process.exit(2);
  }

  // 默认：若指定 --since，汇总窗口内全部；否则只取最新一条 completed
  const use = args.since ? events : [events[events.length - 1]];
  const tokens = { input: 0, output: 0, cached_input: 0, reasoning: 0, total: 0 };
  for (const e of use) {
    tokens.input += e.usage.input;
    tokens.output += e.usage.output;
    tokens.cached_input += e.usage.cached_input;
    tokens.reasoning += e.usage.reasoning;
    tokens.total += e.usage.total || e.usage.input + e.usage.output + e.usage.cached_input;
  }
  const last = use[use.length - 1];
  const model_id = normalizeModelId(last.provider, last.modelId);

  process.stdout.write(
    JSON.stringify(
      {
        ok: true,
        provider: last.provider || 'deepseek',
        model_id,
        tokens,
        events: use.length,
        session_id: last.sessionId,
        started_at: use[0].ts,
        ended_at: last.ts,
        source: {
          kind: 'openclaw_trajectory',
          paths: files.map((f) => f.path),
        },
      },
      null,
      2,
    ) + '\n',
  );
}

main();

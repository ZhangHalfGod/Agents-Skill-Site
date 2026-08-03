#!/usr/bin/env node
/**
 * collect-cursor-usage.cjs — 从 Cursor invoke 落盘 JSON / 文本中尽力提取 usage
 *
 * 用法:
 *   node collect-cursor-usage.cjs --file <path>
 *   node collect-cursor-usage.cjs --run-dir <run-dir>   # 找 h3-*.json / cursor-usage.json
 *
 * 无用量字段时仍返回 ok=true + billing_mode subscription + tokens=0
 */
'use strict';

const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const out = { file: '', runDir: '' };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--file') out.file = argv[++i] || '';
    else if (argv[i] === '--run-dir') out.runDir = argv[++i] || '';
  }
  return out;
}

function extractFromObject(o, acc) {
  if (!o || typeof o !== 'object') return;
  if (o.usage && typeof o.usage === 'object') {
    acc.input += Number(o.usage.input_tokens || o.usage.prompt_tokens || o.usage.input || 0);
    acc.output += Number(
      o.usage.output_tokens || o.usage.completion_tokens || o.usage.output || 0,
    );
    acc.total += Number(o.usage.total_tokens || o.usage.total || 0);
    acc.found = true;
  }
  if (o.tokens && typeof o.tokens === 'object') {
    acc.input += Number(o.tokens.input || 0);
    acc.output += Number(o.tokens.output || 0);
    acc.total += Number(o.tokens.total || 0);
    acc.found = true;
  }
  for (const v of Object.values(o)) {
    if (v && typeof v === 'object') extractFromObject(v, acc);
  }
}

function findCandidateFiles(runDir) {
  if (!fs.existsSync(runDir)) return [];
  return fs
    .readdirSync(runDir)
    .filter((n) => /cursor.*usage|h3.*\.(json|jsonl)$/i.test(n) || n === 'cursor-invoke.json')
    .map((n) => path.join(runDir, n));
}

function main() {
  const args = parseArgs(process.argv);
  let files = [];
  if (args.file) files = [args.file];
  else if (args.runDir) files = findCandidateFiles(args.runDir);

  const tokens = { input: 0, output: 0, cached_input: 0, total: 0 };
  let found = false;
  const sources = [];

  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    const raw = fs.readFileSync(f, 'utf8');
    sources.push(f);
    try {
      const o = JSON.parse(raw);
      const acc = { input: 0, output: 0, total: 0, found: false };
      extractFromObject(o, acc);
      if (acc.found) {
        tokens.input += acc.input;
        tokens.output += acc.output;
        tokens.total += acc.total || acc.input + acc.output;
        found = true;
      }
    } catch {
      // plain text — ignore
    }
  }

  process.stdout.write(
    JSON.stringify(
      {
        ok: true,
        provider: 'cursor',
        model_id: 'cursor/agent',
        billing_mode: 'subscription',
        tokens,
        usage_found: found,
        source: { kind: 'cursor_cli', paths: sources },
        notes: found
          ? 'tokens extracted from invoke artifact'
          : 'no token fields; subscription mode amount=0',
      },
      null,
      2,
    ) + '\n',
  );
}

main();

#!/usr/bin/env node
/**
 * append-cost-hop.cjs — 向 run-dir/cost-ledger.yaml 追加一跳并重算 totals
 *
 * 用法:
 *   node append-cost-hop.cjs --run-dir <path> --hop H1 --role pm --collect-openclaw
 *   node append-cost-hop.cjs --run-dir <path> --hop H3 --role cursor --usage-json <file>
 *   node append-cost-hop.cjs --run-dir <path> --hop H1 --role pm --usage-json -  < stdin
 *
 * 选项:
 *   --since ISO8601   配合 --collect-openclaw（invoke 开始时间）
 *   --ok true|false   默认 true
 *   --run-id --project --pricing
 *   --print-summary   结束后打印飞书一行
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const {
  loadPricing,
  normalizeModelId,
  computeCost,
  loadLedger,
  saveLedger,
  recomputeTotals,
  summarizeLine,
  DEFAULT_PRICING,
} = require('./cost-lib.cjs');

function parseArgs(argv) {
  const out = {
    runDir: '',
    hop: '',
    role: '',
    ok: true,
    collectOpenclaw: false,
    usageJson: '',
    since: '',
    runId: '',
    project: '',
    pricing: DEFAULT_PRICING,
    printSummary: false,
    notes: '',
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--run-dir') out.runDir = argv[++i] || '';
    else if (a === '--hop') out.hop = argv[++i] || '';
    else if (a === '--role') out.role = argv[++i] || '';
    else if (a === '--ok') out.ok = String(argv[++i] || 'true') !== 'false';
    else if (a === '--collect-openclaw') out.collectOpenclaw = true;
    else if (a === '--usage-json') out.usageJson = argv[++i] || '';
    else if (a === '--since') out.since = argv[++i] || '';
    else if (a === '--run-id') out.runId = argv[++i] || '';
    else if (a === '--project') out.project = argv[++i] || '';
    else if (a === '--pricing') out.pricing = argv[++i] || DEFAULT_PRICING;
    else if (a === '--print-summary') out.printSummary = true;
    else if (a === '--notes') out.notes = argv[++i] || '';
  }
  return out;
}

function readUsageJson(spec) {
  if (!spec) return null;
  let raw = spec === '-' ? fs.readFileSync(0, 'utf8') : fs.readFileSync(spec, 'utf8');
  raw = raw.replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function collectOpenclaw(role, since) {
  const script = path.join(__dirname, 'collect-openclaw-usage.cjs');
  const args = [script, '--agent', role];
  if (since) args.push('--since', since);
  else args.push('--latest');
  const r = spawnSync(process.execPath, args, { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  if (r.stdout) {
    try {
      return JSON.parse(r.stdout);
    } catch {
      /* fallthrough */
    }
  }
  return {
    ok: false,
    error: 'collect_failed',
    message: (r.stderr || r.stdout || '').slice(0, 500),
    status: r.status,
  };
}

function providerOf(role, usage) {
  if (usage && usage.provider) return usage.provider;
  if (role === 'cursor') return 'cursor';
  return 'deepseek';
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.runDir || !args.hop || !args.role) {
    console.error(
      'usage: append-cost-hop.cjs --run-dir <dir> --hop H1 --role pm [--collect-openclaw|--usage-json file]',
    );
    process.exit(2);
  }

  let usage = null;
  if (args.collectOpenclaw) {
    usage = collectOpenclaw(args.role, args.since);
  } else if (args.usageJson) {
    usage = readUsageJson(args.usageJson);
  } else {
    usage = {
      ok: false,
      provider: providerOf(args.role),
      model_id: args.role === 'cursor' ? 'cursor/agent' : 'unknown',
      tokens: { input: 0, output: 0, cached_input: 0, total: 0 },
      billing_hint: 'unknown',
    };
  }

  const pricing = loadPricing(args.pricing);
  const runId = args.runId || path.basename(args.runDir);
  const ledger = loadLedger(args.runDir, {
    run_id: runId,
    project: args.project,
    currency_primary: 'USD',
  });
  if (args.project) ledger.project = args.project;
  if (args.runId) ledger.run_id = args.runId;

  const provider = providerOf(args.role, usage);
  let modelId =
    (usage && (usage.model_id || usage.modelId)) ||
    (provider === 'cursor' ? 'cursor/agent' : 'unknown');
  modelId = normalizeModelId(provider, modelId);

  const tokens = (usage && usage.tokens) || {
    input: 0,
    output: 0,
    cached_input: 0,
    total: 0,
  };
  const modelRow =
    pricing.byId.get(modelId) ||
    pricing.byId.get(modelId.replace(/^deepseek\//, '')) ||
    pricing.byId.get(`deepseek/${modelId}`);
  const cost = computeCost(tokens, modelRow);
  if (usage && usage.ok === false && !args.usageJson) {
    cost.billing_mode = cost.billing_mode || 'unknown';
  }

  const hop = {
    hop_id: args.hop,
    role: args.role,
    provider,
    model_id: modelId,
    billing_mode: cost.billing_mode || (modelRow && modelRow.billing_mode) || 'unknown',
    ok: args.ok,
    tokens: {
      input: Number(tokens.input || 0),
      output: Number(tokens.output || 0),
      cached_input: Number(tokens.cached_input || 0),
      total: Number(tokens.total || 0),
    },
    cost: {
      amount: cost.amount,
      currency: cost.currency || 'USD',
      pricing_ref: cost.pricing_ref,
    },
    source: (usage && usage.source) || {
      kind: args.collectOpenclaw ? 'openclaw_trajectory' : args.usageJson ? 'usage_json' : 'manual',
    },
    started_at: (usage && usage.started_at) || null,
    ended_at: (usage && usage.ended_at) || null,
    notes:
      args.notes ||
      (usage && usage.ok === false ? `usage incomplete: ${usage.error || usage.message || ''}` : ''),
  };
  if (usage && usage.ok === false) {
    hop.billing_mode = 'unknown';
  }

  // replace same hop_id if re-run
  ledger.hops = (ledger.hops || []).filter((h) => h.hop_id !== args.hop);
  ledger.hops.push(hop);
  recomputeTotals(ledger);
  const saved = saveLedger(args.runDir, ledger);

  const out = {
    ok: true,
    path: saved,
    hop,
    totals: ledger.totals,
    summary: summarizeLine(ledger),
  };
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
  if (args.printSummary) {
    process.stderr.write(out.summary + '\n');
  }
}

main();

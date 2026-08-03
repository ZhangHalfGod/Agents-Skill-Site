#!/usr/bin/env node
/**
 * summarize-cost.cjs — 打印飞书一行成本摘要
 *   node summarize-cost.cjs --run-dir <path>
 */
'use strict';

const { loadLedger, summarizeLine } = require('./cost-lib.cjs');

const idx = process.argv.indexOf('--run-dir');
const runDir = idx >= 0 ? process.argv[idx + 1] : '';
if (!runDir) {
  console.error('usage: summarize-cost.cjs --run-dir <path>');
  process.exit(2);
}
const ledger = loadLedger(runDir, {});
process.stdout.write(summarizeLine(ledger) + '\n');

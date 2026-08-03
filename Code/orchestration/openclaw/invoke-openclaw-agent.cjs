// invoke-openclaw-agent.cjs — 绕开 PowerShell 5.1 native argv 双引号缺陷的 openclaw agent 调起器
// 用法:
//   node invoke-openclaw-agent.cjs <agentId> <messageFile> [extra openclaw agent args...]
//   node invoke-openclaw-agent.cjs <agentId> <messageFile> --cost-ledger <runDir> --hop H1 [--project X] [--run-id Y]
// 收益: ① 消息可含任意双引号/换行 ② stdout/stderr UTF-8 ③ 可选每跳成本落盘
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function peelCostArgs(argv) {
  const extra = [];
  const cost = { ledger: '', hop: '', project: '', runId: '' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--cost-ledger') cost.ledger = argv[++i] || '';
    else if (a === '--hop') cost.hop = argv[++i] || '';
    else if (a === '--project') cost.project = argv[++i] || '';
    else if (a === '--run-id') cost.runId = argv[++i] || '';
    else extra.push(a);
  }
  return { extra, cost };
}

const [, , agentId, msgFile, ...rest] = process.argv;
if (!agentId || !msgFile) {
  console.error(
    'usage: node invoke-openclaw-agent.cjs <agentId> <messageFile> [--cost-ledger <runDir> --hop Hn] [extra openclaw args...]',
  );
  process.exit(2);
}

const { extra, cost } = peelCostArgs(rest);
const msg = fs.readFileSync(msgFile, 'utf8');
const mjs = 'C:/nvm4w/nodejs/node_modules/openclaw/openclaw.mjs';
const since = new Date().toISOString();

const r = spawnSync(process.execPath, [mjs, 'agent', '--agent', agentId, '--message', msg, ...extra], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
  maxBuffer: 64 * 1024 * 1024,
});
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
if (r.error) {
  console.error('spawn error:', r.error.message);
  process.exit(1);
}

const exitCode = r.status === null ? 1 : r.status;

if (cost.ledger && cost.hop) {
  const append = path.join(__dirname, 'cost', 'append-cost-hop.cjs');
  const args = [
    append,
    '--run-dir',
    cost.ledger,
    '--hop',
    cost.hop,
    '--role',
    agentId,
    '--collect-openclaw',
    '--since',
    since,
    '--ok',
    exitCode === 0 ? 'true' : 'false',
    '--print-summary',
  ];
  if (cost.project) args.push('--project', cost.project);
  if (cost.runId) args.push('--run-id', cost.runId);
  const c = spawnSync(process.execPath, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    maxBuffer: 8 * 1024 * 1024,
  });
  if (c.stdout) process.stderr.write('[cost] ' + c.stdout);
  if (c.stderr) process.stderr.write('[cost] ' + c.stderr);
  if (c.status !== 0) {
    process.stderr.write('[cost] append-cost-hop failed (invoke result unchanged)\n');
  }
}

process.exit(exitCode);

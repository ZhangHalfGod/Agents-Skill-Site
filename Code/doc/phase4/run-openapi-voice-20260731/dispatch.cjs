// dispatch.cjs — 调 openclaw 命名 agent，stdout 落盘 UTF-8（避免 PS 重定向 GBK/UTF16 问题）
// 用法: node dispatch.cjs <agentId> <messageFile> <rawOutFile>
const { spawnSync } = require('child_process');
const fs = require('fs');

const [, , agentId, msgFile, outFile] = process.argv;
if (!agentId || !msgFile || !outFile) {
  console.error('usage: node dispatch.cjs <agentId> <messageFile> <rawOutFile>');
  process.exit(2);
}
const msg = fs.readFileSync(msgFile, 'utf8');
const mjs = 'C:/nvm4w/nodejs/node_modules/openclaw/openclaw.mjs';

const r = spawnSync(process.execPath, [mjs, 'agent', '--agent', agentId, '--message', msg], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
  maxBuffer: 64 * 1024 * 1024
});
if (r.stdout) fs.writeFileSync(outFile, r.stdout, 'utf8');
if (r.stderr) fs.writeFileSync(outFile + '.stderr', r.stderr, 'utf8');
console.log('exit=' + r.status + ' stdoutBytes=' + (r.stdout ? r.stdout.length : 0) + ' stderrBytes=' + (r.stderr ? r.stderr.length : 0));
if (r.error) { console.error('spawn error:', r.error.message); process.exit(1); }
process.exit(r.status === null ? 1 : r.status);

// invoke-openclaw-agent.cjs — 绕开 PowerShell 5.1 native argv 双引号缺陷的 openclaw agent 调起器
// 用法: node invoke-openclaw-agent.cjs <agentId> <messageFile> [extra openclaw agent args...]
// 收益: ① 消息可含任意双引号/换行（node spawn argv 直传）② stdout/stderr 按 UTF-8 解码，无 GBK 乱码
const { spawnSync } = require('child_process');
const fs = require('fs');

const [, , agentId, msgFile, ...extra] = process.argv;
if (!agentId || !msgFile) {
  console.error('usage: node invoke-openclaw-agent.cjs <agentId> <messageFile> [extra args...]');
  process.exit(2);
}
const msg = fs.readFileSync(msgFile, 'utf8');
const mjs = 'C:/nvm4w/nodejs/node_modules/openclaw/openclaw.mjs';

const r = spawnSync(process.execPath, [mjs, 'agent', '--agent', agentId, '--message', msg, ...extra], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'pipe'],
  maxBuffer: 64 * 1024 * 1024
});
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
if (r.error) { console.error('spawn error:', r.error.message); process.exit(1); }
process.exit(r.status === null ? 1 : r.status);

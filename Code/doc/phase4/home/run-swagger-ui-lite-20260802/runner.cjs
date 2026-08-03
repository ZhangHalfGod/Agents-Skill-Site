// runner.cjs - run invoke-openclaw-agent and capture UTF-8 output to file
// usage: node runner.cjs <invokePath> <agentId> <msgFile> <outFile> [extra openclaw args...]
const { spawnSync } = require('child_process');
const fs = require('fs');
const [,, invokePath, agentId, msgFile, outFile, ...extra] = process.argv;
if (!invokePath || !agentId || !msgFile || !outFile) {
  console.error('usage: node runner.cjs <invokePath> <agentId> <msgFile> <outFile> [extra...]');
  process.exit(2);
}
const r = spawnSync(process.execPath, [invokePath, agentId, msgFile, ...extra], {
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
  stdio: ['ignore', 'pipe', 'pipe']
});
const combined = (r.stdout || '') + (r.stderr || '');
fs.writeFileSync(outFile, combined, 'utf8');
console.log('EXIT=' + (r.status === null ? 'ERR' : r.status) + ' BYTES=' + Buffer.byteLength(combined, 'utf8'));
if (r.error) console.error('spawn error:', r.error.message);
process.exit(r.status === null ? 1 : r.status);

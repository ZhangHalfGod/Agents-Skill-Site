// runner-h3.cjs - run invoke-cursor-agent.ps1 and capture UTF-8 output to file
// usage: node runner-h3.cjs <ps1Path> <workDir> <goalFile> <outFile> [timeoutSec]
const { spawnSync } = require('child_process');
const fs = require('fs');
const [,, ps1Path, workDir, goalFile, outFile, timeoutSec = '1200'] = process.argv;
if (!ps1Path || !workDir || !goalFile || !outFile) {
  console.error('usage: node runner-h3.cjs <ps1Path> <workDir> <goalFile> <outFile> [timeoutSec]');
  process.exit(2);
}
const r = spawnSync('powershell.exe', [
  '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', ps1Path,
  '-WorkDir', workDir, '-Goal', goalFile, '-TimeoutSec', String(timeoutSec)
], {
  encoding: 'utf8',
  maxBuffer: 128 * 1024 * 1024,
  stdio: ['ignore', 'pipe', 'pipe'],
  windowsHide: true
});
const combined = (r.stdout || '') + (r.stderr || '');
fs.writeFileSync(outFile, combined, 'utf8');
console.log('EXIT=' + (r.status === null ? 'ERR' : r.status) + ' BYTES=' + Buffer.byteLength(combined, 'utf8'));
if (r.error) console.error('spawn error:', r.error.message);
process.exit(r.status === null ? 1 : r.status);

const { spawnSync } = require('child_process');
const doctor = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion\\scripts\\openclaw\\common\\install\\doctor.ps1';
const r = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', doctor], {
  encoding: 'utf8', timeout: 240000, maxBuffer: 16 * 1024 * 1024
});
console.log('exit=' + r.status);
console.log('has probe summary:', r.stdout.includes('probe summary'));
console.log('--- tail ---');
const tail = (r.stdout || '').split('\n').slice(-8).join('\n');
console.log(tail);
const ok = r.status === 0 && !r.stdout.includes('probe summary');
console.log('CASE2: ' + (ok ? 'PASS' : 'FAIL'));
process.exit(ok ? 0 : 1);

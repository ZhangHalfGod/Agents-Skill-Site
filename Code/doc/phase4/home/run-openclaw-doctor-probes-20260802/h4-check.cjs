// H4 独立复验：openclaw-doctor-probes — 单命令分项表 + 失败非零退出
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const doctor = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion\\scripts\\openclaw\\common\\install\\doctor.ps1';

function run(args, timeoutSec = 180) {
  const r = spawnSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', doctor, ...args], {
    encoding: 'utf8', timeout: timeoutSec * 1000, maxBuffer: 16 * 1024 * 1024
  });
  return { code: r.status, out: (r.stdout || '') + (r.stderr || '') };
}

console.log('=== 1) doctor.ps1 -Profile bm（分项表 + 退出码） ===');
const r1 = run(['-Profile', 'bm']);
console.log('exit=' + r1.code);
const hasHeader = r1.out.includes('probe summary');
const rows = ['weather', 'tts', 'routing'].filter((l) => new RegExp('^' + l + '\\s+(PASS|WARN|FAIL)', 'm').test(r1.out));
const hasResult = /Result: \d+ PASS, \d+ WARN, \d+ FAIL/.test(r1.out);
console.log('表头:', hasHeader, '| 行:', rows.join(','), '| 汇总行:', hasResult);
const r1Ok = hasHeader && rows.length === 3 && hasResult && (r1.code === 0 || r1.code === 1);

console.log('\n=== 2) doctor.ps1 无参数（向后兼容，无 probe 段，exit 0） ===');
const r2 = run([], 60);
console.log('exit=' + r2.code);
console.log('无 probe summary:', !r2.out.includes('probe summary'));
const r2Ok = r2.code === 0 && !r2.out.includes('probe summary');

console.log('\n=== 3) 代码核对（exit 1 逻辑 / $LASTEXITCODE / 无绝对路径 / if($Profile)） ===');
const src = fs.readFileSync(doctor, 'utf8');
const checks = [
  ['param ValidateSet bm|home', src.includes('ValidateSet') && src.includes('bm') && src.includes('home')],
  ['FAIL→exit 1', /totalFail -gt 0.*exit 1|totalFail\s*-gt\s*0[\s\S]{0,60}exit 1/.test(src)],
  ['$LASTEXITCODE 捕获', (src.match(/\$LASTEXITCODE/g) || []).length >= 3],
  ['if ($Profile) 包住 probe 段', /if \(\$Profile\)\s*\{[\s\S]*probe summary/.test(src) || /probe summary[\s\S]*if \(\$Profile\)/.test(src)],
  ['无绝对路径硬编码', !src.includes('E:\\zhangchangWork')],
];
let cpass = 0;
for (const [name, ok] of checks) { console.log((ok ? 'PASS' : 'FAIL') + '  ' + name); if (ok) cpass++; }
const r3Ok = cpass === checks.length;

console.log('\n=== 4) git diff 核对改动面 ===');
const g = spawnSync('git', ['diff', '--stat', '--', 'scripts/openclaw/common/install/doctor.ps1', 'scripts/openclaw/common/docs/README.md', 'scripts/openclaw/README.md'], {
  cwd: 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion', encoding: 'utf8'
});
console.log(g.stdout.trim() || '(no diff)');

console.log(`\nRESULT: 1)${r1Ok ? 'PASS' : 'FAIL'} 2)${r2Ok ? 'PASS' : 'FAIL'} 3)${r3Ok ? 'PASS' : 'FAIL'}`);
process.exit(r1Ok && r2Ok && r3Ok ? 0 : 1);

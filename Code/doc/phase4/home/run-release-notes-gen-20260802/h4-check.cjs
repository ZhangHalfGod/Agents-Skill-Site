// H4 独立复验：release-notes-gen — 脚本 exit 0 + 字段与 manifest 一致 + 无密钥
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repo = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion';
const base = 'http://127.0.0.1:3002';

// 1) 起服务检查
try {
  const h = execSync(`curl.exe -s -o NUL -w "%{http_code}" ${base}/health`, { encoding: 'utf8', timeout: 15000 });
  console.log('health:', h.trim(), h.trim() === '200' ? 'PASS' : 'FAIL');
} catch (e) { console.log('server not up:', e.message.split('\n')[0]); process.exit(1); }

// 2) 跑生成器
console.log('\n=== 1) node scripts/release-notes-gen.mjs ===');
const r = spawnSync('node', ['scripts/release-notes-gen.mjs'], { cwd: repo, encoding: 'utf8', timeout: 60000 });
console.log('exit=' + r.status);
console.log('stdout:', (r.stdout || '').trim());
const exitOk = r.status === 0;

// 3) 找输出文件
console.log('\n=== 2) 输出文件 ===');
const outDir = path.join(repo, 'doc\\方案C\\方案C_MVP_M1-M4_对接\\M-4_版本契约与发布联动');
const files = fs.readdirSync(outDir).filter((f) => /^发布清单-\d{8}\.md$/.test(f));
console.log('generated:', files);
const outFile = files.length ? path.join(outDir, files[0]) : null;
const fileOk = !!outFile && fs.statSync(outFile).size > 100;
if (outFile) console.log('size:', fs.statSync(outFile).size);

// 4) 字段一致性：manifest JSON vs Markdown
console.log('\n=== 3) 字段与 manifest 一致 ===');
const manifest = JSON.parse(execSync(`curl.exe -s "${base}/api/release/manifest?probe=false"`, { encoding: 'utf8', timeout: 20000 }));
const d = manifest.data;
const md = fs.readFileSync(outFile, 'utf8');
const pairs = [
  ['promptVersion', String(d.releaseTriplet?.promptVersion ?? '—')],
  ['registryVersion', String(d.releaseTriplet?.registryVersion ?? '—')],
  ['commit', String(d.releaseTriplet?.commit ?? '—')],
  ['serviceVersion', String(d.serviceVersion ?? '—')],
  ['gitSha', String(d.gitSha ?? '—')],
  ['deployEnv', String(d.deployEnv ?? '—')],
];
let fpass = 0;
for (const [k, v] of pairs) {
  const ok = md.includes(v);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${k}=${v.slice(0, 30)}`);
  if (ok) fpass++;
}

// 5) 无密钥 grep
console.log('\n=== 4) 无密钥检查 ===');
const leakRe = /API_KEY|TOKEN|SECRET|password|Bearer|MCP_[A-Z_]+_BASE_URL|http:\/\/[^\s]+/i;
const leaks = md.split('\n').filter((l) => leakRe.test(l));
console.log(leaks.length ? 'LEAKS:\n' + leaks.join('\n') : 'PASS 零命中');
const keyOk = leaks.length === 0;

console.log(`\nRESULT: exit0=${exitOk ? 'PASS' : 'FAIL'} file=${fileOk ? 'PASS' : 'FAIL'} fields=${fpass}/${pairs.length} nokey=${keyOk ? 'PASS' : 'FAIL'}`);
process.exit(exitOk && fileOk && fpass === pairs.length && keyOk ? 0 : 1);

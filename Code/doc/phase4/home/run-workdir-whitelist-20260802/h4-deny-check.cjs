// H4 复验补测：拒绝路径 GBK 解码确认中文文案
const { spawnSync } = require('child_process');
const { TextDecoder } = require('util');
const gbk = new TextDecoder('gbk');

const bizScript = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion\\scripts\\openclaw\\common\\coding\\invoke-cursor-agent.ps1';
const orchScript = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\Agents-Skill-Site\\Code\\orchestration\\openclaw\\invoke-cursor-agent.ps1';
const runDir = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\Agents-Skill-Site\\Code\\doc\\phase4\\home\\run-workdir-whitelist-20260802';
const extra = runDir + '\\wl-test-dir';

function denyCase(label, script, workDir, envWL) {
  const env = { ...process.env };
  if (envWL !== undefined) env.WORKDIR_WHITELIST = envWL;
  const r = spawnSync('powershell.exe', [
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script,
    '-WorkDir', workDir, '-Goal', 'x', '-TimeoutSec', '3'
  ], { encoding: 'buffer', env, timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
  const out = gbk.decode(Buffer.concat([r.stdout || Buffer.alloc(0), r.stderr || Buffer.alloc(0)]));
  const denied = out.includes('FAIL: 工作目录不在白名单中');
  const started = out.includes('RUN agent=') || out.includes('[invoke-cursor-agent] WorkDir');
  console.log(`${label}: exit=${r.status} denied中文=${denied} agentStarted=${started}`);
  console.log('   head:', out.split('\n').filter(Boolean).slice(0, 2).join(' | ').slice(0, 200));
  return denied && !started;
}

const results = [
  ['B1 白名单外拒绝(C:\\Windows)', denyCase('B1', bizScript, 'C:\\Windows')],
  ['B4 未追加时测试目录拒绝', denyCase('B4', bizScript, extra)],
  ['O1 白名单外拒绝(C:\\Windows)', denyCase('O1', orchScript, 'C:\\Windows')],
];
let pass = 0;
for (const [name, ok] of results) { console.log((ok ? 'PASS' : 'FAIL') + '  ' + name); if (ok) pass++; }
console.log(`RESULT: ${pass}/${results.length}`);
process.exit(pass === results.length ? 0 : 1);

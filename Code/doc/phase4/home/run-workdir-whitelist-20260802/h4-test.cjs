// H4 独立复验：workdir-whitelist — 不信 agent 自报，main 亲自实测
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const runDir = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\Agents-Skill-Site\\Code\\doc\\phase4\\home\\run-workdir-whitelist-20260802';
const bizScript = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion\\scripts\\openclaw\\common\\coding\\invoke-cursor-agent.ps1';
const orchScript = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\Agents-Skill-Site\\Code\\orchestration\\openclaw\\invoke-cursor-agent.ps1';
const testDir = path.join(runDir, 'wl-test-dir');
if (!fs.existsSync(testDir)) fs.mkdirSync(testDir, { recursive: true });

const WL_REPO = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MCP_Gaode_Map'; // 白名单内，尽量轻的仓
const OUTSIDE = 'C:\\Windows'; // 白名单外
const EXTRA = testDir; // 仅通过 WORKDIR_WHITELIST 追加才允许

function runCase(label, script, workDir, extraEnv) {
  const env = { ...process.env };
  if (extraEnv !== undefined) env.WORKDIR_WHITELIST = extraEnv;
  const r = spawnSync('powershell.exe', [
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script,
    '-WorkDir', workDir, '-Goal', '只输出当前目录并退出', '-TimeoutSec', '3'
  ], { encoding: 'utf8', env, timeout: 60000, maxBuffer: 8 * 1024 * 1024 });
  const out = (r.stdout || '') + (r.stderr || '');
  const denied = out.includes('FAIL: 工作目录不在白名单中');
  const started = out.includes('RUN agent=') || out.includes('[invoke-cursor-agent]');
  const code = r.status;
  console.log(`\n=== ${label} ===`);
  console.log(`workDir=${workDir} envWL=${extraEnv === undefined ? '(unset)' : extraEnv}`);
  console.log(`exit=${code} denied=${denied} agentStarted=${started}`);
  console.log('--- output head ---');
  console.log(out.split('\n').slice(0, 8).join('\n'));
  return { denied, started, code };
}

console.log('########## 业务仓副本 ##########');
const b1 = runCase('B1 白名单外 C:\\Windows → 应拒绝', bizScript, OUTSIDE);
const b2 = runCase('B2 白名单内 MCP_Gaode_Map → 应通过(启动agent后超时)', bizScript, WL_REPO);
const b3 = runCase('B3 追加WORKDIR_WHITELIST=测试目录 → 应通过', bizScript, EXTRA, EXTRA);
const b4 = runCase('B4 未追加时同目录 → 应拒绝', bizScript, EXTRA);

console.log('\n########## 编排仓副本 ##########');
const o1 = runCase('O1 白名单外 C:\\Windows → 应拒绝', orchScript, OUTSIDE);
const o2 = runCase('O2 白名单内 Agents-Skill-Site → 应通过(启动agent后超时)', orchScript, 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\Agents-Skill-Site');
const o3 = runCase('O3 追加WORKDIR_WHITELIST=测试目录 → 应通过', orchScript, EXTRA, EXTRA);

console.log('\n########## 判定 ##########');
const checks = [
  ['B1 拒绝', b1.denied === true && b1.started === false],
  ['B2 放行', b2.denied === false && b2.started === true],
  ['B3 追加放行', b3.denied === false && b3.started === true],
  ['B4 未追加拒绝', b4.denied === true && b4.started === false],
  ['O1 拒绝', o1.denied === true && o1.started === false],
  ['O2 放行', o2.denied === false && o2.started === true],
  ['O3 追加放行', o3.denied === false && o3.started === true],
];
let pass = 0;
for (const [name, ok] of checks) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name);
  if (ok) pass++;
}
console.log(`\nRESULT: ${pass}/${checks.length} passed`);
process.exit(pass === checks.length ? 0 : 1);

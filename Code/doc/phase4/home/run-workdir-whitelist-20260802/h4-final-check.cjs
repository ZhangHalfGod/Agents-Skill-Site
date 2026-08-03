const fs = require('fs');
const path = require('path');

const runDir = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\Agents-Skill-Site\\Code\\doc\\phase4\\home\\run-workdir-whitelist-20260802';
const biz = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion';
const orch = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\Agents-Skill-Site';

// 1) SKILL.md 同步检查
const skill = fs.readFileSync(path.join(biz, 'scripts\\openclaw\\common\\skills\\code-via-cursor-cli\\SKILL.md'), 'utf8');
const skillHasWl = skill.includes('白名单') && skill.includes('WORKDIR_WHITELIST');
console.log('SKILL.md 含白名单+WORKDIR_WHITELIST:', skillHasWl);

// 2) 两份脚本白名单块结构检查
function checkScript(label, p) {
  const src = fs.readFileSync(p, 'utf8');
  const has6 = ['MechAssist-Fusion', 'Agents-Skill-Site', 'MCP_Gaode_Map', 'Life-Coach-AI', 'AI_People_System', 'openclaw_trae_cursor'].every((r) => src.includes(r));
  const hasGetFull = src.includes('GetFullPath');
  const hasNotin = src.includes('-notin');
  const hasFail = src.includes('FAIL: 工作目录不在白名单中');
  const hasExit1 = /exit 1/.test(src);
  const hasEnv = src.includes('WORKDIR_WHITELIST');
  const idx = src.indexOf('WorkDir whitelist');
  console.log(`${label}: whitelist块=${idx >= 0} 6仓=${has6} GetFullPath=${hasGetFull} -notin=${hasNotin} FAIL中文=${hasFail} exit1=${hasExit1} env追加=${hasEnv}`);
}
checkScript('业务仓副本', path.join(biz, 'scripts\\openclaw\\common\\coding\\invoke-cursor-agent.ps1'));
checkScript('编排仓副本', path.join(orch, 'Code\\orchestration\\openclaw\\invoke-cursor-agent.ps1'));

// 3) 清理测试目录
const td = path.join(runDir, 'wl-test-dir');
if (fs.existsSync(td)) {
  fs.rmSync(td, { recursive: true, force: true });
  console.log('cleaned wl-test-dir');
}

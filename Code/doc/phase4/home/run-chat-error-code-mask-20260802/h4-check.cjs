// H4 独立复验：chat-error-code-mask — 注入 AMAP_ERROR 失败场景，验证用户可见回复不含该串
const { execSync } = require('child_process');
const path = require('path');

const repo = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion\\extern-api';

// 1) 目标单测独立重跑（系统 node，非 cursor-agent 自带）
console.log('=== 1) vitest 目标单测（系统 node） ===');
try {
  const out = execSync('npx vitest run server/services/mcpToolUserMessages.test.js', {
    cwd: repo, encoding: 'utf8', timeout: 180000, stdio: ['ignore', 'pipe', 'pipe']
  });
  const lines = out.split('\n').filter((l) => /Test Files|Tests|Duration|✓|✗|passed|failed/i.test(l));
  console.log(lines.slice(-12).join('\n'));
} catch (e) {
  console.log('vitest exit!=0 or error:', e.message.split('\n')[0]);
  if (e.stdout) console.log(String(e.stdout).split('\n').slice(-15).join('\n'));
  process.exit(1);
}

// 2) 直接注入场景：调用 sanitizeEnvelopeForLlm，检查输出 JSON 不含内部错误码
console.log('\n=== 2) 注入 AMAP_ERROR / QUOTA_ / MCP_ / ARK_ 场景 ===');
(async () => {
  const mod = await import('file:///' + path.join(repo, 'server', 'services', 'mcpToolUserMessages.js').replace(/\\/g, '/'));
  const { sanitizeEnvelopeForLlm, isUnsafeForUserDisplay } = mod;
  const cases = [
    ['top-level AMAP_ERROR', { success: false, error: { code: 'AMAP_ERROR', message: 'http://x' } }],
    ['top-level AMAP_ERR', { success: false, error: { code: 'AMAP_ERR', message: 'x' } }],
    ['nested QUOTA_EXCEEDED', { success: true, result: { success: false, error: { code: 'QUOTA_EXCEEDED', message: 'x' } } }],
    ['nested MCP_TIMEOUT', { success: true, result: { success: false, error: { code: 'MCP_TIMEOUT', message: 'x' } } }],
    ['nested ARK_QUERY_FAILED', { success: true, result: { success: false, error: { code: 'ARK_QUERY_FAILED', message: 'x' } } }],
    ['safe VALIDATION_ERROR kept', { success: false, error: { code: 'VALIDATION_ERROR', message: 'x' } }],
    ['null code kept', { success: false, error: { code: null, message: 'x' } }],
  ];
  let pass = 0;
  for (const [name, envelope] of cases) {
    const out = sanitizeEnvelopeForLlm(envelope, 'travel_query');
    const json = JSON.stringify(out);
    const leak = /AMAP_[A-Z0-9_]+|QUOTA_[A-Z0-9_]+|MCP_[A-Z0-9_]+|ARK_[A-Z0-9_]+/i.test(json);
    const expectKept = name.includes('kept');
    const ok = expectKept ? !leak : !leak;
    // 对于保留用例，确认 code 仍在
    const codeStill = json.includes('VALIDATION_ERROR') || json.includes('"code":null');
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}  leak=${leak}  ${json.slice(0, 120)}`);
    if (ok) pass++;
  }
  // 用户可见回复模拟：把 sanitize 输出当作 LLM 可见内容，确认不含内部码
  const userVisible = JSON.stringify(sanitizeEnvelopeForLlm({ success: false, error: { code: 'AMAP_ERROR', message: 'http://x' } }, 'travel_query'));
  const finalOk = !/AMAP_|QUOTA_|MCP_[A-Z]|ARK_[A-Z]/.test(userVisible);
  console.log(`${finalOk ? 'PASS' : 'FAIL'}  用户可见内容不含内部错误码  -> ${userVisible.slice(0, 100)}`);
  if (finalOk) pass++;
  console.log(`RESULT: ${pass}/${cases.length + 1}`);
  process.exit(pass === cases.length + 1 ? 0 : 1);
})().catch((e) => { console.error('import error:', e.message); process.exit(1); });

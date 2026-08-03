// H4 独立复验：mcp-docs-openapi-align — 文档链接与 :3002 实际路径一致
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const doc = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion\\doc\\方案C\\方案C_文档对齐\\MCP接入文档.md';
const base = 'http://127.0.0.1:3002';

// 1) 起服务（已由 main 后台启动），curl 四端点
console.log('=== 1) :3002 四端点实测 ===');
const endpoints = [
  ['GET /v2/', '/v2/'],
  ['GET /api/openapi.json', '/api/openapi.json'],
  ['GET /api/openapi.yaml', '/api/openapi.yaml'],
  ['GET /api/docs', '/api/docs'],
];
let allOk = true;
for (const [name, p] of endpoints) {
  try {
    const out = execSync(`curl.exe -s -o NUL -w "%{http_code}" ${base}${p}`, { encoding: 'utf8', timeout: 20000 });
    const ok = out.trim() === '200';
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name} -> HTTP ${out.trim()}`);
    if (!ok) allOk = false;
  } catch (e) {
    console.log(`FAIL  ${name} -> error: ${e.message.split('\n')[0]}`);
    allOk = false;
  }
}

// 2) 文档内容核对
console.log('\n=== 2) 文档链接与 §9 内容核对 ===');
const text = fs.readFileSync(doc, 'utf8');
const checks = [
  ['文档含 /v2/', text.includes('GET /v2/') || text.includes('/v2/')],
  ['文档含 /api/openapi.json', text.includes('/api/openapi.json')],
  ['文档含 /api/openapi.yaml', text.includes('/api/openapi.yaml')],
  ['文档含 /api/docs', text.includes('/api/docs')],
  ['§9 存在', text.includes('## 9. API 发现与文档')],
  ['同源说明 registry.js', text.includes('单一数据真源') && text.includes('registry.js')],
  ['端口 3002 一致', /3002/.test(text)],
  ['无「未实现/规划中/404」矛盾表述', !/(OpenAPI.*未实现|未实现.*OpenAPI|规划中.*OpenAPI|404)/.test(text)],
  ['§2.1 补行', text.includes('无需鉴权')],
  ['§8 索引 extern-api README', text.includes('../../../extern-api/README.md')],
];
let cpass = 0;
for (const [name, ok] of checks) {
  console.log((ok ? 'PASS' : 'FAIL') + '  ' + name);
  if (ok) cpass++;
}
console.log(`\nRESULT: endpoints=${allOk ? '4/4' : 'FAIL'} doc=${cpass}/${checks.length}`);
process.exit(allOk && cpass === checks.length ? 0 : 1);

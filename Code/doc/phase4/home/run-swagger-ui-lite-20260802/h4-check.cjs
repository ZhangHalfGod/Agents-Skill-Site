// H4 独立复验：swagger-ui-lite — /api/docs/ui 可浏览主要 tag + 不改业务 API
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const base = 'http://127.0.0.1:3002';
const viewFile = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion\\extern-api\\server\\views\\swagger-ui.html';

// 1) /api/docs/ui 页面
console.log('=== 1) GET /api/docs/ui ===');
const pageRes = execSync(`curl.exe -s -D - ${base}/api/docs/ui`, { encoding: 'utf8', timeout: 20000 });
const statusLine = pageRes.split('\r\n').find((l) => l.startsWith('HTTP/'));
const contentType = pageRes.split('\r\n').find((l) => /^content-type:/i.test(l));
const body = pageRes.split('\r\n\r\n').slice(1).join('\r\n\r\n');
console.log(statusLine, '|', contentType);
const ok200 = /200/.test(statusLine);
const okHtml = /text\/html/i.test(contentType || '');

// 2) 页面内容核对
console.log('\n=== 2) 页面内容（分组映射 / fetch / escapeHtml） ===');
const html = fs.readFileSync(viewFile, 'utf8');
const groupKeys = ['auth', 'chat', 'faq', 'repair-records', 'admin', 'release', 'other'];
const present = groupKeys.filter((k) => html.includes(`'${k}'`) || html.includes(`"${k}"`) || html.includes(k + ':'));
const hasFetch = html.includes("fetch('/api/openapi.json')") || html.includes('fetch("/api/openapi.json")');
const hasEscape = html.includes('escapeHtml');
const hasError = html.includes('#error') || html.includes('加载失败');
console.log('分组 key 命中:', present.join(','));
console.log('fetch openapi.json:', hasFetch, '| escapeHtml:', hasEscape, '| 失败降级:', hasError);
const contentOk = present.length >= 5 && hasFetch && hasEscape && hasError;

// 3) 用 live spec 复算分组（浏览器可浏览的主要 tag）
console.log('\n=== 3) live spec 分组复算 ===');
const spec = JSON.parse(execSync(`curl.exe -s ${base}/api/openapi.json`, { encoding: 'utf8', timeout: 20000 }));
const groups = new Set();
for (const p of Object.keys(spec.paths || {})) {
  const seg = p.split('/').filter(Boolean);
  groups.add(seg[1] || 'other');
}
console.log('实际分组数:', groups.size, '->', [...groups].join(','));
const groupsOk = groups.size >= 5;

// 4) /api/openapi.json 行为不变
console.log('\n=== 4) /api/openapi.json 行为不变 ===');
const j = execSync(`curl.exe -s -o NUL -w "%{http_code}" ${base}/api/openapi.json`, { encoding: 'utf8', timeout: 20000 });
console.log('openapi.json HTTP:', j.trim(), j.trim() === '200' ? 'PASS' : 'FAIL');
const unchanged = j.trim() === '200';

console.log(`\nRESULT: page=${ok200 && okHtml ? 'PASS' : 'FAIL'} content=${contentOk ? 'PASS' : 'FAIL'} groups=${groupsOk ? 'PASS' : 'FAIL'} unchanged=${unchanged ? 'PASS' : 'FAIL'}`);
process.exit(ok200 && okHtml && contentOk && groupsOk && unchanged ? 0 : 1);

const fs = require('fs');
const path = require('path');
const repo = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion';
// find MCP 接入相关 .md（排除 node_modules），并找含 openapi/v2/docs 链接的行
function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'storage') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.md$/.test(e.name)) out.push(full);
  }
}
const mds = [];
walk(repo, mds);
const cand = mds.filter((f) => /mcp/i.test(f));
console.log('--- MCP 相关 md 文件 ---');
console.log(cand.map((f) => path.relative(repo, f)).join('\n'));
console.log('\n--- 含 openapi.json / :3002 链接的 md（MCP 相关优先）---');
for (const f of mds) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  const hits = lines.map((ln, i) => ({ ln, i })).filter((x) => /openapi\.json|openapi\.yaml|:3002|\/api\/docs|\/v2\//.test(x.ln));
  if (hits.length) {
    console.log(path.relative(repo, f) + ' (' + hits.length + ' 行):');
    hits.slice(0, 6).forEach((h) => console.log('  L' + (h.i + 1) + ': ' + h.ln.trim().slice(0, 140)));
  }
}

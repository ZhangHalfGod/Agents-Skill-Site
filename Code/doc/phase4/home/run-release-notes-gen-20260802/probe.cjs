const fs = require('fs');
const path = require('path');
const repo = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion';
// 找 release/manifest 相关：代码、脚本、文档
function walk(dir, out, stop) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git' || e.name === 'storage') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { if (!stop || !stop.includes(e.name)) walk(full, out, stop); }
    else if (/\.(js|mjs|ps1|md|cjs)$/.test(e.name)) out.push(full);
  }
}
const files = [];
walk(repo, files, ['agents-skill-standards']);
const hits = [];
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((ln, i) => {
    if (/release\/manifest|releaseManifest|发布三元组|manifest.*probe/.test(ln)) {
      hits.push(path.relative(repo, f) + ':' + (i + 1) + ': ' + ln.trim().slice(0, 130));
    }
  });
}
console.log(hits.slice(0, 60).join('\n'));
console.log('total:', hits.length);

const fs = require('fs');
const path = require('path');
const repo = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion\\extern-api';
const pats = [/AMAP_/i, /QUOTA_/i, /error\.code/i, /sanitize/i];
function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === '.git') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.(js|mjs)$/.test(e.name)) out.push(full);
  }
}
const files = [];
walk(repo, files);
const hits = [];
for (const f of files) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((ln, i) => {
    if (pats.some((p) => p.test(ln))) {
      hits.push(path.relative(repo, f) + ':' + (i + 1) + ': ' + ln.trim().slice(0, 150));
    }
  });
}
console.log(hits.slice(0, 80).join('\n'));
console.log('total hits:', hits.length);

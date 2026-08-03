const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repo = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion';
const runDir = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\Agents-Skill-Site\\Code\\doc\\phase4\\home\\run-openapi-doc-sync-20260802-r2';

// 1) /api/docs body head
try {
  const body = execSync('curl.exe -s http://127.0.0.1:3002/api/docs', { encoding: 'utf8', timeout: 15000 });
  fs.writeFileSync(path.join(runDir, 'evidence', 'api-docs.body.txt'), body, 'utf8');
  console.log('--- /api/docs body head (500 chars) ---');
  console.log(body.slice(0, 500));
} catch (e) {
  console.log('curl /api/docs error:', e.message);
}

// 2) where is /api/docs served? grep server dir for 'api/docs' / 'docs'
console.log('--- grep server for api/docs route ---');
const serverDir = path.join(repo, 'extern-api', 'server');
function walk(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.(js|mjs)$/.test(e.name)) out.push(full);
  }
}
const jsFiles = [];
walk(serverDir, jsFiles);
for (const f of jsFiles) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split(/\r?\n/);
  lines.forEach((ln, i) => {
    if (/api\/docs/.test(ln) || ln.includes("'/docs'") || ln.includes('"/docs"')) {
      console.log(path.relative(repo, f) + ':' + (i + 1) + ': ' + ln.trim().slice(0, 140));
    }
  });
}

// 3) grep extern-api *.md (exclude node_modules) for OpenAPI contradictions
console.log('--- grep extern-api *.md contradiction ---');
function walkMd(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkMd(full, out);
    else if (/\.md$/.test(e.name)) out.push(full);
  }
}
const mds = [];
walkMd(path.join(repo, 'extern-api'), mds);
let hit = 0;
for (const f of mds) {
  const lines = fs.readFileSync(f, 'utf8').split(/\r?\n/);
  lines.forEach((ln, i) => {
    if (/OpenAPI/.test(ln) && /(未实现|规划中)/.test(ln)) {
      console.log(path.relative(repo, f) + ':' + (i + 1) + ': ' + ln.trim().slice(0, 160));
      hit++;
    }
  });
}
console.log('contradiction lines:', hit);

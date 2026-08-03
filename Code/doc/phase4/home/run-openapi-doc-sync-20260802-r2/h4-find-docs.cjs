const fs = require('fs');
const path = require('path');
const repo = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion';
const dirs = ['extern-api/server', 'extern-api/shared'];
for (const d of dirs) {
  const root = path.join(repo, d);
  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(js|mjs)$/.test(e.name)) {
        const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/);
        lines.forEach((ln, i) => {
          if (ln.includes('API_DOCS')) {
            console.log(path.relative(repo, full) + ':' + (i + 1) + ': ' + ln.trim().slice(0, 160));
          }
        });
      }
    }
  }
  walk(root);
}

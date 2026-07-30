const fs = require('fs');
const path = require('path');

const sessDir = path.join(process.env.USERPROFILE, '.openclaw/agents/pm/sessions');
const files = fs.readdirSync(sessDir)
  .filter(f => f.endsWith('.jsonl') && !f.includes('trajectory') && !f.includes('.reset.'))
  .map(f => ({ f, mtime: fs.statSync(path.join(sessDir, f)).mtimeMs }))
  .sort((a, b) => b.mtime - a.mtime);
if (!files.length) { console.error('NO_SESSION'); process.exit(1); }
const latest = path.join(sessDir, files[0].f);
console.log('session:', files[0].f);

const lines = fs.readFileSync(latest, 'utf8').split(/\r?\n/).filter(Boolean);
let assistantTexts = [];
for (const line of lines) {
  if (!line.includes('assistant')) continue;
  let obj;
  try { obj = JSON.parse(line); } catch { continue; }
  const msg = obj.message || obj;
  if (msg.role !== 'assistant') continue;
  const c = msg.content;
  if (typeof c === 'string') assistantTexts.push(c);
  else if (Array.isArray(c)) {
    const t = c.filter(p => p && p.type === 'text' && p.text).map(p => p.text).join('\n');
    if (t) assistantTexts.push(t);
  }
}
if (!assistantTexts.length) { console.error('NO_ASSISTANT_MSG'); process.exit(1); }
const reply = assistantTexts[assistantTexts.length - 1];
console.log('reply chars:', reply.length);

const outDir = 'D:/trae_git/Agents-Skill-Site/Code/doc/phase4/e2e-openapi';
const splitIdx = reply.indexOf('---SPLIT---');
let deliverable = splitIdx >= 0 ? reply.slice(0, splitIdx) : reply;
let envelope = splitIdx >= 0 ? reply.slice(splitIdx + '---SPLIT---'.length) : '';
envelope = envelope.replace(/```yaml/g, '').replace(/```/g, '').trim();
const execFailIdx = envelope.indexOf('⚠️');
if (execFailIdx >= 0) envelope = envelope.slice(0, execFailIdx).trim();
deliverable = deliverable.replace(/^交付物已落盘。?[^\n]*\n?/, '').trim();

fs.writeFileSync(path.join(outDir, 'AI代码生成范围清单_registry-openapi.md'), deliverable + '\n', 'utf8');
fs.writeFileSync(path.join(outDir, 'handoff-h1.envelope.yaml'), envelope + '\n', 'utf8');
fs.writeFileSync(path.join(outDir, 'h1-pm.clean.txt'), reply, 'utf8');
console.log('written: deliverable', deliverable.length, 'chars | envelope', envelope.length, 'chars');

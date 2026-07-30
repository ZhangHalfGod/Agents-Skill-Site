// split-reply.cjs <rawFile> <deliverableOut> <envelopeOut>
// 把 "---SPLIT---" 格式的 agent 回复拆成交付物 md + 信封 yaml（剥离 ```yaml 围栏与尾部 ⚠️ Exec 警告行）
const fs = require('fs');
const [,, rawFile, delOut, envOut] = process.argv;
if (!rawFile || !delOut || !envOut) { console.error('usage: split-reply.cjs <rawFile> <deliverableOut> <envelopeOut>'); process.exit(2); }

const reply = fs.readFileSync(rawFile, 'utf8');
const idx = reply.indexOf('---SPLIT---');
let deliverable = idx >= 0 ? reply.slice(0, idx) : reply;
let envelope = idx >= 0 ? reply.slice(idx + '---SPLIT---'.length) : '';

envelope = envelope.replace(/```yaml/g, '').replace(/```/g, '');
const warnIdx = envelope.search(/^⚠️/m);
if (warnIdx >= 0) envelope = envelope.slice(0, warnIdx);
envelope = envelope.trim();
deliverable = deliverable.trim();

fs.writeFileSync(delOut, deliverable + '\n', 'utf8');
fs.writeFileSync(envOut, envelope + '\n', 'utf8');
console.log('deliverable:', deliverable.length, 'chars ->', delOut);
console.log('envelope:', envelope.length, 'chars ->', envOut);

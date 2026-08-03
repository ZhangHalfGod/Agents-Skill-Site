const { execSync } = require('child_process');
try {
  execSync('taskkill /PID 16048 /F', { stdio: 'pipe' });
  console.log('killed PID 16048');
} catch (e) { console.log('kill:', e.stdout ? e.stdout.toString().trim() : 'not found'); }
setTimeout(() => {
  try {
    const out = execSync('netstat -ano | findstr ":3002"', { encoding: 'utf8' });
    const listening = out.split('\n').filter((l) => l.includes('LISTENING'));
    console.log(listening.length ? 'STILL LISTENING:\n' + listening.join('') : 'port 3002 free');
  } catch (e) { console.log('port 3002 free'); }
}, 1500);

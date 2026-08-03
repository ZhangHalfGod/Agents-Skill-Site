const { execSync } = require('child_process');
// kill only the exact PID of the temp server I started (23636)
try {
  execSync('taskkill /PID 23636 /F', { stdio: 'pipe' });
  console.log('killed PID 23636');
} catch (e) {
  console.log('kill result:', e.stdout ? e.stdout.toString().trim() : e.message.split('\n')[0]);
}
setTimeout(() => {
  try {
    const out = execSync('netstat -ano | findstr ":3002"', { encoding: 'utf8' });
    console.log('port 3002 still has entries:\n' + out);
  } catch (e) {
    console.log('port 3002 free (no listener)');
  }
}, 1500);

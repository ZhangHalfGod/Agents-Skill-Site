const fs = require('fs');
const p = 'E:\\zhangchangWork\\Work_Space\\Trae_Study\\MechAssist-Fusion\\scripts\\openclaw\\common\\install\\doctor.ps1';
const buf = fs.readFileSync(p);
console.log('BOM bytes:', buf.slice(0, 3).toString('hex'), '(efbbbf = UTF-8 BOM)');
const text = buf.toString('utf8');
console.log('--- first 4 lines (utf8) ---');
console.log(text.split(/\r?\n/).slice(0, 4).join('\n'));
console.log('--- 含锘/鐢熸垚/鑴氭墜 等乱码标记? ---');
console.log('mojibake markers:', (text.match(/锘|鐢|鑴|甯|瀹|鏋|鏂/gi) || []).length);
// 检查预期正确字符串是否存在
console.log('含正确「OpenClaw doctor / status」:', text.includes('OpenClaw doctor / status'));
console.log('含正确「脚手架」:', text.includes('脚手架'));
console.log('含损坏「鑴氭墜鏋」:', text.includes('鑴氭墜鏋'));
console.log('含正确「Feishu: 帮我在」:', text.includes('帮我在'));
console.log('含损坏「甯垜鍦」:', text.includes('甯垜鍦'));
// 整文件中文行抽样
const lines = text.split(/\r?\n/);
lines.forEach((ln, i) => {
  if (/[镞犺|鍒嗙|杩愯|鎵ц|閰嶇疆|鍙傛暟|鏈嶅姟]/.test(ln)) console.log('corrupt line L' + (i + 1) + ': ' + ln.slice(0, 60));
});

#!/usr/bin/env node
/**
 * generate-ui-image.cjs — 火山方舟文生图（给 UI 流水线用，Key 只读环境变量）
 *
 * 环境变量（勿提交）：
 *   ARK_API_KEY          必填
 *   ARK_IMAGE_MODEL      必填：接入点 ID，如 ep-xxxx（控制台「图片生成」）
 *   ARK_IMAGE_BASE_URL   可选，默认 https://ark.cn-beijing.volces.com/api/v3/images/generations
 *
 * 用法:
 *   node generate-ui-image.cjs --scene DebugConsole --prompt "深色调试台..." --out-dir D:\...\doc\assets\ui-gen
 *   node generate-ui-image.cjs --request-json path/to/req.json
 *
 * req.json 示例:
 *   { "scene": "DebugConsole", "prompt": "...", "size": "2K", "negative": "..." }
 *
 * stdout: JSON { ok, image_path, image_key, scene, model }
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const { URL } = require('url');

const DEFAULT_URL = 'https://ark.cn-beijing.volces.com/api/v3/images/generations';

function loadDotEnvFiles() {
  const candidates = [
    path.join(process.env.USERPROFILE || process.env.HOME || '', '.openclaw', '.env'),
    path.join(__dirname, '.env'),
  ];
  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    const text = fs.readFileSync(p, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      if (!line || line.trim().startsWith('#')) continue;
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!m) continue;
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (process.env[m[1]] === undefined) process.env[m[1]] = v;
    }
  }
}

function parseArgs(argv) {
  const out = {
    scene: 'Untitled',
    prompt: '',
    size: '2K',
    outDir: '',
    requestJson: '',
    download: true,
    watermark: true,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--scene') out.scene = argv[++i] || out.scene;
    else if (a === '--prompt') out.prompt = argv[++i] || '';
    else if (a === '--size') out.size = argv[++i] || '2K';
    else if (a === '--out-dir') out.outDir = argv[++i] || '';
    else if (a === '--request-json') out.requestJson = argv[++i] || '';
    else if (a === '--no-download') out.download = false;
    else if (a === '--no-watermark') out.watermark = false;
  }
  return out;
}

function sanitizePrompt(prompt) {
  const bad =
    /(api[_-]?key|ark_api|authorization\s*:|bearer\s+[a-z0-9]|sk-[a-z0-9]{10,}|password\s*=|token\s*=)/i;
  if (bad.test(prompt)) {
    throw new Error('prompt rejected: looks like it contains secrets');
  }
  return prompt.trim();
}

function httpJson(method, urlStr, headers, body) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    const data = body ? Buffer.from(JSON.stringify(body), 'utf8') : null;
    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method,
        headers: {
          ...headers,
          ...(data
            ? { 'Content-Type': 'application/json', 'Content-Length': data.length }
            : {}),
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          let json = null;
          try {
            json = JSON.parse(raw);
          } catch {
            json = { raw };
          }
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${raw.slice(0, 500)}`));
          } else resolve(json);
        });
      },
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function downloadFile(urlStr, dest) {
  return new Promise((resolve, reject) => {
    const u = new URL(urlStr);
    https
      .get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          downloadFile(res.headers.location, dest).then(resolve, reject);
          return;
        }
        if (res.statusCode >= 400) {
          reject(new Error(`download HTTP ${res.statusCode}`));
          return;
        }
        const ws = fs.createWriteStream(dest);
        res.pipe(ws);
        ws.on('finish', () => resolve(dest));
        ws.on('error', reject);
      })
      .on('error', reject);
  });
}

async function main() {
  loadDotEnvFiles();
  const args = parseArgs(process.argv);

  let scene = args.scene;
  let prompt = args.prompt;
  let size = args.size;
  let negative = '';

  if (args.requestJson) {
    const req = JSON.parse(fs.readFileSync(args.requestJson, 'utf8').replace(/^\uFEFF/, ''));
    scene = req.scene || scene;
    prompt = req.prompt || prompt;
    size = req.size || size;
    negative = req.negative || '';
    if (req.style_tokens || req.layout_tokens || req.constraints) {
      const parts = [prompt];
      if (req.style_tokens) parts.push('风格: ' + (Array.isArray(req.style_tokens) ? req.style_tokens.join('、') : req.style_tokens));
      if (req.layout_tokens) parts.push('布局: ' + (Array.isArray(req.layout_tokens) ? req.layout_tokens.join('、') : req.layout_tokens));
      if (req.constraints) parts.push('约束: ' + (Array.isArray(req.constraints) ? req.constraints.join('、') : req.constraints));
      if (negative) parts.push('避免: ' + negative);
      prompt = parts.filter(Boolean).join('。');
    }
  }

  const apiKey = process.env.ARK_API_KEY;
  const model = process.env.ARK_IMAGE_MODEL;
  const baseUrl = process.env.ARK_IMAGE_BASE_URL || DEFAULT_URL;

  if (!apiKey) {
    console.error('missing ARK_API_KEY (set in ~/.openclaw/.env or env)');
    process.exit(2);
  }
  if (!model) {
    console.error('missing ARK_IMAGE_MODEL (endpoint id ep-... from Ark console)');
    process.exit(2);
  }
  if (!prompt) {
    console.error('missing --prompt or request-json.prompt');
    process.exit(2);
  }

  prompt = sanitizePrompt(prompt);
  const safeScene = String(scene).replace(/[^\w\u4e00-\u9fff.-]+/g, '_').slice(0, 64) || 'scene';

  const outRoot =
    args.outDir ||
    path.join(process.cwd(), 'doc', 'assets', 'ui-gen');
  const sceneDir = path.join(outRoot, safeScene);
  fs.mkdirSync(sceneDir, { recursive: true });

  const body = {
    model,
    prompt,
    response_format: 'url',
    size,
    stream: false,
    watermark: args.watermark,
  };

  const result = await httpJson(
    'POST',
    baseUrl,
    { Authorization: 'Bearer ' + apiKey },
    body,
  );

  const url =
    (result.data && result.data[0] && (result.data[0].url || result.data[0].b64_json)) ||
    result.url ||
    null;
  if (!url || String(url).startsWith('data:')) {
    // b64 path
  }
  if (!url) {
    console.error('no image url in response: ' + JSON.stringify(result).slice(0, 400));
    process.exit(2);
  }

  const hash = crypto.createHash('sha256').update(prompt + Date.now()).digest('hex').slice(0, 12);
  const imageKey = `${safeScene}-${hash}`;
  let imagePath = '';

  if (args.download && String(url).startsWith('http')) {
    imagePath = path.join(sceneDir, imageKey + '.png');
    await downloadFile(url, imagePath);
  } else {
    imagePath = String(url);
  }

  const metaLine = {
    ts: new Date().toISOString(),
    scene: safeScene,
    image_key: imageKey,
    image_path: imagePath,
    model,
    size,
    prompt,
  };
  const metaFile = path.join(outRoot, 'metadata.jsonl');
  fs.appendFileSync(metaFile, JSON.stringify(metaLine) + '\n', 'utf8');

  process.stdout.write(
    JSON.stringify(
      {
        ok: true,
        scene: safeScene,
        image_key: imageKey,
        image_path: imagePath,
        model,
        metadata_path: metaFile,
      },
      null,
      2,
    ) + '\n',
  );
}

main().catch((e) => {
  console.error(String(e.message || e));
  process.exit(1);
});

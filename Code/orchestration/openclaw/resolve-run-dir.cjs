#!/usr/bin/env node
/**
 * resolve-run-dir.cjs — 解析 M0 路径选择并校验白名单
 *
 * 用法:
 *   node resolve-run-dir.cjs --shortname openapi-x --choice default
 *   node resolve-run-dir.cjs --shortname openapi-x --choice preset:fusion-doc
 *   node resolve-run-dir.cjs --shortname openapi-x --path "D:\\trae_git\\...\\run-foo"
 *   node resolve-run-dir.cjs --shortname openapi-x --from-text "run_dir=D:\\..."
 *
 * 成功 stdout: JSON { ok, runDir, source, preset? }
 * 失败 exit 2 + JSON { ok:false, error, message }
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname);
const PRESETS_PATH = path.join(ROOT, 'run-dir-presets.yaml');

function die(obj) {
  process.stdout.write(JSON.stringify(obj, null, 2) + '\n');
  process.exit(2);
}

function loadPresets() {
  const raw = fs.readFileSync(PRESETS_PATH, 'utf8');
  // minimal YAML subset (no full parser dependency)
  const presets = {};
  let defaultPreset = 'phase4';
  const allowRoots = [];
  let section = null;
  let curPreset = null;
  for (const line of raw.split(/\r?\n/)) {
    if (/^\s*#/.test(line) || !line.trim()) continue;
    const def = line.match(/^defaultPreset:\s*["']?([^"'\s#]+)/);
    if (def) {
      defaultPreset = def[1];
      continue;
    }
    if (/^allowRoots:/.test(line)) {
      section = 'allow';
      curPreset = null;
      continue;
    }
    if (/^presets:/.test(line)) {
      section = 'presets';
      curPreset = null;
      continue;
    }
    if (section === 'allow') {
      const m = line.match(/^\s*-\s*["']([^"']+)["']/);
      if (m) allowRoots.push(m[1].replace(/\\\\/g, '\\'));
      continue;
    }
    if (section === 'presets') {
      const id = line.match(/^\s{2}([a-zA-Z0-9_-]+):\s*$/);
      if (id) {
        curPreset = id[1];
        presets[curPreset] = {};
        continue;
      }
      if (curPreset) {
        const lab = line.match(/^\s+label:\s*["']([^"']+)["']/);
        if (lab) presets[curPreset].label = lab[1];
        const root = line.match(/^\s+root:\s*["']([^"']+)["']/);
        if (root) presets[curPreset].root = root[1].replace(/\\\\/g, '\\');
      }
    }
  }
  return { defaultPreset, allowRoots, presets };
}

function todayStamp() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

function normalizeShort(s) {
  const t = String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (!t || t.length > 48) {
    die({ ok: false, error: 'BAD_SHORT', message: 'shortname 须为 1～48 位字母数字_- ' });
  }
  return t;
}

function underAllow(abs, allowRoots) {
  const n = path.resolve(abs).replace(/\//g, '\\').toLowerCase();
  return allowRoots.some((r) => {
    const root = path.resolve(r).replace(/\//g, '\\').toLowerCase();
    return n === root || n.startsWith(root + '\\');
  });
}

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--shortname') out.shortname = argv[++i];
    else if (a === '--choice') out.choice = argv[++i];
    else if (a === '--path') out.path = argv[++i];
    else if (a === '--from-text') out.fromText = argv[++i];
    else if (a === '--date') out.date = argv[++i];
    else if (a === '--mkdir') out.mkdir = true;
  }
  return out;
}

function parseFromText(text) {
  const t = String(text || '').trim();
  // button callback values
  const choice = t.match(/run_dir_choice\s*=\s*([^\s]+)/i);
  if (choice) return { choice: choice[1] };
  const pathEq = t.match(/run_dir\s*=\s*(.+)$/im);
  if (pathEq) return { path: pathEq[1].trim().replace(/^["']|["']$/g, '') };
  if (/^(默认|default|用默认)/i.test(t)) return { choice: 'default' };
  return null;
}

function main() {
  const args = parseArgs(process.argv);
  const cfg = loadPresets();
  let choice = args.choice;
  let customPath = args.path;

  if (args.fromText) {
    const parsed = parseFromText(args.fromText);
    if (!parsed) {
      die({
        ok: false,
        error: 'UNPARSED',
        message: '无法解析；请点卡片按钮，或回复 run_dir=<绝对路径> / 默认'
      });
    }
    if (parsed.choice) choice = parsed.choice;
    if (parsed.path) customPath = parsed.path;
  }

  const shortname = normalizeShort(args.shortname || 'req');
  const stamp = args.date || todayStamp();
  const folderName = `run-${shortname}-${stamp}`;

  let runDir;
  let source;
  let presetId;

  if (customPath) {
    runDir = path.resolve(customPath);
    source = 'custom';
  } else {
    let id = choice || 'default';
    if (id === 'default') id = cfg.defaultPreset;
    if (id.startsWith('preset:')) id = id.slice('preset:'.length);
    const p = cfg.presets[id];
    if (!p || !p.root) {
      die({ ok: false, error: 'BAD_PRESET', message: `未知预设: ${id}` });
    }
    runDir = path.join(path.resolve(p.root), folderName);
    source = 'preset';
    presetId = id;
  }

  if (runDir.includes('..')) {
    die({ ok: false, error: 'BAD_PATH', message: '路径不得含 ..' });
  }
  if (!underAllow(runDir, cfg.allowRoots)) {
    die({
      ok: false,
      error: 'NOT_ALLOWED',
      message: `路径不在 allowRoots 内: ${runDir}`,
      allowRoots: cfg.allowRoots
    });
  }

  if (args.mkdir) {
    fs.mkdirSync(runDir, { recursive: true });
  }

  const result = {
    ok: true,
    runDir,
    source,
    shortname,
    folderName,
    date: stamp
  };
  if (presetId) result.preset = presetId;
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}

main();

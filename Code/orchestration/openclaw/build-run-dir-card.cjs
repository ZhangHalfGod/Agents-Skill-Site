#!/usr/bin/env node
/**
 * build-run-dir-card.cjs — 生成 M0 飞书 presentation JSON（OpenClaw Message Presentation）
 *
 * 用法:
 *   node build-run-dir-card.cjs --shortname openapi-voice [--date 20260731] [--print]
 *   node build-run-dir-card.cjs ... --send --target oc_xxx   # 调 openclaw message send
 *
 * 按钮 value 约定（点按后作为用户消息注入会话）:
 *   run_dir_choice=default
 *   run_dir_choice=preset:<id>
 * 自定义路径：用户再发一条 run_dir=D:\...
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const PRESETS_PATH = path.join(__dirname, 'run-dir-presets.yaml');

function todayStamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
}

function loadPresetMeta() {
  const raw = fs.readFileSync(PRESETS_PATH, 'utf8');
  let defaultPreset = 'phase4';
  const presets = [];
  let cur = null;
  for (const line of raw.split(/\r?\n/)) {
    if (/^\s*#/.test(line) || !line.trim()) continue;
    const def = line.match(/^defaultPreset:\s*["']?([^"'\s#]+)/);
    if (def) {
      defaultPreset = def[1];
      continue;
    }
    if (/^presets:/.test(line)) continue;
    const id = line.match(/^\s{2}([a-zA-Z0-9_-]+):\s*$/);
    if (id) {
      cur = { id: id[1], label: id[1], root: '' };
      presets.push(cur);
      continue;
    }
    if (cur) {
      const lab = line.match(/^\s+label:\s*["']([^"']+)["']/);
      if (lab) cur.label = lab[1];
      const root = line.match(/^\s+root:\s*["']([^"']+)["']/);
      if (root) cur.root = root[1].replace(/\\\\/g, '\\');
    }
  }
  return { defaultPreset, presets };
}

function parseArgs(argv) {
  const out = { print: false, send: false, dryRun: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--shortname') out.shortname = argv[++i];
    else if (a === '--date') out.date = argv[++i];
    else if (a === '--target') out.target = argv[++i];
    else if (a === '--print') out.print = true;
    else if (a === '--send') out.send = true;
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--message') out.message = argv[++i];
  }
  return out;
}

function buildPresentation({ shortname, date, meta }) {
  const stamp = date || todayStamp();
  const folder = `run-${shortname}-${stamp}`;
  const lines = [
    `需求短名：**${shortname}**`,
    `建议目录名：\`${folder}\``,
    '',
    '请选择痕迹目录（run-dir），选完后流水线才进入 H1。',
    '自定义路径请**另发一条消息**：`run_dir=D:\\\\trae_git\\\\...`（须在白名单根下）。',
    '',
    '预设根目录：'
  ];
  for (const p of meta.presets) {
    // 展示用正斜杠，避免 Feishu markdown 把 \r 当成回车（曾显示成 phase4 un-swagger...）
    const shown = `${p.root.replace(/\\/g, '/')}/${folder}`;
    lines.push(`- **${p.label}**（\`${p.id}\`）：\`${shown}\``);
  }

  const buttons = [
    {
      // 「推荐」= 默认预设，不是选中态。飞书卡点按后不会改按钮文案。
      label: `推荐 · ${meta.presets.find((p) => p.id === meta.defaultPreset)?.label || '默认'}`,
      value: 'run_dir_choice=default',
      style: 'success'
    }
  ];
  for (const p of meta.presets) {
    if (p.id === meta.defaultPreset) continue;
    buttons.push({
      label: p.label,
      value: `run_dir_choice=preset:${p.id}`,
      style: 'primary'
    });
  }

  return {
    title: 'M0 · 指定 run-dir',
    tone: 'warning',
    blocks: [
      { type: 'text', text: lines.join('\n') },
      { type: 'divider' },
      { type: 'buttons', buttons },
      {
        type: 'context',
        text: '点按钮即选定（卡片不会改成打勾；以 bot 下一轮确认为准）。自定义请回复 run_dir=<绝对路径>。首条可内嵌 run_dir= 跳过 M0。'
      }
    ]
  };
}

function main() {
  const args = parseArgs(process.argv);
  const shortname = String(args.shortname || 'req')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'req';
  const meta = loadPresetMeta();
  const presentation = buildPresentation({
    shortname,
    date: args.date,
    meta
  });
  const fallback =
    args.message ||
    `【M0】请选择 run-dir：点卡片按钮，或回复 run_dir=<路径> / 默认（短名=${shortname}）`;

  if (args.print || !args.send) {
    process.stdout.write(JSON.stringify({ presentation, fallbackMessage: fallback }, null, 2) + '\n');
  }

  if (args.send) {
    if (!args.target) {
      console.error(' --send 需要 --target <feishu chat id，如 oc_...>');
      process.exit(2);
    }
    const openclawJs = process.env.OPENCLAW_ENTRY ||
      path.join(process.env.NVM_SYMLINK || 'C:\\nvm4w\\nodejs', 'node_modules', 'openclaw', 'openclaw.mjs');
    const nodeBin = process.execPath;
    const cliArgs = [
      openclawJs,
      'message',
      'send',
      '--channel',
      'feishu',
      '--target',
      args.target,
      '--message',
      fallback,
      '--presentation',
      JSON.stringify(presentation)
    ];
    if (args.dryRun) cliArgs.push('--dry-run');
    const r = spawnSync(nodeBin, cliArgs, { encoding: 'utf8' });
    if (r.stdout) process.stdout.write(r.stdout);
    if (r.stderr) process.stderr.write(r.stderr);
    process.exit(r.status || 0);
  }
}

main();

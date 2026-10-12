#!/usr/bin/env node
/**
 * check-h3-done.cjs — 判断 H3 是否已可进 H4（以磁盘为准，不靠飞书 wake）
 *
 *   node check-h3-done.cjs --run-dir <run-dir>
 *
 * ok 条件（满足其一即可 done=true）：
 *   - h3-dev.raw.txt 含「## 本次结果摘要」或 chatId= + 非空正文
 *   - 可选：--expect-commit 时 git -C workdir log -1 含 [AI生成]，且 commit 时间 >= 本 run watch 登记时间（防跨 run 误判）
 *
 * stdout: JSON { done, reason, rawPath, rawBytes, hints[] }
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function parseArgs(argv) {
  const out = { runDir: '', workDir: '', expectCommit: false };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--run-dir') out.runDir = argv[++i] || '';
    else if (argv[i] === '--work-dir') out.workDir = argv[++i] || '';
    else if (argv[i] === '--expect-commit') out.expectCommit = true;
  }
  return out;
}

function main() {
  const args = parseArgs(process.argv);
  if (!args.runDir) {
    console.error('usage: node check-h3-done.cjs --run-dir <path> [--work-dir <repo>] [--expect-commit]');
    process.exit(2);
  }
  const rawPath = path.join(args.runDir, 'h3-dev.raw.txt');
  const hints = [];
  let done = false;
  let reason = 'no_raw';
  let rawBytes = 0;

  if (fs.existsSync(rawPath)) {
    const raw = fs.readFileSync(rawPath, 'utf8');
    rawBytes = Buffer.byteLength(raw, 'utf8');
    if (/##\s*本次结果摘要/.test(raw) || /##\s*当前进度/.test(raw)) {
      done = true;
      reason = 'raw_has_summary';
    } else if (rawBytes > 200 && /chatId=/.test(raw)) {
      done = true;
      reason = 'raw_has_chat_body';
      hints.push('raw has chatId but no 本次结果摘要 — verify manually before H4');
    } else if (rawBytes > 0) {
      reason = 'raw_partial';
      hints.push('raw exists but incomplete; wait or re-run H3 with -Fresh');
    }
  } else {
    hints.push('missing h3-dev.raw.txt — H3 not finished or wrapper not used');
  }

  if (args.expectCommit && args.workDir) {
    const r = spawnSync('git', ['-C', args.workDir, 'log', '-1', '--oneline'], {
      encoding: 'utf8',
    });
    const line = (r.stdout || '').trim();
    if (/\[AI生成\]/.test(line)) {
      hints.push('latest commit: ' + line);
      if (!done && line) {
        // 守卫：仓库 HEAD 可能携带其他 run 的 [AI生成] commit（如并行/先后 run 共用同一 repo）。
        // 只有 commit 时间 >= 本 run 的 watch 登记时间，才视为本 run 的 H3 产物，否则判定为误报。
        const tsR = spawnSync('git', ['-C', args.workDir, 'log', '-1', '--format=%cI'], {
          encoding: 'utf8',
        });
        const commitMs = Date.parse((tsR.stdout || '').trim());
        let runStartMs = null;
        try {
          const watch = JSON.parse(fs.readFileSync(path.join(args.runDir, 'h3-watch.json'), 'utf8'));
          if (watch.startedAt) runStartMs = Date.parse(watch.startedAt);
        } catch {
          /* 无 watch 文件时保持旧行为 */
        }
        if (!runStartMs || !commitMs || commitMs >= runStartMs) {
          done = true;
          reason = 'ai_commit_present';
        } else {
          hints.push(
            'HEAD [AI生成] commit (' + (tsR.stdout || '').trim() + ') predates run start (' +
              (runStartMs ? new Date(runStartMs).toISOString() : '?') +
              ') — belongs to another run; this run H3 not done',
          );
        }
      }
    } else {
      hints.push('no [AI生成] in git log -1: ' + line);
    }
  }

  process.stdout.write(
    JSON.stringify({ done, reason, rawPath, rawBytes, hints }, null, 2) + '\n',
  );
  process.exit(done ? 0 : 1);
}

main();

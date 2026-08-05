#!/usr/bin/env node
/** patch-h3-watch-cron.cjs — Windows 下修正 pipeline-h3-watch cron 的 command-argv */
'use strict';
const { spawnSync } = require('child_process');
const path = require('path');

const JOB = process.argv[2] || '';
const mjs = 'C:/nvm4w/nodejs/node_modules/openclaw/openclaw.mjs';
const poll = path.join(__dirname, 'poll-h3-watch.cjs').replace(/\\/g, '/');
const argvJson = JSON.stringify(['node', poll, '--once', '--auto-start-h3', '--trigger-h4', '--quiet']);

const args = [mjs, 'cron', 'edit'];
if (JOB) args.push(JOB);
else {
  console.error('usage: node patch-h3-watch-cron.cjs <job-id>');
  process.exit(2);
}
args.push('--command-argv', argvJson);

const r = spawnSync(process.execPath, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
if (r.stdout) process.stdout.write(r.stdout);
if (r.stderr) process.stderr.write(r.stderr);
process.exit(r.status === null ? 1 : r.status);

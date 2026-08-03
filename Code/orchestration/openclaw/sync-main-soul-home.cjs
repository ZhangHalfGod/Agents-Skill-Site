/**
 * Sync pipeline + promote section into Home OpenClaw SOUL.md (local paths).
 * Usage: node Code/orchestration/openclaw/sync-main-soul-home.cjs
 */
const fs = require("fs");
const path = require("path");

const SITE = path.resolve(__dirname, "../../..");
const DRAFT = path.join(SITE, "Code/orchestration/prompts/orchestrator-main-soul.draft.md");

const START = "# === OpenClaw 流水线编排段";
const END = "# === /OpenClaw 流水线编排段 ===";

const TARGETS = [
  path.join("E:/zhangchangWork/Work_Space/Trae_Study/openclaw_trae_cursor/.openclaw/workspace/SOUL.md"),
  path.join(process.env.USERPROFILE || "", ".openclaw/workspace/SOUL.md"),
];

function toHomePaths(text) {
  return text
    .replace(/\/Users\/zhangchang\/Documents\/trae_projects\/Agents-Skill-Site/g, "E:\\zhangchangWork\\Work_Space\\Trae_Study\\Agents-Skill-Site")
    .replace(/\/Users\/zhangchang\/\.openclaw\/workspace\/invoke-cursor-agent\.ps1/g, "E:\\zhangchangWork\\Work_Space\\Trae_Study\\openclaw_trae_cursor\\.openclaw\\workspace\\invoke-cursor-agent.ps1");
}

function buildBlock() {
  const raw = fs.readFileSync(DRAFT, "utf8");
  const body = toHomePaths(raw).trimEnd();
  return [
    `${START}（v1.4+promote · Home 同步）===`,
    "",
    body,
    "",
    END,
    "",
  ].join("\n");
}

function stripAllPipelineBlocks(text) {
  let out = text;
  // Remove every start..end pair (greedy per pair, loop until gone)
  for (;;) {
    const i = out.indexOf(START);
    if (i < 0) break;
    const j = out.indexOf(END, i);
    if (j < 0) {
      // orphan start without end: drop from start to EOF
      out = out.slice(0, i).replace(/\s+$/, "") + "\n";
      break;
    }
    out = out.slice(0, i) + out.slice(j + END.length);
  }
  return out.replace(/\n{3,}/g, "\n\n").replace(/\s+$/, "") + "\n\n";
}

function syncOne(target) {
  if (!fs.existsSync(target)) {
    console.error("SKIP missing", target);
    return;
  }
  const before = fs.readFileSync(target, "utf8");
  const base = stripAllPipelineBlocks(before);
  const next = base + buildBlock();
  fs.writeFileSync(target, next, "utf8");
  const after = fs.readFileSync(target, "utf8");
  const starts = (after.match(new RegExp(START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length;
  console.log("SYNCED", target);
  console.log(
    "  blocks=",
    starts,
    "hasPromote=",
    after.includes("升格流水线模式"),
    "has同意蒸馏=",
    after.includes("同意蒸馏"),
    "hasHomePath=",
    after.includes("E:\\zhangchangWork\\Work_Space\\Trae_Study\\Agents-Skill-Site"),
    "hasBmPath=",
    after.includes("/Users/zhangchang/Documents/trae_projects/Agents-Skill-Site"),
    "lines=",
    after.split(/\r?\n/).length
  );
}

const block = buildBlock();
if (!block.includes("同意蒸馏") || !block.includes("升格流水线模式")) {
  console.error("FATAL: draft missing promote/同意蒸馏");
  process.exit(1);
}

for (const t of TARGETS) syncOne(t);

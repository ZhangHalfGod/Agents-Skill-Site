'use strict';

const fs = require('fs');
const path = require('path');

const DEFAULT_PRICING = path.join(__dirname, 'pricing.yaml');

function parseSimpleYaml(text) {
  // Minimal subset: maps/lists/scalars used by pricing.yaml + cost-ledger.yaml
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  const root = {};
  const stack = [{ indent: -1, value: root, kind: 'map' }];

  function current() {
    return stack[stack.length - 1];
  }

  function setMap(obj, key, val) {
    obj[key] = val;
  }

  for (let raw of lines) {
    if (!raw.trim() || /^\s*#/.test(raw)) continue;
    const indent = raw.match(/^\s*/)[0].length;
    const line = raw.trim();

    while (stack.length > 1 && indent <= current().indent) stack.pop();
    const ctx = current();

    if (line.startsWith('- ')) {
      const rest = line.slice(2);
      if (!Array.isArray(ctx.value)) {
        throw new Error('yaml: list item outside list: ' + line);
      }
      if (rest.includes(':') && !rest.startsWith('"') && !rest.startsWith("'")) {
        const obj = {};
        ctx.value.push(obj);
        const [k, ...vr] = rest.split(':');
        const v = vr.join(':').trim();
        if (v === '' || v === null) {
          // nested — leave empty; next indented lines fill
          setMap(obj, k.trim(), null);
          stack.push({ indent, value: obj, kind: 'map', pendingKey: k.trim() });
        } else {
          setMap(obj, k.trim(), parseScalar(v));
          stack.push({ indent, value: obj, kind: 'map' });
        }
      } else {
        ctx.value.push(parseScalar(rest));
      }
      continue;
    }

    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const rhs = line.slice(colon + 1).trim();

    if (ctx.kind === 'map' && ctx.pendingKey && rhs === '') {
      // ignore
    }

    if (rhs === '') {
      // peek next non-empty to decide list vs map — default map, upgrade if list
      const peek = peekNext(lines, lines.indexOf(raw) + 1);
      if (peek && peek.trim().startsWith('- ')) {
        const arr = [];
        setMap(ctx.value, key, arr);
        stack.push({ indent, value: arr, kind: 'list' });
      } else {
        const obj = {};
        setMap(ctx.value, key, obj);
        stack.push({ indent, value: obj, kind: 'map' });
      }
    } else {
      setMap(ctx.value, key, parseScalar(rhs));
    }
  }
  return root;
}

function peekNext(lines, from) {
  for (let i = from; i < lines.length; i++) {
    if (lines[i].trim() && !/^\s*#/.test(lines[i])) return lines[i];
  }
  return null;
}

function parseScalar(s) {
  if (s === 'null' || s === '~') return null;
  if (s === 'true') return true;
  if (s === 'false') return false;
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  return s;
}

function toYaml(value, indent = 0) {
  const pad = '  '.repeat(indent);
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') {
    if (value === '' || /[:#\n\r]|^\s|\s$/.test(value)) {
      return JSON.stringify(value);
    }
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return '[]';
    return value
      .map((item) => {
        if (item !== null && typeof item === 'object' && !Array.isArray(item)) {
          const keys = Object.keys(item);
          if (!keys.length) return pad + '- {}';
          const first = keys[0];
          const rest = keys.slice(1);
          let out = pad + '- ' + first + ': ' + formatInlineOrBlock(item[first], indent + 1);
          for (const k of rest) {
            out += '\n' + pad + '  ' + k + ': ' + formatInlineOrBlock(item[k], indent + 2);
          }
          return out;
        }
        return pad + '- ' + toYaml(item, indent + 1);
      })
      .join('\n');
  }
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (!keys.length) return '{}';
    return keys
      .map((k) => {
        const v = value[k];
        if (v !== null && typeof v === 'object') {
          const body = toYaml(v, indent + 1);
          if (body === '[]' || body === '{}') return pad + k + ': ' + body;
          return pad + k + ':\n' + body;
        }
        return pad + k + ': ' + toYaml(v, indent + 1);
      })
      .join('\n');
  }
  return String(value);
}

function formatInlineOrBlock(v, indent) {
  if (v !== null && typeof v === 'object') {
    const body = toYaml(v, indent);
    if (body === '[]' || body === '{}') return body;
    return '\n' + body;
  }
  return toYaml(v, indent);
}

function loadPricing(pricingPath = DEFAULT_PRICING) {
  const raw = fs.readFileSync(pricingPath, 'utf8');
  const doc = parseSimpleYaml(raw);
  const models = Array.isArray(doc.models) ? doc.models : [];
  const byId = new Map();
  for (const m of models) {
    if (m && m.model_id) byId.set(String(m.model_id), m);
  }
  return { doc, byId, path: pricingPath };
}

function normalizeModelId(provider, modelId) {
  const m = String(modelId || '');
  if (m.includes('/')) return m;
  if (provider === 'deepseek' || m.startsWith('deepseek')) {
    return m.startsWith('deepseek/') ? m : `deepseek/${m.replace(/^deepseek\//, '')}`;
  }
  return m;
}

function computeCost(tokens, modelRow) {
  if (!modelRow) {
    return { amount: null, currency: null, billing_mode: 'unknown', pricing_ref: null };
  }
  const mode = modelRow.billing_mode || 'token';
  const currency = modelRow.currency || 'USD';
  const ref = `${modelRow.model_id}@${modelRow.as_of || 'pricing'}`;
  if (mode === 'subscription') {
    return { amount: 0, currency, billing_mode: mode, pricing_ref: ref };
  }
  const input = Number(tokens.input || 0);
  const output = Number(tokens.output || 0);
  const cached = Number(tokens.cached_input || tokens.cacheRead || 0);
  const inPrice = Number(modelRow.input_per_1m);
  const outPrice = Number(modelRow.output_per_1m);
  const cachePrice =
    modelRow.cached_input_per_1m == null ? inPrice : Number(modelRow.cached_input_per_1m);
  if (!Number.isFinite(inPrice) || !Number.isFinite(outPrice)) {
    return { amount: null, currency, billing_mode: mode, pricing_ref: ref };
  }
  const amount =
    (input / 1e6) * inPrice + (cached / 1e6) * cachePrice + (output / 1e6) * outPrice;
  return {
    amount: roundMoney(amount),
    currency,
    billing_mode: mode,
    pricing_ref: ref,
  };
}

function roundMoney(n) {
  return Math.round(n * 1e6) / 1e6;
}

function emptyLedger(meta = {}) {
  const now = new Date().toISOString();
  return {
    schema_version: 1,
    run_id: meta.run_id || 'unknown',
    project: meta.project || '',
    currency_primary: meta.currency_primary || 'USD',
    created_at: now,
    updated_at: now,
    status: 'open',
    hops: [],
    quality: { retry_count: 0, h3_pass: false, human_override: false },
    totals: emptyTotals(),
    recommendations: [],
  };
}

function emptyTotals() {
  return {
    tokens_input: 0,
    tokens_output: 0,
    tokens_cached_input: 0,
    tokens_total: 0,
    cost_by_provider: {
      deepseek: { amount: 0, currency: 'USD' },
      cursor: { amount: 0, currency: 'USD' },
    },
    cost_primary: { amount: 0, currency: 'USD' },
    fx: { USD_CNY: null, as_of: null },
    hop_count: 0,
    failed_hops: 0,
  };
}

function recomputeTotals(ledger) {
  const t = emptyTotals();
  t.fx = (ledger.totals && ledger.totals.fx) || t.fx;
  for (const h of ledger.hops || []) {
    t.hop_count += 1;
    if (h.ok === false) t.failed_hops += 1;
    const tok = h.tokens || {};
    t.tokens_input += Number(tok.input || 0);
    t.tokens_output += Number(tok.output || 0);
    t.tokens_cached_input += Number(tok.cached_input || 0);
    t.tokens_total += Number(tok.total || (tok.input || 0) + (tok.output || 0) + (tok.cached_input || 0));
    const amt = h.cost && h.cost.amount != null ? Number(h.cost.amount) : 0;
    const cur = (h.cost && h.cost.currency) || 'USD';
    const prov = h.provider || 'other';
    if (!t.cost_by_provider[prov]) t.cost_by_provider[prov] = { amount: 0, currency: cur };
    t.cost_by_provider[prov].amount = roundMoney(t.cost_by_provider[prov].amount + amt);
    t.cost_primary.amount = roundMoney(t.cost_primary.amount + amt);
    t.cost_primary.currency = ledger.currency_primary || cur;
  }
  ledger.totals = t;
  ledger.updated_at = new Date().toISOString();
  return ledger;
}

function ledgerPath(runDir) {
  return path.join(runDir, 'cost-ledger.yaml');
}

function loadLedger(runDir, meta) {
  const p = ledgerPath(runDir);
  if (!fs.existsSync(p)) return emptyLedger(meta);
  const doc = parseSimpleYaml(fs.readFileSync(p, 'utf8'));
  if (!doc.hops) doc.hops = [];
  return doc;
}

function saveLedger(runDir, ledger) {
  fs.mkdirSync(runDir, { recursive: true });
  const p = ledgerPath(runDir);
  const body = toYaml(ledger) + '\n';
  fs.writeFileSync(p, body, 'utf8');
  return p;
}

function summarizeLine(ledger) {
  const t = ledger.totals || emptyTotals();
  const ds = t.cost_by_provider.deepseek || { amount: 0, currency: 'USD' };
  const cu = t.cost_by_provider.cursor || { amount: 0, currency: 'USD' };
  return (
    `本 Run 成本：DeepSeek $${Number(ds.amount || 0).toFixed(4)}` +
    ` · Cursor $${Number(cu.amount || 0).toFixed(4)}（包月则多为 0）` +
    ` · 合计 $${Number(t.cost_primary.amount || 0).toFixed(4)}` +
    ` · tokens in/out/cache ${t.tokens_input}/${t.tokens_output}/${t.tokens_cached_input}` +
    ` · 跳数 ${t.hop_count}`
  );
}

function openclawHome() {
  return process.env.OPENCLAW_HOME || path.join(process.env.USERPROFILE || process.env.HOME || '', '.openclaw');
}

module.exports = {
  DEFAULT_PRICING,
  parseSimpleYaml,
  toYaml,
  loadPricing,
  normalizeModelId,
  computeCost,
  emptyLedger,
  recomputeTotals,
  loadLedger,
  saveLedger,
  ledgerPath,
  summarizeLine,
  openclawHome,
  roundMoney,
};

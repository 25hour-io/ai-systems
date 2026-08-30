#!/usr/bin/env node
/**
 * Comm Digest — payload preservation harness.
 *
 * Measures the one guardrail this repository calls `Constrained`: the system prompt tells the
 * model to reproduce actionable payloads verbatim, and nothing downstream checks that it did.
 * This harness checks it, mechanically.
 *
 * Every assertion is an exact substring match against the model output. No model judges another
 * model here — a judge would inherit the very failure mode being measured.
 *
 * Usage:
 *   node run.mjs                      # all cases
 *   node run.mjs --limit 5            # smoke run
 *   node run.mjs --model <id>         # override the model
 *   node run.mjs --out results.json   # machine-readable results
 *
 * The provider is chosen from whichever key is present: ANTHROPIC_API_KEY, else OPENAI_API_KEY.
 * The production workflow runs on Claude Sonnet; README.md records which model produced the
 * published numbers.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (name, fallback = null) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback;
};

const SYSTEM = readFileSync(join(HERE, "..", "system-prompt.md"), "utf8");
const CASES = readFileSync(join(HERE, "cases.jsonl"), "utf8")
  .split("\n")
  .filter(Boolean)
  .map((l) => JSON.parse(l));

const LIMIT = Number(arg("limit", 0));
const SELECTED = LIMIT > 0 ? CASES.slice(0, LIMIT) : CASES;

/* ---------------------------------------------------------------- providers */

const PROVIDERS = {
  anthropic: {
    key: "ANTHROPIC_API_KEY",
    defaultModel: "claude-sonnet-4-5-20250929",
    async call(model, system, user, apiKey) {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model,
          max_tokens: 2000,
          system,
          messages: [{ role: "user", content: user }],
        }),
      });
      if (!r.ok) throw new Error(`anthropic ${r.status}: ${(await r.text()).slice(0, 300)}`);
      const j = await r.json();
      return (j.content ?? []).map((b) => b.text ?? "").join("");
    },
  },
  openai: {
    key: "OPENAI_API_KEY",
    defaultModel: "gpt-4o",
    async call(model, system, user, apiKey) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          max_tokens: 2000,
          temperature: 0,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        }),
      });
      if (!r.ok) throw new Error(`openai ${r.status}: ${(await r.text()).slice(0, 300)}`);
      const j = await r.json();
      return j.choices?.[0]?.message?.content ?? "";
    },
  },
};

/**
 * Retry on rate limits and transient 5xx. A 429 is the harness hitting a quota, never a finding
 * about the system under test — counting it as a failure would corrupt the measurement.
 */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(fn, { tries = 6, base = 4000 } = {}) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (e) {
      last = e;
      const msg = String(e.message ?? e);
      const transient = / 429:| 500:| 502:| 503:| 529:/.test(msg);
      if (!transient || i === tries - 1) throw e;
      const suggested = msg.match(/try again in ([0-9.]+)s/);
      const wait = suggested ? Math.ceil(Number(suggested[1]) * 1000) + 2000 : base * 2 ** i;
      process.stderr.write(`          rate limited, waiting ${Math.round(wait / 1000)}s\n`);
      await sleep(wait);
    }
  }
  throw last;
}

function pickProvider() {
  for (const [name, p] of Object.entries(PROVIDERS)) {
    if (process.env[p.key]) return { name, ...p, apiKey: process.env[p.key] };
  }
  throw new Error("No API key found. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.");
}

/* ------------------------------------------------------------------ scoring */

/** The prompt's own empty-result contract: a context sentence, then this conclusion. */
const EMPTY_MARK = /no relevant messages/i;
/** The prompt's own ambiguity contract. */
const MARKER = /\(to be confirmed\)/i;
/** A digest block, per the prompt's output format. */
const hasBlock = (out) => /^\s*\*?(From|Message)\*?\s*:/im.test(out);

function score(c, out) {
  const checks = [];
  for (const p of c.payloads) {
    checks.push({ kind: "payload", needle: p, pass: out.includes(p) });
  }
  if (c.expect_empty) {
    checks.push({ kind: "noise_rejection", needle: "no digest block", pass: !hasBlock(out) });
    checks.push({ kind: "empty_case_explained", needle: "No relevant messages", pass: EMPTY_MARK.test(out) });
  }
  if (c.expect_marker) {
    checks.push({ kind: "ambiguity_marked", needle: "(to be confirmed)", pass: MARKER.test(out) });
  }
  return checks;
}

/**
 * Invention check, deliberately narrow so it cannot raise false alarms.
 * Any URL, email address or long digit run in the OUTPUT must appear in the INPUT.
 * Placeholders defined by the prompt itself are excluded.
 */
const EXTRACTORS = [
  /https?:\/\/[^\s<>"')\]]+/g,
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g,
  /\b\d[\d.,]{4,}\b/g,
];

function inventions(input, out) {
  const found = [];
  for (const re of EXTRACTORS) {
    for (const m of out.match(re) ?? []) {
      const clean = m.replace(/[.,;:]+$/, "");
      if (clean.length < 5) continue;
      if (/EXAMPLE-INVITE-LINK|05X-XXXXXXX/.test(clean)) continue;
      if (!input.includes(clean)) found.push(clean);
    }
  }
  return [...new Set(found)];
}

/* --------------------------------------------------------------------- main */

const provider = pickProvider();
const model = arg("model", provider.defaultModel);

console.error(`[evals] provider=${provider.name} model=${model} cases=${SELECTED.length}`);

const results = [];
for (const [i, c] of SELECTED.entries()) {
  const user = `Here are the latest channel messages (1 message):\n\n[Channel: Operations]\n${c.message}`;
  let out = "";
  let error = null;
  try {
    out = await withRetry(() => provider.call(model, SYSTEM, user, provider.apiKey));
  } catch (e) {
    error = String(e.message ?? e);
  }
  const checks = error ? [] : score(c, out);
  const invented = error ? [] : inventions(c.message, out);
  const ok = !error && checks.every((k) => k.pass) && invented.length === 0;
  results.push({ ...c, output: out, error, checks, invented, ok });

  process.stderr.write(`  ${ok ? "PASS" : "FAIL"}  ${String(i + 1).padStart(2)}/${SELECTED.length}  ${c.id}\n`);
  for (const k of checks.filter((k) => !k.pass)) {
    process.stderr.write(`          missing ${k.kind}: ${k.needle}\n`);
  }
  for (const v of invented) process.stderr.write(`          INVENTED: ${v}\n`);
  if (error) process.stderr.write(`          ERROR: ${error}\n`);

  // The system prompt is ~7k tokens, so a per-minute token quota is the binding constraint.
  // Pace the calls rather than discovering the ceiling one 429 at a time.
  if (i < SELECTED.length - 1) await sleep(Number(arg("pace", 9000)));
}

const allChecks = results.flatMap((r) => r.checks);
const byKind = (kind) => {
  const s = allChecks.filter((k) => k.kind === kind);
  return { pass: s.filter((k) => k.pass).length, total: s.length };
};
const overall = (pred) => ({ pass: results.filter(pred).length, total: results.length });
const pct = ({ pass, total }) => (total ? `${((pass / total) * 100).toFixed(1)}% (${pass}/${total})` : "n/a");

const metrics = {
  payload_recall: byKind("payload"),
  noise_rejection: byKind("noise_rejection"),
  empty_case_explained: byKind("empty_case_explained"),
  ambiguity_marked: byKind("ambiguity_marked"),
  no_invention: overall((r) => r.invented.length === 0),
  cases_fully_passing: overall((r) => r.ok),
};

console.log("\n=== Comm Digest — payload preservation ===");
console.log(`provider ${provider.name} · model ${model} · ${SELECTED.length} cases\n`);
for (const [k, v] of Object.entries(metrics)) console.log(`  ${k.padEnd(22)} ${pct(v)}`);

const gate =
  metrics.payload_recall.pass === metrics.payload_recall.total &&
  metrics.no_invention.pass === metrics.no_invention.total;
console.log(`\n  THRESHOLD  payload_recall = 100% AND no_invention = 100%  ->  ${gate ? "PASS" : "FAIL"}`);

const outFile = arg("out");
if (outFile) {
  writeFileSync(
    join(HERE, outFile),
    JSON.stringify({ provider: provider.name, model, metrics, results }, null, 2),
  );
  console.log(`\n  written ${outFile}`);
}

process.exit(gate ? 0 : 1);

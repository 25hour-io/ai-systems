/**
 * Deterministic payload validation — the mechanism that moves this guardrail from
 * `Constrained` to `Verified`.
 *
 * The prompt asks the model to reproduce actionable payloads verbatim. Measurement showed it
 * does so most of the time and not always (see README.md). No amount of prompt iteration closes
 * that gap: a prompt-level rule improves behaviour, it never guarantees it.
 *
 * This module does not try to make the model behave. It extracts payloads from the INPUT with
 * regular expressions, checks each one against the OUTPUT, and returns what is missing. A digest
 * that drops a payment link is then detected rather than delivered.
 *
 * It is a detector, not a repair: it cannot invent the block the model failed to write. What it
 * guarantees is that the failure is visible — which is the whole difference between a rule the
 * model is asked to follow and a check the pipeline performs.
 */

/**
 * Ordered so that the widest patterns run first: a URL containing digits must be claimed as a URL
 * before the amount pattern can shred it into fragments.
 */
export const EXTRACTORS = [
  { kind: "url", re: /https?:\/\/[^\s<>"')\]]+/g },
  { kind: "email", re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g },
  { kind: "phone", re: /(?:\+\d{1,3}[-\s]?)?(?:\d{2,4}[-\s]?){2,4}\d{2,4}/g },
  { kind: "reference", re: /\b[A-Z]{2,}[-#][A-Za-z0-9-]{3,}\b|#[A-Z]{2,}-?\d{3,}\b/g },
  { kind: "code", re: /\b\d{3,}[#*]|\b[0-9]{2,}[a-z]-[A-Za-z0-9]{2,}\b/g },
  { kind: "amount", re: /\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b|\b\d+\.\d{2}\b/g },
  { kind: "time", re: /\b\d{1,2}:\d{2}\b/g },
  { kind: "isodate", re: /\b\d{4}-\d{2}-\d{2}\b|\b\d{2}\/\d{2}\/\d{4}\b/g },
];

/** Everything the input declares as machine-checkable, longest first so overlaps resolve. */
export function extractPayloads(input) {
  const found = [];
  let remaining = input;
  for (const { kind, re } of EXTRACTORS) {
    for (const m of remaining.match(re) ?? []) {
      const value = m.replace(/[.,;:]+$/, "").trim();
      if (value.length < 3) continue;
      if (found.some((f) => f.value.includes(value))) continue;
      found.push({ kind, value });
      remaining = remaining.split(value).join(" ");
    }
  }
  return found;
}

/**
 * Compare a digest against the messages it was built from.
 * Returns the payloads that went missing, so the caller can hold the digest back, retry, or flag
 * it. `ok` is the gate.
 */
export function validateDigest(input, output) {
  const expected = extractPayloads(input);
  const missing = expected.filter((p) => !output.includes(p.value));
  return {
    ok: missing.length === 0,
    expected: expected.length,
    missing,
  };
}

# Evaluation — Payload Preservation

The [Channel Digest Agent](..) must reproduce critical payloads verbatim (URLs, amounts, codes,
contacts). Paraphrasing actionable details destroys their utility. This evaluation harness verifies
strict compliance.

**Run date:** 2026-08-26 · **Model:** `gpt-4o` (temp 0) · **Test cases:** 40 · **v2 deployed:** Same
day

---

## Results

| Metric | Prompt v1 | Prompt v2 | Description |
|---|---|---|---|
| `payload_recall` | **73.7 %** (28/38) | **92.1 %** (35/38) | Exact verbatim payload reproduction |
| `no_invention` | 100 % (40/40) | 100 % (40/40) | Zero hallucinated data added |
| `noise_rejection` | 100 % (5/5) | 100 % (5/5) | Chatter generates no digest output |
| `empty_case_explained` | 100 % (5/5) | 100 % (5/5) | Empty outputs state discussion topic |
| `ambiguity_marked` | **0 %** (0/5) | **0 %** (0/5) | Uncertainty carries `(to be confirmed)` |
| `cases_fully_passing` | 65.0 % | 82.5 % | Pass rate across all assertions |

**Target Threshold: `payload_recall` = 100% and `no_invention` = 100%. Both runs FAIL.**

---

## Root Cause Analysis

The model copied retained payloads accurately but incorrectly dropped entire operational messages
(ticket IDs, cost centers, escalation emails) deemed irrelevant by a filter biased toward explicit
calls to action.

---

## Prompt Optimization (v2)

Prompt v2 introduced an explicit retention rule: *messages with actionable payloads are always
relevant and must be retained*. Ambiguous items are flagged rather than dropped. This increased
recall from 73.7% to 92.1%, establishing a clear prompt-level ceiling.

---

## Deterministic Validation

[`validate.mjs`](./validate.mjs) acts as a pipeline guardrail by extracting structured payloads via
regex and blocking incomplete digests.

| Measure | Result |
|---|---|
| Regex extractor recall vs benchmark | **81.6 %** (31/38) |
| Incomplete structured digests blocked | **100 %** (2/2) |

Guardrails are classified into two tiers:

- **`Verified`:** Structured data (URLs, emails, numbers, dates) verified deterministically via
  code.
- **`Constrained`:** Prose payloads (dates in words, informal quantities) protected solely by prompt
  rules.

---

## Execution Protocol

```
node run.mjs                      # Run full evaluation suite (40 cases)
node run.mjs --limit 5            # Smoke test
node run.mjs --model <id>         # Model override
node run.mjs --out results.json   # Export metrics
```

---

## Deployment Status

**Prompt v2 & `validate.mjs` are active in production.** Structured payload losses are blocked prior
to delivery. Prose payloads remain under continuous evaluation.

[`system-prompt.v1.md`](./system-prompt.v1.md) remains stored as the baseline benchmark.

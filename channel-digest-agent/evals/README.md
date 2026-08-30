# Evaluation — payload preservation

The [Channel Digest Agent](../README.md) prompt tells the model to reproduce actionable payloads
verbatim: full URLs, exact amounts, access codes, contact details. A summariser that paraphrases a
payment link has destroyed the message.

That instruction is a **prompt-level rule**. Nothing downstream checked that the model followed it.
This harness checks it — and the numbers changed what the repository claims.

**Run date:** 2026-08-26 · **Model:** `gpt-4o`, temperature 0 · **Cases:** 40 · **v2 deployed** the same day

---

## Results

| Metric | Prompt v1 | Prompt v2 | What it measures |
|---|---|---|---|
| `payload_recall` | **73.7 %** (28/38) | **92.1 %** (35/38) | payloads reproduced character for character |
| `no_invention` | 100 % (40/40) | 100 % (40/40) | no URL, email or figure absent from the input |
| `noise_rejection` | 100 % (5/5) | 100 % (5/5) | pure chatter produces no digest block |
| `empty_case_explained` | 100 % (5/5) | 100 % (5/5) | the empty result still says what was discussed |
| `ambiguity_marked` | **0 %** (0/5) | **0 %** (0/5) | uncertain content carries `(to be confirmed)` |
| `cases_fully_passing` | 65.0 % | 82.5 % | every check on the case passes |

**Threshold: `payload_recall` = 100 % and `no_invention` = 100 %. Both runs FAIL.**

## The plot twist

The failure was not what anyone predicted. The model never paraphrased a payload — every payload it
kept, it copied exactly. It **discarded whole messages** as irrelevant.

Dropped by v1: an assigned ticket number, a cost centre to use on expense lines, an escalation
address, an approved headcount and its annual cost. Operational facts with no explicit call to
action fell through a relevance filter that was tuned for announcements and requests.

`ambiguity_marked` scoring zero is the same root cause. All five ambiguous messages were dropped, so
no block existed to carry the marker.

## The fix, and its ceiling

Prompt v2 adds a retention rule ahead of the relevance judgement: *a message carrying an actionable
payload is always relevant — the payload **is** the informational value*. Plus: an uncertain message
is retained with the marker, never dropped.

Recall moved from 73.7 % to 92.1 %. It did not reach 100 %, and further prompt iteration is not
expected to get there.

**That is the finding.** A prompt-level rule improves behaviour; it does not guarantee it. This is
why the repository grades this guardrail `Constrained` rather than `Structural` — and now the grade
rests on a measurement instead of an opinion.

## Deterministic validation

[`validate.mjs`](./validate.mjs) is the mechanism that closes what the prompt cannot, and it runs in
the pipeline. It extracts payloads from the **input** with regular expressions, checks each against
the **output**, and returns what went missing. It cannot repair a dropped block. It makes the drop
visible and stops the digest, which is the difference between a rule the model is asked to follow
and a check the pipeline performs.

| Measure | Result |
|---|---|
| Extractor recall against the labelled payloads | **81.6 %** (31/38) |
| Digests losing a structured payload that get blocked | **100 %** (2/2) |

The 18.4 % it does not extract are payloads written in prose: `Thursday 14 May`, `46 days`,
`3 roles`, a postal address. Regular expressions catch structure, not natural language.

So the honest grade splits:

- **`Verified` for structured payloads** — URLs, email addresses, references, numeric amounts,
  times, ISO dates. Loss is mechanically detected.
- **`Constrained` for payloads in prose** — dates in words, quantities, addresses. Only the prompt
  protects them.

Naming that boundary is more useful than a single grade covering both.

---

## Protocol

```bash
node run.mjs                      # all 40 cases
node run.mjs --limit 5            # smoke run
node run.mjs --model <id>         # override the model
node run.mjs --out results.json   # machine-readable results
```

The provider is picked from whichever key is present: `ANTHROPIC_API_KEY`, else `OPENAI_API_KEY`.

Every assertion is an **exact substring match** against the model output. No model judges another
model here: an LLM-as-judge would inherit the failure mode being measured.

`cases.jsonl` holds 40 synthetic cases — 10 URLs, 8 amounts and deadlines, 6 codes, 6 contact
details, 5 pure noise, 5 ambiguous. They were written for this test. No real message is used, so the
set is publishable as it stands.

## Limits of this run, stated plainly

**1. The model is not the production model.** The deployed workflow runs on Claude Sonnet; this run
used `gpt-4o`, the key available locally. The prompt is model-agnostic and the failure mode found is
a specification gap rather than a model quirk, but the published figures describe `gpt-4o`.
Re-running against the production model would sharpen them.

**2. One message per case.** Production receives batches, where surrounding messages give the
relevance judgement more context. A message judged in isolation may be treated more harshly.

**3. Synthetic cases.** They cover the payload families deliberately and evenly, which real traffic
does not. This measures the guardrail, not the traffic.

## Deployment status

**Prompt v2 is deployed.** The retention rule went into the running n8n workflow on 2026-08-26 —
measured first, shipped second. The live prompt is French and carries the real deployment context.
What was ported is the rule, not the published English file.

**`validate.mjs` is wired in.** It runs on every digest ahead of delivery: one that lost a
structured payload is blocked instead of sent. That is what makes structured payloads `Verified` in
production rather than `Constrained` — the prompt asks, and the pipeline checks.

The grade still splits, and the 18.4 % above is why. Payloads written in prose are not extracted, so
they are not checked, so they stay `Constrained`. No regular expression closes that gap. What would
is a second extraction pass over the input — and it would have to be measured before it could be
claimed.

[`system-prompt.v1.md`](./system-prompt.v1.md) is kept as the measured baseline.

# Comm Digest

An always-on agent that watches noisy group channels, drops the noise, translates what matters,
and returns a structured digest ending in explicit action items.

**Live since May 2026.** Runs every 5 minutes. 30-node n8n workflow. `MEASURED` in production.

---

## The problem

A busy group channel is unreadable. Hundreds of messages a day, most of them social, a handful
carrying a deadline, a payment, a link, or a required action. Reading everything costs an hour a
day. Skipping it costs a missed deadline.

The deployed instance runs against high-volume operational channels written in Hebrew, for a
reader who does not read Hebrew. That is a deliberately hard case: heavy traffic, a foreign
language, right-to-left script, mixed media, and real consequences when something slips through.

The same agent fits any team channel — Slack, Telegram, Teams. The input connector changes; the
analysis layer stays as it is.

---

## Architecture

```
schedule (every 5 min)
  → fetch new messages per channel
  → split by media type
      ├─ images → Claude Haiku (vision)   → inline description
      ├─ PDFs   → Claude Haiku (document) → inline summary
      └─ text   ─────────────────────────┐
  → merge back into one transcript ──────┘
  → Claude Sonnet — filter, translate, extract actions
  → deliver digest
  → commit processed message IDs
```

The full system prompt is in [`system-prompt.md`](./system-prompt.md). It is the real asset here.

---

## Decisions worth reading

**The model split is a cost decision.** Haiku handles the high-volume, low-judgment work:
describe an image, summarize a PDF. Sonnet runs once per cycle on the assembled transcript,
where the judgment actually lives. Sonnet on every attachment would multiply the bill and leave
output quality where it already was.

**Zero round-trip is the product principle.** The reader must never need to reopen the source
channel. Every other rule in the prompt follows from this one.

**Summarize the context, reproduce the payload verbatim.** Prose gets compressed. Actionable
data gets copied character for character: full URLs, exact amounts, phone numbers, access codes,
deadlines. A summarizer that paraphrases a payment link has destroyed the message. This split is
the single most important instruction in the prompt.

⚠️ **Measured, not asserted.** This is a prompt-level rule, so it was put on a bench:
**[40 labelled cases](./evals)**, exact substring matching, no model judging another model.

The deployed prompt reproduced **73.7 %** of payloads. The failure was not paraphrasing — the
model discarded whole messages as irrelevant, including an assigned ticket number, a cost centre
and an escalation address. A retention rule lifted that to **92.1 %**, and no further prompt
iteration is expected to reach 100 %.

The retention rule is **deployed** — measured first, shipped second.

**That ceiling is the point.** A prompt rule improves behaviour; it does not guarantee it. Which
is why [`validate.mjs`](./evals/validate.mjs) extracts payloads from the input and checks them
against the output. It is written and measured, and **not yet wired into the running workflow**:
so in production this guardrail is still `Constrained`, and the mechanism that would make
structured payloads `Verified` is sitting one integration away. Full numbers, limits and
deployment status are in [`evals/README.md`](./evals/README.md).

**Never invent.** Ambiguous content is translated with a "to be confirmed" marker. Missing
information stays missing. Same level: `Constrained`.

**Explain the empty result.** When nothing qualifies, the agent still states in one sentence what
the channel was discussing, then concludes. This came out of field use: a bare "nothing relevant"
is indistinguishable from a broken pipeline, and it sends the reader back to the channel —
breaking the zero round-trip rule.

**Bilingual rendering is an engineering problem.** Hebrew runs right to left. A line starting
with Hebrew flips the entire block in the messaging client and the digest becomes unreadable.
Every output line therefore opens with a Latin-script label, which forces left-to-right layout.
This one is invisible until you ship to a real reader in a real client.

**Idempotency by design.** Processed message IDs are committed after each run. A restart, an
overlap or a retry never re-sends a digest. Failure isolation per media branch: a failed PDF never
blocks the text digest.

---

## What ships here

The architecture and the system prompt. The workflow export stays private: it carries host
addresses and credential references.

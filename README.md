# AI systems in production

I design AI systems, put them in production, and then live with the consequences. This repository
documents a few of them.

They were built at [25hour](https://25hour.io), an AI automation consultancy. This is a selection,
not a complete inventory: what is published here is what can be shown, and what carries a decision
worth reading.

If you are scanning: the [cost audit](./multi-agent-orchestrator) that cut a per-request bill by a
factor of 40, the [evaluation harness](./channel-digest-agent/evals) that measured a prompt rule at
73.7 % and fixed it to 92.1 %, and the [npm package](./n8n-sse-node) that ~800 strangers installed
are the three fastest ways to judge the work.

Every entry states the business problem it solves, the architecture decisions that mattered, and
the operational evidence behind it. Each one carries a status line: what is live and unattended,
what is a prototype, what is a component other people install.

**Where cost materially shaped the design, the economics are shown in full** — measured per
request or per source, with the decision that followed. That is the part most portfolios leave
out, and the part that decides whether an AI feature survives its first invoice.

---

## A few of the systems

| System | What it does | Status |
|---|---|---|
| [**Vox Memo**](./vox-memo) | Knowledge capture and semantic retrieval, web + native Android | Live at [memo.25hour.io](https://memo.25hour.io) · ~62 memos/month |
| [**Channel Digest Agent**](./channel-digest-agent) | Always-on agent that filters, translates and extracts action items from team channels | Live since May 2026 · ~100 messages/day |
| [**Multi-Agent Orchestrator**](./multi-agent-orchestrator) | Routing layer over 10 specialised agents, each owning one business surface | Live, 10 agents deployed |
| [**Role Matching Pipeline**](./role-matching-pipeline) | Continuous role sourcing and candidate-role scoring for a career coach, under a hard cost ceiling | Live, twice daily |
| [**Voice Knowledge Agent**](./voice-knowledge-agent) | Real-time voice agent answering from a source corpus, grounded | `PROTOTYPE` — works end to end, not deployed |
| [**n8n-nodes-sse-client**](./n8n-sse-node) | Enabling component: open-source n8n node for Server-Sent Events | [Published on npm](https://www.npmjs.com/package/n8n-nodes-sse-client) — ~800 installs |

---

## Agent skills

Alongside the systems, three [**agent skills**](./agent-skills) are published here: operating
procedures an agent executes the same way every time.

One builds a client-facing pitch document under sector compliance rules. Two more are a single
product for a career coach: one generates a client's application documents under a fact ceiling,
the other runs their interview rehearsal aloud in three languages.

Using AI solves a problem once. A versioned procedure lets someone else solve it without holding
the expertise.

---

## Five things these systems have in common

**Cost governance is a design input.** Every system splits work across models by the judgment each
task requires: cheap models carry volume, expensive models are called once, where the decision
lives.

Two of them publish the arithmetic, because cost is what drove their architecture. The role
matching pipeline runs under a hard 29 $ ceiling and reports its unit economics per source —
three sources were cut on that table. The orchestrator's per-request cost was `MEASURED` at 0.25 $ and the
architecture was redesigned around that number. The others state the model split without a figure
attached, which is all the evidence available for them.

**The model is never trusted to be right — and the guardrails are not all equally strong.** Every
system here controls invented output, but through mechanisms of different strength. Calling all of
them a guarantee would flatter the weakest and devalue the strongest, so they are named separately
across this repository:

| Level | What it means | Where it applies |
|---|---|---|
| **Structural** | An invalid output is mechanically impossible to produce | The **fact ceiling**: generation only removes text from a verified superset, so removal cannot fabricate |
| **Verified** | The output is read back and compared against the input | Tracking-sheet writes, re-read and compared field by field; divergence exits non-zero |
| **Constrained** | A prompt-level rule, not validated downstream | Verbatim payload preservation; the voice agent's refusal; the "to be confirmed" marker |

`Structural` needs no trust. `Verified` catches the failure after the fact. `Constrained` asks the
model to behave and does not check. Knowing which one you have is the difference between
hallucination control and hoping.

The weakest of the three is measured rather than asserted: see the
[evaluation harness](./channel-digest-agent/evals) for verbatim preservation.

**A success response is not proof of success.** Webhooks that returned 200 without writing
anything are why the pipeline now applies deterministic validation: it reads its rows back and
compares them field by field.

**What is deployed runs unattended.** Scheduled, idempotent, and safe to restart. Processed
identifiers are persisted so a retry never duplicates work, and each pipeline stage isolates its
own failures — with something downstream that still knows a stage failed, which is the part that
is easy to get wrong.

**Evidence labels.** Every figure in this repository carries its status: `MEASURED` on a running
system, `ESTIMATED` from a model, `DESIGN TARGET` for an architecture not yet in production,
`PROTOTYPE` for a system that works end to end but is not deployed.

---

## How these were built

I specified, architected and operate every system here, working with AI coding agents. That is the
point of the portfolio.

Getting an AI system into production means holding the parts an agent will not hold for you:
what the thing is for, where its output must never be trusted, what it is allowed to cost, and
when to cut a component that is not earning its keep. Those are the decisions I document here.

---

## A note on names

Client, prospect, employer and personal names are replaced by placeholders throughout, including
inside the published procedures. Technology vendors are named as they are: that is the stack, and
naming it is how the reader judges the work.

---

## Contact

[25hour.io](https://25hour.io) — hello@25hour.io

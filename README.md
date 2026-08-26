# AI systems in production

Reference implementations built at [25hour](https://25hour.io), an AI automation consultancy.
Each one solves a business problem, runs unattended, and is proven on a demanding real-world
deployment.

Every entry below states what the system does, how it is put together, and what it costs to run.

The cost line is the part most portfolios leave out. It is the part that decides whether an AI
feature survives contact with a budget.

---

## The systems

| System | What it does | Status |
|---|---|---|
| [**Vox Memo**](./vox-memo) | Knowledge capture and semantic retrieval, web + native Android | Live at [memo.25hour.io](https://memo.25hour.io) |
| [**Comm Digest**](./comm-digest) | Always-on agent that filters, translates and extracts action items from team channels | Live since May 2026 |
| [**Hubert**](./hubert) | Orchestration layer over 10 specialised agents across business tools | Live, 10 agents deployed |
| [**Role Matching Pipeline**](./role-matching) | Continuous role sourcing and candidate-role scoring under a hard cost ceiling | Live, twice daily |
| [**Voice Knowledge Agent**](./voice-knowledge-agent) | Real-time voice agent answering from a source corpus, grounded | Working prototype |
| [**n8n-nodes-sse-client**](./sse-client) | Open-source n8n node for Server-Sent Events | [Published on npm](https://www.npmjs.com/package/n8n-nodes-sse-client) |

---

## Agent skills

Alongside the systems, three [**agent skills**](./agent-skills) are published here: operating
procedures an agent executes the same way every time.

One builds a client-facing pitch document under sector compliance rules. One generates
recruitment documents under a fact ceiling. One runs a spoken training simulation in three
languages.

Using AI solves a problem once. A versioned procedure lets someone else solve it without holding
the expertise.

---

## Four things these systems have in common

**Cost governance is a design input.** Every system splits work across models by the judgment each
task requires. Cheap models carry volume; expensive models are called once, where the decision
lives. The role matching pipeline runs on a hard 29 $ ceiling and reports its unit economics per
source. Hubert's per-request cost was measured at 0.25 $ before it was redesigned around that
number.

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
[evaluation harness](./comm-digest/evals) for verbatim preservation.

**A success response is not proof of success.** Webhooks that returned 200 without writing
anything are why the pipeline now applies deterministic validation: it reads its rows back and
compares them field by field.

**Everything runs unattended.** Scheduled, idempotent, and safe to restart. Processed identifiers
are persisted so a retry never duplicates work, and each pipeline stage isolates its own failures.

**Evidence labels.** Every figure in this repository carries its status: `MEASURED` on a running
system, `ESTIMATED` from a model, `DESIGN TARGET` for an architecture not yet in production,
`PROTOTYPE` for a system that works end to end but is not deployed.

---

## How these were built

These systems were specified, architected and operated by one person working with AI coding
agents. That is the point of the portfolio.

Getting an AI system into production means holding the parts an agent will not hold for you:
what the thing is for, where its output must never be trusted, what it is allowed to cost, and
when to cut a component that is not earning its keep. Those are the decisions documented here.

---

## A note on names

Client, prospect, employer and personal names are replaced by placeholders throughout, including
inside the published procedures. Technology vendors are named as they are: that is the stack, and
naming it is how the reader judges the work.

---

## Contact

Sebastien Rozen — sebastien@25hour.io — [25hour.io](https://25hour.io)

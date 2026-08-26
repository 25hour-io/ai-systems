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

**Cost is a design input.** Every system splits work across models by the judgment each task
requires. Cheap models carry volume; expensive models are called once, where the decision lives.
The role matching pipeline runs on a hard 29 $ ceiling and reports its cost per source. Hubert's
per-request cost was measured at 0.25 $ before it was redesigned around that number.

**The model is never trusted to be right.** Each system carries a structural guarantee against
invented output. Document generation only ever removes text from a verified superset, so removal
cannot fabricate. The comm digest reproduces payloads verbatim and marks ambiguity. The voice
agent answers from retrieved sources and says when it has none.

**A success response is not proof of success.** Webhooks that returned 200 without writing
anything are why the pipeline now reads its rows back and compares them field by field.

**Everything runs unattended.** Scheduled, idempotent, and safe to restart. Processed identifiers
are committed so a retry never duplicates work.

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

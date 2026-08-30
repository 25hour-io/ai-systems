# Voice Knowledge Agent

A real-time voice agent that answers spoken questions from a source corpus. You talk, it
retrieves, it answers, and it answers only from what it retrieved.

**`PROTOTYPE`.** Real-time voice over WebSocket, retrieval-augmented generation over pgvector.

---

## What it is for

A knowledge base nobody queries is a cost centre. Search boxes go unused because typing a precise
query is work, and because the answer arrives as ten documents to read.

Voice removes both frictions. Ask the question the way you would ask a colleague, get the answer
spoken back, at any hour.

Direct applications: front-line support, employee onboarding, product documentation, field staff
with their hands busy.

## Stack

Next.js 16, React 19, TypeScript · real-time voice API over WebSocket · Supabase pgvector with
OpenAI `text-embedding-3-small` for retrieval.

---

## Grounding is the whole point

A voice agent that invents is worse than no agent. Text lets a reader see a hedge and check a
source. Speech carries confidence and leaves no trail — a fabricated answer sounds exactly like a
correct one, and it is gone the moment it is spoken.

So the architecture holds the answer to the corpus:

**Retrieve first, answer second.** Retrieval-augmented generation over the indexed corpus: every
response is built on passages pulled from it. The model composes; the corpus supplies the facts.
Bounding what the model sees is an architectural constraint, and it is the strongest control here.

**Say when there is nothing.** An empty or weak retrieval produces "I don't have that", which is
the correct answer and the one users trust. A plausible-sounding guess destroys the trust the
whole system runs on.

⚠️ **The refusal itself is `Constrained`.** Retrieval bounds what the model sees; nothing
mechanically forces the answer to stay inside what came back. Groundedness here rests on a
prompt-level rule, and measuring it against a labelled question set is exactly what stands between
this prototype and a product.

**The corpus is the boundary.** Coverage is expanded by indexing more sources. It is never
expanded by loosening the constraint.

Three systems attack the same problem, and it is worth being precise about how each one holds.
The [role matching pipeline](../role-matching-pipeline) enforces a `Structural` fact ceiling on generated
documents: removal cannot fabricate, so nothing has to be checked. This agent and the
[channel digest agent](../channel-digest-agent) both sit at `Constrained`: the architecture narrows what the model
sees, and a prompt-level rule asks it to stay inside.

Same principle, three different strengths. Saying so is the point — an unmeasured constraint
described as a guarantee is the first thing a technical reader will test.

---

## Why it is a `PROTOTYPE`, and not more

The retrieval and voice layers work end to end. Nothing is deployed, nothing runs unattended, and
no cost figure exists — there is no traffic to measure.

Turning it into a product means the operational half: corpus ingestion for non-technical owners,
freshness and re-indexing, and measuring answer quality against a question set rather than by
impression.

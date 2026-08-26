# Voice Knowledge Agent

A real-time voice agent that answers spoken questions from a source corpus. You talk, it
retrieves, it answers, and it answers only from what it retrieved.

**Working prototype.** Real-time voice over WebSocket, retrieval over pgvector.

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

**Retrieve first, answer second.** Every response is built on passages pulled from the indexed
corpus. The model composes; the corpus supplies the facts.

**Say when there is nothing.** An empty or weak retrieval produces "I don't have that", which is
the correct answer and the one users trust. A plausible-sounding guess destroys the trust the
whole system runs on.

**The corpus is the boundary.** Coverage is expanded by indexing more sources. It is never
expanded by loosening the constraint.

This is the same guarantee that the [role matching pipeline](../role-matching) enforces on generated documents and the
[comm digest](../comm-digest) enforces on payload data. Three systems, three mechanisms, one
principle: the structure prevents invention, so nobody has to remember to check for it.

---

## Why it is a prototype

The retrieval and voice layers work end to end. Turning it into a product means the operational
half: corpus ingestion for non-technical owners, freshness and re-indexing, and measuring answer
quality against a question set rather than by impression.

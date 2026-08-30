# Voice Knowledge Agent

A real-time voice agent that answers spoken questions from a company's own corpus. You talk, it
retrieves, it answers, and it answers only from what it retrieved.

**Live — deployed, internal access.** Real-time voice over WebSocket, retrieval-augmented
generation over pgvector.

---

## Who it was built for

A company selling technical systems through a mobile sales force. Its reps spend their day driving
between customer sites, and the questions that decide a sale arrive between two appointments: which
model fits this configuration, what the specification actually says, what is in stock right now.

Before this agent, those questions cost a phone call to someone at head office, or they waited
until evening. Both answers arrive after the conversation that needed them.

**The constraint is the steering wheel, and it is what makes voice necessary rather than pleasant.**
A rep at the wheel cannot read a specification sheet, cannot type a precise search query, and cannot
skim ten results to find the paragraph that matters. Every interface assumption behind a normal
knowledge base fails in a moving vehicle. Spoken question, spoken answer, hands and eyes on the
road: that is not a nicer front end, it is the only usable one.

The full system answers from two sources: the product documentation, and live stock levels. **This
folder is a zoom on the documentation half** — the corpus, its indexing, and the retrieval that
keeps answers inside it. Stock is a different problem with a different failure mode. It is a live
query against a system of record, where the risk is staleness rather than invention.

## Stack

Next.js 16, React 19, TypeScript · real-time voice API over WebSocket · Supabase pgvector with
OpenAI `text-embedding-3-small` for retrieval.

---

## Grounding is the whole point

A voice agent that invents is worse than no agent. Text lets a reader see a hedge and check a
source. Speech carries confidence and leaves no trail: a hallucinated answer sounds exactly like a
correct one, and it is gone the moment it is spoken.

So the architecture holds the answer to the corpus. Four rules do that work.

**1. Retrieve first, answer second.** Retrieval-augmented generation over the indexed corpus: every
response is built on passages pulled from it. The model composes; the corpus supplies the facts.
Bounding what the model sees is an architectural constraint, and it is the strongest control here.

**2. Say when there is nothing.** An empty or weak retrieval produces "I don't have that", which is
the correct answer and the one users trust. A plausible-sounding guess destroys the trust the whole
system runs on.

⚠️ **The refusal itself is `Constrained`.** Retrieval bounds what the model sees; nothing
mechanically forces the answer to stay inside what came back. Groundedness here rests on a
prompt-level rule, and the honest thing is to grade it as one — the same way the
[channel digest agent](../channel-digest-agent/evals) graded its own prompt rule before putting it
on a bench and finding out it was worth 73.7 %.

**3. The agent has no access to the internet, and that is a guardrail rather than a limitation.** It
cannot search the web, so it cannot reach a competitor's specification sheet, an outdated PDF of a
product that was revised two years ago, or a forum thread stating something plausible and wrong. In
this deployment the difference is commercial: a rep who repeats a figure to a customer has committed
the company to it, and a figure that came from the open web is one nobody can stand behind.

Cutting the network narrows where a wrong answer can come from. It does not make the remaining
answers true. The model still holds its training weights, and nothing mechanically stops it from
composing a plausible sentence out of them. What the isolation buys is a corpus that is auditable:
when an answer is wrong, the document that made it wrong is in the index and can be fixed. A wrong
answer sourced from the open web cannot be traced, cannot be corrected, and will come back.

**4. The corpus is the boundary.** Coverage is expanded by indexing more sources. It is never
expanded by loosening the constraint — and with no network to fall back on, that is the only way it
can be expanded at all.

Three systems in this repository attack the same problem, and it is worth being precise about how
each one holds. The [role matching pipeline](../role-matching-pipeline) enforces a `Structural` fact
ceiling on generated documents: removal cannot fabricate, so nothing has to be checked. The [channel digest agent](../channel-digest-agent) reached `Verified` on the payloads a regular
expression can extract, by checking its output against its input before delivery. This agent sits
at `Constrained`: the architecture narrows what the model sees, and a prompt-level rule asks it to
stay inside.

Same principle, three different strengths. Saying so is the point. An unmeasured constraint
described as a guarantee is the first thing a technical reader will test.

---

## Loading the corpus

Retrieval is only half a knowledge agent. The other half is how documents get in, and that half
decides whether the thing survives contact with the people who own the knowledge.

Ingestion runs as its own n8n workflow, deliberately separate from the agent that answers.

```mermaid
flowchart LR
    F(["Upload form · basic auth"]) --> VS["Supabase Vector Store<br/>insert into documents"]
    DL["Default Data Loader<br/>chunks the uploaded binary"] -. ai_document .-> VS
    EM["Embeddings OpenAI<br/>text-embedding-3-small"] -. ai_embedding .-> VS
```

**The entry point is a form, not a script.** Whoever owns the knowledge opens a URL, picks a file
and submits it. No n8n access, no database, no CLI, no ticket to a developer. That choice is the
difference between a corpus that grows and one that was loaded once at launch and quietly went
stale — and a stale corpus is worse than a small one, because the agent answers from it with the
same confidence either way.

**The form carries basic auth.** It is the only route that writes into the corpus, and the corpus is
the whole of what the agent is allowed to say. An unauthenticated upload endpoint is not a missing
feature, it is a way to put words in the agent's mouth: anything indexed becomes something the agent
will state as grounded fact. The boundary that makes retrieval trustworthy is only as strong as the
door in front of it.

**Chunking and embedding hang off the insert rather than preceding it.** The data loader and the
embedding model are sub-nodes of the vector store, so splitting the document, computing its vectors
and writing the rows happen as one operation. There is no intermediate state where a document is
half-indexed — chunks present, vectors missing — which is precisely the state that returns empty
retrievals and makes an agent say "I don't have that" about a document somebody watched it accept.

**Same embedding model on both sides.** The corpus is embedded with `text-embedding-3-small`, which
is what the query is embedded with too. Obvious written down, and silent when it is wrong:
mismatched models return no error, only quietly meaningless distances.

**This is the operation that expands coverage.** The agent refuses what it cannot retrieve, so the
answer to "it does not know about X" is always to upload X, never to loosen the constraint. That is
only a workable policy because uploading takes a browser and thirty seconds.

**A second ingestion path was prototyped, and not kept.** Web pages are the awkward source. An
article arrives wrapped in navigation, advertising, cookie banners and comment threads, and indexing
that noise costs retrieval quality on every question asked afterwards. The prototype put a small
model in front of the vector store to make the editorial cut — keep the title, author, date, source
and body, drop everything else — and hand clean text to the same indexing step.

It was dropped for a structural reason rather than a quality one. An agent node returns text; it
does not carry a binary through to the step after it. So a single path could not serve both cases,
and routing files through it would have meant a model rewriting a PDF that should reach the corpus
untouched — one model call per upload, and no way to check what the rewrite dropped. The file path
stays model-free, which is both the cheaper option and the faithful one.

Cleaning web pages before indexing is a real problem and it is still open here. It just does not
belong between the upload form and the vector store.

---

## What it costs to run

**The retrieval half is effectively free.** One embedding of the spoken question on
`text-embedding-3-small` — a 20-token query at published prices is 0.0000004 $ — plus a pgvector
lookup, which costs a database round trip and nothing else. `ESTIMATED`, computed from token volumes
at published prices.

**The bill is the voice half**, billed per minute of audio in and out. That gives this system an
unusual cost shape, and a favourable one: **cost scales with how long the reps talk, not with how
much the corpus holds.** Indexing ten times more documentation makes the agent more useful at an
identical price per question — the opposite of a system that stuffs a context window to get smarter,
where every source added is on every invoice afterwards.

So the only lever that matters is answer length, and the product already pulls that way. A rep at
the wheel wants the figure, not a paragraph. The cheap version and the usable version are the same
version.

---

## What is still missing

Ingestion is the operational piece that is built, and it is described above. The rest of that half
is not: freshness and re-indexing when a source document changes, deletion of what has been
superseded, and — the one that carries the grounding claim — measuring answer quality against a
labelled question set instead of by impression. The
[channel digest agent](../channel-digest-agent/evals) shows what that measurement looks like when it
is done. Until it is done here, the grounding claim on this page stays `Constrained`, and saying so
is cheaper than being caught claiming otherwise.

Freshness is the one that carries the most weight in this deployment, and it follows directly from
cutting the network. An isolated agent is exactly as current as its last upload. A specification
revised at head office is wrong in the field until somebody re-indexes it, and nothing in the system
knows that. The corpus being the only source is what makes the answers accountable. It is also what
makes the upload discipline a production requirement rather than an administrative one.

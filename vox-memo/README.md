# Vox Memo

Knowledge capture and semantic retrieval. A note is typed or spoken; the system titles it, files
it, tags it, links it to related entries, and makes the whole corpus searchable by meaning.

**Live at [memo.25hour.io](https://memo.25hour.io)** — web and native Android from one codebase.

10,500 lines of TypeScript · 101 commits · 20 API routes · ~62 memos captured per month · `MEASURED`

![Vox Memo, web client](./media/vox-memo-web.png)

*Memo content is blurred; the interface is not. Capture sits at the top because capture has to cost
nothing — a note the user hesitates to write is a note the system never gets. Everything below it
(titles, summaries, tags, the pinned set) is written by the enrichment pipeline, not by the user.*

---

## The problem it addresses

Captured knowledge accumulates faster than anyone re-reads it, and a note nobody finds again was
never really captured. The value sits entirely in retrieval.

So the system does two things. It moves the filing work to write time, where the context is still
available. And it makes recall work by meaning rather than by remembered keywords.

## Stack

Next.js 16 (App Router), React 19, TypeScript 5, Tailwind 4 · Supabase (Postgres, pgvector,
Storage, Auth) · Capacitor for the Android shell.

AI layer: Claude Haiku 4.5 for enrichment and vision · OpenAI `text-embedding-3-small` for
vectors · Deepgram Nova-3 for transcription · Apify for URL crawling.

---

## The AI pipeline

Five steps, fired and forgotten when a memo is created. Failure isolation per step, so a crawl
timeout never blocks the embedding.

```
create memo
  ├─ 1. crawl   — detect URLs, crawl, summarize, append to the memo body
  ├─ 2. enrich  — Haiku extracts title, project, summary, tags, entities,
  │               cleaned text, reminder date, priority, language
  ├─ 3. embed   — vector over content + tags, capped at 8000 chars
  ├─ 4. link    — retrieval over pgvector, nearest neighbours, edge written above 0.75
  └─ 5. mark    — ai_processed = true
```

Voice memos hold at step 1 until transcription lands, then rejoin the same path.

A memo that does not reach step 5 is picked up again by a cron running every fifteen minutes,
bounded at five attempts per memo.

Source: [`code/pipeline.ts`](./code/pipeline.ts) ·
[`code/reprocess-route.ts`](./code/reprocess-route.ts)

---

## Decisions worth reading

**Enrichment resolves relative dates at write time.** "remind me Thursday" becomes a timestamp
during enrichment, while the phrase still has a reference point. Resolving it at read time would
mean guessing which Thursday.

**The model cleans its own instructions out of the text.** A spoken memo carries meta-speech:
"remind me to", "note for later". Enrichment extracts the intent into a field and strips the
phrase from the stored text, so the note reads as a note.

**One HTTP client for two platforms.** `apiCall()` routes through Capacitor's native HTTP on
Android and through relative-path fetch on web. Client code calls one function and stays platform
agnostic. Raw `fetch` is banned in client code for this reason.

**Auth degrades in a defined order.** Cookie session first, bearer token second. The native
Android app has no cookie jar, so it presents its Supabase token directly and hits the same
routes as the web app.

**Row-level security on every table**, with three separate auth paths: session cookies for app
routes, an API key header for agent routes, a bearer secret for cron routes.

---

## The one that unfolds like a detective story

The interesting section of this system is not the pipeline. It is a two-line flag, and what it
took to make it honest.

**Chapter one: done means done.** `ai_processed` is set only when enrichment and embedding both
succeed. Crawling and linking are best-effort — a memo without them is still complete. This is a
fix, not an original design. The flag used to be written unconditionally, so a memo whose
enrichment had failed was marked processed and quietly stopped being a candidate for any retry. An
external review of this published file caught it. Failure isolation per step is only safe when
something downstream still knows a step failed.

**Chapter two: a flag nobody reads back is only a tidier way to fail.** Writing `ai_processed`
honestly is worth something only if a memo left at `false` gets picked up again — and nothing
picked it up. Three cron jobs ran against this database and none of them looked at the flag. The
client-side poller gave up after fifteen attempts and re-queued nothing. Twenty-one memos had been
sitting unprocessed, the oldest untouched for three months.

The retry is now a cron of its own. The two decisions inside it were paid for in measurement rather
than settled in design, and each one has a plot twist of its own.

*It answers before it works.* The scheduler is `pg_cron` reaching the route through `pg_net`, whose
`net.http_get` closes the connection at 30 seconds. That is a hard latency budget, and a route that
does the work before responding is killed mid-pipeline on every cycle. The first live run burned
two attempt counters and finished zero memos. So the batch is claimed, the response goes out, and
the work runs in `after()`. The response reports what was picked up, never what succeeded. The
verdict is read from the database.

*A counter is not a lock.* Incrementing an attempt counter bounds how many times a memo can be
tried, but it excludes nothing. While the count sits under the maximum, a concurrent cycle selects
the same rows again. Four consecutive manual cycles returned the same memo id, which on this
pipeline means paying twice for the same crawl and the same two model calls. A claim timestamp now
sits beside the counter. One bounds the total cost, the other enforces mutual exclusion. They are
not the same guarantee, and neither substitutes for the other.

The wisdom lesson, if there is one: a status flag that nothing reads back is a comment, not a
mechanism.

---

## How the model spend is shaped

No per-request figure is published for this system. The traffic is one user's, so any number here
would describe a sample of one rather than an operating cost.

What is decided is the split. Haiku carries enrichment and vision, which is the high-volume work.
Embeddings run on the small OpenAI model. The expensive reasoning models appear nowhere in the hot
path, because nothing in this pipeline needs them — and a pipeline that fires on every capture is
exactly where an unnecessary large-model call compounds.

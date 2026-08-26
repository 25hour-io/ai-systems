# Vox Memo

Knowledge capture and semantic retrieval. A note is typed or spoken; the system titles it, files
it, tags it, links it to related entries, and makes the whole corpus searchable by meaning.

**Live at [memo.25hour.io](https://memo.25hour.io)** — web and native Android from one codebase.

10,500 lines of TypeScript · 97 commits · 19 API routes · `MEASURED`

---

## The problem it addresses

Captured knowledge accumulates faster than anyone re-reads it, and a note nobody finds again was
never really captured. The value sits entirely in retrieval.

So the system moves the filing work to write time, where the context is still available, and
makes recall work by meaning rather than by remembered keywords.

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

Source: [`code/pipeline.ts`](./code/pipeline.ts)

---

## Decisions worth reading

**Enrichment resolves relative dates at write time.** "remind me Thursday" becomes a timestamp
during enrichment, while the phrase still has a reference point. Resolving it at read time would
mean guessing which Thursday.

**The model cleans its own instructions out of the text.** A spoken memo carries meta-speech —
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

**Done means done.** `ai_processed` is set only when enrichment and embedding both succeed.
Crawling and linking are best-effort — a memo without them is still complete. This is a fix, not
an original design: the flag used to be written unconditionally, so a memo whose enrichment had
failed was marked processed and quietly stopped being a candidate for any retry. An external
review of this published file caught it. Failure isolation per step is only safe when something
downstream still knows a step failed.

---

## How the model spend is shaped

No per-request figure is published for this system: the traffic is one user's, so any number here
would describe a sample of one rather than an operating cost.

What is decided is the split. Haiku carries enrichment and vision, which is the high-volume work.
Embeddings run on the small OpenAI model. The expensive reasoning models appear nowhere in the hot
path, because nothing in this pipeline needs them — and a pipeline that fires on every capture is
exactly where an unnecessary large-model call compounds.

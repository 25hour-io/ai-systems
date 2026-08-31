# Vox Memo

A smart note-taking platform for voice and text that automatically titles, files, tags, links, and
indexes entries for semantic search.

**Live at [memo.25hour.io](https://memo.25hour.io)** — Web and native Android app built from a
single codebase.

10,500 lines of TypeScript · 101 commits · 20 API routes · ~62 memos captured / month

![Vox Memo — web interface](./media/vox-memo-web.png)

*Memo content is blurred; the interface is not. Titles, summaries, tags and the pinned set are
written by the enrichment pipeline.*

---

## Core Purpose

Automates note organization at capture time, making the entire memory corpus searchable by semantic
meaning rather than exact keywords.

---

## Tech Stack

Next.js 16, React 19, TypeScript 5, Tailwind 4 · Supabase (Postgres, pgvector, Storage, Auth) ·
Capacitor (Android).

**AI Layer:** Claude Haiku 4.5 (enrichment & vision), OpenAI `text-embedding-3-small` (vectors),
Deepgram Nova-3 (STT), Apify (web scraping).

---

## Async Ingestion Pipeline

```
create memo
  ├─ 1. Crawl   — Extract URLs, scrape content, append summaries
  ├─ 2. Enrich  — Extract title, project, summary, tags, entities, date, priority
  ├─ 3. Embed   — Vectorize content + tags (max 8,000 chars)
  ├─ 4. Link    — Nearest-neighbor search (pgvector edge > 0.75)
  └─ 5. Mark    — Set ai_processed = true
```

Voice notes await STT transcription before step 1. Incomplete jobs are automatically retried via
background cron every 15 minutes (max 5 retries).

---

## Key Architectural Decisions

- **Write-Time Date Resolution:** Parses relative dates ("next Thursday") into explicit timestamps
  upon creation.
- **Meta-Speech Cleaning:** Strips spoken meta-commands ("remind me to...") from the note body while
  storing them as structured attributes.
- **Platform-Agnostic HTTP:** Custom `apiCall()` routes native requests on Android and standard
  fetch on Web.
- **Dual Auth Model:** Cookie sessions on Web and Bearer tokens on Android/API, backed by strict Row
  Level Security (RLS).

---

## Reliability & Fallbacks

Pipeline steps are decoupled so non-critical failures (such as web scraping timeouts) do not prevent
vector embedding and indexing. Asynchronous processing prevents serverless execution timeouts.

---

## Cost Efficiency

A standard text memo costs **~$0.004** via Claude Haiku 4.5 (enrichment) and **~$0.00004** via
OpenAI embeddings, keeping total monthly operating costs well under $1.00.

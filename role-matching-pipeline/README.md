# Role Matching Pipeline

Built for a career coach. Continuous role sourcing and candidate-role scoring for the clients they
place, running unattended under a hard cost ceiling.

Twice every working day it pulls new postings from every configured source, drops what it has
already seen, scores each remaining role against a client's structured profile, files the survivors
in a tracking sheet and sends the coach a digest.

**Live**, twice a day, five days a week. Runs in a cloud sandbox with no human in the loop.

The economics are what make this a coaching product rather than a script. A coach carries several
clients at once and bills a flat fee per engagement, so the sourcing cost per client is a margin
line, not a rounding error. That constraint is the reason for everything below.

```
sources.json → scrape → dedupe against seen.json
             → [LLM] extract + score against the profile
             → tracking sheet + email digest
             → commit seen IDs → git push
```

Deterministic I/O lives in scripts. The LLM handles the two steps a regular expression would get
wrong: pulling structured postings out of raw markdown, and judging fit against a profile.

---

## Running it on a budget

The scraping account is capped at **29 $ per cycle**. Past the cap the platform stops serving. This
is a hard stop, not an overage charge.

Two runs a day, five days a week, is about 22 days a cycle. So the real unit is **1.30 $ per day**,
and every source gets budgeted against that ceiling rather than against whatever credit happens to
be left.

### The audit

Source names are replaced by labels below. The reasoning is what transfers.

`MEASURED` over one full billing cycle. Cost per run was measured per source, then cross-referenced
against postings that actually cleared scoring:

| Source | $/run | Verdict |
|---|---|---|
| Global board A | 0.102 | **84 % of all retained postings.** Keep |
| Local board B | 0.088 | Delivers regularly. Keep |
| Local board C | 0.131 | Delivers, most expensive of its group. Keep |
| Global board D | 0.001 | Nearly free. Keep at low yield |
| Agency feed E | **0.000** | Public feed, no scraping account involved |
| ~~Local board F~~ | 0.152 | **Cut.** Zero postings retained, 100 % of spend |
| ~~Local board G~~ | 0.082 | **Cut.** Zero postings, keyword matched accountants |
| ~~Niche board H~~ | 0.050 | **Cut.** Zero postings since activation |

Before: 0.61 $/run, ~26.5 $ per cycle — **91 % of the ceiling**.
After: 0.33 $/run, ~14.5 $ per cycle — **45 % less, with retained postings unchanged**. `MEASURED`.

### Look for a feed before paying a scraper

One agency exposed its entire catalogue — 1,144 postings with publication dates — over a public
REST route on its WordPress install. Same data a paid scraper would return, for nothing, with no
vendor in the loop.

The habit generalises. On any WordPress site, read `/wp-json/` and look at the routes specific to
that site. A feed also moves filtering to the client side, which is why sources here declare a
`filter` block instead of passing a keyword to a vendor.

One more finding worth the money it saved: **a scraper labelled FREE is not free.** You still pay
for its compute. The one advertised that way was the most expensive line on the account.

---

## Two controls against invented output

One is `Structural`, one is `Verified` — see the levels in the [repository README](../README.md).

**`Structural` — removal cannot fabricate.** The candidate document template is a superset of
verified facts, deliberately too long to send. Every generated document is a copy that only ever
gets **cut down**. Starting from a long verified document and removing is structurally safe.
Starting from a short one and filling it in is where hallucination gets in and a fictional employer
appears on a CV. A missing fact is added to the template, never to a generated document.

The procedure that enforces this is published as
[`application-builder`](../agent-skills/application-builder.md).

**`Verified` — a 200 response is not proof of a write.** The tracking sheet webhook returned
success without writing anything. Worse, the underlying operation invented rather than complained:
updating an absent identifier created a row, and sending an unknown field created a column — a
clean 200 in both cases. So the pipeline now applies deterministic validation. It checks the row
exists before writing, reads it back after, and compares field by field. Divergence exits non-zero.

---

## Code

- [`feed.mjs`](./code/feed.mjs) — zero-cost sources: fetch a public feed, parse by declared
  format, apply the declared filter, return normalised postings. No vendor, no dependency.
- [`normalize.mjs`](./code/normalize.mjs) — normalisation and deduplication. Only a posting with
  no title gets dropped; an unnamed employer is kept and labelled, because agency listings are
  worth judging on the role alone.

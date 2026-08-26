---
name: agency-pitch
description: >-
  Generates a premium HTML prospecting dossier for [AGENCY] from a company name and a URL.
  Crawls the prospect's site, analyses its target market, connects it to [Agency]'s client
  roster and media portfolio, and produces an interactive bilingual FR/HE pitch.
  Use this skill AS SOON AS the user asks for a pitch, a prospecting dossier, a prospect
  analysis, an "[Agency] pitch", or supplies a company name and a URL to present to a
  prospect — even without saying the word "pitch". Always use it when preparing a commercial
  case on behalf of [AGENCY].
---

# [Agency] Pitch — prospecting dossier

Turns a prospect (name + URL) into a standalone, premium, bilingual French/Hebrew HTML dossier
in [AGENCY]'s visual identity, ready to present.

## Expected input

- **Company name** of the prospect.
- **URL** of its website.
- (Optional) target market, sector, context. Where the target market is not given, infer it from
  the site or ask for it.

## Reference knowledge (in the project)

Read the project knowledge files before writing anything:

- `agency-clients-reference.md` — [Agency] clients by category, for matching.
- `agency-media-portfolio.md` — represented media, for channel recommendations.
- `agency-brand-guidelines.md` — colours, typefaces, tone, style rules.

Where those files are unavailable, fall back on the condensed notes at the end of this file, but
always prefer the project files: they are more current.

## Step 1 — Research the prospect

1. **WebFetch** the supplied URL (homepage) plus 2–3 key pages where useful: about, products,
   distributors.
2. For a **deeper crawl**, use **Apify** (connector available) — actor type
   `website-content-crawler` or `rag-web-browser`. WebFetch is targeted; Apify is exhaustive.
3. Complete with a **web search** for verifiable market data: size, trends, regulation. **Never
   invent a figure**; hold the source in mind for every number used.
4. Return a **structured brief** to the user first — the four axes, the matching, the media angle
   — for validation BEFORE generating any HTML, unless the user asks straight for the file.

## Step 2 — Analysis (four-axis target market method)

For the target market, work through all four systematically:

- **The Market** — financial potential, size, trends, viability. Verifiable figures.
- **The Customers** — who the prospect will sell to: segments, demographics, channels, purchase
  criteria.
- **The Competition** — established players, comparable entrants, and what differentiates the
  prospect.
- **The Environment** — legal constraints (e.g. the **Loi Évin** for alcohol in France:
  advertising banned on television and in cinema), cultural, economic. Draw the strategic
  consequences, because they drive the media mix.

## Step 3 — Client matching

- Connect the prospect to [Agency]'s clients: **strong matches** first (same category), then
  **adjacent** ones.
- Always state the **type** (strong / adjacent) and **why**.
- **ABSOLUTE RULE — never invent.** Where no credible link exists, say so plainly and open a
  **"New opportunity"** section: position the prospect as [Agency]'s first reference in a
  category, a repeatable showcase case. Do not force a shaky analogy.

## Step 4 — Relevant media

- Select from [Agency]'s portfolio only the media **relevant to the target market**.
- Filter by **sector constraints** (e.g. alcohol in France → exclude television and cinema
  advertising; favour press, digital, framed radio, brand content, PR).
- Cross-reference with the **audience** (premium B2B, lifestyle/luxury, mass market…).
- Always state the [Agency] value: direct access to the sales houses, one point of contact.

## Step 5 — The rest of the dossier

- **Commercial arguments**: why [Agency] rather than a local agency — cultural bridge, media
  access, track record, regulatory command, events.
- **Questions to ask the client**: framing objectives, budget, distribution, product range,
  pricing, audiences, resources, deadlines, KPIs.
- **Structured mini-proposal**: a phased trajectory plus three tiers (Starter / Growth /
  Premium). Budgets are **indicative bands, never an invented rate**: mark them
  "to be confirmed with [Agency]".
- **Follow-up email**: ready to copy, warm and professional, no jargon, **no emoji**.

## Step 6 — HTML generation

Produce **one standalone HTML file** (everything inline), following `assets/example-pitch.html`
as the exact structural and visual reference.

`assets/example-pitch.html` is a FILLED example for the prospect "[Prospect Co]".
**Reuse its structure and design only**: replace 100 % of the content with the new prospect's
analysis. Never leave residual [Prospect Co] content.

Required sections (numbered contents 01→08):

1. Summary (verdict + animated key statistics)
2. The target market (four cards: Market / Customers / Competition / Environment)
3. Client matches (+ New opportunity where relevant)
4. Relevant portfolio media (+ compliance guardrail for a regulated sector)
5. Commercial arguments
6. Questions to ask the client (collapsible blocks)
7. Mini-proposal (timeline + three tiers)
8. Follow-up email (copy button)

### Technical requirements

- **Bilingual FR/HE**: every text string carries `data-fr` and `data-he`. Language toggle top
  right; in Hebrew, switch `dir="rtl"` AND the Hebrew typefaces (Frank Ruhl Libre + Heebo).
  Where a detailed Hebrew translation is unfinished, keep French as the fallback and show a
  "Hebrew version in progress" banner.
- **Interactive**: progress bar, sticky contents with active section (IntersectionObserver),
  scroll reveals, animated counters, collapsible blocks, "copy the email" button.
- **Brand**: CSS variables in `:root` (see `agency-brand-guidelines.md`). One place to change
  every colour.
- **Strict style rules**: no icons at all (no emoji, no icon font, no pictograms). No text in
  full capitals (no `text-transform: uppercase`). Hierarchy comes from size, weight and colour.
- No browser storage (localStorage / sessionStorage).

### File location and naming

- Create a folder named after the client inside `pitch-clients/`, then save the HTML there.
- Base path: `<workspace>/pitch-clients/`.
- Structure: `pitch-clients/<Client name>/pitch-<prospect-slug>.html`.
- Example: `pitch-clients/[Prospect Co]/pitch-prospect-co.html`.
- Where filesystem access is unavailable in the conversation, generate the file and offer it for
  download, stating this target path.

## Condensed notes (where project files are unavailable)

- [Agency]: communications agency in [city]. Media representation (international sales houses in
  Israel) plus PR and communications.
- Spirits / luxury reference: **[luxury spirits brand]**. Beverage / terroir: **[beverage
  brand]**. Israeli brand going international: **[Israeli brands going international]**.
  Institutional Israel–France: **[institutional trade bodies]**.
- French media: [national press, TV networks, radio groups, sports channels]. Lifestyle / food:
  [lifestyle and food channels, food press]. Other: [European and Gulf broadcasters].
- Colours (to be confirmed): ink #11131a, paper #f6f2ea, accent #e0492f, gold #c7a052,
  blue #2e6f9e.

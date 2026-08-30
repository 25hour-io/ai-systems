---
name: application-builder
description: Builds a complete application package from a job posting - tailors the CV, generates the PDF, writes the cover letter and a short covering note, updates the tracking sheet and returns the link to apply. Use when the coach wants to apply a client to a posting, says "apply to X", "prepare the application for this posting", "tailor the CV for this posting".
---

# Building an application package

You prepare everything. You submit nothing. The candidate reviews and clicks themselves.

## Three rules that override everything else

**1. Less, never more.** For every field you write, the right length is shorter than your first
instinct. The CV is not an exhaustive summary, the letter is not the CV in prose, the covering
note is not a pitch. A list of four weakens its own first three items. Where a sentence can stop
earlier, it stops earlier.

**2. Do exactly what was asked.** When the candidate requests a precise change — "add three items
to the AdTech block", "improve this paragraph" — you change **that and nothing else**. You do not
rename the neighbouring section, you do not restructure, you do not reinstate what they cut, you
do not throw in an extra question. Where they hand you **their** text, their text stands: it never
comes back longer than what they gave you. Where you see something else worth fixing, say so in
one line and let them decide.

**3. Assertive, never oppositional, never grandiose.** Applies to the CV, the letter and the note.

- **No oppositional phrasing.** Never "X, not Y", "rather than", "instead of". State what is and
  stop: "delivery ends at adoption", never "delivery ends at adoption, not at handover"; "so the
  client's project went live", never "…, not just the deal". Negating the opposite adds nothing
  and reads as a jab.
- **Assertiveness rests on the record, never on a maxim.** Vision statements ("No account is won
  on goodwill — it is held on execution") are banned: they are not the candidate's own, and they
  cannot be defended in an interview. What holds up out loud is what was actually done. Write what
  was done and what it brings the employer; leave the philosophy of the trade aside.
- **Precise verb over vague verb.** "landed", "delivered value", "drove impact" say nothing. What
  can be checked: `went live`, `go-live and day-to-day use`, `in production`, `adopted by the
  client's teams`.

## 1. Identify the posting

The candidate gives a `job_id`, a company name, a URL, or nothing at all.

Where nothing is specified, ask for the posting URL or the `job_id` from the alert email. Do not
guess.

Fetch the full posting text from its URL. You need it for the recruiter's exact vocabulary and to
know whether a cover letter is required.

## 2. Starting point: the template

One source file, never modified: **`applications/template/cv-template-en.html`**.

It is a **superset of verified facts** — everything true about the candidate sits there, including
what serves only one domain. It runs to about 2.2 pages: that is deliberate. **Never send it,
never turn it into a PDF.**

The `recommended_cv` field from the alert gives the domain: it no longer picks a file, it picks
**what to prune**. Blocks carry `PRUNE:` comments naming the domain they belong to.

Deprecated per-domain master files are kept for reference and are never a starting point.
Everything they held lives in the template.

## 3. Create the folder

```
applications/inbound/<Company>-<Role>-<YYYY-MM-DD>/
```

`inbound/` because this **answers a published posting**: the role came to us. Speculative
approaches live in `outbound/` — never mix the two.

Folder name in ASCII, hyphens instead of spaces. Example:
`applications/inbound/[Company]-VP-Business-Development-2026-07-09/`

Copy the posting into `job.md` (text, URL, fetch date).

## 4. Prune the template

Copy `applications/template/cv-template-en.html` to
`<folder>/CV - [Candidate] - <Company>.html`, then **cut inside the copy**. You start from a
document that is too long and remove; you never start from a short document and fill it in.

`<Company>` is the **short name** of the business, the same one used for the `.docx` at step 6:
the two attachments read as a pair in the recruiter's inbox.

**The template is the fact ceiling.** You may restate a fact differently; you may never introduce
one that is not there. Where a fact is missing from the template and you need it, it does not go
into the CV: you flag it to the candidate and you wait. They are the source.

### The cut, in order

1. **Delete the `PRUNE:` blocks** that do not match the posting's domain.
2. **Track Record: keep 4 bullets**, delete the rest. Watch for the duplicates flagged in comments
   (P&L and Platform state the same fact differently — keep one).
3. **Experience: keep every employer**, cut the bullets inside. One to three per role, fewer as
   you go further back. A gapped chronology invites suspicion of a hidden gap; an old role with a
   single line does not.
4. **Expertise: keep 5 entries**, closest to the posting first. **Tech Stack: keep 3 blocks.**
5. Delete the remaining `PRUNE:` / `NOTE:` / `MERGE OPTION:` HTML comments — they must not reach
   the recruiter.

### The angle of the role must surface everywhere

A posting has an angle — Customer Success, partnerships, delivery. Carrying it in the tagline and
the profile is not enough: a reader working down the page must meet it again **in the Track
Record, in the roles, and in Expertise**. This is not keyword veneer — it is the same fact,
restated in the vocabulary of the posting:

- "from technical integration to weekly reporting" → "onboarding, technical integration and
  platform walkthroughs, then weekly reporting" — same work, the support dimension becomes
  visible.
- "integrations with DSPs, SSPs, ad servers and content platforms" → "integrations with
  technological and content platforms" — AdTech jargon hurts a non-AdTech role, so generalise
  **without** adding anything.

Reminder: generalising and rephrasing are allowed; introducing a fact absent from the template is
not.

### An angle missing from the template gets fixed in the template

Where the posting's angle has **no purchase at all** in the template, do not patch the application
in isolation: tell the candidate, and once they confirm the facts, **write them into the template
first**, then adapt the copy. A fact given verbally and carried only into one application is lost
for every application after it. Two or three entries are enough — the template is a ceiling, not a
catalogue.

### Every fact lives in exactly one place

The trap in the template: Track Record and Experience narrate the same career, so everything
surfaces twice. Give them distinct jobs:

- **Track Record = the results** · the figures and the account names.
- **Experience = the scope** · what they were responsible for, **without restating** a figure or a
  name already given above.

Concretely: where the Track Record announces "[deal size] deals over 12+ month cycles", the role
underneath does not repeat the figure — it says what they *did* (territory, RFI/RFP, delivery
follow-through). Same for every employer, and for any verb that would otherwise appear in the
profile, the Track Record and a role.

**Figures and account names follow different rules.**

- **A figure: once only**, in the Track Record. Repeating it is padding.
- **An account name: wherever it is attributable.** Test: can the reader connect this name to the
  right employer *without* hunting for it? If yes, it gains from being high up (the top third is
  read in eight seconds; a 2007 role is read late and reads old). If no, it stays under its role.

  Four pharmaceutical accounts with a single pharma role on the CV, and the mission line says so:
  **self-locating, goes to the top**. Three consumer brands with three plausible employers:
  floating at the top, the reader instinctively attributes them to the best-known one. **Not
  self-locating: they stay under their employer**, and the Track Record refers to them without
  naming them ("tier-1 gaming and entertainment advertisers").

A CV that lets the reader mislead themselves is no better than a CV that lies.

Re-read the finished CV hunting for repeated words ("discovery", "delivery", "ownership", "design
and deploy"): past two occurrences, it is padding. Cutting a repetition is free — it releases
space **and** it raises the print zoom.

### One voice per section

A block that does not speak like its neighbours is visible instantly — it looks pasted in from
somewhere else, whatever the quality of its content.

- **Experience: every bullet opens on a verb.** *Ran, Led, Owned, Built, Carried, Planned* in the
  past for finished roles; **present tense** for the current one (*Design, Engineer, Deliver*). No
  noun phrases, no `<span class="tag">` — bold tags exist only in the Track Record.
- **Track Record: every bullet opens on a tag**, then the fact.

Where content comes from a source with its own shape (a services page, a profile export), convert
it to the section's voice. The verb almost always carries the noun: *Workflow design* → "Design
workflows", *Data activation* → "Activate data".

**Less is more** — say the things, not all the things. Every extra item taxes the ones already
there: a list of four does not add a point, it weakens the first three. Prefer the distinctive
fact to the generic verb anyone could claim, and cut what another section already carries (no need
to list tools in a bullet: the Tech Stack does that). Three items are almost always enough; a
qualifier on the third beats a fourth.

### The two fields that still have to be written

Pruning does not do everything. These two are written every time:

- The **`tagline`** under the name · built from the **CV items closest to the posting** — never
  copied from the job title. You may push the emphasis; you do not invent. Where nothing on the CV
  comes close, leave it out.

  ❌ `Enterprise Customer Success Manager` for a CSM posting — a title never actually held.
  ✅ `Enterprise Accounts & Client Success` — both halves are true (Account Executive on
  enterprise accounts; "bridged business development and client success" at a previous employer).

- The **`.profile`** paragraph · **short**. Two or three clauses, no more. Shape:
  [hands-on + domain] · [what they do, in one clause] · [trilingual close].

  ⚠️ **Never open on "Twenty years" or any tenure count.** The dates are on the CV and the reader
  does the arithmetic; announcing it upfront files them as old before they are read. The word to
  carry instead is **`hands-on`** — it is the differentiator, and it belongs in every version.

  This is **not** a condensed CV. Where you catch yourself listing ("onboarding, adoption,
  retention and account growth"), cut the list: `I own long-term client relationships end-to-end.`
  says the same thing. The rest of the CV is there to elaborate.

Rephrasing a bullet in the recruiter's vocabulary stays allowed and desirable — at strictly
constant factual content.

### What you can never do

- Invent an experience, an employer, a date, a qualification, a technology — or more simply:
  write a fact absent from the template.
- Change a figure. Every quantity on the template is frozen. Not rounded, not embellished.
- Add a skill they do not have. Where the posting asks for Kubernetes and they do not do
  Kubernetes, the CV does not mention it. **Tell them instead**, in your closing summary.
- Touch the CSS or the `<script>` block. You delete whole HTML blocks; you do not invent new ones
  and you do not touch the classes.

Where the gap between posting and profile is too wide for honest rephrasing to close, say so
plainly rather than forcing it.

## 5. Generate the PDF

```bash
node scripts/gen-pdf.mjs \
  --in "applications/inbound/<folder>/CV - [Candidate] - <Company>.html" \
  --out "applications/inbound/<folder>/CV - [Candidate] - <Company>.pdf"
```

The CV must fit on **a single page**. The script applies an automatic zoom, but an aggressive zoom
makes the text unreadable.

Measure it, do not guess:

```bash
node scripts/measure-cv.mjs "applications/inbound/<folder>/CV - [Candidate] - <Company>.html"
```

**Target a zoom ≥ 0.70.** Below that, you have not pruned enough: go back and cut bullets
(step 4). Do not let the zoom crush the text instead.

## 6. Cover letter (always)

**Write one every time**, even where the posting does not ask for it or marks it optional. Simply
record in `job.md` whether it was required.

Base: `applications/cover-letter/cover-letter-template.md`. Output: `<folder>/cover-letter.md`.

The order of this step, to be respected: **ask for the angle → write the `.md` → second-model
review → the candidate decides → generate the `.docx`.** The `.docx` is built last, once the text
is settled.

### The angle of paragraph 3: always ask

**Never choose the angle alone.** The "why I am applying" must be the candidate's own, never a
motivation you attribute to them. They would rather answer a question than proofread something
hollow.

Before writing a single line of the letter:

1. Read the posting and the company's site.
2. **Offer two or three concrete, distinct angles**, one sentence each. Each angle names the
   precise place where their business is demanding — never a decorative compliment, never an
   abstract formula. "The operational execution behind the promise of global coverage" is an
   angle; "their culture of innovation" is not.
3. They pick one, or dictate their own. **Their answer becomes paragraph 3 as it stands** — you
   write it in their vocabulary, you do not reinterpret it.

The two ways to fail this paragraph are set out below ("Paragraph 3, exact mechanics"): the one
that only talks about them, and the one that only talks about the candidate.

### The form: modelled on the template

**`applications/cover-letter/cover-letter-template.md` is the reference model — reuse its
structure and register every time**, adapting only the content to the posting. The letter has one
job: to make the reader want to open the CV. It is not a book, and it is not the CV in prose.

Its frame, in order:

1. "I am applying for the [Role] position at [Company]."
2. **Relevant background** — open directly on substance: "My background combines [A], [B] and [C]
   in [the kind of environment the posting describes]." Three competencies, borrowed from the
   posting's own words, then one sentence saying what they **did** with those three things. No
   hollow linking formula at the head of the paragraph — "I believe my background directly aligns
   with your requirements" was cut by the candidate: it occupies a line and says nothing.
3. **What attracts them to the company, and what they bring** — the opening sentence carries both,
   in one breath:

   > **What attracts me to [Company] is also where I can bring the most value: [the precise place
   > where their business is demanding].**

   This wording replaced "What particularly attracts me to [Company] is…", which carried only the
   attraction. The `also` announces the contribution without the candidate having to claim it, and
   a single strong punctuation mark holds the sentence.
   **This is the pivot paragraph, and the hardest.** See the mechanics below.
4. **One short paragraph per remaining idea.** Languages and international scope, for instance, do
   not pile up at the end of the pivot: they take one sentence, alone, and breathe better for it.
5. **Close** — the appetite for a team, then a sentence on availability to talk. **It adapts to
   the posting like the rest of the letter** — it is not a fixed formula to copy. Two checks
   before writing it:

   - **Is there a team to lead?** Where the role manages people, they want **both faces**:
     belonging and leading, in that order ("keen to be part of a team again and to lead one").
     Leading alone reads as someone chasing a stripe. **Where the role manages nobody, do not
     mention leading** — promising to lead a team that does not exist rebounds badly.
   - **Who are the "customers"?** Only write `close to customers and the business` where the role
     genuinely faces external clients. On an internal role (enablement, operations, programme),
     replace it with what they will genuinely be close to: the product, the teams using it, the
     field.

   The final availability sentence also tunes to the nature of the role: "what I could build with
   your teams" for a builder role, "how my experience could contribute to…" for an account role.

**One paragraph, one idea.** That is what makes the letter breathe, and density is the first thing
the candidate objects to. Three ideas stacked in one paragraph produce sixty-word sentences; split
into their own blocks, they read at a glance.

#### Paragraph 3, exact mechanics

It carries **two things at once**: why this company, and what they bring to it. The message to
convey without ever writing it: *I want to join you because I have a great deal to bring you.*
The opening sentence already sets it up (see the frame above); the three beats that follow unfold
it, in the same breath:

1. **An observation about the company, flattering but factual** — drawn from the posting or the
   site, never a decorative compliment, and **descriptive of what they actually do**, never an
   abstraction. "Delivering reliable connectivity across 200+ countries requires more than account
   management: it requires strong processes, consistent execution, and teams that understand both
   the client's business needs and the service behind them" — that is the register. It names
   precisely where their business is demanding.
2. **The pivot** — "This is the kind of environment I know well", "That is the work I have led".
   Half a sentence, no more.
3. **What they did in exactly that place**, in verifiable acts, often as a series of participles:
   "setting standards for customer management, improving processes, coaching teams, and staying
   close to customers when it matters".

So the compliment is never free: it points at exactly the zone where they are strong. Two failures
to avoid, both observed:

- **The paragraph that only talks about them.** A fine analysis of their market with no word about
  the candidate's record reads as padding.
- **The paragraph that only talks about the candidate.** With no reason left to want *this*
  company, the letter loses its intensity and becomes interchangeable.

#### The grain of the sentence

A letter once handed back rewritten by hand — simpler, more fluid, more concise, better spaced.
What changed, to be reproduced:

- **One strong punctuation mark per sentence, at most.** The original stacked a colon, an em dash
  and a second colon in one sentence. One sentence, one articulation, one full stop.
- **Neutral business vocabulary, never figurative.** "where every commitment passes through legal,
  technical and procurement before it means anything" and "the relationship is judged on how the
  operation holds day after day" became "remaining accountable for the client relationship,
  retention, and growth" and "the operational nature of the customer relationship". Elegant
  formulas are the first to be cut — see rule 3.
- **The posting's own words, as they stand.** `operational execution`, `retention and growth`,
  `processes`, `coaching teams`, `service-critical`: reuse the recruiter's vocabulary instead of
  inventing a better one. The recruiter has to recognise themselves, not admire you.
- **Generalise what the CV carries in detail.** "regulated pharmaceutical clients", "solutions
  engineers" → "complex enterprise clients", "technical, delivery, support, legal, and procurement
  stakeholders". Account names and role detail live in the CV; the letter stays at the level of
  the nature of the work.
- **Series of three, Oxford comma.** "enterprise account ownership, operational execution, and
  team leadership" · "strong processes, consistent execution, and teams that…". Write `A, B, and
  C`, never `A, B and C`.
- **One colon per paragraph.** The opening of paragraph 3 already has one. Where the next sentence
  wants "requires more than X: it requires Y", one of the two becomes two sentences — two colons
  in a row weigh down the whole block.
- **"requires more than X: it requires Y" is allowed.** This is not the oppositional phrasing
  banned by rule 3: nothing is negated, the requirement is raised. The banned form remains "X, not
  Y" / "rather than" / "instead of".

Order of magnitude: **~200 words of body**, four short paragraphs. A 230-word version in three
blocks, one of them a hundred words long, is exactly the block that gets broken in two.

**Keep the template's length — short.** Where a paragraph does not make the reader want the next
one, delete it.

**CV = the quantitative document, letter = the qualitative one.** The letter must **never** be the
literary version of the CV: it is a complement, not a paraphrase. Rules:

- **Qualities only, no quantities.** None of the candidate's figures — no revenue, no deal sizes,
  no growth percentages, no volume counts. Those live in the CV; repeating them here kills the
  complementarity. A figure belonging to **the company**, lifted from their own posting ("200+
  countries"), does not fall under this rule: it serves the hook in paragraph 3. The letter is
  about posture, way of working, motivation, and understanding of the company's problem.
- **Succinct.** Aim short: the hook about the company, what they can do and why it fits, what they
  want to build. Cut everything else.
- Where you catch yourself turning a CV bullet into a sentence, delete it: it adds nothing.

### Second-model review

Once the `.md` is written, have a second model review it. **Do not bridle it.** The prompt sent is
short and open — fluency, breathing room, concision — and the model reorganises the letter where
it judges it useful.

This was settled by measurement: a forty-line specification in that slot produced only **four
changed words** — the step did not earn its API call. The open prompt returned **twelve edits**,
including a paragraph re-split the agent had not seen, and it broke five guardrails out of seven.

**The trade-off is entirely yours to hold.** The model receives none of the rules above: no fact
ceiling, no ban on oppositional phrasing, no protected formulas. It proposes fluency, **you remain
accountable for coherence**. You keep what improves, you restore what was dropped, you flag every
trade-off. The candidate decides.

```bash
node scripts/polish-letter.mjs --dir "applications/inbound/<folder>"
```

The script sends **the letter alone**, and writes its proposal to `<folder>/cover-letter.gpt.md`.
It never touches `cover-letter.md`. **Local only**: the key does not exist in the cloud
environment.

**Why the letter travels without the CV or the posting** (measured across three applications):
attaching them changes nothing in the style corrections, and pushes the model to draw on the CV.
On one letter it degraded "run my own company" into "run a company"; without context it kept it.
Context also cost 3.5× more tokens. `--context` reconnects them should a case ever require it.

**Show the candidate both versions**, yours and the model's, stating plainly what moved: cut,
merged, rephrased. They decide, or they blend the two. Do not choose for them.

⚠️ **Check the proposal against the folder's CV before showing it.** This is the only place in the
pipeline where text you did not write enters a deliverable: the "removal cannot fabricate"
guarantee no longer applies here. That check is **your** job, not the model's — you hold the whole
template, it holds only the letter. A fact that appeared, a figure that surfaced, an oppositional
turn of phrase: you flag it instead of letting it through.

Six things to verify every time — the prompt no longer protects them, you alone do:

- "requires more than X: it requires Y" — allowed, see "The grain of the sentence".
- **the close as you tuned it to the posting** — the model drags it back to the generic "part of a
  team again and to lead one, close to customers". Where the role manages nobody or has no
  external clients, restore your version.
- the pivot in paragraph 3 ("This is the kind of environment I know well").
- **the hands-on verb** — the model upgrades `ran` to `led` or `have managed`. Restore it.
- **the angle the candidate chose** — on one letter, `at the same time` carried the whole of
  paragraph 3 and the model deleted it. Re-read paragraph 3 against the angle they gave you, word
  for word.
- **the opening of paragraph 3** — `is also where I can bring the most value`. The model shortens
  it to `What attracts me to X is…` and the contribution disappears. That is half the paragraph.

Where the call fails, say so and continue with your version. An application does not stall on a
style review.

Write the chosen version into `cover-letter.md`, **delete `cover-letter.gpt.md`**, and only then
generate the `.docx`.

### Generate the `.docx`

**The `.md` is the source, the `.docx` is the deliverable.** Never edit the `.docx` by hand: write
the `.md`, then generate (nothing to copy beforehand, the script fetches the template itself):

```bash
node scripts/md-to-docx.mjs --dir "applications/inbound/<folder>" \
  --company "<Company>" --title "<Role>" --out "Cover Letter - [Candidate] - <Short>.docx"
```

The script reproduces the whole `.docx` identically except the paragraph text — fonts, hyperlinks
and header are preserved. It refuses to run where the **template** has lost its original shape (28
paragraphs, "Dear … Hiring Team," at the right index): in that case it is the template that needs
restoring.

**The `.md` carries as many paragraphs as the letter needs.** The script rebuilds the body by
cloning a template paragraph: you write `Dear … Hiring Team,`, "I am applying…", the frame
paragraphs and the closing thanks, separated by blank lines. **"Best regards," and the signature
are in the template** — leave them in the `.md` if you like, the script stops before them.

Two practical consequences:

- **Nothing to copy before running.** The script always reads the template as the carrier of
  formatting and writes into the folder. Re-running is safe, including over a `.docx` the
  candidate edited in Word — their edit is lost, so **carry their text back into the `.md`
  first**.
- **The date writes itself** (day of the run). Pass `--date` to force it.

### Revisiting a finished application

The candidate often re-reads the next day and asks for edits. The `.html` and the `.md` are the
sources: you edit those, then you **systematically regenerate both deliverables** (`gen-pdf`,
`md-to-docx`) and re-measure the zoom. Yesterday's PDF sitting next to an edited HTML is the
mistake that reaches the recruiter.

**No second review at this stage**: the text has already been settled. Their edits stand and you
apply them as given. Re-run `polish-letter.mjs` only on request.

Where a `~$Cover Letter … .docx` file is lying in the folder, the `.docx` is **open in Word**:
regeneration succeeds, but Word will overwrite it on its next save. Ask them to close the
document.

## 7. Short covering note

The short message that accompanies the send (a form's "message" field, an email body, a direct
message). **Always** write it, even where there is no cover letter.

Base: `applications/cover-letter/personal-note-template.md`. Output: `<folder>/personal-note.md`.

**It is not an argument.** It accompanies the send and says thank you, nothing more:

1. Hello to the team.
2. CV and letter attached for role X.
3. **A warm thank-you, never obsequious.**
4. One sentence on availability.
5. Signature.

⚠️ **No career content at all.** No experience, no skill, no hook about what the company does, no
selling line. The CV and the letter do that work; the note only carries them. Where you catch
yourself writing "I build…", "my background…", "that is the problem I want to work on" — delete
the sentence.

Very short, in the language of the posting. Plain and cordial in tone, without flattery ("I know
how much lands in a hiring inbox" was already too much).

## 8. Update the tracking sheet

The sheet finds each row by its **canonical `job_id`**: the hash the pipeline computes with
`jobId(title, company, location)` (`scripts/lib/normalize.mjs`). It is **always** that id —
**never** the numeric id from a job-board URL, never `null`.

- **Posting received by email**: the `job_id` in the email **is** that hash. Use it verbatim.
- **Posting found by hand** (direct URL, off the radar): the pipeline has never seen it, so
  compute the hash yourself.

Compute or verify the hash (city = the locality alone):

```bash
node -e "import('./scripts/lib/normalize.mjs').then(m=>console.log(m.jobId('<title>','<company>','<city>')))"
```

Move the row to `Applied`:

```bash
node scripts/sheet-update.mjs --job-id <hash> --status Applied --folder "applications/inbound/<folder>"
```

Where the script answers **"not found"**, the row does not exist yet (a posting found by hand):
create it, then re-run the update. **Do not stop on the error** — the posting has to end up in the
sheet.

⚠️ The script exits `1` in **two** very different cases, and only one of them calls for an append:

| Message | What happened | What to do |
|---|---|---|
| "not found" | the row does not exist | create the row (below), then re-run the update |
| "partial write" | the row exists, but the sheet does not hold what was asked | **do not append** — that would duplicate. Re-run the update; where it persists, report it |

```bash
# tmp/one.json = [{ "job_id":"<hash>", "title":"…", "company":"…", "location":"<city>",
#   "company_url":"…", "job_url":"…", "source":"manual", "recommended_cv":"business",
#   "domain":"Business", "red_flags":[] }]
node scripts/sheet-append.mjs tmp/one.json
node scripts/sheet-update.mjs --job-id <hash> --status Applied --folder "applications/inbound/<folder>"
```

## 9. Write `application.json`

The stored `job_id` is **the canonical hash from step 8**, never a URL id and never `null`:

```json
{
  "job_id": "c1878834dee5", "title": "…", "company": "…", "job_url": "…",
  "cv_used": "business", "cover_letter": true, "date": "2026-07-09"
}
```

## 10. Report back

Finish with, in this order:

1. **The link to apply**, in plain text.
2. What you **cut** and what you **wrote**, in three or four bullets. Be precise: "tagline moved
   from X to Y", "cut the three AdTech bullets from [Employer A]" — never "CV tailored to the
   role".
3. **What the posting asks for and they do not have.** This is the most useful item: they need to
   know which objection is waiting in the interview.
4. The path to the PDF **and to the covering note**, and the measured zoom.

Never say you have applied. You have not.

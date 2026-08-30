# Agent skills

A skill is an operating procedure an agent executes: written once, versioned, and run the same way
every time by whoever needs it.

That is the difference between using AI and enabling it. A prompt typed into a window solves one
problem for one person and disappears. A skill carries expertise that someone else can run without
holding the expertise themselves.

Three are published here, covering three different jobs. Two of them, `application-builder` and
`interview-trainer`, are one product: the procedures a career coach runs with a client, from the
application that goes out to the rehearsal before the interview. They pair with the
[role matching pipeline](../role-matching-pipeline), which finds the postings in the first place.

---

## [`prospect-pitch`](./prospect-pitch.md) — client deliverable

Built for a communications agency. Turns a prospect's name and website into a standalone,
interactive, bilingual pitch document ready to present.

The agent researches the prospect, analyses the target market on four axes (market, customers,
competition, environment), matches the prospect against the agency's existing client roster,
selects relevant media from its portfolio, and generates the document.

Three things make it worth reading.

**1. Regulatory constraints drive the output.** For alcohol brands entering France, the agent
applies the Loi Évin — advertising is banned on television and in cinema — so it removes those
channels from the media mix and argues press, digital, framed radio and PR instead. Compliance is a
filter inside the procedure, ahead of the recommendation.

**2. It refuses to force a match.** Verbatim from the skill:

> **ABSOLUTE RULE — never invent.** Where no credible link exists, say so plainly and open a
> "New opportunity" section: position the prospect as the agency's first reference in a category.
> Do not force a shaky analogy.

Same for pricing: budget bands are indicative and marked "to be confirmed", never invented.

**3. Bilingual output with script direction.** Every string carries French and Hebrew variants;
switching languages flips `dir="rtl"` and swaps in Hebrew typefaces. Where a Hebrew translation is
unfinished, the document falls back to French and says so on a banner rather than shipping a
half-translated page.

## [`application-builder`](./application-builder.md) — recruitment documents under a fact ceiling

Built for a career coach. Produces a tailored CV and cover letter for a client, from a job posting.

The reason it exists as a written procedure rather than a habit: a coach who tailors twenty
applications a week cannot re-derive the rules each time, and cannot let quality drift between the
first client of the month and the last.

The mechanism is `Structural`, and it is the same one described in the
[role matching pipeline](../role-matching-pipeline). The source CV is a verified superset,
deliberately too long to send. Each application is a copy that is only ever **cut down**. Removal
cannot fabricate.

A fact missing from the template is escalated to the coach and added to the template. It never
enters a generated document directly. The agent prepares; the coach reviews, the client sends.

Then comes the part most procedures leave out. The skill documents where its own guarantee stops. A
second model reviews the letter for style, and that model receives none of the rules — no fact
ceiling, no protected formulas. So the skill lists the six things to check on its output before
anyone sees it. **Naming where a guarantee ends is part of the guarantee.**

## [`interview-trainer`](./interview-trainer.md) — training simulation

The other half of the coaching product. Runs a spoken mock interview in French, English or Hebrew:
the interviewer speaks aloud, the client answers, every answer is debriefed in writing, and the
session ends in a written report the coach can work from.

It is the piece a coach cannot scale by hand. Rehearsal only works if it is repeated, and no coach
bills for the fourth run of the same question set.

It reads the documents that were actually sent for that application, so the questions come from the
real file rather than from a generic bank.

It runs on two surfaces: a desktop version driving local speech synthesis, and a mobile version
packaged for a phone, because full voice mode lives in the mobile app. Both are generated from one
source file, so the two surfaces cannot drift apart.

The Hebrew mode carries a piece of linguistic engineering worth reading on its own. Everyday Hebrew
is written without vowels, so a speech engine has to guess and gets it wrong. The skill specifies
exactly which vocalisation marks to write and which to omit: the dagesh comes out because it is no
longer heard in speech, except on the three letters where it changes the consonant outright. Wrong
vocalisation is worse than none.

---

## What runs through all three

**Every skill names what it must never make up.** They do not all enforce it the same way, and the
difference is stated rather than blurred:

| Skill | Guardrail | Level |
|---|---|---|
| `application-builder` | the fact ceiling — generation only removes from a verified superset | **Structural** |
| `prospect-pitch` | the absolute matching rule, the "to be confirmed" pricing marker | **Constrained** |
| `interview-trainer` | model answers composed only of template facts | **Constrained** |

Only the first is mechanical. The other two are prompt-level rules that hold because the procedure
names them and a human reads the output. See the levels in the
[repository README](../README.md).

**Human-in-the-loop by design.** These skills prepare work. They do not send it. On the one
guardrail that is `Constrained` and carries real consequence — a second model rewriting a letter
with none of the rules — the procedure lists the six things to check on its output before anyone
sees it.

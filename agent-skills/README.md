# Agent skills

A skill is a versioned standard operating procedure executed by an agent: defined scope, fixed
sequence, explicit guardrails, and a defined output format. It makes expertise easier to repeat and
review. Outputs can still vary, so human checks remain part of the procedure.

## Business use and ownership

The prospect pitch procedure helps a salesperson prepare a relevant, bilingual presentation without
starting every pitch from scratch. The career-coaching procedures support opportunity review,
application preparation, and interview practice. In each case, the specialist reviews the output
before it reaches a client or candidate.

We led the work at 25hour from specifications and product requirements through procedure design,
implementation, training, and adoption.

Three skills are showcased below. `application-builder` and `interview-trainer` form a career
coaching suite paired with the [role matching pipeline](../role-matching-pipeline), while
`prospect-pitch` automates client pitch creation.

---

## [`prospect-pitch`](./prospect-pitch.md) — client deliverable

Built for a communications agency. Helps a salesperson turn a prospect's name and URL into a bilingual (FR/HE) pitch
package: an interactive HTML document and an aligned PPTX deck generated from a single analysis to
ensure consistency.

The agent conducts research across four axes (market, customers, competition, environment), matches
findings with agency portfolio references, and outputs tailored recommendations.

**1. Strict adherence to agency design systems.** Enforces brand tokens via CSS custom properties,
handles Hebrew RTL layout automatically, and follows explicit visual rules (no pictograms, no forced
capitals, layout-driven hierarchy).

**2. Sector-specific rules.** Includes restrictions such as excluding TV and cinema channels when
preparing a pitch for an alcohol brand entering France. The final recommendation still needs
appropriate human review.

**3. Rules against invented claims.** The procedure includes this directive:

> **ABSOLUTE RULE — never invent.** Where no credible link exists, state it plainly and open a "New
> opportunity" section to position the prospect in a new category. Never force a weak match.

The procedure also instructs the agent to mark pricing bands "to be confirmed" rather than inventing
them. These are prompt-level controls, followed by human review.

---

## [`application-builder`](./application-builder.md) — tailored documents by subtraction

Generates targeted CVs and cover letters from job postings.

Uses a **Structural** approach based on a master CV template. The CV is created by **trimming
irrelevant data**, preventing new experience claims in that step. Other generated text still
requires review.

Missing details trigger an escalation to the coach to update the core template. An automated style
check reviews output formatting prior to delivery.

---

## [`interview-trainer`](./interview-trainer.md) — voice interview simulation

Runs interactive mock interviews in French, English, or Hebrew featuring spoken questions, oral
responses, real-time written debriefs, and a summary report for the coach.

**Cross-platform voice loop (TTS/STT).** Operates smoothly across desktop (local speech synthesis
and dictation) and mobile assistant modes using tailored application context.

**Hebrew text-to-speech optimisation.** Prescribes the niqqud that resolves pronunciation ambiguity,
and transports Hebrew base64-encoded to keep alphabet and direction handling out of the path.

---

## Shared architectural guardrails

Each skill enforces precise controls to prevent factual invention:

| Skill | Guardrail | Level |
|---|---|---|
| `application-builder` | Subtraction-only generation from verified profile data | **Structural** |
| `prospect-pitch` | Strict matching rule and "to be confirmed" pricing flags | **Constrained** |
| `interview-trainer` | Model answers restricted strictly to template facts | **Constrained** |

These skills prepare structured assets for final human review prior to sending.


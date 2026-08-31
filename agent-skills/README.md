# Agent skills

A skill is a versioned standard operating procedure executed by an agent: defined scope, fixed
sequence, explicit guardrails, and predictable output. It enforces standardisation so the same
inputs consistently generate deliverables with identical structure and quality.

Three skills are showcased below. `application-builder` and `interview-trainer` form a career
coaching suite paired with the [role matching pipeline](../role-matching-pipeline), while
`prospect-pitch` automates client pitch creation.

---

## [`prospect-pitch`](./prospect-pitch.md) — client deliverable

Built for a communications agency. Converts a prospect's name and URL into a bilingual (FR/HE) pitch
package: an interactive HTML document and an aligned PPTX deck generated from a single analysis to
ensure consistency.

The agent conducts research across four axes (market, customers, competition, environment), matches
findings with agency portfolio references, and outputs tailored recommendations.

**1. Strict adherence to agency design systems.** Enforces brand tokens via CSS custom properties,
handles Hebrew RTL layout automatically, and follows explicit visual rules (no pictograms, no forced
capitals, layout-driven hierarchy).

**2. Embedded regulatory compliance.** Automatically adapts strategies to legal frameworks, such as
excluding TV and cinema channels for alcohol brands entering France under Loi Évin.

**3. Strict anti-hallucination rules.** Direct directive from the skill:

> **ABSOLUTE RULE — never invent.** Where no credible link exists, state it plainly and open a "New
> opportunity" section to position the prospect in a new category. Never force a weak match.

Pricing bands are strictly marked as "to be confirmed" rather than estimated.

---

## [`application-builder`](./application-builder.md) — tailored documents by subtraction

Generates targeted CVs and cover letters from job postings.

Uses a **Structural** approach based on a master CV template. Deliverables are created purely by
**trimming irrelevant data**, mechanically eliminating the risk of fabricated experience.

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

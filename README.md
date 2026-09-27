# AI systems built for business use

At [25hour](https://25hour.io), we turn recurring work into AI systems people can use. We define the problem and product requirements, design and build the workflow, then support training, adoption, and operation. AI coding agents help with implementation; we remain responsible for the decisions, controls, and outcomes described here.

This is how we approach **AI enablement**: start with the work people need to do, make the system useful in that setting, and give them the understanding and control to use it well.

This repository is a selected portfolio of that work. Start with the business use cases below. Each case then opens the design, evidence, costs, limitations, and implementation for readers who want more detail.

## Start with three use cases

| Use case | What changes for people | Evidence and status |
| --- | --- | --- |
| [Channel Digest Agent](./channel-digest-agent) | Teams spend less time sorting through busy channels and can focus on the messages that need attention. The digest translates discussions and surfaces action items; people decide what to do next. | Live since May 2026; processes about 100 messages a day across six channels. [Evaluation](./channel-digest-agent/evals) |
| [Prospect Pitch skill](./agent-skills#prospect-pitch--client-deliverable) | A salesperson can prepare a tailored, bilingual pitch from a prospect brief while keeping the final recommendation and presentation under human review. | Published procedure for a repeatable sales workflow. |
| [Vox Memo](./vox-memo) | Captured knowledge becomes easier to find and reuse, supporting better context sharing and collaboration. | Live web and Android product; about 62 memos captured per month. This usage figure is not a measure of team adoption. |

## More systems and components

| Project | Business purpose | Status |
| --- | --- | --- |
| [Multi-Agent Orchestrator](./multi-agent-orchestrator) | Bring several business tools into one conversational workflow while controlling operating cost. | Live; 10 specialised agents deployed. |
| [Role Matching Pipeline](./role-matching-pipeline) | Help a career coach find and review relevant opportunities within a fixed sourcing budget. | Live; runs twice daily. |
| [Voice Knowledge Agent](./voice-knowledge-agent) | Explore hands-free access to product knowledge for field sales. | **Self-initiated prototype**; works end to end, not deployed for business users. |
| [n8n-nodes-sse-client](./n8n-sse-node) | Let n8n workflows consume live event streams during execution. | Open-source component published on npm; about 800 downloads in the past year. |

[Agent skills](./agent-skills) are versioned procedures for repeatable work. They specify the task, inputs, sequence, controls, and expected deliverables. The published examples cover sales pitches and career coaching. A procedure makes expertise easier to share, while each output still needs the checks appropriate to its use.

## What we own from brief to adoption

Our work spans the full path: understand the users and their current process; write specifications and product requirements; choose the system design and cost limits; build and evaluate it; document it; train people to use it; and improve it after launch. The case studies show the decisions made at each stage, including where human review remains necessary.
The self-initiated voice prototype stops before client rollout and adoption.

## Evidence, costs, and limits

- **Operating cost:** The [orchestrator](./multi-agent-orchestrator) records measured per-request values of $0.25 before redesign and about $0.006 after redesign, a reduction of roughly 40 times. The [role matching pipeline](./role-matching-pipeline) shows how source-level costs informed which feeds to keep.
- **Output quality:** The [Channel Digest evaluation](./channel-digest-agent/evals) measured exact recall of critical details at 73.7% before a prompt change and 92.1% afterward. The target was 100%; the test still failed that target. A separate validator catches some structured omissions, with stated limits.
- **Adoption signals:** About 800 npm downloads describe downloads of the [SSE node](./n8n-sse-node), not unique users or active installations. The usage figures for live systems describe observed activity, not a quantified business outcome.
- **Control:** Some outputs are checked by code, some are restricted by the structure of the task, and others rely on instructions plus human review. Each case should say which applies.

## How these were built

We use AI coding agents as implementation tools. At 25hour, we lead the work from specifications and product requirements through architecture, delivery, training, and adoption. Our responsibility includes deciding what the system should do, when its output needs review, what it may cost, and how failures become visible.

Client and personal names are replaced by placeholders where necessary. Technology vendors are named so readers can understand the implementation. Examples and screenshots are identified as such.

## Contact

[25hour.io](https://25hour.io) · hello@25hour.io


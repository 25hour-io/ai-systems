# AI Systems in Production

I design, deploy, and operate production AI systems, with continuous monitoring, cost tracking, and
iteration on live traffic. This repository gathers selected architectures built at
[25hour](https://25hour.io).

Key highlights: the [cost audit](./multi-agent-orchestrator) that cut per-request costs by 40x, the
[eval harness](./channel-digest-agent/evals) that improved prompt accuracy from 73.7% to 92.1%, and
the [open-source n8n node](./n8n-sse-node) (~800 installs).

Every case study details the business context, core architectural choices, operational metrics, and
unit costs.

---

## Deployed Systems

| System | Function | Status |
|---|---|---|
| [**Vox Memo**](./vox-memo) | Knowledge capture & semantic retrieval (web + Android) | Live · ~62 memos/month |
| [**Channel Digest Agent**](./channel-digest-agent) | Filters, translates, and extracts actions from channels | Live · ~100 msgs/day |
| [**Multi-Agent Orchestrator**](./multi-agent-orchestrator) | Routing layer across 10 specialized domain agents | Live · 10 agents active |
| [**Role Matching Pipeline**](./role-matching-pipeline) | Role sourcing & candidate scoring under strict cost caps | Live · 2x daily |
| [**Voice Knowledge Agent**](./voice-knowledge-agent) | Hands-free product Q&A grounded in enterprise corpus | Live · Internal deployment |
| [**n8n-nodes-sse-client**](./n8n-sse-node) | Open-source n8n node for Server-Sent Events | [npm](https://www.npmjs.com/package/n8n-nodes-sse-client) · ~800 installs |

---

## Agent Skills

[**Agent skills**](./agent-skills) are versioned standard operating procedures
executed by agents: explicit scope, fixed sequence, named guardrails, and structured output.

Unlike raw prompts, a versioned skill ensures identical execution on every run — consistent logic,
enforced guardrails, and predictable output formats.

---

## Engineering Principles

**1. Cost governance drives design.** Cheap models handle bulk volume; high-cost models execute only
critical decision points. Every project publishes its unit cost.

**2. Multi-tiered guardrails.** Safety constraints are explicit and categorized by strength:

| Level | Definition | Example |
|---|---|---|
| **Structural** | Invalid outputs are mechanically impossible | Removal-only operations from verified sets |
| **Verified** | Outputs are checked against inputs programmatically | Field-by-field database write checks |
| **Constrained** | Prompt-level rules without automated validation downstream | Instruction-following refusal prompts |

**3. Reliable writes require post-verification.** Webhooks returning status 200 do not guarantee DB
persistence. Systems read back rows to verify integrity.

**4. Idempotent, safe execution.** Scheduled tasks persist state to prevent duplicate processing.
Unhandled errors trigger alerts to human operators.

**5. Labeled data metrics.** Metrics are strictly labeled as `MEASURED` (production data),
`ESTIMATED` (calculated from volume/pricing), or `DESIGN TARGET`.

---

## System Design & Operational Model

Architectures, workflow graphs, and guardrails are manually designed. Coding agents handle
implementation details under strict parameters: explicit SOPs, isolated failure boundaries, and
continuous evaluation loops.

---

## Privacy Note

All sensitive names, clients, and proprietary identifiers have been sanitized with placeholders.

---

## Contact

[25hour.io](https://25hour.io) — hello@25hour.io

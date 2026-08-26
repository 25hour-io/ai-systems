# Hubert

An agentic orchestration layer over business tools, reached through chat. Ask it anything; it
routes to the agent that owns that surface and answers.

**Live.** 10 agents deployed on Anthropic Managed Agents.

| Agent | Surface |
|---|---|
| Calendar · Gmail · Google Workspace | Scheduling and mail |
| Zoho CRM | Pipeline and contacts |
| Tavily | Web research |
| Telegram · WhatsApp · X | Messaging and monitoring |
| Memo | Knowledge capture (see [Vox Memo](../vox-memo)) |
| Hubert | Routing |

---

## The cost problem this system is about

The first architecture was one agent holding every capability: 14 MCP servers, roughly 140 tool
definitions, about 57,000 input tokens on every single request.

**`MEASURED`: 0.25 $ per request.** Including "what's on my calendar today?".

The diagnosis is the interesting part. Around **70 % of that cost was tool definitions** — the
full catalogue shipped on every call, whether or not a single one of those tools was used. The
assistant was paying to describe capabilities it had no intention of reaching for.

At 50 to 100 interactions a day, an assistant on that architecture costs more per month than the
work it saves.

## The redesign

Split the monolith into a thin router plus callable sub-agents. Only the relevant sub-agent's
tools load per query.

Two effects follow:

- **`DESIGN TARGET`: per-request cost drops to ~0.006 $** — a factor of roughly 40, because the
  tool catalogue stops travelling with every request.
- **Model routing becomes per-agent.** A small model routes and handles simple operations; a
  larger one is reserved for work that needs it, such as drafting mail.

A third effect is structural: the workflow engine comes out of the middle as orchestration
middleware, which removes a hop and a moving part.

**Status of the numbers:** the 0.25 $ figure is `MEASURED` on the running system. The ~0.006 $
figure is a `DESIGN TARGET` for the callable-agent architecture, not an observed result. The
sub-agent pattern itself was already validated in production on a master agent running since 2025.

---

## Why this is here

The engineering worth showing is the audit, not the wiring. Watching a token bill, breaking it
down by what actually consumed it, finding that most of it bought nothing, and rebuilding around
that finding — that sequence is what keeps an AI feature alive past its first invoice.

The same reflex runs through the [role matching pipeline](../role-matching), where three sources
were cut on a cost-per-result table.

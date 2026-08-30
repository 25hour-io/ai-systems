# Multi-Agent Orchestrator

An orchestration layer over business tools, reached through chat. Ask it anything; it routes to
the agent that owns that surface and answers. It runs internally under the name *Hubert*.

**Live.** A thin router plus 10 callable sub-agents, deployed on Anthropic Managed Agents. That is
the architecture running today — the monolith the story below starts with is the one it replaced.

| Agent | Surface |
|---|---|
| Calendar · Gmail · Google Workspace | Scheduling and mail |
| Zoho CRM | Pipeline and contacts |
| Tavily | Web research |
| Slack · WhatsApp | Messaging and monitoring |
| Memo | Knowledge capture (see [Vox Memo](../vox-memo)) |
| Router | Query classification and dispatch |

---

## The cost problem this system is about

It starts as an unremarkable invoice and turns into a whodunnit.

The first architecture was one agent holding every capability: 14 MCP servers, roughly 140 tool
definitions, about 57,000 input tokens on every single request.

**`MEASURED`: 0.25 $ per request.** Including "what's on my calendar today?".

The obvious suspect is the model calls. The obvious suspect is innocent. Around **70 % of that cost
was tool definitions** — the full catalogue travelling inside the context window on every call,
whether or not a single one of those tools was used. The assistant was paying to describe
capabilities it had no intention of reaching for.

At 50 to 100 interactions a day, an assistant on that architecture costs more per month than the
work it saves.

## The redesign, which is what runs now

The monolith was split into a thin router plus callable sub-agents. Only the relevant sub-agent's
tools load per query.

Two effects follow:

- **`DESIGN TARGET`: per-request cost drops to ~0.006 $** — a factor of roughly 40, because the
  tool catalogue stops travelling with every request.
- **Model routing becomes per-agent.** A small model routes and handles simple operations; a
  larger one is reserved for work that needs it, such as drafting mail.

A third effect is structural. The workflow engine comes out of the middle as orchestration
middleware, which removes a hop and a moving part.

**Which architecture is live, and what each number describes.** The deployed system is the router
plus callable sub-agents — the monolith is gone. The 0.25 $ is `MEASURED`, on that monolith: it is
what the old architecture cost per request, and the reason the current one exists. The ~0.006 $ is
the `DESIGN TARGET` the rebuild was built to hit — the tool catalogue no longer travels with every
request, which is where the factor of 40 comes from, but that figure is projected from token volumes
rather than read off a month of invoices. The sub-agent pattern itself has been running in
production since 2025.

---

## The chat gateway

The routing layer answers through chat, and the gateway in front of it is its own piece of
engineering. It accepts text, voice and files from more than one client, holds a conversation
across turns, and streams the agent's answer back.

```mermaid
flowchart TD
    TG([Messaging client]) --> EX[Extract Input]
    WEB([Embedded web chat]) --> EX
    EX --> SW{Switch Input Type}

    SW -->|voice| VOICE
    subgraph VOICE["voice"]
      direction LR
      GVF[Get Voice File] --> TR["Transcribe Recording<br/>Whisper"] --> IMP["Improve Transcription<br/>Haiku 4.5"] --> STT[Set Transcribed Text]
    end

    SW -->|photo · document| PFC["Prepare File Content<br/>base64 content blocks"]
    SW -->|text| LS[Lookup Session]
    VOICE --> LS
    PFC --> LS

    LS --> IFA{"active in the last<br/>15 minutes?"}
    IFA -->|yes| RS[Reuse Session]
    IFA -->|no| NEW

    subgraph NEW["new session"]
      direction LR
      CS[Create Session] --> DOS[Delete Old Session] --> SS[Store Session]
    end

    RS --> SMR["Send Message"]
    NEW --> SMN["Send Message"]
    SMR --> SSE["SSE Client<br/>stream until the session goes idle"]
    SMN --> SSE
    SSE --> ER[Extract Response]
    ER --> UA[Update Activity]
    UA --> SO{Input was voice?}
    SO -->|no| SR[Send Response]
    SO -->|yes| TTS["Cartesia TTS<br/>sonic-3.5"]
    TTS --> SAF[Send Audio File]
```

Five decisions in that graph are worth reading, and they are the reason it is a gateway rather than
a bot.

**1. The client is interchangeable, and that is the point of the first node.** Two entry points feed
the same graph, and `Extract Input` normalises both into one shape — chat id, message, input type,
file id — before anything downstream runs. Every node after it references the normalised fields,
never a trigger. Adding a third client is one branch in one node, not a second copy of the
workflow.

**2. A session is a cost decision with a fifteen-minute clock.** Sessions are keyed by chat id and
reused while the last activity is under fifteen minutes; past that, a new one is created and the
stale row deleted. Reusing forever means an ever-growing context replayed on every turn. Never
reusing means the assistant forgets the previous sentence. The clock is where those two failures
meet, and it is a parameter rather than a principle — it should move when measured traffic says so.

**3. The reply is streamed, and that is why the [SSE node](../n8n-sse-node) exists.** A managed
agent answers over Server-Sent Events, and it may run for minutes: it calls tools, waits on APIs,
thinks. The workflow has to open that stream mid-run, hold it, and close it on the right event —
here, `session.status_(idle|terminated)`, with a five-minute ceiling. n8n shipped no way to do that,
so the node was written and published. The component in this repository with the most external
users was built to unblock the system in this one.

**4. Speech gets a second model, because transcription is not the last word.** A voice note goes to
Whisper, and the raw transcript then passes through a small model whose only job is to repair it:
homophones, proper nouns, mangled idioms. The instruction that matters is the conservative one —
when in doubt, keep the original. A correction pass that rewrites freely is worse than no pass at
all, because it launders its own errors into fluent, confident text.

**5. Voice in, voice out.** The output branch reads the *input* type, not a user setting. A question
asked aloud is answered aloud, a typed one is answered in text. Nobody configures anything.

### Code

- [`prepare-file-content.js`](./code/prepare-file-content.js) — turns an uploaded file into model
  input. Contains the one line that took longest to find: under `binaryMode: separate`, reading the
  binary field returns a reference and only `getBinaryDataBuffer()` returns the bytes.
- [`extract-response.js`](./code/extract-response.js) — reduces the whole event stream to a single
  answer: the *last* agent message, not the first and not all of them joined.

---

## Why this is here

The engineering worth showing is the audit, not the wiring. Watching a token bill, breaking it down
by what actually consumed it, finding that most of it bought nothing, and rebuilding around that
finding — that sequence is what keeps an AI feature alive past its first invoice.

The same reflex runs through the [role matching pipeline](../role-matching-pipeline), where three
sources were cut on a cost-per-result table.

The gateway above is the other half of the answer. An architecture that survives its invoice still
has to be reachable, hold a conversation, and answer in the medium the question was asked in.

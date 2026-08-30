# n8n-nodes-sse-client

An n8n community node that connects to any Server-Sent Events endpoint **mid-workflow**.

**Published on npm** · MIT · v0.3.1 · ~800 downloads over the past year

[npmjs.com/package/n8n-nodes-sse-client](https://www.npmjs.com/package/n8n-nodes-sse-client)

```bash
npm install n8n-nodes-sse-client
```

---

## The gap it fills

n8n ships an SSE *trigger*: a stream can start a workflow. There was no way to consume a stream
from inside one — to reach step 4, open an SSE connection, collect what comes back, and carry on
to step 5.

That shape is what streaming APIs need. Token streams from model providers, job progress feeds,
live event buses: all of them answer over SSE, and a workflow that can only be *started* by a
stream cannot talk to them.

## What it does

Opens an SSE stream with authentication and custom headers, collects events, and returns them
when a configurable stop condition is met.

The stop condition is the design question. A stream has no natural end, and a workflow step must
end. So closing is explicit and configurable: on an event count, on a timeout, on a matching
event.

Built in TypeScript, published under the MIT licence.

---

## Where it runs

It was not written as an exercise. The [multi-agent orchestrator](../multi-agent-orchestrator) in
this repository answers over a managed-agent session that emits Server-Sent Events and can run for
minutes while it calls tools. Its gateway has to open that stream in the middle of a workflow, hold
it, and close it on `session.status_(idle|terminated)` — the exact shape n8n had no node for.

That is also where the stop condition stopped being a design question and became a specific one: a
stream that never closes hangs a workflow, and a stream closed too early truncates the answer a
user is waiting on.

## Why it is in this portfolio

It is the smallest item here and the only one other people already depend on. Roughly 800
installs over the past year come from strangers who hit the same gap and found this in the
registry.

Publishing is its own discipline: a stranger's failing workflow at 2am is the acceptance test,
and it rewards a narrow scope, an honest README and a version history that keeps faith with
whoever installed the last one.

# n8n-nodes-sse-client

An n8n community node designed to connect to any Server-Sent Events (SSE) stream **mid-workflow**.

**Published on npm** · MIT License · v0.3.1 · ~800 past-year downloads

[npmjs.com/package/n8n-nodes-sse-client](https://www.npmjs.com/package/n8n-nodes-sse-client)

```
npm install n8n-nodes-sse-client
```

---

## The Core Problem

n8n includes an SSE *trigger* to initiate workflows from a stream, but lacked a native mechanism to
consume streaming endpoints mid-workflow. Modern APIs—such as LLM token streams, live status
updates, and event buses—reply via SSE. Process workflows require consuming these mid-execution
rather than using them solely as triggers.

---

## What It Does

Opens mid-workflow SSE connections with custom headers and authentication, aggregates incoming
events, and safely terminates when target criteria are met.

Because streams lack implicit termination, execution ends based on explicit rules: maximum event
count, timeout limits, or matching event payloads.

---

## Production Usage

Powers the gateway for long-running multi-agent orchestration streams within this repository. It
processes continuous event flows and reliably disconnects upon reaching
`session.status_(idle|terminated)` signals.

---

## Adoption & Maintenance

Maintained under strict semantic versioning and backward compatibility for ~800 installs over the
past year.

/**
 * Extract Response — reduce an event stream to one answer.
 *
 * The SSE client returns every event the session emitted: tool calls, tool
 * results, status changes, partial messages, and the agent's own messages.
 * The chat client needs exactly one string.
 *
 * Runs with executeOnce: the stream is one logical response, not N items.
 */

const msgs = $input.all().filter((i) => i.json.type === 'agent.message');
if (msgs.length === 0) return '(no agent response)';

// The LAST agent message, not the first and not all of them concatenated.
// An agent that calls three tools emits progress messages between them; only
// the final one answers the question that was asked.
const last = msgs[msgs.length - 1];

let text =
  (last.json.content || [])
    .filter((c) => c.type === 'text')
    .map((c) => c.text.trim())
    .join('\n\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim() || '(no agent response)';

// Strip any markup the model wrapped around its reasoning. Chat clients render
// unknown tags as literal text, so a stray tag reaches the user as noise.
text = text.replace(/<[^>]*>/g, '');

return text;

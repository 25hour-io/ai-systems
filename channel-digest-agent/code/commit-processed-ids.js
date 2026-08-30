/**
 * Commit Processed IDs — the last node before the media forward.
 *
 * Position is the entire point. This node sits AFTER the digest has been sent,
 * not before the work starts.
 *
 * n8n persists `$getWorkflowStaticData()` even when an execution FAILS: the
 * workflowExecuteAfter hook saves it with no check on execution status. So a
 * node that marks messages as processed upfront destroys them the moment
 * anything downstream errors — the model provider rate-limits, the channel API
 * times out, and those messages are gone from every future cycle.
 *
 * Read the memory upstream, carry the candidate IDs through the payload,
 * commit them here.
 */

const staticData = $getWorkflowStaticData('global');
const processed = new Set(staticData.processedIds || []);

const newIds = $('Parse and Split').first().json.newIds || [];
for (const id of newIds) processed.add(id);

// Bounded memory: keeping every ID forever grows static data without limit.
// 2000 covers several days at current volume, well past the 4-hour window.
staticData.processedIds = [...processed].slice(-2000);

return $input.all();

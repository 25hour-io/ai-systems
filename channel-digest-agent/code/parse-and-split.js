/**
 * Parse and Split — the routing node.
 *
 * Reads the raw payload returned by the messaging API, drops everything that is
 * not worth a model call, and splits what remains into three streams: text,
 * images, documents.
 *
 * The important part is what this node does NOT do: it reads the processed-ID
 * memory, it never writes to it. See commit-processed-ids.js.
 */

const groupNames = {};
for (const g of $('Build Group List').all()) groupNames[g.json.jid] = g.json.name;

// Hard caps per cycle. Media is the expensive path: one model call each.
const MAX_IMAGES = 10;
const MAX_DOCUMENTS = 5;

// Protocol noise the channel emits that no reader ever needs to see.
const IGNORED_TYPES = new Set([
  'reactionMessage',
  'protocolMessage',
  'senderKeyDistributionMessage',
  'pollUpdateMessage',
  'pollCreationMessage',
  'stickerMessage',
]);

// Read-only access to the memory. Processed IDs are committed in
// 'Commit Processed IDs', AFTER the digest has been sent. Writing them here
// would mean a downstream failure (model provider, channel API) silently
// destroys the messages it failed on: n8n persists static data even when the
// execution errors.
const staticData = $getWorkflowStaticData('global');
const processedIds = new Set(staticData.processedIds || []);

const seen = new Set();
const cutoff = Math.floor((Date.now() - 4 * 60 * 60 * 1000) / 1000);

const items = $input.all();
let textMessages = [];
let imageItems = [];
let documentItems = [];

for (const item of items) {
  const data = item.json;
  const records = data.data?.messages?.records || data.messages?.records || data.records || [];
  if (!Array.isArray(records)) continue;

  for (const msg of records) {
    const remoteJid = msg.key?.remoteJid;
    const msgId = msg.key?.id;

    let ts = Number(msg.messageTimestamp);
    if (ts > 1e12) ts = Math.floor(ts / 1000); // the API returns seconds or ms depending on the route

    if (
      !remoteJid ||
      !groupNames[remoteJid] ||     // a channel we do not watch
      ts < cutoff ||                // older than the window
      !msgId ||
      processedIds.has(msgId) ||    // already digested in an earlier cycle
      seen.has(msgId) ||            // duplicated inside this payload
      IGNORED_TYPES.has(msg.messageType)
    ) continue;

    seen.add(msgId);

    const base = {
      group: groupNames[remoteJid],
      sender: msg.pushName || msg.key?.participant || 'Unknown',
      timestamp: ts,
      id: msgId,
    };

    const docMsg =
      msg.message?.documentMessage ||
      msg.message?.documentWithCaptionMessage?.message?.documentMessage;

    if (msg.message?.imageMessage) {
      imageItems.push({ ...base, rawMessage: msg, caption: msg.message.imageMessage.caption || '' });
    } else if (docMsg) {
      const mimetype = docMsg.mimetype || 'application/octet-stream';
      documentItems.push({
        ...base,
        rawMessage: msg,
        fileName: docMsg.fileName || docMsg.title || 'document',
        mimetype,
        caption: docMsg.caption || '',
        isPdf: mimetype === 'application/pdf',
      });
    } else {
      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        '[media]';
      textMessages.push({ ...base, text });
    }
  }
}

imageItems = imageItems.slice(0, MAX_IMAGES);
documentItems = documentItems.slice(0, MAX_DOCUMENTS);

// newIds carries only what actually survived truncation. Media dropped by the
// MAX_* caps is deliberately left uncommitted, so the next cycle picks it up
// instead of losing it.
const newIds = [...textMessages, ...imageItems, ...documentItems].map((m) => m.id);

return [{
  json: {
    textMessages,
    imageItems,
    documentItems,
    newIds,
    messageCount: textMessages.length + imageItems.length + documentItems.length,
    imageCount: imageItems.length,
    documentCount: documentItems.length,
  },
}];

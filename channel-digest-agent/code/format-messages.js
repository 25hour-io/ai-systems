/**
 * Format Messages — fan-in.
 *
 * Three branches converge here: plain text, images described by the vision
 * model, PDFs summarised by the document model. Two of them may not have run
 * at all in this cycle, which is the whole difficulty.
 *
 * `$('Node').isExecuted` is the guard. A bare `$('Build Image Text').all()` on
 * a cycle with no images throws and takes the text digest down with it — a
 * cycle carrying zero images is the common case, not the edge case.
 */

const carrier = $('Parse and Split').first().json;
const textMessages = carrier.textMessages || [];

const describedImages = $('Build Image Text').isExecuted
  ? $('Build Image Text').all().map((i) => i.json)
  : [];

const describedPdfs = $('Build Doc Text PDF').isExecuted
  ? $('Build Doc Text PDF').all().map((i) => i.json)
  : [];

// Non-PDF attachments get no model call: the filename alone tells the reader
// something arrived, which is enough to decide whether to open the channel.
const otherDocs = $('Prepare Doc Binary').isExecuted
  ? $('Prepare Doc Binary')
      .all()
      .map((i) => i.json)
      .filter((d) => !d.isPdf && !d.skip)
      .map((d) => ({
        group: d.group,
        sender: d.sender,
        timestamp: d.timestamp,
        id: d.id,
        text: '[Document : ' + d.fileName + ']',
      }))
  : [];

// Chronological order across all three branches. The model receives one
// transcript, not three lists: a deadline announced in an image and corrected
// in a later text message must read in that order or the digest inverts them.
const allMessages = [...textMessages, ...describedImages, ...describedPdfs, ...otherDocs];
allMessages.sort((a, b) => a.timestamp - b.timestamp);

let formatted = '';
if (allMessages.length === 0) {
  formatted = 'Aucun nouveau message dans la derniere heure.';
} else {
  for (const msg of allMessages) {
    const time = new Date(msg.timestamp * 1000).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jerusalem',
    });
    formatted += '[' + msg.group + '] ' + time + ' - ' + msg.sender + ': ' + msg.text + '\n';
  }
}

return [{ json: { messages: formatted, messageCount: allMessages.length } }];

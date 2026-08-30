/**
 * Prepare File Content — turns an uploaded file into model input.
 *
 * A user drops a photo, a PDF, a spreadsheet into the chat. The agent API
 * takes content blocks, not file handles, so the file has to be read into
 * memory and base64-encoded before it can be sent.
 *
 * Runs once per item.
 */

const binaryKeys = Object.keys($input.item.binary || {});
if (binaryKeys.length === 0) {
  // Fail loudly. A silent empty payload here reaches the agent as a message
  // with no file attached, and it answers about a document it never received.
  throw new Error('No binary data found — the file was not downloaded by the trigger');
}

const binaryKey = binaryKeys[0];
const binaryData = $input.item.binary[binaryKey];
const mimeType = binaryData.mimeType || 'application/octet-stream';

// This workflow runs with binaryMode "separate", which keeps file contents out
// of the execution payload. Reading `binaryData.data` in that mode returns a
// reference, not the bytes — getBinaryDataBuffer() is the only thing that
// returns the actual content.
const buffer = await this.helpers.getBinaryDataBuffer(0, binaryKey);
const base64 = buffer.toString('base64');

const isImage = mimeType.startsWith('image/');

const fileBlock = {
  type: isImage ? 'image' : 'document',
  source: { type: 'base64', media_type: mimeType, data: base64 },
};

const userMessage = $('Extract Input').item.json.userMessage || '';
const chatId = $('Extract Input').item.json.chatId;
const inputType = $('Extract Input').item.json.inputType;

// The file block goes first, the caption second. A file sent with no caption
// still needs a text block: the API rejects a message that is attachment-only,
// and "analyse this" is what the user meant anyway.
const content = [fileBlock];
content.push({ type: 'text', text: userMessage || 'Analyse this file.' });

return {
  json: {
    chatId,
    userMessage: userMessage || 'Analyse this file.',
    inputType,
    messageContentJson: JSON.stringify(content),
  },
};

const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');

const PORT = process.env.PORT || 8080;
const wss = new WebSocketServer({ port: PORT });

const clients = new Map();

console.log(`WebSocket relay server starting on port ${PORT}...`);

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  const metadata = { id: clientId, pairedWith: null };
  clients.set(ws, metadata);

  console.log(`Client connected with ID: ${clientId}`);
  ws.send(JSON.stringify({ type: 'REGISTERED', payload: { id: clientId } }));

  ws.on('message', (message) => {
    // We expect two types of messages: JSON for control, and binary for data relay.
    if (Buffer.isBuffer(message)) {
      // This is a binary message (an encrypted chunk)
      const pairedWs = metadata.pairedWith;
      if (pairedWs && pairedWs.readyState === 1) { // 1 means OPEN
        pairedWs.send(message);
      } else {
        console.warn(`Client ${clientId} sent binary data but is not paired or peer is disconnected.`);
      }
      return;
    }

    // This is a JSON control message
    try {
      const parsedMessage = JSON.parse(message);
      handleControlMessage(ws, parsedMessage);
    } catch (e) {
      console.error(`Failed to parse control message from ${clientId}:`, e);
    }
  });

  ws.on('close', () => {
    console.log(`Client ${clientId} disconnected.`);
    const pairedWs = metadata.pairedWith;
    if (pairedWs && pairedWs.readyState === 1) {
      pairedWs.send(JSON.stringify({ type: 'PEER_DISCONNECTED' }));
      const pairedMetadata = clients.get(pairedWs);
      if (pairedMetadata) pairedMetadata.pairedWith = null;
    }
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error(`Error from client ${clientId}:`, error);
  });
});

function handleControlMessage(ws, message) {
  const metadata = clients.get(ws);
  if (!metadata) return;

  switch (message.type) {
    case 'PAIR_REQUEST':
      const targetId = message.payload.targetId;
      let targetWs = null;

      // Find the target WebSocket client by their ID
      for (const [clientWs, clientMeta] of clients.entries()) {
        if (clientMeta.id === targetId) {
          targetWs = clientWs;
          break;
        }
      }

      if (targetWs) {
        console.log(`Pairing ${metadata.id} with ${targetId}`);
        metadata.pairedWith = targetWs;
        const targetMetadata = clients.get(targetWs);
        if (targetMetadata) targetMetadata.pairedWith = ws;

        // Notify both clients of successful pairing
        ws.send(JSON.stringify({ type: 'PAIRED', payload: { peerId: targetId } }));
        targetWs.send(JSON.stringify({ type: 'PAIRED', payload: { peerId: metadata.id } }));
      } else {
        console.warn(`Client ${metadata.id} failed to pair with non-existent target ${targetId}`);
        ws.send(JSON.stringify({ type: 'PAIR_FAILED', payload: { reason: 'Target peer not found' } }));
      }
      break;

    default:
      console.log(`Received unknown control message type: ${message.type}`);
  }
}

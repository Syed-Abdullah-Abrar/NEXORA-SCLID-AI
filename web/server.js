// NEXORA WebSocket Server
// Synchronizes story frames across all connected clients

import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 8080;

const wss = new WebSocketServer({ port: PORT });

console.log(`NEXORA WebSocket Server running on port ${PORT}`);

let currentFrame = 0;

// Track all connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  // Send current frame to new client
  ws.send(JSON.stringify({ type: 'frame', frame: currentFrame }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.type === 'advance') {
        // Broadcast frame advance to all clients
        broadcast({ type: 'frame', frame: data.frame });
      }
      if (data.type === 'reset') {
        currentFrame = 0;
        broadcast({ type: 'frame', frame: 0 });
      }
    } catch (e) {
      console.error('Invalid message:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log('Client disconnected');
  });
});

function broadcast(message) {
  const payload = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(payload);
    }
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  wss.close(() => {
    process.exit(0);
  });
});

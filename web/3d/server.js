// NEXORA 3D Digital Twin - Sync Server
// Simple WebSocket server for synchronizing disaster timeline across views

const WebSocket = require('ws');

const PORT = 8080;
const wss = new WebSocket.Server({ port: PORT });

// Connected clients
const clients = new Set();

// Broadcast state
let currentState = {
  time: 0,
  role: 'commander',
  events: []
};

console.log(`NEXORA Sync Server running on ws://localhost:${PORT}`);

wss.on('connection', (ws) => {
  clients.add(ws);
  console.log(`Client connected. Total: ${clients.size}`);

  // Send current state to new client
  ws.send(JSON.stringify({
    type: 'sync',
    state: currentState
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case 'update':
          // Broadcast state update to all clients
          currentState.time = data.time;
          broadcast({ type: 'sync', state: currentState });
          break;

        case 'role_change':
          currentState.role = data.role;
          broadcast({ type: 'role_change', role: data.role });
          break;

        case 'event':
          currentState.events.push(data.event);
          broadcast({ type: 'event', event: data.event });
          break;
      }
    } catch (e) {
      console.error('Invalid message:', e);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    console.log(`Client disconnected. Total: ${clients.size}`);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });
});

function broadcast(message) {
  const payload = JSON.stringify(message);
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// Simulate disaster timeline progression
setInterval(() => {
  if (currentState.time < 100) {
    currentState.time += 0.5;
    broadcast({ type: 'sync', state: currentState });
  }
}, 500);

console.log('Disaster simulation running...');

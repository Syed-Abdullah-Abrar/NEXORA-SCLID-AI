const WebSocket = require('ws');
const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
  console.log('Connected');
  ws.send(JSON.stringify({ type: 'CHAT_MESSAGE', text: 'Flood detected' }));
});

ws.on('message', (data) => {
  console.log('Received:', data.toString());
  const msg = JSON.parse(data.toString());
  if (msg.type === 'CHAT_RESPONSE') {
    process.exit(0);
  }
});

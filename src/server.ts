import { WebSocketServer, WebSocket } from 'ws';
import * as dotenv from 'dotenv';
import { NexoraPipeline, MemoryArtifact } from './index';
import { MinimaxClient } from './llm/MinimaxClient';
import fs from 'fs';
import path from 'path';
import http from 'http';
import os from 'os';

dotenv.config();

function loadStory() {
  try {
    const storyPath = path.resolve(process.cwd(), 'web/story.js');
    const storyData = fs.readFileSync(storyPath, 'utf8');
    const start = storyData.indexOf('[');
    const end = storyData.lastIndexOf(']');
    if (start === -1 || end === -1) throw new Error("Bounds not found");
    const arrayStr = storyData.substring(start, end + 1);
    return eval(`(${arrayStr})`);
  } catch (e) {
    console.error("CRITICAL: Failed to load story from web/story.js. Using fallback.");
    return [{ title: "Error", presenter_script: "Check web/story.js", ui_state: { ueb_log: "ERROR", agent_statuses: {} } }];
  }
}

// ── MIME types for static file serving ──
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

// ── Static file HTTP server (serves web/ directory) ──
const WEB_ROOT = path.resolve(process.cwd(), 'web');
const PORT = Number(process.env.PORT || 8080);

const httpServer = http.createServer((req, res) => {
  let filePath = path.join(WEB_ROOT, req.url === '/' ? 'index.html' : req.url || 'index.html');

  // Security: prevent directory traversal
  if (!filePath.startsWith(WEB_ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' });
      res.end('<h1>404 — Not Found</h1>');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

httpServer.listen(PORT, '0.0.0.0', () => {
  // Get LAN IP for mobile access
  const nets = os.networkInterfaces();
  let lanIP = 'localhost';
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        lanIP = net.address;
        break;
      }
    }
  }

  console.log(`\n🌐 Server Active: http://0.0.0.0:${PORT}`);
  console.log(`📱 Mobile Access: http://${lanIP}:${PORT}/field.html`);
  console.log(`🖥️  Presenter:    http://${lanIP}:${PORT}/ai-view.html`);
  console.log(`\n(Note: If on Windows/WSL, use your Windows Wi-Fi IP instead of the WSL IP above)`);
});

const THE_STORY = loadStory();
console.log(`\n🛡️  S.C.L.I.D AI ORCHESTRATOR ONLINE`);
console.log(`📍 ${THE_STORY.length} Frames loaded.`);
console.log(`🤖 MLLM: ${process.env.MINIMAX_API_KEY ? 'MiniMax M2.5 Active' : 'Heuristic Fallback'}`);

const wss = new WebSocketServer({ server: httpServer });
const pipeline = new NexoraPipeline();
const llm = new MinimaxClient();

let currentFrameIndex = 0;
let uebLogs: string[] = ["S.C.L.I.D AI SYSTEM INITIALIZED. All agents standing by."];
let agentStatuses = { early_warning: 'idle', situational: 'idle', resource: 'idle' };

const bus = pipeline.getEventBus();

// Global UEB listener — captures all events for the log
bus.subscribe('hazard.detected', (data: unknown) => {
  const d = data as { artifact?: MemoryArtifact };
  const hazard = (d.artifact?.data as { hazard?: string })?.hazard || 'unknown';
  uebLogs.push(`🔴 UEB [hazard.detected]: ${hazard.toUpperCase()} threat confirmed by Early Warning Agent`);
  agentStatuses.early_warning = 'complete';
  broadcastState();
});

bus.subscribe('situational.fusion.completed', (data: unknown) => {
  const d = data as { artifact?: MemoryArtifact };
  const risk = (d.artifact?.data as { riskLevel?: number })?.riskLevel || 0;
  uebLogs.push(`🟡 UEB [situational.fusion]: Multi-modal fusion complete. Risk Level: ${risk}/100`);
  agentStatuses.situational = 'complete';
  broadcastState();
});

bus.subscribe('resource.plan.generated', (data: unknown) => {
  const d = data as { artifact?: MemoryArtifact };
  const plan = (d.artifact?.data as { plan?: string })?.plan || 'UNKNOWN';
  uebLogs.push(`🟢 UEB [resource.plan]: Plan ${plan} generated. Awaiting Commander authorization.`);
  agentStatuses.resource = 'complete';
  broadcastState();
});

const clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  console.log('📡 Dashboard connected.');
  clients.add(ws);
  sendState(ws);

  ws.on('message', async (message: unknown) => {
    try {
      const msg = JSON.parse((message as Buffer).toString());

      if (msg.type === 'ADVANCE') {
        if (currentFrameIndex < THE_STORY.length - 1) {
          currentFrameIndex++;
          const frame = THE_STORY[currentFrameIndex];
          console.log(`➡️  Frame ${currentFrameIndex}: ${frame.title}`);

          // Immediately broadcast the new frame
          broadcastState();

          // Async LLM decision
          uebLogs.push(`🧠 MLLM: Analyzing scenario — "${frame.title}"...`);
          broadcastState();

          const contextStr = pipeline.getMemoryBank().getAll().slice(-3).map((a: MemoryArtifact) => JSON.stringify(a.data)).join(' | ');
          const decision = await llm.decideAction(frame.presenter_script, contextStr);

          if (decision.topic && decision.topic !== 'none') {
            uebLogs.push(`🧠 MLLM: Decision → ${decision.topic}`);

            if (decision.topic.includes('hazard')) agentStatuses.early_warning = 'processing';
            if (decision.topic.includes('situational')) agentStatuses.situational = 'processing';
            if (decision.topic.includes('resource')) agentStatuses.resource = 'processing';
            broadcastState();

            const artifact: MemoryArtifact = {
              id: `llm-${Date.now()}`,
              timestamp: new Date().toISOString(),
              source: 'MLLM_Orchestrator',
              data: decision.payload,
              tags: ['llm_decision', decision.topic]
            };
            await pipeline.getMemoryBank().store(artifact, 'current');
            bus.publish(decision.topic as string, { artifact });
          }
          broadcastState();
        }

      } else if (msg.type === 'PREV') {
        if (currentFrameIndex > 0) currentFrameIndex--;
        broadcastState();

      } else if (msg.type === 'CHAT_MESSAGE') {
        const userText = msg.text as string;
        console.log(`💬 Commander: "${userText}"`);

        // Broadcast loading state
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'CHAT_LOADING' }));
          }
        });

        // Build context for the LLM
        const frame = THE_STORY[currentFrameIndex];
        const memoryArtifacts = pipeline.getMemoryBank().getAll().slice(-5);
        const contextStr = memoryArtifacts.map((a: MemoryArtifact) =>
          `[${a.source}]: ${JSON.stringify(a.data).substring(0, 200)}`
        ).join('\n');

        const reply = await llm.chatWithContext(
          userText,
          frame.title,
          frame.presenter_script,
          contextStr,
          agentStatuses
        );

        // Broadcast the reply
        clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'CHAT_RESPONSE', response: reply }));
          }
        });

        uebLogs.push(`💬 Commander Chat: "${userText.substring(0, 60)}..."`);

        // Check if the message should trigger the agent pipeline
        if (llm.shouldTriggerPipeline(userText)) {
          console.log(`🚀 Chat triggered full agent cascade!`);
          uebLogs.push(`🚀 PIPELINE ACTIVATED by Commander directive`);
          broadcastState();

          // Run the full 3-agent cascade with real-time status updates
          await pipeline.runAgentCascade(undefined, undefined, (statuses) => {
            agentStatuses = { ...statuses };
            broadcastState();
          });

          uebLogs.push(`✅ Agent cascade complete. ${pipeline.getMemoryBank().getAll().length} artifacts in Memory Bank.`);
          broadcastState();
        }
      }
    } catch (e) {
      console.error("WS Error:", e);
    }
  });

  ws.on('close', () => clients.delete(ws));
});

function getState() {
  const frame = THE_STORY[currentFrameIndex];
  return {
    frameIndex: currentFrameIndex,
    totalFrames: THE_STORY.length,
    title: frame.title,
    presenter_script: frame.presenter_script,
    ui_state: {
      ...frame.ui_state,
      agent_statuses: agentStatuses,
      ueb_log: uebLogs.slice(-1)[0],
      ueb_log_full: uebLogs.slice(-15),
      memory_bank: pipeline.getMemoryBank().getAll().map((a: MemoryArtifact) => ({
        id: a.id,
        source: a.source,
        timestamp: a.timestamp,
        data: JSON.stringify(a.data).substring(0, 300),
        tags: a.tags
      }))
    }
  };
}

function sendState(ws: WebSocket) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'STATE_UPDATE', state: getState() }));
  }
}

function broadcastState() {
  const payload = JSON.stringify({ type: 'STATE_UPDATE', state: getState() });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) client.send(payload);
  });
}

console.log(`\n🌐 WebSocket server listening on ws://localhost:8080`);
console.log(`📋 Open web/index.html to begin.\n`);

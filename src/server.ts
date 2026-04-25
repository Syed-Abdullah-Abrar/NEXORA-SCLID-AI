import { WebSocketServer, WebSocket } from 'ws';
import * as dotenv from 'dotenv';
import { NexoraPipeline, MemoryArtifact } from './index';
import { MinimaxClient } from './llm/MinimaxClient';
import fs from 'fs';
import path from 'path';

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

const THE_STORY = loadStory();
console.log(`\n🚀 NEXORA ORCHESTRATOR ONLINE`);
console.log(`📍 ${THE_STORY.length} Frames loaded.`);
console.log(`🤖 MLLM: ${process.env.MINIMAX_API_KEY ? 'MiniMax 6.5 Active' : 'Fallback Heuristics'}`);

const wss = new WebSocketServer({ port: 8080 });
const pipeline = new NexoraPipeline();
const llm = new MinimaxClient();

let currentFrameIndex = 0;
let uebLogs: string[] = ["System Initialized. Awaiting Handshake..."];
let agentStatuses = { early_warning: 'idle', situational: 'idle', resource: 'idle' };

const bus = pipeline.getEventBus();

bus.subscribe('*', async (data: any, topic?: string) => {
  if (!topic) return;
  const eventData = data.payload?.data || data;
  const msg = `EVENT: ${topic} - ` + JSON.stringify(eventData).substring(0, 100);
  uebLogs.push(msg);
  
  if (topic === 'hazard.detected') agentStatuses.early_warning = 'complete';
  if (topic === 'situational.fusion.completed') agentStatuses.situational = 'complete';
  if (topic === 'resource.plan.generated') agentStatuses.resource = 'complete';
  if (topic === 'ham.burst.received') agentStatuses.situational = 'processing';
  
  broadcastState();
});

const clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  console.log('Dashboard connected.');
  clients.add(ws);
  sendState(ws);
  
  ws.on('message', async (message: any) => {
    try {
      const msg = JSON.parse(message.toString());
      if (msg.type === 'ADVANCE') {
        if (currentFrameIndex < THE_STORY.length - 1) {
          currentFrameIndex++;
          const frame = THE_STORY[currentFrameIndex];
          console.log(`➡️  Advancing to Frame ${currentFrameIndex}: ${frame.title}`);
          
          uebLogs.push(`LLM: Parsing Scenario...`);
          broadcastState();

          const contextStr = pipeline.getMemoryBank().getAll().slice(-3).map(a => JSON.stringify(a.data)).join(' | ');
          const decision = await llm.decideAction(frame.presenter_script, contextStr);
          
          if (decision.topic && decision.topic !== 'none') {
             uebLogs.push(`LLM: Action determined -> ${decision.topic}`);
             if (decision.topic.includes('hazard')) agentStatuses.early_warning = 'processing';
             if (decision.topic.includes('situational')) agentStatuses.situational = 'processing';
             if (decision.topic.includes('resource')) agentStatuses.resource = 'processing';
             
             broadcastState();
             const artifact: MemoryArtifact = {
               id: `llm-${Date.now()}`,
               timestamp: new Date().toISOString(),
               source: 'MLLM_Orchestrator',
               data: decision.payload,
               tags: ['llm_decision']
             };
             await pipeline.getMemoryBank().store(artifact, 'current');
             bus.publish(decision.topic as any, { artifact });
          }
          broadcastState();
        }
      } else if (msg.type === 'PREV') {
         if (currentFrameIndex > 0) currentFrameIndex--;
         broadcastState();
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
      memory_bank: pipeline.getMemoryBank().getAll().map(a => ({ source: a.source, data: JSON.stringify(a.data) }))
    }
  };
}

function sendState(ws: WebSocket) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type: 'STATE_UPDATE', state: getState() }));
}

function broadcastState() {
  const payload = JSON.stringify({ type: 'STATE_UPDATE', state: getState() });
  clients.forEach(client => { if (client.readyState === WebSocket.OPEN) client.send(payload); });
}

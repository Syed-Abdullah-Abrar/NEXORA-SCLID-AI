import { WebSocketServer, WebSocket } from 'ws';
import * as dotenv from 'dotenv';
import { NexoraPipeline, MemoryArtifact } from './index';
import { MinimaxClient } from './llm/MinimaxClient';
import fs from 'fs';
import path from 'path';

dotenv.config();

const storyPath = path.resolve(process.cwd(), 'web/story.js');
let storyData = fs.readFileSync(storyPath, 'utf8');
const storyMatch = storyData.match(/const THE_STORY = (\[.*\]);/s);
let THE_STORY: any[] = [];
if (storyMatch) {
  THE_STORY = eval(storyMatch[1]);
}

const wss = new WebSocketServer({ port: 8080 });
console.log('NEXORA LangGraph Server running on 8080');

const pipeline = new NexoraPipeline();
const llm = new MinimaxClient();

let currentFrameIndex = 0;
let uebLogs: string[] = [];
let agentStatuses = { early_warning: 'idle', situational: 'idle', resource: 'idle' };

const bus = pipeline.getEventBus();

// Hook UEB to capture logs and statuses
bus.subscribe('*', async (data: any, topic?: string) => {
  if (!topic) return;
  const eventData = data.payload?.data || data;
  uebLogs.push(`EVENT: ${topic} - ` + JSON.stringify(eventData).substring(0, 100));
  
  if (topic === 'hazard.detected') agentStatuses.early_warning = 'complete';
  if (topic === 'situational.fusion.completed') agentStatuses.situational = 'complete';
  if (topic === 'resource.plan.generated') agentStatuses.resource = 'complete';
  if (topic === 'ham.burst.received') agentStatuses.situational = 'processing';
});

const clients = new Set<WebSocket>();

wss.on('connection', (ws: WebSocket) => {
  clients.add(ws);
  sendState(ws);
  
  ws.on('message', async (message: any) => {
    const msg = JSON.parse(message.toString());
    
    if (msg.type === 'ADVANCE') {
      if (currentFrameIndex < THE_STORY.length - 1) {
        currentFrameIndex++;
        const frame = THE_STORY[currentFrameIndex];
        
        console.log(`[FRAME ${currentFrameIndex}] Presenting: ${frame.presenter_script}`);
        
        // Show Analyzing state
        uebLogs.push(`LLM: Analyzing frame ${currentFrameIndex}...`);
        broadcastState();

        const contextStr = pipeline.getMemoryBank().getAll().slice(-3).map(a => JSON.stringify(a.data)).join(' | ');
        const decision = await llm.decideAction(frame.presenter_script, contextStr);
        
        console.log(`[LLM] Decision:`, decision);
        
        if (decision.topic && decision.topic !== 'none') {
           uebLogs.push(`LLM: Action determined -> ${decision.topic}`);
           
           if (decision.topic.includes('hazard')) agentStatuses.early_warning = 'processing';
           if (decision.topic.includes('situational')) agentStatuses.situational = 'processing';
           if (decision.topic.includes('resource') || decision.topic.includes('route')) agentStatuses.resource = 'processing';
           
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
           
           // Simulate processing time
           await new Promise(r => setTimeout(r, 800));
        }

        broadcastState();
      }
    } else if (msg.type === 'PREV') {
       if (currentFrameIndex > 0) currentFrameIndex--;
       broadcastState();
    }
  });
  
  ws.on('close', () => clients.delete(ws));
});

function getState() {
  const frame = THE_STORY[currentFrameIndex];
  if (!frame) return { frameIndex: currentFrameIndex };
  
  // Build dynamic state taking UI structure from story.js but overriding dynamic bits
  const state = {
    frameIndex: currentFrameIndex,
    totalFrames: THE_STORY.length,
    title: frame.title,
    presenter_script: frame.presenter_script,
    ui_state: {
      ...frame.ui_state,
      agent_statuses: agentStatuses,
      ueb_log: uebLogs.slice(-1)[0] || frame.ui_state.ueb_log,
      memory_bank: pipeline.getMemoryBank().getAll().map(a => ({ source: a.source, data: JSON.stringify(a.data) }))
    }
  };
  return state;
}

function sendState(ws: WebSocket) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'STATE_UPDATE', state: getState() }));
  }
}

function broadcastState() {
  const payload = JSON.stringify({ type: 'STATE_UPDATE', state: getState() });
  clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

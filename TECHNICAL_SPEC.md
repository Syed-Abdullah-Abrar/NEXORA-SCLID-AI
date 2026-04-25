# Technical Spec: S.C.L.I.D AI

**Swarm Co-Pilot for Logistics and Intelligent Dispatch**

## 1. Directory Structure
```text
src/
├── server.ts                  # WebSocket LangGraph orchestrator
├── index.ts                   # NexoraPipeline entry point
├── llm/
│   └── MinimaxClient.ts       # MiniMax M2.5 — chat + action decision
├── orchestrator/
│   ├── TaskPlanner.ts         # Query decomposition
│   ├── AgentRegistry.ts       # Skill registry
│   └── UnifiedEventBus.ts     # Pub/Sub event system
├── memory/
│   ├── MemoryBank.ts          # 3-tier storage
│   └── VectorStore.ts         # Cosine similarity vector search
├── agents/
│   ├── BaseAgent.ts           # Abstract base class
│   ├── EarlyWarningAgent.ts
│   ├── SituationalAwarenessAgent.ts
│   └── ResourceAllocationAgent.ts
├── ham/
│   ├── HAMBridgeService.ts    # APRS parsing & voice transcription
│   ├── PacketRadioHandler.ts  # AX.25 frame encoding
│   └── VoiceSynthesizer.ts    # TTS broadcast logic
├── types/
│   ├── index.ts               # Global interfaces
│   └── errors.ts              # Custom errors
└── __tests__/
    └── integration.test.ts    # 6 integration tests

web/
├── index.html                 # S.C.L.I.D landing page
├── ai-view.html               # Presenter — UEB + Chat + Memory Bank
├── eoc.html                   # Commander — Heatmap + Chat + Auth
├── field.html                 # Dark Mode — HAM + AR Compass
├── logistics.html             # Supply Chain — A* Graph + Inventory
├── story.js                   # 7-frame City of Krypton narrative
├── story-client.js            # WebSocket client (chat + state)
└── styles.css                 # Shared design system
```

## 2. Core Interfaces (`src/types/index.ts`)

```typescript
export type AgentDomain = 'early_warning' | 'situational_awareness' | 'resource_allocation';

export interface AgentSkill {
  id: string;
  domain: AgentDomain;
  description: string;
  inputSchema: object;
  outputSchema: object;
}

export interface MemoryArtifact {
  id: string;
  timestamp: string;
  source: string;
  data: unknown;
  tags: string[];
  vector?: number[];
}

export interface TaskGraph {
  tasks: Task[];
}

export interface Task {
  id: string;
  agentId: string;
  dependencies: string[];
  input: unknown;
}

export interface GeoData {
  lat: number; lon: number;
  population?: number;
  criticalInfrastructure?: string[];
  shelterLocations?: string[];
}

export interface DisasterEvent {
  id: string;
  topic: 'hazard.detected' | 'situational.fusion.completed' | 'resource.plan.generated';
  payload: MemoryArtifact;
  metadata: { priority: 'low' | 'medium' | 'high' | 'critical'; isLocal: boolean; };
}
```

## 3. WebSocket Protocol

The `server.ts` WebSocket orchestrator handles:

| Client → Server | Description |
|-----------------|-------------|
| `{ type: 'ADVANCE' }` | Advance to next story frame, triggers LLM `decideAction` |
| `{ type: 'PREV' }` | Go back one frame |
| `{ type: 'CHAT_MESSAGE', text: '...' }` | Commander chat — triggers context-aware LLM response |

| Server → Client | Description |
|-----------------|-------------|
| `{ type: 'STATE_UPDATE', state: {...} }` | Full state including frame, UEB logs, agent statuses, memory bank |
| `{ type: 'CHAT_LOADING' }` | Chat response is being generated |
| `{ type: 'CHAT_RESPONSE', response: '...' }` | LLM chat reply |

### Chat → Pipeline Trigger
When a `CHAT_MESSAGE` contains deployment keywords ("deploy", "activate", "start", "respond", etc.), the server calls `pipeline.runAgentCascade()` which:
1. Runs EarlyWarningAgent → stores artifact → publishes `hazard.detected`
2. Runs SituationalAwarenessAgent → stores artifact → publishes `situational.fusion.completed`
3. Runs ResourceAllocationAgent → stores artifact → publishes `resource.plan.generated`
4. Broadcasts status changes to all clients in real-time

## 4. LLM Integration (`MinimaxClient`)

- **Model:** MiniMax M2.5 via OpenAI-compatible API
- **`chatWithContext()`**: Injects current frame, memory artifacts, and agent statuses into a rich system prompt. The LLM responds as the S.C.L.I.D tactical AI.
- **`decideAction()`**: Evaluates a scenario description and returns a UEB topic + payload in JSON.
- **`shouldTriggerPipeline()`**: Keyword matching to detect deployment commands.
- **`<think>` stripping**: M2.5 chain-of-thought blocks are automatically cleaned.
- **Fallback**: Comprehensive heuristic responses for demo without API key.

## 5. User Role Interfaces

### A. Presenter (AI Orchestrator View)
- UEB Real-Time Stream (full event log)
- Commander Chat with S.C.L.I.D M2.5
- Memory Bank artifact display
- Agent Pipeline Status badges (idle/processing/complete)
- Frame navigation (Next/Prev)

### B. Strategic Commander (EOC)
- 2D SVG Heatmap of Krypton City with labeled locations
- Commander Chat (same as Presenter)
- Mini UEB log
- Deployment Authorization panel (Human-in-the-Loop)

### C. Field Responder (Dark Mode)
- CRT-style terminal with scanline effects
- AX.25 Packet Radio stream
- AI Directives panel (receives chat broadcasts)
- AR Compass navigation with rescue routing
- SOS decode at Frame 6

### D. Logistics Manager
- A* Route Graph with labeled nodes
- Supply inventory with progress bars + sandbag depletion
- AI Directives from chat broadcasts
- Route analytics (time saved, distance, risk score)

## 6. Coding Standards
- **Strict Typing:** `unknown` over `any` for data payloads.
- **Immutability:** Memory artifacts frozen on store.
- **Logging:** Every agent transition logged to UEB.
- **Fallback Safety:** All LLM calls gracefully degrade to heuristics.

## 7. Build & Test Commands
```bash
npm run build         # tsc
npm run start         # tsc && node dist/server.js
npm test              # jest (44 tests)
npm run test:browser  # playwright
```

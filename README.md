# 🛡️ S.C.L.I.D AI — Disaster Copilot

**Swarm Co-Pilot for Logistics and Intelligent Dispatch**

S.C.L.I.D AI is a multi-agent AI orchestration framework for augmented resilience in disaster management. Inspired by the "Disaster Copilot" vision (arXiv:2510.16034v2), it uses agentic AI to unify fragmented data streams and automate complex coordination during high-pressure crises — powered by the **MiniMax M2.5** frontier model.

---

## 🧠 Core Architecture

```
                    ┌─────────────────────────────┐
                    │   MiniMax M2.5 Orchestrator  │
                    │   (LangGraph-style server)   │
                    └──────────┬──────────────────┘
                               │ decides action
               ┌───────────────┼───────────────┐
               ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────────┐ ┌──────────────────┐
    │ Early Warning │ │   Situational    │ │    Resource      │
    │    Agent      │ │   Awareness      │ │   Allocation     │
    │  (sensors)    │ │  (multi-modal)   │ │  (A* routing)    │
    └──────┬───────┘ └────────┬─────────┘ └────────┬─────────┘
           │                  │                     │
           └──────────────────┴─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │  Unified Event Bus │
                    │   (Pub/Sub)        │
                    └─────────┬─────────┘
                              │
                    ┌─────────▼─────────┐
                    │  3-Tier Memory    │
                    │  Bank (Vector)    │
                    └───────────────────┘
```

- **MLLM Orchestrator**: MiniMax M2.5 evaluates each scenario frame, decides which UEB topic to emit, and triggers the correct agent cascade.
- **Unified Event Bus (UEB)**: True `EventEmitter` Pub/Sub. Agents subscribe to topics (`hazard.detected`, `situational.fusion.completed`, `resource.plan.generated`) and act asynchronously.
- **3-Tier Memory Bank**: Vectorized storage with cosine similarity search.
  - *Current*: Active session artifacts
  - *Short-Term*: Anomaly logs and situational data
  - *Long-Term*: Historical plans for RAG Guardrails
- **HAM Radio Bridge**: Offline transport (APRS, Voice, Packet AX.25) for "Dark Mode" resilience.

---

## 🤖 Specialized Agents

| Agent | Function | Key Output |
|-------|----------|------------|
| **Early Warning** | Sensor/weather data → hazard prediction | Severity score, confidence, affected area |
| **Situational Awareness** | Multi-modal fusion (drone, social, HAM) | Unified Operating Picture, risk level |
| **Resource Allocation** | A* pathfinding, supply optimization | Deployment plan, personnel, route |

---

## 🖥️ Multi-Page Dashboard

The system provides **role-specific views**, all synchronized via WebSocket:

| Page | Role | Key Feature |
|------|------|-------------|
| `ai-view.html` | **Presenter** | UEB Log, Chat, Memory Bank, Agent Status |
| `eoc.html` | **EOC Commander** | Risk Heatmap, Commander Chat, Authorization |
| `field.html` | **Field Marshall** | Dark Mode Terminal, HAM Radio, AR Compass |
| `logistics.html` | **Logistics** | A* Route Graph, Supply Inventory, Optimizer |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- `MINIMAX_API_KEY` environment variable (optional — heuristic fallback available)

### Setup
```bash
git clone <repo-url>
cd NEXORA-SCLID-AI
npm install

# Set your API key (optional)
echo "MINIMAX_API_KEY=your_key_here" > .env

# Build and start the orchestrator
npm run start
```

### Run the Demo
```bash
# Single command — starts BOTH WebSocket + HTTP servers on port 8080:
npm run start

# Open in browser:
# http://localhost:8080              → Landing page
# http://localhost:8080/ai-view.html → Presenter view (controls the story)
```

### 📱 Mobile Access (HAM Radio Demo)
The server auto-detects your LAN IP and prints it on startup. Connect your phone to the **same Wi-Fi** and open:
```
http://<YOUR-LAN-IP>:8080/field.html
```
Your phone becomes the **Field Marshall's device** — CRT terminal, HAM radio, AR compass — all synced live with the presenter's laptop. When you advance frames on the laptop, the phone updates in real-time.

### Run Tests
```bash
npm test                 # 44 Jest unit/integration tests
npm run test:browser     # Playwright E2E tests
```

---

## 📋 Success Criteria (Verified)

- **SC-1**: TaskPlanner decomposes "Flood Response" into a 3-step dependency graph ✅
- **SC-2**: ResourceAllocationAgent produces a supply plan from situational geodata ✅
- **SC-3**: Memory persists across agent transitions (tier promotion) ✅
- **SC-4**: All agent I/O follows registered schema ✅
- **SC-5**: A* pathfinding calculates optimal route when obstacle introduced ✅
- **SC-6**: Commander Chat triggers full agent pipeline cascade ✅

---

## 🗂️ Project Structure

```
src/
├── server.ts                  # WebSocket orchestrator (LangGraph-style)
├── index.ts                   # NexoraPipeline — main entry point
├── llm/
│   └── MinimaxClient.ts       # MiniMax M2.5 integration + context-aware chat
├── orchestrator/
│   ├── TaskPlanner.ts         # Query → TaskGraph decomposition
│   ├── AgentRegistry.ts       # Agent skill discovery
│   └── UnifiedEventBus.ts     # Pub/Sub event system
├── memory/
│   ├── MemoryBank.ts          # 3-tier storage (current/short/long)
│   └── VectorStore.ts         # Cosine similarity search
├── agents/
│   ├── BaseAgent.ts           # Abstract base with vector embedding
│   ├── EarlyWarningAgent.ts   # Hazard prediction
│   ├── SituationalAwarenessAgent.ts  # Multi-modal fusion
│   └── ResourceAllocationAgent.ts    # A* optimization + RAG validation
├── ham/
│   ├── HAMBridgeService.ts    # APRS parsing + voice transcription
│   ├── PacketRadioHandler.ts  # AX.25 encode/decode
│   └── VoiceSynthesizer.ts    # TTS broadcast
└── types/
    ├── index.ts               # Core interfaces
    └── errors.ts              # Custom error classes

web/
├── index.html                 # S.C.L.I.D landing page
├── ai-view.html               # Presenter — UEB + Chat + Memory Bank
├── eoc.html                   # EOC Commander — Map + Chat + Auth
├── field.html                 # Field — Dark Mode + HAM + Compass
├── logistics.html             # Logistics — Route Graph + Inventory
├── story.js                   # 7-frame City of Krypton narrative
├── story-client.js            # WebSocket client library
└── styles.css                 # Shared design system
```

---

## 📡 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, TypeScript, WebSocket (`ws`) |
| AI Brain | MiniMax M2.5 (via OpenAI-compatible API) |
| Optimization | A* Pathfinding (pure TypeScript) |
| Frontend | Vanilla JS, Tailwind CSS, SVG |
| Offline | HAM Radio Bridge (APRS, AX.25, Voice) |
| Tests | Jest (44 unit/integration) + Playwright (E2E) |

---

## 🔮 Roadmap

- **On-Device SLM**: Edge deployment with quantized models for true offline autonomy
- **Misinformation Filter**: NLP agent to parse genuine distress from HAM noise
- **Reinforcement Learning**: Dynamic evacuation route recalculation from live obstacle data
- **Multi-City Federations**: Cross-jurisdiction agent coordination

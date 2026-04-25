# Specification: S.C.L.I.D AI Core Pipeline

## Architect's Vision
S.C.L.I.D (**Swarm Co-Pilot for Logistics and Intelligent Dispatch**) uses a **Central Orchestrator (MiniMax M2.5)** to manage a federated network of three domain-specific agents. The architecture prioritizes **Context Preservation** via a tiered Memory Bank, **Safety** via RAG-anchored protocol validation, and **Autonomy** via offline HAM Radio Bridge operation.

### Core Components
1. **Task Planner (Orchestrator):** Decomposes human queries into a dependency graph of sub-agent calls.
2. **Sub-Agent Skill Registry:** Standardized I/O schemas for Early Warning, Situational Awareness, and Resource Allocation.
3. **Memory Bank:** 3-tier vectorized storage (Current → Short-term → Long-term Archive).
4. **Commander Chat:** Natural language interface that can trigger the full agent pipeline.
5. **HAM Radio Bridge:** Offline transport for "Dark Mode" operations.

## Data Models & API Signatures

### Agent Registration Schema
```json
{
  "agent_id": "string",
  "domain": "early_warning | situational_awareness | resource_allocation",
  "inputs": ["list of modality types"],
  "outputs": ["schema_ref"],
  "constraints": "string"
}
```

### Memory Artifact
```json
{
  "id": "uuid",
  "timestamp": "iso8601",
  "source": "agent_domain",
  "data": "object",
  "tags": ["array"],
  "vector": "[number[]]"
}
```

### WebSocket Protocol
```json
// Client → Server
{ "type": "ADVANCE" }
{ "type": "PREV" }
{ "type": "CHAT_MESSAGE", "text": "Deploy flood response" }

// Server → Client
{ "type": "STATE_UPDATE", "state": { "frameIndex": 0, "ui_state": { ... } } }
{ "type": "CHAT_LOADING" }
{ "type": "CHAT_RESPONSE", "response": "CONFIRMED. Initiating cascade..." }
```

## Implementation Strategy
1. **Orchestration Foundation:** TaskPlanner + AgentRegistry + UnifiedEventBus.
2. **Memory Infrastructure:** 3-tier storage with vector similarity search.
3. **Agent Pipeline:** EarlyWarning → SituationalAwareness → ResourceAllocation cascade.
4. **LLM Integration:** MiniMax M2.5 for `decideAction` (scenario evaluation) and `chatWithContext` (commander interaction).
5. **Chat → Pipeline Trigger:** Deployment keywords activate `runAgentCascade()` with real-time status broadcasting.
6. **Multi-Page Sync:** WebSocket broadcasts state to all connected dashboards.

## Constraints & Edge Cases
- **Connectivity:** System supports full offline "Dark Mode" via HAM Radio Bridge.
- **Hallucination:** All Resource Allocation outputs validated against RAG knowledge base.
- **Latency:** Task decomposition < 2 seconds. Chat response displayed with loading indicator.
- **Fallback:** All LLM calls gracefully degrade to deterministic heuristics when API key unavailable.

## Success Criteria
- **SC-1:** Orchestrator decomposes "Flood Response" query into a 3-step dependency graph.
- **SC-2:** ResourceAllocationAgent produces supply plan from SituationalAwareness geodata.
- **SC-3:** Memory persists across agent transitions, allowing Resource agent to "remember" Early Warning signals.
- **SC-4:** All agent I/O follows the registered schema without data loss.
- **SC-5:** ResourceAllocationAgent implements A* pathfinding for optimal route when obstacle introduced.
- **SC-6:** Commander Chat triggers the full 3-agent pipeline cascade with real-time status updates across all dashboards.

## User Interfaces (The Data Story)
The demo is a multi-page web application synchronized via WebSocket. Each page represents a distinct role:
- **`/ai-view.html`**: Presenter's "Glass Box" — UEB Log, Commander Chat, Memory Bank, Agent Pipeline.
- **`/eoc.html`**: Commander's Macro View — Risk Heatmap, Chat, Authorization Panel.
- **`/field.html`**: Field Marshall's "Dark Mode" — HAM Terminal, AI Directives, AR Compass.
- **`/logistics.html`**: Logistics Command — A* Route Graph, Supply Inventory, Optimizer.

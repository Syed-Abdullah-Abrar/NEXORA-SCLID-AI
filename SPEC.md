# Specification: NEXORA-SCLID-AI Core Pipeline

## Architect's Vision
The system uses a **Central Orchestrator (MLLM)** to manage a federated network of three domain-specific agents. The architecture prioritizes **Context Preservation** via a tiered Memory Bank and **Safety** via RAG-anchored protocol validation.

### Core Components
1.  **Task Planner (Orchestrator):** Decomposes human queries into a dependency graph of sub-agent calls.
2.  **Sub-Agent Skill Registry:** A standardized interface (I/O schemas) for Early Warning, Situational Awareness, and Resource Allocation agents.
3.  **Memory Bank:** A 3-tier storage system (Current Context, Short-term Summary, Long-term Archive).

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
  "source_agent": "string",
  "data": "object",
  "confidence": "float"
}
```

## Implementation Strategy
1.  **Orchestration Foundation:** Build the Task Planner and Skill Registry logic.
2.  **Memory Infrastructure:** Implement the 3-tier vectorized storage system.
3.  **Agent Slicing:**
    - `EarlyWarningAgent`: Implement weather/sensor data ingestion.
    - `SituationalAwarenessAgent`: Implement multi-modal fusion (text/image) logic.
    - `ResourceAllocationAgent`: Implement optimization logic based on inputs from the previous two agents.

## Constraints & Edge Cases
- **Connectivity:** The system must support local state caching for edge deployment (Dark Mode).
- **Hallucination:** All Resource Allocation outputs must be verified against the RAG knowledge base.
- **Latency:** Task decomposition must complete within < 2 seconds for high-pressure scenarios.

## Success Criteria
- **SC-1:** The Orchestrator can successfully decompose a "Flood Response" query into a 3-step dependency graph.
- **SC-2:** The `ResourceAllocationAgent` produces a supply plan based on `SituationalAwareness` geodata.
- **SC-3:** Memory persists across agent transitions, allowing the Resource agent to "remember" Early Warning signals.
- **SC-4:** All agent I/O follows the registered schema without data loss.
- **SC-5:** The `ResourceAllocationAgent` correctly implements a pathfinding algorithm (e.g., A*) to calculate an optimal route when an obstacle is introduced.

## User Interfaces (The Data Story)
The demo is a multi-page web application, with each page representing a distinct user role. State is synchronized across all pages via a WebSocket server and driven by the `web/story.js` narrative file.
- **/ai-view.html**: The presenter's "Glass Box" view, showing the UEB Log and Memory Bank.
- **/eoc.html**: The Commander's 2D SVG-based map with risk heatmaps.
- **/field.html**: The frontliner's "Dark Mode" HAM radio and AR route terminal.
- **/logistics.html**: The organization's supply chain and inventory dashboard.

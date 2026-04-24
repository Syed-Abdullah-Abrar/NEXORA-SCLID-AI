# NEXORA-SCLID-AI: Disaster Copilot

NEXORA-SCLID-AI is a multi-agent orchestration framework designed for augmented resilience in disaster management. Inspired by the "Disaster Copilot" vision (arXiv:2510.16034v2), it leverages agentic AI to unify fragmented data streams and automate complex coordination during high-pressure crises.

## Core Architecture
- **MLLM Orchestrator**: A central Task Planner that decomposes objectives into actionable sub-tasks (`TaskGraph`). Currently utilizing a decoupled adapter pattern for local SLM integration.
- **Unified Event Bus (UEB)**: A true `EventEmitter`-based Publish/Subscribe protocol (pending refactor). Agents subscribe to topics (e.g., `hazard.detected`) and act asynchronously, ensuring the system remains highly decoupled and resilient to node failures.
- **3-Tier Memory Bank**: Vectorized storage system. 
  - *Current*: Active session memory.
  - *Short-Term*: Recent events and anomaly logs.
  - *Long-Term*: Historical semantic retrieval used by RAG Guardrails.
- **HAM Radio Bridge**: Dedicated offline transport (APRS, Voice, Packet AX.25) ensuring absolute operational resilience in disconnected, "Dark Mode" environments.

## Specialized Pipeline
1. **Early Warning Agent**: Predicts hazards via sensor and weather data.
2. **Situational Awareness Agent**: Fuses multi-modal data for a common operating picture.
3. **Resource Allocation Agent**: Optimizes supply and personnel deployment. Validates all generated plans against the Long-Term memory vector store using **RAG Guardrails** for safety compliance.

## Operational Modes
- **Command Mode**: High-bandwidth coordination for EOC commanders.
- **Dark Mode**: Quantized, offline orchestration for field responders using the HAM Radio Bridge for decentralized intelligence.

## Omni-View Hackathon Demo (3D Digital Twin)
A synchronized, responsive 3D WebGL visualization of the disaster response pipeline. Designed to provide tailored visual intelligence to all layers of the disaster relief body without heavy API dependencies:
1. **EOC Command Dashboard (Macro)** - Top-down 3D city view with time-travel slider and predictive risk heatmap overlays.
2. **Siloed Organizations (Tactical)** - Split-screen logistics/medical command demonstrating real-time UEB data syncing.
3. **Dark Mode Rescue (Street-Level AR)** - Mobile interface showing a street-level perspective with AR-style safe route projections and a functioning HAM radio terminal.

```bash
cd web && python3 -m http.server 8080
# Open http://localhost:8080
```

## Upcoming Roadmap (Tomorrow's Sprint)
- **Decentralized Edge Deployment:** Moving the core orchestrator to an on-device Small Language Model (SLM) for true offline autonomy.
- **Misinformation Control Agent:** Implementing an NLP filter to parse genuine HAM distress calls from anomalous noise.
- **Reinforcement Learning Evacuation:** Dynamic, real-time recalculation of safe routes based on live `HAMBridge` obstacle reports.


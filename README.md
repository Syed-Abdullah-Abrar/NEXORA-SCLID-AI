# NEXORA-SCLID-AI: Disaster Copilot

NEXORA-SCLID-AI is a multi-agent orchestration framework designed for augmented resilience in disaster management. Inspired by the "Disaster Copilot" vision (arXiv:2510.16034v2), it leverages agentic AI to unify fragmented data streams and automate complex coordination during high-pressure crises.

## Core Architecture
- **MLLM Orchestrator**: A central Task Planner that decomposes objectives into actionable sub-tasks.
- **Unified Event Bus (UEB)**: Asynchronous communication protocol for decoupled, resilient agent interactions.
- **3-Tier Memory Bank**: Vectorized storage for maintaining context across the disaster lifecycle.
- **HAM Radio Bridge**: Dedicated offline transport (APRS, Voice, Packet AX.25) for absolute operational resilience in disconnected environments.

## Specialized Pipeline
1. **Early Warning Agent**: Predicts hazards via sensor and weather data.
2. **Situational Awareness Agent**: Fuses multi-modal data for a common operating picture.
3. **Resource Allocation Agent**: Optimizes supply and personnel deployment with RAG-anchored safety.

## Operational Modes
- **Command Mode**: High-bandwidth coordination for EOC commanders.
- **Dark Mode**: Quantized, offline orchestration for field responders using the HAM Radio Bridge for decentralized intelligence.
- **Web Demo**: A browser-based interface visualizing the orchestration pipeline in real-time (`web/index.html`).

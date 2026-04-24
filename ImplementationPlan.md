# Implementation Plan: NEXORA-SCLID-AI (Disaster Copilot)

## Overview
Build a three-agent disaster management pipeline (Early Warning -> Situational Awareness -> Resource Allocation) coordinated by an MLLM Orchestrator and supported by a tiered Memory Bank.

## Architecture Decisions
- **Vertical Slicing:** Each agent will be built with its corresponding registration and memory integration.
- **JSON Schema Contracts:** Standardized I/O to ensure interoperability between disparate sub-agents.
- **Stateless Orchestration:** The Orchestrator relies on the Memory Bank for state, allowing for session recovery.

## Task List

### Phase 1: Foundation (Orchestration & Memory)
- [ ] **Task 1: Orchestrator & Skill Registry**
    - Implement the `TaskPlanner` class and the `AgentRegistry` for sub-agent discovery.
    - *Verification:* SC-1 (Graph decomposition) passes.
- [ ] **Task 2: Tiered Memory Bank**
    - Implement Current, Short-term, and Long-term storage layers.
    - *Verification:* Data persists and is retrievable via unique IDs.

### Checkpoint: Foundation
- [ ] Orchestrator can register dummy agents.
- [ ] Memory bank can store and retrieve multi-modal artifacts.

### Phase 2: Core Agents
- [ ] **Task 3: Early Warning Agent**
    - Build ingestion logic for sensor/weather data.
    - *Verification:* Correct hazard prediction for sample data sets.
- [ ] **Task 4: Situational Awareness Agent**
    - Build multi-modal fusion logic (integrating geodata and text).
    - *Verification:* Produces a unified situational artifact in the Memory Bank.
- [ ] **Task 5: Resource Allocation Agent**
    - Build optimization logic for supply/personnel routing.
    - *Verification:* SC-2 passes (produces valid plan based on Situational data).

### Checkpoint: Core Features
- [ ] Each agent functions in isolation.
- [ ] Agents can read from and write to the Memory Bank correctly.

### Phase 3: Integration & Validation
- [ ] **Task 6: End-to-End Pipeline Integration**
    - Connect the three agents via the Task Planner.
    - *Verification:* Data flows from Warning -> Awareness -> Allocation.
- [ ] **Task 7: RAG Guardrails & Traceability**
    - Implement the protocol validation layer using the RAG sub-agent.
    - *Verification:* All allocation plans are traceable back to specific success criteria (SC-X).

### Checkpoint: Complete
- [ ] All SC-1 through SC-4 are met.
- [ ] Adversarial testing by the Auditor (CLAUDE) passes.

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Multi-modal fusion latency | High | Implement asynchronous ingestion and caching. |
| MLLM Hallucination in Planning | Medium | Use strictly defined JSON schemas and validation loops. |
| Edge Connectivity Failure | High | Implement on-device SLM fallback for local orchestration. |

## Open Questions
- Which specific MLLM will serve as the primary Orchestrator?
- What are the primary data formats for the "Drone/Social Media" feeds in Situational Awareness?

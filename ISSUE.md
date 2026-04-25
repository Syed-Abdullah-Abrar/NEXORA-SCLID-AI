# Issue Description: Implementation of NEXORA-SCLID-AI (Disaster Copilot)

## Context
Traditional disaster response is fragmented across siloed data streams and manual coordination. The "Disaster Copilot" paper (arXiv:2510.16034v2) proposes a multi-agent AI system to unify these streams through a central orchestrator. This project, NEXORA-SCLID-AI, implements a specialized version of this vision focusing on the core pipeline from prediction to resource deployment.

## Problem Statement / Feature Request
Implement the core agentic framework for disaster management. The system must coordinate three specialized agents through a central MLLM (Multi-modality Large Language Model) Orchestrator:
1.  **Early Warning Agent:** Predicts hazards (e.g., floods, wildfires) from sensor and weather data.
2.  **Situational Awareness Agent:** Fuses multi-modal data (social media, drone feeds) to create a live operational picture.
3.  **Resource Allocation Agent:** Optimizes the distribution of personnel and supplies based on the findings of the previous agents.

## Desired Outcome
A cinematic, multi-page web application that tells a cohesive "Data Story" for the hackathon pitch. The final deliverable must include:
- A pre-scripted, frame-by-frame narrative demonstrating the full agentic workflow.
- Four distinct, interconnected UI pages for the AI Orchestrator, EOC, Field Ops, and Logistics.
- A `ResourceAllocationAgent` that uses a pathfinding algorithm (e.g., A*) to calculate and visualize an optimal supply route.
- A flawless, responsive, and professional user experience.

## Implementation Status
**REOPENED** - The Engineer successfully implemented RAG validation, HAM Bridge error handling, and the TaskPlanner Adapter. However, the UEB (Unified Event Bus) hardening failed the architectural audit. The pipeline is still tightly coupled with sequential method calls. Awaiting refactor to a true `EventEmitter` publish/subscribe pattern.

---

## Final Sprint Roadmap (Tomorrow)

This is the final checklist to win the hackathon.

### 1. Finalize the "Data Story"
- **Engineer:** Implement the cinematic, frame-by-frame narrative using the `web/story.js` file.
- **Architect:** Review the final UI to ensure it is flawless, responsive, and perfectly timed with the `PITCH.md` script.

### 2. Complete the End-to-End Integration
- **Engineer:** Implement the A* pathfinding algorithm in the `ResourceAllocationAgent`. Ensure the WebSocket server perfectly syncs all four UI pages.
- **Architect:** Run a final, aggressive `ce-code-review` to validate that the UEB is fully decoupled and all 59+ tests are green.

### 3. Pitch & Demo Prep
- **Presenter (You):** Rehearse the script in `PITCH.md` while clicking through the `ai-view.html` "Next ->" button.
- **Architect:** Time the demo and provide feedback to ensure it lands under 5 minutes with maximum impact.

### 4. Code Freeze & Final Push
- **Architect:** Once all tests pass and the demo is approved, perform the final `git add`, `commit`, and `push`.
- **The project will be declared "Code Frozen."** No further changes will be made before the presentation.

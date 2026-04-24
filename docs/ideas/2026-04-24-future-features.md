# Tomorrow's Vision: Scaling NEXORA-SCLID-AI

## Problem Statement
How might we take the foundational Disaster Copilot and turn it into a production-ready, continuously learning ecosystem that handles both real-world deployment challenges and edge-case intelligence gaps?

## Recommended Direction
**The "Self-Healing Edge" (Continuous Learning + True Autonomy).**
We need to move past a pre-scripted workflow and introduce true autonomy. The focus for tomorrow's sprint will be:
1.  **Decentralized Edge Deployment (SLM Orchestration):** Migrating the core `TaskPlanner` logic to operate entirely on an on-device Small Language Model (SLM) for frontliners, severing the cloud dependency completely.
2.  **The Misinformation Control Agent:** Implementing a 4th core agent that sits between the `SituationalAwarenessAgent` and the `UEB`, acting as a filter for false distress calls and social media rumors.
3.  **Reinforcement Learning for Evacuation:** Replacing the static `ResourceAllocationAgent` pathfinding with a dynamic reinforcement learning model that recalculates evacuation routes instantly when unexpected obstacles (like bridge collapses) are reported via HAM radio.

## Key Assumptions to Validate
- [ ] **SLM Performance:** Can an SLM (like Llama 3 8B or Phi-3) accurately decompose natural language queries into the exact `TaskGraph` JSON schema without hallucinating?
- [ ] **Misinformation Filters:** Can we train a lightweight NLP classifier that reliably distinguishes between a genuine HAM radio distress call and a simulated or erroneous noise burst?
- [ ] **RL Training Feasibility:** Do we have enough simulated data to train a basic RL agent for route optimization in a single hackathon day?

## MVP Scope (Tomorrow)
- Implement `SLMPlannerAdapter` using a local API (e.g., Ollama or a quantized model).
- Create `MisinformationAgent.ts` with basic heuristic and keyword-based filtering.
- Develop a mock RL interface in `ResourceAllocationAgent` that weights routes based on a dynamic "danger" score.

## Not Doing (and Why)
- **Training a custom foundational model:** Takes too long. We will use off-the-shelf quantized models.
- **Integrating real social media feeds (X/Twitter APIs):** Costly and ratelimited. We will continue simulating the data ingest through the `HAMBridge`.

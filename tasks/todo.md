# HAM Radio Integration + Dark Mode - Task List

## Priority: User-requested HAM integration

---

## HAM Bridge Tasks

### HAM-1: HAM Bridge Core Service
**Acceptance Criteria:**
- [ ] `HAMBridgeService` class in `src/ham/HAMBridgeService.ts`
- [ ] `EventSerializer` converts HAM input to `DisasterEvent`
- [ ] APRS packet parser (callsign, lat/lon, message)
- [ ] Unit tests: APRS parse, event serialization
**Verification:** `npm test` passes, `npm run build` succeeds

### HAM-2: Outbound Transmission
**Acceptance Criteria:**
- [ ] `VoiceSynthesizer` for TTS broadcast (Web Speech API mock)
- [ ] `PacketRadioHandler` for AX.25 encode/decode
- [ ] Resource allocation plan routes to HAM output
- [ ] Unit tests for packet encoding
**Verification:** `npm test` passes

### HAM-3: Web UI HAM Integration
**Acceptance Criteria:**
- [ ] HAM message log panel in `web/index.html`
- [ ] Real-time event bus visualization
- [ ] Simulate send/receive HAM messages
**Verification:** Manual browser test

---

## Original Phase Tasks (from ImplementationPlan.md)

### Task 2: Tiered Memory Bank
**Acceptance Criteria:**
- [ ] `MemoryBank` class with current/shortTerm/longTerm tiers
- [ ] `VectorStore` interface for semantic retrieval
- [ ] `store(artifact, tier)` and `query(vector, limit)` methods
- [ ] Unit tests: store, retrieve, tier transitions
**Verification:** SC-3 (Memory persists across agent transitions)

### Task 3: Early Warning Agent
**Acceptance Criteria:**
- [ ] `EarlyWarningAgent` extends `BaseAgent`
- [ ] Weather/sensor data ingestion
- [ ] Hazard prediction output to Memory Bank
- [ ] Unit tests for hazard detection
**Verification:** SC-1 (part of flood response graph)

### Task 4: Situational Awareness Agent
**Acceptance Criteria:**
- [ ] `SituationalAwarenessAgent` extends `BaseAgent`
- [ ] Multi-modal fusion (text, geodata)
- [ ] Produces unified situational artifact
- [ ] Unit tests for fusion logic
**Verification:** SC-2, SC-3

### Task 5: Resource Allocation Agent
**Acceptance Criteria:**
- [ ] `ResourceAllocationAgent` extends `BaseAgent`
- [ ] Optimization logic for supply/personnel routing
- [ ] Routes output to HAM Bridge (broadcast capability)
- [ ] Unit tests for allocation
**Verification:** SC-2 (supply plan from situational data)

---

## Phase Checkpoints

| Checkpoint | Criteria | Blocks |
|------------|----------|--------|
| A: HAM Core | HAMBridgeService writes to UEB | HAM-2 |
| B: Memory | Memory Bank stores/retrieves artifacts | Tasks 3,4,5 |
| C: All Agents | Agents read/write Memory Bank | Task 6 |
| D: Integration | Full pipeline + Web UI + HAM | Task 7 |

---

## Task Order (Updated)

```
1. [HAM-1] HAM Bridge Core ← START (user priority)
2. [Task 2] Memory Bank
3. [Task 3] Early Warning Agent
4. [Task 4] Situational Awareness Agent
5. [Task 5] Resource Allocation Agent
6. [HAM-2] Outbound HAM Transmission
7. [Task 6] End-to-End Pipeline
8. [HAM-3] Web UI HAM Integration
9. [Task 7] RAG Guardrails
```

---

## Verification Strategy

- **SC-1:** Flood Response query → 3-step graph ✓ (done)
- **SC-2:** Resource agent produces supply plan from situational geodata
- **SC-3:** Memory persists across agent transitions
- **SC-4:** All agent I/O follows registered schema
- **HAM:** HAM Bridge converts radio → DisasterEvent → UEB
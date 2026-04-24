# Multi-Agent Communication Protocols (PROMPTS)

This file defines the standardized handoff templates for the NEXORA-SCLID-AI orchestration loop. Use these templates to ensure context continuity and role separation.

---

## 1. Planner to Engineer (The Directive)
**Usage:** When the Architect (GEMINI) issues a task to the Engineer (ClaudeCode).

```markdown
### DIRECTIVE: [Task Name]
- **Reference Spec:** [SC-ID]
- **Technical Context:** [TECHNICAL_SPEC.md Section]
- **Task Description:** [Detailed logic and requirements]
- **Success Criteria:**
    1. [Specific, testable condition]
- **Files to Modify:** [List of paths]
- **Constraint Check:** [Verify against SOUL.md]
```

---

## 2. Engineer to Auditor (The Submission)
**Usage:** When the Engineer (ClaudeCode) completes a task and requests an audit.

```markdown
### SUBMISSION: [Task Name]
- **Status:** [Ready for Audit]
- **Checkpoint:** [CHECKPOINT.md Link]
- **Key Changes:** [Summary of implementation]
- **Self-Verification:**
    - [ ] Unit tests pass
    - [ ] Build succeeds
- **Audit Focus:** [Direct Auditor to specific edge cases or complex logic]
```

---

## 3. Auditor to Planner/Engineer (The Verdict)
**Usage:** When the Auditor (CLAUDE/GEMINI) completes the review.

```markdown
### VERDICT: [PASS / REJECT]
- **Target SC-ID:** [Reference SPEC.md]
- **Traceability Matrix:** [How it maps to success criteria]
- **Audit Findings:**
    - [Critical / Major / Minor issues]
- **Feedback Loop:**
    - **To Engineer:** [Specific code fixes needed]
    - **To Architect:** [Architectural flaws identified in SPEC.md]
```

---

## 4. Build & Test Cycle (TDD Workflow)
**Usage:** When Engineer (ClaudeCode) implements a task via incremental-implementation + test-driven-development.

```markdown
### BUILD CYCLE: [Task Name]
1. **Read** task acceptance criteria and relevant context
2. **Write failing test** for expected behavior (RED)
3. **Implement minimum code** to pass test (GREEN)
4. **Run test suite** - verify no regressions
5. **Run build** - verify compilation
6. **Commit** with descriptive message
7. **Update CHECKPOINT.md** - mark task complete
8. **Repeat** for next task
```

---

## 5. Web Interface Work Directive
**Usage:** When Architect issues web interface demo task to Engineer.

```markdown
### DIRECTIVE: Web Interface Demo
- **Reference Spec:** SC-1 (Task decomposition visualization)
- **Technical Context:** TECHNICAL_SPEC.md Section 5 (User Role Interfaces)
- **Task Description:** Build demo UI to visualize the 3-agent pipeline
- **Success Criteria:**
    1. Interactive query input (Flood Response triggers graph)
    2. Visual display of task dependency graph
    3. Memory Bank state visualization
    4. Agent response display (Early Warning -> Situational -> Resource)
- **Files to Create:** `web/`
- **Constraint Check:** Lightweight vanilla JS (no framework) per SOUL.md
```

---

## 6. End-of-Session Summary
**Usage:** When Engineer completes work session.

```markdown
### SESSION COMPLETE
- **Tasks Completed:** [List]
- **Tests:** [X passed]
- **Build:** [Success/Failed]
- **Commit:** [SHA]
- **Next Task:** [From ImplementationPlan.md]
- **Web Interface:** [Status if applicable]
```

---

## Complete Implementation Reviewer Guide

### Project Overview
NEXORA-SCLID-AI is a multi-agent disaster management pipeline implementing the architecture from arXiv:2510.16034v2. The system coordinates three specialized agents through an MLLM Orchestrator with a tiered Memory Bank and optional HAM radio communication for dark mode (offline) operations.

### Architecture
```
Human Query -> TaskPlanner -> Unified Event Bus -> MemoryBank
                    |                              |
                    v                              v
            AgentRegistry                    [Early Warning]
            (skills)                         [Situational]
                                             [Resource Allocation]
                                                |
                                                v
                                        HAM Radio Bridge
                                        (APRS + Voice + Packet)
```

### Success Criteria (SPEC.md)
- SC-1: TaskPlanner decomposes "Flood Response" into 3-step dependency graph
- SC-2: ResourceAllocationAgent produces supply plan from situational geodata
- SC-3: Memory persists across agent transitions
- SC-4: All agent I/O follows registered schema

### File Structure
```
src/
├── types/index.ts              # AgentSkill, MemoryArtifact, TaskGraph, DisasterEvent, GeoData
├── orchestrator/
│   ├── TaskPlanner.ts          # generatePlan(query) -> TaskGraph
│   └── AgentRegistry.ts        # register(), getByDomain(), discover()
├── memory/
│   ├── MemoryBank.ts           # store(), get(), promote(), query() - 3 tiers
│   └── VectorStore.ts          # embed(), insert(), search()
├── agents/
│   ├── BaseAgent.ts            # Abstract with vector embedding
│   ├── EarlyWarningAgent.ts    # ingest(weatherData) -> hazard prediction
│   ├── SituationalAwarenessAgent.ts  # fuse(ew, geo), fuseMultiple()
│   └── ResourceAllocationAgent.ts   # allocate(situational), optimizeRoutes()
├── ham/
│   ├── HAMBridgeService.ts     # parseAPRS(), voiceToText(), broadcast()
│   ├── PacketRadioHandler.ts   # encodeAX25(), decodeAX25()
│   └── VoiceSynthesizer.ts     # speak(), broadcastPlan()
├── index.ts                   # NexoraPipeline orchestrator + exports
└── __tests__/
    ├── TaskPlanner.test.ts     # 5 tests
    ├── MemoryBank.test.ts      # 14 tests
    ├── EarlyWarningAgent.test.ts # 5 tests
    ├── SituationalAwarenessAgent.test.ts # 5 tests
    ├── ResourceAllocationAgent.test.ts  # 5 tests
    ├── HAMBridge.test.ts       # 8 tests
    └── integration.test.ts     # 8 tests (all SC verified)

web/
├── index.html                 # Demo UI with task graph visualization
└── demo.js                    # Pipeline simulation + HAM simulation
```

### Key Test Assertions
1. SC-1: `result.tasks.length === 3` and dependency chain verified
2. SC-2: `plan.actions.length > 0` and `plan.personnelRequired > 0`
3. SC-3: `await memoryBank.get(id)` returns stored artifact after promote
4. SC-4: All agents return MemoryArtifact with id, timestamp, source, data, tags

### Test Results
- **Total Tests:** 44 passing
- **Build:** TypeScript compiles clean
- **Commit:** `3e5ebe7`

### HAM Radio Integration
- APRS parsing: `KB1ABC>APRS,qAR,localhost:/4240.20N/07105.60W$message`
- Voice broadcast: Web Speech API (falls back to console.log)
- Packet radio: AX.25 frame encoding with CRC-16

### Running Tests
```bash
npm test          # Run all tests
npm run build     # TypeScript compilation
```

### Web Demo
Open `web/index.html` in browser to see:
- Task graph visualization (3-agent pipeline)
- Real-time Memory Bank display
- Event log with color-coded entries
- Simulated HAM radio input/output

### Verification Checklist
- [ ] TaskPlanner generates 3-task graph for "Flood Response"
- [ ] Each agent produces MemoryArtifact with correct schema
- [ ] MemoryBank.store() and get() work across all 3 tiers
- [ ] HAMBridgeService parses APRS format correctly
- [ ] VoiceSynthesizer speaks (or logs) broadcast messages
- [ ] All 44 tests pass
- [ ] Build compiles without errors
- [ ] Web demo loads and runs pipeline simulation
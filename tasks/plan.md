# HAM Radio Dark Mode Integration Plan

## Context
User requests integration of HAM (amateur radio) radio communication for disaster response in "dark mode" (offline/edge deployment). Original disaster copilot paper (arXiv:2510.16034v2) supports local state caching for edge deployment. User wants HAM radio as the communication backbone for connectivity-challenged environments.

---

## 1. Concept & Vision

**HAM Radio Integration for Disaster Response:**

When infrastructure fails — cell towers down, internet severed, fiber cut — HAM radio becomes the literal last-mile voice for emergency coordination. This project will integrate HAM radio as an optional communication layer for NEXORA-SCLID-AI's dark mode operations.

**Use Cases:**
- Field responder reports hazard via HAM → converted to digital alert
- Resource allocation plan broadcast via HAM voice synthesis
- Situational awareness data exchanged between isolated stations via packet radio

**Constraints:**
- HAM operators are licensed (technician/general/extra class)
- Bandwidth extremely limited (voice: ~2.4kHz, digital packet: ~300 baud)
- Modes: FM voice, FT8, Packet (AX.25), APRS

---

## 2. Architecture: HAM Integration Points

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXORA-SCLID-AI                          │
│  ┌─────────┐    ┌──────────────┐    ┌────────────────────┐ │
│  │ Early   │───▶│  Situational │───▶│ Resource           │ │
│  │ Warning │    │  Awareness   │    │ Allocation         │ │
│  └────┬────┘    └──────┬───────┘    └─────────┬──────────┘ │
│       │                │                      │            │
│       ▼                ▼                      ▼            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Unified Event Bus (UEB)                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                              │                             │
│       ┌──────────────────────┼──────────────────────┐      │
│       ▼                      ▼                      ▼      │
│  ┌─────────┐          ┌───────────┐         ┌──────────┐  │
│  │ Memory  │          │  Web UI   │         │ HAM      │  │
│  │ Bank    │          │ (Demo)    │         │ Bridge   │  │
│  └─────────┘          └───────────┘         └────┬─────┘  │
│                                                  │        │
│                              ┌───────────────────┘        │
│                              ▼                            │
│                       ┌───────────┐                       │
│                       │ HAM Radio │                       │
│                       │ (Hardware)│                       │
│                       └───────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Component Dependency Graph

```
HAM Radio Hardware (external)
    │
    ▼
HAM Bridge Service (new)
    │
    ├──▶ Event Serializer ( HAM → MemoryArtifact )
    ├──▶ Voice Synthesizer ( MemoryArtifact → TTS broadcast )
    └──▶ Packet Radio Handler ( AX.25 frame ↔ DisasterEvent )
            │
            ▼
    ┌────────────────────────────────────────┐
    │        Unified Event Bus (UEB)          │
    └────────────────────────────────────────┘
            │
            ├──▶ Early Warning Agent (input)
            ├──▶ Situational Awareness Agent (input)
            └──▶ Resource Allocation Agent (output)
```

---

## 4. Vertical Slices (Tasks)

### Slice 1: HAM Bridge Core
**Path:** Hardware → Event serialization
- Implement `HAMBridgeService` class
- Handle VHF/UHF FM voice input → text transcription (mock for now)
- Parse APRS packets (callsign, position, message)
- Convert to `DisasterEvent` format

### Slice 2: Outbound HAM Transmission
**Path:** MemoryArtifact → Radio broadcast
- Implement `VoiceSynthesizer` for TTS output
- Implement `PacketRadioHandler` for AX.25 digital transmission
- Route `ResourceAllocationAgent` outputs to HAM broadcast

### Slice 3: Web UI Integration
**Path:** Full pipeline visualization
- Show real-time event bus activity
- Simulate HAM message send/receive
- Display memory bank state with HAM events highlighted

---

## 5. Phases & Checkpoints

### Phase A: HAM Bridge Foundation (Slice 1)
- [ ] HAMBridgeService class with EventSerializer
- [ ] APRS packet parser (callsign, lat/lon, message)
- [ ] Mock transcription (real TTS/HW later)

### Checkpoint: A
- Agent receives HAM-derived event via UEB

### Phase B: Outbound HAM (Slice 2)
- [ ] VoiceSynthesizer (text → mock TTS)
- [ ] PacketRadioHandler (AX.25 encode/decode)
- [ ] Resource output routes to HAM

### Checkpoint: B
- Resource plan broadcasts on HAM "frequency"

### Phase C: Web Demo Integration (Slice 3)
- [ ] Real-time UEB event visualization
- [ ] HAM message log panel
- [ ] Interactive query with HAM simulation

### Checkpoint: C
- End-to-end: Query → Plan → HAM broadcast (simulated)

---

## 6. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Real HAM hardware required | High | Mock all HW; interface only |
| Bandwidth constraints | Medium | Encode events as compact binary; FT8 mode |
| Regulatory (licensing) | Low | SW only; operators provide license |
| Latency over radio | High | Async queue; store-and-forward |

---

## 7. Open Questions

1. **Real TTS/STT?** Use Web Speech API for browser demo, mock for Node
2. **APRS-IS** vs raw AX.25? APRS-IS (internet) for demo; raw AX.25 for field
3. **Integration with existing Memory Bank?** HAM Bridge writes to same MemoryArtifact schema

---

## 8. Next Action

Continue with Task 2 (Memory Bank) as planned, then integrate HAM Bridge as Slice 1 in Phase A.

Or: Pause Phase 1/2 to build HAM Bridge first (depends on user's priority).
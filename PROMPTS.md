# NEXORA-SCLID-AI: Engineering Directives

This file contains the immediate, actionable directives for the Engineer (ClaudeCode) to execute the next sprint. Do not deviate from these instructions.

---

## 1. The Directive: Backend Hardening & 3D Overhaul

**Objective:** Refactor the backend to a true Event-Driven Architecture and overhaul the 3D WebGL frontend into a highly performant, responsive "Neural Multiverse" UI.

**Required Steps:**

1. **UEB (Unified Event Bus) Refactor:** 
   - `index.ts` must be refactored to use the Node.js `EventEmitter` pattern. 
   - Remove the sequential `await` chain (`await this.earlyWarning.ingest()`, etc.). 
   - Agents must subscribe to topics (`hazard.detected`, `situational.fusion.completed`, `resource.plan.generated`) and react asynchronously.
2. **Web UI/UX Overhaul (The Neural Multiverse):**
   - Execute the plan defined in `docs/plans/2026-04-24-001-refactor-3d-omni-view-integration-plan.md`.
   - Remove the outdated timeline slider from the 3D layout.
   - Replace it with discrete **Scenario Triggers** (e.g., "Trigger Flood", "Simulate Bridge Collapse", "HAM Distress Call") that fire events directly to the new `EventEmitter` UEB.
   - Fix all CSS pointer-event issues making the UI irresponsive. The Tailwind HTML overlays must float cleanly over the 3D canvas.
   - The 3D map should be a wireframe/glowing node-graph representing the AI's "Neural Network", not heavy fluid dynamics.

## 2. Skill Execution Guide (For ClaudeCode)

To complete this sprint, utilize the following compound-engineering skills available to you:

- **For the 3D UI/UX Overhaul:** 
  Run `ce-work` and point it to `docs/plans/2026-04-24-001-refactor-3d-omni-view-integration-plan.md`. This will guide you through moving the Three.js canvas into the main `web/index.html` file and fixing the CPU bottlenecks.
- **For Backend Refactoring:** 
  Use standard TDD coding to rewrite `src/index.ts` as a Pub/Sub Event Bus.
- **For Validation (MANDATORY):** 
  Before declaring this task complete, run `npm run test` to ensure the 44 existing tests still pass. Then, run the `ce-code-review` skill (using `mode:autofix` if possible) to self-audit the UEB refactor.

## 3. Reference Files
- `TECHNICAL_SPEC.md` (For the exact `DisasterEvent` message pattern).
- `docs/ideas/2026-04-24-3d-neural-role-interface.md` (For the UX vision of the new Scenario Triggers).
- `REVIEW.md` (For the exact reasons the previous sprint was REJECTED).

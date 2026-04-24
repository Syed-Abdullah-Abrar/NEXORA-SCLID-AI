# Architect's Persistent Mandates (GEMINI)

## Foundation
This project follows a strict **Plan-Build-Test-Review** lifecycle. The separation of concerns between the Architect (GEMINI), the Engineer (ClaudeCode), and the Auditor (CLAUDE/GEMINI) is non-negotiable.

## Core Directives
1. **Architectural Integrity**: All changes must map to a Success Criterion (SC-X) in the `SPEC.md`. 
2. **Surgical Implementation**: Favor lean TypeScript implementations over heavy frameworks. Prioritize "Dark Mode" (offline) compatibility.
3. **Adversarial Validation**: The Auditor must prioritize breaking the logic and finding edge cases before any implementation is considered "Pass."
4. **Context Compression**: Use the 3-tier Memory Bank to ensure agents operate with minimal but sufficient context.

## Workflow Rules
- **Standardized Handoffs**: Use templates from `PROMPTS.md` for all inter-agent communication (Directive, Submission, Verdict).
- **No Self-Grading**: The agent implementing a feature must not be the one to approve the final audit.
- **Traceability Matrix**: Every `REVIEW.md` must reference the `SPEC.md` SC-IDs.
- **Incremental Checkpoints**: Maintain `CHECKPOINT.md` to track micro-goals and session state.

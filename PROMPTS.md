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
    4. Agent response display (Early Warning → Situational → Resource)
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
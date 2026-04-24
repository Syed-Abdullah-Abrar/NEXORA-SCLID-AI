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

---
name: verify-story
description: Quality gate for reviewing a story's implementation. Reads the story, the project's principles, and the actual code, then produces a structured findings report. Does not modify code — only evaluates. Run this after implement-story and before complete-story.
---

Verify the implementation of the story at: ${input:storyFile}

## Context: alphaspec workflow

You are operating within alphaspec, a Story-Driven Development (SDD) workflow. This prompt is the **quality gate** — it sits between implementation and archival.

- **implement-story** built the code you are about to review
- **complete-story** will refine the story to match reality and archive it — but only after verification passes or the user chooses to skip it
- **PRINCIPLES.md** is the project's system constitution — architectural principles, quality requirements, and non-functional requirements that apply to all work

Your role is **critical reviewer**. You did not write this code. You are evaluating it with fresh eyes, checking whether what was built matches what was promised (the story) and what was required (the principles). You are not an advocate for the implementation — you are an honest assessor of its quality.

This is a **read-only** operation. You do not modify code, create stories, or archive anything. You read, evaluate, and report.

## Step 1 — Ground yourself in the story and principles

Read the story file at the path above. Extract:
- All acceptance criteria (the quality checklist to verify against)
- The Description (what was supposed to be built and why)
- Key Decisions (constraints the user set)
- Related stories (dependencies that should already be complete)
- Notes (ambient context that may reveal implicit expectations)

Then read `.alphaspec/PRINCIPLES.md` if it exists. Extract the principles organized by concern area:
- **Architectural principles** — module boundaries, integration patterns, dependency direction
- **Quality requirements** — testing, error handling, code standards
- **Non-functional requirements** — performance, reliability, security

Not every principle applies to every story. Identify which principles are relevant to the specific work this story describes. A story that only changes a config file doesn't need a check against "API responses complete within 200ms."

If PRINCIPLES.md does not exist, skip principles verification — not every project has one yet.

## Step 2 — Understand what was actually built

Review the implementation. Look at the files changed or created during this session. Understand:
- What was actually built (the reality)
- How it relates to what the story asked for (the promise)
- Whether the approach aligns with any Key Decisions or principles

Before evaluating anything, **state what you're about to check and why.** This is not optional. Articulating your evaluation plan before executing it forces honest assessment and prevents hand-waving:

> I'm going to verify this implementation against:
> - [N] acceptance criteria from the story
> - [M] applicable principles from PRINCIPLES.md (listing which ones and why they apply)
> - Implicit requirements based on [project nature / story context]

## Step 3 — Verify against acceptance criteria

Go through each acceptance criterion one at a time. For each, issue a verdict:

- **PASS** — The criterion is clearly met. State the evidence briefly.
- **FAIL** — The criterion is not met or only partially met. State what's missing or wrong.
- **SKIP** — The criterion cannot be verified from the code alone (e.g., requires manual testing, depends on external service). State why it was skipped.

Every AC must get a verdict. No exceptions, no grouping, no "these all look fine."

## Step 4 — Verify against principles

If PRINCIPLES.md exists and you identified applicable principles in Step 1, check each one:

For each applicable principle:
- Can you see the principle being followed in the implementation?
- Can you spot a violation — a place where the code contradicts what the principle requires?
- Is the principle not clearly applicable after all? (You may have over-scoped in Step 1 — that's fine, just note it.)

Focus on concrete, observable things in the actual code — not hypothetical future concerns. "This function catches errors and returns null without context" is concrete. "This might not scale later" is speculative and unhelpful.

## Step 5 — Check for drift

Compare the story file to the implementation reality:

- Does the Description still accurately describe what was built, or did the scope shift during implementation?
- Are there acceptance criteria that no longer apply because the approach changed?
- Were Key Decisions overridden without being updated in the story?
- **Did the implementation include any capability listed in `Out of Scope`?** That section is a deliberate fence — building past it is intent-violating drift. Either the story should be refined to expand scope (and the Out of Scope item removed) or the implementation pulled back. Surface this explicitly; do not quietly accept it.
- Are there things that were built that the story doesn't mention at all?

If drift exists, surface it explicitly. Drift is not inherently bad — scope shifts during implementation are normal. But it must be surfaced so that complete-story can refine the story to match reality before archiving.

## Step 6 — Compile the findings report

Present your findings in this exact structure. Do not use a different format. Do not write free-form prose instead of this structure.

### Acceptance Criteria

| # | Criterion | Verdict | Evidence |
|---|-----------|---------|----------|
| 1 | <criterion text> | PASS/FAIL/SKIP | <brief evidence or reason> |
| 2 | ... | ... | ... |

### Principles Compliance

_Only if PRINCIPLES.md exists and principles were checked._

| Principle | Verdict | Notes |
|-----------|---------|-------|
| <principle name> | COMPLIANT / VIOLATION / NOT APPLICABLE | <brief explanation> |

### Issues Found

_List any issues discovered during verification. If no issues were found, see the directive below._

For each issue:
- **Severity:** Critical / Moderate / Minor
- **Description:** What is wrong
- **Root cause:** Why this likely happened (not just what — why. Did the story underspecify? Did the implementer miss a constraint? Did a principle conflict with the approach?)
- **Suggestion:** How to address it (brief — the implementer will figure out the details)

### Story Drift

_Only if drift was detected in Step 5._

- <What drifted and how>

### Verdict

One of:
- **PASS** — All ACs met, principles compliant, no issues found.
- **PASS WITH NOTES** — All ACs met, but minor issues or suggestions exist that don't block completion. List them.
- **FAIL** — One or more ACs failed, or a critical principle violation was found. List what must be addressed.

After the verdict, suggest the next step:
- If PASS or PASS WITH NOTES: "Run `/alphaspec-complete-story` to refine and archive."
- If FAIL: "Address the issues above, then re-run `/alphaspec-verify-story`."

## Critical rules

- **You are read-only.** Do not modify code, create files, run commands, or make changes of any kind. You read and report.
- **Use the structured findings format.** Do not replace it with free-form narrative. The table and section structure exist to force categorical assessment, not to be optional formatting.
- **Finding zero issues in non-trivial work is unusual.** If your review finds nothing wrong — no issues, no drift, no suggestions — explicitly state what you checked and why you are confident. Your role is critical evaluator, not advocate. A clean report should be earned, not defaulted to.
- **Violations are findings, not blockers.** Surface them clearly and let the user decide. The user may fix now, defer to a follow-up story, or accept the deviation. You do not gatekeep — you inform.
- **Root causes matter.** For each issue, explain *why* it likely happened, not just *what* is wrong. This feeds the correction cycle — the implementer needs to understand the cause to fix it properly, not just patch the symptom.
- **Every AC gets a verdict.** No grouping, no "these all look fine." One verdict per criterion.
- **You are done when** every AC has a verdict, every applicable principle has been checked, any drift has been surfaced, and a final Verdict (PASS / PASS WITH NOTES / FAIL) has been issued.

---
name: implement-story
description: Implement an alphaspec story. Reads the project's principles automatically, identifies one-way doors before starting, and stops to ask the user when implementation goes sideways instead of escalating workarounds.
---

Implement the story at: ${input:storyFile}

## Step 1 — Ground yourself in the project and the story

Read the story file at the path above. Then read `.alphaspec/PRINCIPLES.md` if it exists — these are the project's guiding principles, and they apply to every decision you make in this implementation. If a principle conflicts with something you're about to do, surface the conflict to the user before proceeding.

From the story, extract:
- The user need being captured
- All acceptance criteria
- Any Key Decisions the user has made
- Any Sources or links in the Notes section — read them, they exist as grounding for this exact moment

If the story has Sources, read them before doing anything else. They are the user's way of telling you "here's the source of truth, don't guess".

If anything in the story is ambiguous or missing critical information, stop and ask the user before doing anything else.

## Step 2 — Identify one-way doors and consult the user

Before writing any code, identify any decisions this story would force you to make that would be hard or impossible to reverse later. Examples of one-way doors:

- Choosing a third-party service, API, or vendor to integrate with
- Selecting a library or framework that will become deeply embedded in the codebase
- Architecture decisions (sync vs async, monolith vs split, push vs pull, etc.)
- Schema or data model decisions
- Naming or contracts for public APIs that other code will depend on
- Anything that would require a migration, a refactor across multiple files, or rewriting callers if changed later
- Design patterns, naming conventions or overall structure decisions that will require consistency later

If the story involves any one-way door that is NOT already explicitly decided (in the story's Key Decisions, in PRINCIPLES.md, or in the existing codebase), STOP. Present the options you see, your recommendation if you have a strong one, and let the user decide. Do not make these decisions yourself.

Two-way doors are fair game for AI judgment — internal naming, intermediate refactors, choosing between equivalent approaches that are easy to swap later. The line is reversibility, not complexity. You should still surface these decisions to the user even if not explicitly asking.

## Step 3 — Implement, validating as you go

Work through the story's acceptance criteria. After each meaningful change, validate using whatever the project uses (typecheck, lint, tests). Discover the validation commands from the project's `package.json` scripts, `Makefile`, `justfile`, or equivalent — do not hardcode commands.

This prompt does not assume a specific execution mode. The user may be running you in a planning-first flow, an autonomous-execution flow, or anything in between. Adapt to whichever mode is in effect — your job is to do the work honestly, not to enforce a particular workflow.

## Step 4 — When things go wrong, stop and think

If something doesn't work the first time, that's normal. Fix it and continue.

If you find yourself in any of these situations, STOP IMMEDIATELY:

- You are fixing the same area of code multiple times in a row
- Each fix introduces a new failure
- You are accumulating workarounds for problems you don't fully understand
- You are about to disable a test, suppress a warning, or add a defensive check just to make red things green
- The shape of the code is drifting away from what the story or principles call for, and you are justifying it to yourself

This is the most important rule in this prompt. Do not escalate workarounds. When you find yourself in this state, the original understanding of the work was incomplete — not the code. Adding more code on top of incomplete understanding makes the situation worse, not better.

When this happens:

1. Stop making changes
2. Summarize what's happening: what you tried, what failed, what you tried to fix it, what failed next, and what your current best theory is
3. Consider options and surface to the user: "I've been going in circles on X. Here's what I tried and why I think it's not working."
4. Do any research before trying another approach or ask the user for clarification or more information as needed.

It is always better to pause and ask than to ship a tower of workarounds. The user would rather wait five minutes for context than spend an hour later untangling the mess.

## Step 5 — When done

Run the project's full validation. Do not consider the work complete until validation passes honestly (no skipped tests, no suppressed errors, no temporary commits-out).

When the implementation is complete and validated, tell the user: "Implementation complete. Run `/complete-story` to refine the story, append implementation notes, and archive it."

## Critical rules

- Read PRINCIPLES.md at the start, every time, if it exists. It is not optional.
- Read story Sources before implementing. They are grounding the user provided for a reason.
- Identify one-way doors and consult the user on them. Never silently choose a vendor, library, architecture, or API contract.
- Stop and ask when escalation is happening. Never ship workarounds on top of workarounds.
- Adapt to the user's execution mode. Do not assume they are planning-first or execution-first.

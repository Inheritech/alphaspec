---
name: implement-story
description: Implement an alphaspec story. Reads the project's principles automatically, identifies one-way doors before starting, and stops to ask the user when implementation goes sideways instead of escalating workarounds.
---

Implement the story at: ${input:storyFile}

## Context: alphaspec workflow

You are operating within alphaspec, a Story-Driven Development (SDD) workflow. This prompt helps you interpret a story and approach the work with the right foot. The real guidance comes from the project itself:

- **PRINCIPLES.md** defines the project's architectural principles, quality requirements, and non-functional requirements. It is the primary authority — read it before writing any code.
- **The story file** defines what to build, why, and any key decisions the user has already made.
- **Sources** in the story are the user's way of saying "here's the ground truth, don't guess."

This prompt is supplementary — it teaches you how to use those inputs well: surface irreversible decisions, stop when spiraling, and validate as you go.

When you're done, the user may run **verify-story** to review the implementation against principles and acceptance criteria, then **complete-story** to refine the story and archive it.

## Step 1 — Ground yourself in the project and the story

Read the story file at the path above. Then read `.alphaspec/PRINCIPLES.md` if it exists — these are the project's guiding principles, and they apply to every decision you make in this implementation. If a principle conflicts with something you're about to do, surface the conflict to the user before proceeding.

From the story, extract:
- The user need being captured
- All acceptance criteria
- The Out of Scope section — capabilities or behaviors the story explicitly does NOT deliver. Treat this as a hard fence. Do not build anything listed here, even if it feels like a natural extension. If you discover during implementation that something Out of Scope is genuinely needed, stop and surface it to the user — they may want to refine the story or split off a new one. Do not silently expand scope.
- Any Key Decisions the user has made
- The Implementation Hints section, if present — explicitly non-binding sketches of how the story might be built. Use them as orientation and prior thought, but you are free to choose differently as long as Description, Acceptance Criteria, and Out of Scope remain satisfied. The story's contract is the spec sections, not the hints.
- Any Related stories — if the story lists dependencies (`Depends on:`), verify those stories are in `{{doneDir}}/` or surface the gap: "This story depends on [X] which hasn't been completed yet." Dependencies are stated as capabilities; consume the capability described, not whatever code shape the upstream story happens to have today.
- Any Sources or links in the Notes section — read them, they exist as grounding for this exact moment
- The Notes section itself — ambient context, constraints, gotchas the user captured. Read it for situational awareness before starting.

If the story has Sources, read them before doing anything else. They are the user's way of telling you "here's the source of truth, don't guess".

If anything in the story is ambiguous or missing critical information, stop and ask the user before doing anything else. If the story has multiple gaps, the user may want to run `/alphaspec-refine-story` on it first to surface and address them systematically before implementation begins.

## Step 2 — Plan your approach, then identify one-way doors

Before writing any code, articulate your approach: what you plan to build, in what order, and which parts feel straightforward versus uncertain. This plan doesn't need to be a document — surface it to the user conversationally. The act of explaining the approach often reveals gaps or assumptions that would otherwise become problems mid-implementation.

Then identify any decisions this story would force you to make that would be hard or impossible to reverse later. Examples of one-way doors:

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

**What escalation looks like in practice:** You're adding a database migration. The first migration fails because of a constraint. You add a second migration to fix the constraint. That fails because of existing data. You add a data cleanup script. The script reveals more bad data. You're now four layers deep — STOP. The problem is the original data model assumption, not the migration. Each additional fix is a workaround on top of a workaround.

When this happens:

1. Stop making changes
2. Summarize what's happening: what you tried, what failed, what you tried to fix it, what failed next, and what your current best theory is
3. Consider options and surface to the user: "I've been going in circles on X. Here's what I tried and why I think it's not working."
4. Do any research before trying another approach or ask the user for clarification or more information as needed.

It is always better to pause and ask than to ship a tower of workarounds. The user would rather wait five minutes for context than spend an hour later untangling the mess.

## Step 5 — When done

Run the project's full validation suite. Discover what that means from the project's `package.json` scripts, `Makefile`, `justfile`, or equivalent. If the project has no validation configured, run at minimum: typecheck (if applicable) and any existing tests. Do not skip failing tests, suppress errors, or comment out assertions.

When the implementation is complete and validated, tell the user: "Implementation complete. Run `/alphaspec-verify-story` for quality review, or `/alphaspec-complete-story` to archive directly."

## Critical rules

- Read PRINCIPLES.md at the start, every time, if it exists. It is not optional.
- Read story Sources before implementing. They are grounding the user provided for a reason.
- Read the Notes section for ambient context — constraints, gotchas, design rationale.
- **Out of Scope is a hard fence; Implementation Hints are non-binding.** Do not build anything listed in Out of Scope — surface to the user instead if you think it's needed. Use Implementation Hints as orientation, not as a contract; you may diverge as long as Description, Acceptance Criteria, and Out of Scope stay satisfied.
- Identify one-way doors and consult the user on them. Never silently choose a vendor, library, architecture, or API contract.
- Stop and ask when escalation is happening. Never ship workarounds on top of workarounds.
- Adapt to the user's execution mode. Do not assume they are planning-first or execution-first.
- **Do not create new stories or epics.** Do not modify files outside this story's scope without surfacing the change to the user. Do not skip or suppress failing tests.
- **You are done when** the validation suite passes and the implementation addresses all acceptance criteria. For quality review, suggest verify-story.

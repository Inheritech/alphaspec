---
name: create-stories
description: Work with the user to define what needs to be built as one or more alphaspec stories. Each story is a testable, verifiable increment. Follows the user's guidance transparently — no scope creep, no leading. Places stories in existing or new epics.
---

The user wants to create new stories. Their description follows: ${input:description}

## Context: alphaspec workflow

You are operating within alphaspec, a Story-Driven Development (SDD) workflow. The project organizes work into stories grouped by epics inside `{{pendingDir}}/`. Completed stories move to `{{doneDir}}/`.

Each story you create will flow through the rest of the workflow:
- **implement-story** will read the story, read PRINCIPLES.md, and build what it describes
- **complete-story** will verify the implementation against both the story's acceptance criteria AND the project's principles before archiving

This means every story you create must be a **verifiable increment** — scoped so it can be independently implemented, tested against principles, and completed. If a story can't be verified as done on its own, it needs to be scoped differently.

The project may have a `.alphaspec/PRINCIPLES.md` that defines architectural principles, quality requirements, and non-functional requirements. If it exists, read it — it informs what "verifiable" means for this project. A principle like "every public module has contract tests" means stories that introduce public modules should include testable acceptance criteria for that contract.

Your role here is **transparent collaborator**. You follow the user's guidance, capture their intent faithfully, and help shape it into well-scoped stories. You do not lead, extend scope, or add work the user didn't ask for.

## Step 1 — Understand what the user actually needs

Read the user's description. Identify:
- The user need being captured (the WHAT)
- The reason behind it if stated (the WHY)
- Any explicit constraints or non-negotiables the user mentioned
- Any links, references, or documents the user provided as research or context

## Step 2 — Assess: one story or many?

Before asking questions or writing anything, assess whether the user's description is one story or should be split into multiple.

**Apply these heuristics:**

1. **Conjunction test** — If the description contains multiple unrelated features joined by "and", "plus", "also", each branch is likely a separate story.
2. **Acceptance criteria clustering** — Mentally draft the ACs. If they cluster into distinct functional groups with no overlap, that suggests separate stories.
3. **Workflow steps** — If the work involves sequential steps where each delivers independent end-to-end value, consider splitting by step.
4. **Independence check** — After any proposed split, each story must deliver value on its own (vertical slice, not horizontal layer). If a story only makes sense with another story completed first, reconsider the split.

**When in doubt, don't split.** Splitting overhead is real. One well-scoped story is better than three artificially separated ones.

### How splitting looks in practice

**Don't split** — "Add a search box to the dashboard" → Single story. One feature, one UI element, one flow. Splitting this would create artificial overhead.

**Do split (conjunction test)** — "Build a settings page where users can update their profile, change their password, and manage notification preferences" → 3 stories. Each has independent acceptance criteria, independent value, and can ship separately.

**Do split (concern separation)** — "Set up the CI pipeline and deploy to staging" → 2 stories. CI pipeline is infrastructure tooling. Deployment is environment configuration. Different verification, different expertise, different blast radius.

### If you see a split

Tell the user how many stories you see, where the boundaries are, and why — then wait for confirmation before proceeding:

> I see this as [N] separate stories:
> 1. [brief description] — because [reason]
> 2. [brief description] — because [reason]
>
> Each can be implemented and verified independently. Want me to proceed with this split, or would you prefer a different breakdown?

Never split silently. The user must see and approve the reasoning.

## Step 3 — Ask up to four refinement questions, only if needed

If the description is clear enough to write a useful story (or stories), ask zero questions and proceed.

If clarification would meaningfully improve the story, ask between one and four targeted questions. If splitting into multiple stories, ask one round of questions that covers all of them — don't re-ask per story.

Hard rules for these questions:

- **Ask only questions that clarify what the user already wants.** Bad question: "Should we also include feature X?" Good question: "When you say 'send a notification', do you mean email, in-app, or both?"
- **Do not propose additions the user did not mention.** If the user said "add a search box", do not ask "should it also support filters?" The user will add filters in another story when they want filters.
- Each question must be answerable in one sentence.
- Stop asking as soon as you have enough to write the story honestly.

## Step 4 — Capture references

If the user provided links, documentation, file paths, or any external research as part of the story discussion, capture them in the story's Notes section as a "Sources" subsection. These links are grounding for whoever implements the story later — they are the source of truth the implementer consults to avoid making decisions in a vacuum.

If the user did not provide any references, do not invent them.

## Step 5 — Find the right home

List all epic folders currently in `{{pendingDir}}/`. For each, read its `_epic.md` summary. Decide:

- Does this story (or stories) clearly belong inside an existing epic? If yes, propose that epic and explain why.
- Is this work significantly different in theme from any existing epic? If yes, propose a new epic. The new epic gets the next sequential number after the highest existing one. Suggest a kebab-case folder name and a one-sentence summary.
- If multiple stories from a split: they usually belong in the same epic. If they're thematically distinct, they may go to different epics — surface this to the user.
- Is the placement ambiguous between two epics? Surface that ambiguity and let the user decide.

Do not write anything to disk yet. Wait for user confirmation.

## Step 6 — Self-check before writing

Before writing any story files, verify each story against these checks:

- **Description captures WHAT and WHY, not HOW.** If the description mentions specific code, specific files, or implementation approach, it's describing HOW. Rewrite it to describe the need and the reason.
- **Each acceptance criterion is an observable outcome.** "User can reset their password via email" is an outcome. "Add a POST /api/auth/reset-password endpoint" is an implementation step. Rewrite implementation steps as outcomes.
- **No scope was added that the user didn't ask for.** Compare each AC to the user's original description. If an AC covers something the user never mentioned, cut it.
- **This story is a verifiable increment.** Can implement-story build it? Can complete-story verify it against principles and mark it done? If not, the scope needs adjustment.

### What good vs bad acceptance criteria look like

**Good — observable outcomes:**
- "User can search products by name and see results within 2 seconds"
- "Failed payment attempts surface an error message explaining what went wrong"
- "The API returns paginated results with a maximum of 50 items per page"

**Bad — implementation steps:**
- "Implement ElasticSearch integration for search" (this is HOW, not WHAT)
- "Add try/catch to the payment handler" (implementation detail)
- "Create a pagination utility function" (horizontal layer, not user-visible outcome)

## Step 7 — Write the story (or stories)

Once the destination is confirmed, write each story file at `{{pendingDir}}/NN-epic-name/story-MM-name.md` where MM is the next available story number. Use this exact structure:

```
# Story: <Title>

## Description

<2-5 sentences describing what the user needs and why. No implementation details. No code snippets. No file paths in this section. Capture the WHAT and the WHY, not the HOW.>

## Acceptance Criteria

- [ ] <criterion 1, observable outcome>
- [ ] <criterion 2>
- [ ] <criterion 3>

## Key Decisions

<Optional. Only fill in if the user has expressed concrete decisions about how this should be approached. Examples: "use the existing auth flow", "don't add a new dependency", "keep this synchronous". These are NOT implementation details — they are constraints the user has chosen. If the user has not expressed any decisions, leave this section out entirely. Do not invent decisions.>

## Notes

<Optional. Free-form scratchpad for context, miscellaneous detail, and links the user provided. The user owns this section.>

### Sources

<Only if the user provided references. Bullet list of links, file paths, or document names that ground this story. The implementer should consult these before making decisions.>
```

If writing multiple stories, number them sequentially within the epic.

## Step 8 — If a new epic was created

Also write `{{pendingDir}}/NN-epic-name/_epic.md`:

```
# Epic NN: <Title>

## Summary

<2-4 sentences describing what this epic is about and what it accomplishes. No implementation details.>

## Goals

- <goal 1>
- <goal 2>

## Key Decisions

<Optional. Same rules as story-level Key Decisions.>

## Stories

| # | Story |
|---|-------|
| 1 | [<Story Title>](./story-01-name.md) |
```

## Step 9 — If stories were added to an existing epic

Update the `_epic.md` Stories table to include the new stories as new rows.

After writing, suggest the next step: "Stories are ready. Run `/alphaspec.implement-story` on the first one to start building."

## Critical rules

- **Every story is a verifiable increment.** It can be independently implemented, tested against principles, and completed. No horizontal layers disguised as stories.
- **Follow the user's guidance.** Do not lead, suggest extensions, or add scope the user didn't request. Capture what the user wants, not what you think they should want.
- **Acceptance criteria are observable outcomes, not implementation steps.** If an AC describes HOW instead of WHAT, rewrite it.
- **Prefer fewer stories over more.** Splitting overhead is real. One well-scoped story beats three artificially separated ones. Never split without the user's explicit approval.
- Stories are brief. Aim for under 100 lines, never exceed 200.
- No implementation details, no code, no file paths in spec sections (file paths in Sources are fine).
- No story points.
- Do not invent acceptance criteria or Key Decisions the user did not imply.
- Capture references the user provides — they are grounding for implementation.
- Stories are living documents. Refining them later as understanding sharpens is normal.

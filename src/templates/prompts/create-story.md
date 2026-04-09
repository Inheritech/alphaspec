---
name: create-story
description: Create a new alphaspec story, placing it in an existing epic or a new one. Will confirm placement with the user before writing.
---

The user wants to create a new story. The story description follows: ${input:description}

## Step 1 — Understand what the user actually needs

Read the user's description. Identify:
- The user need being captured (the WHAT)
- The reason behind it if stated (the WHY)
- Any explicit constraints or non-negotiables the user mentioned
- Any links, references, or documents the user provided as research or context

## Step 2 — Ask up to four refinement questions, only if needed

If the description is clear enough to write a useful story, ask zero questions and proceed.

If clarification would meaningfully improve the story, ask between one and four targeted questions. Hard rules for these questions:

- **Ask only questions that clarify what the user already wants**, not questions that propose extending the scope. Bad question: "Should we also include feature X?" Good question: "When you say 'send a notification', do you mean email, in-app, or both?"
- **Do not propose additions the user did not mention.** If the user said "add a search box", do not ask "should it also support filters?" The user will add filters in another story when they want filters.
- Each question must be answerable in one sentence.
- Stop asking as soon as you have enough to write the story honestly.

## Step 3 — Capture references

If the user provided links, documentation, file paths, or any external research as part of the story discussion, capture them in the story's Notes section as a "Sources" subsection. These links are grounding for whoever (or whatever) implements the story later. They are the source of truth that the implementer can consult to avoid making decisions in a vacuum.

If the user did not provide any references, do not invent them.

## Step 4 — Find the right home

List all epic folders currently in `pending/`. For each, read its `_epic.md` summary. Decide:

- Does this story clearly belong inside an existing epic? If yes, propose that epic to the user and explain why.
- Is this story significantly different in theme or scope from any existing epic? If yes, propose creating a new epic. The new epic gets the next sequential number after the highest existing one (no gaps in creation — gaps come from work order, not creation order). Suggest a kebab-case folder name and a one-sentence summary.
- Is the user's intent ambiguous between two epics? Surface that ambiguity to the user and let them decide.

Do not write anything to disk yet. Wait for user confirmation of the destination.

## Step 5 — Write the story

Once the destination is confirmed, write the story file at `pending/NN-epic-name/story-MM-name.md` where MM is the next available story number in that epic. Use this exact structure:

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

## Step 6 — If a new epic was created

Also write `pending/NN-epic-name/_epic.md`:

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

## Step 7 — If story was added to an existing epic

Update the `_epic.md` Stories table to include the new story as a new row.

## Critical rules

- Stories are brief. Aim for under 100 lines, never exceed 200.
- No implementation details. No code. No file paths in the spec sections (file paths in Sources are fine).
- No story points.
- Do not invent acceptance criteria the user did not imply.
- Do not invent Key Decisions.
- Do not propose scope extensions in your questions. Capture what the user wants, not what you think they should want.
- Stories are living documents. Refining them later as understanding sharpens is normal.
- Capture references the user provides. They are grounding for future work.

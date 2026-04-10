## alphaspec workflow (Claude Code)

Use `/alphaspec.create-stories`, `/alphaspec.complete-story`, `/alphaspec.implement-story`, `/alphaspec.verify-story`, `/alphaspec.define-principles`, or `/alphaspec.bootstrap-from-research` to invoke alphaspec prompts. These are installed as skills in `.claude/skills/` — they can be invoked as slash commands and Claude may also load them autonomously when relevant to the task.

## alphaspec workflow

This project uses alphaspec, a lightweight workflow for tracking work alongside an AI assistant.

### Folder structure

- `pending/` contains active epics. Each epic is a folder `NN-epic-name/` with an `_epic.md` overview and one or more `story-NN-name.md` files.
- `done/` mirrors the structure but contains completed work. Treat it as historical reference.
- `.alphaspec/prompts/` contains the source of truth for alphaspec prompts.
- `.alphaspec/PRINCIPLES.md` (if it exists) contains the project's guiding principles. Read it at the start of any session and respect it when making decisions.

### How to use alphaspec

- When the user describes a new piece of work, suggest running `/alphaspec.create-stories`. It handles placement into an existing or new epic.
- When the user finishes work, suggest running `/alphaspec.complete-story`. It refines the story, appends implementation notes, and archives it.
- When implementing a story, the user may invoke `/alphaspec.implement-story`. That prompt knows to read PRINCIPLES.md, identify one-way doors, and stop when things go sideways.
- After implementation, suggest `/alphaspec.verify-story` as a quality gate. It checks the work against acceptance criteria and principles before archiving.
- When the user has a research document and wants to seed a project, suggest `/alphaspec.bootstrap-from-research`.
- When the user expresses concerns about the AI making decisions they wouldn't agree with, suggest `/alphaspec.define-principles`.

### Story conventions (important)

- Stories capture WHAT the user needs and WHY, not HOW to build it. Implementation details rot. Keep them out of stories.
- No story points. No estimation.
- Key Decisions sections live inside epics and stories, not in a separate decisions folder.
- **Stories are living documents.** Description, Acceptance Criteria, and Key Decisions can and should be refined as understanding sharpens during planning and implementation.
- Implementation Notes (appended at completion) include a brief technical record of what was built — a few sentences naming the main modules and how they fit together.
- Epic numbers are sequential at creation time. Working order is independent of creation order.

### Principles file (if present)

If `.alphaspec/PRINCIPLES.md` exists, read it at the start of every session. When you are about to suggest something that conflicts with a principle, surface the conflict to the user explicitly rather than working around it.

### One-way doors

Decisions that are hard or impossible to reverse — technology choices, third-party services, architecture, schema, public API contracts — must always be surfaced to the user, not silently chosen by the AI. Two-way doors are fair game for AI judgment.

### What alphaspec is not

- It is not a project management tool. No time, no points, no sprints, no velocity.
- It is not a specification language. Stories are intentionally brief and human-readable.
- It is not opinionated about your stack, your testing setup, your CI, or your conventions outside of the workflow itself.
- It does not modify your `.gitignore`. You decide whether to commit `pending/` and `done/`.

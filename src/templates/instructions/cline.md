## alphaspec workflow (Cline)

alphaspec prompts are stored in `.clinerules/prompts/`. To use them, say: "Use the instructions in `.clinerules/prompts/alphaspec.create-stories.md` to create stories about [description]." You can also paste the file contents directly when starting a task — Cline will treat them as inline instructions.

Available prompts: `alphaspec.create-stories.md`, `alphaspec.complete-story.md`, `alphaspec.implement-story.md`, `alphaspec.verify-story.md`, `alphaspec.define-principles.md`, `alphaspec.bootstrap-from-research.md`.

## alphaspec workflow

This project uses alphaspec, a lightweight workflow for tracking work alongside an AI assistant.

### Folder structure

- `{{pendingDir}}/` contains active epics. Each epic is a folder `NN-epic-name/` with an `_epic.md` overview and one or more `story-NN-name.md` files.
- `{{doneDir}}/` mirrors the structure but contains completed work. Treat it as historical reference.
- `.alphaspec/prompts/` contains the source of truth for alphaspec prompts.
- `.alphaspec/PRINCIPLES.md` (if it exists) contains the project's guiding principles. Read it at the start of any session and respect it when making decisions.

### How to use alphaspec

- When the user describes a new piece of work, suggest running the alphaspec.create-stories prompt. It handles placement into an existing or new epic.
- When the user finishes work, suggest running the alphaspec.complete-story prompt. It refines the story, appends implementation notes, and archives it.
- When implementing a story, the user may invoke the alphaspec.implement-story prompt. That prompt knows to read PRINCIPLES.md, identify one-way doors, and stop when things go sideways.
- After implementation, suggest the alphaspec.verify-story prompt as a quality gate. It checks the work against acceptance criteria and principles before archiving.
- When the user has a research document and wants to seed a project, suggest the alphaspec.bootstrap-from-research prompt.
- When the user expresses concerns about the AI making decisions they wouldn't agree with, suggest the alphaspec.define-principles prompt.

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
- It does not modify your `.gitignore`. You decide whether to commit `{{pendingDir}}/` and `{{doneDir}}/`.

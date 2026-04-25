---
name: refine-story
description: Audit an alphaspec story for gaps, hidden complexity, and ambiguity before implementation. Surfaces functional and non-functional requirements that are missing or under-specified, checks atomicity, and surfaces findings for the user to act on — without adding scope the user didn't ask for.
---

Refine the story at: ${input:storyFile}

## Context: alphaspec workflow

You are operating within alphaspec, a Story-Driven Development (SDD) workflow. Stories in `{{pendingDir}}/` flow through: **create-stories → refine-story (optional) → implement-story → verify-story → complete-story**.

**Your role in this workflow:** Refine-story is a gap-finding pass between story creation and implementation. It exists to catch problems before they surface as confusion or rework mid-implementation. A well-refined story means implement-story can start with confidence instead of asking questions along the way.

**What you are looking for:**
- Functional gaps — things the story implies but doesn't specify
- Non-functional requirements — performance, security, accessibility, error handling — that apply to this story's domain
- Edge cases — user paths or data states that acceptance criteria don't account for
- Dependencies — other stories or capabilities this story assumes but doesn't declare

**What you are NOT doing:**
- Adding features the user didn't ask for
- Extending the scope beyond what the story describes
- Rewriting a story that is already clear

The standard for a finding is: **does this gap create a real risk for implementation?** If a reasonable engineer could make a confident decision without clarifying it, it's not worth surfacing.

## Step 1 — Ground yourself

Read the story file. Then:
- Read `.alphaspec/PRINCIPLES.md` if it exists — non-functional requirements findings must be grounded in this file or in well-established norms for the domain, not in your own preferences
- Read any files listed under `### Sources` in the story notes
- Read any `### Artifacts` transcriptions in the story notes
- Check `{{pendingDir}}/` for the parent epic's `_epic.md` to understand the broader context

Extract from the story:
- The core user need
- All existing acceptance criteria
- Any Key Decisions already made
- Any explicit non-functional requirements already stated
- Any declared dependencies

## Step 2 — Gap audit

Work through the story using four lenses. For each lens, identify gaps that would cause real friction during implementation. Filter out anything that wouldn't materially affect implementation.

### Functional gaps

Things the story implies must exist but doesn't specify:

**What to look for:**
- Acceptance criteria that reference UI elements, flows, or states without specifying their behavior in all meaningful cases (not just the happy path)
- Interaction sequences that are mentioned but not fully described
- Data that the story requires the user to provide but whose shape or constraints aren't defined

**Examples:**
- Story says "user can reset their password" but doesn't specify whether the reset link expires or how long it's valid — a real implementation decision with user impact
- Story says "display an error message" but not which conditions trigger an error, or whether errors are inline or toast — different enough to need clarification
- Story says "user can filter results" but doesn't specify whether multiple filters are AND or OR logic — fundamentally affects the implementation

**Not a functional gap:**
- The story says "sign in with Google" and doesn't specify the exact OAuth scopes — a technical detail the implementer can resolve using the OAuth provider's docs without clarification
- The story says "show a confirmation" and doesn't specify the exact copy — a design detail the implementer can decide

### Non-functional gaps

Performance, security, accessibility, error handling, and reliability requirements that apply to this story but are absent from the acceptance criteria.

**Rule: only surface non-functional gaps that are grounded in PRINCIPLES.md or are well-established norms for this feature type.** Do not invent standards the project hasn't claimed.

**Examples:**
- PRINCIPLES.md says "all forms must be keyboard-accessible" — a story adding a form should have an accessibility criterion
- PRINCIPLES.md says "API responses must be under 200ms at p95" — a story adding a new API endpoint should have a performance criterion
- Well-established norm: a story adding an authentication endpoint should include a rate-limiting criterion (standard auth security), regardless of whether PRINCIPLES.md mentions it

**Not a non-functional gap:**
- Adding a general "should be fast" criterion when the project has no performance principles and the story isn't a performance-sensitive path
- Adding "should be internationalized" when the project shows no evidence of i18n requirements

### Edge cases

User paths, data states, or error conditions that acceptance criteria don't account for but would be encountered in practice.

**What to look for:**
- Empty states — what does the user see when the feature has no data to show?
- Error paths — what happens when an external call fails, the user submits invalid data, or a race condition occurs?
- Concurrent access — can two users affect the same data? Does this story need to handle that?
- Boundary conditions — limits, maximum values, minimum values that the story's acceptance criteria don't address

**Examples:**
- Story creates a "project members" list but has no criterion for what happens when you remove the last member — likely a business rule that needs to be decided
- Story adds a file upload but doesn't address what happens when the file exceeds some size limit — implementation will need to decide, and the story should too
- Story adds async processing but no AC for what the user sees while waiting or if it fails

**Not worth surfacing:**
- Highly theoretical edge cases that would require multiple unusual conditions to occur simultaneously
- Cases where the story's intent clearly implies the handling (e.g. a "delete account" story with a confirmation step — the confirmation modal's exact copy doesn't need to be specified)

### Dependencies

Other stories, capabilities, or external conditions this story assumes but doesn't declare.

**What to look for:**
- Does the story require a backend endpoint that doesn't appear to exist yet?
- Does it reference data that another story would create?
- Does it depend on a third-party integration being in place?
- Does the epic `_epic.md` list earlier stories that this story logically builds on?

**Examples:**
- Story adds a "user activity feed" UI but the events it displays are produced by a logging system that no other story has introduced yet — the dependency is real and the story should declare it (or be deferred until the producer exists)
- Story extends an admin dashboard with a "ban user" action but no story has defined what banning means at the data layer — this is a dependency on a sibling story that needs to come first
- Story integrates a payment provider but `_epic.md` doesn't reference any earlier story that established the billing data model — surface this so the user can either confirm the model exists outside the epic or decide ordering

**Not worth surfacing:**
- Standard library, language runtime, or platform APIs the implementer will obviously use (Node's `fetch`, the browser DOM, Python's `pathlib`)
- Well-established third-party packages whose presence is implied by the project's stack (React in a React project, Express in a Node API project) — unless the story specifically requires a new one
- Build tooling, type systems, linters — implementation-side scaffolding the engineer resolves without needing a story to declare it
- Dependencies the story already explicitly lists in its `## Related` section — re-surfacing what's already declared is noise

## Step 3 — Atomicity check

A story should be a single verifiable increment — one piece of work that can be implemented, tested, and completed independently.

Apply these heuristics:

1. **Conjunction test** — Does the description contain multiple independent features joined by "and", "plus", "also"? If yes and they're separately verifiable, the story may need splitting.
2. **Acceptance criteria clustering** — Do the ACs group into two or more distinct functional areas with no overlap? If so, consider whether those areas could ship and be verified separately.
3. **Week-of-work heuristic** — Would a confident engineer need more than a week to implement this story? If so, it may be too large to be atomic.

**But: prefer not splitting.** Splitting overhead is real. Only recommend a split if the story would be meaningfully harder to implement, verify, or understand as a single unit.

**Examples of split-worthy:**
- Story: "Build the user profile page including avatar upload, bio editing, and social links management" — three independently verifiable features that can each ship separately

**Not split-worthy:**
- Story: "Add search to the project list with debounced input and result highlighting" — one coherent feature; splitting into "add input" and "add results" creates artificial dependencies

## Step 4 — Self-check before surfacing

Before presenting findings, check each one:

- **Does this gap create real implementation risk?** A finding is worth surfacing if a reasonable engineer would make materially different implementation choices depending on the answer.
- **Is this grounded in the story's need, PRINCIPLES.md, or a well-established norm?** A finding based purely on personal preference or hypothetical quality standards is not worth surfacing.
- **Is the gap actually absent from the story?** Re-read the ACs, Key Decisions, and Notes. Some findings will dissolve on close reading.

Filter ruthlessly. Five high-signal findings are more useful than fifteen speculative ones.

## Step 5 — Surface findings

Present findings using this exact template:

---

## Refinement findings: <story title>

### Must-address (blocks implementation)

*Gaps where implementation cannot proceed confidently without a decision.*

- **[finding]** — why it matters
  Suggested AC: "[criterion text]" / Suggested split: yes | no

### Should-address (likely friction)

*Gaps that won't block implementation but will likely require improvisation that should be a deliberate decision.*

- **[finding]** — why it matters
  Suggested AC: "[criterion text]" / Suggested split: yes | no

### Optional (nice-to-have)

*Gaps that are worth noting but where a confident default exists.*

- **[finding]** — why it matters, and what the reasonable default is

### Atomicity verdict

Pass — the story is well-scoped as a single increment.

*or*

Split recommended — [reason]. Proposed breakdown:
1. [Story A title] — [what it covers]
2. [Story B title] — [what it covers]

---

If there are no findings in a category, omit that category entirely.

### Worked example

**Thin story (before refinement):**

```markdown
# Story: Password Reset

## Description
Users can reset their password if they forget it.

## Acceptance Criteria
- [ ] User can request a password reset
- [ ] User receives a reset email
- [ ] User can set a new password
```

**Findings surfaced:**

> ## Refinement findings: Password Reset
>
> ### Must-address (blocks implementation)
>
> - **Reset link expiry** — implementation must decide whether the link is one-time-use and/or time-limited; this affects both the backend token design and the user-facing error message
>   Suggested AC: "Reset link expires after 60 minutes and is invalidated after use" / Suggested split: no
>
> - **Invalid/expired link UX** — when a user clicks an expired or already-used link, they need to see a useful error, not a broken page
>   Suggested AC: "If the reset link has expired or already been used, user sees an error explaining what happened and how to request a new one" / Suggested split: no
>
> ### Should-address (likely friction)
>
> - **New password constraints** — the "set a new password" step needs to enforce the same constraints as account creation (if any exist), or the user will hit a confusing validation error
>   Suggested AC: "New password must meet the same validation requirements as initial account creation" / Suggested split: no
>
> ### Atomicity verdict
>
> Pass — the story is cohesive and independently verifiable as-is.

**After user approves findings, applied changes:**

The three Must/Should findings become accepted ACs appended to the story file.

**Example of a scope-creep finding to filter out (don't surface this):**

> "The story doesn't include multi-factor authentication for the reset flow. This would significantly improve security."

This is not a gap in the story — it's a new feature the user didn't ask for. MFA for password reset is a separate story, not a refinement.

## Step 6 — Wait for the user's direction

After surfacing findings, wait. Do not apply changes speculatively. The user may:
- Accept some or all findings
- Reject findings they disagree with
- Reshape the suggestions
- Decide the story is fine as-is

Present the findings and ask: "Which of these would you like to incorporate?"

## Step 7 — Apply approved changes

For each approved finding, update the story file:

- **New acceptance criteria** — append to the `## Acceptance Criteria` section
- **Description clarifications** — add to `## Description` or a `### [concern]` subsection within it
- **New notes or edge cases** — add to `## Notes`
- **If a split is approved** — create the new story files following the create-stories template, then update the parent epic's `_epic.md` Stories table to include the new stories and remove or rename the original

Do not add Key Decisions or change the story title unless the user explicitly asks.

After applying changes, confirm what was updated: "Updated [N] acceptance criteria, added [N] notes. The story is ready for `/alphaspec-implement-story`."

## Critical rules

- **Surface gaps, not preferences.** A finding must be grounded in the story's own needs, PRINCIPLES.md, or a well-established norm for the feature type — not in what you think would make the story better.
- **Do not add scope.** If a finding is really a new feature the user didn't ask for, filter it out. The test: would the story still satisfy its core user need without this finding? If yes, it's probably scope creep.
- **Wait for user direction before applying changes.** Present findings and confirm which ones to incorporate. Never edit the story speculatively.
- **A story that survives with zero findings is a success**, not a missed opportunity to add value. Many stories will be well-scoped already.

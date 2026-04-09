---
name: complete-story
description: Verify which alphaspec stories are complete, refine them to reflect what was actually built, append implementation notes with brief technical detail, and move them to done/.
---

The user has finished some work and wants to mark stories complete.

## Step 1 — Identify candidate stories

Look at the conversation history of the current session. Identify which stories from `pending/` were worked on or appear to be complete based on the work that was done.

If the user passed an explicit story file path or story name as input, use that and skip the discovery phase: ${input:storyHint}

Otherwise, present the candidates to the user with a brief reason for each:

> I think these stories are complete based on this session:
> - `pending/03-checkout-flow/story-02-payment-intent.md` — implemented the Stripe webhook handler and tests are passing
> - `pending/03-checkout-flow/story-03-confirmation-email.md` — added the email service and template
>
> Should I proceed with marking these complete?

Wait for the user's confirmation. Do not proceed until the user has explicitly approved the list.

## Step 2 — For each confirmed story, refine before completing

Stories are living documents. Before marking a story complete, the story must reflect what was actually built — not what was originally planned.

### Read the story and compare it to reality

Read the current story file. Compare its Description, Acceptance Criteria, and Key Decisions to what was actually implemented during the session. Ask yourself:

- Does the Description still accurately describe what the work was about, or did the scope shift during planning/implementation?
- Are there acceptance criteria that no longer apply because the approach changed? Are there acceptance criteria that should have been there but weren't?
- Were any of the original Key Decisions overridden by something the user decided during the work?

### Refine the story to match reality

If anything is out of sync, refine the story IN PLACE so it reflects the current state of understanding. This is keeping the story honest. A story that no longer matches what was built is dead documentation.

Specifically:
- Update the Description if the scope or framing shifted. Keep it brief.
- Add, remove, or modify Acceptance Criteria as needed so they match what the work actually delivered. Then check off the ones that are met.
- Update Key Decisions if the approach changed during the work, or add new ones that emerged.

Surface significant refinements to the user before writing them: "I noticed the scope shifted during implementation — the story originally said X but you ended up doing Y. I'll update the Description to reflect that. Sound right?" For small adjustments (rewording a criterion, checking boxes), just do them.

### Append Implementation Notes with brief technical detail

After the story body reflects reality, append a new section at the end of the story file:

```
## Implementation Notes

### What was built

<2-6 sentences describing technically what was actually implemented. Be specific enough that a future story working on adjacent code can find its bearings: name the main modules, files, or patterns introduced, and how they fit together. Do not write a tutorial — just enough that someone reading this in a month can orient themselves and decide whether to read the actual code for more.>

### What was learned

<Optional. Anything discovered during implementation that wasn't already captured above: gotchas, library quirks, performance considerations, surprising behaviors. If nothing notable was learned, omit this subsection.>

### For future stories

<Optional. Things a future story working on adjacent code should know about. Examples: "the X module was extracted to a shared location", "we settled on approach Y after trying Z and discovering W". If nothing notable, omit this subsection.>
```

The "What was built" subsection is the one that always exists. It is the brief technical record of the story — yes, it can become slightly stale over time as the code evolves, but the cumulative record across stories provides a useful map of project history that future implementation work can navigate. Keep it factual and dense.

The other subsections are optional — only include them if there's real content for them.

### Move the story to done/

Move `pending/<epic>/<story>.md` to `done/<epic>/<story>.md`. Create the `done/<epic>/` directory if it doesn't exist. If the destination already has a file with the same name, do not overwrite — surface the conflict to the user.

### Check if the epic is now empty

After moving the story, check if the `pending/<epic>/` folder still contains any story files. If the only file remaining is `_epic.md`:

- Move `_epic.md` to `done/<epic>/_epic.md`
- Remove the empty `pending/<epic>/` directory
- Tell the user: "Epic <n> is now complete and has been archived to done/."

## Step 3 — Summary

After all confirmed stories are processed, give the user a summary:

> Completed:
> - story-02-payment-intent (epic 03-checkout-flow) — refined Description to match the webhook-first approach
> - story-03-confirmation-email (epic 03-checkout-flow) — no refinement needed
>
> Epic 03-checkout-flow is now complete and archived.

## Critical rules

- Never mark a story complete without user confirmation, even if it looks obvious.
- The story body must reflect reality before it gets archived.
- "What was built" in Implementation Notes is brief technical detail (2-6 sentences), not a tutorial.
- Surface significant refinements before writing them.
- Be willing to push back if the user wants to mark something complete that you can see is not actually done.

---
name: complete-story
description: Refine alphaspec stories to reflect what was actually built, append implementation notes, and archive them to done/. Quality verification is verify-story's job — this is the archival step.
---

The user has finished some work and wants to mark stories complete.

## Context: alphaspec workflow

You are operating within alphaspec, a Story-Driven Development (SDD) workflow. This prompt is the **archival step** — it refines stories to match what was actually built, appends what was learned, and moves them to the permanent record in `done/`.

Your job:
1. **Story accuracy** — Refine the story so it reflects what was actually built
2. **Technical record** — Append Implementation Notes that are dense and useful for future work
3. **Archival** — Move the completed story to `done/` and surface any work it unblocks

Quality verification — checking the implementation against principles and acceptance criteria — is **verify-story's** job. If a story hasn't been verified yet, suggest running it first. If the user chooses to skip, proceed with archival.

Other prompts in the workflow:
- **create-stories** created the stories you're now archiving
- **implement-story** built what the stories describe
- **verify-story** reviews the implementation against principles and acceptance criteria
- **define-principles** defined the project's system constitution

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

## Step 2 — For each confirmed story, refine and archive

Stories are living documents. Before archiving, the story must reflect what was actually built.

If the story hasn't been reviewed via `/alphaspec.verify-story`, suggest it: "Want to run verify-story first to check the implementation against principles, or proceed directly to archival?" Proceed based on the user's choice.

### 2a — Read the story and compare it to reality

Read the current story file. Compare its Description, Acceptance Criteria, and Key Decisions to what was actually implemented during the session. Ask yourself:

- Does the Description still accurately describe what the work was about, or did the scope shift?
- Are there acceptance criteria that no longer apply because the approach changed? Are there criteria that should have been there but weren't?
- Were any of the original Key Decisions overridden by something the user decided during the work?

### 2b — Refine the story to match reality

If anything is out of sync, refine the story IN PLACE so it reflects what was actually built. A story that doesn't match reality is dead documentation.

Specifically:
- Update the Description if the scope or framing shifted. Keep it brief.
- Add, remove, or modify Acceptance Criteria as needed so they match what was delivered. Check off the ones that are met.
- Update Key Decisions if the approach changed or new ones emerged.

Surface significant refinements to the user before writing them: "I noticed the scope shifted during implementation — the story originally said X but you ended up doing Y. I'll update the Description to reflect that. Sound right?" For small adjustments (rewording a criterion, checking boxes), just do them.

### 2c — Append Implementation Notes

After the story body reflects reality, append Implementation Notes:

```
## Implementation Notes

### What was built

<2-6 sentences of dense, specific technical fact. Name the main modules, files, or patterns introduced and how they fit together. A future developer should be able to orient themselves in 30 seconds. Do not write a tutorial.>

### What was learned

<Optional. Gotchas, library quirks, performance discoveries, surprising behaviors. Omit if nothing notable.>

### For future stories

<Optional. Things adjacent work should know: "the X module was extracted to shared", "we settled on Y after trying Z". Omit if nothing notable.>
```

**Self-check before writing Implementation Notes:** Verify that "What was built" is 2-6 sentences of dense technical fact, not a tutorial. It names specific modules, files, or patterns — not vague descriptions. If you're writing more than 6 sentences, you're writing too much.

### What good vs bad Implementation Notes look like

**Good** — dense, specific, orientating:
> Added `PaymentService` in `src/services/payment.ts` handling Stripe webhook events via `handleWebhookEvent()`. Integrated with existing `OrderRepository` through the `completeOrder()` method. Added idempotency check using the Stripe event ID stored in `payment_events` table to prevent duplicate processing.

**Bad** — tutorial-length, step-by-step:
> First, I created a new file called payment.ts in the services folder. Then I added a class called PaymentService. Then I added a method called handleWebhookEvent that takes a Stripe event object. Then I imported the OrderRepository... _(continues for 20 more lines)_

### 2d — Move the story to done/

Move `pending/<epic>/<story>.md` to `done/<epic>/<story>.md`. Create the `done/<epic>/` directory if it doesn't exist. If the destination already has a file with the same name, do not overwrite — surface the conflict to the user.

### 2e — Check if the epic is now empty

After moving the story, check if `pending/<epic>/` still contains any story files. If only `_epic.md` remains:

- Move `_epic.md` to `done/<epic>/_epic.md`
- Remove the empty `pending/<epic>/` directory
- Tell the user: "Epic <n> is now complete and has been archived to done/."

### 2f — Surface unblocked work

After moving the story, check the Related sections of other stories still in `pending/`. If any story has a `Depends on:` reference to the story just completed, surface it:

> Completing this story may unblock:
> - `story-03-payment-confirmation` — depends on this story's payment intent handler

This gives the user visibility into what's now ready to start.

## Step 3 — Summary

After all confirmed stories are processed, give the user a summary:

> Completed:
> - story-02-payment-intent (epic 03-checkout-flow) — refined Description to match webhook-first approach
> - story-03-confirmation-email (epic 03-checkout-flow) — no refinement needed
>
> Epic 03-checkout-flow is now complete and archived.
> Potentially unblocked: story-04-order-history (epic 04-customer-portal)

## Critical rules

- **Suggest verify-story if the story hasn't been verified.** Quality verification is verify-story's job, not yours. If the user wants to skip verification, respect that and proceed with archival.
- **Do not implement code. Do not run quality verification.** Your scope is documentation, refinement, and archival.
- **You are done when** every confirmed story has been refined to match reality, has Implementation Notes, has been moved to `done/`, and any unblocked work is surfaced.
- Never mark a story complete without user confirmation, even if it looks obvious.
- The story body must reflect reality before it gets archived.
- Implementation Notes are a compass, not a map. 2-6 sentences of dense, specific technical fact.
- Surface significant refinements before writing them.
- Push back if the user wants to mark something complete that you can see is not done.

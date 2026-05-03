---
name: bootstrap-from-research
description: Generate epics and stories from a research document (market analysis, technical exploration, product brief, AI-generated research from Perplexity/Gemini/ChatGPT, etc.). Locks down the foundational decisions that must be made now, defers everything else to the moment of need, and produces an incremental delivery plan.
---

The user wants to bootstrap an alphaspec project from a research document. Input: ${input:source}

## Context: alphaspec workflow

You are operating within alphaspec, a Story-Driven Development (SDD) workflow. This prompt is the **idea-to-plan bridge** — it turns a research document into the foundational decisions and story backlog that the rest of the workflow executes against.

Downstream prompts depend on what you produce here:
- **define-principles** derives the project's system constitution from the foundations you lock
- **create-stories** refines and extends the stories you generate
- **implement-story** builds what the stories describe
- **verify-story** reviews the implementation against principles and acceptance criteria
- **complete-story** refines stories to match reality and archives them to `{{doneDir}}/`

Every story you generate must be a **verifiable increment** — scoped so that implement-story can build it and complete-story can verify it. If a story is too vague to verify, it's too vague to ship.

If the project already has `.alphaspec/PRINCIPLES.md`, read it before generating stories. The principles define the project's architectural, quality, and non-functional requirements — your stories should align with them. If PRINCIPLES.md doesn't exist yet, that's normal for a bootstrap — suggest the user run `/alphaspec-define-principles` after the bootstrap to establish the system constitution.

The input may be a file path, a URL, or pasted markdown content. Handle all three.

## A note on long sessions and memory checkpoints

This prompt runs over a long, multi-stage session — reading the research, locking down foundations with the user, structuring epics, and generating stories. Long sessions are vulnerable to context compaction, which can drop critical decisions and force the agent to re-derive them (often incorrectly).

If the AI tool you are running on has memory features available — Cursor memory, Claude Code memory, an MCP memory server, project-level context files the tool maintains automatically — use them aggressively at the checkpoints called out below. At each checkpoint, write a structured summary of what has been decided (or deliberately deferred) so it can be recovered if context is lost. The checkpoints are explicitly marked in this prompt as **CHECKPOINT — save to memory**.

If no memory features are available, summarize the state of the discussion at each checkpoint so the user can manually recover if anything is lost.

## Step 1 — Read the research thoroughly

Read the entire research document. Do not skim. Identify:

- The major capabilities, features, or themes the research describes
- Any explicit constraints, requirements, or non-negotiables
- Any technology choices the research has already committed to
- Any technology choices the research mentions but leaves undecided
- Any references to external systems, third-party services, or domain knowledge
- Any open questions or areas the research itself flagged as undecided
- Any architectural patterns or shapes implied by the research (event-driven, request-response, batch, streaming, hexagonal, layered, etc.) — even if not stated directly
- The scale, audience, and goals the research seems to assume — explicitly or implicitly

Build an internal mental model of what the project is, what it needs to do, what shape it will likely take, and at what scale it will operate. Do not show this model to the user yet — Step 2 turns it into a structured conversation.

**The research is input, not gospel.** As you read, form your own opinion. The research may be outdated, may have made choices for reasons that don't apply to this specific user, may have missed alternatives, or may have over-engineered for a scale the user doesn't actually need. You will have a chance to push back in Step 2.

## Step 2 — Calibrate the project, then lock only what must be locked now

The goal of this step is to get the foundational decisions made deliberately by the user — but only the ones that truly need to be made now. Most decisions are better made later, when there's more context. This step is about distinguishing the two and being honest about which is which.

### Step 2a — Calibrate the project's scale and intent

Before walking through any decision categories, get a clear sense of what kind of project this is. Ask the user a small number (zero to four) of high-level calibration questions tailored to what the research suggests the project is.

The test for whether to ask a question: "Would the answer change which decisions need to be locked now versus deferred?" If yes, ask. If no, skip.

Calibrate the questions to the project type:

- **For what looks like a commercial or external-facing product**: ask about the rough scale you expect to operate at, who the users are, what reliability or compliance expectations exist, and how soon you need to ship. Concrete examples: "Is this for a handful of pilot customers in the next quarter, or do you expect public launch with thousands of users in the first month?" "Are there any compliance or data residency requirements you already know about?" These answers reshape the foundation — a system for 10 pilot users does not need the same technology base as one for 10,000 launch users.
- **For what looks like an internal tool or team-scoped project**: ask about who will use it, who will maintain it, and how long you expect it to live. "Is this just for your team, or will other teams adopt it?" "Will you be the only one maintaining it, or will others contribute?"
- **For what looks like a personal project, hobby project, or learning project**: ask about longevity and intent. "Are you mainly building this to learn, or do you want it to be something you actually use long-term?" "Is the goal to ship it once and move on, or to keep iterating?" "Are you optimizing for fun or for resume/portfolio?" Do not ask about audience or scale — those questions don't fit.
- **For what looks like a library, SDK, or developer tool**: ask about the target audience and the surface area. "Who do you imagine using this — yourself, your team, or the broader community?" "Should this be batteries-included or minimal?"

Hard rules for these questions:

- Ask zero questions if the research and user input already make the answers obvious.
- Never ask micro-technical questions like "sync or async", "REST or GraphQL", "monolith or microservices". Those are implementation choices that belong to specific decisions later. Calibration questions are about understanding the project's shape and intent, not pre-deciding architecture.
- Maximum four questions. Usually one or two is enough. Stop as soon as you have enough to make sensible defer/lock decisions.
- Each question must be answerable in one or two sentences.

After the calibration questions, briefly play back your understanding to the user in one sentence: "OK — so this is a [characterization]. Got it." Wait for confirmation or correction, then proceed.

### Step 2b — Identify candidate one-way doors and classify each

With calibration done, walk through the categories below and identify every potential one-way door the project will need. Categories (not all categories will apply to every project):

- **Core technology base**: language, runtime, primary framework, core data store, package management approach
- **Architecture shape**: monolith vs split, sync vs async at the system level, server-rendered vs client-rendered, request-response vs event-driven, batch vs streaming
- **Design and architectural patterns**: layered architecture, hexagonal architecture, CQRS, event sourcing, repository pattern, domain-driven design, screaming architecture, vertical slice architecture, clean architecture, ports and adapters — anything that will shape how every module is organized and how they relate
- **Data model fundamentals**: relational vs document vs graph, multi-tenant strategy if applicable, soft delete vs hard delete, time and timezone handling, money and precision handling, identity strategy (auto-increment, UUID, ULID, etc.)
- **Engineering patterns the project will commit to**: testing approach, error handling style, validation layer, logging conventions, dependency injection style, configuration management
- **Third-party services**: auth provider, payment provider, email provider, AI provider, hosting target, observability target, file storage target
- **Public contracts**: API style (REST, GraphQL, RPC, none), versioning strategy, SDK plans, webhook contracts
- **Boundaries**: what is explicitly in scope, what is explicitly out of scope, what is deferred

For each candidate decision identified across these categories, classify it into one of three buckets:

**Bucket 1 — Must be decided now.** This is foundational. Other decisions depend on it. The very first epic references it. Migrating off of it later would mean rewriting large parts of the system. The shape of every module will be different depending on the answer.

Examples that almost always belong in this bucket: language, primary runtime, core data store, the multi-tenant model if the project is multi-tenant, the architectural pattern that organizes the whole codebase, the auth model (not necessarily the auth provider — the model: do users belong to orgs? are there roles? is it B2C or B2B?).

**Bucket 2 — Can and should be deferred.** This decision only affects a specific epic or specific stories. It can wait until that epic arrives, when there will be more context — better understanding of the actual requirements, better view of what's already been built, possibly even the ability to test alternatives in a real context. Deciding now would be guessing.

Examples that almost always belong in this bucket: payment provider, email provider, AI/LLM provider, observability tooling, specific UI library, specific charting library, specific testing framework choice within a language, specific file storage backend. These are all "swap a vendor" decisions that get made far better with concrete requirements in hand.

**Bucket 3 — Already decided in research.** The research has explicitly committed to this. Most of the time you accept it and surface it to the user for awareness. But you should validate it: does the choice still make sense given the calibration in Step 2a? If the research chose something that doesn't fit the user's actual scale or intent — or if you have a strong, specific reason to believe a different choice would serve the project better — say so honestly. Do not push, but do not stay quiet either.

### Step 2c — Walk through the buckets with the user

Present the classification in a structured conversation, not a wall of text.

**For Bucket 3 (already decided in research)**: list them quickly. For each, state what the research chose and confirm it fits. If you have a concern with one of them, raise it explicitly with your reasoning, and let the user decide whether to keep it or change it.

> The research already committed to these:
> - Language: TypeScript on Node 20 — fits the project scale, no concerns.
> - Database: Postgres with Drizzle — fits, no concerns.
> - Auth provider: Stytch B2B — the research chose this, but I want to flag that for a project at the scale you described (small team, internal tool), Stytch is overkill and adds vendor lock-in. A simpler option like Lucia or even sessions in Postgres would serve the same needs with less complexity. Want to keep Stytch as the research suggested, or reconsider?

**For Bucket 1 (must decide now)**: walk through one by one. For each: state what the research said (if anything), state the key considerations, give your recommendation if you have one, and ask the user to decide. Do not bundle multiple decisions into a single question.

**For Bucket 2 (can defer)**: list them and propose deferring each to a specific later epic or story where the decision will be obvious or testable. Explicitly tell the user this is a strength, not a punt — deferring means the decision will be made with better information.

> These I propose deferring to the moment of need rather than deciding now:
>
> - **Email provider** → defer to the first story that needs to send email (probably the user-onboarding epic). At that point, we'll know exactly what kinds of emails we send, the volume, and the deliverability needs. The decision will be much sharper than guessing now.
> - **AI/LLM provider** → defer to the first epic that uses AI features. We'll know the actual prompt patterns, latency budgets, and cost sensitivity by then.
> - **Observability tooling** → defer until after the first vertical slice ships. By then we'll have real signals about what we actually need to observe.
>
> When the deferred moment arrives, the relevant story will include "research and choose <X>" as part of its work, so the decision is made deliberately, not by accident.

If the user wants to lock something down now that you proposed deferring, that's their call — note it and move it to Bucket 1. If the user wants to defer something you proposed locking, push back briefly with your reasoning, but ultimately respect their choice.

**CHECKPOINT — save to memory**

Once all categories have been walked through, write a structured summary of every locked-in decision and every deferred decision. This is the foundational decision record for the project. Save it to memory using whatever facility is available.

A reasonable structure:

```
# Foundational decisions (alphaspec bootstrap)

## Calibration
- Project type: <e.g. internal tool for small team, single maintainer>
- Scale expectations: <e.g. <50 users, low write volume, no compliance>
- Intent: <e.g. ship a working version in 4 weeks, iterate based on team feedback>

## Locked now
- Language: TypeScript on Node 20
- Database: Postgres with Drizzle
- Architectural pattern: Vertical slice modular monolith
- Auth model: B2B with org-scoped users
- ...

## Deferred to moment of need
- Email provider → defer to user-onboarding epic, first story that sends email. Story will include "research and choose provider" as part of its scope.
- AI/LLM provider → defer to first AI-using epic
- Observability tooling → defer to post-MVP
- ...

## Research-decided, validated, kept as-is
- Frontend framework: <e.g. Next.js> — confirmed, fits the scale
- ...

## Research-decided, overridden by user
- <e.g. Stytch → simple session auth in Postgres> — research chose Stytch but the project's scale doesn't justify it
- ...

## Out of scope
- <anything the user explicitly excluded>
```

Confirm to the user that the foundations are locked, the deferrals are recorded, and the work plan can now be built on top of them. Then proceed.

## Step 3 — Propose an epic structure

With foundations locked and deferrals recorded, propose an epic structure. Each epic is a coherent vertical slice — a chunk of functionality that delivers user value end to end, not a horizontal layer like "the database" or "the API".

Order the epics for incremental delivery:

- **Foundations first.** The minimum scaffold the rest of the system needs: data model setup, auth wiring, the core domain object. These epics are typically 1-3 stories each.
- **Vertical slices second.** Each subsequent epic is a vertical slice that adds a complete user-facing capability on top of the foundation. Each vertical slice should be independently shippable in principle.
- **Cross-cutting concerns last.** Polish, observability, hardening, performance — these come after the verticals work.

**When placing deferred decisions**: assign each Bucket 2 (deferred) decision to the epic where it will first be needed. The first story in that epic that touches the deferred concern will explicitly include "research and choose <X>" as part of its work.

Present the proposed epic outline as a numbered list with one-line summaries:

> Based on the research and the foundations we just locked, here's the epic structure I propose:
>
> 1. **multi-tenant-foundation** — Postgres setup, organizations entity, RLS policies. The base every other module depends on.
> 2. **auth-and-onboarding** — User signup, org provisioning, session management. (Includes deferred decision: email provider, since onboarding sends the first email.)
> 3. **catalog-management** — CRUD for the core domain objects.
> 4. **purchase-flow** — End-to-end purchase from cart to confirmation. (Includes deferred decision: payment provider.)
> 5. **organizer-dashboard** — Internal tools for managers to manage their content.
> 6. **observability-and-hardening** — Logging, metrics, rate limiting, audit trails. (Includes deferred decision: observability tooling.)
>
> Each epic will get 2-5 small stories arranged in an incremental sequence. Want me to proceed, adjust the structure, or rethink it?

Do NOT generate any stories yet. Wait for the user to approve, edit, or replace the structure.

## Step 4 — Generate stories per epic, one epic at a time, with checkpoints

Once the epic structure is approved, walk through the epics one at a time. For each epic, generate its stories before moving to the next. After each epic is done, save a checkpoint to memory and briefly tell the user "Done with epic N: <n> stories. Moving to epic N+1." This protects the work against context compaction and lets the user interrupt if they see something off.

For each epic, generate 2-6 small stories. Follow the create-stories template structure: **Description → Acceptance Criteria → Out of Scope → Key Decisions → Implementation Hints → Related → Notes**. Apply the same quality checks: WHAT not HOW, observable ACs, verifiable increments, principles-derived ACs where PRINCIPLES.md exists. **Out of Scope is mandatory** — list at least two concrete capabilities or behaviors this story does NOT deliver. **Implementation Hints** is optional and explicitly non-binding; when used, lead with the preamble "Any of the following implementations would satisfy this story" so downstream prompts treat it as a sketch, not a contract.

Additional rules for bootstrap-generated stories:

- Brief — under 100 lines, often under 50 at this stage
- Inherit the foundational decisions locked in Step 2 — do not re-decide them, do not propose alternatives
- Include Key Decisions only for things specific to this story or epic, beyond the foundations (often empty — that's fine)
- Link back to the research document in a Sources subsection in Notes — always include this — the research IS the grounding
- Note cross-epic dependencies in the Related section (`Depends on:` / `Related to:`)
- **For epics that own a deferred decision**: the first story that touches the deferred concern includes the research/choose work as part of its acceptance criteria. The Notes section explicitly says "this story makes the deferred decision about <X>. Use the project's actual context to evaluate options. Surface the decision to the user before locking it in."

**Story sequencing within an epic — incremental and ordered**

Stories within an epic follow an incremental sequence. Each story builds on the previous ones in the same epic and delivers something independently validable. The first story is the minimal scaffold — the smallest version of the capability that proves the slice works end to end. Each subsequent story adds depth, edge cases, or polish, in an order where each new story can be validated on top of the previous ones.

Parallelization is fine where the work doesn't share state — for example, two stories that touch different files or different concerns can be worked in parallel — but the ordering is meaningful. Story 02 should logically come after story 01, even if they could technically be done in either order, because the sequence reflects how the capability builds up.

Do NOT spread the work flat as if every story is equally independent. Do NOT bundle everything into one large story to avoid sequencing decisions. The incremental sequence is the value — it's what lets the user (or a future implementer) ship piece by piece and validate as they go.

**CHECKPOINT (per epic) — save to memory**

After generating the stories for one epic, save a structured summary of that epic's stories to memory before moving to the next epic:

```
# Epic NN: <n> — stories generated
- story-01-<n>: <one-line summary>
- story-02-<n>: <one-line summary>
- story-03-<n>: <one-line summary>
Owns deferred decisions: <list of any deferred decisions this epic is responsible for>
Cross-epic dependencies: <any noted>
```

Then announce to the user: "Done with epic N (M stories). Moving to epic N+1." and continue.

## Step 5 — Self-check before presenting

Before showing the outline, review the stories you've generated against these criteria:

- **Verifiable increment?** Could implement-story build this story and verify-story check it against principles? If a story's acceptance criteria are too vague to test, sharpen them.
- **WHAT not HOW?** Stories describe what needs to exist, not implementation steps. If you wrote "create a file called X" instead of "the system can do Y", rewrite.
- **Falsifiable acceptance criteria?** For each AC, can you mentally draft a Given [precondition] / When [action] / Then [measurable result]? If not, the AC is evocative prose — rewrite or cut. Refine-story will reject anything you cannot draft a Given/When/Then for.
- **Vocabulary fence on Description and AC?** Scan both for transport / protocol / runtime / storage terminology — RPC, REST, endpoint, JWT, queue, retry, Redis, Postgres, table, schema, cache, specific library or framework names. If any appear, rewrite in domain vocabulary or move to Implementation Hints.
- **Out of Scope populated with ≥2 concrete items?** If you cannot identify anything explicitly out of scope, the story's boundaries are unclear — return and tighten them. Vague items like "other use cases" do not count.
- **Incremental sequence?** Within each epic, does each story build on the previous? Could the user ship story-01 alone and have something working?
- **Deferred decisions placed correctly?** Each Bucket 2 decision lands in the first story that genuinely needs it — not earlier.
- **Principles alignment?** If PRINCIPLES.md exists, do the stories respect the architectural patterns, quality requirements, and NFR targets defined there?

Fix any issues before proceeding.

## Step 6 — Show the full compiled outline before writing

Once all epics are generated, present the full outline to the user as a single view:

> Here's the full plan I'd generate. Skim it and tell me if anything is off before I create the files.
>
> **Epic 01: multi-tenant-foundation**
> - story-01-postgres-setup — provision Postgres and migration tooling
> - story-02-organizations-entity — root tenant table + auth mapping
> - story-03-row-level-security — RLS policies and org context wrapper
>
> **Epic 02: auth-and-onboarding** _(owns deferred decision: email provider)_
> - story-01-signup-flow — minimal scaffold for user signup end to end
> - story-02-org-provisioning — create organization on first user signup
> - story-03-welcome-email — first story that sends email; includes "research and choose email provider" as part of its work
> - ...
>
> Foundational decisions locked in Step 2 are referenced where relevant. Deferred decisions are placed in the epic and story where they'll be made.

Wait for confirmation. The user may ask you to drop, add, rename, or reorder stories. Apply the changes and re-show until approved.

## Step 7 — Write all files

Once the outline is approved, write all the files at once:

- One `_epic.md` per epic with the structure used by create-stories
- One story file per story, following the create-stories template (Description → Acceptance Criteria → Out of Scope → Key Decisions → Implementation Hints → Related → Notes). Out of Scope is mandatory with ≥2 items. Implementation Hints is optional and carries the non-binding preamble.
- Update each `_epic.md`'s Stories table to list its stories in order

Use sequential numbering: epics from 01 upward in the order proposed, stories within each epic from 01 upward in the incremental sequence determined in Step 4.

## Step 8 — Hand off to the user

Give the user a summary:

> Created N epics with M total stories in `{{pendingDir}}/`.
>
> Foundational decisions are documented in the relevant epics' Key Decisions sections. Deferred decisions are placed in the stories where they'll be made — when those stories arrive, part of the work will be researching and choosing, with much better context than we have today.
>
> The story sequence within each epic is incremental — the first story in each epic is the minimal scaffold, and each subsequent story builds on the previous.
>
> Cherry-pick freely — refine what's good, delete what doesn't fit, leave the rest for later. Each story is small enough that you can reshape any part without affecting the rest.
>
> Suggested next step: If you haven't defined your project's principles yet, run `/alphaspec-define-principles` to establish the system constitution. Then review epic 01 first since everything else depends on it. When you're ready to start work, run `/alphaspec-implement-story` on the first story.

## Critical rules

- **The best decisions are often the ones not made now.** Default to deferring. Only lock in what truly cannot wait. A decision deferred to the moment of need is almost always better than a decision made in the abstract.
- **Validate the research, do not blindly accept it.** The research is input, not gospel. If you have a strong, specific reason to differ from a research choice, say so honestly. Do not push, but do not stay quiet either.
- **Calibrate questions to the project's scale and intent.** Ask high-level questions about goals, audience, longevity, expectations — not micro-technical questions about sync vs async or REST vs GraphQL. Adapt the questions to the project type: a personal hobby project gets different questions than a B2B SaaS.
- **Use memory checkpoints aggressively.** Foundations after Step 2, then per epic in Step 4. Losing the foundational decisions or partial epic work to context compaction is the failure mode this prompt exists to prevent.
- **Stories within an epic follow an incremental sequence**, not a flat list. Each story builds on the previous and delivers something validable.
- **Generated stories must satisfy the create-stories contract on the first run of refine-story.** Description and Acceptance Criteria use domain vocabulary only (the vocabulary fence applies). Every AC is falsifiable. Out of Scope is populated with ≥2 concrete items. Implementation thoughts, if captured at all, live in Implementation Hints with the non-binding preamble — never in Description or AC.
- **Vertical slices, not horizontal layers.** Each epic is a user-facing capability, not infrastructure-by-infrastructure.
- **Do not implement stories. Do not define principles** — that's define-principles' job. Your scope is research analysis, decision locking, and backlog structuring.
- **You are done when** all epics are structured with sequenced stories, foundational decisions are locked, deferrals are recorded with their target epics, and the user has a clear starting point.
- Foundations first, features second, cross-cutting last.
- Small stories. Resist the urge to make each story comprehensive.
- Every story links back to the research document as a Source.
- Show the full compiled outline before writing files. The user must approve before any files are generated.
- Honor decisions the research already made AND validated, and decisions the user just locked in Step 2. Do not propose alternatives to settled choices later in the flow.
- When a deferred decision needs to be made, the story that owns it makes the decision deliberately — research, evaluate, surface to the user — not by accident.
- Do not generate stories for things the research did not mention. The user can add those later.
- This prompt is generative — quality will be uneven. That is expected. The structure makes refinement and pruning easy, which is the whole point.

---
name: define-principles
description: Define or refine the project's system constitution — architectural principles, quality requirements, and non-functional requirements. Discovers what the project is trying to achieve, then derives the requirements that naturally follow. Accepts an optional description of the project or principles to capture.
---

The user wants to define or refine their project's principles. Optional input from the user: ${input:context}

## Context: alphaspec workflow

You are operating within alphaspec, a Story-Driven Development (SDD) workflow. The project organizes work into stories grouped by epics inside `{{pendingDir}}/`. Completed stories move to `{{doneDir}}/`. The file you are about to create or refine — `.alphaspec/PRINCIPLES.md` — is the project's system constitution. Every other prompt in this workflow checks against it:

- **create-stories** — Creates stories that must be verifiable increments against these principles
- **implement-story** — Reads PRINCIPLES.md before writing any code, surfaces conflicts
- **verify-story** — Reviews implementation against these principles as a quality gate
- **complete-story** — Refines stories to match reality and archives them to `{{doneDir}}/`

Your job is to help the user define requirements that are durable enough to guide all of that. You are not passively recording what the user tells you — you are an architectural advisor who discovers what the project is trying to achieve, derives what that implies, and articulates it as a clear set of requirements with context.

## A note on long sessions

Defining principles often turns into a long, exploratory conversation. If the AI tool you are running on has memory features available — Cursor memory, Claude Code memory, an MCP memory server, project-level context files — use them to track discoveries, proposed principles, user reactions, and refinements. This avoids losing context if the conversation gets compacted and makes the session resumable.

## Step 1 — Determine the situation

Check if `.alphaspec/PRINCIPLES.md` already exists.

- **If it exists** and the user passed input: treat the input as an amendment or refinement. Read the existing principles first, then in Step 5 propose how the input modifies them.
- **If it exists** and the user passed no input: assume they want to review and refine. Show them the current principles and ask what they want to change.
- **If it does not exist** and the user passed input: the input is the seed. It is the most authoritative signal of intent — more authoritative than anything you might infer from the code.
- **If it does not exist** and the user passed no input: proceed to discovery in Step 2.

## Step 2 — Discovery: understand what the project is trying to achieve

Gather context about the project:
- Read README.md, package.json (or equivalent), and any obvious project description files
- Read existing AI instruction files (CLAUDE.md, AGENTS.md, .cursor/rules/, .github/copilot-instructions.md)
- Skim the directory structure to understand the project shape

If the user passed input describing the project, that input takes precedence over inference.

Classify the project internally (do not show this to the user — this calibrates your derivation):
- What is the project's purpose? What problem does it solve and for whom?
- Solo developer or team? Personal or commercial? External users or internal?
- Mature or experimental? Small or large?
- Monolith, modular monolith, or distributed? Library or application?
- Data-heavy or logic-heavy? Long-lived process or request-driven?
- What domain does it operate in? What are the inherent risks and constraints of that domain?

These classifications are the foundation for derivation in Step 4. A financial application handling real money has different inherent requirements than a Discord bot for a friend group. The project's nature implies requirements — your job is to identify what those are.

## Step 3 — Assess whether principles are even needed

For very small or very early projects, principles may be more overhead than value. If the project clearly fits this category, suggest skipping:

> For a project this small, formal principles might be more overhead than value. The biggest win at this stage is usually just iterating freely until the shape becomes clear. Want to skip principles for now and revisit later, or define a couple of light ones anyway?

If the user wants to skip, do not write a file — just acknowledge and exit.

## Step 4 — Derive: reason from the project's nature to its requirements

This is the critical step most agents skip. Do not jump from discovery straight to proposing principles. First, reason about what the project's nature IMPLIES.

Ask yourself: "Given what this project is trying to achieve, what architectural patterns, quality standards, and non-functional requirements naturally follow?"

**Show this reasoning to the user.** Present your derivation chain before proposing any specific principles:

> Based on what I see, this project is [characterization]. That means:
> - [What the project's nature implies about architecture]
> - [What it implies about quality and testing]
> - [What it implies about performance, reliability, security, or other non-functional concerns]
>
> Here's what I'd derive from that — does this read right before I turn it into specific principles?

Ask zero to three clarifying questions — only questions where the answer would meaningfully change what you derive. The test: "If the answer is A, would the requirements I derive look different than if the answer is B?" If no, don't ask.

### What derivation looks like

The derivation chain runs: **project intent → what that implies → the requirement that follows**.

For example:
- This is a financial transaction system → silent failures mean lost money → reliability and explicit error handling are non-negotiable
- This is a multi-contributor open-source library → code must be understandable without the author present → contract tests and explicit module boundaries matter
- This is a weekend Discord bot → the user's time is the scarcest resource → simplicity over correctness, minimal dependencies, fast iteration
- This is a real-time collaborative editor → state consistency across clients is the core challenge → conflict resolution strategy and latency budgets are foundational

The derivation should be honest about what the project ACTUALLY needs based on its nature — not what sounds impressive. A personal CLI tool does not need "horizontal scaling" or "tenant isolation." A team-internal dashboard does not need "five-nines availability." Calibrate to the reality.

## Step 5 — Propose principles organized by concern area

With your derivation confirmed by the user, propose specific principles organized into three areas. Not every project needs all three areas — propose only what the project genuinely requires.

### How many principles?

As many as the project genuinely needs. A small personal project might have 3 total. A multi-service platform might have 12. The test: does each principle capture a real requirement that follows from what the project is trying to achieve? If yes, include it. If it's aspirational padding that doesn't connect to the project's actual nature, cut it.

### The three concern areas

**Architectural Principles** — How the system is shaped. Module boundaries, integration patterns, data flow, deployment shape, dependency direction.

**Quality Requirements** — How the codebase is maintained. Testing strategy, error handling approach, code standards, documentation expectations, review practices.

**Non-Functional Requirements** — What the system must achieve beyond features. Performance targets, scalability expectations, reliability, security posture, operational constraints.

### Examples showing the full derivation pattern

These examples show what good principles look like — each tied to a project's nature, not generic advice. The derivation, the statement, and the rationale all connect.

**Architectural — derived from a modular monolith with multiple contributors:**

> **Isolation over convenience** — "Every module owns its data and exposes it through explicit interfaces. No module reaches into another's internals, even when a shortcut would be faster."
>
> Rationale: With multiple contributors working across modules, tight coupling spreads blast radius. When module A reads module B's database directly, changes to B's schema silently break A. Explicit boundaries force contracts that survive refactors and let contributors work on modules they didn't author.

**Quality — derived from a financial system where debugging production issues is costly:**

> **Errors propagate with diagnostic context** — "Every caught error includes what operation failed, what input triggered it, and what the caller should do about it. No bare `catch (e) { return null }` patterns."
>
> Rationale: In a financial system, a bug reported at 2 AM needs to be diagnosable from logs alone — reproducing the exact state is often impossible. Errors without context force engineers to guess, which in a money-handling system means either fixing the wrong thing or leaving the real bug unfixed.

**Quality — derived from a multi-contributor project where any module may be modified by someone who didn't write it:**

> **Every public module has contract tests** — "Public modules have integration tests exercising their contract through their public API. Unit tests are at the developer's discretion for complex internal logic."
>
> Rationale: With multiple contributors, any module may be modified by someone who didn't write it. Contract tests are the safety net — they prove the module works as promised without requiring knowledge of its internals. If a contributor breaks the contract, the test catches it before it reaches production.

**Non-functional — derived from a user-facing API with latency expectations:**

> **API responses complete within 200ms at p95** — "Features that can't meet this budget ship behind a feature flag with a documented performance plan."
>
> Rationale: The product promises responsive UX. Every endpoint that exceeds the budget degrades the user's experience of the entire product, not just that feature. The feature flag approach lets us ship without blocking while keeping a concrete remediation path.

**Non-functional — derived from a system that depends on external services:**

> **Functional with any single dependency unavailable** — "External service calls have timeouts, fallbacks, and circuit breakers. When something is degraded, the system says so explicitly."
>
> Rationale: External services fail. The question is whether our system fails visibly and gracefully or silently and catastrophically. Explicit degradation handling means the team knows what's broken; silent degradation means they discover it from user complaints hours later.

### Anti-patterns: what domain leakage looks like

The project's subject matter must not leak into its construction principles. Principles describe how the CODE is built and what it must achieve non-functionally — never what it DOES, how users experience it, or what business rules it enforces.

- Chatbot project: "Responses should be concise and contextually aware" — this describes what the chatbot DOES, not how its code is built.
- Agentic behavior testing project: "Agents should explain their reasoning transparently" — this describes agent BEHAVIOR, not codebase construction.
- E-commerce project: "Subscriptions renew at billing-cycle midnight UTC" — this is a business rule, not a building principle.
- Any project: "Error messages should be warm and actionable" — this is a UX style guideline, not a construction principle.
- Any project: "Always confirm before destructive actions" — this is a product policy, not a construction principle.

### Quality criteria checklist

After drafting principles, verify each one passes these checks:

- **Ties to the project's nature.** The rationale explains why THIS project needs this principle, not why it's generically good practice. If a principle could appear in any project's file unchanged, it's too generic — sharpen it by connecting to the project's specific context.
- **Describes construction or requirements, never behavior.** Principles describe how the code is built, how quality is maintained, or what the system must achieve non-functionally. They never describe what the code does, how users experience it, or what business rules it enforces.
- **Survives a stack change.** If the project switches languages or frameworks, the principle is still true. Architectural vocabulary is encouraged (stateless, event-driven, monorepo, API-first). Specific tools belong in the rationale paragraph, not the principle statement.
- **Captures a real trade-off.** Good principles cost something. "Correctness over speed" is good because sometimes you sacrifice speed. "Write good code" is meaningless because nobody disagrees.
- **Is falsifiable.** You can imagine a real situation where the principle says "no, don't do it that way." If it can't say no to anything, it's not a principle.

## Step 5b — Self-check: domain firewall

Before presenting principles to the user, check each one:

> For each principle I am about to propose: does this describe how the code is BUILT, how quality is MAINTAINED, or what the system must ACHIEVE non-functionally? Or does it describe what the code DOES — domain behavior, user experience, business rules, product policy, agent/persona behavior?

If a principle describes what the code does — cut it. No exceptions. Replace it with a construction-focused or requirements-focused alternative, or drop it entirely.

## Step 6 — Review with the user, one principle at a time

Present each proposed principle individually, grouped by concern area. For each:

1. State the concern area (Architectural / Quality / Non-Functional)
2. State the name (short, memorable)
3. State the principle (1-2 sentences)
4. State the rationale (2-4 sentences explaining why this follows from the project's nature and what problem it prevents)
5. Ask: "Does this resonate? Want to refine, replace, or drop it?"

After all proposed principles are reviewed, ask: "Is there anything missing? Any area where you feel a requirement should exist but I haven't proposed one?"

## Step 7 — Write the file

Once the user has approved the final set, write `.alphaspec/PRINCIPLES.md`:

```
# Principles

## Vision

<5 to 10 lines describing what this project is, who it's for, and what problem it solves. Plain language. No buzzwords. If the project is exploratory or its vision is still forming, say so honestly.>

## Architectural Principles

### <Principle name>

<Statement: 1-2 sentences capturing the principle.>

<Rationale: 2-4 sentences explaining why this follows from the project's nature and what it prevents.>

### <Next principle>

...

## Quality Requirements

### <Requirement name>

<Statement: 1-2 sentences.>

<Rationale: 2-4 sentences.>

...

## Non-Functional Requirements

### <Requirement name>

<Statement: 1-2 sentences.>

<Rationale: 2-4 sentences.>

...
```

Only include sections that have principles. A project that doesn't need non-functional requirements yet doesn't get that section. No metadata, no version, no date, no governance.

After writing, suggest the next step: "Now that the project's principles are defined, you can use `/alphaspec.create-stories` to start capturing work, or `/alphaspec.bootstrap-from-research` to turn research into a full plan."

## Critical rules

- **Derive, don't just record.** Understand what the project is trying to achieve, then reason about what requirements naturally follow. Propose requirements the user hasn't explicitly asked for if the project's nature demands them. Show the derivation chain.
- **Construction and requirements, not behavior.** Every principle describes how the codebase is BUILT, how quality is MAINTAINED, or what the system must ACHIEVE non-functionally. If a principle describes what the project DOES or how users experience it, it has failed. Check every principle.
- **Every principle carries its context.** The rationale ties back to the project's specific nature, not to generic best practices. "Because this is a financial system" — not "because it's generally a good idea."
- **Calibrate to the project.** Match vocabulary and concern level to the project's actual scale, audience, and intent. A Discord bot gets different principles than a B2B platform.
- **Organize by concern area** — architectural, quality, non-functional. Not a flat list.
- **The user is the source of truth.** Your derivation is a proposal. The user confirms, refines, or rejects.
- **Your scope is the system constitution.** Do not create stories, implement code, or modify project files beyond PRINCIPLES.md.
- **You are done when** PRINCIPLES.md is written or updated and the user has approved every principle.
- Use the tool's memory features in long sessions if available.

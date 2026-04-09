---
name: define-principles
description: Create or refine the project's principles file. Principles are durable guidance about how decisions get made — not implementation details. Accepts an optional description of the project or principles to capture.
---

The user wants to define or refine project principles. Optional input from the user: ${input:context}

## A note on long sessions

Defining or refining principles often turns into a long, exploratory conversation. If the AI tool you are running on has memory features available — Cursor memory, Claude Code memory, an MCP memory server, project-level context files the tool maintains automatically — use them throughout this session to track:

- Discoveries about the project that came up in the discussion
- Principles that have been proposed and the user's reaction to each
- Refinements the user requested but you haven't applied yet
- Things the user said they wanted to come back to later

This avoids losing context if the conversation gets compacted, and it makes the session resumable if the user steps away. If no memory features are available, just be careful to summarize the state of the discussion periodically so the user can recover quickly if anything is lost.

## Step 1 — Determine the situation

Check if `.alphaspec/PRINCIPLES.md` already exists.

- **If it exists** and the user passed input: treat the input as an amendment or refinement. Read the existing principles first, then in Step 5 propose how the input modifies them.
- **If it exists** and the user passed no input: assume they want to review and refine. Show them the current principles and ask what they want to change.
- **If it does not exist** and the user passed input: the input is the seed. It is the most authoritative signal of intent — treat it as such, more authoritative than anything you might infer from the code.
- **If it does not exist** and the user passed no input: proceed to discovery in Step 2.

## Step 2 — Discovery (only if you need it)

Gather context about the project:
- Read README.md, package.json (or equivalent), and any obvious project description files
- Read existing AI instruction files (CLAUDE.md, AGENTS.md, .cursor/rules/, .github/copilot-instructions.md)
- Skim the directory structure to understand the project shape

If the user passed input describing the project, that input takes precedence over inference.

Classify the project internally (do not show this to the user, it just calibrates your vocabulary):
- Is this a commercial product or a personal project?
- Solo developer or team?
- Has external users or just the author?
- Mature or experimental?
- Small (single-purpose script, bot, weekend project) or large (multi-module application, platform)?

This classification governs what vocabulary you use. A Discord bot for a friend group does not need principles about "tenant isolation" or "SLA". A B2B SaaS does not need principles about "fun". Calibrate.

## Step 3 — Assess whether principles are even needed

For very small or very early projects, principles may be overkill. If the project clearly fits this category, suggest skipping:

> For a project this small, formal principles might be more overhead than value. The biggest win at this stage is usually just iterating freely until the shape becomes clear. Want to skip principles for now and revisit later, or define a couple of light ones anyway?

If the user wants to skip, do not write a file — just acknowledge and exit.

## Step 4 — Ask only the questions that would change your output

Do NOT do an interview. Most projects need zero clarifying questions. Some need one or two. Almost none need more than three.

The test for whether to ask a question: "If the answer is A, would the principles I propose look meaningfully different than if the answer is B?" If no, don't ask.

For example, for a Discord trivia bot for a friend group, you do not need to ask "how many friends" or "who picks the trivia questions" — those answers do not change the principles. You might ask one question if there's a real fork: "Is the goal that the bot is fun and stable for years, or are you mainly using this to learn how to build Discord bots?" Those two answers produce genuinely different principles.

Ask at most three questions. Then proceed regardless.

## Step 5 — Propose principles

Propose 2 to 6 principles. Honestly. If you only have enough clarity for 2, propose 2 and say so:

> Here are the principles that feel solid based on what I know. We can add more once the project's direction sharpens.

**Quality bar for each principle:**

- **Survives a stack change.** If the project switches from Node to Python, the principle is still true. Do NOT mention specific technologies, framework names, library names, function names, or file paths in the principle's statement. Tech examples are allowed in the rationale paragraph if they help illustrate, but the statement itself must be tech-agnostic.
- **Survives a code reorganization.** If the folder structure changes, the principle is still true.
- **Is about how to decide, not what to decide.** "Prefer reversible decisions" is a principle. "Use feature flags for new features" is a rule.
- **Is about what matters, not what to measure.** "Failures must be visible, not silent" is a principle. "All errors must log to Sentry" is implementation.
- **Captures a real trade-off.** Good principles cost something. "Correctness over speed" is good because sometimes you'll sacrifice speed. "Write good code" is meaningless because nobody disagrees.
- **Is falsifiable.** You should be able to imagine a real situation where the principle says "no, don't do it that way." If it can't say no to anything, it's not a principle.

**Anti-patterns to avoid:**

- Do NOT generate principles that could fit any project.
- Do NOT borrow vocabulary from enterprise or B2B contexts unless the project actually has those concerns. Words like "stakeholders", "compliance", "SLA", "tenants", "production" are warning signs for projects that don't operate at that level.
- Do NOT propose principles aspirationally — only principles that reflect how the user actually wants to work.
- Do NOT propose principles that prescribe specific tools, libraries, file layouts, or naming conventions.
- Do NOT include semver, ratification dates, governance sections, or any bureaucratic metadata.

## Step 6 — Review with the user, one principle at a time

Present each proposed principle individually. For each:

1. State the name (short, ideally memorable)
2. State the principle (1-2 sentences)
3. State the rationale (2-4 sentences explaining the why and what problem it prevents)
4. Ask: "Does this resonate? Want to refine, replace, or drop it?"

After all proposed principles are reviewed, ask if there's anything missing.

## Step 7 — Write the file

Once the user has approved the final set, write `.alphaspec/PRINCIPLES.md`:

```
# Principles

## Vision

<5 to 10 lines describing what this project is, who it's for, and what problem it solves. Plain language. No buzzwords. If the project is exploratory or its vision is still forming, say so honestly.>

## Principles

### <Principle name>

<Statement: 1 to 2 sentences capturing the principle>

<Rationale: 2 to 4 sentences explaining the why and what it prevents.>

### <Next principle name>

...
```

No headers other than these. No metadata. No version. No date. No governance section.

## Critical rules

- Calibrate to the project. Different vocabulary and concerns for different scales.
- Prefer fewer, sharper principles over more, weaker ones.
- Honesty about ambiguity is more valuable than false certainty.
- Use the tool's memory features in long sessions if available.
- The user is the source of truth.

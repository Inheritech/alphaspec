---
name: refine-story
description: Audit an alphaspec story against a finite, falsifiable rubric — INVEST with operational definitions, scope clarity, and business intent. Each check is binary. The skill terminates when all checks pass. Improves the story as a spec; never reaches into implementation territory.
---

Refine the story at: ${input:storyFile}

## Context: alphaspec workflow

You are operating within alphaspec, a Story-Driven Development (SDD) workflow. Stories in `{{pendingDir}}/` flow through: **create-stories → refine-story (optional) → implement-story → verify-story → complete-story**.

**Your role in this workflow:** Refine-story is a quality gate between story creation and implementation. It runs a finite rubric against the story and surfaces specific, fixable failures. It does not anticipate what implementation will need — that is implement-story's job. It does not improve the story beyond passing the rubric — it is a quality bar, not a perfection engine.

## What this skill does — and what it does NOT do

This is the most important section of this prompt. Internalize it before running anything.

### What this skill DOES

* **Audits the story as a spec.** Every check examines whether the story, as written, satisfies a quality criterion that makes it a good spec. The subject is the story's text, not the system being built.
* **Runs a finite, binary rubric.** Each check has a single operational definition and a pass/fail outcome. There are no "consider this" or "could be better" findings.
* **Recovers business intent when it has been lost.** When a story was originally written in implementation terms and the business outcome is unclear, the skill runs a 5 Whys dialogue with the user to recover the capability behind the implementation, then helps refactor the story into proper spec language.
* **Terminates.** When every check in the rubric passes, the skill declares convergence and exits. Running the skill on a converged story produces the same result every time: "All checks pass. No refinement recommended."

### What this skill does NOT do

* **Does not anticipate implementation gaps.** "What if the API call fails?", "What about rate limiting?", "What error message should we show?" — these are implementation questions. They surface during implement-story, where the engineer can reason about them in context. Refine-story does not invent them. If an implementation question genuinely belongs in the spec (because the answer is a business decision, not a technical one), it appears as a failure of the **V** or **T** check — not as a separate "edge case" finding.
* **Does not invent non-functional requirements.** Performance, security, accessibility constraints belong in the story only when PRINCIPLES.md or the user explicitly requires them. If they are missing and PRINCIPLES.md doesn't constrain them, that is not a refinement failure — that is the absence of a constraint, which is fine.
* **Does not surface "optional" or "nice-to-have" findings.** Every output is a binary check failure with a concrete fix. No subjective tier exists.
* **Does not improve a passing story.** If the rubric passes, the skill does not look for ways to make the story "better". A story that meets the bar is done. The user moves on to implement-story.

The most common failure mode of a refinement skill is unbounded gap-hunting: always finding something more that "could be added". This skill is designed to terminate. If you find yourself reaching for findings to surface beyond the rubric, stop — the rubric defines the bar.

## Convergence guarantee

The skill must produce stable results: running it twice in a row on the same story (with no edits in between) must produce identical output. Running it after applying its own recommendations must, eventually, produce the convergence message.

This is enforced by the rubric: every check has a binary pass criterion grounded in what is present or absent in the story file. There is no check whose pass criterion depends on subjective judgment about quality, completeness, or thoroughness beyond what the rubric specifies.

When the skill outputs a recommendation, the recommendation must be specific enough that the user (or implement-story) can apply it and the next run will see the check as passing. Vague recommendations break convergence.

## Anti-assumption protocol: the AI surfaces, the user decides

This skill is collaborative by design. The AI does not solve problems for the user — it surfaces problems for the user to solve. This applies across the entire rubric, and is especially critical for checks that involve interpretation (V, T, Out of Scope, Business intent).

### Two failure modes to avoid

**1. Assumption masquerading as check pass.** The AI silently fills a gap in the story with its own model of how things "usually work" and reports the check as passing. The story still has the gap; the AI just hid it. This is the failure mode that makes the Estimable check meaningless if not externalized: an AI can technically estimate anything by filling assumptions invisibly.

**2. Interpretation masquerading as user input.** The AI infers what the user meant — from the implementation in the story, from context, from priors — and reports the inference as the recovered intent without ever asking. The story's actual business outcome may be entirely different from what the implementation suggested. This is especially dangerous during 5 Whys recovery: the whole point of recovery is that the implementation may not reflect the real intent. If the AI uses the implementation as evidence about the intent, the recovery is poisoned at the source.

Both poison refinement. The fix is the same: externalize, then collaborate.

### Rules that follow from the protocol

* **Externalize every assumption.** When applying a check requires interpretation or gap-filling, list the assumptions explicitly in the audit output. Each assumption is a candidate finding: the user can confirm it (becomes part of the story) or correct it (the story is wrong about the AI's mental model). Assumptions that stay in the AI's head do not count.
* **Never use the implementation in the story as evidence about the outcome.** If the story says "add an /api/auth/refresh endpoint", the implementation does not tell you what the user actually needs — that is exactly what 5 Whys recovers. Treat any implementation language in a story as a *symptom* of someone's idea, not as evidence of underlying business intent.
* **Propose, don't dictate.** When you draft a fix (a refined Description, a Given/When/Then for a non-falsifiable AC, an Out of Scope candidate, a domain-vocabulary replacement), present it as a proposal. The user accepts, modifies, or rejects.
* **Termination of 5 Whys is proposed, not declared.** When the user's answer reaches what looks like a root, do not silently stop. Say: "This sounds like it lands on [metric / hard constraint / strategic capability]. Is that the outcome you want anchored in the story?" and wait for confirmation.
* **Ambiguity is a stop signal, not an interpretation prompt.** If the user's answer is unclear, ask a clarifying follow-up. Do not paraphrase aggressively or "fill in" what they probably meant.

The AI's job is to make the story's quality state visible. The user's job is to make decisions about that state. Mixing those roles produces the failure modes above.

## The rubric

There are 8 checks. The first (V) gates the rest because if business intent is unclear, the other checks are premature. Run V first; if it fails, do 5 Whys recovery before running the rest.

### Check 1 — V (Valuable)

**Operational definition:** the Description names a business outcome — a measurable improvement, a capability the user gains, a problem solved, a constraint satisfied. The "so that" of the classic story format must be implicit or explicit. The outcome is something a product owner cares about, not just something the system does.

**Pass criterion:** reading only the Description, you can answer "what does the user (or the business) gain when this story ships?" with a sentence that names an outcome, not a feature. "Users gain the ability to recover from forgotten passwords without creating a support ticket" passes. "The system has a password reset endpoint" fails.

**Common failures:**
* Description states a capability without a why ("the inventory service tracks ticket counters")
* Description is purely technical ("the system has a /api/x/y endpoint that does Z")
* Description uses evocative prose that sounds profound but doesn't state an outcome ("the platform stops lying to attendees")

**Fix when failed:** trigger Step 3 (5 Whys recovery) to walk back from whatever is in the Description to a root business outcome. Rewrite the Description anchored on that outcome.

### Check 2 — I (Independent)

**Operational definition:** the story can be implemented and shipped without depending on the implementation choices of other stories. Dependencies on capabilities provided by other stories are fine — and necessary; dependencies on the implementation of those capabilities are not.

**Pass criterion:** every entry in the Related / Depends on section references a capability in domain language and names which story provides it. The story does not assume the existence of specific code shapes, RPCs, schemas, or libraries from another story.

**Common failures:**
* `Depends on: story-01-auth` with no description of what auth capability is needed
* AC or Description silently assumes the existence of an upstream RPC / endpoint / table by name
* Story references a piece of infrastructure that is established by another story without naming the capability

**Fix when failed:** rewrite each dependency as `Depends on capability: <description>. Provided by story-XX-name`. The capability description must be sourced from the upstream story's Description and AC, never from its Implementation Hints.

### Check 3 — N (Negotiable)

**Operational definition:** spec sections (Description, Acceptance Criteria, Out of Scope) are written in domain vocabulary. Implementation choices are either absent or live in the explicitly non-binding Implementation Hints section. The story is a contract for capability, not a contract for code shape.

**Pass criterion:** the vocabulary fence scan returns zero violations in Description, Acceptance Criteria, and Out of Scope. Forbidden term categories include but are not limited to:
* Transport / protocol: RPC, gRPC, REST, endpoint, route, payload, request, response, header, status code
* Auth / crypto mechanisms: JWT, HMAC, signing key, public/private key, bearer token, hash
* Runtime / process: timer, cron, scheduler, in-process, worker, thread, async, queue, retry
* Storage / infra: Redis, Postgres, table, column, schema, index, cache, TTL, bucket
* State / health: state machine, FSM, UNAVAILABLE, SERVING, health check, readiness probe
* Library / framework names: any specific tool, SDK, or framework

**Common failures:**
* Description includes implementation sketch ("the service exposes an AcquireLock RPC that returns a JWT")
* AC describes mechanism instead of behavior ("health endpoint flips from UNAVAILABLE to SERVING after rebuild")
* Out of Scope references implementation surfaces instead of capabilities

**Fix when failed:** for each violation, rewrite in domain vocabulary. If the implementation thought is genuinely useful as a reference, move it to a new or existing Implementation Hints section with the non-binding preamble.

### Check 4 — E (Estimable)

**Operational definition:** the story does not require the reader to fill in mental gaps about WHAT is being delivered. A reader can answer questions about scope, included behaviors, and observable outcomes by reading the story alone — not by inferring from context or applying their own model of "how this usually works".

This check is intentionally framed as an assumption-detection check, not as a "can you estimate" check. An AI (or a confident engineer) can technically estimate anything by silently filling gaps with plausible defaults. The point of this check is to find the gaps before they get silently filled. The check passes only when the AI has externalized every WHAT-gap it found and that list is empty.

**Pass criterion:** when running this check, produce an explicit list of WHAT-assumptions you would need to make to fully understand the story. The list must be written out as part of the audit output, not left in your head. The check passes if and only if the externalized list is empty.

WHAT-assumptions cover scope, behavior, included/excluded cases, and observable outcomes. They are about what the story promises to deliver. Examples that count against this check:
* "I had to assume multiple filters combine with AND, not OR" — affects observable behavior
* "I had to assume the notification channel is email, not SMS or in-app" — affects what the user receives
* "I had to assume the action requires a confirmation step before committing" — affects user flow
* "I had to assume free-tier users are excluded from this capability" — affects scope

HOW-assumptions are explicitly out of scope for this check — those are implement-story's concerns. Examples that do NOT count against this check:
* "I had to assume we'd use a database index for fast lookup" — implementation
* "I had to assume the data is cached server-side" — implementation
* "I had to assume we'd use library X" — implementation
* "I had to assume the response is JSON" — implementation

**Common failures:**
* AC says "user can filter results" without specifying combination logic — WHAT-assumption needed
* AC says "send a notification" without channel — WHAT-assumption needed
* Description says "user can configure preferences" without naming which preferences are included — WHAT-assumption needed
* AC says "an admin can manage users" without listing what manage means — WHAT-assumption needed

**Fix when failed:** for each externalized WHAT-assumption, surface it as a question to the user: "I had to assume [X]. Is [X] part of the story, out of scope, or different from what I assumed?" The user's answer determines the outcome — assumption confirmed becomes a new AC, assumption rejected becomes an Out of Scope item or a corrected AC. Do not resolve the assumption yourself.

### Check 5 — S (Small)

**Operational definition:** the story is the smallest verifiable increment that delivers user-visible value. Bundles of multiple outcomes that could each ship and verify on their own should be split.

**Pass criterion:** running the create-stories Step 2 split heuristics (conjunction test, AC clustering, smallest verifiable increment, implementation surface) produces no recommended split.

**Common failures:**
* Description has multiple unrelated features joined by "and"
* AC clusters into 2+ distinct functional groups with no overlap
* Story would take more than ~1 week of confident implementation effort

**Fix when failed:** propose a split following the create-stories Step 2 format. Do not split silently — surface the proposed split as a finding.

### Check 6 — T (Testable)

**Operational definition:** every acceptance criterion is falsifiable. It can be expressed as Given [precondition] / When [action] / Then [measurable result]. The explicit Given/When/Then prose is optional; the falsifiability is not.

**Pass criterion:** for each AC, you can mentally draft a Given/When/Then with a measurable Then. If you cannot, the AC is evocative prose, not a criterion.

**Common failures:**
* "The service is reliable" — what does reliable mean operationally?
* "Users have a smooth experience" — subjective
* "The platform is operable during a live onsale" — what behavior, measured how?
* "Errors are handled gracefully" — what behavior, observable how?

**Fix when failed:** for each non-falsifiable AC, draft a falsifiable replacement and propose it. If the original was so vague that you cannot infer the intended behavior, mark it as needing user input.

### Check 7 — Out of Scope completeness

**Operational definition:** the Out of Scope section explicitly lists at least two concrete capabilities or behaviors that this story does not deliver. Items must be specific enough that a reader cannot mistakenly assume they are included.

**Pass criterion:** Out of Scope section exists, contains ≥2 items, and each item is concrete (names a specific capability, edge case, or adjacent concern). Vague items like "anything not listed above" or "additional features" do not count.

**Common failures:**
* Section is missing entirely
* Section has only one item or zero items
* Items are vague ("other use cases", "additional flows")

**Fix when failed:** generate concrete Out of Scope candidates by examining the story's Description and AC, then proposing capabilities or behaviors that a reasonable reader might assume are included but aren't. Surface 3-5 candidates to the user; let them pick the ones that genuinely matter.

### Check 8 — Business intent clarity

**Operational definition:** the story's purpose can be traced to a root business outcome in 5 or fewer "why?" iterations without circularity. A root business outcome is one of:
1. A measurable metric (revenue, retention, conversion, error rate, time-to-X, support cost, satisfaction score)
2. A hard constraint (regulatory, contractual, physical, security)
3. A strategic capability that is itself unambiguous (e.g., "users have an account" is a fundamental of an account-based system; further "why" is tautological)

**Pass criterion:** starting from the Description, you can ask "why does this matter?" up to 5 times and reach a root within that limit. If the chain becomes circular before reaching a root, the check fails.

This check is closely linked to V (Valuable). V passes if the Description names *an* outcome; this check passes if the outcome traces to a root. A story can pass V with a shallow outcome ("users can reset their password") and fail this check if asking "why does that matter?" produces no root in 5 hops.

**Common failures:**
* Story exists for technical reasons not connected to user / business value ("we need this because the architecture requires it")
* Story is a means to a means with no end visible within 5 hops
* The chain becomes circular ("users need it because it's needed")

**Fix when failed:** trigger Step 3 (5 Whys recovery) with the user. Capture the root in the Description, optionally as a "Business intent" subsection or a final "so that" clause.

## Step 1 — Ground yourself

Read the story file. Then:

* Read `.alphaspec/PRINCIPLES.md` if it exists — it informs which non-functional requirements legitimately belong in this story
* Read any files listed under `### Sources` in the story notes
* Read any `### Artifacts` transcriptions in the story notes
* Read the parent epic's `_epic.md` to understand the broader capability the story contributes to

You are NOT reading these to find more gaps. You are reading them to apply the rubric correctly — to know what dependencies are legitimate (vs. assumed), what capability the story contributes to, and what principles constrain it.

## Step 2 — Run V first

Apply Check 1 (Valuable) and Check 8 (Business intent clarity) before anything else. If V fails, or if Check 8 fails, the rest of the rubric is premature — you cannot meaningfully audit a story whose business intent is unclear.

If V passes and Check 8 passes, proceed to Step 4.
If either fails, proceed to Step 3.

## Step 3 — 5 Whys recovery (only if V or Check 8 failed)

Engage the user in a 5 Whys dialogue. The goal is to recover the business outcome behind whatever is currently in the story.

### Protocol

1. State what you observed: "The Description currently reads as [implementation / shallow outcome / circular]. Let me ask a few questions to recover the business intent. I'll be asking only — your answers are what we anchor on."

2. **Do not pre-fill answers.** Any implementation language present in the story is a starting point for asking, not evidence about what the user actually needs. The whole point of recovery is that the implementation may not represent the real intent — using it to infer the intent poisons the recovery.

3. Ask why 1: "Why does this story matter? What does the user or the business gain when it ships?"

4. **Capture the user's answer close to verbatim.** Do not paraphrase aggressively. If the user uses specific words, those words carry information you should preserve.

5. **If the answer is ambiguous, ask a clarifying follow-up rather than guessing.** "When you say [X], do you mean [option A] or [option B]?" — and only after the user clarifies, evaluate against termination criteria.

6. Apply the termination criteria below to the user's answer. **If you think a root has been reached, propose it — do not declare it.** Say: "This sounds like it lands on [metric / hard constraint / strategic capability]. Is that the outcome you want anchored in the story?" Wait for the user's confirmation. Only when the user confirms is the root recorded.

7. If the root is not yet reached (or the user rejects your proposed termination), ask why 2: "Why does [the user's previous answer] matter?"

8. Continue, up to 5 iterations. Five is the ceiling, not the target — terminate as soon as the user confirms a root.

### Termination criteria — when to stop asking

Stop and record the root the moment any of these are satisfied:

1. **Metric reached.** The user's answer references a measurable business metric: revenue, retention, conversion, abandonment, error rate, time saved, support cost, satisfaction.
2. **Hard constraint reached.** The answer references a regulatory requirement, contractual obligation, security need, or physical limitation.
3. **Strategic capability reached.** The answer is unambiguous and asking "why?" again would produce a tautology ("because that's what the product fundamentally is"). For example: "users have accounts" → "why?" → "because the product is account-based" — tautological, you've reached the root.

If 5 iterations pass and none of these are satisfied, surface this to the user: "After 5 iterations we haven't reached a root business outcome. This may indicate that the story is built on an unclear assumption. Could you state, in one sentence, the metric or constraint this story ultimately serves?"

### Example chain

This example illustrates one possible chain. It is not a template — every story will produce a different chain because the user's actual answers drive it. The AI asks; the user answers; the AI proposes termination; the user confirms.

Story Description (currently): "Add a /api/auth/refresh endpoint that returns a new access token given a valid refresh token."

* AI asks why 1: "Why does this story matter? What does the user or the business gain when it ships?"
* User answers: "Users need to stay logged in without re-entering credentials."
* AI asks why 2: "Why does that matter?"
* User answers: "Otherwise their access token expires and they get logged out mid-task, losing context."
* AI asks why 3: "Why does that matter?"
* User answers: "It causes lost work, abandoned forms, and a productivity hit."
* AI asks why 4: "Why does that matter?"
* User answers: "Higher abandonment rate, more support tickets, lower satisfaction."
* AI proposes termination: "This sounds like it lands on measurable metrics — abandonment, support cost, satisfaction. Is that the outcome you want anchored in the story?"
* User confirms: "Yes."

Root (confirmed by user): "preserve user productivity by keeping work sessions alive without forcing manual reauthentication, reducing abandonment and support burden."

Refined Description (proposal to user, awaiting approval): "Users continue working without being forced to re-authenticate during normal sessions, eliminating the productivity loss and support burden caused by mid-task session expiry."

The original implementation idea (refresh token endpoint) is proposed for Implementation Hints with the non-binding preamble. The user can accept, reject, or rewrite either the refined Description or the Implementation Hints content.

A different user might give entirely different answers and reach a different root — for instance, a security-focused root ("we need short-lived access tokens to limit blast radius of leaks") or a regulatory root ("compliance requires session timeouts of N minutes"). The AI cannot pre-determine which chain is correct; only the user can.

### What to do with the recovered intent

Propose:
1. A rewritten Description anchored on the root outcome
2. Moving the original implementation language (if any) to Implementation Hints with the non-binding preamble
3. Optionally, an explicit "Business intent" subsection inside Description that captures the root in one sentence (helpful for stories where the why is non-obvious to readers)

Wait for user approval before applying.

## Step 4 — Run the remaining rubric

With V and Check 8 passing, run Checks 2 through 7 (I, N, E, S, T, Out of Scope). For each, apply the operational definition and record pass / fail.

For each FAILURE, draft a specific, applicable fix following the "Fix when failed" guidance for that check. The fix must be concrete enough that, once applied, the next run of the skill will see the check passing.

## Step 5 — Surface findings

If all checks passed, output exactly this and stop:

> **All 8 rubric checks pass. Story is refined and ready for implement-story.**
>
> No further refinement recommended.

If one or more checks failed, output the findings using this format:

---

## Refinement findings: <story title>

### Failed checks

For each failed check:

> **Check N — [name]: FAIL**
>
> What was found: [specific, concrete statement of what in the story violates the check]
>
> Recommended fix: [specific, applicable fix — text to add, text to remove, text to rewrite]
>
> After applying: this check will pass.

### Atomicity verdict (only if Check 5 — S — failed)

Split recommended — [reason]. Proposed breakdown:
1. [Story A title] — [what it covers]
2. [Story B title] — [what it covers]

### Business intent recovery summary (only if Step 3 ran)

Original Description: [quoted]
Recovered root: [one sentence]
Proposed refined Description: [text]
Implementation language to move to Implementation Hints: [list]

---

Ask the user: "Apply these fixes? You can accept all, accept some, or reject any. Rejected findings will appear again on the next run unless you also update PRINCIPLES.md or change the story to clearly resolve them."

## Step 6 — Apply approved changes

For each approved finding, edit the story file directly:

* **Vocabulary fence violations** — replace forbidden terms with domain vocabulary; move implementation thoughts to Implementation Hints with the non-binding preamble
* **Falsifiability fixes** — replace evocative AC text with the proposed Given/When/Then-expressible version
* **Capability dependencies** — rewrite Related / Depends on entries to reference capabilities in domain language
* **Out of Scope additions** — add the approved items to the section
* **Business intent recovery** — replace Description with the proposed refined version; create or extend Implementation Hints
* **Split** — create the new story files following create-stories template, update parent epic's `_epic.md`, archive or rename the original

After applying, confirm: "Updated story. Re-running rubric will confirm convergence."

## Step 7 — Re-run check (optional but recommended)

After applying changes, run the rubric one more time mentally. Confirm that every previously-failing check now passes. If any still fails, surface that to the user — the fix may have been incomplete, or applying one fix may have surfaced an issue masked by another.

If all checks pass, output the convergence message:

> **All 8 rubric checks pass. Story is refined and ready for implement-story.**
>
> No further refinement recommended.

## Critical rules

* **The rubric is the bar.** A story passing the rubric is refined. The skill does not look beyond the rubric for additional findings. There is no "could be better" tier.
* **Every output is a check failure with a concrete fix, or a convergence message.** No vague suggestions, no "consider this", no implementation gap-hunting.
* **The AI surfaces, the user decides.** Every interpretation, every fix proposal, every termination of 5 Whys is presented as a proposal awaiting user confirmation. The AI never silently assumes, never silently fills gaps, never silently declares a root reached. Mixing the surface-the-problem role with the make-the-decision role poisons refinement.
* **Externalize WHAT-assumptions for the Estimable check.** Produce an explicit, written-out list. The check passes only if the list is empty. Silent gap-filling makes the check meaningless.
* **Never use the implementation in the story as evidence about the outcome.** Implementation language in a story is a symptom of someone's idea, not evidence of underlying business intent. During 5 Whys recovery especially: ask the user, do not infer from the implementation.
* **Do not invent implementation gaps.** Edge cases, error handling, performance, security — these are implementation concerns unless PRINCIPLES.md or the user explicitly elevates them to spec. If a story does not specify what happens when an external call fails, that is fine. Implement-story handles it.
* **5 Whys runs only when V or Check 8 fails.** It is recovery, not routine. A story that passes V and Check 8 already has clear business intent — running 5 Whys on it is a waste of the user's time.
* **5 Whys terminates by criterion, not by count.** Stop when the user confirms the answer reaches a metric, hard constraint, or strategic capability. Five iterations is the ceiling, not the target.
* **Never apply changes speculatively.** Surface findings, wait for user approval, then apply.
* **Convergence is the success state.** A story that passes all checks is the goal. Do not hunt for additional findings to feel productive — the skill's job is to enforce the bar, not to maximize edits.
* **Stability over thoroughness.** If you are tempted to add a check or a finding that does not have a clear binary pass criterion, do not add it. Ambiguous checks break convergence. The user will run implement-story; that is where deeper questions surface naturally.
* **Story-as-spec, not system-as-built.** Every check examines the story's text. None examines the system being built. If a finding requires reasoning about what the implementation will do, it does not belong here.
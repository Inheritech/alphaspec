<p align="center">
  <img src="https://raw.githubusercontent.com/inheritech/alphaspec/main/assets/logo.png" alt="alphaspec" width="200">
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/alphaspec"><img src="https://img.shields.io/npm/v/alphaspec.svg" alt="npm version"></a>
  <a href="https://github.com/inheritech/alphaspec/actions/workflows/ci.yml"><img src="https://github.com/inheritech/alphaspec/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
</p>

<p align="center">Story-driven development for AI-assisted projects, without the process overhead.</p>

## What is alphaspec

`alphaspec` brings story-driven development into your repo without adding process overhead. It's aimed primarily at solo developers and small teams who want a lightweight way to organise ideas before and during implementation.

Work is grouped into **epics** (collections of related ideas) and **stories** (individual pieces of work). The terms come from SDD, but without the bureaucratic overhead — no estimation, no standups, no product owner, no ticket hierarchy. You use them because the structure is useful, not because a process demands it.

Everything is plain markdown in your repo. Your AI coding tools read it as context. `alphaspec` sets up the folders, installs prompts into whichever tools you already use, and stays out of the way.

## Install

```bash
npm install -g alphaspec
# or
pnpm add -g alphaspec
```

## Quick start

```console
$ cd my-project
$ alphaspec init
◆  Which AI tools would you like to configure?
│  ◼ Claude Code  (detected)
│  ◼ GitHub Copilot  (detected)
│  ○ Cursor
│  ○ Windsurf
│  ○ Cline
│
✔  Claude Code configured
✔  GitHub Copilot configured
✔  AGENTS.md written
✔  Done — pending/ and done/ are ready
```

Configure non-interactively with `--tools`:

```bash
alphaspec init --tools claude-code,github-copilot
alphaspec init --tools all --yes   # all tools, skip prompts
alphaspec init --tools none        # folder structure only, no tool configuration
```

## How it works

Work lives in `pending/` and `done/` at the root of your project — plain markdown that your AI tools can read as context.

```
pending/
  01-auth/
    _epic.md
    story-02-password-reset.md   ← what to build and why

done/
  01-auth/
    story-01-login-flow.md       ← completed, with implementation notes appended
```

The workflow:

1. **Create a story** — capture what you want to build and why, grouped under an epic
2. **Implement** — use the `implement-story` prompt to guide the AI through the work
3. **Complete** — run `complete-story` to append implementation notes and move it to `done/`

`done/` builds up over time into a record of decisions and approaches — long-term memory the AI references on future work.

If you use other AI tools for research (Perplexity, ChatGPT, dedicated research agents), the `bootstrap-from-research` prompt lets you bring that output in and convert it into a set of epics and stories. You pick what to keep, discard what doesn't fit, and have a working starting point without having to translate research into tasks by hand. Useful for spinning up a PoC quickly from a research spike.

alphaspec works with any combination of tools. Run `alphaspec init --tools none` to skip tool configuration entirely and just get the folder structure.

## AI tool setup

alphaspec installs the same five prompts into each configured tool. From there, you invoke them natively inside whatever tools you already have open.

### Claude Code

**Files written:** `.claude/skills/<prompt>/SKILL.md` per prompt · `CLAUDE.md` updated

Prompts are available as slash commands:

```
/create-story
/implement-story
/complete-story
/define-principles
/bootstrap-from-research
```

### Cursor

**Files written:** `.cursor/commands/<prompt>.md` per prompt · `.cursor/rules/alphaspec.mdc`

Reference prompts in Composer with `@` or open the Command Palette and search by name. The rules file loads workflow context into every Cursor session automatically.

### Windsurf

**Files written:** `.windsurf/workflows/<prompt>.md` per prompt · `.windsurf/rules/alphaspec.md`

Open the Cascade panel and select a workflow from the workflow picker. The rules file is picked up automatically by Cascade.

### GitHub Copilot

**Files written:** `.github/skills/<prompt>/SKILL.md` per prompt · `.github/prompts/<prompt>.prompt.md` per prompt · `.github/copilot-instructions.md` updated

Reference a prompt in Copilot Chat with `#`:

```
#create-story
#implement-story
```

Skills in `.github/skills/` are loaded automatically in Copilot agent mode.

### Cline

**Files written:** `.clinerules/prompts/<prompt>.md` per prompt · `.clinerules/alphaspec.md`

Reference a prompt by name in Cline chat. The rules file is picked up automatically from `.clinerules/`.

## Prompts

| Prompt | What it does |
|--------|-------------|
| `create-story` | Creates a new story in a new or existing epic |
| `complete-story` | Refines a story and archives it to `done/` |
| `implement-story` | Guides implementation of a specific story |
| `define-principles` | Captures engineering principles into `.alphaspec/PRINCIPLES.md` |
| `bootstrap-from-research` | Seeds the project workflow from a research document |

Prompt source files are stored in `.alphaspec/prompts/`. Edit them there to customise the workflow for your project.

## CLI reference

### `alphaspec init`

```bash
alphaspec init [options]
```

Interactive. Detects which AI tools are present and pre-selects them. Running `init` again on an existing project only adds new tools — use `--force` to overwrite.

| Flag | Description |
|------|-------------|
| `-t, --tools <list>` | Comma-separated tool IDs, `all`, or `none`. Skips the prompt. |
| `-f, --force` | Overwrite existing configuration. |
| `-y, --yes` | Skip interactive prompts (auto-selects detected tools). |
| `-d, --dir <path>` | Target directory (defaults to `cwd`). |

**Tool IDs:** `claude-code`, `cursor`, `windsurf`, `github-copilot`, `cline`

### `alphaspec remove`

```bash
alphaspec remove [options]
```

Removes alphaspec content from IDE config files using sentinel markers — only what alphaspec added is removed. Your own content in `CLAUDE.md`, `copilot-instructions.md`, etc. is preserved.

| Flag | Description |
|------|-------------|
| `-y, --yes` | Skip all confirmations. |
| `--purge` | Also delete `pending/` and `done/`. Asks for confirmation unless `--yes` is passed. |
| `-d, --dir <path>` | Target directory (defaults to `cwd`). |

## Story conventions

- Stories capture **what** and **why** — not how.
- No estimation, no points, no sprints.
- Stories are living documents — refine them as understanding sharpens.
- Completed stories have **Implementation Notes** appended at the bottom.
- `done/` is long-term memory; AI assistants read it to orient on future work.

## Development

```bash
pnpm install
pnpm build     # compile to dist/
pnpm test      # run all tests
pnpm dev       # watch mode
```

Smoke test after building:

```bash
node dist/cli.js --version
node dist/cli.js init --tools none --yes --dir /tmp/test-alphaspec
```

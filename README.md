# claude-planner

[![npm](https://img.shields.io/npm/v/claude-planner)](https://www.npmjs.com/package/claude-planner)
[![license](https://img.shields.io/npm/l/claude-planner)](LICENSE)

Two Claude Code skills that separate **deciding** from **doing**.

```
/planfirst   THINK → INVESTIGATE → UNDERSTAND → VALIDATE → PLAN → STOP
/proceed     EXECUTE → TEST → VERIFY → REPORT
```

---

## Overview

`claude-planner` installs two [Agent Skills](https://code.claude.com/docs/en/skills) into Claude
Code:

| Command | What it does | What it is allowed to change |
|---|---|---|
| **`/planfirst`** | Investigates your codebase with read-only tools, tests the assumption most likely to be wrong, writes a plan in 18 fixed sections, then **stops** | **Nothing.** No file is edited, no package installed, no command run that changes state |
| **`/proceed`** | Executes that plan — in order, inside its scope — then tests, verifies against the plan's own acceptance criteria, and reports what it observed | **Only what the approved plan named.** Anything else is a deviation that pauses execution |

The gate between them is deliberately narrow: **only the literal `/proceed` opens it.** Not
"yes", not "ok", not "looks good", not 👍.

The package itself is small: two Markdown files and a script that copies them. No dependencies,
no build step, no postinstall hook, no network calls at runtime.

---

## The problem it solves

An agent that investigates a task and then helpfully fixes what it found has taken the decision
away from the person who asked. They wanted to see the approach *before* it became code — to
redirect it, narrow it, or say "not like that" while saying so was still free. Once files are
edited, packages installed or a migration pushed, the cheapest moment to change direction has
gone.

Underneath that sits a second failure: **a confident plan built on a misreading**. Showing the
plan first is what lets a human catch "you've got the wrong table" before it costs anything.

So `/planfirst` is an *authority level*, not a writing style. It grants permission to look and
withholds permission to change. A run that investigates well and then implements "because it was
obvious" has failed at its only job.

### How this compares

Two other things sit either side of this package. **Claude Code's plan mode** (`Shift+Tab`,
`/plan`, or `claude --permission-mode plan`) is a permission mode: it blocks your edits at the
tool layer until you approve, which is stronger enforcement than any skill can manage, and it
says nothing about what the plan must contain. **[Superpowers](https://github.com/obra/superpowers)**
(MIT, by obra) is the other end of the scale — *"an agentic skills framework & software
development methodology that works"*, fifteen skills carrying a change from a rough idea to a
merged branch. This package is two skills and one gate.

Superpowers details checked against its repository on 19 September 2026; its workflow, as its
README names it:

```
brainstorming → using-git-worktrees → writing-plans → subagent-driven-development
              → test-driven-development → requesting-code-review
              → finishing-a-development-branch
```

| | Plan mode | Superpowers | `/planfirst` + `/proceed` |
|---|---|---|---|
| **What it is** | A permission mode enforced by Claude Code | A development methodology in 15 skills | Two authority levels in 2 skills |
| **Span** | The read-only phase, until you approve | Idea → spec → worktree → plan → TDD → review → merged branch | Plan → approve → execute → report |
| **How it starts** | `Shift+Tab`, `/plan`, `--permission-mode plan` | On its own — the skills trigger automatically | You type `/planfirst` |
| **How edits are stopped** | **Hard.** The tool layer refuses them | Soft — process, not permissions | **Soft.** The model is instructed not to edit |
| **What opens the gate** | Approving the plan in the UI | Signing off in conversation: *"once you say go"* | The literal `/proceed`. "yes", "looks good", 👍 do not |
| **What the plan must contain** | Unspecified — whatever Claude writes | Bite-sized tasks (2–5 min), exact paths, complete code, verification steps | 18 required sections |
| **Are the sources current?** | Not addressed | Not addressed | §0 dates every source and says whether it is the record or a copy |
| **The riskiest assumption** | Not addressed | Not addressed | §0 names it and runs the read-only command that settles it, first |
| **Can each step be undone?** | Not addressed | Not addressed | Every step marked `Reversible: yes/no`, with why |
| **Who performs each step?** | Not addressed | Not addressed | Every step marked `Who:` — interactive logins and live-DB pushes named up front |
| **What breaks between steps** | Not addressed | Not addressed | §17 — landing order and the intermediate states people live through |
| **How you know it worked** | Not addressed | TDD, and review between tasks | §13 acceptance criteria; `/proceed` ticks only what it observed |
| **Reality disagrees mid-run** | Claude adapts and carries on | Review reports by severity; critical issues block progress | `/proceed` **stops**, prints `PLAN DEVIATION REQUIRED`, waits for `/proceed` again |
| **Where plans live** | The session | `docs/superpowers/plans/YYYY-MM-DD-<name>.md` | The conversation |
| **Opinions about how you build** | None | TDD (RED-GREEN-REFACTOR), YAGNI, DRY, worktrees, subagents, review | None — no language, framework, test style or branching model |
| **Where it runs** | Claude Code | ~15 harnesses: Claude Code, Codex, Cursor, Devin, Gemini, Copilot, Grok, Kimi, OpenCode, Pi, Qwen, Hermes, Muse, Antigravity, Factory Droid | Anywhere Agent Skills run |

"Not addressed" means exactly that, and it is not a criticism: a permission mode has no business
dictating plan contents, and a methodology that ships TDD, worktrees and a review loop is solving
a different problem. The rows are there so you can see which problem each one solves.

**Use plan mode and this together.** Enter plan mode *and* invoke `/planfirst`: the permission
mode makes the read-only phase real, and the skill decides what the plan has to prove before you
trust it. They are complementary — one enforces, the other specifies.

**Superpowers does a great deal this does not**: a brainstorming phase that teases a spec out of
the conversation, plans persisted to disk as dated files, enforced TDD, isolated worktrees,
subagent execution, a code-review loop between tasks, branch finishing, a diagnostic skill for
when a session misbehaves, and roughly fifteen harnesses to this one's one ecosystem. If you want
a methodology, install it.

**What this has that Superpowers does not** — checked against its `writing-plans` skill, whose
192 lines contain none of these words: *reversible*, *rollback*, *undo*, *one-way*, *assumption*,
*stale*, *probe*. Concretely: a gate only one literal command opens, §0's source dating and probe
before planning, `Reversible:` and `Who:` on every step, and §17's landing order.

**Running both.** They overlap at exactly one point — the plan — and nowhere else. If you use
Superpowers, `writing-plans` already owns that moment, and two skills competing for it helps
nobody. Pick one to own it; the rest of Superpowers has no counterpart here and nothing to
collide with.

---

## Key features

- **A gate that does not open to enthusiasm.** Only `/proceed` authorises execution.
- **VALIDATE — a probe run before planning further.** §0 names the assumption most likely to be
  wrong and most expensive to discover late, then runs one read-only command to settle it. A probe
  that contradicts the understanding sends the run back to INVESTIGATE rather than into the plan.
- **Source dating.** Every source the plan rests on is listed with its date and whether it is the
  record or a copy of one.
- **Reversibility marked per step.** Migrations, deploys, published links and deleted rows are
  one-way doors, and the plan says so before the step, not after.
- **Ownership marked per step.** `Who:` turns "I am blocked, over to you" into something the
  reader saw coming.
- **The actual edit, as a diff.** Every code step carries a `Change` block — a unified diff at a
  verified path, rendered red and green, checked with `git apply --check` before you ever see it.
  You review the change, not a description of it.
- **Commands you can paste.** Every step carries a `Run` block — the commands as typed, from a
  stated working directory, in order, in its own fence with its own copy button. A plan is a
  tutorial you can follow yourself, not a script only an agent can execute.
- **Landing order (§17).** When a change spans a schema and an app, the plan says what lands first
  and **what is broken in between**.
- **Honest reporting.** A criterion is ticked only because a command was run and its output read.
  Compiling is not evidence.
- **Deviations are first-class.** When reality disagrees with the plan, `/proceed` stops and asks
  again rather than quietly doing the new thing.
- **No assumptions about your stack.** No language, framework, cloud, repo layout or config file.

---

## Prerequisites

| Requirement | Detail |
|---|---|
| **Node.js ≥ 18** | Only for the `npx` installer. Older versions fail on the ES module syntax in `cli.mjs` |
| **Claude Code** | Terminal CLI, IDE extension, or desktop app. Agent Skills must be available on the surface you use — see [Where skills run](#where-skills-run) |
| **npm** | To run `npx`, or to install the plugin from this repository |
| Optional: `v2.1.275+` | For the single-line `/plugin install … --marketplace …` form |
| Optional: `v2.1.273+` | For skills and plugins synced from a claude.ai account into terminal sessions |

No API keys, accounts, services or configuration files are required by this package.

---

## Installation

Pick **one** route per person. Mixing them is possible but leaves duplicate copies to keep in
step — see [Limitations](#limitations).

### Option 1 — every project on this machine

```bash
npx claude-planner
```

Copies both skills into `~/.claude/skills/`. Anything already at those names is moved to
`~/.claude/skills-backup/` — **not** beside the skills — and never deleted.

Reaches the terminal CLI, IDE extensions, the desktop app's local sessions and desktop scheduled
tasks. **Not** Cowork or cloud sessions.

### Option 2 — any Claude Code surface, as a plugin

```bash
/plugin marketplace add raketbizdev/claude-planner
/plugin install claude-planner
```

Skills arrive namespaced: `/claude-planner:planfirst` and `/claude-planner:proceed`. The
marketplace only has to be added once.

On Claude Code v2.1.275 or later, the in-session `/plugin install` accepts a marketplace directly:

```bash
/plugin install claude-planner --marketplace raketbizdev/claude-planner
```

> **Not in the community catalog yet.** `claude-planner` is not listed in
> `anthropics/claude-plugins-community`, so `claude-planner@claude-community` does not resolve.
> Check the [catalog manifest](https://github.com/anthropics/claude-plugins-community/blob/main/.claude-plugin/marketplace.json)
> for the name if you want to know when that changes.

### Option 3 — one repository, and everyone who clones it

```bash
cp -R skills/planfirst skills/proceed <your repo>/.claude/skills/
git add .claude/skills && git commit -m "Add the planfirst and proceed skills"
```

The files travel with the repository, so they work for teammates and in cloud sessions on it, with
no install step for anyone.

Committing the files is what works. Declaring the plugin under `enabledPlugins` in
`.claude/settings.json` is **not** a substitute: that setting enables a plugin, it does not fetch
one.

### Option 4 — Cowork and cloud sessions

Enable the plugin for your claude.ai account. Claude Code downloads it into each session's
environment at startup as `claude-planner@synced`, with no install step, and reaches terminal
sessions too (v2.1.273+).

You can also upload the two skills to your account directly, under **Customize → Skills**. A
synced skill answers to `/anthropic-skills:planfirst` and to the short `/planfirst` if nothing
else has taken that name.

### Where skills run

Agent Skills do not run everywhere, and the surfaces that run them do not read the same places.
Checked against Anthropic's skills documentation on 19 September 2026.

| Surface | Runs skills? | Reads them from |
|---|---|---|
| Terminal CLI | yes | personal, project, nested, `--add-dir`, plugin, enterprise, claude.ai account |
| IDE extensions (VS Code, JetBrains) | yes | the same list as the terminal |
| Desktop app, local session | yes | the same list as the terminal |
| Desktop scheduled tasks | yes | they run on your machine, so **personal** reaches them |
| Cowork | yes | claude.ai account, plugin — **not** personal |
| Cloud sessions (claude.ai/code), routines | yes | project, claude.ai account, plugin — **not** personal |
| claude.ai chat | yes | claude.ai account only, uploaded under **Customize → Skills** |
| Claude Design | not documented | — |

The row that catches people is **personal**. From Anthropic's documentation:

> Cowork sessions and cloud sessions, including routines, don't read `~/.claude/skills/` on your
> machine. [...] Cloud sessions additionally load project skills committed to the cloned
> repository's `.claude/skills/`.

Cloud sessions run on Anthropic's machines; your home directory is not there. Desktop scheduled
tasks are the exception — they run locally, so they *do* load `~/.claude/skills/`.

### Uninstall

| Installed with | Remove with |
|---|---|
| `npx claude-planner` | `npx claude-planner --uninstall` |
| `/plugin install` | `/plugin uninstall claude-planner` |
| Uploaded to claude.ai | Delete them in **Customize → Skills** |
| Synced plugin | Turn the plugin off for your claude.ai account |
| Committed into a repo | `git rm -r .claude/skills/planfirst .claude/skills/proceed` |

`npx claude-planner --uninstall` **restores what it displaced** (the newest matching backup moves
back) and **will not delete a skill you have edited** — it compares each `SKILL.md` against the
packaged copy and leaves anything different alone.

To stop the marketplace being refreshed as well:

```bash
/plugin marketplace remove claude-planner
```

Start a new Claude Code session after installing or removing: the skill list is read at startup.

---

## Usage

### `/planfirst` — plan, and change nothing

Append it to a request, or lead with it:

```
Remove the nav links from the header and replace them with a download icon /planfirst
```

Claude then reads files, searches the repository, inspects schemas and git history, runs one
read-only probe of the riskiest assumption, and returns a plan in 18 sections. It ends with,
exactly:

```
PLAN READY. No implementation changes have been executed.

Invoke /proceed to execute this plan.
```

Ask questions about the plan, or ask for changes, and it revises and ends the same way. Revising
a plan is planning; it does not consume the gate or open it.

### `/proceed` — execute only the approved plan

```
/proceed
```

Claude re-checks the things the plan depends on most, executes the steps in order, stays inside
the plan's scope, validates as it goes, then reports against the plan's acceptance criteria.

If no unexecuted plan exists in the conversation, it changes nothing and replies:

```
NO APPROVED PLAN FOUND.

Run /planfirst first.
```

### What does not count as approval

None of these authorise execution, in any language, however emphatic:

> yes · ok · okay · looks good · continue · go · go ahead · do it · sounds good · approved ·
> perfect · 👍 · proceed with it · start · begin

Only the literal **`/proceed`** does. This occasionally feels pedantic; it is the one rule that
makes the gate worth having, because a gate that opens to enthusiasm is not a gate.

---

## Available commands

### Skill commands (inside Claude Code)

| Command | Plugin-namespaced form | Effect |
|---|---|---|
| `/planfirst` | `/claude-planner:planfirst` | Investigate read-only, produce the 18-section plan, stop |
| `/proceed` | `/claude-planner:proceed` | Execute the approved plan, test, verify, report |

### CLI commands (in your terminal)

| Command | Effect | Exit code |
|---|---|---|
| `npx claude-planner` | Copy both skills into `~/.claude/skills/`, backing up anything displaced | `0`, or `1` if a `SKILL.md` is missing afterwards |
| `npx claude-planner --uninstall` | Remove the skills this package installed and restore any backup | `0` |
| `npx claude-planner --help` (`-h`) | Print usage and the surface caveats | `0` |
| any other argument | `unknown argument: …` | `2` |

---

## Example workflow

A real run, shortened. The task was replacing a website's header navigation with a download icon.

**You type:**

```
Remove the nav links and the Browse rentals button from the header,
replace them with a download icon on the right to balance the logo /planfirst
```

**You get back** the plan in full. Section 0 matters most:

```
0 · Sources, Assumptions and the First Probe

Source:        web/components/Header.tsx
Dated:         commit 1d0e13f; tree clean
Authoritative: YES — the only file that renders the five elements

Source:        design/mockups/Marketplace.dc.html
Dated:         5 Sep export, committed 16 Sep
Authoritative: COPY. The design project is the source of record.

Assumption:  There is a public URL the download icon can point at.
If wrong:    The icon has nowhere honest to go.   ← THIS ONE

The first probe — run now, read-only:

  $ curl -s -o /dev/null -w "%{http_code}" https://example.com/download
  404
  $ curl -sL -w "%{http_code}" "https://drive.google.com/file/d/1TRJ…/view"
  401          ← the release build. "sign in".

Result: there is no public download URL. /download is a 404 and the build sits
in a private folder that answers 401 to anyone who is not the uploader.
```

...then sixteen more sections, ending:

```
STEP 3   ← THE ONLY STEP THAT NEEDS YOUR DECISION
What:            Decide where the download icon points.
Reversible:      A — yes, trivially.
                 B — NO. Publishing the build to a public link cannot be undone;
                     revoking later does not un-download it.
Who:             THE USER. B is a sharing change on your account.

PLAN READY. No implementation changes have been executed.

Invoke /proceed to execute this plan.
```

**You type `/proceed`**, and it executes only that plan, finishing with:

```
EXECUTION COMPLETE

Acceptance Criteria:
[x] Header shows exactly two things  — bar HTML extracted: 2 anchors, no nav labels
[x] One row at 360px                 — measured: docScrollWidth 360, icon at x=300..340
[ ] Screenshots captured             — NOT MET. The app's only sign-in is Google;
                                       capturing would put real customer data into
                                       a public directory. Took the documented fallback.

Verification:
- web gates exit 0 · mobile gates exit 0
- privacy check: 4 failures, PRE-EXISTING — proved by running it against a clean
  checkout and getting the identical 11 passed / 4 failed
```

Note the unticked box and the pre-existing failure proved rather than asserted. The probe is the
point: without it the icon gets built, wired to a link, deployed, and the 401 is discovered by a
visitor.

---

## The plan: 18 sections

Where a section does not apply it says so in a line, because an absent heading reads as an
oversight rather than a decision.

| | Section | Why it is there |
|---|---|---|
| **0** | Sources, Assumptions and the First Probe | Dates every source, names the riskiest assumption, and runs the read-only command that settles it **before** planning further |
| 1 | Requested Outcome | What is being asked for, and what success looks like |
| 2 | Current State | What the system does today, from inspection rather than inference |
| 3 | Root Cause or Reason for Change | The evidence, marked verified or hypothesis |
| 4 | Scope | In scope, and explicitly out — no "while we're here" |
| 5 | Affected Components | Paths, current responsibility, required change, impact |
| 6 | Detailed Execution Steps | Each with the edit as a diff (`Change`), the commands to make it (`Run`), plus `Reversible:` and `Who:` |
| 7 | Data Flow | The real path through the system |
| 8 | Business Rules | What must still hold afterwards |
| 9 | Edge Cases | Realistic ones for this change |
| 10 | Security Impact | Or `No material security impact identified.` |
| 11 | Risks | Risk, impact, likelihood, mitigation |
| 12 | Testing Strategy | What will be observed, and where |
| 13 | Acceptance Criteria | Observable pass/fail statements |
| 14 | Files Expected to Change | Verified paths only |
| 15 | Things That Will NOT Change | So scope creep is visible |
| 16 | Final Execution Summary | Short enough to read in one go |
| **17** | Landing Order and Coupling | What lands first, and **what is broken in between** |

Three words are used precisely throughout:

- **Verified** — I read it, and here is where.
- **Evidence** — this follows from what I read.
- **Hypothesis** — this needs checking before it is relied on.

Where something could not be established, the plan writes exactly `Not yet verified.` rather than
inventing a file, function, table or dependency.

---

## Configuration

There is no configuration file. The skills read nothing and write nothing. The installer accepts
three environment variables, used mainly for testing and for non-standard layouts:

| Variable | Default | Purpose |
|---|---|---|
| `CLAUDE_SKILLS_DIR` | `~/.claude/skills` | Where skills are installed to and removed from |
| `CLAUDE_SKILLS_BACKUP_DIR` | `~/.claude/skills-backup` | Where displaced skills are moved. Deliberately **not** inside the skills directory |
| `CLAUDE_PLUGINS_DIR` | `~/.claude/plugins` | Searched, to warn you when the plugin is also installed |

```bash
# install into a throwaway directory instead of your real one
CLAUDE_SKILLS_DIR=/tmp/skills npx claude-planner
```

Backups are named `<skill>.backup.YYYYMMDDHHMMSS`, which sorts lexically, so "newest" is simply
the last one.

---

## Project structure

```
claude-planner/
├── cli.mjs                        the installer — copies, backs up, restores
├── test.mjs                       packs the tarball, installs it, drives the CLI
├── package.json                   bin entry, files allowlist, engines: node >=18
├── LICENSE                        MIT
├── README.md                      this file
├── skills/
│   ├── planfirst/SKILL.md         the investigate-and-stop authority level
│   └── proceed/SKILL.md           the execute-what-was-approved authority level
├── .claude-plugin/
│   ├── plugin.json                plugin manifest (name, version, author)
│   └── marketplace.json           one-repo marketplace, so /plugin install works from here
└── .github/workflows/
    └── npm-publish.yml            npm test, then publish on a published GitHub release
```

Two structural decisions that look odd until you know why:

- **`cli.mjs` is at the repository root, not in `bin/`.** npm convention points `bin` at
  `./bin/something.js`. A plugin carrying a top-level `bin/` directory cannot be distributed
  through claude.ai organization settings; the `bin` *field* is fine, the `bin/` *directory* is
  not.
- **There is no postinstall hook.** `npm install` must not write to your home directory. Copying
  skills is something you choose by running a command.

---

## Safety rules

### While `/planfirst` is active, none of these happen

| | |
|---|---|
| Source | edit, create, delete, rename or move any file |
| Config | change configuration, environment, flags or feature toggles |
| Packages | install, remove, upgrade or change dependencies or lockfiles |
| Data | run migrations, alter schemas, insert, update or delete rows |
| Infrastructure | change cloud resources, IAM, permissions, secrets or networking |
| Delivery | deploy, publish, build-and-ship, restart or scale a service |
| Version control | commit, push, tag, branch, merge, open or merge a pull request |
| Destructive | truncate, drop, force, prune, reset, revert |
| The task itself | apply the fix or implement the feature — in whole or "just the first bit" |

A borderline command is decided by one question: **could this leave the system different from how
I found it?** If yes, it waits for `/proceed`.

**Permitted meanwhile:** reading files, searching the repository, inspecting schemas, tests, types
and lockfiles, reading git history and diffs, reading logs and CI output, and read-only queries
(`SELECT`, `EXPLAIN`, `\d`, `--dry-run`, `--check`, `status`, `list`, `describe`). Notes may be
written to a scratch directory, never into your project.

### While `/proceed` runs

- Steps run **in the plan's order**; the sequence was reasoned about.
- The plan's "Out of scope" and "Things That Will NOT Change" are instructions, not commentary.
- Anything the plan did not name is a **deviation**: execution pauses, prints what was found and
  how it was established, and waits for `/proceed` again. Nothing else approves a revision.
- A criterion is ticked **only because something was run and its output read**. Failures are
  reported with their output; skipped steps are named.

### What the installer does to your machine

- Writes exactly two directories: `~/.claude/skills/planfirst` and `~/.claude/skills/proceed`.
- Moves anything already at those names into `~/.claude/skills-backup/`. Nothing is deleted.
- Copies rather than symlinks, because Claude Code skips symlinked skill directories.
- Makes no network calls, has zero dependencies, and runs nothing on `npm install`.

---

## Limitations

- **Skills are instructions, not enforcement.** Unlike plan mode, nothing at the tool layer
  refuses an edit during `/planfirst`. The model is told not to change anything; that is a strong
  constraint, not a hard one. Run plan mode alongside it when the cost of being wrong is high.
- **`claude.ai` chat runs skills but has no repository.** There is nothing to investigate, no
  read-only probe to run and no files to change, so `/planfirst` there plans about nothing.
- **Claude Design is not a documented skills surface.** Its help pages do not mention Agent Skills.
  Gate design work upstream in Claude Code: `/planfirst`, then `/proceed`, then `/design` or
  `/design-sync`.
- **Not in the community plugin catalog yet**, so `claude-planner@claude-community` does not
  resolve.
- **`~/.claude/skills/` does not reach Cowork or cloud sessions.** Use the plugin, the claude.ai
  account route, or commit the skills into the repository.
- **A project copy wins over a personal copy.** If both exist under the same name, you have two
  versions drifting apart with nothing to warn you.
- **The plugin does not override a local install.** Plugin skills are namespaced, so you end up
  with both `/planfirst` and `/claude-planner:planfirst`, both working. `npx claude-planner` says
  so when it detects the plugin.
- **The gate lives inside one conversation.** `/proceed` looks back through the current
  conversation for an unexecuted plan; it will not reconstruct one from a different session.

---

## Troubleshooting

**`/planfirst` does not appear after installing.**
The skill list is read at startup — start a new Claude Code session. If it still does not appear,
check `~/.claude/skills/planfirst/SKILL.md` exists; the installer exits `1` and says so when it
does not.

**A skill named `planfirst.backup.20260918163405` appeared.**
Everything in `~/.claude/skills/` loads as a skill, and a skill is named by its **directory**, not
by the `name:` in its frontmatter. Move backups out of that directory. This installer keeps them
in `~/.claude/skills-backup/` for exactly this reason.

**I symlinked the skills and they stopped existing.**
Claude Code skips symlinked skill directories during discovery. Copy them instead — which is what
`npx claude-planner` does.

**`npx claude-planner` fails with a syntax error.**
You are on Node < 18. Check with `node --version`.

**Both `/planfirst` and `/claude-planner:planfirst` exist.**
You have the local install *and* the plugin. Nothing is broken; pick one with
`npx claude-planner --uninstall` or `/plugin uninstall claude-planner`.

**`--uninstall` left a skill behind.**
It compares each `SKILL.md` against the packaged copy and leaves anything you edited alone,
printing `left alone`. Remove it yourself if that was the intent.

**`/proceed` says `NO APPROVED PLAN FOUND.`**
There is no unexecuted `/planfirst` plan in this conversation. Run `/planfirst` first — it will
not reconstruct a plan so that there is something to approve.

**`/proceed` stopped with `PLAN DEVIATION REQUIRED`.**
Reality disagreed with the plan. Read what it found, then send `/proceed` again to approve the
revision. This is the workflow working.

---

## Development and testing

```bash
npm test                      # packs the tarball, installs it, drives the CLI (9 checks)
claude plugin validate .      # validates the marketplace and plugin manifests
```

`npm test` never touches a real `~/.claude/skills` — every run is pointed at a temp directory
through `CLAUDE_SKILLS_DIR`. It checks the tarball carries exactly the six files the allowlist
names, the `bin` entry survives packing, installing creates the command and both skills, that it
copies rather than symlinks, that backups land outside the skills directory, and that uninstall
restores a displaced skill while leaving an edited one alone.

---

## Contributing

Issues and pull requests are welcome at
[github.com/raketbizdev/claude-planner](https://github.com/raketbizdev/claude-planner/issues).

Before opening a PR:

1. Run `npm test` — it must pass 9/9.
2. Run `claude plugin validate .` — it must print `✔ Validation passed`.
3. If you changed `SKILL.md`, say in the PR what behaviour you expect to change and how you
   checked it. These files are prompts: the only real test is running them.
4. Keep the package dependency-free. That constraint is why `npm ci` is not in CI and why there is
   no lockfile.

Changes to the skills that **weaken the gate** — accepting "yes" as approval, allowing edits
during `/planfirst` — will not be merged. That is the product.

---

## Changelog

See [Releases](https://github.com/raketbizdev/claude-planner/releases) for what changed in each
version, and [npm](https://www.npmjs.com/package/claude-planner) for what is currently published.

---

## Maintainer

**Ruel Nopal** — [github.com/raketbizdev](https://github.com/raketbizdev)

- Repository: <https://github.com/raketbizdev/claude-planner>
- Issues: <https://github.com/raketbizdev/claude-planner/issues>
- npm: <https://www.npmjs.com/package/claude-planner>

---

## License

MIT. See [LICENSE](LICENSE). Take what is useful.

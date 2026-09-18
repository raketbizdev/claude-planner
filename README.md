# claude-planner

Two Claude Code skills that separate deciding from doing.

```
/planfirst   THINK → INVESTIGATE → UNDERSTAND → PLAN → STOP
/proceed     EXECUTE → TEST → VERIFY → REPORT
```

## The problem they solve

An agent that investigates a task and then helpfully fixes what it found has taken the decision
away from the person who asked. They wanted to see the approach *before* it became code — to
redirect it, narrow it, or say "not like that" while saying so was still free. Once files are
edited, packages installed or a migration pushed, the cheapest moment to change direction has
gone.

There is a second failure underneath that one: **a confident plan built on a misreading**.
Presenting the plan first is what lets a human catch "you've got the wrong table" before it
costs anything.

So `/planfirst` is an **authority level**, not a style of answer. It grants permission to look
and withholds permission to change. A run that investigates well and then implements "because
it was obvious" has failed at its only job.

## What makes this different from asking for a plan

Anyone can ask an agent to plan first. Four things here are not in that request:

**The gate is explicit and narrow.** `yes`, `ok`, `looks good`, `go ahead`, `approved`, `👍` do
**not** authorise execution. Only the literal `/proceed` does. This occasionally feels
pedantic; it is the one rule that makes the gate worth having, because a gate that opens to
enthusiasm is not a gate.

**Section 0 runs before everything else.** Sources are listed with their dates and whether they
are authoritative *or a copy of something authoritative*. Then the single assumption most
likely to be wrong and most expensive to discover late is named — and a read-only command is
run **now** to settle it. Steps are otherwise ordered by implementation logic, which means the
thing that can invalidate the whole plan gets discovered last, after everything is built on top
of it.

**Every step says whether it can be undone, and who does it.** A migration that has been
applied, a deploy that has gone out, a phone number that has been published, a row that has
been deleted — each is a door that opens one way. A plan that marks them cannot edit one
absent-mindedly. And naming the interactive logins and the live-database pushes up front turns
"I am blocked, over to you" into something the reader saw coming.

**Discovering the plan was wrong is a first-class outcome.** `/proceed` does not quietly do the
new thing when reality disagrees with the plan. It stops, prints what it found and how it
established it, and waits for `/proceed` again. A deviation is the workflow working; the
failure is noticing and carrying on regardless.

## The plan

Eighteen sections, 0 through 17. Where one does not apply it says so in a line, because an
absent heading reads as an oversight rather than a decision.

| | |
|---|---|
| **0** | Sources, Assumptions and the First Probe |
| 1 | Requested Outcome |
| 2 | Current State |
| 3 | Root Cause or Reason for Change |
| 4 | Scope — in, and explicitly out |
| 5 | Affected Components |
| 6 | Detailed Execution Steps |
| 7 | Data Flow |
| 8 | Business Rules |
| 9 | Edge Cases |
| 10 | Security Impact |
| 11 | Risks |
| 12 | Testing Strategy |
| 13 | Acceptance Criteria |
| 14 | Files Expected to Change |
| 15 | Things That Will NOT Change |
| 16 | Final Execution Summary |
| **17** | Landing Order and Coupling |

Section 17 is the one people skip and then live through. When a change spans a schema and an
application, or an app and a website, it asks what lands first and **what is broken in
between** — a migration that revokes a grant while the site still calls it, an app that writes
a column the database does not have yet. Each is invisible in a plan that lists only the end
state, and each is a real outage for however long the gap lasts.

Three words are used precisely throughout, and labelled where it matters:

- **Verified** — I read it, and here is where.
- **Evidence** — this follows from what I read.
- **Hypothesis** — this needs checking before it is relied on.

Where something could not be established, the plan says exactly `Not yet verified.` rather than
inventing a file, a function, a table or a dependency.

## Reporting

`/proceed` finishes against the acceptance criteria the plan wrote, and **a criterion is ticked
only because something was run and its output read**. Compiling is not evidence. Neither is
"the edit applied cleanly".

An unticked box with a reason is a useful report. A ticked box that was assumed is a lie that
costs somebody an afternoon.

## Which surfaces run these

Agent Skills do not run everywhere, and the differences are not obvious. This table is the
thing to read before choosing how to install.

| Surface | Runs skills? | From where |
|---|---|---|
| Terminal CLI | yes | personal, project, plugin, claude.ai sync |
| IDE extensions (VS Code, JetBrains) | yes | personal, project, plugin, claude.ai sync |
| Desktop app, local session | yes | personal, project, plugin, claude.ai sync |
| Cowork | yes | plugin, claude.ai sync — **not** personal |
| Cloud sessions (claude.ai/code) | yes | project, plugin, claude.ai sync — **not** personal |
| **claude.ai chat** | **no** | — |
| **Claude Design** | **no** | — |

The row that catches people is **personal**. From Anthropic's documentation:

> Cowork sessions and cloud sessions, including routines, don't read `~/.claude/skills/` on
> your machine.

Cloud sessions run on Anthropic's machines. Your home directory is not there. So installing
locally — the first route below — does not reach them, however it is done.

## Install

### Every project on this machine

```bash
npx claude-planner
```

Copies both skills into `~/.claude/skills/`. Anything already at those names is moved to
`~/.claude/skills-backup/` — **not** beside the skills — and never deleted.
`npx claude-planner --uninstall` reverses it and puts the backup back.

Reaches the terminal, IDE extensions and the desktop app's local sessions. **Not** Cowork or
cloud sessions.

### Anyone, on any Claude Code surface

```bash
/plugin marketplace add anthropics/claude-plugins-community
/plugin install claude-planner
```

Skills arrive namespaced: `/claude-planner:planfirst` and `/claude-planner:proceed`.

The marketplace only has to be added once; afterwards `/plugin install claude-planner` is
enough on its own. `claude-plugins-official` is registered automatically but `claude-community`
is not, which is why the first line exists. On Claude Code v2.1.275 or later both steps
collapse into one:

```bash
/plugin install claude-planner --marketplace anthropics/claude-plugins-community
```

Or install straight from this repository, without the community catalog:

```bash
/plugin marketplace add raketbizdev/claude-planner
/plugin install claude-planner
```

### Cowork and cloud sessions

Enable the plugin for your account on claude.ai. Claude Code then downloads it into each
session's own environment at startup, as `claude-planner@synced`, with no install step — and it
reaches terminal sessions too (v2.1.273+). Updates flow from the catalog; a synced plugin is
managed on claude.ai rather than with `claude plugin install`.

You can also upload the two skills to your claude.ai account directly, under **Customize** in
the desktop sidebar or the skills settings on claude.ai. That gives `/planfirst` rather than
`/claude-planner:planfirst`.

### One repository, and everyone who clones it

```bash
cp -R skills/planfirst skills/proceed <your repo>/.claude/skills/
git add .claude/skills && git commit -m "Add the planfirst and proceed skills"
```

The files travel with the repository, so they work for teammates and in cloud sessions on it —
with no install step for anyone.

**Committing the skill files is what works. Declaring the plugin under `enabledPlugins` in
`.claude/settings.json` is not a substitute:** that setting enables a plugin, it does not fetch
one. A plugin from an external source stays uninstalled until somebody installs it.

### Pick one route per person

If a skill exists in both `~/.claude/skills/` and a project's `.claude/skills/`, **the project
copy wins** — two versions under one name, drifting apart with nothing to warn you.

The plugin is different: plugin skills are namespaced, so installing the plugin *and* the local
copy leaves you with both `/planfirst` and `/claude-planner:planfirst`, both working. Nothing
breaks; it is just two copies to keep in step. `npx claude-planner` says so when it detects the
plugin, rather than letting you find out later.

## Using these with Claude Design

**Claude Design runs no Agent Skills.** Neither does claude.ai chat. No packaging changes that
— there is nothing to install into those surfaces.

What works is the gate sitting upstream, in Claude Code, where the skills that reach into
Claude Design actually run:

```
/planfirst   plan the design change, and stop
/proceed     then:
               /design        publish a canvas of editable artboards
               /design-sync   push components into a design-system project
```

`/design` is a built-in Claude Code skill (research preview, v2.1.234+) that brings Claude
Design's artboard workflow into the CLI and desktop app. `/design-sync` keeps a local component
library in step with a Claude Design project. Neither needs installing from here, and neither
is wrapped or vendored by this package.

So design work is gated the same way everything else is — you just run the gate in Claude Code
before the design skill, not inside Claude Design.

## Two things about skill discovery, learned the hard way

This installer used to symlink into `~/.claude/skills/`, so that one `git pull` would update
every project at once. That silently broke both skills:

- **Claude Code skips symlinked skill directories.** `/planfirst` simply stopped existing.
- **A skill is named by its DIRECTORY, not by the `name:` in its frontmatter.** So the
  timestamped backups sitting beside it *were* discovered, and became two skills called
  `planfirst.backup.20260918163405` and `proceed.backup.20260918163405`.

Anything in `~/.claude/skills/` becomes a skill. Keep copies, not links, and keep backups
somewhere else. Both rules are why `cli.mjs` works the way it does.

Two more, for anyone reading the source and wondering:

- **`cli.mjs` sits at the repository root, not in `bin/`.** npm convention points `bin` at
  `./bin/something.js`; a plugin carrying a top-level `bin/` directory cannot be distributed
  through claude.ai organization settings. The `bin` *field* is fine, the `bin/` *directory* is
  not.
- **There is no postinstall hook.** `npm install` must not write to your home directory.
  Copying skills is something you choose by running a command.

## They assume nothing

No language, no framework, no cloud, no repository layout, no config file. Software, bug
fixing, UI, backend, databases, DevOps, infrastructure, security, CI/CD, observability,
refactoring and architecture all use the same two authority levels.

## Licence

MIT. Take what is useful.

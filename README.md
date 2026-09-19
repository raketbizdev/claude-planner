# claude-planner

Two Claude Code skills that separate deciding from doing.

```
/planfirst   THINK → INVESTIGATE → UNDERSTAND → PLAN → STOP
/proceed     EXECUTE → TEST → VERIFY → REPORT
```

**In one paragraph:** `/planfirst` investigates your codebase with read-only tools, runs one
command to test the assumption most likely to be wrong, writes a plan in eighteen fixed
sections — every step marked reversible or not, and who has to do it — then stops and changes
nothing. `/proceed` executes that plan, in order and within its scope, and reports against the
acceptance criteria the plan wrote, ticking only what it actually observed. Nothing but the
literal `/proceed` opens the gate: not "yes", not "go ahead", not 👍.

```bash
/plugin marketplace add raketbizdev/claude-planner
/plugin install claude-planner
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

## How this differs from Claude Code's plan mode

Claude Code already has a **plan mode**, and it is good. Enter it with `Shift+Tab`, by
prefixing a prompt with `/plan`, or with `claude --permission-mode plan`. Claude then reads
files and explores, writes a plan, and — this is the important part — **your edits are blocked
by the tool layer until you approve it.**

That enforcement is stronger than anything a skill can do, and this package does not replace
it. What plan mode does not do is say anything about *what the plan must contain*, or what
happens to the plan after you approve it.

| | Plan mode | `/planfirst` + `/proceed` |
|---|---|---|
| **What it is** | A permission mode, enforced by Claude Code | Skills — instructions the model follows |
| **How edits are stopped** | **Hard. The tool layer refuses them.** | Soft. The model is instructed not to edit |
| **Entering** | `Shift+Tab`, `/plan`, `--permission-mode plan` | `/planfirst` |
| **Leaving without approving** | `Shift+Tab` again | Just say something else |
| **What the plan must contain** | Nothing specified — whatever Claude writes | **18 required sections** |
| **Are the sources current?** | Not addressed | §0 dates every source and says whether it is authoritative **or a copy of one** |
| **The riskiest assumption** | Not addressed | §0 names it and **runs the read-only command that settles it, before planning further** |
| **Can each step be undone?** | Not addressed | Every step marked `Reversible: yes/no`, with why |
| **Who does each step?** | Not addressed | Every step marked `Who:` — so an interactive login or a live-DB push is seen coming |
| **What breaks between steps?** | Not addressed | §17 — the intermediate states people skip and then live through |
| **How you know it worked** | Not addressed | §13 acceptance criteria, and `/proceed` ticks only what it observed |
| **Reality disagrees mid-execution** | Claude adapts and carries on | `/proceed` **stops**, prints what it found, and waits for `/proceed` again |
| **Where it runs** | Claude Code only | Any surface that runs Agent Skills |

**Use both.** They are not competing. `Shift+Tab` into plan mode *and* invoke `/planfirst`: the
permission mode makes the read-only phase real, and the skill decides what the plan has to
prove before you trust it.

The single most useful thing here that plan mode has no opinion about is **§0's probe**. Steps
are naturally ordered by implementation logic, which means the assumption that can invalidate
the entire plan gets tested last — after everything is built on top of it. §0 drags that to the
front and runs one command to settle it. In practice that is where the wasted afternoons live.

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

## What it looks like

A real example, shortened. The task was removing a website's header navigation and replacing
it with a download icon.

**You type:**

```
Remove the nav links and the Browse rentals button from the header,
replace them with a download icon on the right to balance the logo /planfirst
```

**You get back** — the plan in full, of which the opening section matters most:

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

The probe is the point. Without it the icon gets built, wired to a link, deployed, and the
401 is discovered by a visitor. With it, the one decision that mattered surfaced before a line
of code was written — and it turned out to be a decision only a human could make.

**You then type `/proceed`**, and it executes only that plan, finishing with:

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

Note the unticked box and the pre-existing failure proved rather than asserted. That is the
report working: **a criterion is ticked only because a command was run and its output read.**

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
/plugin marketplace add raketbizdev/claude-planner
/plugin install claude-planner
```

Skills arrive namespaced: `/claude-planner:planfirst` and `/claude-planner:proceed`.

The marketplace only has to be added once; afterwards `/plugin install claude-planner` is
enough on its own.

#### From the community catalog — not listed yet

`claude-community` is Anthropic's public catalog of third-party plugins. **`claude-planner` is
not in it**, so the two lines below do not work yet — they are here for when it is. A plugin
reaches that catalog only by passing Anthropic's review, and the catalog syncs nightly
afterwards, so the one reliable way to know is to look for the name in the
[catalog manifest](https://github.com/anthropics/claude-plugins-community/blob/main/.claude-plugin/marketplace.json).

```bash
/plugin marketplace add anthropics/claude-plugins-community
/plugin install claude-planner@claude-community
```

`claude-plugins-official` is registered automatically; `claude-community` is not, which is why
the first line exists. The `@claude-community` suffix names the marketplace — that is the
marketplace's own `name`, not its repository path, and it is only needed when the same plugin
name exists in more than one catalog you have added.

Nothing about the community route changes what you get. Approved entries are pinned to a commit
SHA of **this** repository, so it installs the same two files as the line above it.

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

## Uninstall

Whichever route you used, removing it is one command. None of them touches anything else in
`~/.claude/`.

| Installed with | Remove with |
|---|---|
| `npx claude-planner` | `npx claude-planner --uninstall` |
| `/plugin install` | `/plugin uninstall claude-planner` |
| Uploaded to claude.ai | Delete the skills in **Customize → Skills**, or the claude.ai skills settings |
| Enabled as a synced plugin | Turn the plugin off for your claude.ai account |
| Committed into a repo | `git rm -r .claude/skills/planfirst .claude/skills/proceed` |

`npx claude-planner --uninstall` does two things worth knowing:

- **It restores what it displaced.** If installing moved an existing `planfirst` of yours to
  `~/.claude/skills-backup/`, uninstalling puts it back.
- **It will not delete a skill you have edited.** It compares each `SKILL.md` against this
  package's copy; if they differ, it leaves the directory alone and says so. Your changes are
  your work, not ours to throw away.

To remove the marketplace as well, so it stops being refreshed:

```bash
/plugin marketplace remove claude-planner
```

Removing a marketplace uninstalls the plugins you installed from it.

Start a new session afterwards — the skill list is read at startup, so a removal in a running
session is not visible until then.

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

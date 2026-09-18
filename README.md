# Two skills that separate deciding from doing

`/planfirst` investigates and stops. `/proceed` executes what was approved and nothing else.

They are written for [Claude Code](https://claude.com/claude-code) and invoked by name.

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

## Install

Every project on this machine:

```bash
git clone https://github.com/raketbizdev/claude-skills.git
cd claude-skills
./install.sh
```

It symlinks both into `~/.claude/skills/`, so a later `git pull` updates them everywhere at
once. Anything already sitting at those names is moved aside with a timestamp, never deleted.
`./install.sh --copy` copies instead, and `./install.sh --uninstall` reverses either and puts
the backup back.

**One project, and everyone who clones it** — no install step for them at all:

```bash
cp -R skills/planfirst skills/proceed <your repo>/.claude/skills/
git add .claude/skills && git commit -m "Add the planfirst and proceed skills"
```

Pick one or the other per person. If a skill exists both in `~/.claude/skills/` and in a
project's `.claude/skills/`, **the project copy wins** — two versions under one name, drifting
apart silently.

Then start a new session and type `/planfirst`.

## They assume nothing

No language, no framework, no cloud, no repository layout, no config file. Software, bug
fixing, UI, backend, databases, DevOps, infrastructure, security, CI/CD, observability,
refactoring and architecture all use the same two authority levels.

## Licence

MIT. Take what is useful.

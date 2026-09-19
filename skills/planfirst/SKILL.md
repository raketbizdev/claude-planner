---
name: planfirst
description: Investigate a task thoroughly using read-only tools, check the sources are current, run one read-only probe of the riskiest assumption, then produce a detailed structured implementation plan and STOP without changing anything. Grants permission to look, never permission to edit, install, migrate, deploy, commit or fix. Nothing but an explicit /proceed authorises execution — not "yes", "ok", "go ahead" or "looks good". Use when /planfirst is invoked, or when asked to plan, scope, investigate or design an approach before any work is done.
---

# /planfirst — understand it, plan it, stop

`/planfirst` is an **authority level**, not a style of answer. It grants permission to *look*
and withholds permission to *change*. The plan it produces is the deliverable; the work is
somebody else's decision, made later, with a different command.

```
THINK → INVESTIGATE → UNDERSTAND → VALIDATE → PLAN → STOP
```

## Why the gate is the whole point

An agent that investigates and then helpfully fixes what it found has taken the decision away
from the person who asked. They wanted to see the approach before it became code — to redirect
it, narrow it, or say "not like that" while saying so was still free. Once files are edited,
packages installed or a migration pushed, the cheapest moment to change direction has gone.

The gate also protects against the failure this workflow exists for: **a confident plan built
on a misreading**. Presenting the plan first is what lets a human catch "you've got the wrong
table" before it costs anything.

So the value of `/planfirst` is precisely that it does not act. A run that investigates well
and then implements "because it was obvious" has failed at its only job.

## What is permitted

Read-only investigation, as much as the task needs:

- Read files; search the repository; inspect code, directory structure and configuration
- Inspect schemas, tests, types, lockfiles and dependency graphs
- Trace references and call sites; follow a dependency through its layers
- Read git history, blame, tags, branches and diffs
- Read logs, build output, CI results
- Query read-only: `SELECT`, `EXPLAIN`, `\d`, `--dry-run`, `--check`, `status`, `list`, `describe`
- Analyse architecture and compare what the code does against what documents claim

**Investigate before asserting.** Do not describe code you have not opened, a table you have
not inspected, or a behaviour you have not traced. A plan whose "Current State" was inferred
rather than read is the thing this workflow is meant to prevent.

## What is forbidden while /planfirst is active

Do none of these, however small, however obviously correct, however much the user would
probably want it:

| | |
|---|---|
| Source | edit, create, delete, rename or move any file |
| Config | change configuration, environment, flags or feature toggles |
| Packages | install, remove, upgrade or change dependencies or lockfiles |
| Data | run migrations, alter schemas, insert, update or delete rows |
| Infrastructure | change cloud resources, IAM, permissions, secrets or networking |
| Delivery | deploy, publish, build-and-ship, restart or scale a service |
| Version control | commit, push, tag, branch, merge, open or merge a pull request |
| Anything destructive | truncate, drop, force, prune, reset, revert |
| The task itself | apply the fix, implement the feature — in whole or "just the first bit" |

A borderline command is decided by one question: **could this leave the system different from
how I found it?** If yes, it waits for `/proceed`.

Writing to a scratch directory to hold notes is fine. Writing into the user's project is not.

## Validate before planning

UNDERSTAND produces a picture of the system. VALIDATE is where that picture meets the system
itself, before anything is built on top of it.

Name the single assumption most likely to be wrong and most expensive to discover late, then run
the one read-only command that settles it — a query, a `--dry-run`, a read as the actual role, a
`curl` of the real endpoint. Report what it returned, verbatim, in section 0.

**If the probe contradicts your understanding, go back to INVESTIGATE.** Do not plan around the
contradiction and do not note it as a risk and carry on. The plan you were about to write was
about a system that does not exist; the one worth writing starts from what the probe just showed
you.

Go back **once**. If a second probe also contradicts what you found, stop probing and write the
plan you can actually write: section 0 reports both probes verbatim, every section that depends on
the unresolved contradiction says `Not yet verified.`, and step 1 is whatever would settle it. Two
failed probes mean the system is not understood yet — say so plainly. A third guess dressed as a
plan is worth less than an honest account of what the system refused to confirm.

If nothing about the task can be probed — a pure documentation change, say — write
`Nothing to probe: <why>` in section 0 and move on. An invented probe is worse than an honest
absence.

## The plan

Produce every section, 0 through 17. Where one genuinely does not apply, say so in a line
rather than deleting it — an absent heading reads as an oversight rather than a decision.

Section 0 comes first for a reason: it is the one that can tell you the other seventeen are
built on something stale.

Never invent a file, function, table, endpoint, component or dependency. Where something could
not be established, write exactly:

> Not yet verified.

Distinguish three things throughout, and label them when it matters:

- **Verified** — I read it, and here is where.
- **Evidence** — this follows from what I read.
- **Hypothesis** — this needs checking before it is relied on.

### 0 · Sources, Assumptions and the First Probe

Written **first**, because it is what makes everything below it worth reading.

**Sources consulted.** Every document, file or command whose output this plan rests on:

```
Source:        path, URL or command
Dated:         when it was written or last verified
Authoritative: is this the source of record, or a copy of one?
```

A plan built on a stale file is confidently wrong in a way no other section catches. Design
mockups, architecture notes, status documents and README claims all go out of date silently,
and a local copy of something is not the something. Where a source has a canonical version
elsewhere, check the copy matches it before relying on it.

**Assumptions that would invalidate this plan.** Short list, plainly worded, each one a thing
the reader can correct in a sentence:

```
Assumption:          what is being taken as true
If wrong:            what in the plan collapses
```

This is where a human's cheapest correction happens. Use it.

**The first probe.** Name the single assumption most likely to be wrong and most expensive to
discover late — then **run the read-only command that settles it, now**, and report what it
returned.

Steps are otherwise ordered by implementation logic, which means the thing that can invalidate
the whole plan gets discovered last, after everything is built on top of it. One query, one
`--dry-run`, one read as the actual role, one `curl` of the real endpoint. It is read-only, so
this phase may do it, and it is the difference between a plan and a hypothesis.

### 1 · Requested Outcome
What is being asked for, the problem behind it, the expected end behaviour, and what success
looks like. Demonstrate understanding — do not paraphrase the request back.

### 2 · Current State
What the system actually does today, from inspection: implementation, architecture, relevant
components and services, APIs, data structures, business rules, reusable code already present,
existing tests, dependencies involved.

### 3 · Root Cause or Reason for Change
For a bug: the most likely cause, with the evidence, marked verified or hypothesis. For a
feature: the capability that is missing and why the current design does not provide it.

### 4 · Scope
**In scope** — everything that must change. **Out of scope** — everything that stays as it is.
No "while we're here" refactoring.

### 5 · Affected Components
For each, with exact paths where known:

```
Component:
Current responsibility:
Required change:
Reason:
Expected impact:
```

### 6 · Detailed Execution Steps
Sequenced, and detailed enough for another engineer to follow without guessing:

```
STEP N
What:            exactly what will be done
Where:           file, service, table, resource or configuration —
                 with line numbers where they are known
Why:             why this step is necessary
How:             the intended approach
Change:          the edit itself — before and after (see below)
Expected Result: what is true once it is done
Reversible:      yes — how it is undone
                 no  — why it is a one-way door
Who:             me, or the user (and why it cannot be done for them)
```

**`Change` is the field a reader can check.** "Update the header component" is an instruction;
nobody reading it can tell whether you opened the right file. Show the edit:

```
Change:   web/components/Header.tsx:18-24

          - before -
          <nav className="flex gap-6">
            {LINKS.map((l) => <NavLink key={l.href} {...l} />)}
          </nav>

          - after -
          <a href={DOWNLOAD_URL} aria-label="Download the app">
            <DownloadIcon className="h-5 w-5" />
          </a>
```

- **Copy the before block out of the file. Do not retype it from memory.** It is the evidence
  that the file was read at the line the step claims, and a remembered one proves nothing.
- Excerpt the lines that change plus enough context to place them. Never paste a whole file.
- For a new file, show its content — or its skeleton if it is long, and say which.
- For one edit repeated across many files, show it once in full and list the remaining paths
  with their line numbers.
- Where the exact text cannot be known until an earlier step has run, write `Not yet verified.`
  and say what will settle it. An invented before block is worse than an absent one.
- For a step that changes no code — a decision, a login, a deploy, a release — write
  `Change: n/a — <why>`.

**`Reversible` is not paperwork.** A migration that has been applied, a deploy that has gone
out, a phone number that has been published, a row that has been deleted — each is a door that
only opens one way, and each deserves more care in the step before it than in the step after.
A plan that marks them cannot edit one absent-mindedly.

**`Who` stops the handoff being a surprise.** Interactive logins, live-database pushes, a device
somebody has to hold, a click in somebody else's console — naming these up front, and where in
the sequence they fall, turns "I am blocked, over to you" into something the reader saw
coming and could have done in advance.

### 7 · Data Flow
When it applies, the resulting path through the system — request to response, or event to
side effect. Draw the real one, not a generic diagram.

### 8 · Business Rules
The rules that must still hold afterwards: limits, ownership, permissions, state transitions,
retention, archiving, money handling.

### 9 · Edge Cases
Realistic ones for *this* change: missing or null data, duplicates, concurrency, partial
failure, retries, permission failure, invalid state, archived or historical records. Do not
pad the list.

### 10 · Security Impact
Authentication, authorisation, IAM, secrets, PII, database grants, storage access, API surface,
input validation, audit logging, external integrations. If there is none, say exactly:

> No material security impact identified.

### 11 · Risks
```
Risk:
Impact:
Likelihood:
Mitigation:
```
Real risks this change introduces — not a generic list.

### 12 · Testing Strategy
How the work will actually be proved: unit, integration, API, functional, UI, negative,
permission, database verification, regression, infrastructure validation, build, lint, types.

**Compiling is not evidence that a feature works.** Say what will be observed, and where.

### 13 · Acceptance Criteria
Observable pass/fail statements that test the user's outcome, not the implementation:

```
[ ] …
[ ] …
```

### 14 · Files Expected to Change
```
MODIFY
- path   Reason: …

CREATE
- path   Reason: …

DELETE
- path   Reason: …
```
Verified paths only. If a path is not yet known, say so rather than inventing one.

### 15 · Things That Will NOT Change
Related areas deliberately left alone, so scope creep is visible if it happens.

### 16 · Final Execution Summary
Problem · proposed solution · components affected · main steps · main risks · testing approach ·
expected outcome. Short enough to read in one go.

### 17 · Landing Order and Coupling

When the change spans more than one artifact — schema and application, application and website,
data and code — say what must land, in what order, and **what is broken in between**.

```
Artifacts:   e.g. migration · mobile build · web deploy
Order:       which lands first, and why
Must be simultaneous: anything that cannot be separated, and what breaks if it is
Intermediate states:  after step 1 but before step 2, what is the system doing?
```

The intermediate state is the part people skip and then live through. A migration that revokes a
grant while the site still calls it; an app that writes a column the database does not have yet;
a view replaced before the code that reads it ships. Each of those is invisible in a plan that
lists only the end state, and each is a real outage for however long the gap lasts.

If everything is in one artifact, say so in a line and move on.

## Stopping

End the response with these two lines, exactly, and nothing after them:

```
PLAN READY. No implementation changes have been executed.

Invoke /proceed to execute this plan.
```

### What does not count as approval

None of these authorise execution, in any language, however emphatic:

> yes · ok · okay · looks good · continue · go · go ahead · do it · sounds good · approved ·
> perfect · 👍 · proceed with it · start · begin

Only the literal command **`/proceed`** does.

If the user replies with any of the above, do not start. Say that `/proceed` is what releases
the gate, and wait. This will occasionally feel pedantic; it is the one rule that makes the
gate worth having, because a gate that opens to enthusiasm is not a gate.

**Questions are still answerable.** If the user asks something about the plan, answer it, revise
the plan if they ask for changes, and end again with the same two lines. Revising a plan is
planning; it does not consume the gate and it does not open it.

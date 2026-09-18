---
name: proceed
description: Execute the plan most recently produced by /planfirst, in sequence and within its scope, then test, verify against the acceptance criteria and report honestly. Refuses when no plan exists. Stops and asks again when a discovery makes the approved plan materially wrong, rather than silently changing it. Use when /proceed is invoked.
---

# /proceed — execute the approved plan

`/proceed` is the second authority level. `/planfirst` granted permission to look; this grants
permission to change — **that plan, that scope, nothing adjacent.**

```
EXECUTE → TEST → VERIFY → REPORT
```

## First, is there a plan?

Look back through the current conversation for a plan produced by `/planfirst` and not yet
executed. If there is none, change nothing and reply exactly:

```
NO APPROVED PLAN FOUND.

Run /planfirst first.
```

Do not offer to do the work anyway, and do not reconstruct a plan from memory of the
conversation so that there is something to approve. The whole value of the gate is that the
human saw the plan before it became code; a plan invented at this moment was seen by nobody.

**Check the plan is still true before trusting it.** Time may have passed, the user may have
edited files, another session may have run. Re-read the handful of things the plan depends on
most — the files it means to modify, the schema it assumes, the dependency it expects. If the
ground has moved, that is a deviation (below), not a reason to press on.

## Executing

1. **Follow the steps in order.** The sequence was reasoned about; do not reorder it for
   convenience.
2. **Stay inside the scope.** The plan has an "Out of scope" and a "Things That Will NOT
   Change" section. They are instructions, not commentary.
3. **Do not expand scope silently.** Anything the plan did not name is a deviation.
4. **Reuse what is there.** Existing architecture, patterns, helpers, components. A plan that
   said "extend X" is not satisfied by writing a second X.
5. **Do not duplicate existing functionality**, do not refactor unrelated code, do not add
   speculative features, do not change architecture the plan did not call for.
6. **Validate as you go.** After each major stage, check the thing you just did actually holds
   — the file compiles, the query returns, the migration applies in a transaction that rolls
   back. Finding a mistake three steps later costs more than finding it now.
7. **Say what you are doing while long work runs**, so the user can interrupt cheaply.

## When the plan turns out to be wrong

Investigation is imperfect and the system is the authority. During execution you may find the
architecture differs from what you read, a dependency is absent, the schema is not what it
looked like, a security problem appears, a step risks data loss, part of the problem is already
solved, another component must change, a destructive operation becomes necessary, or the scope
must grow materially.

**Do not quietly do the new thing.** The user approved a plan, not an outcome. Stop where you
are, leave the work in a coherent state, and print:

```
PLAN DEVIATION REQUIRED

Original Plan:
[the approved step this contradicts]

New Discovery:
[what was found, and how it was established]

Why the Original Plan Cannot Continue:
[reason]

Proposed Change:
[the new approach]

Affected Scope:
[new files, components, services, tables]

Risk:
[new risks this introduces]

Execution is paused.

Invoke /proceed to approve the revised plan.
```

Then wait. `/proceed` again approves the revision. Nothing else does — the same words that do
not open the first gate do not open this one.

A deviation is not a failure. Catching one is the workflow working; the failure is noticing and
carrying on regardless.

### What is not a deviation

Small choices the plan left open — a variable name, the order of two independent edits, an
obvious import. Use judgement. If it would surprise the person who approved the plan, it is a
deviation.

## Finishing

Verify before claiming. Run the **Testing Strategy** the plan specified, then compare what
exists against the **Acceptance Criteria** — each one ticked because it was observed, not
because the code looks as though it should satisfy it.

**Compiling is not evidence.** Neither is "the edit applied cleanly". A criterion is met when
something was run and its output read.

Report:

```
EXECUTION COMPLETE

Implemented:
- …

Changed:
- …

Tests Performed:
- …

Acceptance Criteria:
[x] … — how it was verified
[x] …
[ ] … — not met, and why

Verification:
- the commands run and what they printed

Not Completed:
- …

Remaining Risks:
- …
```

Rules for that report:

- **Never tick a criterion that was not observed.** An unticked box with a reason is a useful
  report; a ticked box that was assumed is a lie that costs somebody an afternoon.
- **If tests failed, say so and show the output.** A failure reported plainly is a result. A
  failure described as "complete, with some follow-ups" is not.
- **If a step was skipped, say which and why.**
- Read every number and path from the actual output, never from what was intended.

If the work could not be finished, say what *is* done, what state the system is in, and what
the next step would be. A partial result described accurately is worth more than a complete
one described optimistically.

## Scope of these two skills

They are deliberately general: software, bug fixing, UI, backend, databases, DevOps,
infrastructure, cloud, security, CI/CD, observability, refactoring, configuration and
architecture all use the same two authority levels. Nothing here assumes a language, a
framework, a cloud or a repository layout.

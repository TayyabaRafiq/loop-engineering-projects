# Project 6 — The Doorbell Loop

## Purpose

This project demonstrates an **event-driven GitHub Pull Request review loop**
using a Claude Code Routine: a PR event on GitHub ("the doorbell rings")
automatically wakes an automated reviewer, which inspects the change and
responds — with no human manually triggering the review.

```
GitHub PR event → Claude Routine → automated code review → review comment on the PR
```

This project illustrates two concepts from the Loop Engineering course:

- **Concept 7: Event-driven** — the review loop is woken by a real GitHub
  webhook event (a pull request being opened, or updated with a new commit),
  not by polling or a fixed schedule.
- **Concept 10: Connectors** — the Claude GitHub App is the connector that
  lets a Claude Code Routine subscribe to and receive GitHub events for a
  specific repository.

## The application

A minimal calculator module, just complex enough to carry a bug:

- `src/calculator.py`
  - `add(a, b)` — returns `a + b`
  - `subtract(a, b)` — returns `a - b`
- `tests/test_calculator.py` — pytest tests covering both functions

Run the tests from this directory:

```
.venv/bin/python -m pytest
```

Expected baseline result: **2 passed** (both `test_add` and `test_subtract`
pass against the correct implementation).

## The demonstration

1. A clean calculator baseline was created — `add`/`subtract` both correct,
   `pytest` reported `2 passed`.
2. A deliberate, single-line bug was planted: `subtract()` was changed from
   `return a - b` to `return a + b`, so it added instead of subtracting.
3. The bug was pushed on branch `project-6-planted-bug` and opened as
   **PR #2** (`Project 6: test automated PR review`) against `main`.
4. A Claude Code Routine — configured with a GitHub Pull Request trigger and
   scoped to review changes under `project-6-doorbell-loop/` — reviewed the
   PR and correctly identified the planted `subtract()` bug.
5. A harmless, comment-only commit (no behavior change) was pushed to the
   same PR branch.
6. The Routine's saved trigger (**GitHub → Pull Request → commit push**)
   automatically started a new Routine run within seconds of the push —
   with no manual "Run now" click and no manual API invocation.
7. This automatic run demonstrated the event-driven heartbeat: the loop
   reacts on its own to new GitHub activity on an open PR.

### A note on manual testing, for honesty's sake

During initial setup and troubleshooting, the **first** review of the
planted bug was triggered manually via the Routine's "Run now" button, while
we were confirming the GitHub App installation and webhook wiring. The
**later heartbeat test** — pushing a comment-only commit to the same PR —
was **not** manually invoked in any way; the resulting Routine run was
observed to start automatically after the push, which is the actual
event-driven behavior this project sets out to demonstrate.

## Status

The planted bug has been reverted in the final version of this project —
`subtract()` is correct, and `pytest` reports `2 passed`. The bug lives on
in PR #2's history as the evidence of the review loop working, but the
`main`-bound final code is correct.

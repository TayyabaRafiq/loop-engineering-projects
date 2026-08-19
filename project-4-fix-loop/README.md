# Project 4 — Fix Loop

A small **maker-checker fix loop** using OpenCode to implement and independently review a real bug fix.

## Concepts Demonstrated

- **Concept 8 — Worktree:** The implementer works in a separate Git worktree.
- **Concept 9 — Skill:** The implementer and reviewer follow written skill instructions.
- **Concept 11 — Maker-Checker:** A separate reviewer evaluates the implementation and returns `PASS` or `FAIL`.

## The Bug

The original `average()` function crashed when given an empty list:

```text
ZeroDivisionError: division by zero
```

## Good Fix

OpenCode implemented a small fix by checking for an empty list before calculating the average.

```python
if not numbers:
    return 0
```

The expected behavior is:

```python
average([]) == 0
```

Tests passed:

```text
2 passed
```

The independent OpenCode reviewer inspected the change and returned:

```text
Decision: PASS
```

The approved implementation was pushed to the `project-4-implementer` branch for the pull request.

## Deliberately Bad Fix

To verify that the checker was not too soft, a deliberately bad implementation was planted:

```python
if not numbers:
    return 999
```

The expected behavior is still:

```python
average([]) == 0
```

The test suite detected the incorrect result:

```text
assert 999 == 0
```

The independent OpenCode reviewer correctly rejected the bad implementation:

```text
Decision: FAIL
```

This proves that the checker does not approve every change.

The bad implementation was **not used for the pull request**.

## Loop

```text
Real Bug
   ↓
OpenCode Implementer
   ↓
Implementer Skill
   ↓
Git Worktree
   ↓
Implement Fix
   ↓
OpenCode Reviewer
   ↓
   ├── PASS → Create PR
   │
   └── FAIL → Reject / Fix Again
```

## Project Structure

```text
project-4-fix-loop/
├── README.md
├── bug_demo.py
├── skills/
│   ├── implementer.md
│   └── reviewer.md
└── tests/
    ├── __init__.py
    └── test_bug_demo.py
```

## Run Tests

From the `project-4-fix-loop` directory:

```bash
pytest
```

Expected result:

```text
2 passed
```

## Result

The project demonstrates a complete fix loop:

**Implement → Test → Review → PASS/FAIL → PR only after PASS**
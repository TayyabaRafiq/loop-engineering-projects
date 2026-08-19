# Project 2 — Make the Tests Pass

A minimal demonstration of a **conditional loop** in Loop Engineering.

## How It Works

The agent fixes the implementation, then `pytest` checks the result.

```text
OpenCode fixes code
       ↓
     pytest
       ↓
   Tests pass?
    /     \
   No      Yes
   ↓        ↓
 Repeat    Stop
```

The loop continues while tests fail and stops only when `pytest` passes.

## Project Files

- `portfolio.py` — Implementation that the agent fixes
- `test_portfolio.py` — Tests and source of truth
- `run-loop.sh` — Conditional loop controller

## Run

### 1. Activate the virtual environment

```bash
source .venv/bin/activate
```

### 2. Run the conditional loop

```bash
./run-loop.sh
```

The loop will:

1. Ask OpenCode to fix the implementation.
2. Run `pytest`.
3. If tests fail, repeat.
4. If all tests pass, stop.

## Verify Tests Manually

Run:

```bash
pytest
```

Expected result:

```text
3 passed
```

## Key Concept

**The test result is the stopping condition — not the agent's claim that the task is complete.**
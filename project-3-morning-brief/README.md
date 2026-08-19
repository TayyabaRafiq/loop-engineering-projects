# Project 3 — Morning Brief with Memory

A minimal demonstration of a **scheduled loop** with persistent memory.

## Concepts

- **Concept 6 — Unattended Schedule**
- **Concept 12 — The Spine**

## How It Works

```text
Scheduled Run 1
      ↓
Read progress.md
      ↓
Find TODOs
      ↓
Save results to progress.md
      ↓
Wait
      ↓
Scheduled Run 2
      ↓
Read progress.md
      ↓
Skip already recorded TODOs
      ↓
Stop
```

## Project Files

- `morning_brief.py` — Reads TODOs and updates memory
- `progress.md` — Persistent memory / spine
- `TODO.md` — Simple repository information source
- `run-loop.sh` — Runs the morning brief twice automatically

## Run

### 1. Activate the virtual environment

```bash
source .venv/bin/activate
```

### 2. Run the scheduled loop

```bash
./run-loop.sh
```

The loop runs twice with a 10-second delay between runs.

## Expected Result

**Run 1:**

```text
- Add project documentation
- Review test coverage
- Improve error handling
```

**Run 2:**

```text
No new TODO items found.
```

The second run reads `progress.md` and does not repeat what the first run already recorded.

## Key Concept

**`progress.md` is the spine: the second run builds on the memory created by the first run.**
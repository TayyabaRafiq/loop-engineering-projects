# Project 1 — Watch the Space Station

## Overview

This project watches the International Space Station in real time. Every 60 seconds it fetches
the station's live position from a public API and displays it on screen — latitude, longitude,
altitude, speed, and sunlight status.

The ISS is a perfect subject for learning loops because it never stops moving. At roughly 7.7
kilometres per second, the ISS travels hundreds of kilometres in a minute, so an old position
quickly becomes outdated. You cannot guess where it is — you have to ask again and again. That
is exactly what a loop does.

## Learning Objective

This project demonstrates **Concept 4 — In-session loops**: a task that repeats on a timer for
as long as the current process is running.

## Concept 4 — In-Session Loop

An in-session loop is the simplest kind of repeating task. It works like a kitchen timer:

- **heartbeat = timer.** Each cycle is one beat. The loop fires, does its work, waits, and fires
  again.
- **Task repeats at a fixed interval.** In this project the interval is 60 seconds — one ISS
  fetch per minute.
- **The loop exists only while the current process is running.** There is no schedule saved to
  disk, no background daemon. The loop lives in memory.
- **Stopping the process stops the loop.** Close the terminal or press Ctrl+C and the loop ends
  immediately.

## How This Project Works

```
run_loop.py
  → runs iss.py
  → iss.py fetches live ISS data from the public API
  → prints the display card
  → waits 60 seconds
  → runs iss.py again
  → repeats until you stop it
```

## Project Structure

```
├── AGENTS.md                                          # Instructions for any AI agent
├── CLAUDE.md                                          # Imports AGENTS.md for Claude Code
├── .claude/
│   └── skills/
│       └── iss-position/
│           ├── SKILL.md                               # Skill definition for the ISS fetcher
│           └── scripts/
│               └── iss.py                             # Fetches and displays live ISS data
├── run_loop.py                                        # The in-session loop runner
└── README.md                                          # This file
```

| File | Purpose |
| --- | --- |
| `AGENTS.md` | Tells any AI agent how to interact with the project — always fetch, never guess. |
| `CLAUDE.md` | One line that imports `AGENTS.md` so Claude Code reads the same instructions. |
| `.claude/skills/iss-position/SKILL.md` | Defines the ISS skill: when to use it, how to display results, and what to do when a fetch fails. |
| `.claude/skills/iss-position/scripts/iss.py` | The script that actually calls the public ISS API and prints the display card. |
| `run_loop.py` | Wraps `iss.py` in a `while True` loop with a 60-second sleep between each run. |

## ISS Data

The script fetches from the public API at `https://api.wheretheiss.at/v1/satellites/25544`.
No API key is required. Each reading returns:

- **Latitude** — how far north or south of the equator
- **Longitude** — how far east or west of the prime meridian
- **Altitude** — height above Earth's surface in kilometres
- **Speed** — ground speed in km/h
- **Sunlight** — whether the station is in daylight or darkness

## How the Loop Works

Here is the complete logic from `run_loop.py`:

```python
def main():
    iteration = 0
    try:
        while True:
            iteration += 1
            print(f"\n--- ISS Loop Iteration {iteration} ---")
            subprocess.run([sys.executable, SCRIPT], check=False)
            time.sleep(INTERVAL)
    except KeyboardInterrupt:
        print("\nIn-session loop has stopped.")
```

Line by line:

- **`while True:`** — creates an infinite loop. It will keep running forever unless something
  breaks it.
- **`subprocess.run([sys.executable, SCRIPT], check=False)`** — launches `iss.py` as a separate
  process. `sys.executable` ensures it uses the same Python that is running `run_loop.py`.
- **`time.sleep(60)`** — pauses for 60 seconds before the next iteration. This is the heartbeat
  interval.
- **`except KeyboardInterrupt:`** — catches Ctrl+C. When you press it, the loop prints a clean
  exit message and stops.

## How to Run

**Single reading** — fetch the ISS position once:

```bash
python3 .claude/skills/iss-position/scripts/iss.py
```

**Repeating loop** — watch the ISS every 60 seconds:

```bash
python3 run_loop.py
```

Press **Ctrl+C** to stop the loop.

## Test Result

I ran `run_loop.py` and captured four consecutive iterations. Each reading was fetched live from
the public API — this is not simulated data.

| | UTC Time | Position | Altitude | Speed |
| --- | --- | --- | --- | --- |
| Iteration 1 | 11:16:12 | 0.3° N, 35.7° E | 421 km | 27,570 km/h |
| Iteration 2 | 11:17:13 | 2.8° S, 37.9° E | 422 km | 27,567 km/h |
| Iteration 3 | 11:18:15 | 5.9° S, 40.1° E | 423 km | 27,564 km/h |
| Iteration 4 | 11:19:16 | 9.0° S, 42.4° E | 424 km | 27,561 km/h |

These readings clearly demonstrate repeated live API fetching. The ISS moved roughly 8.7 degrees
of latitude south and 6.7 degrees of longitude east across the four minutes. The changing values
demonstrate that each iteration is fetching fresh live data.

The loop was stopped with Ctrl+C and printed:

```
In-session loop has stopped.
```

## Why This Is an In-Session Loop

This qualifies as Concept 4 because the loop's lifetime is tied to the process:

```
Session/process running
  → loop running
  → repeated ISS fetches every 60 seconds

Session/process stopped (Ctrl+C or terminal closed)
  → loop stops immediately
```

There is no external scheduler, no background service, and nothing written to disk. The loop
exists only in the running Python process. When that process ends, the loop ends. That is the
definition of an in-session loop.

## OpenCode Adaptation

The original course project is designed around Claude Code's `/loop` command, which provides a
built-in mechanism for scheduling repeated tasks within a session. This implementation uses
**OpenCode with a free model**, which does not have an equivalent `/loop` command.

Instead, the same engineering concept is demonstrated with a Python loop in `run_loop.py`:

- **`while True`** — the repeating mechanism
- **`time.sleep(60)`** — the fixed-interval timer
- **`subprocess.run()`** — the repeated task execution
- **`KeyboardInterrupt`** — clean shutdown when the session ends

The underlying loop pattern remains the same: a task is triggered repeatedly at a fixed interval
while the process is running.

## What I Learned

Working on this project taught me that a loop does not need to be complicated to be useful. A
`while True` with a sleep timer is enough to build a real-time monitoring system. I learned that
the ISS moves fast enough that you cannot rely on cached or remembered data — you must fetch it
live every single time. I also learned that stopping a loop cleanly matters: using
`KeyboardInterrupt` lets the program shut down gracefully instead of crashing.

## Key Takeaways

- **In-session loops repeat while the process runs and stop when it stops.** They are temporary
  by nature — like a kitchen timer that only rings while you are in the kitchen.
- **`while True` + `time.sleep()` is the simplest loop pattern.** One line to repeat, one line
  to set the interval.
- **Live data requires live fetching.** The ISS moves 7.7 km/s. Any position not fetched right
  now is already wrong.
- **Clean shutdown matters.** Catching `KeyboardInterrupt` lets the loop end gracefully instead
  of leaving a traceback.
- **Python's `subprocess` module lets you run scripts from scripts.** `run_loop.py` does not
  import `iss.py` — it launches it as a separate process, keeping the two concerns independent.
- **The engineering concept is tool-agnostic.** Whether the loop comes from Claude Code's
  `/loop` command or a Python `while True`, the pattern is the same.

## Technologies Used

- **Python 3** — the runtime for both the loop and the ISS fetcher
- **OpenCode** — the AI coding assistant used in this project
- **Public ISS API** — `https://api.wheretheiss.at/v1/satellites/25544` (no key required)
- **WSL/Ubuntu** — the development environment

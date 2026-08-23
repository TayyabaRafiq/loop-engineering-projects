# Project 5 — Codify the Body

## Description

This project turns the manually-driven "maker-checker" fix loop from Project 4 into a **reusable, dynamic Claude Code workflow**. Instead of a human walking the implementer/reviewer steps by hand for one hardcoded bug, a single saved workflow script reads a list of candidate bugs from `candidates.json` at run time, fixes each one in its own isolated Git worktree in parallel, and has an independent reviewer agent grade each fix with a PASS/FAIL verdict.

## Objective

Codify the "body" of the fix loop — the implement → review → verdict sequence — as a script-driven, dynamic workflow (not a hand-orchestrated sequence of subagent calls), and prove it is:

- **Dynamic**: driven entirely by `candidates.json`, not hardcoded per-candidate logic.
- **Parallel**: candidates are implemented concurrently, each in full isolation.
- **Reusable**: saved once, invokable by name from any future session with no script resent.

## Concepts demonstrated

**Concept 8 — Parallel Work**
Three implementer agents run simultaneously, each confined to its own Git worktree touching only its own file (`calculator.py`, `string_utils.py`, `list_utils.py`). No shared state, no file collisions. Reviewers likewise run independently and in parallel against their candidate's finished worktree.

**Concept 11 — Dynamic Workflows**
The body is a JavaScript workflow script (`agent()` / `pipeline()` calls executed by Claude Code's `Workflow` runtime), not an ad hoc sequence of subagent calls decided turn-by-turn in conversation. It reads `candidates.json` at run time and fans out however many candidates are listed — adding a `candidate-4` tomorrow requires no script change.

## How the dynamic workflow works

```
candidates.json
  → dynamic candidate discovery      (agent reads and parses candidates.json)
  → isolated worktrees                (agent runs `git worktree add` per candidate, pinned to a fixed base commit)
  → parallel implementers             (one agent per candidate, each confined to its own worktree/file)
  → independent reviewers             (a second, separate agent per candidate — never sees the implementer's reasoning)
  → PASS/FAIL verdicts                (aggregated and returned as the workflow's result)
```

The candidate list, the worktree setup, and the implement/review pipeline are all driven by data (`candidates.json`) and by the `pipeline()` primitive in the workflow script — nothing about which candidates exist or how many there are is hardcoded.

## The three candidates and their outcomes

| id | file | bug | outcome |
|---|---|---|---|
| `candidate-1` | `calculator.py` | `average([])` raises `ZeroDivisionError` (expected: `average([]) == 0`) | **PASS** — fixed with `if not numbers: return 0`; independently re-run by the reviewer |
| `candidate-2` | `string_utils.py` | `reverse_words()` leaves a stray trailing space when reversing word order | **PASS** — fixed by removing the erroneous trailing space in the join |
| `candidate-3` | `list_utils.py` | `dedupe()` loses first-occurrence order (used an unordered `set()`) | **PASS** — fixed with an order-preserving seen-set loop |

During earlier development (before the saved workflow existed), one deliberately bad fix was injected for `candidate-1` — it returned `-1` instead of `0` for an empty list — specifically to prove the reviewer isn't a rubber stamp. The independent reviewer correctly returned **FAIL** with evidence (`assert -1 == 0`), while the two genuinely correct fixes for candidate-2 and candidate-3 correctly returned **PASS**. That confirmed the review step catches bad fixes, not just approves whatever the implementer produces. The final, saved workflow (with real, non-adversarial fixes for all three) was then run twice more end-to-end, producing PASS/PASS/PASS both times.

## The worktree/base-commit issue

Early runs used the `Agent` tool's built-in `isolation: "worktree"` option, which auto-creates a worktree from the repository's default base ref rather than a ref chosen by the script. In this repo, `origin/main` had diverged from local `main` (a GitHub PR had merged separately upstream), so every auto-created worktree silently landed on `origin/main`'s commit — a commit that predated Project 5 entirely, meaning `project-5-codify-the-body/` didn't even exist in it. The implementer agents caught this via a `git log -1 --oneline` sanity check and self-corrected by importing the missing baseline, but that meant the workflow was silently depending on an unpinned, unreliable base state instead of a known-good one.

The fix: the final workflow does **not** use `isolation: "worktree"` at all. Instead, a dedicated "Setup worktrees" phase runs a plain (non-isolated) agent that explicitly creates each worktree with:

```
git worktree add -b p5-<id> <path> 22dacf2
```

pinning every candidate to the literal local commit `22dacf2` (not `main`, `HEAD`, or `origin/main`). Each worktree is then independently verified — `git log -1 --oneline` must start with `22dacf2`, and `candidates.json` must exist at the expected path — before any implementer touches it. If verification fails for a candidate, that candidate is marked `blocked` and skipped rather than being silently "fixed" by checkout/cherry-pick/merge tricks.

## Independent reviewer checks

Each reviewer is a separate agent from the implementer, with no visibility into the implementer's reasoning, working in the same already-built worktree. Per `skills/reviewer.md`, it must:

1. Confirm it's on the expected branch (`git branch --show-current`).
2. Inspect the actual diff (`git log`, `git show`) and confirm only the candidate's assigned file was changed.
3. Confirm the test file itself was not weakened, deleted, or bypassed.
4. Independently re-run the test itself — it does not trust the implementer's self-reported result.
5. Never modify, merge, or push anything.
6. Return exactly `PASS` or `FAIL` with evidence — never `PASS` just because the code "looks reasonable."

## Reusable workflow

The workflow is saved as a reusable Claude Code artifact at:

```
.claude/workflows/project5-draft-review.js
```

and can be invoked at any time with:

```
/project5-draft-review
```

It was verified across two independent full re-invocations from the saved file (not a resent script), each producing a clean PASS/PASS/PASS run, with the temporary `p5-candidate-*` worktrees and branches cleaned up between runs.

## Fresh-session test

To prove the workflow's behavior lives entirely in the persisted script — not in this conversation's memory — a genuinely separate `claude -p` process (its own OS process, with zero access to this session's history) was launched and asked to read `.claude/workflows/project5-draft-review.js` from disk. It correctly reconstructed the workflow's full behavior from scratch — all four phases, the pin-to-`22dacf2` design, the verification/blocking safety checks — using only what was written to disk. It stopped short of actually executing (it asked for confirmation before calling the `Workflow` tool, and `-p` mode has no way to answer that), so it demonstrates memory-independence rather than a third live execution. Given two prior successful end-to-end runs already on record, a third run wasn't judged necessary to prove the point.

## Engine vs. Loop

It's important to be precise about what this project is and isn't.

**What was built is an engine**: a correct, repeatable, dynamically-invoked workflow. Given an invocation — by a human typing `/project5-draft-review`, or a script calling `Workflow({name: "project5-draft-review"})` — it reliably runs candidates → isolated worktrees → implement → independent review → PASS/FAIL, every time, from data.

**A true autonomous loop would additionally need:**

a) **A heartbeat / scheduler / event trigger** — something that invokes the workflow on its own, without a human typing the command. For example, a cron-scheduled routine or an event-driven trigger (a webhook firing when `candidates.json` changes, or a new issue is filed). Nothing like this exists yet; every run so far has been started by a person.

b) **A persistent progress file / spine** — a record of prior runs (e.g. a `progress.json` mapping candidate → last verdict → last run → branch) so each run can build on the last instead of reprocessing everything from scratch against a base commit that never advances. Right now every run is stateless: it has no memory of which candidates already passed.

Both of these were identified as the deliberate next requirements for turning this engine into a real loop, but **neither was implemented in Project 5** — they were left out on purpose so the engine itself could be verified in isolation first.

## No merge or push

At no point did the workflow (or any agent it spawned) merge, rebase, or push anything. All implementer commits live only on temporary `p5-candidate-*` branches inside disposable worktrees under `.claude/worktrees/`, pinned to and diverging from local commit `22dacf2`. `main` and `origin/main` were never touched by any workflow run. The temporary worktrees/branches from completed runs were manually inspected and removed between runs as routine cleanup — not as part of the workflow itself.

## Project Status

Project 5 requirements are complete as scoped: a working, dynamically-invoked, parallel draft-and-review engine — reusable, independently reviewed, and verified across multiple fresh invocations — with the heartbeat and progress-spine correctly identified as the next steps rather than built prematurely.

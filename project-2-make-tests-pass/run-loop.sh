#!/bin/bash

MAX_ATTEMPTS=6

for ((attempt=1; attempt<=MAX_ATTEMPTS; attempt++)); do
    echo ""
    echo "========================================"
    echo "Attempt $attempt of $MAX_ATTEMPTS"
    echo "========================================"

    echo "🤖 Asking OpenCode to fix the implementation..."

    opencode run "
You are the implementation agent for Project 2.

Read the existing test_portfolio.py and portfolio.py.
The tests are intentionally failing.

Your task is to fix ONLY the implementation in portfolio.py so that ALL existing tests pass.

Rules:
- Do NOT modify test_portfolio.py.
- Do NOT delete or weaken any tests.
- Do NOT change the test expectations.
- Fix the implementation instead.
- Run pytest after making your changes.
- Work only in the current project directory.
- Do not commit or push anything.

The pytest results are the source of truth.
Do not claim success unless pytest actually passes.
"

    echo ""
    echo "🔍 Running pytest..."

    if pytest; then
        echo ""
        echo "✅ PASS — All tests passed."
        echo "🛑 STOP — Conditional loop complete."
        exit 0
    else
        echo ""
        echo "❌ FAIL — Tests are still failing."
        echo "🔄 Continuing to next attempt..."
    fi
done

echo ""
echo "🛑 STOP — Maximum of $MAX_ATTEMPTS attempts reached."
exit 1
#!/bin/bash

MAX_RUNS=2
DELAY=10

for ((run=1; run<=MAX_RUNS; run++)); do
    echo ""
    echo "========================================"
    echo "Scheduled Morning Brief — Run $run"
    echo "========================================"

    python3 morning_brief.py

    if [ "$run" -lt "$MAX_RUNS" ]; then
        echo ""
        echo "Waiting $DELAY seconds for the next scheduled run..."
        sleep "$DELAY"
    fi
done

echo ""
echo "Scheduled loop completed."
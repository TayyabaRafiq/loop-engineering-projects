#!/usr/bin/env python3
"""Run the ISS position script in a loop every 60 seconds."""

import subprocess
import sys
import time

SCRIPT = ".claude/skills/iss-position/scripts/iss.py"
INTERVAL = 60  # seconds


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


if __name__ == "__main__":
    main()

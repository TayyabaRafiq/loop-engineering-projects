from datetime import date
from pathlib import Path

PROGRESS_FILE = Path("progress.md")
TODO_FILE = Path("TODO.md")


def read_previous_progress():
    return PROGRESS_FILE.read_text()


def read_todos():
    lines = TODO_FILE.read_text().splitlines()
    return [line.strip() for line in lines if line.strip().startswith("- ")]


def main():
    previous = read_previous_progress()
    todos = read_todos()

    recorded = set()

    for line in previous.splitlines():
        if line.startswith("- "):
            recorded.add(line.strip())

    new_todos = [todo for todo in todos if todo not in recorded]

    today = date.today().isoformat()

    if new_todos:
        summary = "\n".join(new_todos)
    else:
        summary = "No new TODO items found."

    print("=== Morning Brief ===")
    print(f"Date: {today}")
    print(summary)

    with PROGRESS_FILE.open("a") as file:
        file.write(f"\n## Run — {today}\n")
        file.write(summary + "\n")


if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""Append a diary entry to Obsidian monthly diary file.

Trigger contract:
- Input text's first line starts with '日记'
- Diary body is text from line 2 onward

File:
- Vault: /Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB
- Diary monthly file: 000-日记/YYYY-MM.md
- Create file with heading '# YYYY-MM' if missing
- Append:

\n---
YYYY-MM-DD HH:MM

<body>

Exit codes:
- 0 success (prints written file path)
- 2 not a diary message
- 3 diary message but empty body
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
import sys


VAULT = Path(
    "/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB"
)
DIARY_DIR = "000-日记"


@dataclass
class Parsed:
    body: str


def parse(text: str) -> Parsed | None:
    # Normalize newlines
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    lines = text.split("\n")
    if not lines:
        return None
    first = lines[0].strip()
    if not first.startswith("日记"):
        return None
    body = "\n".join(lines[1:]).lstrip("\n")
    body = body.rstrip()
    return Parsed(body=body)


def ensure_month_file(now: datetime) -> Path:
    month = now.strftime("%Y-%m")
    out_dir = VAULT / DIARY_DIR
    out_dir.mkdir(parents=True, exist_ok=True)

    path = out_dir / f"{month}.md"
    if not path.exists():
        path.write_text(f"# {month}\n", encoding="utf-8")
    return path


def append_entry(path: Path, now: datetime, body: str) -> None:
    stamp = now.strftime("%Y-%m-%d %H:%M")
    entry = f"\n\n---\n{stamp}\n\n{body}\n"
    with path.open("a", encoding="utf-8") as f:
        f.write(entry)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--text",
        help="Full user message (including first line '日记')",
        required=True,
    )
    args = ap.parse_args()

    parsed = parse(args.text)
    if parsed is None:
        return 2
    if not parsed.body.strip():
        return 3

    now = datetime.now()  # local time (Asia/Shanghai by system config)
    month_file = ensure_month_file(now)
    append_entry(month_file, now, parsed.body)

    print(str(month_file))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

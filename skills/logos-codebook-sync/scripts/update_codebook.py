#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import shutil
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

ENC = "utf-16le"  # file is utf-16le with BOM


@dataclass
class Entry:
    text: str
    code: str
    weight: str  # keep as string to preserve exact formatting


def _read_entries(path: Path) -> Tuple[List[Entry], List[str]]:
    """Return (entries, raw_lines_without_newline). Keeps original line ordering."""
    s = path.read_text(encoding=ENC)
    # Preserve potential BOM at start of file
    lines = s.splitlines()

    raw_lines: List[str] = []
    entries: List[Entry] = []
    for i, line in enumerate(lines):
        if i == 0 and line.startswith("\ufeff"):
            line = line.lstrip("\ufeff")
            # Keep BOM in raw_lines via a marker; we will re-add on write.
            raw_lines.append("\ufeff" + line)
        else:
            raw_lines.append(line)

        # Parse
        parts = line.split("\t")
        if len(parts) != 3:
            continue
        text, code, weight = parts
        entries.append(Entry(text=text, code=code, weight=weight))

    return entries, raw_lines


def _write_lines(path: Path, lines: List[str]) -> None:
    """Write back using CRLF (\r\n), matching the original codebook format."""
    # Ensure BOM exists. If first line already has BOM, keep it; else add.
    if lines:
        if not lines[0].startswith("\ufeff"):
            lines = ["\ufeff" + lines[0]] + lines[1:]

    # 落格输入法码表（你的小鹤音形这份）原文件是 UTF-16LE + CRLF
    content = "\r\n".join(lines) + "\r\n"
    path.write_text(content, encoding=ENC)


def _backup(path: Path) -> Path:
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_dir = path.parent / ".backup"
    backup_dir.mkdir(parents=True, exist_ok=True)
    backup_path = backup_dir / f"{path.name}.{ts}.bak"
    shutil.copy2(path, backup_path)
    return backup_path


def _find_indices(raw_lines: List[str], text: Optional[str], code: Optional[str]) -> List[int]:
    idxs: List[int] = []
    for i, line in enumerate(raw_lines):
        # Handle BOM on first line
        cmp_line = line.lstrip("\ufeff") if i == 0 else line
        parts = cmp_line.split("\t")
        if len(parts) != 3:
            continue
        t, c, _w = parts
        if text is not None and t != text:
            continue
        if code is not None and c != code:
            continue
        idxs.append(i)
    return idxs


def cmd_find(mac: Path, query: Optional[str], code: Optional[str]) -> int:
    _entries, raw_lines = _read_entries(mac)
    hits = []
    for i, line in enumerate(raw_lines):
        cmp_line = line.lstrip("\ufeff") if i == 0 else line
        parts = cmp_line.split("\t")
        if len(parts) != 3:
            continue
        t, c, w = parts
        if query and (query not in t):
            continue
        if code and (c != code):
            continue
        hits.append((t, c, w))

    if not hits:
        print("(no matches)")
        return 1

    for t, c, w in hits[:200]:
        print(f"{t}\t{c}\t{w}")
    if len(hits) > 200:
        print(f"... ({len(hits)-200} more)")
    return 0


def _validate_code(code: str) -> None:
    # 小鹤音形：编码长度最多 4
    if len(code) > 4:
        raise SystemExit(f"Code too long (max 4 for 小鹤音形): {code!r}")


def cmd_add(mac: Path, icloud: Path, text: str, code: str, weight: str) -> None:
    _validate_code(code)

    _backup(mac)
    _backup(icloud)

    _entries, raw_lines = _read_entries(mac)
    idxs = _find_indices(raw_lines, text=text, code=code)
    if idxs:
        # already exists; update weight only
        i = idxs[0]
        cmp_line = raw_lines[i].lstrip("\ufeff") if i == 0 else raw_lines[i]
        t, c, _w = cmp_line.split("\t")
        new_line = f"{t}\t{c}\t{weight}"
        raw_lines[i] = ("\ufeff" + new_line) if (i == 0 and raw_lines[i].startswith("\ufeff")) else new_line
    else:
        raw_lines.append(f"{text}\t{code}\t{weight}")

    _write_lines(mac, raw_lines)
    shutil.copy2(mac, icloud)


def cmd_set(mac: Path, icloud: Path, text: str, code: Optional[str], weight: Optional[str], new_code: Optional[str]) -> None:
    if new_code is not None:
        _validate_code(new_code)

    _backup(mac)
    _backup(icloud)

    _entries, raw_lines = _read_entries(mac)

    idxs = _find_indices(raw_lines, text=text, code=code)
    if not idxs:
        raise SystemExit(f"No entry found for text={text!r} code={code!r}")
    if len(idxs) > 1 and code is None:
        raise SystemExit(f"Multiple entries found for text={text!r}. Please specify --code to disambiguate.")

    i = idxs[0]
    cmp_line = raw_lines[i].lstrip("\ufeff") if i == 0 else raw_lines[i]
    t, c, w = cmp_line.split("\t")

    if new_code is not None:
        c = new_code
    if weight is not None:
        w = weight

    new_line = f"{t}\t{c}\t{w}"
    raw_lines[i] = ("\ufeff" + new_line) if (i == 0 and raw_lines[i].startswith("\ufeff")) else new_line

    _write_lines(mac, raw_lines)
    shutil.copy2(mac, icloud)


def cmd_delete(mac: Path, icloud: Path, text: str, code: Optional[str]) -> None:
    if code is not None:
        _validate_code(code)

    _backup(mac)
    _backup(icloud)

    _entries, raw_lines = _read_entries(mac)
    idxs = _find_indices(raw_lines, text=text, code=code)
    if not idxs:
        raise SystemExit(f"No entry found for text={text!r} code={code!r}")
    if len(idxs) > 1 and code is None:
        raise SystemExit(f"Multiple entries found for text={text!r}. Please specify --code to delete one.")

    # delete from bottom to top
    for i in sorted(idxs, reverse=True):
        raw_lines.pop(i)

    _write_lines(mac, raw_lines)
    shutil.copy2(mac, icloud)


def cmd_sanitize(mac: Path, icloud: Path, dry_run: bool = False) -> None:
    """Normalize file so every line is exactly 3 tab-separated fields.

    Rules:
    - If 2 fields: append weight=0
    - If 3 fields but empty weight: set weight=0
    - If empty text or empty code: remove line (cannot import reliably)
    - If other field counts: remove line
    """
    _entries, raw_lines = _read_entries(mac)

    removed = 0
    fixed = 0
    out: List[str] = []

    for i, line in enumerate(raw_lines):
        bom = (i == 0 and line.startswith("\ufeff"))
        base = line.lstrip("\ufeff") if bom else line

        if base == "":
            removed += 1
            continue

        parts = base.split("\t")
        if len(parts) == 2:
            text, code = parts
            weight = "0"
            if text == "" or code == "":
                removed += 1
                continue
            if len(code) > 4:
                # don't hard-fail; keep but report? best to remove to avoid import error
                removed += 1
                continue
            fixed += 1
            newline = f"{text}\t{code}\t{weight}"
        elif len(parts) == 3:
            text, code, weight = parts
            if text == "" or code == "":
                removed += 1
                continue
            if len(code) > 4:
                removed += 1
                continue
            if weight == "":
                weight = "0"
                fixed += 1
            newline = f"{text}\t{code}\t{weight}"
        else:
            removed += 1
            continue

        out.append(("\ufeff" + newline) if bom else newline)

    print(f"sanitize: fixed={fixed}, removed={removed}, total_in={len(raw_lines)}, total_out={len(out)}")

    if dry_run:
        return

    _backup(mac)
    _backup(icloud)

    _write_lines(mac, out)
    shutil.copy2(mac, icloud)


def main():
    ap = argparse.ArgumentParser(description="Edit LogOS codebook on Mac then sync to iCloud")
    ap.add_argument("--mac", required=True, help="Mac local codebook path")
    ap.add_argument("--icloud", required=True, help="iCloud codebook path")

    sub = ap.add_subparsers(dest="cmd", required=True)

    sp = sub.add_parser("find", help="Find entries")
    sp.add_argument("--query", help="substring to search in text")
    sp.add_argument("--code", help="exact code match")

    sp = sub.add_parser("add", help="Add entry (or update weight if exact text+code exists)")
    sp.add_argument("--text", required=True)
    sp.add_argument("--code", required=True)
    sp.add_argument("--weight", default="0")

    sp = sub.add_parser("set", help="Update entry by text (+ optional existing code)")
    sp.add_argument("--text", required=True)
    sp.add_argument("--code", help="existing code to disambiguate")
    sp.add_argument("--new-code", help="set to new code")
    sp.add_argument("--weight", help="set to new weight")

    sp = sub.add_parser("delete", help="Delete entry by text (+ optional code)")
    sp.add_argument("--text", required=True)
    sp.add_argument("--code", help="code to disambiguate")

    sp = sub.add_parser("sanitize", help="Fix formatting so every line is: text<TAB>code<TAB>weight (weight default 0). Removes lines that can't be fixed.")
    sp.add_argument("--dry-run", action="store_true", help="only report issues, do not write")

    args = ap.parse_args()
    mac = Path(args.mac)
    icloud = Path(args.icloud)

    if args.cmd == "find":
        raise SystemExit(cmd_find(mac, query=args.query, code=args.code))
    if args.cmd == "add":
        cmd_add(mac, icloud, text=args.text, code=args.code, weight=str(args.weight))
        return
    if args.cmd == "set":
        cmd_set(mac, icloud, text=args.text, code=args.code, weight=args.weight, new_code=args.new_code)
        return
    if args.cmd == "delete":
        cmd_delete(mac, icloud, text=args.text, code=args.code)
        return
    if args.cmd == "sanitize":
        cmd_sanitize(mac, icloud, dry_run=bool(args.dry_run))
        return


if __name__ == "__main__":
    main()

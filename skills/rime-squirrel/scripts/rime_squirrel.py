#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""rime_squirrel.py

Minimal, dependency-free helper for managing macOS Rime/Squirrel user config.

Focus:
- Edit <schema>.custom.yaml punctuator mappings (half_shape/full_shape)
- Append custom phrases into flypy_user.txt / flypy_top.txt / flypy_sys.txt
- Backup before write
- Trigger deploy via rime_deployer

This script intentionally avoids YAML libraries; it performs conservative line-based edits.
"""

from __future__ import annotations

import argparse
import datetime as dt
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path


def ts() -> str:
    return dt.datetime.now().strftime("%Y%m%d-%H%M%S")


def rime_user_dir() -> Path:
    p = Path.home() / "Library" / "Rime"
    if p.is_symlink():
        try:
            return Path(os.readlink(p))
        except OSError:
            return p
    return p


def backup_file(path: Path) -> Path:
    bak = path.with_name(path.name + f".bak-{ts()}")
    shutil.copy2(path, bak)
    return bak


def ensure_custom_yaml(path: Path) -> None:
    if path.exists():
        return
    path.write_text(
        "# " + path.name + "\n# encoding: utf-8\n\npatch:\n",
        encoding="utf-8",
    )


def _find_block(lines: list[str], key: str) -> tuple[int, int] | None:
    """Find a YAML mapping block starting at a line like '  key:'

    Returns (start_index, end_index_exclusive) including the header line.
    Block ends when a non-empty line appears with indentation <= header indent.
    """
    pat = re.compile(rf"^(\s*){re.escape(key)}\s*:\s*$")
    for i, line in enumerate(lines):
        m = pat.match(line)
        if not m:
            continue
        indent = len(m.group(1))
        j = i + 1
        while j < len(lines):
            l = lines[j]
            if l.strip() == "":
                j += 1
                continue
            cur_indent = len(l) - len(l.lstrip(" "))
            if cur_indent <= indent:
                break
            j += 1
        return i, j
    return None


def _ensure_patch_root(lines: list[str]) -> list[str]:
    # Ensure there's a top-level 'patch:'
    if any(re.match(r"^patch:\s*$", l) for l in lines):
        return lines
    # Insert at top (after optional comments/shebang)
    insert_at = 0
    while insert_at < len(lines) and lines[insert_at].lstrip().startswith("#"):
        insert_at += 1
    if insert_at < len(lines) and lines[insert_at].strip() == "":
        insert_at += 1
    lines.insert(insert_at, "patch:\n")
    return lines


def punct_set(schema: str, key: str, half: str | None, full: str | None, userdir: Path) -> None:
    custom = userdir / f"{schema}.custom.yaml"
    ensure_custom_yaml(custom)

    text = custom.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)
    lines = _ensure_patch_root(lines)

    # Ensure blocks exist under patch: with two-space indent.
    # We'll store them as '  punctuator/half_shape:' etc.
    for block_key in ("punctuator/half_shape", "punctuator/full_shape"):
        if not _find_block(lines, f"  {block_key}"):
            # Insert right after 'patch:' line, or at end.
            for i, l in enumerate(lines):
                if re.match(r"^patch:\s*$", l):
                    insert_at = i + 1
                    lines.insert(insert_at, f"  {block_key}:\n")
                    break
            else:
                lines.append(f"  {block_key}:\n")

    def upsert(block_key: str, value: str | None) -> None:
        if value is None:
            return
        blk = _find_block(lines, f"  {block_key}")
        assert blk, f"missing block {block_key}"
        start, end = blk
        # Remove existing key line in the block
        k_escaped = key.replace('\\', '\\\\').replace('"', '\\"')
        key_pat = re.compile(rf"^\s{{4}}\"{re.escape(k_escaped)}\"\s*:\s*")
        new_block = []
        removed = False
        for l in lines[start + 1 : end]:
            if key_pat.match(l):
                removed = True
                continue
            new_block.append(l)
        # Important: Rime punctuator mappings expect either a plain string or a list.
        # Using {commit: ...} can cause merge failures (incompatible node type).
        mapping_line = f"    \"{k_escaped}\": \"{value.replace('\\', '\\\\').replace('"', '\\"')}\"\n"
        # Insert near top of block (after header)
        new_block.insert(0, mapping_line)
        lines[start + 1 : end] = new_block

    upsert("punctuator/half_shape", half)
    upsert("punctuator/full_shape", full)

    # Write back with backup
    backup_file(custom)
    custom.write_text("".join(lines), encoding="utf-8")


def punct_unset(schema: str, key: str, userdir: Path) -> None:
    custom = userdir / f"{schema}.custom.yaml"
    if not custom.exists():
        return
    text = custom.read_text(encoding="utf-8")
    lines = text.splitlines(keepends=True)

    def remove_key(block_key: str) -> None:
        blk = _find_block(lines, f"  {block_key}")
        if not blk:
            return
        start, end = blk
        k_escaped = key.replace('\\', '\\\\').replace('"', '\\"')
        key_pat = re.compile(rf"^\s{{4}}\"{re.escape(k_escaped)}\"\s*:\s*")
        new_block = [l for l in lines[start + 1 : end] if not key_pat.match(l)]
        lines[start + 1 : end] = new_block

    remove_key("punctuator/half_shape")
    remove_key("punctuator/full_shape")

    backup_file(custom)
    custom.write_text("".join(lines), encoding="utf-8")


def _dict_path(dict_name: str, userdir: Path) -> Path:
    mapping = {
        "user": userdir / "flypy_user.txt",
        "top": userdir / "flypy_top.txt",
        "sys": userdir / "flypy_sys.txt",
    }
    if dict_name not in mapping:
        raise SystemExit(f"Unknown dict: {dict_name} (use user|top|sys)")
    return mapping[dict_name]


def phrase_add(text: str, code: str, weight: int | None, dict_name: str, userdir: Path) -> None:
    if not code or len(code) > 4:
        raise SystemExit("flypy code must be 1-4 chars")
    if "\t" in text or "\t" in code:
        raise SystemExit("text/code cannot contain TAB")

    p = _dict_path(dict_name, userdir)
    if not p.exists():
        # create empty file
        p.write_text("", encoding="utf-8")

    raw = p.read_text(encoding="utf-8", errors="replace")
    lines = [l for l in raw.splitlines()]

    # Avoid duplicates of the exact (text, code)
    for l in lines:
        parts = l.split("\t")
        if len(parts) >= 2 and parts[0] == text and parts[1] == code:
            return

    entry = f"{text}\t{code}" + (f"\t{weight}" if weight is not None else "")
    backup_file(p)

    # Ensure file ends with newline
    with p.open("a", encoding="utf-8") as f:
        if raw and not raw.endswith("\n"):
            f.write("\n")
        f.write(entry + "\n")


def deploy(userdir: Path) -> None:
    deployer = Path("/Library/Input Methods/Squirrel.app/Contents/MacOS/rime_deployer")
    shared = Path("/Library/Input Methods/Squirrel.app/Contents/SharedSupport")
    staging = userdir / "build"
    if not deployer.exists():
        raise SystemExit(f"rime_deployer not found: {deployer}")
    cmd = [str(deployer), "--build", str(userdir), str(shared), str(staging)]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    # rime_deployer prints to stderr sometimes
    out = (proc.stdout or "") + (proc.stderr or "")
    print(out.strip())
    if proc.returncode != 0:
        raise SystemExit(proc.returncode)


def main(argv: list[str]) -> int:
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)

    ap_set = sub.add_parser("punct-set", help="Set punctuator mapping in <schema>.custom.yaml")
    ap_set.add_argument("--schema", required=True, help="schema id, e.g. flypy")
    ap_set.add_argument("--key", required=True, help="punct key, e.g. / or [")
    ap_set.add_argument("--half", help="half_shape commit")
    ap_set.add_argument("--full", help="full_shape commit")

    ap_unset = sub.add_parser("punct-unset", help="Remove punctuator mapping override")
    ap_unset.add_argument("--schema", required=True)
    ap_unset.add_argument("--key", required=True)

    ap_phrase = sub.add_parser("phrase-add", help="Append a custom phrase into flypy_*.txt")
    ap_phrase.add_argument("--dict", default="user", choices=["user", "top", "sys"], help="target dict (default: user)")
    ap_phrase.add_argument("--text", required=True, help="phrase text")
    ap_phrase.add_argument("--code", required=True, help="flypy code (1-4 chars)")
    ap_phrase.add_argument("--weight", type=int, default=None, help="optional weight")

    sub.add_parser("deploy", help="Run rime_deployer --build")

    args = ap.parse_args(argv)
    userdir = rime_user_dir()

    if args.cmd == "punct-set":
        punct_set(args.schema, args.key, args.half, args.full, userdir)
        return 0
    if args.cmd == "punct-unset":
        punct_unset(args.schema, args.key, userdir)
        return 0
    if args.cmd == "phrase-add":
        phrase_add(args.text, args.code, args.weight, args.dict, userdir)
        return 0
    if args.cmd == "deploy":
        deploy(userdir)
        return 0
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))

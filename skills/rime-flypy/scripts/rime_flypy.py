#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import argparse
import shutil
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Tuple

RIME_DIR = Path("/Users/maimai/Library/Rime")

DEPLOYER = Path("/Library/Input Methods/Squirrel.app/Contents/MacOS/rime_deployer")
SHARED_DIR = Path("/Library/Input Methods/Squirrel.app/Contents/SharedSupport")
STAGING_DIR = RIME_DIR / "build"


@dataclass
class Entry:
    text: str
    code: str
    weight: Optional[str] = None


def _dict_path(which: str) -> Path:
    which = which.lower()
    if which in ("user", "flypy_user", "flypy_user.txt"):
        return RIME_DIR / "flypy_user.txt"
    if which in ("top", "flypy_top", "flypy_top.txt"):
        return RIME_DIR / "flypy_top.txt"
    if which in ("sys", "flypy_sys", "flypy_sys.txt"):
        return RIME_DIR / "flypy_sys.txt"
    raise SystemExit(f"Unknown dict: {which}")


def _backup(path: Path) -> Path:
    backup_dir = path.parent / ".backup"
    backup_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    dst = backup_dir / f"{path.name}.{ts}.bak"
    shutil.copy2(path, dst)
    return dst


def _validate_code(code: str) -> None:
    # 小鹤音形：编码长度最多 4
    if len(code) > 4:
        raise SystemExit(f"Code too long (max 4 for 小鹤音形): {code!r}")


def _read_lines(path: Path) -> List[str]:
    return path.read_text(encoding="utf-8").splitlines()


def _write_lines(path: Path, lines: List[str]) -> None:
    # keep LF; Rime txt is utf-8
    content = "\n".join(lines) + "\n"
    path.write_text(content, encoding="utf-8")


def _parse_entry(line: str) -> Optional[Entry]:
    if not line or line.startswith("#"):
        return None
    parts = line.split("\t")
    if len(parts) == 2:
        t, c = parts
        return Entry(t, c, None)
    if len(parts) == 3:
        t, c, w = parts
        return Entry(t, c, w)
    return None


def _match_indices(lines: List[str], text: Optional[str], code: Optional[str]) -> List[int]:
    idxs: List[int] = []
    for i, line in enumerate(lines):
        e = _parse_entry(line)
        if not e:
            continue
        if text is not None and e.text != text:
            continue
        if code is not None and e.code != code:
            continue
        idxs.append(i)
    return idxs


def cmd_find(dict_name: str, query: Optional[str], code: Optional[str]) -> int:
    path = _dict_path(dict_name)
    lines = _read_lines(path)

    hits: List[str] = []
    for line in lines:
        e = _parse_entry(line)
        if not e:
            continue
        if query and query not in e.text:
            continue
        if code and e.code != code:
            continue
        hits.append(line)

    if not hits:
        print("(no matches)")
        return 1

    for h in hits[:200]:
        print(h)
    if len(hits) > 200:
        print(f"... ({len(hits)-200} more)")
    return 0


def cmd_add(dict_name: str, text: str, code: str, weight: str) -> None:
    _validate_code(code)
    path = _dict_path(dict_name)
    lines = _read_lines(path)

    idxs = _match_indices(lines, text=text, code=code)
    _backup(path)

    if idxs:
        # already exists: update weight (or append weight)
        i = idxs[0]
        lines[i] = f"{text}\t{code}\t{weight}"
    else:
        # keep file comments; append at end
        lines.append(f"{text}\t{code}\t{weight}")

    _write_lines(path, lines)


def cmd_set(dict_name: str, text: str, code: Optional[str], new_code: Optional[str], weight: Optional[str]) -> None:
    if new_code is not None:
        _validate_code(new_code)

    path = _dict_path(dict_name)
    lines = _read_lines(path)

    idxs = _match_indices(lines, text=text, code=code)
    if not idxs:
        raise SystemExit(f"No entry found for text={text!r} code={code!r} in {path.name}")
    if len(idxs) > 1 and code is None:
        raise SystemExit(f"Multiple entries found for text={text!r}; please specify --code to disambiguate")

    _backup(path)

    i = idxs[0]
    e = _parse_entry(lines[i])
    assert e is not None

    if new_code is not None:
        e.code = new_code
    if weight is not None:
        e.weight = str(weight)
    if e.weight is None:
        e.weight = "0"

    lines[i] = f"{e.text}\t{e.code}\t{e.weight}"
    _write_lines(path, lines)


def cmd_delete(dict_name: str, text: str, code: Optional[str]) -> None:
    if code is not None:
        _validate_code(code)

    path = _dict_path(dict_name)
    lines = _read_lines(path)
    idxs = _match_indices(lines, text=text, code=code)
    if not idxs:
        raise SystemExit(f"No entry found for text={text!r} code={code!r} in {path.name}")
    if len(idxs) > 1 and code is None:
        raise SystemExit(f"Multiple entries found for text={text!r}; please specify --code to delete one")

    _backup(path)

    for i in sorted(idxs, reverse=True):
        lines.pop(i)
    _write_lines(path, lines)


def cmd_sanitize(dict_name: str, dry_run: bool = False) -> None:
    path = _dict_path(dict_name)
    lines = _read_lines(path)

    out: List[str] = []
    fixed = 0
    removed = 0

    for line in lines:
        e = _parse_entry(line)
        if e is None:
            # keep comments/blank lines as-is
            if line.startswith("#") or line.strip() == "":
                out.append(line)
            else:
                # unknown format line: remove
                removed += 1
            continue

        if e.text == "" or e.code == "":
            removed += 1
            continue
        if len(e.code) > 4:
            removed += 1
            continue

        if e.weight is None or e.weight == "":
            e.weight = "0"
            fixed += 1
        elif not e.weight.isdigit():
            # normalize non-numeric to 0
            e.weight = "0"
            fixed += 1

        out.append(f"{e.text}\t{e.code}\t{e.weight}")

    print(f"sanitize({path.name}): fixed={fixed}, removed={removed}")

    if dry_run:
        return

    _backup(path)
    _write_lines(path, out)


def cmd_deploy() -> None:
    if not DEPLOYER.exists():
        raise SystemExit(f"rime_deployer not found: {DEPLOYER}")
    # Build and deploy data for Squirrel
    # user_data_dir: RIME_DIR
    # shared_data_dir: SHARED_DIR
    # staging_dir: STAGING_DIR
    import subprocess

    subprocess.run(
        [str(DEPLOYER), "--build", str(RIME_DIR), str(SHARED_DIR), str(STAGING_DIR)],
        check=True,
    )


def main() -> None:
    ap = argparse.ArgumentParser(description="Manage Rime/Squirrel flypy txt dictionaries (小鹤音形)")
    sub = ap.add_subparsers(dest="cmd", required=True)

    sp = sub.add_parser("find")
    sp.add_argument("--dict", default="user", help="user|top|sys")
    sp.add_argument("--query")
    sp.add_argument("--code")

    sp = sub.add_parser("add")
    sp.add_argument("--dict", default="user", help="user|top|sys")
    sp.add_argument("--text", required=True)
    sp.add_argument("--code", required=True)
    sp.add_argument("--weight", default="0")

    sp = sub.add_parser("set")
    sp.add_argument("--dict", default="user", help="user|top|sys")
    sp.add_argument("--text", required=True)
    sp.add_argument("--code", help="existing code to disambiguate")
    sp.add_argument("--new-code")
    sp.add_argument("--weight")

    sp = sub.add_parser("delete")
    sp.add_argument("--dict", default="user", help="user|top|sys")
    sp.add_argument("--text", required=True)
    sp.add_argument("--code", help="code to disambiguate")

    sp = sub.add_parser("sanitize")
    sp.add_argument("--dict", default="user", help="user|top|sys")
    sp.add_argument("--dry-run", action="store_true")

    sub.add_parser("deploy")

    args = ap.parse_args()

    if args.cmd == "find":
        raise SystemExit(cmd_find(args.dict, query=args.query, code=args.code))
    if args.cmd == "add":
        cmd_add(args.dict, text=args.text, code=args.code, weight=str(args.weight))
        return
    if args.cmd == "set":
        cmd_set(args.dict, text=args.text, code=args.code, new_code=args.new_code, weight=args.weight)
        return
    if args.cmd == "delete":
        cmd_delete(args.dict, text=args.text, code=args.code)
        return
    if args.cmd == "sanitize":
        cmd_sanitize(args.dict, dry_run=bool(args.dry_run))
        return
    if args.cmd == "deploy":
        cmd_deploy()
        return


if __name__ == "__main__":
    main()

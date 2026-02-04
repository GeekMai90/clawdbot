#!/usr/bin/env python3
"""Generate last month's bookkeeping report.

Outputs JSON to stdout:
{
  "month": "YYYY-MM",
  "telegramText": "...",
  "reportPath": "/path/to/Obsidian/.../YYYY-MM-月报.md"
}

Data sources:
- Obsidian: GeekMaiOB/记账/YYYY-MM.md
- Stats: node /Users/geekmai/clawd/skills/bookkeeping/scripts/bookkeeping.js stats YYYY-MM

The goal is deterministic + cron-friendly.
"""

from __future__ import annotations

import json
import re
import subprocess
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

VAULT = Path(
    "/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB"
)
BOOKKEEPING_DIR = VAULT / "记账"
REPORT_DIR = BOOKKEEPING_DIR / "月报"
BOOKKEEPING_CLI_DIR = Path("/Users/geekmai/clawd/skills/bookkeeping")
BOOKKEEPING_JS = BOOKKEEPING_CLI_DIR / "scripts" / "bookkeeping.js"


@dataclass
class Stats:
    income: float
    income_count: int
    expense: float
    expense_count: int
    balance: float
    categories: list[tuple[str, float, float]]  # (name, amount, percent)


def last_month(now: datetime) -> str:
    y, m = now.year, now.month
    if m == 1:
        return f"{y-1}-12"
    return f"{y:04d}-{m-1:02d}"


def run_stats(month: str) -> str:
    cmd = ["node", str(BOOKKEEPING_JS), "stats", month]
    r = subprocess.run(
        cmd,
        cwd=str(BOOKKEEPING_CLI_DIR),
        capture_output=True,
        text=True,
        check=True,
    )
    return r.stdout


def parse_stats(text: str) -> Stats:
    # Examples:
    # 💰 总收入: 0.00 元 (0 笔)
    # 💸 总支出: 148.00 元 (3 笔)
    # 💵 结余: -148.00 元
    #    数码: 85.00 元 (57.4%)

    def fnum(s: str) -> float:
        return float(s.replace(",", ""))

    income_m = re.search(r"总收入:\s*([\-\d\.]+)\s*元\s*\((\d+)\s*笔\)", text)
    expense_m = re.search(r"总支出:\s*([\-\d\.]+)\s*元\s*\((\d+)\s*笔\)", text)
    balance_m = re.search(r"结余:\s*([\-\d\.]+)\s*元", text)

    income = fnum(income_m.group(1)) if income_m else 0.0
    income_count = int(income_m.group(2)) if income_m else 0
    expense = fnum(expense_m.group(1)) if expense_m else 0.0
    expense_count = int(expense_m.group(2)) if expense_m else 0
    balance = fnum(balance_m.group(1)) if balance_m else income - expense

    categories: list[tuple[str, float, float]] = []
    for line in text.splitlines():
        m = re.match(r"^\s*([^:：\s]+)[:：]\s*([\-\d\.]+)\s*元\s*\((\d+(?:\.\d+)?)%\)", line.strip())
        if m:
            categories.append((m.group(1), fnum(m.group(2)), float(m.group(3))))

    categories.sort(key=lambda x: x[1], reverse=True)
    return Stats(
        income=income,
        income_count=income_count,
        expense=expense,
        expense_count=expense_count,
        balance=balance,
        categories=categories,
    )


def read_entries(month: str) -> list[str]:
    path = BOOKKEEPING_DIR / f"{month}.md"
    if not path.exists():
        return []
    lines = path.read_text(encoding="utf-8", errors="replace").splitlines()
    entries = [ln for ln in lines if ln.strip().startswith("-")]
    return entries


def format_money(x: float) -> str:
    return f"{x:.2f}"


def build_telegram(month: str, stats: Stats) -> str:
    top = stats.categories[:3]
    top_str = "、".join([f"{n}{format_money(a)}" for n, a, _ in top]) or "无"

    # Tiny, practical reflection
    reflection = "这个月支出不算多，保持住就很稳。" if stats.expense <= 500 else "这个月支出有点上头，咱们下个月稍微收一收就赢了。"

    # optional single emoji (keep subtle)
    emoji = "✨" if stats.balance >= 0 else "🧾"

    return (
        f"【{month} 记账月报】{emoji}\n"
        f"收入 {format_money(stats.income)} 元（{stats.income_count} 笔），支出 {format_money(stats.expense)} 元（{stats.expense_count} 笔），结余 {format_money(stats.balance)} 元。\n"
        f"支出主要花在：{top_str}。\n"
        f"{reflection}"
    )


def build_markdown(month: str, stats: Stats, entries: list[str], stats_raw: str) -> str:
    top = stats.categories[:10]
    cat_lines = "\n".join([f"- {n}: {format_money(a)} 元（{p:.1f}%）" for n, a, p in top]) or "- 无"

    reflection_lines = []
    if stats.expense_count == 0:
        reflection_lines.append("这个月几乎没花钱，厉害。也别太委屈自己，适当奖励一下也可以。")
    else:
        if top:
            reflection_lines.append(f"最大头的支出是「{top[0][0]}」，下个月如果想优化，就从这一项下手最有效。")
        reflection_lines.append("建议：把高频小额（餐饮/零食/咖啡）稍微盯一下，最容易悄悄累积。")

    reflection = "\n".join([f"- {x}" for x in reflection_lines])

    entries_block = "\n".join(entries) if entries else "（本月账单文件中未找到明细条目）"

    return f"""# {month} 记账月报

## 1. 收支概况
- 总收入：{format_money(stats.income)} 元（{stats.income_count} 笔）
- 总支出：{format_money(stats.expense)} 元（{stats.expense_count} 笔）
- 结余：{format_money(stats.balance)} 元

## 2. 支出分类明细（Top）
{cat_lines}

## 3. 详细记录（来自 {month}.md）
{entries_block}

## 4. 小复盘（偏心但不说教）
{reflection}

---
## 附：stats 原始输出
```text
{stats_raw.strip()}
```
"""


def write_report(month: str, md: str) -> Path:
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    path = REPORT_DIR / f"{month}-月报.md"
    path.write_text(md, encoding="utf-8")
    return path


def main() -> int:
    now = datetime.now()
    month = last_month(now)

    stats_raw = run_stats(month)
    stats = parse_stats(stats_raw)
    entries = read_entries(month)

    telegram = build_telegram(month, stats)
    md = build_markdown(month, stats, entries, stats_raw)
    report_path = write_report(month, md)

    out = {"month": month, "telegramText": telegram, "reportPath": str(report_path)}
    print(json.dumps(out, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

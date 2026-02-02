---
name: bookkeeping-monthly-report
description: "Generate the monthly bookkeeping report for 麦先生 (data-first with a bit of reflection), then send a text version via Telegram and save a full Markdown version into Obsidian. Use when the monthly bookkeeping cron fires (1st day 09:00), or when the user asks for last month’s bookkeeping summary/report. Reads GeekMaiOB/记账/YYYY-MM.md and uses bookkeeping stats output."
---

# Bookkeeping Monthly Report

## What to produce

1) **Telegram text report** (one message, concise but clear):
- Month
- Total income / total expense / balance
- Top spending categories (up to 3)
- 1–2 short reflection/suggestion lines (practical, not preachy)

2) **Obsidian Markdown report** (more detailed):
- Overview (income/expense/balance)
- Category breakdown
- Full entries list (from the month file)
- Short reflection section

## Data sources (this machine)

- Obsidian vault:
  - `/Users/maimai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB`
- Monthly ledger:
  - `记账/YYYY-MM.md`
- Generate stats via bookkeeping skill:
  ```bash
  cd /Users/maimai/clawd/skills/bookkeeping
  node scripts/bookkeeping.js stats YYYY-MM
  ```

## Preferred execution

Use the bundled script to generate BOTH telegram text + obsidian report:

```bash
python3 skills/bookkeeping-monthly-report/scripts/monthly_report.py
```

It outputs a JSON object with:
- `month`
- `telegramText`
- `reportPath`

Then:
- Send `telegramText` to 麦先生 (Telegram)
- Confirm the Obsidian path saved

## Output location (Obsidian)

Write to:
- `GeekMaiOB/记账/月报/YYYY-MM-月报.md`

Create folder if missing.

## Tone

- Data should be clear.
- Reflection should be warm and “灵瑶偏心一点”，但不油、不说教。
- Emoji: optional, max 1 in Telegram message.

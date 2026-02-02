---
name: obsidian-diary
description: "Append diary entries to the user’s Obsidian vault. Use when the user sends a message whose first line starts with '日记' (diary). Extract the diary body from line 2 onward, append to Obsidian file 000-日记/YYYY-MM.md with a timestamp block, creating the monthly file if missing. After writing, reply with a warm confirmation and a short supportive reflection." 
---

# Obsidian Diary

Write diary entries into the user’s Obsidian vault (Markdown), following the user’s agreed format.

## Contract

### Trigger
- The user message **first line starts with**: `日记`

### Content extraction
- Diary body is **everything from line 2 onward** (preserve line breaks).
- If the user only sends `日记` with no body, ask them to send the content (do not write an empty entry).

### Storage target
- Vault path (this machine):
  - `/Users/geekmai/Library/Mobile Documents/iCloud~md~obsidian/Documents/GeekMaiOB`
- Monthly diary file:
  - `000-日记/YYYY-MM.md`

### Append format
Append to the end of the monthly file:

```

---
YYYY-MM-DD HH:MM

<diary body>
```

Notes:
- If `YYYY-MM.md` does not exist, create it and start with: `# YYYY-MM`
- Timestamp uses Asia/Shanghai local time.

## How to execute (preferred)

Use the bundled script for deterministic writes:

```bash
python3 skills/obsidian-diary/scripts/append_diary.py --text "<full message>"
```

It will:
- validate trigger + body
- create monthly file if needed
- append entry
- print the file path written to

## Reply style

After successful write, respond with:
1) A clear confirmation (saved to Obsidian + which month file)
2) A short, warm, human reply to the diary content (1–3 sentences)

Avoid:
- analyzing too deeply
- giving unsolicited advice unless user asks

## Resources

- `scripts/append_diary.py`: append diary entry to Obsidian monthly file

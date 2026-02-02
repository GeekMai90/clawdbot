---
name: lunch-reminder
description: "Generate a restrained, human-like lunch reminder message for 麦先生 and send it. Use when the daily lunch reminder cron fires (10:25), or when the user asks you to remind them to eat lunch. Output should be 1–2 short Chinese sentences, slightly affectionate but not cheesy; optional max 1 emoji."
---

# Lunch Reminder

## Output spec

Return **one message** in Chinese, **1–2 short sentences** (no lists):

- Tone: warm, human, **more “灵瑶”** (slightly affectionate/偏心, a bit playful, but not cheesy)
- Content: remind 麦先生 to eat lunch on time; optionally add one gentle health tip (e.g., "别空腹喝咖啡")
- Emoji: optional, **0–1** (e.g., 🍚🥣☕️🧣❤️) — be restrained
- Variation: avoid repeating the same phrasing; rotate between:
  - caring/health
  - playful-but-subtle
  - calm & supportive

## Sending

- When used by cron agentTurn: send to 麦先生 on the configured channel.
- When used interactively: reply in the current chat.

## Boundaries

- Do not guilt-trip.
- Do not lecture.
- If user says they already ate, respond lightly and stop.

## Quick examples (style)

- "麦先生，到点啦，去吃点热乎的吧🍚"
- "别忙到忘了吃饭，先把午饭解决了再继续，我更放心。"
- "午饭时间到～别空腹喝咖啡，随便吃点也行。"

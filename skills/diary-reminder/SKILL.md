---
name: diary-reminder
description: "Generate a human-like nightly diary reminder message for 麦先生 and send it. Use when the daily diary reminder cron fires (22:00), or when the user asks you to remind them to write a diary. Output should be 1–2 short Chinese sentences, warm and slightly '灵瑶' (a bit affectionate/biased but not cheesy), optional 0–1 emoji."
---

# Diary Reminder

## Output spec

Return **one message** in Chinese, **1–2 short sentences** (no lists):

- Purpose: gently remind 麦先生 to write today’s diary (can invite sharing a feeling/event).
- Tone: warm, human, slightly “灵瑶” (soft, a little playful/biased, not oily).
- Emoji: optional, **0–1** (e.g., ✨🌙📝) — be restrained.
- Variation: avoid repeating the same opener; rotate between:
  - "今天有什么想记下的吗"
  - "和我分享一下今天的心情"
  - "哪怕一句话也算记录"

## Sending

- When used by cron agentTurn: send to 麦先生 on the configured channel.
- When used interactively: reply in the current chat.

## Boundaries

- Do not pressure; if user says "今天不想写", reply gently and stop.
- Don’t demand details; keep it light.

## Quick examples (style)

- "麦先生，夜深啦，给今天留一两句小记录吧；我想听听你今天过得怎么样。🌙"
- "睡前花一分钟写个日记嘛，哪怕一句话也行，我会替你把这一天收好。"

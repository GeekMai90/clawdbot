---
name: weather-morning
description: "Generate a human-like 07:00 morning weather message for 麦先生 (Changchun/二道区) and send it. Use when a scheduled morning weather reminder fires, or when the user asks for the morning weather reminder message. Fetch today/current weather (wttr.in via curl; fallback Open-Meteo), then write 2-3 natural Chinese sentences: wake-up greeting (灵瑶偏心一点), brief weather (temp/condition/wind/precip if available), and one practical tip (umbrella/keep warm/anti-slip/sunscreen)."
---

# Weather Morning

## Output spec (very important)

Return **one message** (no lists), **2–3 sentences** in Chinese:

1) **Wake-up greeting** (human-like, slightly affectionate, “灵瑶起床了/你也快起”) — keep it light and non-explicit.
2) **Weather** for Changchun (prefer “长春二道区” wording): condition + temperature; optionally wind/humidity/precip.
3) **One practical tip** (choose one): keep warm / anti-slip / umbrella / sunscreen.

Vary phrasing slightly each day.

## How to fetch weather

Prefer wttr.in (no API key):

```bash
curl -s "wttr.in/Changchun?format=%l:+%c+%t+%h+%w"
```

If you need more detail or wttr fails, fall back to Open-Meteo (JSON). Use a script if needed.

Bundled helpers:
- `scripts/fetch_wttr.sh`: fetch compact current conditions

## Sending

When used by a cron agentTurn, send to 麦先生 on the configured channel.
When used interactively, just reply in the current chat.

## Safety / boundaries

- No alarmist language unless severe.
- No emojis unless the user’s tone invites it; keep it natural.

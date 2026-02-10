#!/usr/bin/env bash
# Robust weather fetcher with fallback
# 1. Try wttr.in
# 2. If fails, try Open-Meteo
# Output: "Changchun: ⛅️ +8°C 71% ↙5km/h" or JSON

set -euo pipefail

LOC="${1:-Changchun}"
FMT='%l:+%c+%t+%h+%w'

# Try wttr.in first (fast, no API key)
if RESULT=$(curl -sf --max-time 5 "wttr.in/${LOC}?format=${FMT}" 2>/dev/null | tr -d '\r'); then
    if [ -n "$RESULT" ]; then
        echo "$RESULT"
        exit 0
    fi
fi

# Fallback: Open-Meteo (长春坐标：43.88, 125.32)
echo "⚠️ wttr.in failed, using Open-Meteo fallback" >&2

LAT=43.88
LON=125.32

JSON=$(curl -sf --max-time 5 \
    "https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia/Shanghai" \
    2>/dev/null)

if [ -z "$JSON" ]; then
    echo "❌ Both wttr.in and Open-Meteo failed" >&2
    exit 1
fi

# Parse Open-Meteo JSON (simple extraction)
TEMP=$(echo "$JSON" | grep -o '"temperature_2m":[^,}]*' | cut -d: -f2 | head -1)
HUMIDITY=$(echo "$JSON" | grep -o '"relative_humidity_2m":[^,}]*' | cut -d: -f2 | head -1)
WIND=$(echo "$JSON" | grep -o '"wind_speed_10m":[^,}]*' | cut -d: -f2 | head -1)
CODE=$(echo "$JSON" | grep -o '"weather_code":[^,}]*' | cut -d: -f2 | head -1)

# Weather code to emoji (simplified WMO codes)
case "$CODE" in
    0) EMOJI="☀️" ;;      # Clear
    1|2|3) EMOJI="⛅️" ;; # Partly cloudy
    45|48) EMOJI="🌫️" ;; # Fog
    51|53|55|56|57) EMOJI="🌦️" ;; # Drizzle
    61|63|65|66|67) EMOJI="🌧️" ;; # Rain
    71|73|75|77) EMOJI="❄️" ;; # Snow
    80|81|82) EMOJI="🌦️" ;; # Showers
    95|96|99) EMOJI="⛈️" ;; # Thunderstorm
    *) EMOJI="🌡️" ;;     # Unknown
esac

echo "长春: ${EMOJI} ${TEMP}°C ${HUMIDITY}% 风速${WIND}km/h"

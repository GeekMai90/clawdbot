#!/usr/bin/env bash
set -euo pipefail

# Fetch compact current weather for Changchun via wttr.in (no API key).
# Output example: "Changchun: ⛅️ +8°C 71% ↙5km/h"

LOC="${1:-Changchun}"
FMT='%l:+%c+%t+%h+%w'

curl -s "wttr.in/${LOC}?format=${FMT}" | tr -d '\r'

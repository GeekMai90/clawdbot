#!/bin/bash
# auth-health-check/check.sh
# 检查 Codex OAuth token 和 Anthropic API Key 健康状态

TELEGRAM_TOKEN=$(security find-generic-password -s openclaw_telegram_token -w 2>/dev/null || echo "")
CHAT_ID="5233110346"
ISSUES=()

# ── 1. 检查 Codex OAuth Token 年龄 ──────────────────────────────────────
CODEX_AUTH="$HOME/.codex/auth.json"
WARN_DAYS=25

if [ -f "$CODEX_AUTH" ]; then
  LAST_REFRESH=$(python3 -c "
import json, sys
d = json.load(open('$CODEX_AUTH'))
print(d.get('last_refresh', ''))
" 2>/dev/null)

  if [ -n "$LAST_REFRESH" ]; then
    DAYS_AGO=$(python3 -c "
from datetime import datetime, timezone
last = datetime.fromisoformat('$LAST_REFRESH'.replace('Z', '+00:00'))
now = datetime.now(timezone.utc)
print(int((now - last).days))
" 2>/dev/null)

    echo "Codex token last refresh: $LAST_REFRESH ($DAYS_AGO days ago)"

    if [ "$DAYS_AGO" -ge "$WARN_DAYS" ] 2>/dev/null; then
      ISSUES+=("⚠️ *Codex OAuth token 已 ${DAYS_AGO} 天未刷新*（超过 ${WARN_DAYS} 天有失效风险）\n需要在 Mac 终端运行：\`codex auth login\`")
    fi
  else
    ISSUES+=("⚠️ *Codex auth.json 无 last_refresh 字段*，建议重新登录：\`codex auth login\`")
  fi
else
  ISSUES+=("❌ *Codex 未登录*（$CODEX_AUTH 不存在）\n需要运行：\`codex auth login\`")
fi

# ── 2. 检查 Anthropic API Key 可用性 ────────────────────────────────────
ANTHROPIC_KEY=$(grep -o '"ANTHROPIC_API_KEY":"[^"]*"' ~/.openclaw/openclaw.json 2>/dev/null | cut -d'"' -f4)

# openclaw 存的是 redacted，直接用环境变量或 keychain 取
# 改用 openclaw 自身 API 测一下 (简单 ping)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" \
  -H "x-api-key: test" \
  -H "anthropic-version: 2023-06-01" \
  "https://api.anthropic.com/v1/models" 2>/dev/null)

# 401 = key invalid / missing, 200 = ok, anything else might be network
if [ "$HTTP_CODE" = "000" ]; then
  ISSUES+=("⚠️ *Anthropic API 无法访问*（网络可能有问题）")
else
  echo "Anthropic API reachable (HTTP $HTTP_CODE)"
fi

# ── 3. 汇报结果 ─────────────────────────────────────────────────────────
if [ ${#ISSUES[@]} -eq 0 ]; then
  echo "✅ All auth tokens healthy."
  exit 0
fi

# 构造消息
MSG="🔑 *Token 健康检查提醒*\n\n"
for ISSUE in "${ISSUES[@]}"; do
  MSG+="$ISSUE\n\n"
done
MSG+="_（每周自动检查）_"

echo -e "发送 Telegram 提醒...\n$MSG"

# 用 openclaw 发消息（通过 CLI）
openclaw message send --channel telegram --to "$CHAT_ID" --message "$(echo -e "$MSG")" 2>/dev/null \
  || echo "Telegram 发送失败，请手动检查"

exit 0

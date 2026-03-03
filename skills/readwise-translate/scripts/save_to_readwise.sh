#!/bin/bash
# 将翻译后的 HTML 内容保存到 Readwise Reader
# 用法: save_to_readwise.sh <url> <title> <html_file>
# html_file 中存放已翻译为简体中文的 HTML 内容

URL="$1"
TITLE="$2"
HTML_FILE="$3"

TOKEN=$(security find-generic-password -s readwise_token -w 2>/dev/null)
if [ -z "$TOKEN" ]; then
  echo "ERROR: readwise_token 未找到，请先存入 Keychain" >&2
  exit 1
fi

HTML_CONTENT=$(cat "$HTML_FILE")

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "https://readwise.io/api/v3/save/" \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$(jq -n \
    --arg url "$URL" \
    --arg title "$TITLE" \
    --arg html "$HTML_CONTENT" \
    '{url: $url, title: $title, html: $html, should_clean_html: true, tags: ["译文","灵瑶翻译"], location: "new"}'
  )")

HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
  READ_URL=$(echo "$BODY" | jq -r '.url // empty')
  echo "OK:$READ_URL"
else
  echo "ERROR:$HTTP_CODE:$BODY" >&2
  exit 1
fi

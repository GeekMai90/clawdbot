#!/usr/bin/env bash
# OpenClaw CLI 音频转录包装器
# 调用 openai-whisper-api 的 transcribe.sh，并将转录内容输出到 stdout
set -euo pipefail

TRANSCRIBE="/opt/homebrew/lib/node_modules/openclaw/skills/openai-whisper-api/scripts/transcribe.sh"

# 将所有参数透传给 transcribe.sh，拿回输出的文件路径
OUT_FILE=$("$TRANSCRIBE" "$@")

# 读取文件内容并输出到 stdout（OpenClaw CLI 模式所需）
cat "$OUT_FILE"

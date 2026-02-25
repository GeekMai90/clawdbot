#!/bin/bash
# 将 30 天前的 daily logs 移到 _archive/
# 只处理 memory/YYYY-MM-DD*.md 格式的文件

MEMORY_DIR="/Users/geekmai/clawd/memory"
ARCHIVE_DIR="$MEMORY_DIR/_archive"
CUTOFF=$(date -v-30d '+%Y-%m-%d')
MOVED=0

mkdir -p "$ARCHIVE_DIR"

for f in "$MEMORY_DIR"/2026-*.md; do
  [ -f "$f" ] || continue
  fname=$(basename "$f" .md)
  # 取文件名前10字符作为日期前缀
  filedate="${fname:0:10}"
  if [[ "$filedate" < "$CUTOFF" ]]; then
    mv "$f" "$ARCHIVE_DIR/"
    echo "归档：$fname"
    ((MOVED++))
  fi
done

if [ $MOVED -eq 0 ]; then
  echo "无需归档（所有日志均在 30 天内）"
else
  echo "共归档 $MOVED 个文件 → $ARCHIVE_DIR"
fi
